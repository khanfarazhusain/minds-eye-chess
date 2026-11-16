# Feature indices for FHK-Net v2 computed from packed boards (featpack.c records), for numpy or torch alike.
# Same as train3.c unpackM: own-king bucket (4 by rank, or 16 by square), file mirror when king on a-d, 8 output buckets by piece count.
KBM16 = [0,1,2,3, 4,5,6,7, 8,8,9,9, 10,10,11,11, 12,12,13,13, 12,12,13,13, 14,14,15,15, 14,14,15,15]
KBM4 = [0]*4 + [1]*4 + [2]*8 + [3]*16
def feats(xp, b32, kb, mirror=None, table=None):
    """b32: (N,32) uint8 nibble boards (a1=0). Returns F, G as (N,64) int64 with pad index kb*768 for empty squares, n (N,), ob (N,)."""
    lo = b32 & 15; hi = b32 >> 4
    v = xp.stack([lo, hi], 2).reshape(b32.shape[0], 64)            # square sq = 2*i + (0 lo, 1 hi)
    TH = xp.__name__ == 'torch'
    v = v.long() if TH else v.astype('int64')
    N = v.shape[0]; ar = xp.arange(64, device=v.device) if TH else xp.arange(64)
    sq = ar.reshape(1, 64).expand(N, 64) if TH else xp.broadcast_to(ar.reshape(1, 64), (N, 64))
    if mirror is not None: sq = sq ^ (7 * mirror.reshape(N, 1))   # AUG: flip files a<->h for marked rows (pieces move with it)
    occ = v > 0; pc = v - 1; col = pc // 6; t = pc % 6
    wk = (sq * (v == 6)).sum(1); bkr = (sq * (v == 12)).sum(1) ^ 56
    if table is None: table = KBM16 if kb == 16 else KBM4
    T = xp.tensor(table, device=v.device) if TH else xp.array(table)
    def kbs(s):
        if kb == 16: return T[(s >> 3) * 4 + (((s & 7) ^ ((s & 7) < 4) * 7) - 4)]
        return T[(s >> 3) * 4]
    wm = ((wk & 7) < 4) * 7; bm = ((bkr & 7) < 4) * 7
    PAD = kb * 768
    f = (kbs(wk) * 768).reshape(N, 1) + pc * 64 + (sq ^ wm.reshape(N, 1))
    g = (kbs(bkr) * 768).reshape(N, 1) + ((1 - col) * 6 + t) * 64 + ((sq ^ 56) ^ bm.reshape(N, 1))
    F = xp.where(occ, f, PAD); G = xp.where(occ, g, PAD)
    n = occ.sum(1); ob = ((n - 2) // 4).clamp(0, 7) if TH else xp.clip((n - 2) // 4, 0, 7)
    return F, G, n, ob
