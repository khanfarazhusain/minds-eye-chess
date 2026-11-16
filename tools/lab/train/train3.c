// FHK-Net v2 trainer: (KB king buckets x 768, horizontally mirrored) -> H (x2 perspectives, clipped ReLU) -> OB output buckets.  Own code, plain C, Adam.
#ifndef KB
#define KB 4
#endif
#define OB 8
#define NF (KB * 768)
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>
#include <time.h>
#include <omp.h>
#ifndef H
#define H 256
#endif
typedef struct __attribute__((packed)) { unsigned char b[32]; unsigned char stm; float t; } Pos; // b: 4 bits per square, 0 empty, 1..12 piece
typedef struct { unsigned char n, stm, ob; unsigned short f[32], g[32]; } Feat; // f: white-perspective index, g: black-perspective index
static inline int kbk(int rk) { return rk == 0 ? 0 : rk == 1 ? 1 : rk <= 3 ? 2 : 3; }
static void unpackM(const Pos *p, Feat *q, int m) { int n = 0, raw[32], wk = 0, bk = 0;
  for (int sq = 0; sq < 64; sq++) { int v = (p->b[sq >> 1] >> ((sq & 1) * 4)) & 15; if (!v || n >= 32) continue; int s2 = m ? sq ^ 7 : sq; raw[n++] = (v - 1) * 64 + s2; if (v == 6) wk = s2; if (v == 12) bk = s2; }
  int wm = (wk & 7) < 4 ? 7 : 0, bkr = bk ^ 56, bm = (bkr & 7) < 4 ? 7 : 0; int wb = kbk(wk >> 3) * 768, bb = kbk(bkr >> 3) * 768;
  for (int i = 0; i < n; i++) { int x = raw[i], ct = x >> 6, sq = x & 63, col = ct / 6, t = ct % 6;
    q->f[i] = wb + ct * 64 + (sq ^ wm); q->g[i] = bb + ((1 - col) * 6 + t) * 64 + ((sq ^ 56) ^ bm); }
  q->n = n; q->stm = p->stm; int o = (n - 2) / 4; q->ob = o < 0 ? 0 : o > 7 ? 7 : o; }
static void unpack(const Pos *p, Feat *q) { unpackM(p, q, 0); }
static int AUG = 0; // AUG=1: mirror files a<->h on half the samples (castling rights are not in the data)
static Pos *D; static long ND = 0, CAP = 0;
static float W1[NF * H], B1[H], W2[OB][2 * H], B2[OB];
static float mW1[NF * H], vW1[NF * H], mB1[H], vB1[H], mW2[OB][2 * H], vW2[OB][2 * H], mB2[OB], vB2[OB];
static const float CS = 0.98f * 2.302585f;
static int fen2pos(const char *fen, Pos *p) { memset(p->b, 0, 32);
  const char *nm = "pnbrqk"; int r = 0, f = 0, n = 0; const char *c = fen;
  for (; *c && *c != ' '; c++) { if (*c == '/') { r++; f = 0; continue; } if (*c >= '1' && *c <= '8') { f += *c - '0'; continue; }
    char lc = *c | 32; const char *q = strchr(nm, lc); if (!q || !lc || r > 7 || f > 7) return 0; int t = (int)(q - nm), col = (*c == lc); int sq = (7 - r) * 8 + f; // a1 = 0
    if (n < 32) { int v = col * 6 + t + 1; p->b[sq >> 1] |= v << ((sq & 1) * 4); n++; } f++; }
  p->stm = c[1] == 'b'; return n; }
static inline int flipF(int x) { int ct = x >> 6, sq = x & 63, col = ct / 6, t = ct % 6; return ((1 - col) * 6 + t) * 64 + (sq ^ 56); }
static double frand(void) { return rand() / (double)RAND_MAX; }
static float fwd(const Feat *p, float *aU, float *aT, float *xU, float *xT) {
  float aw[H], ab[H]; memcpy(aw, B1, sizeof aw); memcpy(ab, B1, sizeof ab);
  for (int i = 0; i < p->n; i++) { const float *w = &W1[p->f[i] * H], *b = &W1[p->g[i] * H]; for (int j = 0; j < H; j++) { aw[j] += w[j]; ab[j] += b[j]; } }
  float *u = p->stm ? ab : aw, *t = p->stm ? aw : ab; const float *w2 = W2[p->ob]; float r = B2[p->ob];
  for (int j = 0; j < H; j++) { xU[j] = u[j]; xT[j] = t[j]; aU[j] = u[j] < 0 ? 0 : u[j] > 1 ? 1 : u[j]; aT[j] = t[j] < 0 ? 0 : t[j] > 1 ? 1 : t[j]; r += w2[j] * aU[j] + w2[H + j] * aT[j]; }
  return r; }
int main(int argc, char **argv) {
  // argv: out.bin epochs lam files...
  AUG = getenv("AUG") ? atoi(getenv("AUG")) : 0; const char *out = argv[1]; int EPOCHS = atoi(argv[2]); float lam = atof(argv[3]);
  char line[300]; setvbuf(stderr, NULL, _IONBF, 0);
  for (int a = 4; a < argc; a++) { FILE *fp = fopen(argv[a], "r"); while (fgets(line, sizeof line, fp)) {
      char *s1 = strchr(line, ';'); if (!s1) continue; *s1 = 0; char *s2 = strchr(s1 + 1, ';'); if (!s2) continue; char *s3 = strchr(s2 + 1, ';'); if (!s3) continue;
      double res = atof(s1 + 1); int sc = atoi(s2 + 1), quiet = atoi(s3 + 1); if (!quiet || abs(sc) > 3000) continue;
      if (ND == CAP) { CAP = CAP ? CAP * 2 : (getenv("CAPN") ? atol(getenv("CAPN")) : 1 << 20); D = realloc(D, CAP * sizeof(Pos)); }
      Pos *p = &D[ND]; if (!fen2pos(line, p)) continue; double rs = p->stm ? 1 - res : res; double ps = 1 / (1 + pow(10, -0.98 * sc / 400.0));
      p->t = (float)(lam * ps + (1 - lam) * rs); ND++; } fclose(fp); }
  fprintf(stderr, "positions %ld\n", ND);
  srand(12345); for (long i = ND - 1; i > 0; i--) { long j = (long)(frand() * i); Pos t = D[i]; D[i] = D[j]; D[j] = t; }
  long NV = ND / 50, NT = ND - NV; // last 2% validation
  for (int i = 0; i < NF * H; i++) W1[i] = (frand() - 0.5) * 0.2; for (int j = 0; j < H; j++) B1[j] = 0.1 + (frand() - 0.5) * 0.05; for (int o = 0; o < OB; o++) { for (int j = 0; j < 2 * H; j++) W2[o][j] = (frand() - 0.5) * 0.1; B2[o] = 0; }
  // init: material-ish bias into W1 so training starts sane is unnecessary; Adam handles it
  if (getenv("INIT")) { FILE *fi = fopen(getenv("INIT"), "rb"); int hh = 0; if (fi && fread(&hh, 4, 1, fi) == 1 && hh == H) { // v1 net (768) -> replicate into every bucket (mirrored where needed) and every output bucket
      static float w1[768 * H], w2[2 * H], b2; fread(w1, 4, 768 * H, fi); fread(B1, 4, H, fi); fread(w2, 4, 2 * H, fi); fread(&b2, 4, 1, fi);
      for (int b = 0; b < KB; b++) for (int f = 0; f < 768; f++) memcpy(&W1[(b * 768 + f) * H], &w1[f * H], H * 4);
      for (int o = 0; o < OB; o++) { memcpy(W2[o], w2, sizeof w2); B2[o] = b2; } fprintf(stderr, "init from v1 %s\n", getenv("INIT")); }
    else if (fi && hh == -H) { fread(W1, 4, NF * H, fi); fread(B1, 4, H, fi); fread(W2, 4, OB * 2 * H, fi); fread(B2, 4, OB, fi); fprintf(stderr, "init from v2 %s\n", getenv("INIT")); } if (fi) fclose(fi); }
  int EP0 = getenv("EP0") ? atoi(getenv("EP0")) : 0;
  int BS = 16384; float lr = getenv("LR0") ? atof(getenv("LR0")) : 1e-3f, b1 = 0.9f, b2 = 0.999f, eps = 1e-8f; long step = 0;
  int NTH = omp_get_max_threads(); fprintf(stderr, "threads %d\n", NTH);
  float **TW1 = malloc(NTH * sizeof(float *)), **TB1 = malloc(NTH * sizeof(float *)), **TW2 = malloc(NTH * sizeof(float *)); double *TB2 = calloc(NTH * OB, sizeof(double)), *TL = calloc(NTH, sizeof(double)); unsigned char **TT = malloc(NTH * sizeof(void *));
  for (int t = 0; t < NTH; t++) { TW1[t] = calloc(NF * H, 4); TB1[t] = calloc(H, 4); TW2[t] = calloc(OB * 2 * H, 4); TT[t] = calloc(NF, 1); }
  for (int ep = 0; ep < EPOCHS; ep++) {
    if (ep == (int)(EPOCHS * 0.6)) lr *= 0.3f; if (ep == (int)(EPOCHS * 0.85)) lr *= 0.3f; if (ep < EP0) continue;
    double tl = 0; double t0 = omp_get_wtime();
    for (long bs = 0; bs < NT; bs += BS) { long be = bs + BS < NT ? bs + BS : NT;
      #pragma omp parallel
      { int tid = omp_get_thread_num(); float *gw1 = TW1[tid], *gb1 = TB1[tid], *gw2 = TW2[tid]; unsigned char *tch = TT[tid];
        for (int f = 0; f < NF; f++) if (tch[f]) { memset(&gw1[f * H], 0, H * 4); tch[f] = 0; }
        memset(gb1, 0, H * 4); memset(gw2, 0, OB * 2 * H * 4); double gb2[OB] = {0}, ll = 0;
        float aU[H], aT[H], xU[H], xT[H], dU[H], dT[H]; Feat q;
        #pragma omp for schedule(static)
        for (long k = bs; k < be; k++) { unpackM(&D[k], &q, AUG && (((unsigned long)k * 2654435761u + ep) >> 7 & 1)); float r = fwd(&q, aU, aT, xU, xT); float pr = 1 / (1 + expf(-r * CS)); float e = pr - D[k].t; ll += e * e;
          float dr = 2 * e * pr * (1 - pr) * CS; gb2[q.ob] += dr; float *g2o = gw2 + q.ob * 2 * H, *w2 = W2[q.ob];
          for (int j = 0; j < H; j++) { g2o[j] += dr * aU[j]; g2o[H + j] += dr * aT[j]; dU[j] = (xU[j] > 0 && xU[j] < 1) ? dr * w2[j] : 0; dT[j] = (xT[j] > 0 && xT[j] < 1) ? dr * w2[H + j] : 0; gb1[j] += dU[j] + dT[j]; }
          float *dW = q.stm ? dT : dU, *dB = q.stm ? dU : dT;
          for (int i = 0; i < q.n; i++) { int fw = q.f[i], fb = q.g[i]; tch[fw] = tch[fb] = 1;
            float *g = &gw1[fw * H], *g2 = &gw1[fb * H]; for (int j = 0; j < H; j++) { g[j] += dW[j]; g2[j] += dB[j]; } } }
        for (int o = 0; o < OB; o++) TB2[tid * OB + o] = gb2[o]; TL[tid] = ll; }
      step++; float inv = 1.0f / (be - bs); float c1 = 1 - powf(b1, step), c2 = 1 - powf(b2, step), alr = lr * sqrtf(c2) / c1;
      #define ADAM(w, g, m, v) { float gg = (g) * inv; m = b1 * m + (1 - b1) * gg; v = b2 * v + (1 - b2) * gg * gg; w -= alr * m / (sqrtf(v) + eps); }
      #pragma omp parallel for schedule(dynamic, 8)
      for (int f = 0; f < NF; f++) { int any = 0; for (int t = 0; t < NTH; t++) any |= TT[t][f]; if (!any) continue;
        for (int j = 0; j < H; j++) { float g = 0; for (int t = 0; t < NTH; t++) if (TT[t][f]) g += TW1[t][f * H + j]; ADAM(W1[f * H + j], g, mW1[f * H + j], vW1[f * H + j]) } }
      for (int j = 0; j < H; j++) { float g = 0; for (int t = 0; t < NTH; t++) g += TB1[t][j]; ADAM(B1[j], g, mB1[j], vB1[j]) }
      for (int o = 0; o < OB; o++) for (int j = 0; j < 2 * H; j++) { float g = 0; for (int t = 0; t < NTH; t++) g += TW2[t][o * 2 * H + j]; ADAM(W2[o][j], g, mW2[o][j], vW2[o][j]) if (W2[o][j] > 2) W2[o][j] = 2; if (W2[o][j] < -2) W2[o][j] = -2; }
      for (int o = 0; o < OB; o++) { float g = 0; for (int t = 0; t < NTH; t++) g += TB2[t * OB + o]; ADAM(B2[o], g, mB2[o], vB2[o]) }
      for (int t = 0; t < NTH; t++) tl += TL[t];
    }
    double vl = 0;
    #pragma omp parallel for reduction(+:vl)
    for (long k = NT; k < ND; k++) { float aU[H], aT[H], xU[H], xT[H]; Feat q; unpack(&D[k], &q); float r = fwd(&q, aU, aT, xU, xT); float pr = 1 / (1 + expf(-r * CS)); vl += (pr - D[k].t) * (pr - D[k].t); }
    fprintf(stderr, "epoch %d train %.6f valid %.6f lr %g %.0fs\n", ep, tl / NT, vl / NV, lr, omp_get_wtime() - t0);
    FILE *fo = fopen(out, "wb"); int hh = -H, kb = KB; fwrite(&hh, 4, 1, fo); fwrite(&kb, 4, 1, fo); fwrite(W1, 4, NF * H, fo); fwrite(B1, 4, H, fo); fwrite(W2, 4, OB * 2 * H, fo); fwrite(B2, 4, OB, fo); fclose(fo);
  }
  return 0; }
