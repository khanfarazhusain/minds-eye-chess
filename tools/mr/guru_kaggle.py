# "Guru model": a big no-search policy net that looks at a board and names Stockfish's best move (Lichess eval DB, depth >= 20).
# It never runs during a game; it measures how far "no look-ahead" can go (top-1/2/3) and is later distilled into human rules.
# Kaggle (GPU T4, Internet on), one cell:
#   !curl -fsSL https://raw.githubusercontent.com/khanfarazhusain/minds-eye-chess/engine-lab/tools/mr/guru_kaggle.py -o g.py && python g.py
# Settings (before "python g.py"): GURU_SIZE s|m|l|xl (default l = 15 blocks x 192)   GURU_POS positions to pack (default 8 crore)
#   GURU_HOURS (default 11)   GURU_EPOCHS (default 3)   GURU_BS (default 1024)   GURU_LR (default 1e-3)
#   GURU_MAXCP drop positions with |eval| >= this (default 3000: mates/decided)   GURU_VW weight of the value-head aux loss (default 0.3)
#   GURU_SHARD=i/n  pack only shard i of n (every n-th 20k-line chunk) to guru_pos_<i>of<n>.bin.zst (+ guru_valid.txt for shard 0) and exit (CPU, Actions).
#   GURU_PACKED=url1,url2,.. GURU_VALIDURL=url  train from those packed shards instead of packing (saves the 2 h packing on the GPU).
#   GURU_SKIP=k  (with GURU_SHARD) skip the first k 20000-line chunks, so a second batch uses NEW positions; the packer prints 'chunks used'.
#   GURU_INIT=url-or-path to a guru_*.pt: continue training from those weights (use lr 3e-4 and a fresh GURU_SKIP batch).
# Extras: 15 attack/hanging/check input planes computed on the GPU, pseudo-legal move mask inside the loss (illegal moves never compete),
#   value-head aux loss, soft 2nd-best target when the top two moves are within 30 cp, final 1-ply 'veto' report. GURU_TEST=1 runs geometry self-tests.
# Output (Output tab): guru_<size>_<stamp>.pt (+ one per epoch), guru_log.txt with held-out top-1/2/3 and "good move" rate.
import os, sys, io, json, time, math, subprocess, urllib.request
from multiprocessing import Pool
T0 = time.time()
def pip(*p): subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', *p], check=False)
try: import zstandard
except ImportError: pip('zstandard'); import zstandard
try: import chess
except ImportError: pip('chess'); import chess
import numpy as np, torch, torch.nn as nn, torch.nn.functional as Fn
W = '/kaggle/working' if os.path.isdir('/kaggle/working') else os.path.abspath('guru_out'); D = os.environ.get('GURU_DIR', '/tmp/guru')
os.makedirs(W, exist_ok=True); os.makedirs(D, exist_ok=True)
LOG = open(os.path.join(W, 'guru_log.txt'), 'a')
def say(*x):
    m = ' '.join(str(v) for v in x); print(m, flush=True); LOG.write(m + '\n'); LOG.flush()
SIZES = {'s': (6, 64), 'm': (10, 128), 'l': (15, 192), 'xl': (20, 256)}
SIZE = os.environ.get('GURU_SIZE', 'l'); NB, CH = SIZES[SIZE]
NPOS = int(float(os.environ.get('GURU_POS', '8e7'))); HOURS = float(os.environ.get('GURU_HOURS', '11'))
EPOCHS = int(os.environ.get('GURU_EPOCHS', '3')); BS = int(os.environ.get('GURU_BS', '1024')); LR = float(os.environ.get('GURU_LR', '1e-3'))
MAXCP = int(os.environ.get('GURU_MAXCP', '3000')); VW = float(os.environ.get('GURU_VW', '0.3')); NIN = 33
VALN = 50000; REC = 74; SRC = os.environ.get('GURU_SRC', 'https://database.lichess.org/lichess_db_eval.jsonl.zst')
STAMP = time.strftime('%Y%m%d_%H%M', time.gmtime()); NAME = f'guru_{SIZE}_{STAMP}'

# ---- packing: one 72-byte record per position, always from the side to move's view (black positions are flipped) ----
# 0..63 board (0 empty, 1-6 my P N B R Q K, 7-12 theirs), 64 castling bits (my K, my Q, their K, their Q), 65 ep file+1,
# 66-67 best move (from*64+to), 68-69 second move, 70-71 cp gap best-second (65535 = none), 72-73 eval (mover's view, int16)
PC = {c: i + 1 for i, c in enumerate('PNBRQK')}
def sqi(s, flip): f, r = ord(s[0]) - 97, int(s[1]) - 1; return (7 - r if flip else r) * 8 + f
def mv(u, flip): return sqi(u[:2], flip) * 64 + sqi(u[2:4], flip)
def score(p): return p['cp'] if 'cp' in p else (100000 - abs(p['mate'])) * (1 if p['mate'] > 0 else -1)
def enc(line):
    try:
        j = json.loads(line); ev = max(j['evals'], key=lambda e: e['depth'])
        if ev['depth'] < 20 or not ev['pvs'] or not ev['pvs'][0].get('line'): return None
        fen = j['fen'].split(); flip = fen[1] == 'b'; b = bytearray(REC); r = 7
        for row in fen[0].split('/'):
            f = 0
            for c in row:
                if c.isdigit(): f += int(c); continue
                own = c.isupper() != flip; rr = 7 - r if flip else r
                b[rr * 8 + f] = PC[c.upper()] + (0 if own else 6); f += 1
            r -= 1
        cs = fen[2]; mk, mq, tk, tq = ('kq' if flip else 'KQ') + ('KQ' if flip else 'kq')
        b[64] = (mk in cs) | (mq in cs) << 1 | (tk in cs) << 2 | (tq in cs) << 3
        b[65] = 0 if fen[3] == '-' else ord(fen[3][0]) - 96
        def mv2(u):  # Lichess writes castling as king-takes-rook (e1h1): turn it into the king's real target (e1g1)
            m = mv(u, flip); f, t = m >> 6, m & 63
            if b[f] == 6 and b[t] == 4 and f >> 3 == t >> 3: m = f * 64 + (f & 56) + (6 if t > f else 2)
            return m
        p = ev['pvs']; sc = score(p[0])
        if abs(sc) >= MAXCP: return None
        b[72:74] = int(sc * (-1 if flip else 1)).to_bytes(2, 'little', signed=True); b[66:68] = mv2(p[0]['line'].split()[0]).to_bytes(2, 'little')
        if len(p) > 1 and p[1].get('line'):
            b[68:70] = mv2(p[1]['line'].split()[0]).to_bytes(2, 'little'); g = min(abs(score(p[0]) - score(p[1])), 65534)
        else: g = 65535
        b[70:72] = g.to_bytes(2, 'little'); return bytes(b), j['fen'] + ' 0 1'
    except Exception: return None
def enc_bp(line):  # "fen;score_stm;uci" from binpack_dump guru mode (move = Stockfish self-play search choice)
    try:
        fen_s, sc, mu = line.strip().split(';'); sc = int(sc); fen = fen_s.split(); flip = fen[1] == 'b'; b = bytearray(REC); r = 7
        for row in fen[0].split('/'):
            f = 0
            for c in row:
                if c.isdigit(): f += int(c); continue
                own = c.isupper() != flip; rr = 7 - r if flip else r
                b[rr * 8 + f] = PC[c.upper()] + (0 if own else 6); f += 1
            r -= 1
        cs = fen[2]; mk, mq, tk, tq = ('kq' if flip else 'KQ') + ('KQ' if flip else 'kq')
        b[64] = (mk in cs) | (mq in cs) << 1 | (tk in cs) << 2 | (tq in cs) << 3
        b[65] = 0 if fen[3] == '-' else ord(fen[3][0]) - 96
        m = mv(mu, flip); f, t = m >> 6, m & 63
        if b[f] == 6 and b[t] == 4 and f >> 3 == t >> 3: m = f * 64 + (f & 56) + (6 if t > f else 2)
        b[66:68] = m.to_bytes(2, 'little'); b[68:70] = (0).to_bytes(2, 'little'); b[70:72] = (65535).to_bytes(2, 'little')
        b[72:74] = int(sc).to_bytes(2, 'little', signed=True); return bytes(b), fen_s + ' 0 1'
    except Exception: return None
def enc_chunk(lines): return [x for x in map(enc_bp if os.environ.get('GURU_BINPACK') else enc, lines) if x]

def fetch_packed():
    out = os.path.join(D, 'pos.bin'); vf = os.path.join(D, 'valid.txt')
    if os.path.exists(out) and os.path.exists(vf): say('reuse', out); return out, vf
    urllib.request.urlretrieve(os.environ['GURU_VALIDURL'], vf)
    with open(out, 'wb') as fo:
        for u in os.environ['GURU_PACKED'].split(','):
            say('download', u); p = os.path.join(D, 'part.zst'); urllib.request.urlretrieve(u.strip(), p)
            with open(p, 'rb') as fi: zstandard.ZstdDecompressor().copy_stream(fi, fo)
            os.remove(p)
    say('packed file', os.path.getsize(out) // REC, 'positions'); return out, vf

def pack():
    if os.environ.get('GURU_PACKED'): return fetch_packed()
    out = os.path.join(D, 'pos.bin'); vf = os.path.join(D, 'valid.txt')
    SKIPC = int(os.environ.get('GURU_SKIP', '0')); shard = os.environ.get('GURU_SHARD'); si, sn = (int(x) for x in shard.split('/')) if shard else (0, 1); NP = NPOS // sn
    if shard: out = os.path.join(D, f'guru_pos_{si}of{sn}.bin'); vf = os.path.join(W, f'guru_valid_of{sn}.txt' if si == 0 else f'guru_valid_{si}of{sn}.txt')
    if os.path.exists(out) and os.path.getsize(out) >= REC * min(NPOS, 1000): say('reuse', out); return out, vf
    say('packing', NPOS, 'positions from', SRC)
    if os.environ.get('GURU_BINPACK'):  # Stockfish self-play binpacks: positions + the move the search chose (billions available)
        names = [x.strip() for x in os.environ['GURU_BINPACK'].split(',') if x.strip()]; per = int(NPOS / len(names) * 1.12)  # every shard re-reads the whole stream (own chunks only); files in sequence, so each gets an equal share
        for cmd in ('rm -rf nnp && git clone -q --depth 1 https://github.com/official-stockfish/nnue-pytorch nnp', f'g++ -O2 -std=c++20 -I. -o binpack_dump {os.path.join(os.path.dirname(os.path.abspath(__file__)), "../lab/train/binpack_dump.cpp") if os.path.exists(os.path.join(os.path.dirname(os.path.abspath(__file__)), "../lab/train/binpack_dump.cpp")) else "binpack_dump.cpp"}'):
            subprocess.run(cmd, shell=True, check=True)
        urls = ' '.join(f'https://huggingface.co/datasets/official-stockfish/master-binpacks/resolve/main/{n}.binpack' for n in names)
        shcmd = f"for u in {urls}; do curl -sL --retry 5 $u | ./binpack_dump /dev/stdin {per} 1.0 8 guru; done"
        pr = subprocess.Popen(shcmd, shell=True, stdout=subprocess.PIPE, executable='/bin/bash'); txt = io.TextIOWrapper(pr.stdout, encoding='utf-8', errors='ignore')
    else:
        rq = urllib.request.urlopen(SRC) if SRC.startswith('http') else open(SRC, 'rb')
        txt = io.TextIOWrapper(zstandard.ZstdDecompressor().stream_reader(rq, read_size=1 << 22), encoding='utf-8', errors='ignore')
    def chunks():
        buf = []; ci = 0
        try:
            for l in txt:
                buf.append(l)
                if len(buf) == 20000:
                    if ci >= SKIPC and ci % sn == si: yield buf
                    ci += 1; buf = []
        except Exception as e: say('stream ended:', type(e).__name__)
        if buf and ci >= SKIPC and ci % sn == si: yield buf
        say('chunks used', ci)
    n = 0; t = time.time()
    with open(out, 'wb') as fo, open(vf, 'w') as fv, Pool(max(os.cpu_count() - 1, 1)) as pool:
        for res in pool.imap(enc_chunk, chunks(), chunksize=1):
            for rec, fen in res:
                if n < VALN: fv.write(fen + '\n')
                fo.write(rec); n += 1
                if n >= NP: break
            if n >= NP: break
            if n % 2000000 < 20000: say(f'  packed {n/1e7:.2f} crore, {n/(time.time()-t)/1e3:.0f}k/s')
        pool.terminate()
    say('packed', n, 'positions in', round((time.time() - t) / 60, 1), 'min')
    if shard:
        with open(out, 'rb') as fi, open(os.path.join(W, os.path.basename(out) + '.zst'), 'wb') as fo: zstandard.ZstdCompressor(level=6, threads=2).copy_stream(fi, fo)
        say('shard written', os.path.basename(out) + '.zst'); sys.exit(0)
    return out, vf

# ---- model: residual conv net; policy head = 64 "to" channels at each "from" square -> 4096 logits ----
class Block(nn.Module):
    def __init__(s, c):
        super().__init__(); s.a = nn.Conv2d(c, c, 3, padding=1, bias=False); s.b = nn.Conv2d(c, c, 3, padding=1, bias=False); s.na = nn.BatchNorm2d(c); s.nb = nn.BatchNorm2d(c)
    def forward(s, x): return Fn.relu(x + s.nb(s.b(Fn.relu(s.na(s.a(x))))))
class Guru(nn.Module):
    def __init__(s, nb, c):
        super().__init__(); s.stem = nn.Sequential(nn.Conv2d(NIN, c, 3, padding=1, bias=False), nn.BatchNorm2d(c), nn.ReLU())
        s.body = nn.Sequential(*[Block(c) for _ in range(nb)]); s.head = nn.Sequential(nn.Conv2d(c, c, 1), nn.ReLU(), nn.Conv2d(c, 64, 1)); s.vh = nn.Sequential(nn.Linear(c, 64), nn.ReLU(), nn.Linear(64, 1))
    def forward(s, x):
        h = s.body(s.stem(x)); return s.head(h).flatten(2).transpose(1, 2).reshape(x.shape[0], 4096), s.vh(h.mean((2, 3))).squeeze(1)  # policy [from][to], value
def base_planes(r):  # r: uint8 (B,REC) on GPU -> (B,18,8,8)
    B = r.shape[0]; bd = r[:, :64].long(); x = torch.zeros(B, 18, 64, device=r.device, dtype=torch.float16)
    x.scatter_(1, bd.unsqueeze(1), 1.0); x = x[:, 1:]  # 12 piece planes, drop "empty"
    c = r[:, 64].long(); cp = torch.stack([(c >> i) & 1 for i in range(4)], 1).half().unsqueeze(2).expand(B, 4, 64)
    ep = torch.zeros(B, 1, 64, device=r.device, dtype=torch.float16); e = r[:, 65].long(); m = e > 0
    ep[m.nonzero()[:, 0], 0, 40 + e[m] - 1] = 1  # ep target square is on rank 6 from the mover's view
    return torch.cat([x[:, :12], cp, ep, torch.ones(B, 1, 64, device=r.device, dtype=torch.float16)], 1).view(B, 18, 8, 8).float()
def u16(r, i): return r[:, i].long() | (r[:, i + 1].long() << 8)

# ---- GPU geometry: attack maps (input planes) and a pseudo-legal move mask (used in the loss) ----
ORTH = [(1, 0), (-1, 0), (0, 1), (0, -1)]; DIAG = [(1, 1), (1, -1), (-1, 1), (-1, -1)]; KN = [(1, 2), (2, 1), (-1, 2), (-2, 1), (1, -2), (2, -1), (-1, -2), (-2, -1)]
def sh(x, dr, df):  # y[r+dr, f+df] = x[r, f] on (B,8,8) bool
    y = torch.zeros_like(x); r0, r1, f0, f1 = max(dr, 0), 8 + min(dr, 0), max(df, 0), 8 + min(df, 0)
    y[:, r0:r1, f0:f1] = x[:, r0 - dr:r1 - dr, f0 - df:f1 - df]; return y
def slide(p, occ, dirs):
    a = torch.zeros_like(p)
    for dr, df in dirs:
        c = sh(p, dr, df); a |= c
        for _ in range(6): c = sh(c & ~occ, dr, df); a |= c
    return a
def jump(p, offs):
    a = torch.zeros_like(p)
    for dr, df in offs: a |= sh(p, dr, df)
    return a
def side_att(bd, o, up):  # squares attacked by P,N,B,R,Q,K of the side whose piece codes start at o+1 (pawns attack toward rank direction `up`)
    occ = bd > 0
    return torch.stack([jump(bd == o + 1, [(up, 1), (up, -1)]), jump(bd == o + 2, KN), slide(bd == o + 3, occ, DIAG), slide(bd == o + 4, occ, ORTH),
                        slide(bd == o + 5, occ, ORTH + DIAG), jump(bd == o + 6, ORTH + DIAG)], 1)
def ext_planes(r):  # 6 own attack maps, 6 their attack maps, own hanging, their hanging, in-check
    B = r.shape[0]; bd = r[:, :64].long().view(B, 8, 8); ma = side_att(bd, 0, 1); ta = side_att(bd, 6, -1); am, at = ma.any(1), ta.any(1)
    pv = torch.tensor([0, 1, 3, 3, 5, 9, 100, 1, 3, 3, 5, 9, 100], device=r.device)[bd]
    def low(a):
        v = torch.full_like(pv, 1000)
        for i, x in ((5, 100), (4, 9), (3, 5), (2, 3), (1, 3), (0, 1)): v = torch.where(a[:, i], torch.full_like(v, x), v)
        return v
    own = (bd >= 1) & (bd <= 5); th = (bd >= 7) & (bd <= 11)
    ho = own & at & (~am | (low(ta) < pv)); ht = th & am & (~at | (low(ma) < pv))
    chk = ((bd == 6) & at).flatten(1).any(1).view(B, 1, 1, 1).expand(B, 1, 8, 8)
    return torch.cat([ma, ta, ho.unsqueeze(1), ht.unsqueeze(1), chk], 1).half()
def planes(r): return torch.cat([base_planes(r), ext_planes(r).float()], 1)
_G = {}
def geom(dev):
    if dev in _G: return _G[dev]
    t = lambda a: torch.tensor(a, device=dev, dtype=torch.long)
    ok = lambda q, dr, df: 0 <= q // 8 + dr < 8 and 0 <= q % 8 + df < 8
    jumps = [(code, t([q for q in range(64) if ok(q, dr, df)]), t([q + dr * 8 + df for q in range(64) if ok(q, dr, df)])) for code, offs in ((2, KN), (6, ORTH + DIAG)) for dr, df in offs]
    slides = []
    for ortho, dirs in ((True, ORTH), (False, DIAG)):
        for dr, df in dirs:
            ks = [(t([q for q in range(64) if ok(q, k * dr, k * df)]), t([q + k * (dr * 8 + df) for q in range(64) if ok(q, k * dr, k * df)])) for k in range(1, 8)]
            slides.append((ortho, [x for x in ks if len(x[0])]))
    _G[dev] = {'jumps': jumps, 'slides': slides}; return _G[dev]
def pmask(r):  # (B,4096) bool: pseudo-legal moves (own pieces, correct geometry, castling/ep), king safety ignored
    dev = r.device; B = r.shape[0]; bd = r[:, :64].long(); own = (bd >= 1) & (bd <= 6); th = bd >= 7; em = bd == 0; g = geom(dev)
    m = torch.zeros(B, 64, 64, dtype=torch.bool, device=dev)
    for code, s, d in g['jumps']: m[:, s, d] |= (bd[:, s] == code) & ~own[:, d]
    for ortho, ks in g['slides']:
        pk = ((bd == 4) | (bd == 5)) if ortho else ((bd == 3) | (bd == 5)); pe = torch.ones(B, 64, dtype=torch.bool, device=dev)
        for s, d in ks: m[:, s, d] |= pk[:, s] & pe[:, s] & ~own[:, d]; pe[:, s] &= em[:, d]
    P = bd == 1; s = torch.arange(8, 56, device=dev); m[:, s, s + 8] |= P[:, s] & em[:, s + 8]
    s = torch.arange(8, 16, device=dev); m[:, s, s + 16] |= P[:, s] & em[:, s + 8] & em[:, s + 16]
    for df in (-1, 1):
        s = torch.tensor([q for q in range(8, 56) if 0 <= q % 8 + df < 8], device=dev); m[:, s, s + 8 + df] |= P[:, s] & th[:, s + 8 + df]
    e = r[:, 65].long()
    for f in range(8):
        for df in (-1, 1):
            if 0 <= f + df < 8: m[:, 32 + f + df, 40 + f] |= P[:, 32 + f + df] & (e == f + 1)
    c = r[:, 64].long()
    m[:, 4, 6] |= ((c & 1) > 0) & (bd[:, 4] == 6) & em[:, 5] & em[:, 6]; m[:, 4, 2] |= ((c & 2) > 0) & (bd[:, 4] == 6) & em[:, 1] & em[:, 2] & em[:, 3]
    return m.view(B, 4096)
def board_rec(bd):  # python-chess Board -> record (for tests): mover's view
    flip = bd.turn == chess.BLACK; b = bytearray(REC)
    for q, pc in bd.piece_map().items():
        own = (pc.color == bd.turn); qq = q ^ 56 if flip else q; b[qq] = pc.piece_type + (0 if own else 6)
    me, th = bd.turn, not bd.turn
    b[64] = bd.has_kingside_castling_rights(me) | bd.has_queenside_castling_rights(me) << 1 | bd.has_kingside_castling_rights(th) << 2 | bd.has_queenside_castling_rights(th) << 3
    if bd.ep_square is not None: b[65] = chess.square_file(bd.ep_square) + 1
    return bytes(b)
def selftest():
    import random; random.seed(1); boards = []
    for g in range(60):
        bd = chess.Board()
        for ply in range(random.randint(4, 120)):
            ms = list(bd.legal_moves)
            if not ms: break
            bd.push(random.choice(ms))
            if ply % 3 == 0: boards.append(bd.copy())
    r = torch.from_numpy(np.frombuffer(b''.join(board_rec(b) for b in boards), dtype=np.uint8).reshape(-1, REC).copy()); pm = pmask(r).numpy(); miss = extra = leg = 0
    for i, bd in enumerate(boards):
        flip = bd.turn == chess.BLACK; L = set()
        for m in bd.legal_moves:
            f, t = m.from_square, m.to_square
            if flip: f, t = f ^ 56, t ^ 56
            L.add(f * 64 + t)
        P = set(np.nonzero(pm[i])[0].tolist()); miss += len(L - P); extra += len(P - L); leg += len(L)
    say(f'selftest pmask: {len(boards)} positions, {leg} legal moves, missing {miss}, extra pseudo-legal {extra}')
    ex = ext_planes(r).float().numpy(); bad = 0
    for i, bd in enumerate(boards):
        flip = bd.turn == chess.BLACK
        for q in range(64):
            qq = q ^ 56 if flip else q
            if bool(ex[i, :6].any(0).reshape(64)[qq]) != bd.is_attacked_by(bd.turn, q): bad += 1
            if bool(ex[i, 6:12].any(0).reshape(64)[qq]) != bd.is_attacked_by(not bd.turn, q): bad += 1
    say(f'selftest attack maps: {bad} mismatches over {len(boards) * 128} squares'); assert miss == 0 and bad == 0

def legal_masks(vf, n):
    masks = np.zeros((n, 4096), dtype=bool)
    for i, fen in enumerate(open(vf).read().split('\n')[:n]):
        bd = chess.Board(fen); flip = bd.turn == chess.BLACK
        for m in bd.legal_moves:
            f, t = m.from_square, m.to_square
            if flip: f, t = f ^ 56, t ^ 56
            masks[i, f * 64 + t] = True
    return masks

def veto_report(net, vd, vmask, vf, dev, n=20000):
    # 1-ply veto: among the net's top-6 legal moves drop ones that simply hang the moved piece (attacked by a cheaper piece or undefended, no check, gain < loss), keep first 3
    V = {1: 1, 2: 3, 3: 3, 4: 5, 5: 9, 6: 100}; fens = open(vf).read().split('\n')[:min(n, len(vd))]; n = len(fens); net.eval(); hit0 = hit1 = vet = 0
    with torch.no_grad(), torch.autocast(dev, dtype=torch.float16, enabled=dev == 'cuda'):
        for i in range(0, n, 2048):
            r = vd[i:i + 2048][:n - i]; lg = net(planes(r).to(memory_format=torch.channels_last))[0].float().masked_fill(~vmask[i:i + len(r)], -1e9)
            top = lg.topk(6, 1).indices.cpu().numpy(); best = u16(r, 66).cpu().numpy()
            for j in range(len(r)):
                bd = chess.Board(fens[i + j]); flip = bd.turn == chess.BLACK; keep = []
                for c in top[j]:
                    f, t = int(c) >> 6, int(c) & 63
                    if flip: f, t = f ^ 56, t ^ 56
                    mvv = chess.Move(f, t)
                    if mvv not in bd.legal_moves: mvv = chess.Move(f, t, chess.QUEEN)
                    if mvv not in bd.legal_moves: continue
                    pc = bd.piece_at(f); cap = bd.piece_at(t); gain = V[cap.piece_type] if cap else 0; bd.push(mvv); bad = False
                    if not bd.is_check() and bd.is_attacked_by(bd.turn, t):
                        low = min(V[bd.piece_type_at(q)] for q in bd.attackers(bd.turn, t)); defended = bool(bd.attackers(not bd.turn, t))
                        bad = (low < V[pc.piece_type] or not defended) and gain < V[pc.piece_type] - (low if defended else 0) and V[pc.piece_type] < 100
                    bd.pop(); keep.append((int(c), bad))
                ok = [c for c, b in keep if not b] or [c for c, b in keep]
                hit0 += best[j] in [c for c, _ in keep][:3]; hit1 += best[j] in ok[:3]; vet += sum(b for _, b in keep[:3])
    net.train(); say(f'veto report on {n} held-out: top3 plain {100*hit0/n:.2f}%  top3 with 1-ply veto {100*hit1/n:.2f}%  (vetoed {vet} of top-3 slots)')
def main():
    if os.environ.get('GURU_TEST'): selftest(); return
    dev = 'cuda' if torch.cuda.is_available() else 'cpu'; say('== Guru', NAME, 'blocks', NB, 'channels', CH, 'device', dev, torch.cuda.get_device_name() if dev == 'cuda' else '')
    pf, vf = pack(); data = np.fromfile(pf, dtype=np.uint8).reshape(-1, REC); N = len(data); nv = min(VALN, N // 10)
    say('positions', N, '(held out', nv, ')'); vmask = torch.from_numpy(legal_masks(vf, nv)).to(dev); vd = torch.from_numpy(data[:nv]).to(dev)
    net = Guru(NB, CH).to(dev).to(memory_format=torch.channels_last); say('params', round(sum(p.numel() for p in net.parameters()) / 1e6, 2), 'M')
    if os.environ.get('GURU_INIT'):
        src = os.environ['GURU_INIT']; pth = os.path.join(D, 'init.pt')
        if src.startswith('http'): urllib.request.urlretrieve(src, pth)
        else: pth = src
        ck = torch.load(pth, map_location=dev); net.load_state_dict(ck['state']); say('init from', src, ck.get('valid'))
    opt = torch.optim.AdamW(net.parameters(), lr=LR, weight_decay=1e-4); scaler = torch.amp.GradScaler(enabled=dev == 'cuda')
    tr = np.arange(nv, N); steps_ep = len(tr) // BS; total = EPOCHS * steps_ep; step = 0; budget = HOURS * 3600 - (time.time() - T0) - 900
    def evaluate():
        net.eval(); h = np.zeros(4); n = 0
        with torch.no_grad(), torch.autocast(dev, dtype=torch.float16, enabled=dev == 'cuda'):
            for i in range(0, nv, 2048):
                r = vd[i:i + 2048]; lg = net(planes(r).to(memory_format=torch.channels_last))[0].float().masked_fill(~vmask[i:i + 2048], -1e9)
                top = lg.topk(3, 1).indices; best = u16(r, 66); sec = u16(r, 68); gap = u16(r, 70)
                hit = top == best[:, None]; h[0] += hit[:, 0].sum().item(); h[1] += hit[:, :2].any(1).sum().item(); h[2] += hit.any(1).sum().item()
                h[3] += (hit[:, 0] | ((top[:, 0] == sec) & (gap <= 30))).sum().item(); n += len(r)
        net.train(); return {k: round(float(100 * v / n), 2) for k, v in zip(('top1', 'top2', 'top3', 'good30'), h)}
    say('start', evaluate()); t = time.time(); seen = 0; stop = False
    for ep in range(EPOCHS):
        np.random.shuffle(tr); lsum = 0; ln = 0
        for k in range(steps_ep):
            if step == 300:  # time check: shrink the cosine schedule to what fits in the hours left
                per = (time.time() - t) / 300; fit = int((budget - (time.time() - T0)) / per)
                if fit < total: total = max(fit, step + 1); say(f'time budget: {total} steps fit ({total * BS / 1e7:.1f} crore positions)')
            if step >= total: stop = True; break
            lr = LR * (min(1, step / 1000)) * 0.5 * (1 + math.cos(math.pi * step / total))
            for g in opt.param_groups: g['lr'] = lr
            r = torch.from_numpy(data[np.sort(tr[k * BS:(k + 1) * BS])]).to(dev, non_blocking=True)
            with torch.autocast(dev, dtype=torch.float16, enabled=dev == 'cuda'):
                lg, vv = net(planes(r).to(memory_format=torch.channels_last))
            ar = torch.arange(len(r), device=dev); lab = u16(r, 66); sec = u16(r, 68); gap = u16(r, 70); w2 = torch.where((gap <= 30) & (gap != 65535), 0.2, 0.0)
            pm = pmask(r); pm[ar, lab] = True; pm[ar, sec] |= w2 > 0  # illegal moves do not compete in the softmax
            lp = Fn.log_softmax(lg.float().masked_fill(~pm, -1e4), 1)
            vt = torch.tanh(r[:, 72].long().add(r[:, 73].long() << 8).sub(65536 * (r[:, 73] >= 128).long()).float() / 400)
            loss = -((1 - w2) * lp[ar, lab] + w2 * lp[ar, sec]).mean() + VW * Fn.mse_loss(torch.tanh(vv.float()), vt)
            opt.zero_grad(set_to_none=True); scaler.scale(loss).backward(); scaler.step(opt); scaler.update()
            lsum += loss.item() if k % 50 == 0 else 0; ln += k % 50 == 0; step += 1; seen += BS
            if step % 5000 == 0: say(f'ep {ep+1} step {step}/{total} loss {lsum/max(ln,1):.3f} lr {lr:.2e} {seen/(time.time()-t):.0f} pos/s', evaluate() if step % 25000 == 0 else ''); lsum = ln = 0
        res = evaluate(); say(f'== epoch {ep+1} done', res, f'{(time.time()-T0)/3600:.2f} h')
        torch.save({'size': SIZE, 'nb': NB, 'ch': CH, 'state': net.state_dict(), 'valid': res}, os.path.join(W, f'{NAME}_ep{ep+1}.pt'))
        if stop: break
    res = evaluate(); torch.save({'size': SIZE, 'nb': NB, 'ch': CH, 'state': net.state_dict(), 'valid': res}, os.path.join(W, NAME + '.pt'))
    try: veto_report(net, vd, vmask, vf, dev)
    except Exception as e: say('veto report failed', type(e).__name__, e)
    say('DONE', NAME + '.pt', res, 'hours', round((time.time() - T0) / 3600, 2))
if __name__ == '__main__': main()
