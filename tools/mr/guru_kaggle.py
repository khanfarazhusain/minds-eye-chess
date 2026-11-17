# "Guru model": a big no-search policy net that looks at a board and names Stockfish's best move (Lichess eval DB, depth >= 20).
# It never runs during a game; it measures how far "no look-ahead" can go (top-1/2/3) and is later distilled into human rules.
# Kaggle (GPU T4, Internet on), one cell:
#   !curl -fsSL https://raw.githubusercontent.com/khanfarazhusain/minds-eye-chess/engine-lab/tools/mr/guru_kaggle.py -o g.py && python g.py
# Settings (before "python g.py"): GURU_SIZE s|m|l|xl (default l = 15 blocks x 192)   GURU_POS positions to pack (default 8 crore)
#   GURU_HOURS (default 11)   GURU_EPOCHS (default 3)   GURU_BS (default 1024)   GURU_LR (default 1e-3)
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
VALN = 50000; REC = 72; SRC = os.environ.get('GURU_SRC', 'https://database.lichess.org/lichess_db_eval.jsonl.zst')
STAMP = time.strftime('%Y%m%d_%H%M', time.gmtime()); NAME = f'guru_{SIZE}_{STAMP}'

# ---- packing: one 72-byte record per position, always from the side to move's view (black positions are flipped) ----
# 0..63 board (0 empty, 1-6 my P N B R Q K, 7-12 theirs), 64 castling bits (my K, my Q, their K, their Q), 65 ep file+1,
# 66-67 best move (from*64+to), 68-69 second move, 70-71 cp gap best-second (65535 = none)
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
        p = ev['pvs']; b[66:68] = mv2(p[0]['line'].split()[0]).to_bytes(2, 'little')
        if len(p) > 1 and p[1].get('line'):
            b[68:70] = mv2(p[1]['line'].split()[0]).to_bytes(2, 'little'); g = min(abs(score(p[0]) - score(p[1])), 65534)
        else: g = 65535
        b[70:72] = g.to_bytes(2, 'little'); return bytes(b), j['fen'] + ' 0 1'
    except Exception: return None
def enc_chunk(lines): return [x for x in map(enc, lines) if x]

def pack():
    out = os.path.join(D, 'pos.bin'); vf = os.path.join(D, 'valid.txt')
    if os.path.exists(out) and os.path.getsize(out) >= REC * min(NPOS, 1000): say('reuse', out); return out, vf
    say('packing', NPOS, 'positions from', SRC)
    rq = urllib.request.urlopen(SRC) if SRC.startswith('http') else open(SRC, 'rb')
    txt = io.TextIOWrapper(zstandard.ZstdDecompressor().stream_reader(rq, read_size=1 << 22), encoding='utf-8', errors='ignore')
    def chunks():
        buf = []
        try:
            for l in txt:
                buf.append(l)
                if len(buf) == 20000: yield buf; buf = []
        except Exception as e: say('stream ended:', type(e).__name__)
        if buf: yield buf
    n = 0; t = time.time()
    with open(out, 'wb') as fo, open(vf, 'w') as fv, Pool(max(os.cpu_count() - 1, 1)) as pool:
        for res in pool.imap(enc_chunk, chunks(), chunksize=1):
            for rec, fen in res:
                if n < VALN: fv.write(fen + '\n')
                fo.write(rec); n += 1
                if n >= NPOS: break
            if n >= NPOS: break
            if n % 2000000 < 20000: say(f'  packed {n/1e7:.2f} crore, {n/(time.time()-t)/1e3:.0f}k/s')
        pool.terminate()
    say('packed', n, 'positions in', round((time.time() - t) / 60, 1), 'min'); return out, vf

# ---- model: residual conv net; policy head = 64 "to" channels at each "from" square -> 4096 logits ----
class Block(nn.Module):
    def __init__(s, c):
        super().__init__(); s.a = nn.Conv2d(c, c, 3, padding=1, bias=False); s.b = nn.Conv2d(c, c, 3, padding=1, bias=False); s.na = nn.BatchNorm2d(c); s.nb = nn.BatchNorm2d(c)
    def forward(s, x): return Fn.relu(x + s.nb(s.b(Fn.relu(s.na(s.a(x))))))
class Guru(nn.Module):
    def __init__(s, nb, c):
        super().__init__(); s.stem = nn.Sequential(nn.Conv2d(18, c, 3, padding=1, bias=False), nn.BatchNorm2d(c), nn.ReLU())
        s.body = nn.Sequential(*[Block(c) for _ in range(nb)]); s.head = nn.Sequential(nn.Conv2d(c, c, 1), nn.ReLU(), nn.Conv2d(c, 64, 1))
    def forward(s, x): return s.head(s.body(s.stem(x))).flatten(2).transpose(1, 2).reshape(x.shape[0], 4096)  # [from][to]
def planes(r):  # r: uint8 (B,72) on GPU -> (B,18,8,8)
    B = r.shape[0]; bd = r[:, :64].long(); x = torch.zeros(B, 18, 64, device=r.device, dtype=torch.float16)
    x.scatter_(1, bd.unsqueeze(1), 1.0); x = x[:, 1:]  # 12 piece planes, drop "empty"
    c = r[:, 64].long(); cp = torch.stack([(c >> i) & 1 for i in range(4)], 1).half().unsqueeze(2).expand(B, 4, 64)
    ep = torch.zeros(B, 1, 64, device=r.device, dtype=torch.float16); e = r[:, 65].long(); m = e > 0
    ep[m.nonzero()[:, 0], 0, 40 + e[m] - 1] = 1  # ep target square is on rank 6 from the mover's view
    return torch.cat([x[:, :12], cp, ep, torch.ones(B, 1, 64, device=r.device, dtype=torch.float16)], 1).view(B, 18, 8, 8).float()
def u16(r, i): return r[:, i].long() | (r[:, i + 1].long() << 8)

def legal_masks(vf, n):
    masks = np.zeros((n, 4096), dtype=bool)
    for i, fen in enumerate(open(vf).read().split('\n')[:n]):
        bd = chess.Board(fen); flip = bd.turn == chess.BLACK
        for m in bd.legal_moves:
            f, t = m.from_square, m.to_square
            if flip: f, t = f ^ 56, t ^ 56
            masks[i, f * 64 + t] = True
    return masks

def main():
    dev = 'cuda' if torch.cuda.is_available() else 'cpu'; say('== Guru', NAME, 'blocks', NB, 'channels', CH, 'device', dev, torch.cuda.get_device_name() if dev == 'cuda' else '')
    pf, vf = pack(); data = np.fromfile(pf, dtype=np.uint8).reshape(-1, REC); N = len(data); nv = min(VALN, N // 10)
    say('positions', N, '(held out', nv, ')'); vmask = torch.from_numpy(legal_masks(vf, nv)).to(dev); vd = torch.from_numpy(data[:nv]).to(dev)
    net = Guru(NB, CH).to(dev).to(memory_format=torch.channels_last); say('params', round(sum(p.numel() for p in net.parameters()) / 1e6, 2), 'M')
    opt = torch.optim.AdamW(net.parameters(), lr=LR, weight_decay=1e-4); scaler = torch.amp.GradScaler(enabled=dev == 'cuda')
    tr = np.arange(nv, N); steps_ep = len(tr) // BS; total = EPOCHS * steps_ep; step = 0; budget = HOURS * 3600 - (time.time() - T0) - 900
    def evaluate():
        net.eval(); h = np.zeros(4); n = 0
        with torch.no_grad(), torch.autocast(dev, dtype=torch.float16, enabled=dev == 'cuda'):
            for i in range(0, nv, 2048):
                r = vd[i:i + 2048]; lg = net(planes(r).to(memory_format=torch.channels_last)).float().masked_fill(~vmask[i:i + 2048], -1e9)
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
                loss = Fn.cross_entropy(net(planes(r).to(memory_format=torch.channels_last)).float(), u16(r, 66))
            opt.zero_grad(set_to_none=True); scaler.scale(loss).backward(); scaler.step(opt); scaler.update()
            lsum += loss.item() if k % 50 == 0 else 0; ln += k % 50 == 0; step += 1; seen += BS
            if step % 5000 == 0: say(f'ep {ep+1} step {step}/{total} loss {lsum/max(ln,1):.3f} lr {lr:.2e} {seen/(time.time()-t):.0f} pos/s', evaluate() if step % 25000 == 0 else ''); lsum = ln = 0
        res = evaluate(); say(f'== epoch {ep+1} done', res, f'{(time.time()-T0)/3600:.2f} h')
        torch.save({'size': SIZE, 'nb': NB, 'ch': CH, 'state': net.state_dict(), 'valid': res}, os.path.join(W, f'{NAME}_ep{ep+1}.pt'))
        if stop: break
    res = evaluate(); torch.save({'size': SIZE, 'nb': NB, 'ch': CH, 'state': net.state_dict(), 'valid': res}, os.path.join(W, NAME + '.pt'))
    say('DONE', NAME + '.pt', res, 'hours', round((time.time() - T0) / 3600, 2))
if __name__ == '__main__': main()
