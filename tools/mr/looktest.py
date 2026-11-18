# How much lookahead does it take for "Stockfish's played move is in our top-3"?
# python3 looktest.py FHK_EXE NET POSITIONS.txt PLIES(comma) PROCS OUT.json     lines: "fen;score;uci" (binpack_dump guru mode)
# For every legal root move: play it, search the child to depth plies-1 with our NNUE engine, score = -child score; rank root moves; top-1 / top-3 hit.
import sys, json, chess, chess.engine, multiprocessing as mp
exe, net, posf, plies, procs, out = sys.argv[1], sys.argv[2], sys.argv[3], [int(x) for x in sys.argv[4].split(',')], int(sys.argv[5]), sys.argv[6]
def rank(args):
    chunk = args; eng = chess.engine.SimpleEngine.popen_uci([exe, net]); res = {p: [0, 0, 0] for p in plies}
    for line in chunk:
        fen, sc, mu = line.strip().split(';'); b = chess.Board(fen); sf = chess.Move.from_uci(mu)
        if sf not in b.legal_moves: continue
        moves = list(b.legal_moves)
        for p in plies:
            sc_m = []
            for m in moves:
                b.push(m)
                if b.is_checkmate(): s = 30000
                elif b.is_game_over(claim_draw=False): s = 0
                else:
                    eng.protocol.send_line("ucinewgame") if False else None
                    info = eng.analyse(b, chess.engine.Limit(depth=max(p - 1, 1)))
                    s = -info['score'].pov(b.turn).score(mate_score=30000)
                b.pop(); sc_m.append((s, m.uci()))
            sc_m.sort(key=lambda x: -x[0]); top = [u for _, u in sc_m[:3]]
            res[p][0] += 1; res[p][1] += top[0] == mu; res[p][2] += mu in top
    eng.quit(); return res
if __name__ == '__main__':
    lines = [l for l in open(posf) if l.strip()]; n = max(len(lines) // (procs * 4), 1); chunks = [lines[i:i + n] for i in range(0, len(lines), n)]
    tot = {p: [0, 0, 0] for p in plies}
    with mp.Pool(procs) as pool:
        for r in pool.imap_unordered(rank, chunks):
            for p in plies:
                for i in range(3): tot[p][i] += r[p][i]
    json.dump(tot, open(out, 'w'))
    for p in plies: print('LOOK plies', p, 'positions', tot[p][0], 'top1', round(100 * tot[p][1] / max(tot[p][0], 1), 1), 'top3', round(100 * tot[p][2] / max(tot[p][0], 1), 1))
