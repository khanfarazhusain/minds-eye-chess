// FHK engine: native UCI front end. Own code. Build: gcc -O3 -DNATIVE -DNNH=512 <flags> uci.c -o fhk
#define NATIVE 1
#ifndef TL
#define TL __thread
#endif
#include <pthread.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#ifdef _WIN32
#include <windows.h>
double host_now(void) { static LARGE_INTEGER f; LARGE_INTEGER c; if (!f.QuadPart) QueryPerformanceFrequency(&f); QueryPerformanceCounter(&c); return c.QuadPart * 1000.0 / f.QuadPart; }
#else
double host_now(void) { struct timespec t; clock_gettime(CLOCK_MONOTONIC, &t); return t.tv_sec * 1000.0 + t.tv_nsec / 1e6; }
#endif
double uciSoft = 0.55;
#define SOFTT uciSoft
static double tStart;
void host_iter(int d, int s, int n, int l);
#include "eng.c"
#include "pst.h"
static const char *NM = ".pnbrqk";
static void sqName(int s, char *o) { int f = (s - 21) % 10, r = (s - 21) / 10; o[0] = 'a' + f; o[1] = '8' - r; }
static void moveStr(i32 m, char *o) { sqName(mFrom(m), o); sqName(mTo(m), o + 2); int p = mPromo(m); if (p) { o[4] = NM[p]; o[5] = 0; } else o[4] = 0; }
void host_iter(int d, int s, int n, int l) {
  int t = (int)(host_now() - tStart); char sc[32];
  if (s > MATE_BOUND) sprintf(sc, "mate %d", (MATE - s + 1) / 2); else if (s < -MATE_BOUND) sprintf(sc, "mate %d", -(MATE + s + 1) / 2); else sprintf(sc, "cp %d", s);
  printf("info depth %d score %s nodes %d time %d nps %d pv", d, sc, n, t, t > 0 ? (int)(n * 1000.0 / t) : n);
  for (int i = 0; i < l && i < 64; i++) { char ms[8]; moveStr(r_pv[i], ms); printf(" %s", ms); }
  printf("\n"); fflush(stdout); }
static void loadFen(const char *fen) {
  for (int i = 0; i < 120; i++) B[i] = OFF; for (int r = 0; r < 8; r++) for (int f = 0; f < 8; f++) B[sqOf(f, r)] = 0;
  int r = 0, f = 0; const char *c = fen;
  for (; *c && *c != ' '; c++) { if (*c == '/') { r++; f = 0; continue; } if (*c >= '1' && *c <= '8') { f += *c - '0'; continue; }
    char lc = *c | 32; const char *q = strchr(NM, lc); if (!q) continue; B[sqOf(f, r)] = (int)(q - NM) | ((*c == lc) ? BLACK : WHITE); f++; }
  int sd = WHITE, cs = 0, e = 0, hf = 0;
  if (*c) { c++; sd = *c == 'b' ? BLACK : WHITE; while (*c && *c != ' ') c++; }
  if (*c) { c++; for (; *c && *c != ' '; c++) { if (*c == 'K') cs |= 1; if (*c == 'Q') cs |= 2; if (*c == 'k') cs |= 4; if (*c == 'q') cs |= 8; } }
  if (*c) { c++; if (*c != '-' && c[1]) e = sqOf(c[0] - 'a', 8 - (c[1] - '0')); while (*c && *c != ' ') c++; }
  if (*c) { c++; hf = atoi(c); }
  set_state(sd, cs, e, hf, 0, 0); }
static int playMove(const char *s) {
  i32 buf[256]; int n = gen(buf, 0, 0); char ms[8];
  for (int i = 0; i < n; i++) { moveStr(buf[i], ms); if (strcmp(ms, s)) continue; if (!make(buf[i])) return 0; set_state(side, castle, ep, half, nhist, 0); return 1; }
  return 0; }
static char lastPos[1 << 16];
static void position(char *p) {
  if (!smpId) snprintf(lastPos, sizeof lastPos, "%s", p);
  char tmp[1 << 16]; snprintf(tmp, sizeof tmp, "%s", p); p = tmp;
  char *mv = strstr(p, " moves ");
  if (mv) *mv = 0;
  if (strncmp(p, "startpos", 8) == 0) loadFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  else if (strncmp(p, "fen ", 4) == 0) loadFen(p + 4);
  if (mv) { char *q = mv + 7; while (*q) { while (*q == ' ') q++; if (!*q) break; char t[8]; int k = 0; while (*q && *q != ' ' && k < 7) t[k++] = *q++; t[k] = 0; while (*q && *q != ' ') q++; playMove(t); } } }
static int nThreads = 1; typedef struct { int id; double hard; } HArg;
static void *helperMain(void *a) { HArg *h = a; smpId = h->id; char pp[1 << 16]; snprintf(pp, sizeof pp, "%s", lastPos); position(pp); go(h->hard, 0, 0); return 0; }
#ifdef NNKB
static int loadNet(const char *path) {
  FILE *nf = fopen(path, "rb"); if (!nf) return 0; int hd[2]; if (fread(hd, 4, 2, nf) != 2 || hd[0] != -NNH || hd[1] != NNKB) { fclose(nf); return 0; }
  size_t N = (size_t)NNKB * 768 * NNH + NNH + NNOB * 2 * NNH + NNOB; float *f = malloc(N * 4); if (fread(f, 4, N, nf) != N) { fclose(nf); free(f); return 0; } fclose(nf); size_t o = 0;
  #define QZ(v, sc) ({ double _x = (v) * (sc); _x = _x > 32767 ? 32767 : _x < -32767 ? -32767 : _x; (i16)(_x < 0 ? -(int)(-_x + 0.5) : (int)(_x + 0.5)); })
  for (size_t i = 0; i < (size_t)NNKB * 768 * NNH; i++) NW1[i] = QZ(f[o++], 255); for (int i = 0; i < NNH; i++) NB1[i] = QZ(f[o++], 255); for (int i = 0; i < NNOB * 2 * NNH; i++) NW2[i] = QZ(f[o++], 1024);
  for (int i = 0; i < NNOB; i++) { double b2 = f[o++] * 255 * 1024; NB2v[i] = (int)(b2 < 0 ? b2 - 0.5 : b2 + 0.5); } free(f); set_nn(1, 0); return 1; }
#else
static int loadNet(const char *path) {
  FILE *nf = fopen(path, "rb"); if (!nf) return 0; int Hn = 0; if (fread(&Hn, 4, 1, nf) != 1 || Hn != NNH) { fclose(nf); return 0; }
  static float f[768 * NNH + NNH + 2 * NNH + 1]; if (fread(f, 4, 768 * NNH + 3 * NNH + 1, nf) != (size_t)(768 * NNH + 3 * NNH + 1)) { fclose(nf); return 0; } fclose(nf); int o = 0;
  #define QZ(v, sc) ({ double _x = (v) * (sc); _x = _x > 32767 ? 32767 : _x < -32767 ? -32767 : _x; (i16)(_x < 0 ? -(int)(-_x + 0.5) : (int)(_x + 0.5)); })
  for (int i = 0; i < 768 * NNH; i++) NW1[i] = QZ(f[o++], 255); for (int i = 0; i < NNH; i++) NB1[i] = QZ(f[o++], 255); for (int i = 0; i < 2 * NNH; i++) NW2[i] = QZ(f[o++], 1024);
  double b2 = f[o] * 255 * 1024; set_nn(1, (int)(b2 < 0 ? b2 - 0.5 : b2 + 0.5)); return 1; }
#endif
static void goCmd(char *a) {
  double wt = -1, bt = -1, wi = 0, bi = 0, mt = -1; int depth = 0, mtg = 0; long nodesL = 0; char *t = strtok(a, " \r\n");
  while (t) { char *v = strtok(NULL, " \r\n");
    if (!strcmp(t, "wtime") && v) wt = atof(v); else if (!strcmp(t, "btime") && v) bt = atof(v); else if (!strcmp(t, "winc") && v) wi = atof(v); else if (!strcmp(t, "binc") && v) bi = atof(v);
    else if (!strcmp(t, "movetime") && v) mt = atof(v); else if (!strcmp(t, "depth") && v) depth = atoi(v); else if (!strcmp(t, "movestogo") && v) mtg = atoi(v); else if (!strcmp(t, "nodes") && v) nodesL = atol(v);
    else if (!strcmp(t, "infinite")) { depth = 64; v = v; } else { t = v; continue; }
    t = v ? strtok(NULL, " \r\n") : NULL; }
  double hard;
  if (mt > 0) { hard = mt - 20 > 10 ? mt - 20 : 10; uciSoft = 1.0; }
  else if (wt >= 0 || bt >= 0) { double rem = side == WHITE ? wt : bt, inc = side == WHITE ? wi : bi; if (rem < 0) rem = 1000;
    double alloc = rem / (mtg > 0 ? mtg + 2 : 26) + inc * 0.8; if (alloc > rem * 0.15) alloc = rem * 0.15; hard = alloc * 2; if (hard > rem * 0.2) hard = rem * 0.2; hard -= 30; if (hard < 10) hard = 10;
    uciSoft = alloc * 0.6 / hard; if (uciSoft > 0.9) uciSoft = 0.9; }
  else { hard = 1e9; uciSoft = 1.0; if (!depth && !nodesL) depth = 64; }
  tStart = host_now(); stop = 0; pthread_t th[64]; HArg ha[64]; int nh = (depth || nodesL) ? 0 : nThreads - 1;
  pthread_attr_t at; pthread_attr_init(&at); pthread_attr_setstacksize(&at, 32 << 20);
  for (int i = 0; i < nh; i++) { ha[i].id = i + 1; ha[i].hard = hard; pthread_create(&th[i], &at, helperMain, &ha[i]); }
  i32 m = go(hard, depth, (i32)nodesL); stop = 1; for (int i = 0; i < nh; i++) pthread_join(th[i], 0); char ms[8];
  if (m) { moveStr(m, ms); printf("bestmove %s\n", ms); } else printf("bestmove 0000\n"); fflush(stdout); }
int main(int argc, char **argv) {
  for (int p = 0; p < 16; p++) for (int s = 0; s < 120; s++) { PST_MG[p][s] = PSTMG_INIT[p][s]; PST_EG[p][s] = PSTEG_INIT[p][s]; }
  init(); lmr_init(); set_tt_bits(TTB);
  char netPath[1024] = "fhk-net.bin"; if (argc > 1) snprintf(netPath, sizeof netPath, "%s", argv[1]);
  if (!loadNet(netPath)) {
    char alt[1100]; const char *slash = strrchr(argv[0], '/'); const char *bs = strrchr(argv[0], '\\'); if (bs > slash) slash = bs;
    if (slash) { snprintf(alt, sizeof alt, "%.*sfhk-net.bin", (int)(slash - argv[0] + 1), argv[0]); loadNet(alt); } }
  position("startpos");
  static char line[1 << 16];
  setvbuf(stdout, NULL, _IONBF, 0);
  while (fgets(line, sizeof line, stdin)) {
    line[strcspn(line, "\r\n")] = 0;
    if (!strcmp(line, "uci")) { printf("id name FHK\nid author FARAZ & Claude\noption name Hash type spin default 16 min 1 max 16\noption name Threads type spin default 1 min 1 max 64\nuciok\n"); }
    else if (!strncmp(line, "setoption name Threads value ", 29)) { nThreads = atoi(line + 29); if (nThreads < 1) nThreads = 1; if (nThreads > 64) nThreads = 64; }
    else if (!strcmp(line, "isready")) printf("readyok\n");
    else if (!strcmp(line, "ucinewgame")) tt_clear();
    else if (!strncmp(line, "position ", 9)) position(line + 9);
    else if (!strncmp(line, "go", 2)) goCmd(line + 2);
    else if (!strcmp(line, "selftest")) printf("selftest bad %d\n", nn_selftest(20000, 12345));
    else if (!strcmp(line, "quit")) break;
  }
  return 0; }
