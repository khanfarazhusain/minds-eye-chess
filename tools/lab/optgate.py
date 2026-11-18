# Tuned vs default search constants, same net. python3 optgate.py EXE NET THETA.json PAIRS MOVETIME_MS|nodes=N PROCS OUT.json SHARD NSHARDS
import sys, json, chess, chess.engine, multiprocessing as mp
exe, net, th, pairs, tc, procs, out, shard, nsh = sys.argv[1], sys.argv[2], json.load(open(sys.argv[3]))['theta'], int(sys.argv[4]), sys.argv[5], int(sys.argv[6]), sys.argv[7], int(sys.argv[8]), int(sys.argv[9])
OP = json.load(open(__file__.rsplit('/', 1)[0] + '/openings.json'))
lim = chess.engine.Limit(nodes=int(tc[6:])) if tc.startswith('nodes=') else chess.engine.Limit(time=int(tc) / 1000)
tuned = {k: int(round(v)) for k, v in th.items()}
def play(job):
    gi, = job; fen = OP[(gi // 2) % len(OP)]; tw = gi % 2 == 0
    t = chess.engine.SimpleEngine.popen_uci([exe, net]); d = chess.engine.SimpleEngine.popen_uci([exe, net]); t.configure(tuned)
    b = chess.Board(fen); adj = 0; res = 0.5
    while not b.is_game_over(claim_draw=True) and len(b.move_stack) < 300:
        mine = (b.turn == chess.WHITE) == tw
        r = (t if mine else d).play(b, lim, info=chess.engine.INFO_SCORE)
        if r.info.get('score') is not None:
            sc = r.info['score'].pov(chess.WHITE).score(mate_score=30000)
            if abs(sc) > 1000:
                adj += 1
                if adj >= 6: res = 1.0 if (sc > 0) == tw else 0.0; break
            else: adj = 0
        b.push(r.move)
    else:
        o = b.outcome(claim_draw=True)
        if o is not None and o.winner is not None: res = 1.0 if (o.winner == chess.WHITE) == tw else 0.0
    t.quit(); d.quit(); return res
if __name__ == '__main__':
    jobs = [(2 * (shard * pairs + i) + j,) for i in range(pairs) for j in (0, 1)]
    with mp.Pool(procs) as p: r = p.map(play, jobs, chunksize=1)
    json.dump(r, open(out, 'w')); print('tuned score', round(100 * sum(r) / len(r), 1), 'games', len(r))
