# Absolute-strength calibration: native FHK (build from gen/uci.c) vs Stockfish with UCI_Elo = LEVEL, fixed movetime both.
# python3 sfcal.py FHK_EXE NET LEVEL GAMES MOVETIME_MS PROCS OUT.json   (needs python-chess, stockfish)
import sys, json, chess, chess.engine, random, multiprocessing as mp
exe, net, level, games, ms, procs, out = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), int(sys.argv[5]), int(sys.argv[6]), sys.argv[7]
OP = json.load(open(__file__.rsplit('/', 1)[0] + '/openings.json'))
def play(job):
    gi, = job; fen = OP[(gi // 2) % len(OP)]; fhk_white = gi % 2 == 0
    f = chess.engine.SimpleEngine.popen_uci([exe, net]); s = chess.engine.SimpleEngine.popen_uci(['stockfish'])
    s.configure({'UCI_LimitStrength': True, 'UCI_Elo': level, 'Threads': 1, 'Hash': 16})
    b = chess.Board(fen); lim = chess.engine.Limit(time=ms / 1000); adj = 0; res = 0.5
    while not b.is_game_over(claim_draw=True) and len(b.move_stack) < 300:
        mine = (b.turn == chess.WHITE) == fhk_white
        r = (f if mine else s).play(b, lim, info=chess.engine.INFO_SCORE)
        if mine and r.info.get('score') is not None:
            sc = r.info['score'].pov(b.turn).score(mate_score=30000)
            if abs(sc) > 1200:
                adj += 1
                if adj >= 6: res = 1.0 if sc > 0 else 0.0; break
            else: adj = 0
        b.push(r.move)
    else:
        o = b.outcome(claim_draw=True)
        if o is not None and o.winner is not None: res = 1.0 if o.winner == fhk_white else 0.0
    f.quit(); s.quit(); return res
if __name__ == '__main__':
    with mp.Pool(procs) as p: r = p.map(play, [(i,) for i in range(games)], chunksize=1)
    json.dump(r, open(out, 'w')); print('RESULT level', level, 'games', len(r), 'FHK score', round(100 * sum(r) / len(r), 1))
