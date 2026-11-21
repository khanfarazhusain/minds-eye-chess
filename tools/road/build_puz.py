"""Build the Safar (3000 tak) puzzle bank from the open Lichess puzzle database (CC0).

Input : lichess_db_puzzle.csv
Output: packs/road/index.json and packs/road/b<band>_<k>.json
  band = 100-point rating band (400..3100), k = chunk number (PER puzzles each).
  Each puzzle: [lichess_id, fen_solver_to_move, "SAN solution line", rating, "theme codes"].
Every puzzle sits in exactly one file, so the app can promise "no puzzle twice".
"""
import csv, json, os, random, sys, time
import chess

SRC = sys.argv[1] if len(sys.argv) > 1 else 'lichess_db_puzzle.csv'
OUT = sys.argv[2] if len(sys.argv) > 2 else 'packs/road'
PER = int(os.environ.get('PER', '1000'))
CHUNKS = int(os.environ.get('CHUNKS', '4'))
LO, HI, STEP = 400, 3100, 100

TH = {
    'fork': 'fork', 'pin': 'pin', 'skewer': 'skewer', 'discoveredAttack': 'disc', 'doubleCheck': 'disc',
    'mateIn1': 'mate1', 'mateIn2': 'mate2', 'mateIn3': 'mate3', 'mateIn4': 'mate3', 'mateIn5': 'mate3',
    'backRankMate': 'backrank', 'smotheredMate': 'matepat', 'arabianMate': 'matepat', 'anastasiaMate': 'matepat',
    'bodenMate': 'matepat', 'dovetailMate': 'matepat', 'hookMate': 'matepat', 'doubleBishopMate': 'matepat',
    'sacrifice': 'sac', 'deflection': 'deflect', 'attraction': 'attract', 'hangingPiece': 'hanging',
    'trappedPiece': 'trapped', 'promotion': 'promotion', 'underPromotion': 'promotion', 'advancedPawn': 'pawnadv',
    'endgame': 'endgame', 'rookEndgame': 'rookend', 'pawnEndgame': 'pawnend', 'queenEndgame': 'queenend',
    'bishopEndgame': 'minorend', 'knightEndgame': 'minorend', 'queenRookEndgame': 'queenend',
    'defensiveMove': 'defence', 'quietMove': 'quiet', 'zugzwang': 'zugzwang', 'interference': 'interfere',
    'clearance': 'clearance', 'xRayAttack': 'xray', 'intermezzo': 'zwischen', 'capturingDefender': 'remdef',
    'exposedKing': 'kingatk', 'kingsideAttack': 'kingatk', 'opening': 'opening', 'middlegame': 'middle',
    'enPassant': 'special', 'castling': 'special', 'long': 'long', 'veryLong': 'long',
}

def main():
    bands = list(range(LO, HI, STEP))
    keep = CHUNKS * PER
    res = {b: [] for b in bands}
    seen = {b: 0 for b in bands}
    rnd = random.Random(3000)
    with open(SRC, newline='', encoding='utf-8') as f:
        rd = csv.reader(f)
        ix = {k: i for i, k in enumerate(next(rd))}
        for row in rd:
            try:
                r = int(row[ix['Rating']]); dev = int(row[ix['RatingDeviation']])
                pop = int(row[ix['Popularity']]); plays = int(row[ix['NbPlays']])
            except Exception:
                continue
            if r < LO or r >= HI or dev > 90 or pop < 85:
                continue
            if plays < (500 if r < 2300 else 150):
                continue
            b = (r // STEP) * STEP
            seen[b] += 1
            pool = res[b]
            if len(pool) < keep:
                pool.append(row)
            else:
                j = rnd.randrange(seen[b])
                if j < keep:
                    pool[j] = row
    os.makedirs(OUT, exist_ok=True)
    index = {'v': int(time.time()), 'per': PER, 'bands': {}, 'eligible': {}, 'src': 'Lichess open puzzle database (CC0)'}
    total = 0
    for b in bands:
        out = []
        for row in res[b]:
            mv = row[ix['Moves']].split()
            bd = chess.Board(row[ix['FEN']])
            try:
                bd.push_uci(mv[0])
                fen = bd.fen()
                sans = []
                for u in mv[1:]:
                    m = chess.Move.from_uci(u)
                    sans.append(bd.san(m)); bd.push(m)
            except Exception:
                continue
            codes = []
            for t in row[ix['Themes']].split():
                c = TH.get(t)
                if c and c not in codes:
                    codes.append(c)
            out.append([row[ix['PuzzleId']], fen, ' '.join(sans), int(row[ix['Rating']]), ','.join(codes)])
        rnd.shuffle(out)
        n = 0
        for k in range(0, len(out), PER):
            with open(os.path.join(OUT, 'b%d_%d.json' % (b, k // PER)), 'w') as fo:
                json.dump(out[k:k + PER], fo, separators=(',', ':'))
            n += 1
        index['bands'][str(b)] = n
        index['eligible'][str(b)] = seen[b]
        total += len(out)
        print(b, len(out), 'eligible', seen[b])
    index['total'] = total
    with open(os.path.join(OUT, 'index.json'), 'w') as fo:
        json.dump(index, fo, separators=(',', ':'))
    print('total', total)

if __name__ == '__main__':
    main()
