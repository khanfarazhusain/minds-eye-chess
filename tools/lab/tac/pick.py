# Picks the fixed FHK tactics test: 1000 Lichess puzzles (CC0) rated 2300+, well-established, chosen by a fixed hash so the set never changes.
# usage: curl -sL https://database.lichess.org/lichess_db_puzzle.csv.zst | python3 pick.py > tac1000.csv
import sys, csv, io, hashlib, zstandard
r = csv.reader(io.TextIOWrapper(zstandard.ZstdDecompressor().stream_reader(sys.stdin.buffer), encoding='utf-8'))
head = next(r); c = {k: i for i, k in enumerate(head)}
pool = []
for row in r:
    try:
        if int(row[c['Rating']]) >= 2300 and int(row[c['RatingDeviation']]) <= 80 and int(row[c['Popularity']]) >= 80 and int(row[c['NbPlays']]) >= 300:
            pool.append((hashlib.sha1(('fhk-tac-v1' + row[c['PuzzleId']]).encode()).hexdigest(), row[c['PuzzleId']], row[c['FEN']], row[c['Moves']], row[c['Rating']], row[c['Themes']]))
    except ValueError: pass
pool.sort()
print('id,fen,moves,rating,themes'); w = csv.writer(sys.stdout)
for p in pool[:1000]: w.writerow(p[1:])
print('pool', len(pool), file=sys.stderr)
