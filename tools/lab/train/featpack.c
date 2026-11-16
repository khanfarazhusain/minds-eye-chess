// featpack: training text ("fen;result;score;quiet") on stdin -> 37-byte records on stdout (32 bytes board nibbles a1=0, 1 byte stm, float target).
// Same filtering and target as train3.c. Usage: zcat data.gz | ./featpack 0.8 > pos.bin     (0.8 = lambda)
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>
typedef struct __attribute__((packed)) { unsigned char b[32]; unsigned char stm; float t; } Pos;
static int fen2pos(const char *fen, Pos *p) { memset(p->b, 0, 32);
  const char *nm = "pnbrqk"; int r = 0, f = 0, n = 0; const char *c = fen;
  for (; *c && *c != ' '; c++) { if (*c == '/') { r++; f = 0; continue; } if (*c >= '1' && *c <= '8') { f += *c - '0'; continue; }
    char lc = *c | 32; const char *q = strchr(nm, lc); if (!q || !lc || r > 7 || f > 7) return 0; int t = (int)(q - nm), col = (*c == lc); int sq = (7 - r) * 8 + f;
    if (n < 32) { int v = col * 6 + t + 1; p->b[sq >> 1] |= v << ((sq & 1) * 4); n++; } f++; }
  p->stm = c[1] == 'b'; return n; }
int main(int argc, char **argv) { double lam = argc > 1 ? atof(argv[1]) : 0.8; static char line[400]; Pos p; long n = 0;
  static Pos buf[65536]; int nb = 0; setvbuf(stdout, NULL, _IOFBF, 1 << 20);
  while (fgets(line, sizeof line, stdin)) { char *s1 = strchr(line, ';'); if (!s1) continue; *s1 = 0; char *s2 = strchr(s1 + 1, ';'); if (!s2) continue; char *s3 = strchr(s2 + 1, ';'); if (!s3) continue;
    double res = atof(s1 + 1); int sc = atoi(s2 + 1), quiet = atoi(s3 + 1); if (!quiet || abs(sc) > 3000) continue; if (!fen2pos(line, &p)) continue;
    double rs = p.stm ? 1 - res : res, ps = 1 / (1 + pow(10, -0.98 * sc / 400.0)); p.t = (float)(lam * ps + (1 - lam) * rs);
    buf[nb++] = p; n++; if (nb == 65536) { fwrite(buf, sizeof(Pos), nb, stdout); nb = 0; } }
  if (nb) fwrite(buf, sizeof(Pos), nb, stdout); fprintf(stderr, "featpack: %ld positions\n", n); return 0; }
