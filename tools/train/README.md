# Pro training ladders (Main Course + Road to 3000)

Practice drills, beginner se GM level tak, jo course ke sequence mein **sirf apne zaroori lessons ke baad** aate hain.

| Ladder | Rungs | Source |
|---|---|---|
| Position eval (`tr.ev1-5`) | points gino → development/king safety → 5 elements → eval number → compensation | engine games + puzzle end positions, har ek Stockfish 16 se check |
| Endgame vs engine (`tr.eg1-5`) | basic mates → K+P → square rule/passed pawn → Lucena/Philidor/Vancura → B+N mate | random/template positions, Stockfish se verified win/draw |
| Defence (`tr.df1-5`) | check se bacho → piece bachao → only-move puzzles 900-2800 | engine games (Stockfish) + packs/road defence puzzles |
| Time pressure (`tr.rs1-5`) | mate-in-1 rush → free piece → tactics → increment clock → GM rush | packs/road puzzles |
| Sparring (`tr.sp1-5`) | develop+castle → fayda bachao → plan → endgame jeeto → full Stockfish | engine games, Stockfish (skill level) opponent, end eval check |
| Guess the move (`tr.gm1-5`) | traps → openings → 2000-2300 → 2400-2600 → masters + 2700+ | course lines + engine games, Stockfish points pehle se nikale |
| Apne games ka review (`tr.mr1-4`) | blunders → CCT wajah → pehle khud phir engine → GM (inaccuracies) | user ka PGN ya Road ke Lichess games, galti = review card |

Har drill lesson: pehle practice (hint, undo), phir test (pool se naye sawaal, ek koshish, 80%). Test pass = agla lesson khulta hai.
Puzzle sets sirf un themes ke puzzles lete hain jo drill se pehle sikhaye gaye (`themes.js`, Road ka `LES_TH`).

## Build
```
sudo apt install stockfish        # generators ke liye
node tools/train/gen-eval.js      # ladders/eval.json      (EVAL_CACHE=/tmp/x.json se dobara tez)
node tools/train/gen-endgame.js   # ladders/endgame.json
node tools/train/gen-defence-rush.js  # ladders/defence.json, ladders/rush.json
node tools/train/gen-spar-guess.js    # ladders/spar.json, guess.json, review.json
node tools/train/build.js         # course.html TRAIN likho + sequence check + road.html rebuild
```
`check-order.js` fail karta hai agar koi drill kisi aise lesson ya chess term ko use kare jo usse pehle (Main Course ya Road) nahi sikhaya gaya.
