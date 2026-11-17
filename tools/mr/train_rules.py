# Trains the "rules model": scores every legal move from human features, learns which move Stockfish (depth>=20) picks.
# input: rankdump2.js output files (gz ok). Reports top-1/2/3 on held-out positions and writes the learned points (per feature).
# python train_rules.py out.json files... [--hidden 0|32] [--max 600000]
import sys, gzip, json, numpy as np, argparse
ap = argparse.ArgumentParser(); ap.add_argument('out'); ap.add_argument('files', nargs='+'); ap.add_argument('--hidden', type=int, default=0)
ap.add_argument('--max', type=int, default=600000); ap.add_argument('--epochs', type=int, default=6); a = ap.parse_args()
KEYS = None; X = []; Y = []; PH = []; MM = 64
for fn in a.files:
    for l in (gzip.open(fn, 'rt') if fn.endswith('.gz') else open(fn)):
        if l.startswith('#KEYS'): KEYS = l.rstrip('\n').split('\t')[1].split(','); continue
        if len(X) >= a.max: break
        fen, ph, rows = l.rstrip('\n').split('\t'); rows = rows.split(' ')[:MM]
        x = np.zeros((MM, 0), np.float16); feats = []; y = -1
        for j, r in enumerate(rows):
            u, g, v = r.split(':', 2); feats.append([float(t) if t else 0.0 for t in v.split(',')])
            if g == '1': y = j
        if y < 0: continue
        f = np.zeros((MM, len(feats[0]) + 1), np.float16); f[:len(feats), :-1] = feats; f[:len(feats), -1] = 1  # last col = "legal move" mask
        X.append(f); Y.append(y); PH.append(min(int(ph), 24) / 24)
X = np.stack(X).astype(np.float32); Y = np.array(Y); PH = np.array(PH, np.float32); N, _, D1 = X.shape; D = D1 - 1
mask = X[:, :, -1] > 0; F = X[:, :, :-1]
F = np.concatenate([F, F * PH[:, None, None]], 2)  # each feature also scaled by game phase (opening vs endgame weight)
mu = F[mask].mean(0); sd = F[mask].std(0) + 1e-6; F = (F - mu) / sd * mask[:, :, None]
names = KEYS + [k + '*opening' for k in KEYS]
rng = np.random.default_rng(0); idx = rng.permutation(N); te = idx[:N // 10]; tr = idx[N // 10:]
print('positions', N, 'features', F.shape[2], 'moves/pos', mask.sum(1).mean().round(1), flush=True)
import torch
dev = 'cuda' if torch.cuda.is_available() else 'cpu'
Ft = torch.tensor(F, device=dev); Mt = torch.tensor(mask, device=dev); Yt = torch.tensor(Y, device=dev)
H = a.hidden; Dn = F.shape[2]
W = torch.nn.Linear(Dn, 1) if H == 0 else torch.nn.Sequential(torch.nn.Linear(Dn, H), torch.nn.ReLU(), torch.nn.Linear(H, 1))
W = W.to(dev); opt = torch.optim.Adam(W.parameters(), lr=3e-3)
def logits(ii): z = W(Ft[ii]).squeeze(-1); return z.masked_fill(~Mt[ii], -1e9)
def topk(ii):
    with torch.no_grad():
        r = {}; z = torch.cat([logits(ii[i:i + 20000]) for i in range(0, len(ii), 20000)])
        o = z.argsort(1, descending=True); yy = Yt[ii]
        for k in (1, 2, 3, 5): r[k] = round(100 * (o[:, :k] == yy[:, None]).any(1).float().mean().item(), 2)
        return r
trt = torch.tensor(tr, device=dev); tet = torch.tensor(te, device=dev)
for ep in range(a.epochs):
    p = trt[torch.randperm(len(trt), device=dev)]
    for i in range(0, len(p), 4096):
        b = p[i:i + 4096]; loss = torch.nn.functional.cross_entropy(logits(b), Yt[b]); opt.zero_grad(); loss.backward(); opt.step()
    print('epoch', ep, 'loss', round(loss.item(), 4), 'held-out top-k %', topk(tet), flush=True)
res = {'positions': int(N), 'hidden': H, 'heldout_topk': topk(tet), 'train_topk': topk(trt[:50000])}
if H == 0:
    w = W.weight.detach().cpu().numpy()[0] / sd  # points per raw feature unit
    res['points'] = sorted([[n, round(float(v), 3)] for n, v in zip(names, w)], key=lambda t: -abs(t[1]))
json.dump(res, open(a.out, 'w'), indent=1); print(json.dumps({k: res[k] for k in ('positions', 'heldout_topk')}))
