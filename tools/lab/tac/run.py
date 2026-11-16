# FHK tactics test: plays every puzzle in tac1000.csv with a fixed node budget per move.
# A puzzle counts as solved only if every one of our moves matches the solution line;
# at the last move any move the engine reports as mate in 1 is also accepted (Lichess rule).
# usage: python3 run.py ENGINE NET tac1000.csv NODES [shard nshards] > result.json
import sys, csv, json, subprocess
eng, net, path, nodes = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4])
sh, nsh = (int(sys.argv[5]), int(sys.argv[6])) if len(sys.argv) > 6 else (0, 1)
p = subprocess.Popen([eng, net], stdin=subprocess.PIPE, stdout=subprocess.PIPE, text=True, bufsize=1)
def ask(fen, moves):
    p.stdin.write(f"position fen {fen} moves {' '.join(moves)}\ngo nodes {nodes}\n"); p.stdin.flush()
    last = ''
    while True:
        l = p.stdout.readline()
        if not l: raise SystemExit('engine died')
        if l.startswith('info'): last = l
        if l.startswith('bestmove'): return l.split()[1], ('score mate 1 ' in last + ' ')
rows = list(csv.DictReader(open(path)))
out = []
for i, r in enumerate(rows):
    if i % nsh != sh: continue
    mv = r['moves'].split(); ok = True; first = None
    p.stdin.write("ucinewgame\n")
    for k in range(1, len(mv), 2):
        bm, mate1 = ask(r['fen'], mv[:k])
        if first is None: first = bm
        if bm == mv[k]: continue
        if k == len(mv) - 1 and mate1: continue
        ok = False; break
    out.append({'id': r['id'], 'ok': ok, 'first': first == mv[1], 'rating': int(r['rating']), 'themes': r['themes']})
p.stdin.write("quit\n"); p.stdin.flush()
json.dump(out, sys.stdout)
