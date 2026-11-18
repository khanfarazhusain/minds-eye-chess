# SPSA tuning of FHK search constants (UCI spin options declared by uci.c).
# python3 spsa.py EXE NET OUT.json MINUTES SEED NODES PROCS [PARAMS comma list]
# Each iteration: random +-1 direction, theta+ vs theta- play PROCS game pairs at fixed nodes (speed independent), step toward the winner.
import sys, json, time, random, math, chess, chess.engine, multiprocessing as mp
exe, net, out, minutes, seed, nodes, procs = sys.argv[1], sys.argv[2], sys.argv[3], float(sys.argv[4]), int(sys.argv[5]), int(sys.argv[6]), int(sys.argv[7])
NAMES = (sys.argv[8] if len(sys.argv) > 8 else 'RFP,NR0,NRD,NRE,FUT1,FUT0,LMP0,LMP1,SEEC,ASP,RAZ,LMRB,LMRD').split(',')
OP = json.load(open(__file__.rsplit('/', 1)[0] + '/openings.json'))
def declared():
    e = chess.engine.SimpleEngine.popen_uci([exe, net]); o = {k: (v.default, v.min, v.max) for k, v in e.options.items() if k in NAMES}; e.quit(); return o
def play(job):
    fen, th_w, th_b = job
    ws = chess.engine.SimpleEngine.popen_uci([exe, net]); bs = chess.engine.SimpleEngine.popen_uci([exe, net])
    ws.configure({k: v for k, v in th_w.items()}); bs.configure({k: v for k, v in th_b.items()})
    b = chess.Board(fen); lim = chess.engine.Limit(nodes=nodes); adj = 0; res = 0.5
    while not b.is_game_over(claim_draw=True) and len(b.move_stack) < 300:
        e = ws if b.turn == chess.WHITE else bs
        r = e.play(b, lim, info=chess.engine.INFO_SCORE)
        if r.info.get('score') is not None:
            sc = r.info['score'].pov(chess.WHITE).score(mate_score=30000)
            if abs(sc) > 1000:
                adj += 1
                if adj >= 6: res = 1.0 if sc > 0 else 0.0; break
            else: adj = 0
        b.push(r.move)
    else:
        o = b.outcome(claim_draw=True)
        if o is not None and o.winner is not None: res = 1.0 if o.winner == chess.WHITE else 0.0
    ws.quit(); bs.quit(); return res
if __name__ == '__main__':
    rnd = random.Random(seed); D = declared(); names = [n for n in NAMES if n in D]
    theta = {n: float(D[n][0]) for n in names}; c0 = {n: max(1.0, (D[n][2] - D[n][1]) * 0.06) for n in names}
    a0, A = 0.6, 20; t0 = time.time(); k = 0; hist = []
    with mp.Pool(procs) as pool:
        while time.time() - t0 < minutes * 60:
            k += 1; ck = 1.0 / k ** 0.101; ak = a0 / (A + k) ** 0.602 * 4
            delta = {n: rnd.choice((-1, 1)) for n in names}
            tp = {n: int(round(min(D[n][2], max(D[n][1], theta[n] + c0[n] * ck * delta[n])))) for n in names}
            tm = {n: int(round(min(D[n][2], max(D[n][1], theta[n] - c0[n] * ck * delta[n])))) for n in names}
            jobs = []
            for i in range(procs):
                fen = OP[rnd.randrange(len(OP))]; jobs.append((fen, tp, tm)); jobs.append((fen, tm, tp))
            res = pool.map(play, jobs, chunksize=1)
            # score of theta+ : white game result for even jobs, black for odd
            sp = sum(r if i % 2 == 0 else 1 - r for i, r in enumerate(res)) / len(res)
            g = (sp - 0.5) * 2
            for n in names:
                theta[n] = min(D[n][2], max(D[n][1], theta[n] + ak * c0[n] * g * delta[n]))
            hist.append(round(sp, 3))
            json.dump({'iter': k, 'theta': {n: round(theta[n], 2) for n in names}, 'defaults': {n: D[n][0] for n in names}, 'plus_score': hist}, open(out, 'w'))
            print(k, round(sp, 3), {n: round(theta[n], 1) for n in names}, flush=True)
