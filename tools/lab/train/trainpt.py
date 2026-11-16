# FHK-Net v2 GPU trainer (PyTorch). Same net and .bin format as train3.c, so CPU and GPU training can resume from each other.
# Input: feature dump made by train3.c (DUMP=feat.bin ./train3 x 0 LAMBDA files...).  Usage:
#   python trainpt.py feat.bin out.bin --epochs 4 --lr 5e-4 --kb 4 --h 512 [--init nets/current.bin]
import argparse, struct, time, numpy as np, torch
ap = argparse.ArgumentParser(); ap.add_argument('feat'); ap.add_argument('out'); ap.add_argument('--epochs', type=int, default=4)
ap.add_argument('--lr', type=float, default=1e-3); ap.add_argument('--kb', type=int, default=4); ap.add_argument('--h', type=int, default=512)
ap.add_argument('--init', default=None); ap.add_argument('--bs', type=int, default=16384); a = ap.parse_args()
KB, H, OB = a.kb, a.h, 8; NF = KB * 768; CS = 0.98 * 2.302585
dev = 'cuda' if torch.cuda.is_available() else 'cpu'; print('device', dev, flush=True)
with open(a.feat, 'rb') as f: ND = struct.unpack('<q', f.read(8))[0]
rec = np.dtype([('f', '<u2', 32), ('g', '<u2', 32), ('stm', 'u1'), ('ob', 'u1'), ('n', 'u1'), ('pad', 'u1'), ('t', '<f4')])
D = np.memmap(a.feat, dtype=rec, mode='r', offset=8, shape=(ND,)); NV = ND // 50; NT = ND - NV; print('positions', ND, flush=True)
def T(x, dt): return torch.from_numpy(np.ascontiguousarray(x)).to(dev, dt)
Fw, Fb = T(D['f'], torch.int32), T(D['g'], torch.int32); STM, OBt, TG = T(D['stm'], torch.bool), T(D['ob'], torch.int64), T(D['t'], torch.float32)
rng = np.random.default_rng(12345)
W1 = torch.zeros(NF + 1, H); B1 = torch.zeros(H); W2 = torch.zeros(OB, 2 * H); B2 = torch.zeros(OB)
W1[:NF] = torch.from_numpy((rng.random((NF, H)) - 0.5) * 0.2); B1[:] = torch.from_numpy(0.1 + (rng.random(H) - 0.5) * 0.05); W2[:] = torch.from_numpy((rng.random((OB, 2 * H)) - 0.5) * 0.1)
if a.init:
    b = open(a.init, 'rb').read(); hh = struct.unpack('<i', b[:4])[0]
    if hh == H:  # v1 net -> copy into every king bucket and output bucket
        v = np.frombuffer(b, '<f4', offset=4); w1 = v[:768 * H].reshape(768, H); o = 768 * H
        for k in range(KB): W1[k * 768:(k + 1) * 768] = torch.from_numpy(w1)
        B1[:] = torch.from_numpy(v[o:o + H]); o += H; W2[:] = torch.from_numpy(v[o:o + 2 * H]); o += 2 * H; B2[:] = float(v[o]); print('init v1', a.init)
    elif hh == -H:
        kb = struct.unpack('<i', b[4:8])[0]; assert kb == KB, 'KB mismatch'; v = np.frombuffer(b, '<f4', offset=8); o = NF * H
        W1[:NF] = torch.from_numpy(v[:o].reshape(NF, H)); B1[:] = torch.from_numpy(v[o:o + H]); o += H
        W2[:] = torch.from_numpy(v[o:o + OB * 2 * H].reshape(OB, 2 * H)); o += OB * 2 * H; B2[:] = torch.from_numpy(v[o:o + OB].copy()); print('init v2', a.init)
P = [torch.nn.Parameter(x.to(dev)) for x in (W1, B1, W2, B2)]; W1, B1, W2, B2 = P
with torch.no_grad(): W1[NF].zero_()
opt = torch.optim.Adam(P, lr=a.lr, betas=(0.9, 0.999), eps=1e-8)
def fwd(idx):
    ew = torch.nn.functional.embedding(Fw[idx], W1).sum(1) + B1; eb = torch.nn.functional.embedding(Fb[idx], W1).sum(1) + B1
    s = STM[idx].unsqueeze(1); u = torch.where(s, eb, ew).clamp(0, 1); t = torch.where(s, ew, eb).clamp(0, 1)
    ob = OBt[idx]; w2 = W2[ob]; return (u * w2[:, :H]).sum(1) + (t * w2[:, H:]).sum(1) + B2[ob]
def save():
    with torch.no_grad():
        out = struct.pack('<ii', -H, KB) + W1[:NF].cpu().numpy().astype('<f4').tobytes() + B1.cpu().numpy().astype('<f4').tobytes() + W2.cpu().numpy().astype('<f4').tobytes() + B2.cpu().numpy().astype('<f4').tobytes()
    open(a.out, 'wb').write(out)
for ep in range(a.epochs):
    if ep == int(a.epochs * 0.6) or ep == int(a.epochs * 0.85):
        for g in opt.param_groups: g['lr'] *= 0.3
    t0 = time.time(); perm = torch.randperm(NT, device=dev); tl = 0.0
    for i in range(0, NT, a.bs):
        idx = perm[i:i + a.bs]; pr = torch.sigmoid(fwd(idx) * CS); loss = ((pr - TG[idx]) ** 2).mean()
        opt.zero_grad(set_to_none=True); loss.backward()
        with torch.no_grad(): W1.grad[NF].zero_()
        opt.step()
        with torch.no_grad(): W2.clamp_(-2, 2); W1[NF].zero_()
        tl += loss.item() * len(idx)
    with torch.no_grad():
        vl = 0.0
        for i in range(NT, ND, 65536):
            idx = torch.arange(i, min(i + 65536, ND), device=dev); vl += ((torch.sigmoid(fwd(idx) * CS) - TG[idx]) ** 2).sum().item()
    print(f'epoch {ep} train {tl / NT:.6f} valid {vl / NV:.6f} lr {opt.param_groups[0]["lr"]:g} {time.time() - t0:.0f}s', flush=True); save()
