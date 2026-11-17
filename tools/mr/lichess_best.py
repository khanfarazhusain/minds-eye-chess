# Lichess eval DB jsonl (stdin) -> "fen|bestUci" for every Nth position (no filtering of captures: the rules model must see all kinds of best moves)
import sys, json
N = int(sys.argv[1]); n = 0
for l in sys.stdin:
    n += 1
    if n % N: continue
    try:
        j = json.loads(l); ev = max(j['evals'], key=lambda e: e['depth'])
        if ev['depth'] < 20: continue
        line = ev['pvs'][0].get('line', '')
        if line: print(j['fen'] + ' 0 1|' + line.split()[0])
    except Exception: pass
