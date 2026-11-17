# Lichess eval DB (jsonl on stdin) -> training lines on stdout: "fen 0 1;result_white;score_stm;1;bestmove"
# vs evconv.py: result is the score's own win chance (not a fake 0.5 draw), and the engine best move (UCI) is kept as field 5.
# Keeps deepest eval, depth >= 20, cp (no mate), quiet best move (no capture/promotion/en passant). Scores scaled by 0.65 like before.
import sys, math
try: import orjson as js
except ImportError: import json as js
out = sys.stdout; keep = 0
for l in sys.stdin:
    try:
        j = js.loads(l); ev = max(j['evals'], key=lambda e: e['depth'])
        if ev['depth'] < 20: continue
        pv = ev['pvs'][0]
        if 'cp' not in pv: continue
        mv = pv['line'].split()[0]; fen = j['fen']; parts = fen.split(); bd = {}
        for r, row in enumerate(parts[0].split('/')):
            f = 0
            for c in row:
                if c.isdigit(): f += int(c)
                else: bd[(f, r)] = c; f += 1
        fr = (ord(mv[0]) - 97, 8 - int(mv[1])); to = (ord(mv[2]) - 97, 8 - int(mv[3])); pc = bd.get(fr, '')
        if len(mv) > 4 or to in bd or (pc in 'pP' and fr[0] != to[0]): continue
        w = int(pv['cp'] * 0.65); sc = w if parts[1] == 'w' else -w
        res = 1 / (1 + 10 ** (-0.98 * w / 400))
        out.write('%s 0 1;%.3f;%d;1;%s\n' % (fen, res, sc, mv)); keep += 1
    except Exception: pass
sys.stderr.write('evconv2 kept %d\n' % keep)
