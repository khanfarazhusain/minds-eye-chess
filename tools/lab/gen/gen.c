#define NATIVE 1
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
double host_now(void) { struct timespec t; clock_gettime(CLOCK_MONOTONIC, &t); return t.tv_sec * 1000.0 + t.tv_nsec / 1e6; }
void host_iter(int d, int s, int n, int l) {}
#include "eng.c"
#include "pst.h"
static const char *NM = ".pnbrqk";
void loadFen(const char *fen) {
  for (int i = 0; i < 120; i++) B[i] = OFF; for (int r = 0; r < 8; r++) for (int f = 0; f < 8; f++) B[sqOf(f, r)] = 0;
  int r = 0, f = 0; const char *c = fen;
  for (; *c && *c != ' '; c++) { if (*c == '/') { r++; f = 0; continue; } if (*c >= '1' && *c <= '8') { f += *c - '0'; continue; }
    char lc = *c | 32; int t = (int)(strchr(NM, lc) - NM); B[sqOf(f, r)] = t | ((*c == lc) ? BLACK : WHITE); f++; }
  c++; int sd = *c == 'b' ? BLACK : WHITE; c += 2; int cs = 0; for (; *c && *c != ' '; c++) { if (*c == 'K') cs |= 1; if (*c == 'Q') cs |= 2; if (*c == 'k') cs |= 4; if (*c == 'q') cs |= 8; }
  c++; int e = 0; if (*c != '-') e = sqOf(c[0] - 'a', 8 - (c[1] - '0'));
  set_state(sd, cs, e, 0, 0, 0);
}
void fen(char *o) { for (int r = 0; r < 8; r++) { int e = 0; for (int f = 0; f < 8; f++) { int p = B[sqOf(f, r)]; if (!p) { e++; continue; } if (e) { *o++ = '0' + e; e = 0; } char ch = NM[p & 7]; if (!(p & 8)) ch -= 32; *o++ = ch; } if (e) *o++ = '0' + e; if (r < 7) *o++ = '/'; }
  *o++ = ' '; *o++ = side ? 'b' : 'w'; *o = 0; }
static int applyUci(const char *u) { if (strlen(u) < 4) return 0; int fr = sqOf(u[0] - 'a', 8 - (u[1] - '0')), to = sqOf(u[2] - 'a', 8 - (u[3] - '0')); int pr = u[4] ? (int)(strchr(NM, u[4]) - NM) : 0;
  i32 buf[256]; int n = gen(buf, 0, 0); for (int i = 0; i < n; i++) if (mFrom(buf[i]) == fr && mTo(buf[i]) == to && mPromo(buf[i]) == pr) { if (make(buf[i])) return 1; } return 0; }
static u32 rs = 1; static u32 rr(void) { rs ^= rs << 13; rs ^= rs >> 17; rs ^= rs << 5; return rs; }
int main(int argc, char **argv) {
  int NODES = atoi(argv[1]); rs = atoi(argv[2]) * 2654435761u + 1; long GAMES = atol(argv[3]);
  for (int p = 0; p < 16; p++) for (int s = 0; s < 120; s++) { PST_MG[p][s] = PSTMG_INIT[p][s]; PST_EG[p][s] = PSTEG_INIT[p][s]; }
  init(); lmr_init(); set_tt_bits(18);
  if (argc > 4) { FILE *nf = fopen(argv[4], "rb"); int Hn; fread(&Hn, 4, 1, nf); if (Hn != NNH) { fprintf(stderr, "H mismatch\n"); return 1; }
    static float f[768 * NNH + NNH + 2 * NNH + 1]; fread(f, 4, 768 * NNH + 3 * NNH + 1, nf); fclose(nf); int o = 0;
    #define QZ(v, sc) ({ double _x = (v) * (sc); _x = _x > 32767 ? 32767 : _x < -32767 ? -32767 : _x; (i16)(_x < 0 ? -(int)(-_x + 0.5) : (int)(_x + 0.5)); })
    for (int i = 0; i < 768 * NNH; i++) NW1[i] = QZ(f[o++], 255); for (int i = 0; i < NNH; i++) NB1[i] = QZ(f[o++], 255); for (int i = 0; i < 2 * NNH; i++) NW2[i] = QZ(f[o++], 1024);
    double b2 = f[o] * 255 * 1024; set_nn(1, (int)(b2 < 0 ? b2 - 0.5 : b2 + 0.5)); }
  static char ops[400][100]; int nop = 0; FILE *fo = fopen(getenv("OPEN") ? getenv("OPEN") : "/home/user/nn/open.txt", "r"); while (nop < 400 && fgets(ops[nop], 100, fo)) { ops[nop][strcspn(ops[nop], "\n")] = 0; nop++; } fclose(fo);
  // Tactics mix: tools/lab/gen/puz.txt holds Lichess puzzle starts ("FEN|first move", never the tac1000 test set). PUZP % of games start there, with no random moves.
  static char (*pz)[128] = 0; int npz = 0, puzp = getenv("PUZP") ? atoi(getenv("PUZP")) : 25;
  { FILE *fp = fopen(getenv("PUZ") ? getenv("PUZ") : "gen/puz.txt", "r"); if (fp) { pz = malloc(sizeof(*pz) * 300000); while (npz < 300000 && fgets(pz[npz], 128, fp)) { pz[npz][strcspn(pz[npz], "\n")] = 0; npz++; } fclose(fp); } }
  static char fens[400][90], mvs[400][6]; static int scs[400], qts[400];
  for (long g = 0; g < GAMES; g++) {
    tt_clear(); int fromPz = npz && (int)(rr() % 100) < puzp;
    if (fromPz) { char ln[128]; snprintf(ln, sizeof ln, "%s", pz[rr() % npz]); char *bar = strchr(ln, '|'); if (!bar) continue; *bar = 0; loadFen(ln); if (!applyUci(bar + 1)) continue; }
    else loadFen(ops[rr() % nop]);
    int ok = 1; for (int k = 0; k < (fromPz ? 0 : 6) && ok; k++) { i32 buf[256]; int n = gen(buf, 0, 0), nl = 0; i32 lg[256]; for (int i = 0; i < n; i++) if (make(buf[i])) { unmake(); lg[nl++] = buf[i]; } if (!nl) { ok = 0; break; } make(lg[rr() % nl]); }
    if (!ok) continue;
    int np = 0, ply = 0, adj = 0; double res = -1;
    while (1) {
      i32 buf[256]; int n = gen(buf, 0, 0), nl = 0; for (int i = 0; i < n; i++) if (make(buf[i])) { unmake(); nl++; }
      if (!nl) { res = inCheck() ? (side == WHITE ? 0 : 1) : 0.5; break; }
      if (half >= 100 || isRepetition() || insufficient() || ply > 400) { res = 0.5; break; }
      int m = go(1e9, 0, NODES); int sc = r_score; int wsc = side == WHITE ? sc : -sc;
      if (abs(sc) > 1500) { if (++adj >= 4) { res = wsc > 0 ? 1 : 0; break; } } else adj = 0;
      if (abs(sc) < 3000 && np < 400) { // every position with the engine's move (field 5) for the rules model; quiet flag 0 = not used by net trainers
        fen(fens[np]); scs[np] = sc; qts[np] = !inCheck() && !(mFlag(m) & F_CAP) && !mPromo(m);
        i32 f0 = mFrom(m), t0 = mTo(m); snprintf(mvs[np], 6, "%c%c%c%c%c", 'a' + fileOf(f0), '8' - rowOf(f0), 'a' + fileOf(t0), '8' - rowOf(t0), mPromo(m) ? NM[mPromo(m) & 7] : 0); np++; }
      make(m); ply++; if (sp > (MAXPLY + 900) * 10) { res = 0.5; break; }
    }
    for (int i = 0; i < np; i++) printf("%s - - 0 1;%.1f;%d;%d;%s\n", fens[i], res, scs[i], qts[i], mvs[i]);
    fflush(stdout);
  }
  return 0; }
