// FHK Engine core (search + eval) ported 1:1 from me-engine.js to C for WebAssembly. Own code.
typedef int i32; typedef unsigned int u32; typedef signed char i8; typedef short i16; typedef unsigned char u8;
#define PAWN 1
#define KNIGHT 2
#define BISHOP 3
#define ROOK 4
#define QUEEN 5
#define KING 6
#define WHITE 0
#define BLACK 8
#define OFF 7
#define MATE 30000
#define MATE_BOUND 29000
#define INF 32000
#define MAXPLY 128
#ifndef TL
#define TL
#endif
#define F_CAP 1
#define F_EP 2
#define F_CASTLE 4
#define F_DOUBLE 8
#define TT_EXACT 1
#define TT_LOWER 2
#define TT_UPPER 3
extern double host_now(void);
#ifndef NATIVE
typedef unsigned long size_t;
void *memset(void *d, int c, size_t n) { unsigned char *p = d; while (n--) *p++ = (unsigned char)c; return d; }
void *memcpy(void *d, const void *s, size_t n) { unsigned char *p = d; const unsigned char *q = s; while (n--) *p++ = *q++; return d; }
#endif
extern void host_iter(i32 depth, i32 score, i32 nodes, i32 pvlen);
static double logd(double x){ // natural log, enough precision for floor() of the lmr table
  if (x <= 0) return -1e300; int k = 0; while (x > 1.5) { x /= 2.718281828459045; k++; } while (x < 0.5) { x *= 2.718281828459045; k--; }
  double y = (x - 1) / (x + 1), y2 = y * y, s = 0, t = y; for (int i = 1; i < 60; i += 2) { s += t / i; t *= y2; } return 2 * s + k; }
static const i32 SEEVAL[7] = {0, 100, 320, 330, 500, 950, 20000};
static const i32 N_OFF[8] = {-21, -19, -12, -8, 8, 12, 19, 21}, K_OFF[8] = {-11, -10, -9, -1, 1, 9, 10, 11}, B_OFF[4] = {-11, -9, 9, 11}, R_OFF[4] = {-10, -1, 1, 10};
static const i32 PHASEW[7] = {0, 0, 1, 1, 2, 4, 0};
static i8 FILE_T[120], ROW_T[120];
#define fileOf(s) FILE_T[s]
#define rowOf(s) ROW_T[s]
#define sqOf(f, r) (21 + (f) + 10 * (r))
i32 PST_MG[16][120], PST_EG[16][120]; // filled from JS (exact same tables)
static i32 ZL[16][120], ZH[16][120], ZSL, ZSH, ZCL[16], ZCH[16], ZEL[120], ZEH[120];
static u8 CMASK[120];
typedef unsigned long long u64;
static u8 SQ64[120], SQ120[64]; static TL u64 occ[2];
#define OSET(s, c) (occ[(c) >> 3] |= 1ULL << SQ64[s], pbb[c] |= 1ULL << SQ64[s])
#define OCLR(s, c) (occ[(c) >> 3] &= ~(1ULL << SQ64[s]), pbb[c] &= ~(1ULL << SQ64[s]))
static TL u64 pbb[16]; static u64 KNA[64], KGA[64], PAA[2][64], RAY[8][64];
static const int RDR[8] = {-1, 1, 0, 0, -1, -1, 1, 1}, RDF[8] = {0, 0, 1, -1, 1, -1, 1, -1}; // N S E W NE NW SE SW (r=0 is rank 8)
static const int RPOS[8] = {0, 1, 1, 0, 0, 0, 1, 1}; // direction increases the 64-index
static void bbInit(void) {
  for (int sq = 0; sq < 64; sq++) { int r = sq >> 3, f = sq & 7; KNA[sq] = KGA[sq] = 0; PAA[0][sq] = PAA[1][sq] = 0;
    static const int nr[8] = {-2, -2, -1, -1, 1, 1, 2, 2}, nf[8] = {-1, 1, -2, 2, -2, 2, -1, 1};
    for (int i = 0; i < 8; i++) { int a = r + nr[i], b = f + nf[i]; if (a >= 0 && a < 8 && b >= 0 && b < 8) KNA[sq] |= 1ULL << (a * 8 + b); }
    for (int dr = -1; dr <= 1; dr++) for (int df = -1; df <= 1; df++) { if (!dr && !df) continue; int a = r + dr, b = f + df; if (a >= 0 && a < 8 && b >= 0 && b < 8) KGA[sq] |= 1ULL << (a * 8 + b); }
    for (int df = -1; df <= 1; df += 2) { int b = f + df; if (b < 0 || b > 7) continue; if (r > 0) PAA[0][sq] |= 1ULL << ((r - 1) * 8 + b); if (r < 7) PAA[1][sq] |= 1ULL << ((r + 1) * 8 + b); }
    for (int d = 0; d < 8; d++) { u64 m = 0; int a = r + RDR[d], b = f + RDF[d]; while (a >= 0 && a < 8 && b >= 0 && b < 8) { m |= 1ULL << (a * 8 + b); a += RDR[d]; b += RDF[d]; } RAY[d][sq] = m; } } }
static inline u64 rayA(int d, int sq, u64 o) { u64 a = RAY[d][sq], b = a & o; if (b) { int k = RPOS[d] ? __builtin_ctzll(b) : 63 - __builtin_clzll(b); a ^= RAY[d][k]; } return a; }
static inline u64 bishA(int sq, u64 o) { return rayA(4, sq, o) | rayA(5, sq, o) | rayA(6, sq, o) | rayA(7, sq, o); }
static inline u64 rookA(int sq, u64 o) { return rayA(0, sq, o) | rayA(1, sq, o) | rayA(2, sq, o) | rayA(3, sq, o); }
#define FOR_OCC(bb, s) for (u64 _b = (bb); _b; _b &= _b - 1) for (i32 s = SQ120[__builtin_ctzll(_b)], _o = 1; _o; _o = 0)
#define mFrom(m) ((m) & 127)
#define mTo(m) (((m) >> 7) & 127)
#define mPromo(m) (((m) >> 14) & 7)
#define mFlag(m) (((m) >> 17) & 15)
#define mk(f, t, pr, fl) ((f) | ((t) << 7) | ((pr) << 14) | ((fl) << 17))
static i32 EP[43] = {7, 2, 12, 24, 0, 0, 1, 15, 71, 34, 32, 24, 50, 71, 39, 12, 8, 13, 5, 5, 3, 2, 6, 4, 4, 4, 41, 35, 40, 44, 17, 8, 16, 20, 0, 2, 0, 0, 14, 20, 90, 0, 520};
static i32 PASSED_MG[8], PASSED_EG[8], MOB_MG[7], MOB_EG[7], KS_W[7];
static u8 KZONE[241];
// ---- position ----
TL i8 B[120]; TL i32 side, castle, ep, half, hl, hh, mg, eg, phase, kingSq[2];
static TL i32 stk[(MAXPLY + 1100) * 10]; static TL i32 sp = 0;
TL i32 hist[2048]; TL i32 nhist = 0;
static u32 seed = 0x9E3779B9u;
static i32 rnd(void) { seed ^= seed << 13; seed ^= seed >> 17; seed ^= seed << 5; return (i32)seed; }
static i32 rndH(void) { u32 x = (u32)rnd(); x = (x ^ (x >> 16)) * 0x85ebca6bu; x = (x ^ (x >> 13)) * 0xc2b2ae35u; x ^= x >> 16; return (i32)x; }
static i32 imax(i32 a, i32 b) { return a > b ? a : b; } static i32 imin(i32 a, i32 b) { return a < b ? a : b; } static i32 iabs(i32 a) { return a < 0 ? -a : a; }
void init(void) {
  for (int s = 0; s < 120; s++) { FILE_T[s] = (s % 10) - 1; ROW_T[s] = (s / 10) - 2; } for (int r = 0; r < 8; r++) for (int f = 0; f < 8; f++) { SQ64[sqOf(f, r)] = r * 8 + f; SQ120[r * 8 + f] = sqOf(f, r); }
  for (int p = 0; p < 16; p++) for (int s = 0; s < 120; s++) { ZL[p][s] = rnd(); ZH[p][s] = rndH(); }
  ZSL = rnd(); ZSH = rndH(); for (int i = 0; i < 16; i++) { ZCL[i] = rnd(); ZCH[i] = rndH(); } for (int s = 0; s < 120; s++) { ZEL[s] = rnd(); ZEH[s] = rndH(); }
  for (int s = 0; s < 120; s++) CMASK[s] = 15;
  CMASK[95] = 15 & ~3; CMASK[98] = 15 & ~1; CMASK[91] = 15 & ~2; CMASK[25] = 15 & ~12; CMASK[28] = 15 & ~4; CMASK[21] = 15 & ~8;
  for (int i = 1; i <= 6; i++) { PASSED_MG[i] = EP[4 + i - 1]; PASSED_EG[i] = EP[10 + i - 1]; }
  for (int t = 2; t <= 5; t++) { MOB_MG[t] = EP[18 + t - 2]; MOB_EG[t] = EP[22 + t - 2]; KS_W[t] = EP[26 + t - 2]; }
  bbInit();
  int dd[9] = {-11, -10, -9, -1, 0, 1, 9, 10, 11}; for (int i = 0; i < 9; i++) KZONE[dd[i] + 120] = 1;
}
extern i32 useNN; static TL i32 nnRec; static void nnFull(i32 L);
void recompute(void) { // after JS filled B, side, castle, ep, half
  i32 l = 0, h = 0, m = 0, e = 0, ph = 0; kingSq[0] = kingSq[1] = 0; occ[0] = occ[1] = 0; for (int i = 0; i < 16; i++) pbb[i] = 0;
  for (int s = 21; s < 99; s++) { i32 p = B[s]; if (p == 0 || p == OFF) continue; l ^= ZL[p][s]; h ^= ZH[p][s]; m += PST_MG[p][s]; e += PST_EG[p][s]; ph += PHASEW[p & 7]; OSET(s, p); if ((p & 7) == KING) kingSq[p >> 3] = s; }
  if (side == BLACK) { l ^= ZSL; h ^= ZSH; } l ^= ZCL[castle]; h ^= ZCH[castle]; if (ep) { l ^= ZEL[ep]; h ^= ZEH[ep]; }
  hl = l; hh = h; mg = m; eg = e; phase = ph; sp = 0; nnRec = useNN; if (useNN) nnFull(0);
}
i32 get_hl(void) { return hl; } i32 get_hh(void) { return hh; }
#ifdef BBATT
static int attacked(i32 s, i32 by) { i32 sq = SQ64[s], c = by >> 3; u64 o = occ[0] | occ[1];
  if ((PAA[c ^ 1][sq] & pbb[PAWN | by]) || (KNA[sq] & pbb[KNIGHT | by]) || (KGA[sq] & pbb[KING | by])) return 1;
  u64 q = pbb[QUEEN | by]; if (bishA(sq, o) & (pbb[BISHOP | by] | q)) return 1; if (rookA(sq, o) & (pbb[ROOK | by] | q)) return 1; return 0; }
#else
static int attacked(i32 s, i32 by) {
  if (by == WHITE) { if (B[s + 9] == PAWN || B[s + 11] == PAWN) return 1; } else { if (B[s - 9] == (PAWN | 8) || B[s - 11] == (PAWN | 8)) return 1; }
  i32 n = KNIGHT | by, k = KING | by, bq = BISHOP | by, rq = ROOK | by, q = QUEEN | by;
  for (int i = 0; i < 8; i++) { if (B[s + N_OFF[i]] == n) return 1; if (B[s + K_OFF[i]] == k) return 1; }
  for (int i = 0; i < 4; i++) { i32 d = B_OFF[i], t = s + d, p; while ((p = B[t]) == 0) t += d; if (p == bq || p == q) return 1; d = R_OFF[i]; t = s + d; while ((p = B[t]) == 0) t += d; if (p == rq || p == q) return 1; }
  return 0;
}
#endif
static int inCheck(void) { return attacked(kingSq[side >> 3], side ^ 8); }
#ifdef GENBB
#ifdef GENCHECK
#define gen genBBi
#endif
static i32 gen(i32 *out, i32 n, int capsOnly) {
  i32 us = side, them = us ^ 8, c = us >> 3; u64 own = occ[c], opp = occ[c ^ 1], all = own | opp;
  i32 fwd = us == WHITE ? -8 : 8, startR = us == WHITE ? 6 : 1, promoR = us == WHITE ? 0 : 7;
  for (u64 b = pbb[PAWN | us]; b; b &= b - 1) { i32 sq = __builtin_ctzll(b), s = SQ120[sq], one = sq + fwd; int promo = (one >> 3) == promoR;
    if (!(all >> one & 1)) { i32 t1 = SQ120[one]; if (promo) { for (int pr = QUEEN; pr >= KNIGHT; pr--) out[n++] = mk(s, t1, pr, 0); }
      else if (!capsOnly) { out[n++] = mk(s, t1, 0, 0); if ((sq >> 3) == startR && !(all >> (one + fwd) & 1)) out[n++] = mk(s, SQ120[one + fwd], 0, F_DOUBLE); } }
    for (u64 a = PAA[c][sq] & opp; a; a &= a - 1) { i32 t = SQ120[__builtin_ctzll(a)]; if (promo) { for (int pr = QUEEN; pr >= KNIGHT; pr--) out[n++] = mk(s, t, pr, F_CAP); } else out[n++] = mk(s, t, 0, F_CAP); }
    if (ep && (PAA[c][sq] >> SQ64[ep] & 1)) out[n++] = mk(s, ep, 0, F_CAP | F_EP); }
  u64 tgt = capsOnly ? opp : ~own;
  for (int t = KNIGHT; t <= KING; t++) for (u64 b = pbb[t | us]; b; b &= b - 1) { i32 sq = __builtin_ctzll(b), s = SQ120[sq]; u64 a;
    if (t == KNIGHT) a = KNA[sq]; else if (t == BISHOP) a = bishA(sq, all); else if (t == ROOK) a = rookA(sq, all); else if (t == QUEEN) a = bishA(sq, all) | rookA(sq, all); else a = KGA[sq];
    for (a &= tgt; a; a &= a - 1) { i32 x = __builtin_ctzll(a); out[n++] = mk(s, SQ120[x], 0, (opp >> x & 1) ? F_CAP : 0); }
    if (t == KING && !capsOnly) {
      if (us == WHITE && s == 95) {
        if ((castle & 1) && B[96] == 0 && B[97] == 0 && B[98] == ROOK && !attacked(95, BLACK) && !attacked(96, BLACK) && !attacked(97, BLACK)) out[n++] = mk(95, 97, 0, F_CASTLE);
        if ((castle & 2) && B[94] == 0 && B[93] == 0 && B[92] == 0 && B[91] == ROOK && !attacked(95, BLACK) && !attacked(94, BLACK) && !attacked(93, BLACK)) out[n++] = mk(95, 93, 0, F_CASTLE);
      } else if (us == BLACK && s == 25) {
        if ((castle & 4) && B[26] == 0 && B[27] == 0 && B[28] == (ROOK | 8) && !attacked(25, WHITE) && !attacked(26, WHITE) && !attacked(27, WHITE)) out[n++] = mk(25, 27, 0, F_CASTLE);
        if ((castle & 8) && B[24] == 0 && B[23] == 0 && B[22] == 0 && B[21] == (ROOK | 8) && !attacked(25, WHITE) && !attacked(24, WHITE) && !attacked(23, WHITE)) out[n++] = mk(25, 23, 0, F_CASTLE);
      } } }
  (void)them; return n;
}
#ifdef GENCHECK
#undef gen
static i32 genMB(i32 *out, i32 n, int capsOnly);
static int cmpi(const void *a, const void *b) { return *(const i32 *)a - *(const i32 *)b; }
static TL long gcBad = 0, gcN = 0;
static i32 gen(i32 *out, i32 n, int capsOnly) { static TL i32 x[512], y[512]; i32 k = genBBi(out, n, capsOnly), k2 = genMB(x, 0, capsOnly);
  gcN++; if (k - n != k2) gcBad++; else { for (int i = 0; i < k2; i++) y[i] = out[n + i]; qsort(x, k2, 4, cmpi); qsort(y, k2, 4, cmpi); for (int i = 0; i < k2; i++) if (x[i] != y[i]) { gcBad++; break; } }
  return k; }
static i32 genMB(i32 *out, i32 n, int capsOnly) {
  i32 us = side, them = us ^ 8, fwd = us == WHITE ? -10 : 10, startRow = us == WHITE ? 6 : 1, promoRow = us == WHITE ? 0 : 7;
  FOR_OCC(occ[us >> 3], s) {
    i32 p = B[s]; i32 t = p & 7;
    if (t == PAWN) { i32 one = s + fwd; int promo = rowOf(one) == promoRow;
      if (B[one] == 0) { if (promo) { for (int pr = QUEEN; pr >= KNIGHT; pr--) out[n++] = mk(s, one, pr, 0); } else if (!capsOnly) { out[n++] = mk(s, one, 0, 0); if (rowOf(s) == startRow && B[one + fwd] == 0) out[n++] = mk(s, one + fwd, 0, F_DOUBLE); } }
      for (int k = 0; k < 2; k++) { i32 to = s + fwd - 1 + 2 * k, q = B[to];
        if (q != 0 && q != OFF && (q & 8) == them) { if (promo) { for (int pr = QUEEN; pr >= KNIGHT; pr--) out[n++] = mk(s, to, pr, F_CAP); } else out[n++] = mk(s, to, 0, F_CAP); }
        else if (to == ep && ep) out[n++] = mk(s, to, 0, F_CAP | F_EP); }
      continue; }
    if (t == KNIGHT || t == KING) { const i32 *offs = t == KNIGHT ? N_OFF : K_OFF;
      for (int i = 0; i < 8; i++) { i32 to = s + offs[i], q = B[to]; if (q == 0) { if (!capsOnly) out[n++] = mk(s, to, 0, 0); } else if (q != OFF && (q & 8) == them) out[n++] = mk(s, to, 0, F_CAP); }
      if (t == KING && !capsOnly) {
        if (us == WHITE && s == 95) {
          if ((castle & 1) && B[96] == 0 && B[97] == 0 && B[98] == ROOK && !attacked(95, BLACK) && !attacked(96, BLACK) && !attacked(97, BLACK)) out[n++] = mk(95, 97, 0, F_CASTLE);
          if ((castle & 2) && B[94] == 0 && B[93] == 0 && B[92] == 0 && B[91] == ROOK && !attacked(95, BLACK) && !attacked(94, BLACK) && !attacked(93, BLACK)) out[n++] = mk(95, 93, 0, F_CASTLE);
        } else if (us == BLACK && s == 25) {
          if ((castle & 4) && B[26] == 0 && B[27] == 0 && B[28] == (ROOK | 8) && !attacked(25, WHITE) && !attacked(26, WHITE) && !attacked(27, WHITE)) out[n++] = mk(25, 27, 0, F_CASTLE);
          if ((castle & 8) && B[24] == 0 && B[23] == 0 && B[22] == 0 && B[21] == (ROOK | 8) && !attacked(25, WHITE) && !attacked(24, WHITE) && !attacked(23, WHITE)) out[n++] = mk(25, 23, 0, F_CASTLE);
        } }
      continue; }
    const i32 *dirs = t == BISHOP ? B_OFF : t == ROOK ? R_OFF : K_OFF; int nd = t == QUEEN ? 8 : 4;
    for (int i = 0; i < nd; i++) { i32 d = dirs[i], to = s + d, q; while ((q = B[to]) == 0) { if (!capsOnly) out[n++] = mk(s, to, 0, 0); to += d; } if (q != OFF && (q & 8) == them) out[n++] = mk(s, to, 0, F_CAP); }
  }
  return n;
}
#endif
#else
static i32 gen(i32 *out, i32 n, int capsOnly) {
  i32 us = side, them = us ^ 8, fwd = us == WHITE ? -10 : 10, startRow = us == WHITE ? 6 : 1, promoRow = us == WHITE ? 0 : 7;
  FOR_OCC(occ[us >> 3], s) {
    i32 p = B[s]; i32 t = p & 7;
    if (t == PAWN) { i32 one = s + fwd; int promo = rowOf(one) == promoRow;
      if (B[one] == 0) { if (promo) { for (int pr = QUEEN; pr >= KNIGHT; pr--) out[n++] = mk(s, one, pr, 0); } else if (!capsOnly) { out[n++] = mk(s, one, 0, 0); if (rowOf(s) == startRow && B[one + fwd] == 0) out[n++] = mk(s, one + fwd, 0, F_DOUBLE); } }
      for (int k = 0; k < 2; k++) { i32 to = s + fwd - 1 + 2 * k, q = B[to];
        if (q != 0 && q != OFF && (q & 8) == them) { if (promo) { for (int pr = QUEEN; pr >= KNIGHT; pr--) out[n++] = mk(s, to, pr, F_CAP); } else out[n++] = mk(s, to, 0, F_CAP); }
        else if (to == ep && ep) out[n++] = mk(s, to, 0, F_CAP | F_EP); }
      continue; }
    if (t == KNIGHT || t == KING) { const i32 *offs = t == KNIGHT ? N_OFF : K_OFF;
      for (int i = 0; i < 8; i++) { i32 to = s + offs[i], q = B[to]; if (q == 0) { if (!capsOnly) out[n++] = mk(s, to, 0, 0); } else if (q != OFF && (q & 8) == them) out[n++] = mk(s, to, 0, F_CAP); }
      if (t == KING && !capsOnly) {
        if (us == WHITE && s == 95) {
          if ((castle & 1) && B[96] == 0 && B[97] == 0 && B[98] == ROOK && !attacked(95, BLACK) && !attacked(96, BLACK) && !attacked(97, BLACK)) out[n++] = mk(95, 97, 0, F_CASTLE);
          if ((castle & 2) && B[94] == 0 && B[93] == 0 && B[92] == 0 && B[91] == ROOK && !attacked(95, BLACK) && !attacked(94, BLACK) && !attacked(93, BLACK)) out[n++] = mk(95, 93, 0, F_CASTLE);
        } else if (us == BLACK && s == 25) {
          if ((castle & 4) && B[26] == 0 && B[27] == 0 && B[28] == (ROOK | 8) && !attacked(25, WHITE) && !attacked(26, WHITE) && !attacked(27, WHITE)) out[n++] = mk(25, 27, 0, F_CASTLE);
          if ((castle & 8) && B[24] == 0 && B[23] == 0 && B[22] == 0 && B[21] == (ROOK | 8) && !attacked(25, WHITE) && !attacked(24, WHITE) && !attacked(23, WHITE)) out[n++] = mk(25, 23, 0, F_CASTLE);
        } }
      continue; }
    const i32 *dirs = t == BISHOP ? B_OFF : t == ROOK ? R_OFF : K_OFF; int nd = t == QUEEN ? 8 : 4;
    for (int i = 0; i < nd; i++) { i32 d = dirs[i], to = s + d, q; while ((q = B[to]) == 0) { if (!capsOnly) out[n++] = mk(s, to, 0, 0); to += d; } if (q != OFF && (q & 8) == them) out[n++] = mk(s, to, 0, F_CAP); }
  }
  return n;
}
#endif
// ---- FHK-Net (own neural eval): 768 -> NNH x2 -> 1, lazy incremental accumulators ----
#ifndef NNH
#define NNH 256
#endif
#define NNLV (MAXPLY + 1100)
#ifdef __wasm_simd128__
#include <wasm_simd128.h>
#endif
i32 nn_h(void) { return NNH; }
i32 useNN = 0; i16 NW1[768 * NNH], NB1[NNH], NW2[2 * NNH]; i32 NB2 = 0, nnOutMul = 400, nnOutDiv = 255 * 64;
static TL i16 nnAcc[NNLV][2][NNH]; static TL u8 nnOk[NNLV], nnNA[NNLV], nnNS[NNLV]; static TL i16 nnAdd[NNLV][4], nnSub[NNLV][4];
static inline i32 nnF(i32 s, i32 p) { return (((p >> 3) * 6 + (p & 7) - 1) << 6) + (SQ64[s] ^ 56); }
static inline i32 nnFlip(i32 f) { i32 ct = f >> 6, sq = f & 63, col = ct / 6, t = ct % 6; return (((1 - col) * 6 + t) << 6) + (sq ^ 56); }
#ifdef __wasm_simd128__
static inline void vadd2(i16 *a, i16 *b, const i16 *w, const i16 *v) { for (int j = 0; j < NNH; j += 8) { wasm_v128_store(a + j, wasm_i16x8_add(wasm_v128_load(a + j), wasm_v128_load(w + j))); wasm_v128_store(b + j, wasm_i16x8_add(wasm_v128_load(b + j), wasm_v128_load(v + j))); } }
static inline void vsub2(i16 *a, i16 *b, const i16 *w, const i16 *v) { for (int j = 0; j < NNH; j += 8) { wasm_v128_store(a + j, wasm_i16x8_sub(wasm_v128_load(a + j), wasm_v128_load(w + j))); wasm_v128_store(b + j, wasm_i16x8_sub(wasm_v128_load(b + j), wasm_v128_load(v + j))); } }
#else
static inline void vadd2(i16 *a, i16 *b, const i16 *w, const i16 *v) { for (int j = 0; j < NNH; j++) { a[j] += w[j]; b[j] += v[j]; } }
static inline void vsub2(i16 *a, i16 *b, const i16 *w, const i16 *v) { for (int j = 0; j < NNH; j++) { a[j] -= w[j]; b[j] -= v[j]; } }
#endif
static void nnFull(i32 L) { i16 *a = nnAcc[L][0], *b = nnAcc[L][1]; for (int j = 0; j < NNH; j++) { a[j] = NB1[j]; b[j] = NB1[j]; }
  FOR_OCC(occ[0] | occ[1], s) { i32 f = nnF(s, B[s]), g = nnFlip(f); vadd2(a, b, &NW1[f * NNH], &NW1[g * NNH]); } nnOk[L] = 1; }
static void nnUpdate(i32 L) { // make level L valid from earlier levels
  i32 k = L; while (!nnOk[k]) k--;
  for (i32 l = k + 1; l <= L; l++) { i16 *pa = nnAcc[l - 1][0], *pb = nnAcc[l - 1][1], *a = nnAcc[l][0], *b = nnAcc[l][1];
#ifdef __wasm_simd128__
    { const i16 *aw[4], *av[4], *sw[4], *sv[4]; i32 na = nnNA[l], ns = nnNS[l];
      for (int i = 0; i < na; i++) { i32 f = nnAdd[l][i]; aw[i] = &NW1[f * NNH]; av[i] = &NW1[nnFlip(f) * NNH]; }
      for (int i = 0; i < ns; i++) { i32 f = nnSub[l][i]; sw[i] = &NW1[f * NNH]; sv[i] = &NW1[nnFlip(f) * NNH]; }
      for (int j = 0; j < NNH; j += 8) { v128_t x = wasm_v128_load(pa + j), y = wasm_v128_load(pb + j);
        for (int i = 0; i < na; i++) { x = wasm_i16x8_add(x, wasm_v128_load(aw[i] + j)); y = wasm_i16x8_add(y, wasm_v128_load(av[i] + j)); }
        for (int i = 0; i < ns; i++) { x = wasm_i16x8_sub(x, wasm_v128_load(sw[i] + j)); y = wasm_i16x8_sub(y, wasm_v128_load(sv[i] + j)); }
        wasm_v128_store(a + j, x); wasm_v128_store(b + j, y); } }
#else
    for (int j = 0; j < NNH; j++) { a[j] = pa[j]; b[j] = pb[j]; }
    for (int i = 0; i < nnNA[l]; i++) { i32 f = nnAdd[l][i], g = nnFlip(f); vadd2(a, b, &NW1[f * NNH], &NW1[g * NNH]); }
    for (int i = 0; i < nnNS[l]; i++) { i32 f = nnSub[l][i], g = nnFlip(f); vsub2(a, b, &NW1[f * NNH], &NW1[g * NNH]); }
#endif
    nnOk[l] = 1; } }
static i32 nnEval(void) { i32 L = sp / 10; if (!nnOk[L]) nnUpdate(L);
  const i16 *u = nnAcc[L][side >> 3], *t = nnAcc[L][(side >> 3) ^ 1]; i32 sum = 0;
#ifdef __wasm_simd128__
  { v128_t z = wasm_i16x8_splat(0), c = wasm_i16x8_splat(255), acc = wasm_i32x4_splat(0);
    for (int j = 0; j < NNH; j += 8) { v128_t x = wasm_i16x8_min(wasm_i16x8_max(wasm_v128_load(u + j), z), c), y = wasm_i16x8_min(wasm_i16x8_max(wasm_v128_load(t + j), z), c);
      acc = wasm_i32x4_add(acc, wasm_i32x4_add(wasm_i32x4_dot_i16x8(x, wasm_v128_load(NW2 + j)), wasm_i32x4_dot_i16x8(y, wasm_v128_load(NW2 + NNH + j)))); }
    sum = wasm_i32x4_extract_lane(acc, 0) + wasm_i32x4_extract_lane(acc, 1) + wasm_i32x4_extract_lane(acc, 2) + wasm_i32x4_extract_lane(acc, 3); }
#else
  for (int j = 0; j < NNH; j++) { i32 x = u[j], y = t[j]; x = x < 0 ? 0 : x > 255 ? 255 : x; y = y < 0 ? 0 : y > 255 ? 255 : y; sum += x * NW2[j] + y * NW2[NNH + j]; }
#endif
  return (i32)(((long long)sum + NB2) * 400 / (255 * 1024)); }
static void put(i32 s, i32 p) { if (nnRec) { i32 L = sp / 10; nnAdd[L][nnNA[L]++] = nnF(s, p); } B[s] = p; OSET(s, p); hl ^= ZL[p][s]; hh ^= ZH[p][s]; mg += PST_MG[p][s]; eg += PST_EG[p][s]; }
static i32 del(i32 s) { i32 p = B[s]; if (nnRec) { i32 L = sp / 10; nnSub[L][nnNS[L]++] = nnF(s, p); } B[s] = 0; OCLR(s, p); hl ^= ZL[p][s]; hh ^= ZH[p][s]; mg -= PST_MG[p][s]; eg -= PST_EG[p][s]; return p; }
static void unmake(void);
static int make(i32 m) {
  i32 from = mFrom(m), to = mTo(m), fl = mFlag(m), pr = mPromo(m), us = side;
  i32 *st = &stk[sp]; st[0] = m; st[1] = castle; st[2] = ep; st[3] = half; st[4] = hl; st[5] = hh; st[6] = mg; st[7] = eg; st[8] = phase; st[9] = 0; sp += 10;
  hist[nhist++] = hl; { i32 L = sp / 10; nnOk[L] = 0; nnNA[L] = 0; nnNS[L] = 0; }
  i32 cap = 0;
  if (ep) { hl ^= ZEL[ep]; hh ^= ZEH[ep]; }
  if (fl & F_EP) { i32 cs = to + (us == WHITE ? 10 : -10); cap = del(cs); } else if (B[to]) cap = del(to);
  if (cap) phase -= PHASEW[cap & 7];
  st[9] = cap;
  i32 p = del(from);
  if (pr) { put(to, pr | us); phase += PHASEW[pr]; } else put(to, p);
  if ((p & 7) == KING) kingSq[us >> 3] = to;
  if (fl & F_CASTLE) { if (to == 97) put(96, del(98)); else if (to == 93) put(94, del(91)); else if (to == 27) put(26, del(28)); else if (to == 23) put(24, del(21)); }
  hl ^= ZCL[castle]; hh ^= ZCH[castle]; castle &= CMASK[from] & CMASK[to]; hl ^= ZCL[castle]; hh ^= ZCH[castle];
  ep = 0; if (fl & F_DOUBLE) { ep = (from + to) >> 1; hl ^= ZEL[ep]; hh ^= ZEH[ep]; }
  half = ((p & 7) == PAWN || cap) ? 0 : half + 1;
  side ^= 8; hl ^= ZSL; hh ^= ZSH;
  if (attacked(kingSq[us >> 3], side)) { unmake(); return 0; }
  return 1;
}
static void unmake(void) {
  sp -= 10; i32 *st = &stk[sp]; i32 cap = st[9]; phase = st[8]; eg = st[7]; mg = st[6]; hh = st[5]; hl = st[4]; half = st[3]; ep = st[2]; castle = st[1]; i32 m = st[0];
  nhist--; side ^= 8;
  i32 from = mFrom(m), to = mTo(m), fl = mFlag(m), us = side;
  i32 pt = B[to], p = pt; if (mPromo(m)) p = PAWN | us;
  B[from] = p; B[to] = 0; OCLR(to, pt); OSET(from, p);
  if ((p & 7) == KING) kingSq[us >> 3] = from;
  if (fl & F_EP) { i32 cs = to + (us == WHITE ? 10 : -10); B[cs] = cap; OSET(cs, cap); } else if (cap) { B[to] = cap; OSET(to, cap); }
  if (fl & F_CASTLE) { i32 rf, rt; if (to == 97) { rf = 98; rt = 96; } else if (to == 93) { rf = 91; rt = 94; } else if (to == 27) { rf = 28; rt = 26; } else { rf = 21; rt = 24; } i32 rk = B[rt]; B[rf] = rk; B[rt] = 0; OCLR(rt, rk); OSET(rf, rk); }
}
static void makeNull(void) { i32 *st = &stk[sp]; st[0] = 0; st[1] = castle; st[2] = ep; st[3] = half; st[4] = hl; st[5] = hh; st[6] = mg; st[7] = eg; st[8] = phase; st[9] = 0; sp += 10; { i32 L = sp / 10; nnOk[L] = 0; nnNA[L] = 0; nnNS[L] = 0; }
  hist[nhist++] = hl; if (ep) { hl ^= ZEL[ep]; hh ^= ZEH[ep]; ep = 0; } side ^= 8; hl ^= ZSL; hh ^= ZSH; half++; }
static void unmakeNull(void) { sp -= 10; i32 *st = &stk[sp]; phase = st[8]; eg = st[7]; mg = st[6]; hh = st[5]; hl = st[4]; half = st[3]; ep = st[2]; castle = st[1]; nhist--; side ^= 8; }
static int isRepetition(void) { i32 n = nhist, lim = imax(0, n - half); for (i32 i = n - 2; i >= lim; i -= 2) if (hist[i] == hl) return 1; return 0; }
static int insufficient(void) { int minors = 0; FOR_OCC(occ[0] | occ[1], s) { i32 t = B[s] & 7; if (t == PAWN || t == ROOK || t == QUEEN) return 0; if (t == KNIGHT || t == BISHOP) minors++; } return minors <= 1; }
static int nonPawnMat(i32 sd) { FOR_OCC(occ[sd >> 3], s) { i32 t = B[s] & 7; if (t >= KNIGHT && t <= QUEEN) return 1; } return 0; }
// ---- SEE ----
static i32 leastAttacker(i32 s, i32 sd) {
  if (sd == WHITE) { if (B[s + 9] == PAWN) return s + 9; if (B[s + 11] == PAWN) return s + 11; } else { if (B[s - 9] == (PAWN | 8)) return s - 9; if (B[s - 11] == (PAWN | 8)) return s - 11; }
  for (int i = 0; i < 8; i++) if (B[s + N_OFF[i]] == (KNIGHT | sd)) return s + N_OFF[i];
  i32 qq = 0, rr = 0;
  for (int i = 0; i < 4; i++) { i32 d = B_OFF[i], t = s + d, p; while ((p = B[t]) == 0) t += d; if (p == (BISHOP | sd)) return t; if (p == (QUEEN | sd)) qq = t;
    d = R_OFF[i]; t = s + d; while ((p = B[t]) == 0) t += d; if (p == (ROOK | sd)) rr = t; else if (p == (QUEEN | sd)) qq = t; }
  if (rr) return rr; if (qq) return qq;
  for (int i = 0; i < 8; i++) if (B[s + K_OFF[i]] == (KING | sd)) return s + K_OFF[i];
  return 0;
}
#ifdef SEEBB
static i32 see(i32 m) {
  i32 from = mFrom(m), to = mTo(m); if (mFlag(m) & F_CASTLE) return 0;
  i32 gain[40]; i32 d = 0, sd = side; i32 tq = SQ64[to];
  i32 captured = (mFlag(m) & F_EP) ? PAWN : (B[to] & 7); gain[0] = SEEVAL[captured];
  i32 attackerVal = mPromo(m) ? SEEVAL[mPromo(m)] : SEEVAL[B[from] & 7]; if (mPromo(m)) gain[0] += SEEVAL[mPromo(m)] - 100;
  u64 o = (occ[0] | occ[1]) & ~(1ULL << SQ64[from]);
  if (mFlag(m) & F_EP) o &= ~(1ULL << SQ64[to + (sd == WHITE ? 10 : -10)]);
  u64 diag = pbb[BISHOP] | pbb[BISHOP | 8] | pbb[QUEEN] | pbb[QUEEN | 8], orth = pbb[ROOK] | pbb[ROOK | 8] | pbb[QUEEN] | pbb[QUEEN | 8];
  u64 att = (PAA[1][tq] & pbb[PAWN]) | (PAA[0][tq] & pbb[PAWN | 8]) | (KNA[tq] & (pbb[KNIGHT] | pbb[KNIGHT | 8])) | (KGA[tq] & (pbb[KING] | pbb[KING | 8])) | (bishA(tq, o) & diag) | (rookA(tq, o) & orth);
  sd ^= 8;
  while (1) { att &= o; u64 mine = att & occ[sd >> 3]; if (!mine) break; i32 t, a = -1;
    for (t = PAWN; t <= KING; t++) { u64 bb = mine & pbb[t | sd]; if (bb) { a = __builtin_ctzll(bb); break; } }
    if (a < 0) break;
    d++; gain[d] = attackerVal - gain[d - 1]; if (imax(-gain[d - 1], gain[d]) < 0) break; attackerVal = SEEVAL[t];
    o &= ~(1ULL << a); if (t == PAWN || t == BISHOP || t == QUEEN) att |= bishA(tq, o) & diag; if (t == ROOK || t == QUEEN) att |= rookA(tq, o) & orth;
    sd ^= 8; if (d >= 30) break; }
  while (d > 0) { gain[d - 1] = -imax(-gain[d - 1], gain[d]); d--; }
  return gain[0];
}
#else
static i32 see(i32 m) {
  i32 from = mFrom(m), to = mTo(m); if (mFlag(m) & F_CASTLE) return 0;
  i32 gain[40], remS[40], remP[40]; int nr = 0; i32 d = 0, sd = side;
  i32 captured = (mFlag(m) & F_EP) ? PAWN : (B[to] & 7); gain[0] = SEEVAL[captured];
  i32 attackerVal = mPromo(m) ? SEEVAL[mPromo(m)] : SEEVAL[B[from] & 7]; if (mPromo(m)) gain[0] += SEEVAL[mPromo(m)] - 100;
  i32 saveTo = B[to]; remS[nr] = from; remP[nr++] = B[from]; B[from] = 0;
  if (mFlag(m) & F_EP) { i32 epSq = to + (sd == WHITE ? 10 : -10); remS[nr] = epSq; remP[nr++] = B[epSq]; B[epSq] = 0; }
  sd ^= 8;
  while (1) { i32 a = leastAttacker(to, sd); if (!a) break; d++; gain[d] = attackerVal - gain[d - 1]; if (imax(-gain[d - 1], gain[d]) < 0) break; attackerVal = SEEVAL[B[a] & 7]; remS[nr] = a; remP[nr++] = B[a]; B[a] = 0; sd ^= 8; if (d >= 30) break; }
  while (d > 0) { gain[d - 1] = -imax(-gain[d - 1], gain[d]); d--; }
  for (int i = nr - 1; i >= 0; i--) B[remS[i]] = remP[i]; B[to] = saveTo;
  return gain[0];
}
#endif
// ---- eval ----
static i32 kdist(i32 a, i32 c) { return imax(iabs(fileOf(a) - fileOf(c)), iabs(rowOf(a) - rowOf(c))); }
#define ECB 16
static TL i32 ecKey[1 << ECB], ecKey2[1 << ECB], ecVal[1 << ECB];
static i32 evaluate0(void);
static i32 evalRaw(void) { i32 i = hl & ((1 << ECB) - 1); if (ecKey[i] == hh && ecKey2[i] == hl) return ecVal[i]; i32 v = useNN ? nnEval() : evaluate0(); ecKey[i] = hh; ecKey2[i] = hl; ecVal[i] = v; return v; }
#ifdef FIFTY
i32 evaluate(void) { i32 v = evalRaw(); return half > 8 ? v * (200 - half) / 200 : v; }
#else
i32 evaluate(void) { return evalRaw(); }
#endif
static i32 evaluate0(void) {
  i32 m = mg, e = eg; i32 ph = imin(phase, 24);
  i8 wp[10] = {0}, bp[10] = {0}, wpMinRow[10], bpMaxRow[10], wpMaxRow[10], bpMinRow[10];
  for (int i = 0; i < 10; i++) { wpMinRow[i] = 9; bpMaxRow[i] = -1; wpMaxRow[i] = -1; bpMinRow[i] = 9; }
  int wb = 0, bb = 0;
  u64 all = occ[0] | occ[1], wAtt = 0, bAtt = 0;
  FOR_OCC(all, s) { i32 p = B[s]; i32 f = fileOf(s) + 1, r = rowOf(s);
    if (p == PAWN) { if (B[s - 9] != OFF) wAtt |= 1ULL << SQ64[s - 9]; if (B[s - 11] != OFF) wAtt |= 1ULL << SQ64[s - 11]; wp[f]++; if (r < wpMinRow[f]) wpMinRow[f] = r; if (r > wpMaxRow[f]) wpMaxRow[f] = r; }
    else if (p == (PAWN | 8)) { if (B[s + 9] != OFF) bAtt |= 1ULL << SQ64[s + 9]; if (B[s + 11] != OFF) bAtt |= 1ULL << SQ64[s + 11]; bp[f]++; if (r > bpMaxRow[f]) bpMaxRow[f] = r; if (r < bpMinRow[f]) bpMinRow[f] = r; }
    else if (p == BISHOP) wb++; else if (p == (BISHOP | 8)) bb++; }
  i32 pMG = 0, pEG = 0, passMG = 0, passEG = 0, mobMG = 0, mobEG = 0, ksW = 0, ksB = 0, rookMG = 0, rookEG = 0, bpair = 0, shieldW = 0, shieldB = 0;
  if (wb >= 2) bpair += 1; if (bb >= 2) bpair -= 1;
  i32 wk = kingSq[0], bk = kingSq[1];
  FOR_OCC(all, s) { i32 p = B[s]; i32 t = p & 7; int white = !(p & 8); i32 f = fileOf(s) + 1, r = rowOf(s);
    if (t == PAWN) {
      if (white) { if (wp[f] > 1) { pMG -= EP[0]; pEG -= EP[1]; } if (!wp[f - 1] && !wp[f + 1]) { pMG -= EP[2]; pEG -= EP[3]; }
        if (!(bpMinRow[f] < r) && !(bpMinRow[f - 1] < r) && !(bpMinRow[f + 1] < r) && r == wpMinRow[f]) { i32 rr = 7 - r; i32 ee = PASSED_EG[rr]; if (B[s - 10] != 0) ee = ee * 2 / 3;
          ee += (kdist(s - 10, bk) * EP[17] - kdist(s - 10, wk) * EP[16]) * rr / 3; passMG += PASSED_MG[rr]; passEG += ee; } }
      else { if (bp[f] > 1) { pMG += EP[0]; pEG += EP[1]; } if (!bp[f - 1] && !bp[f + 1]) { pMG += EP[2]; pEG += EP[3]; }
        if (!(wpMaxRow[f] > r) && !(wpMaxRow[f - 1] > r) && !(wpMaxRow[f + 1] > r) && r == bpMaxRow[f]) { i32 rr = r; i32 ee = PASSED_EG[rr]; if (B[s + 10] != 0) ee = ee * 2 / 3;
          ee += (kdist(s + 10, wk) * EP[17] - kdist(s + 10, bk) * EP[16]) * rr / 3; passMG -= PASSED_MG[rr]; passEG -= ee; } }
      continue; }
    if (t == KING) continue;
    u64 eAtt = white ? bAtt : wAtt; i32 enemyK = white ? bk : wk, sgn = white ? 1 : -1, mob = 0, katt = 0, us = p & 8;
    if (t == KNIGHT) { for (int i = 0; i < 8; i++) { i32 x = s + N_OFF[i], q = B[x]; if (q == OFF) continue; if ((q == 0 || (q & 8) != us) && !((eAtt >> SQ64[x]) & 1)) mob++; if (KZONE[x - enemyK + 120]) katt++; } mob -= 4; }
    else { const i32 *dirs = t == BISHOP ? B_OFF : t == ROOK ? R_OFF : K_OFF; int nd = t == QUEEN ? 8 : 4;
      for (int i = 0; i < nd; i++) { i32 d = dirs[i], x = s + d, q; while (1) { q = B[x]; if (q == OFF) break; if ((q == 0 || (q & 8) != us) && !((eAtt >> SQ64[x]) & 1)) mob++; if (KZONE[x - enemyK + 120]) katt++; if (q != 0) break; x += d; } }
      mob -= t == BISHOP ? 6 : t == ROOK ? 6 : 12; }
    mobMG += sgn * mob * MOB_MG[t]; mobEG += sgn * mob * MOB_EG[t];
    if (katt) { if (white) ksW += KS_W[t] * imin(katt, 3); else ksB += KS_W[t] * imin(katt, 3); }
    if (t == ROOK) { i32 own = white ? wp[f] : bp[f], opp = white ? bp[f] : wp[f];
      if (!own) { rookMG += sgn * (opp ? EP[31] : EP[30]); rookEG += sgn * (opp ? EP[33] : EP[32]); }
      if (white && r == 1) { rookMG += EP[34]; rookEG += EP[35]; } else if (!white && r == 6) { rookMG -= EP[34]; rookEG -= EP[35]; } }
  }
  { i32 kf = fileOf(wk), kr = rowOf(wk);
    if (kr >= 6) for (i32 ff = imax(0, kf - 1); ff <= imin(7, kf + 1); ff++) { if (B[sqOf(ff, kr - 1)] == PAWN) shieldW += EP[36]; else if (kr >= 2 && B[sqOf(ff, kr - 2)] == PAWN) shieldW += EP[37]; else if (!wp[ff + 1]) shieldW -= EP[38]; }
    i32 kf2 = fileOf(bk), kr2 = rowOf(bk);
    if (kr2 <= 1) for (i32 ff = imax(0, kf2 - 1); ff <= imin(7, kf2 + 1); ff++) { if (B[sqOf(ff, kr2 + 1)] == (PAWN | 8)) shieldB += EP[36]; else if (B[sqOf(ff, kr2 + 2)] == (PAWN | 8)) shieldB += EP[37]; else if (!bp[ff + 1]) shieldB -= EP[38]; } }
  i32 kdW = ksW * ksW / EP[42], kdB = ksB * ksB / EP[42];
  i32 kingMG = (kdW - kdB) + (shieldW - shieldB);
  m += pMG + passMG + mobMG + kingMG + rookMG + bpair * EP[39];
  e += pEG + passEG + mobEG + rookEG + bpair * EP[40];
  i32 score = (m * ph + e * (24 - ph)) / 24;
  int anyW = 0, anyB = 0; for (int i = 0; i < 10; i++) { anyW |= wp[i]; anyB |= bp[i]; }
  if (!anyW && score > 0 && score < 400) score = score / 4;
  if (!anyB && score < 0 && score > -400) score = score / 4;
  return (side == WHITE ? score : -score) + EP[41];
}
// ---- search ----
#ifndef TTB
#define TTB 20
#endif
#define TTS (1 << TTB)
static i32 ttKey[TTS], ttMove[TTS]; static i16 ttScore[TTS]; static i8 ttDepth[TTS], ttFlag[TTS]; static i32 ttMask = TTS - 1;
#ifdef TTEV
static i16 ttEv[TTS];
#endif
static TL i32 moveBuf[MAXPLY * 256], scoreBuf[MAXPLY * 256], quietBuf[MAXPLY * 256], killers[MAXPLY * 2], history[16 * 120], pvLen[MAXPLY];
TL i32 pvTable[MAXPLY * MAXPLY]; static i8 lmrT[64][64];
TL i32 r_move, r_score, r_depth, r_nodes, r_pvlen; TL i32 r_pv[MAXPLY];
#ifndef SOFTT
#define SOFTT 0.55
#endif
static TL i32 nodes, nodeLimit, rootPartial; static volatile i32 stop; static TL double deadline; TL i32 smpId = 0;
TL i32 rootFilter[256]; TL i32 nRootFilter = 0;
void set_tt_bits(i32 bits) { ttMask = (1 << (bits > TTB ? TTB : bits)) - 1; }
void lmr_init(void) { for (int d = 0; d < 64; d++) for (int m = 0; m < 64; m++) { double v = (d && m) ? 0.75 + logd(d) * logd(m) / 2.25 : 0; i32 iv = (i32)v; if (v < 0 && iv != v) iv--; lmrT[d][m] = (d && m) ? iv : 0; } }
i32 lmr_get(i32 d, i32 m) { return lmrT[d][m]; }
void tt_clear(void) { for (int i = 0; i < TTS; i++) { ttKey[i] = 0; ttMove[i] = 0; ttDepth[i] = 0; ttFlag[i] = 0; } for (int i = 0; i < 16 * 120; i++) history[i] = 0; for (int i = 0; i < MAXPLY * 2; i++) killers[i] = 0; }
static int inRoot(i32 m) { for (int i = 0; i < nRootFilter; i++) if (rootFilter[i] == m) return 1; return 0; }
static i32 ttProbe(void) { i32 i = hl & ttMask; return ttKey[i] == hh && ttFlag[i] ? i : -1; }
static void ttStore(i32 depth, i32 flag, i32 score, i32 move, i32 ply, i32 ev) {
  i32 i = hl & ttMask;
  if (ttKey[i] == hh && ttDepth[i] > depth && flag != TT_EXACT) return;
  if (score > MATE_BOUND) score += ply; else if (score < -MATE_BOUND) score -= ply;
  ttKey[i] = hh; ttMove[i] = move ? move : (ttKey[i] == hh ? ttMove[i] : 0); ttScore[i] = (i16)score; ttDepth[i] = (i8)depth; ttFlag[i] = (i8)flag;
#ifdef TTEV
  ttEv[i] = (i16)(ev == -INF ? -32768 : ev);
#endif
  (void)ev;
}
static void checkTime(void) { if ((nodes & 2047) == 0) { if (host_now() > deadline || (nodeLimit && nodes > nodeLimit)) stop = 1; } }
#ifdef CMOVE
static TL i32 counterM[16 * 120];
static inline i32 cmIdx(void) { if (sp < 10) return -1; i32 pm = stk[sp - 10]; if (!pm) return -1; return B[mTo(pm)] * 120 + mTo(pm); }
#endif
#ifdef CONTH
static TL i16 chT[768 * 768]; static TL i32 cmPc[MAXPLY + 2], cmTo[MAXPLY + 2];
static inline i32 pcSq(i32 p, i32 sq) { return ((p >> 3) * 6 + (p & 7) - 1) * 64 + SQ64[sq]; }
static inline i32 chPrev(i32 ply, i32 k) { if (ply < k) return -1; i32 pp = cmPc[ply - k]; return pp ? pcSq(pp, cmTo[ply - k]) * 768 : -1; }
static inline i32 chScore(i32 c1, i32 c2, i32 m) { i32 j = pcSq(B[mFrom(m)], mTo(m)), v = 0; if (c1 >= 0) v += chT[c1 + j]; if (c2 >= 0) v += chT[c2 + j]; return v; }
static inline void chUpd(i32 c1, i32 c2, i32 m, i32 bonus) { i32 j = pcSq(B[mFrom(m)], mTo(m));
  if (c1 >= 0) { i16 *e = &chT[c1 + j]; *e += bonus - *e * iabs(bonus) / 16384; }
  if (c2 >= 0) { i16 *e = &chT[c2 + j]; *e += bonus - *e * iabs(bonus) / 16384; } }
#endif
static void scoreMoves(i32 base, i32 n, i32 ttM, i32 ply) {
#ifdef CONTH
  i32 c1 = chPrev(ply, 1), c2 = chPrev(ply, 2);
#endif
  i32 k1 = killers[ply * 2], k2 = killers[ply * 2 + 1];
#ifdef CMOVE
  i32 ci = cmIdx(), cmv = ci >= 0 ? counterM[ci] : 0;
#endif
  for (i32 i = base; i < base + n; i++) { i32 m = moveBuf[i];
    if (m == ttM) scoreBuf[i] = 2000000;
    else if (mFlag(m) & F_CAP) { i32 victim = (mFlag(m) & F_EP) ? PAWN : (B[mTo(m)] & 7), att = B[mFrom(m)] & 7; i32 s = see(m); scoreBuf[i] = (s >= 0 ? 1000000 : 100000) + victim * 100 - att; }
    else if (mPromo(m)) scoreBuf[i] = mPromo(m) == QUEEN ? 950000 : -100000;
    else if (m == k1) scoreBuf[i] = 900000; else if (m == k2) scoreBuf[i] = 899000;
#ifdef CMOVE
    else if (m == cmv) scoreBuf[i] = 850000;
#endif
#ifdef CONTH
    else scoreBuf[i] = history[B[mFrom(m)] * 120 + mTo(m)] + CONTH * chScore(c1, c2, m);
#else
    else scoreBuf[i] = history[B[mFrom(m)] * 120 + mTo(m)];
#endif
  }
}
static i32 pick(i32 i, i32 end) { i32 best = i; for (i32 j = i + 1; j < end; j++) if (scoreBuf[j] > scoreBuf[best]) best = j;
  if (best != i) { i32 t = moveBuf[i]; moveBuf[i] = moveBuf[best]; moveBuf[best] = t; t = scoreBuf[i]; scoreBuf[i] = scoreBuf[best]; scoreBuf[best] = t; } return moveBuf[i]; }
#ifdef QTTS
static void qStore(i32 flag, i32 score, i32 move, i32 ply) { i32 i = hl & ttMask; if (ttFlag[i] && ttDepth[i] > 0) return; if (score > MATE_BOUND) score += ply; else if (score < -MATE_BOUND) score -= ply;
  ttKey[i] = hh; ttMove[i] = move; ttScore[i] = (i16)score; ttDepth[i] = 0; ttFlag[i] = (i8)flag;
#ifdef TTEV
  ttEv[i] = -32768;
#endif
}
#define QST(f, sc, mv) qStore(f, sc, mv, ply)
#else
#define QST(f, sc, mv)
#endif
static i32 qsearch(i32 alpha, i32 beta, i32 ply) {
  i32 qOrigA = alpha; i32 qBestM = 0; (void)qOrigA; (void)qBestM;
  nodes++; checkTime(); if (stop) return 0;
  pvLen[ply] = 0;
  if (ply >= MAXPLY - 1) return evaluate();
  i32 qti = ttProbe();
  if (qti >= 0) { i32 ts = ttScore[qti]; if (ts > MATE_BOUND) ts -= ply; else if (ts < -MATE_BOUND) ts += ply; i32 f = ttFlag[qti];
    if (f == TT_EXACT || (f == TT_LOWER && ts >= beta) || (f == TT_UPPER && ts <= alpha)) return ts; }
  i32 stand = evaluate();
  if (stand >= beta) return stand; if (stand > alpha) alpha = stand;
  i32 base = ply * 256; i32 n = gen(moveBuf, base, 1) - base;
  scoreMoves(base, n, 0, ply);
  i32 best = stand;
  for (i32 i = base; i < base + n; i++) { i32 m = pick(i, base + n);
    if (scoreBuf[i] < 900000 && !mPromo(m)) continue;
    i32 victim = (mFlag(m) & F_EP) ? PAWN : (B[mTo(m)] & 7);
    if (stand + SEEVAL[victim] + 200 < alpha && !mPromo(m) && phase > 4) continue;
    if (!make(m)) continue;
    i32 s = -qsearch(-beta, -alpha, ply + 1); unmake();
    if (stop) return 0;
    if (s > best) { best = s; if (s > alpha) { alpha = s; qBestM = m; if (s >= beta) { QST(TT_LOWER, s, m); return s; } } } }
  QST(best > qOrigA ? TT_EXACT : TT_UPPER, best, qBestM);
  return best;
}
static TL i32 excl[MAXPLY + 2]; static TL i32 evs[MAXPLY + 2];
#ifdef CORR
#define CORRN 16384
static TL i32 corrH[2][CORRN];
static inline i32 corrIdx(void) { u64 k = pbb[1 | WHITE] * 0x9E3779B97F4A7C15ull ^ pbb[1 | BLACK] * 0xC2B2AE3D27D4EB4Full; return (i32)(k >> 50); }
#endif
static i32 search(i32 depth, i32 alpha, i32 beta, i32 ply, int allowNull) {
  i32 ex = excl[ply];
  int pvNode = beta - alpha > 1; pvLen[ply] = 0;
  int inChk = inCheck(); if (inChk) depth++;
  if (depth <= 0) return qsearch(alpha, beta, ply);
  nodes++; checkTime(); if (stop) return 0;
  if (ply > 0) { if (half >= 100 || isRepetition() || insufficient()) return 0; alpha = imax(alpha, -MATE + ply); beta = imin(beta, MATE - ply - 1); if (alpha >= beta) return alpha; }
  if (ply >= MAXPLY - 1) return evaluate();
  i32 ttM = 0; i32 ti = ttProbe();
  if (ti >= 0) { ttM = ttMove[ti]; if (!ex && !pvNode && ply > 0 && ttDepth[ti] >= depth) { i32 s = ttScore[ti]; if (s > MATE_BOUND) s -= ply; else if (s < -MATE_BOUND) s += ply; i32 f = ttFlag[ti];
      if (f == TT_EXACT || (f == TT_LOWER && s >= beta) || (f == TT_UPPER && s <= alpha)) return s; } }
#ifdef TTEV
  i32 staticEval = inChk ? -INF : (ti >= 0 && ttEv[ti] != -32768 ? ttEv[ti] : evaluate()); evs[ply] = staticEval;
#else
  i32 staticEval = inChk ? -INF : evaluate(); evs[ply] = staticEval;
#endif
  i32 rawEval = staticEval;
#ifdef CORR
  i32 cIdx = corrIdx(); if (!inChk) { staticEval += corrH[side >> 3][cIdx] / 256; if (staticEval > MATE_BOUND - 1) staticEval = MATE_BOUND - 1; if (staticEval < -MATE_BOUND + 1) staticEval = -MATE_BOUND + 1; evs[ply] = staticEval; }
#endif
#ifdef IIR
  if (!ttM && !ex && !inChk && depth >= (pvNode ? 6 : IIR)) depth--;
#endif
  int improving = !inChk && ply >= 2 && evs[ply - 2] != -INF && staticEval > evs[ply - 2];
  if (!pvNode && !inChk && ply > 0 && !ex) {
#ifdef RAZOR
    if (depth <= 3 && staticEval + RAZOR * depth <= alpha) { i32 v = qsearch(alpha, alpha + 1, ply); if (stop) return 0; if (v <= alpha) return v; }
#endif
    #ifdef IMPR1
    if (depth <= 6 && staticEval - 85 * (depth - improving) >= beta && iabs(beta) < MATE_BOUND) return staticEval - 85 * (depth - improving);
#endif
    if (depth <= 6 && staticEval - 85 * depth >= beta && iabs(beta) < MATE_BOUND) return staticEval - 85 * depth;
    if (allowNull && depth >= 3 && staticEval >= beta && nonPawnMat(side)) {
      i32 R = 3 + depth / 4 + imin(3, (staticEval - beta) / 200);
#ifdef CONTH
      cmPc[ply] = 0;
#endif
      makeNull(); i32 s = -search(depth - R, -beta, -beta + 1, ply + 1, 0); unmakeNull();
      if (stop) return 0; if (s >= beta) return s > MATE_BOUND ? beta : s; }
  }
  int singExt = 0;
#ifdef SE
  if (!ex && ply > 0 && depth >= SE && ttM && ti >= 0 && (ttFlag[ti] == TT_LOWER || ttFlag[ti] == TT_EXACT) && ttDepth[ti] >= depth - 3) {
    i32 ts = ttScore[ti]; if (iabs(ts) < MATE_BOUND) { i32 sB = ts - 2 * depth; excl[ply] = ttM; i32 ss = search((depth - 1) / 2, sB - 1, sB, ply, 0); excl[ply] = 0; if (stop) return 0; if (ss < sB) singExt = 1; } }
#endif
  if (!ttM && depth >= 5 && pvNode) depth--;
  i32 base = ply * 256; i32 n = gen(moveBuf, base, 0) - base;
  scoreMoves(base, n, ttM, ply);
  if (ply == 0 && nRootFilter) { for (i32 i = base; i < base + n; i++) if (!inRoot(moveBuf[i])) scoreBuf[i] = -1000000000; }
  i32 legal = 0, best = -INF, bestMove = 0, origAlpha = alpha;
  int futile = !pvNode && !inChk && depth <= 3 && staticEval + 120 * depth + 60 <= alpha;
  i32 qb = ply * 256, nq = 0;
  for (i32 i = base; i < base + n; i++) { i32 m = pick(i, base + n);
    if (ply == 0 && nRootFilter && !inRoot(m)) continue;
    if (m == ex) continue;
    int isCap = (mFlag(m) & F_CAP) != 0, isQuiet = !isCap && !mPromo(m);
    if (legal > 0 && isQuiet && !inChk && best > -MATE_BOUND) { if (futile) continue; if (!pvNode && depth <= 4 && legal >= 4 + depth * depth * 2) continue; }
#ifdef HPRUNE
    if (legal > 0 && isQuiet && !pvNode && !inChk && depth <= 3 && best > -MATE_BOUND && history[B[mFrom(m)] * 120 + mTo(m)] < -HPRUNE * depth) continue;
#endif
    if (legal > 0 && !pvNode && isCap && depth <= 4 && scoreBuf[i] < 900000 && see(m) < -80 * depth) continue;
#ifdef CONTH
    i32 mvPc = B[mFrom(m)];
#endif
    if (!make(m)) continue;
    legal++;
#ifdef CONTH
    cmPc[ply] = mvPc; cmTo[ply] = mTo(m);
#endif
    int givesCheck = inCheck(); i32 s;
    i32 ext = (singExt && m == ttM) ? 1 : 0;
    if (legal == 1) s = -search(depth - 1 + ext, -beta, -alpha, ply + 1, 1);
    else { i32 R = 0;
      if (depth >= 3 && isQuiet && !inChk && !givesCheck) { R = lmrT[imin(depth, 63)][imin(legal, 63)]; if (pvNode) R--;
#ifdef IMPR2
        if (!improving) R++;
#endif
 if (m == killers[ply * 2] || m == killers[ply * 2 + 1]) R--;
#ifdef TTCAPR
        if (ttM && (mFlag(ttM) & F_CAP)) R++;
#endif
#ifdef HLMR
        { i32 h = history[B[mTo(m)] * 120 + mTo(m)]; if (h < 0) R++; else if (h > HLMR) R--;
#ifdef HNEG
          if (h < -HNEG) R++; if (h > HNEG * 4) R--;
#endif
        }
#endif
 R = imax(0, imin(R, depth - 2)); }
      s = -search(depth - 1 + ext - R, -alpha - 1, -alpha, ply + 1, 1);
      if (s > alpha && R > 0) s = -search(depth - 1 + ext, -alpha - 1, -alpha, ply + 1, 1);
      if (s > alpha && s < beta) s = -search(depth - 1 + ext, -beta, -alpha, ply + 1, 1); }
    unmake();
    if (stop) return 0;
    if (s > best) { best = s; bestMove = m;
      if (s > alpha) { alpha = s; i32 o = ply * MAXPLY, o1 = (ply + 1) * MAXPLY; pvTable[o] = m; i32 l = pvLen[ply + 1]; for (i32 j = 0; j < l; j++) pvTable[o + 1 + j] = pvTable[o1 + j]; pvLen[ply] = l + 1;
#ifdef PARTIAL
        if (ply == 0 && legal > 1) { rootPartial = 1; r_pvlen = pvLen[0]; for (i32 j = 0; j < r_pvlen; j++) r_pv[j] = pvTable[j]; r_move = m; r_score = s; }
#endif
        if (s >= beta) { if (isQuiet) { if (killers[ply * 2] != m) { killers[ply * 2 + 1] = killers[ply * 2]; killers[ply * 2] = m; }
#ifdef CMOVE
            { i32 ci = cmIdx(); if (ci >= 0) counterM[ci] = m; }
#endif

            i32 hi = B[mFrom(m)] * 120 + mTo(m); history[hi] += depth * depth; if (history[hi] > 800000) for (int z = 0; z < 16 * 120; z++) history[z] >>= 1;
            for (i32 qq = 0; qq < nq; qq++) { i32 q = quietBuf[qb + qq]; i32 qi = B[mFrom(q)] * 120 + mTo(q); history[qi] -= depth * depth; }
#ifdef CONTH
            { i32 c1 = chPrev(ply, 1), c2 = chPrev(ply, 2), bo = imin(depth * depth * 16, 2400); chUpd(c1, c2, m, bo); for (i32 qq = 0; qq < nq; qq++) chUpd(c1, c2, quietBuf[qb + qq], -bo); }
#endif
          }
          break; } } }
    if (isQuiet) quietBuf[qb + nq++] = m;
  }
  if (legal == 0) return ex ? alpha : (inChk ? -MATE + ply : 0);
#ifdef CORR
  if (!ex && !inChk && (!bestMove || !(mFlag(bestMove) & F_CAP)) && iabs(best) < MATE_BOUND && !(best >= beta && best <= staticEval) && !(best <= origAlpha && best >= staticEval)) {
    i32 *e = &corrH[side >> 3][cIdx]; i32 w = imin(depth + 1, 16), d = (best - staticEval) * 256; i32 v = (*e * (256 - w) + d * w) / 256; *e = imax(-CORR * 256, imin(CORR * 256, v)); }
#endif
  if (!ex) ttStore(depth, best >= beta ? TT_LOWER : (best > origAlpha ? TT_EXACT : TT_UPPER), best, bestMove, ply, rawEval);
  return best;
}
// results

static TL i32 legalList[256];
i32 go(double timeMs, i32 maxDepthIn, i32 nodeLim) {
  if (!smpId) stop = 0; nodes = 0; double t0 = host_now(); deadline = t0 + (timeMs > 0 ? timeMs : 1000); nodeLimit = nodeLim;
  for (int i = 0; i < MAXPLY * 2; i++) killers[i] = 0; for (int i = 0; i < 16 * 120; i++) history[i] >>= 2;
  i32 maxDepth = maxDepthIn ? maxDepthIn : 64;
  i32 buf[256]; i32 n = gen(buf, 0, 0), nl = 0;
  for (int i = 0; i < n; i++) if (make(buf[i])) { unmake(); if (!nRootFilter || inRoot(buf[i])) legalList[nl++] = buf[i]; }
  if (!nl) { r_move = 0; r_score = inCheck() ? -MATE : 0; r_depth = 0; r_pvlen = 0; r_nodes = 0; return 0; }
  int have = 0; i32 prev = 0;
  for (i32 d = 1 + (smpId & 1); d <= maxDepth; d++) {
    i32 window = 30, alpha = -INF, beta = INF, s;
    if (d >= 5) { alpha = prev - window; beta = prev + window; }
    while (1) { s = search(d, alpha, beta, 0, 0); if (stop) break;
      if (s <= alpha) { alpha = imax(-INF, alpha - window); window *= 2; } else if (s >= beta) { beta = imin(INF, beta + window); window *= 2; } else break;
      if (window > 1000) { alpha = -INF; beta = INF; } }
    if (stop && have) break;
    if (pvLen[0] > 0 || !have) {
      r_pvlen = pvLen[0]; for (i32 j = 0; j < pvLen[0]; j++) r_pv[j] = pvTable[j];
      if (!r_pvlen) { r_pv[0] = legalList[0]; r_pvlen = 1; }
      r_move = r_pv[0]; r_score = s; r_depth = d; r_nodes = nodes; have = 1; prev = s;
      if (!smpId) host_iter(d, s, nodes, r_pvlen);
    }
    if (stop) break;
    if (iabs(s) > MATE_BOUND && d > 6) break;
    if (!smpId && !maxDepthIn && host_now() - t0 > (timeMs > 0 ? timeMs : 1000) * SOFTT) break;
    if (!smpId && nl == 1 && d >= 4) break;
  }
  r_nodes = nodes; return r_move;
}
// accessors for JS
i8 *ptr_board(void) { return B; } i16 *ptr_nw1(void) { return NW1; } i16 *ptr_nb1(void) { return NB1; } i16 *ptr_nw2(void) { return NW2; } i32 nn_selftest(i32 steps, i32 seed0) { // random walk with make/unmake; compare incremental vs full accumulators
  i32 buf[256], bad = 0; u32 r = seed0 | 1; i32 made = 0;
  for (int k = 0; k < steps; k++) { i32 n = gen(buf, 0, 0); if (!n) break; r ^= r << 13; r ^= r >> 17; r ^= r << 5; i32 tries = 0, ok = 0;
    while (tries++ < 20) { if (make(buf[r % n])) { ok = 1; break; } r ^= r << 13; r ^= r >> 17; r ^= r << 5; } if (!ok) break; made++;
    if ((r & 3) == 0 && made > 1) { unmake(); made--; }
    i32 L = sp / 10; if (!nnOk[L]) nnUpdate(L); i32 a = nnEval(); nnFull(L); i32 b = nnEval(); if (a != b) bad++; }
  while (made--) unmake(); return bad; }
void set_nn(i32 on, i32 b2) { useNN = on; NB2 = b2; for (int i = 0; i < (1 << ECB); i++) { ecKey[i] = 0; ecKey2[i] = 0; } } i32 *ptr_hist(void) { return hist; } i32 *ptr_rootFilter(void) { return rootFilter; } i32 *ptr_pv(void) { return r_pv; } i32 *ptr_pst_mg(void) { return &PST_MG[0][0]; } i32 *ptr_pst_eg(void) { return &PST_EG[0][0]; }
void set_state(i32 sd, i32 cs, i32 e, i32 hf, i32 nh, i32 nrf) { side = sd; castle = cs; ep = e; half = hf; nhist = nh; nRootFilter = nrf; recompute(); }
i32 res_score(void) { return r_score; } i32 res_depth(void) { return r_depth; } i32 res_nodes(void) { return r_nodes; } i32 res_pvlen(void) { return r_pvlen; }
