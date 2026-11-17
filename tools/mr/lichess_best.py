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
        if not line: continue
        u = line.split()[0]; brd = j['fen'].split()[0]  # Lichess castling is king-takes-rook (e1h1) -> e1g1
        if u[:2] in ('e1', 'e8') and u[1] == u[3] and u[2] in 'ah':
            rows = brd.split('/'); row = rows[0 if u[1] == '8' else 7]; sq = ''.join(c if not c.isdigit() else '.' * int(c) for c in row)
            if sq[4] in 'Kk' and sq['abcdefgh'.index(u[2])] in 'Rr': u = u[:2] + ('g' if u[2] == 'h' else 'c') + u[3]
        print(j['fen'] + ' 0 1|' + u)
    except Exception: pass
