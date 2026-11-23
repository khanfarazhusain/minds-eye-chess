/* Openings Ladder, Level 3 (Advanced): Indian/flank structures aur move orders. Course "Openings 3", Road Level 6. */
module.exports = {
 newLevel: {id:'op3',title:'Openings 3: advanced trees, structures aur plans',sub:'12-15+ chaal ke trees, move orders, transpositions, har opening ka middlegame plan',
  intro:'Ab har opening ko gehraai se: lambi lines, move order ki chaalaakiyan, aur opening se aane wale pawn structures ke plans. Yahan structures aur plans wale lessons kaam aayenge.'},
 road: 6,
 lessons: [
/* ---------------------------------------------------------------- */
{id:'indstr',title:'Indian structures: KID chain, Benoni, Hedgehog',sub:'Band aur asymmetric centers ke plans',
 yaad:[
  'KID chain `d5-e4` vs `d6-e5`: White `c5` (queenside), Black `...f5` (kingside). Jad par chot.',
  'Benoni: White `e5` break + `f4`; Black `...b5`, `...c4`, knight `e5`/`c5`.',
  'Hedgehog (`a6-b6-d6-e6`): Black kam jagah par flexible; breaks `...b5` ya `...d5`.',
  'Maroczy jaisa bind English/Sicilian dono mein: pieces trade karke breaks.',
  'Structure batata hai: kahan attack, kahan defence.'],
 steps:[
  {t:'line',h:'KID: Bayonet Attack (9.b4)',drill:'w',md:'White queenside par sabse tez: `b4`, `c5`.',moves:'d4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Nf3 O-O Be2 e5 O-O Nc6 d5 Ne7 b4 Nh5 Re1 f5 Ng5 Nf6 Bf3 c6',theory:1},
  {t:'quiz',q:'KID chain `d5-e4` (White) vs `d6-e5` (Black). Black kis pawn break se attack karta hai?',opts:['`...c6`','`...f5`: chain ke `e4` par','`...a5`'],a:1,why:'`...f5` White ke `e4` (chain ke beech/jad ke paas) par chot. White `c5` se `d6` par.',test:1},
  {t:'line',h:'Hedgehog (English se)',drill:'b',md:'Black `a6`, `b6`, `d6`, `e6`: kam jagah par spring jaisa.',moves:'c4 c5 Nf3 Nf6 Nc3 e6 g3 b6 Bg2 Bb7 O-O Be7 d4 cxd4 Qxd4 d6 Rd1 a6 b3 Nbd7 e4 Qb8',theory:1},
  {t:'move',after:'d4 Nf6 c4 c5 d5 e6 Nc3 exd5 cxd5 d6 e4 g6 Nf3 Bg7 Be2 O-O O-O Re8 Nd2 Na6 f3 Nc7 a4 b6',q:'Benoni. White ka standard plan: knight ko best square par lao.',line:['Nc4'],ok:['Nc4','Kh1'],why:'`Nc4` `d6` par dabaav aur `b6`/`e5` par nazar. `Kh1` bhi typical.'},
  {t:'quiz',q:'Hedgehog mein Black ke 2 main breaks?',opts:['`...b5` aur `...d5`','`...h5` aur `...g5`','Koi nahi'],a:0,why:'Kam jagah = sahi waqt par break se position kholna.',test:1}
 ]},
/* ---------------------------------------------------------------- */
{id:'indord',title:'1.d4 Nf6 move orders: Nimzo vs QID, KID vs Grunfeld, Catalan',sub:'2.c4 e6 3.Nc3 / 3.Nf3 / 3.g3, aur 2...g6 ke raaste',
 yaad:[
  '`3.Nc3` Nimzo allow karta hai; `3.Nf3` QID/Bogo; `3.g3` Catalan.',
  'KID vs Grunfeld: `...g6` ke baad White `Nf3`/`g3` order se Grunfeld ke kuch lines rokta hai.',
  'Black `1...Nf6` flexible: `2.Nf3` ke baad `...d5` ya `...g6`.',
  'Transposition: Catalan aur QGD aksar milte hain.',
  'Apna repertoire move orders se bachao: jo line nahi chahiye, use band karo.'],
 steps:[
  {t:'info',h:'2.c4 e6 ke baad White ki choice',after:'d4 Nf6 c4 e6',md:'- `3.Nc3`: Nimzo-Indian (`3...Bb4`) allow.\n- `3.Nf3`: Queen\'s Indian (`3...b6`) ya Bogo (`3...Bb4+`).\n- `3.g3`: Catalan.\n\nJis opening ke khilaaf tumhari taiyaari nahi, use move order se bachao.'},
  {t:'quiz',q:'White ko Nimzo-Indian pasand nahi. `1.d4 Nf6 2.c4 e6` ke baad kaunsi chaal?',opts:['`3.Nc3`','`3.Nf3` ya `3.g3`','`3.e4`'],a:1,why:'`3.Nc3` ke bina `...Bb4` pin nahi hota.',test:1},
  {t:'line',h:'Catalan se QGD (transposition)',drill:'w',md:'`...d5` aur `...Be7`: Closed Catalan, QGD jaisa structure.',moves:'d4 Nf6 c4 e6 g3 d5 Nf3 Be7 Bg2 O-O O-O c6 Qc2 Nbd7 Nbd2 b6 e4 Bb7'},
  {t:'line',h:'Grunfeld se bachna: 3.f3',drill:'w',md:'`1.d4 Nf6 2.c4 g6 3.f3`: `...d5` ke khilaaf `e4` tayyar.',moves:'d4 Nf6 c4 g6 f3 d5 cxd5 Nxd5 e4 Nb6 Nc3 Bg7 Be3 O-O f4'},
  {t:'move',after:'d4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Nf3 O-O h3',q:'KID Makogonov `h3`: `...Bg4`/`...Ng4` roka. Black ka typical jawab?',line:['e5'],ok:['e5','c5','Na6'],why:'`...e5` (center), `...c5` (Benoni jaisa) ya `...Na6`: sab theory.'}
 ]}
 ]
};
