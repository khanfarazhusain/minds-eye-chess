# Builds gen/puz.txt: 100k Lichess puzzle starts (CC0) for self-play, "FEN|opponent's first move".
# Never includes the tac1000 test puzzles. Weighted toward FHK's weak themes (quiet/defensive moves, endgames).
# usage: curl -sL https://database.lichess.org/lichess_db_puzzle.csv.zst | python3 pickpuz.py tac1000.csv > ../gen/puz.txt
import sys, csv, io, hashlib, zstandard
test = {r['id'] for r in csv.DictReader(open(sys.argv[1]))}
WEAK = {'quietMove', 'defensiveMove', 'pawnEndgame', 'rookEndgame', 'bishopEndgame', 'knightEndgame', 'queenEndgame', 'promotion', 'zugzwang', 'endgame'}
r = csv.reader(io.TextIOWrapper(zstandard.ZstdDecompressor().stream_reader(sys.stdin.buffer), encoding='utf-8'))
c = {k: i for i, k in enumerate(next(r))}; weak, other = [], []
for row in r:
    try:
        if row[c['PuzzleId']] in test or not (1600 <= int(row[c['Rating']]) <= 2900) or int(row[c['Popularity']]) < 50: continue
    except ValueError: continue
    h = hashlib.sha1(('fhk-puz-v1' + row[c['PuzzleId']]).encode()).hexdigest()
    item = (h, row[c['FEN']] + '|' + row[c['Moves']].split()[0])
    (weak if WEAK & set(row[c['Themes']].split()) else other).append(item)
weak.sort(); other.sort()
out = weak[:60000] + other[:40000]
for _, l in sorted(out): print(l)
print('weak', len(weak), 'other', len(other), 'out', len(out), file=sys.stderr)
