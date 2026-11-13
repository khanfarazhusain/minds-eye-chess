"""Build the 64 Squares puzzle pack (v2) from the open Lichess puzzle database (CC0).

Input : lichess_db_puzzle.csv (PuzzleId,FEN,Moves,Rating,RatingDeviation,Popularity,NbPlays,Themes,GameUrl,OpeningTags)
Output: packs/puz/index.json and packs/puz/r<band>.json, one file per 200-point rating band.
Each puzzle: [fen_solver_to_move, "solution uci moves", rating, "theme codes"].
"""
import csv, json, os, random, sys, time
import chess

SRC = sys.argv[1] if len(sys.argv) > 1 else 'lichess_db_puzzle.csv'
OUT = sys.argv[2] if len(sys.argv) > 2 else 'packs/puz'
TOTAL = int(os.environ.get('PUZ_TOTAL', '50000'))
LO, HI, STEP = 400, 2600, 200

# Lichess theme -> short code used by the app
TH = {
    'fork': 'fork', 'pin': 'pin', 'skewer': 'skewer', 'discoveredAttack': 'disc', 'doubleCheck': 'dblchk',
    'mateIn1': 'mate1', 'mateIn2': 'mate2', 'mateIn3': 'mate3', 'mateIn4': 'mate4', 'backRankMate': 'backrank',
    'smotheredMate': 'smother', 'sacrifice': 'sac', 'deflection': 'deflect', 'attraction': 'attract',
    'hangingPiece': 'hanging', 'trappedPiece': 'trapped', 'promotion': 'promotion', 'advancedPawn': 'pawnadv',
    'endgame': 'endgame', 'rookEndgame': 'rookend', 'pawnEndgame': 'pawnend', 'queenEndgame': 'queenend',
    'bishopEndgame': 'minorend', 'knightEndgame': 'minorend', 'defensiveMove': 'defence', 'quietMove': 'quiet',
    'zugzwang': 'zugzwang', 'interference': 'interfere', 'clearance': 'clearance', 'xRayAttack': 'xray',
    'intermezzo': 'zwischen', 'capturingDefender': 'remdef', 'exposedKing': 'kingatk', 'kingsideAttack': 'kingatk',
    'opening': 'opening', 'middlegame': 'middle', 'enPassant': 'ep', 'castling': 'castle', 'underPromotion': 'promotion',
    'arabianMate': 'matepat', 'anastasiaMate': 'matepat', 'bodenMate': 'matepat', 'dovetailMate': 'matepat',
    'hookMate': 'matepat', 'doubleBishopMate': 'matepat',
}

def band(r):
    return max(LO, min(HI - STEP, (r // STEP) * STEP))

def main():
    nb = (HI - LO) // STEP
    per = TOTAL // nb
    pools = {b: [] for b in range(LO, HI, STEP)}
    with open(SRC, newline='', encoding='utf-8') as f:
        rd = csv.reader(f)
        head = next(rd)
        ix = {k: i for i, k in enumerate(head)}
        for row in rd:
            try:
                r = int(row[ix['Rating']]); rd_ = int(row[ix['RatingDeviation']])
                pop = int(row[ix['Popularity']]); plays = int(row[ix['NbPlays']])
            except Exception:
                continue
            if r < LO or r >= HI or rd_ > 95 or pop < 80 or plays < 150:
                continue
            pools[band(r)].append(row)
    rnd = random.Random(64)
    index = {'v': int(time.time()), 'bands': {}, 'themes': {}}
    os.makedirs(OUT, exist_ok=True)
    total = 0
    for b, rows in pools.items():
        rnd.shuffle(rows)
        out, seen = [], set()
        for row in rows:
            if len(out) >= per:
                break
            fen = row[ix['FEN']]; mv = row[ix['Moves']].split()
            if len(mv) < 2 or fen in seen:
                continue
            bd = chess.Board(fen)
            try:
                bd.push(chess.Move.from_uci(mv[0]))
            except Exception:
                continue
            codes = []
            for t in row[ix['Themes']].split():
                c = TH.get(t)
                if c and c not in codes:
                    codes.append(c)
            seen.add(fen)
            out.append([bd.fen(), ' '.join(mv[1:]), int(row[ix['Rating']]), ','.join(codes)])
        with open(os.path.join(OUT, 'r%d.json' % b), 'w') as fo:
            json.dump(out, fo, separators=(',', ':'))
        th = {}
        for p in out:
            for c in filter(None, p[3].split(',')):
                th[c] = th.get(c, 0) + 1
        index['bands'][str(b)] = len(out)
        index['themes'][str(b)] = th
        total += len(out)
        print(b, len(out), 'of', len(rows))
    index['total'] = total
    with open(os.path.join(OUT, 'index.json'), 'w') as fo:
        json.dump(index, fo, separators=(',', ':'))
    print('total', total)

if __name__ == '__main__':
    main()
