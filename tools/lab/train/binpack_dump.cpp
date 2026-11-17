// binpack -> FHK training text. Own code; reads Stockfish .binpack through the official nnue-pytorch reader header (cloned at build time, not copied here).
// Output per kept position: "fen 0 1;result_white;score_stm;1;bestmove_uci"   (same format featpack.c reads; result_white = 0 / 0.5 / 1)
// Usage: ./binpack_dump file.binpack [max_positions] [score_scale] [min_ply]   (file may be /dev/stdin)
// Filters (research from other engines): skip first plies (opening), mate/huge scores (|s|>3000), side to move in check, best move is capture / promotion / en passant,
// and positions where the game result contradicts a big score (|s|>600 but the stm lost/won the other way) = noise.
#include "nnp/data_loader/cpp/lib/binpack.h"
#include <cstdio>
#include <cstdlib>
#include <cmath>
#include <vector>
int main(int argc, char** argv) {
  binpack::CompressedTrainingDataEntryReader r(argv[1]);
  long lim = argc > 2 ? atol(argv[2]) : 1L << 60; double scale = argc > 3 ? atof(argv[3]) : 1.0; int minPly = argc > 4 ? atoi(argv[4]) : 8;
  std::vector<std::pair<int,double>> fit; long n = 0, kept = 0, sPos = 0, sNeg = 0, agree = 0, disagree = 0;
  while (r.hasNext() && n < lim) {
    auto e = r.next(); n++;
    int sc = e.score; int res = e.result;               // result: -1/0/1 from the side to move
    if (e.ply < minPly) continue;
    if (std::abs(sc) > 3000) continue;
    if (e.pos.isCheck()) continue;
    if (e.move.type != chess::MoveType::Normal) continue;                 // promotion, castle, ep: skip (castle is fine for the engine but keep it quiet and simple)
    if (e.pos.pieceAt(e.move.to) != chess::Piece::none()) continue;       // capture
    if (std::abs(sc) > 600 && res != 0 && ((sc > 0) != (res > 0))) continue; // result contradicts score
    if (res != 0 && std::abs(sc) > 100) { if ((sc > 0) == (res > 0)) agree++; else disagree++; }
    bool white = e.pos.sideToMove() == chess::Color::White;
    double resW = 0.5 + 0.5 * (white ? res : -res);
    int s = (int)std::lround(sc * scale);
    printf("%s;%.1f;%d;1;%s\n", e.pos.fen().c_str(), resW, s, chess::uci::moveToUci(e.pos, e.move).c_str());
    kept++; if (fit.size() < 400000 && res != 0) fit.push_back({sc, resW});
  }
  { double best = 1e9, bk = 1; for (int k = 10; k <= 200; k += 5) { double sc2 = k / 100.0, mse = 0; for (auto& q : fit) { double p = 1 / (1 + std::exp(-0.98 * q.first * sc2 / 400)); mse += (p - q.second) * (p - q.second); } mse /= fit.size() ? fit.size() : 1; if (mse < best) { best = mse; bk = sc2; } }
    fprintf(stderr, "binpack_dump best score scale for sigmoid(0.98*s*scale/400) vs DECISIVE results: %.2f (mse %.4f)\n", bk, best); }
  fprintf(stderr, "binpack_dump read %ld kept %ld result-vs-score agree %ld disagree %ld\n", n, kept, agree, disagree);
}
