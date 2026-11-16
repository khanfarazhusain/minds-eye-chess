# FHK-Net v2 streaming GPU trainer: reads training text (.gz) through featpack chunk by chunk, so data can be far bigger than RAM/disk.
# Features are built on the GPU from packed boards (fhkfeat.py, verified identical to train3.c). Output: the same v2 .bin as train3.c.
#   gcc -O2 -o featpack featpack.c -lm
#   python trainpt2.py out.bin data_part_* --valid valid.gz --epochs 3 --kb 16 --h 1536 --lr 1e-3 [--init old.bin] [--aug]
import argparse, struct, subprocess, time, random, os, numpy as np, torch
from fhkfeat import feats
ap = argparse.ArgumentParser(); ap.add_argument('out'); ap.add_argument('files', nargs='+'); ap.add_argument('--valid', required=True)
ap.add_argument('--epochs', type=int, default=3); ap.add_argument('--lr', type=float, default=1e-3); ap.add_argument('--kb', type=int, default=16)
ap.add_argument('--h', type=int, default=1536); ap.add_argument('--init'); ap.add_argument('--bs', type=int, default=16384); ap.add_argument('--chunk', type=int, default=8_000_000)
ap.add_argument('--lam', type=float, default=0.8); ap.add_argument('--aug', action='store_true'); ap.add_argument('--featpack', default='./featpack')
ap.add_argument('--ckdir', help='copy the net here after every epoch as ep<N>.bin'); ap.add_argument('--max-hours', type=float, default=0, help='stop cleanly (save) after this many hours')
a = ap.parse_args(); T_START = time.time()
KB, H, OB = a.kb, a.h, 8; NF = KB * 768; CS = 0.98 * 2.302585; dev = 'cuda' if torch.cuda.is_available() else 'cpu'; print('device', dev, flush=True)
REC = np.dtype([('b', 'u1', 32), ('stm', 'u1'), ('t', '<f4')])
def stream(path):  # yields numpy chunks of packed positions
    p = subprocess.Popen(f"{'zcat' if path.endswith('.gz') or 'part_' in path else 'cat'} '{path}' | {a.featpack} {a.lam}", shell=True, stdout=subprocess.PIPE, bufsize=1 << 24)
    while True:
        raw = p.stdout.read(a.chunk * REC.itemsize)
        if not raw: break
        yield np.frombuffer(raw[:len(raw) // REC.itemsize * REC.itemsize], REC)
    p.wait()
rng = np.random.default_rng(12345)
W1 = torch.zeros(NF + 1, H); B1 = torch.zeros(H); W2 = torch.zeros(OB, 2 * H); B2 = torch.zeros(OB)
W1[:NF] = torch.from_numpy(((rng.random((NF, H)) - 0.5) * 0.2).astype(np.float32)); B1[:] = torch.from_numpy((0.1 + (rng.random(H) - 0.5) * 0.05).astype(np.float32))
W2[:] = torch.from_numpy(((rng.random((OB, 2 * H)) - 0.5) * 0.1).astype(np.float32))
if a.init:  # same rules as train3.c: v1 net is copied into every bucket; v2 must match KB and H
    b = open(a.init, 'rb').read(); hh = struct.unpack('<i', b[:4])[0]
    if hh == H:
        v = np.frombuffer(b, '<f4', offset=4); w1 = v[:768 * H].reshape(768, H); o = 768 * H
        for k in range(KB): W1[k * 768:(k + 1) * 768] = torch.from_numpy(w1.copy())
        B1[:] = torch.from_numpy(v[o:o + H].copy()); o += H; W2[:] = torch.from_numpy(v[o:o + 2 * H].copy()); o += 2 * H; B2[:] = float(v[o]); print('init v1', a.init)
    elif hh == -H:
        assert struct.unpack('<i', b[4:8])[0] == KB, 'KB mismatch'; v = np.frombuffer(b, '<f4', offset=8); o = NF * H
        W1[:NF] = torch.from_numpy(v[:o].reshape(NF, H).copy()); B1[:] = torch.from_numpy(v[o:o + H].copy()); o += H
        W2[:] = torch.from_numpy(v[o:o + OB * 2 * H].reshape(OB, 2 * H).copy()); o += OB * 2 * H; B2[:] = torch.from_numpy(v[o:o + OB].copy()); print('init v2', a.init)
    else: print('init skipped: size differs (starting fresh)', hh)
P = [torch.nn.Parameter(x.to(dev)) for x in (W1, B1, W2, B2)]; W1, B1, W2, B2 = P
with torch.no_grad(): W1[NF].zero_()
opt = torch.optim.Adam(P, lr=a.lr)
def fwd(b32, stm, mirror=None):
    F, G, n, ob = feats(torch, b32, KB, mirror)
    ew = torch.nn.functional.embedding_bag(F, W1, mode='sum') + B1; eb = torch.nn.functional.embedding_bag(G, W1, mode='sum') + B1  # bag: no (N,64,H) tensor, fits 1536 on a 16GB GPU
    s = stm.unsqueeze(1); u = torch.where(s, eb, ew).clamp(0, 1); t = torch.where(s, ew, eb).clamp(0, 1)
    w2 = W2[ob]; return (u * w2[:, :H]).sum(1) + (t * w2[:, H:]).sum(1) + B2[ob]
def to_dev(c): return torch.from_numpy(np.ascontiguousarray(c['b'])).to(dev), torch.from_numpy(c['stm'].astype(bool)).to(dev), torch.from_numpy(c['t'].copy()).to(dev)
def save(path=None):
    path = path or a.out
    with torch.no_grad():
        out = struct.pack('<ii', -H, KB) + b''.join(x.detach().cpu().numpy().astype('<f4').tobytes() for x in (W1[:NF], B1, W2, B2))
    open(path + '.tmp', 'wb').write(out); os.replace(path + '.tmp', path)
VAL = np.concatenate(list(stream(a.valid)))[:1_000_000]; print('valid positions', len(VAL), flush=True)
def valid():
    with torch.no_grad():
        s = 0.0
        for i in range(0, len(VAL), 65536):
            b, st, tg = to_dev(VAL[i:i + 65536]); s += ((torch.sigmoid(fwd(b, st) * CS) - tg) ** 2).sum().item()
        return s / len(VAL)
print('valid at start', round(valid(), 6), flush=True); seen = 0
for ep in range(a.epochs):
    if ep == int(a.epochs * 0.6) or ep == int(a.epochs * 0.85):
        for g in opt.param_groups: g['lr'] *= 0.3
    files = a.files[:]; random.Random(ep).shuffle(files); t0 = time.time(); tl = 0.0; nn = 0
    for path in files:
        for c in stream(path):
            perm = rng.permutation(len(c)); b_all, st_all, tg_all = to_dev(c[perm])
            for i in range(0, len(c), a.bs):
                b, st, tg = b_all[i:i + a.bs], st_all[i:i + a.bs], tg_all[i:i + a.bs]
                mir = (torch.rand(len(tg), device=dev) < 0.5).long() if a.aug else None
                loss = ((torch.sigmoid(fwd(b, st, mir) * CS) - tg) ** 2).mean()
                opt.zero_grad(set_to_none=True); loss.backward()
                with torch.no_grad(): W1.grad[NF].zero_()
                opt.step()
                with torch.no_grad(): W2.clamp_(-2, 2); W1[NF].zero_()
                tl += loss.item() * len(tg); nn += len(tg)
            seen += len(c)
            if a.max_hours and time.time() - T_START > a.max_hours * 3600:
                save(); print(f'TIME LIMIT {a.max_hours}h reached in epoch {ep}: saved {a.out}, valid {valid():.6f}', flush=True); raise SystemExit(0)
            print(f'  ep {ep} {os.path.basename(path)} +{len(c)} total {seen} train {tl / max(nn, 1):.6f} {time.time() - t0:.0f}s {seen / max(time.time() - T_START, 1) / 1000:.0f}k pos/s', flush=True)
        save()
    print(f'epoch {ep} train {tl / max(nn, 1):.6f} valid {valid():.6f} lr {opt.param_groups[0]["lr"]:g} {time.time() - t0:.0f}s', flush=True); save()
    if a.ckdir: os.makedirs(a.ckdir, exist_ok=True); save(os.path.join(a.ckdir, f'ep{ep + 1}.bin')); print('checkpoint', os.path.join(a.ckdir, f'ep{ep + 1}.bin'), flush=True)
