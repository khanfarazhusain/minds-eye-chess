/* Openings Ladder, Level 2 (Club): 1.d4 d5 (QGD, QGA, Slav, Semi-Slav, Tarrasch, Chigorin, Albin) aur systems (London, Colle, Jobava, Torre, Stonewall, BDG). Main Course l4b ke end, Road Level 4. */
module.exports = {
 to: 'l4b',
 road: 4,
 lessons: [
/* ---------------------------------------------------------------- */
{id:'op2qgd',title:'QGD aur QGA (club): main lines dono taraf',sub:'Orthodox, Exchange (Carlsbad), Tartakower, Lasker; QGA Classical',
 yaad:[
  'QGD Orthodox: `4.Bg5 Be7 5.e3 O-O 6.Nf3 h6 7.Bh4 b6` (Tartakower) ya `7...Ne4` (Lasker): trades se aazaadi.',
  'QGD Exchange `cxd5 exd5`: Carlsbad. White minority attack `b4-b5`, Black kingside `...Ne4`, `...f5`.',
  'Black QGD ka sabse bada sawaal: bishop `c8`. Hal: `...b6`+`...Bb7`, ya `...dxc4` + `...e5`/`...c5`.',
  'QGA: `3.e4` (center) ya `3.Nf3`. `3.e4 e5!` ya `3...Nf6`, `3...c5` se center par chot.',
  'Cambridge Springs trap aur Elephant trap: `Nxd5??` ke baad `...Nxd5! Bxd8 Bb4+`.'],
 steps:[
  {t:'line',h:'QGD: Tartakower',drill:'b',md:'Sabse respected QGD. Bishop `b7` se `c8` ki problem hal.',moves:'d4 d5 c4 e6 Nc3 Nf6 Bg5 Be7 e3 O-O Nf3 h6 Bh4 b6 {Tartakower.} cxd5 Nxd5 Bxe7 Qxe7 Nxd5 exd5 Rc1 Be6 Qa4 c5 Qa3 Rc8',theory:1},
  {t:'line',h:'QGD: Lasker Defence',drill:'b',md:'`...Ne4` se pieces trade: Black ko jagah.',moves:'d4 d5 c4 e6 Nc3 Nf6 Bg5 Be7 e3 O-O Nf3 h6 Bh4 Ne4 Bxe7 Qxe7 cxd5 Nxc3 bxc3 exd5 Qb3 Rd8 c4 dxc4 Bxc4 Nc6'},
  {t:'line',h:'QGD Exchange: minority attack',drill:'w',md:'White `cxd5`, phir `b4-b5` se Black ke `c6` ko kamzor karta hai.',moves:'d4 d5 c4 e6 Nc3 Nf6 cxd5 exd5 Bg5 Be7 e3 c6 Qc2 Nbd7 Bd3 O-O Nge2 Re8 O-O Nf8 Rab1 {Minority attack shuru: `b4-b5`.}'},
  {t:'move',after:'d4 d5 c4 e6 Nc3 Nf6 Bg5 Nbd7 cxd5 exd5 Nxd5',q:'Elephant trap! White ne `Nxd5??` khela (pin samjha). Black?',line:['Nxd5'],hint:'Pin asli nahi: queen do, check se wapas lo.',why:'`6...Nxd5! 7.Bxd8 Bb4+ 8.Qd2 Bxd2+ 9.Kxd2 Kxd8` aur Black piece upar.'},
  {t:'line',h:'QGA: Classical main line',drill:'b',md:'Black `...e6`, `...c5`, `...a6`, `...b5` se queenside par khelta hai.',moves:'d4 d5 c4 dxc4 Nf3 Nf6 e3 e6 Bxc4 c5 O-O a6 dxc5 Qxd1 Rxd1 Bxc5 Kf1 b5 Be2 Bb7'},
  {t:'line',h:'QGA: 3.e4 e5!',drill:'b',md:'White center leta hai, Black turant counter.',moves:'d4 d5 c4 dxc4 e4 e5 Nf3 exd4 Bxc4 Bb4+ Nbd2 Nc6 O-O Nf6 e5 Nd5'},
  {t:'quiz',q:'QGD mein Black ka "problem piece" kaunsa hai?',opts:['Knight `b8`','Bishop `c8` (pawns `e6`/`d5` ke peeche)','Rook `a8`'],a:1,why:'Light squares par pawns ke peeche band. `...b6`/`...Bb7` ya `...dxc4` + `...e5`/`...c5` se hal.'}
 ]},
/* ---------------------------------------------------------------- */
{id:'op2slav',title:'Slav aur Semi-Slav (club)',sub:'Slav main, Exchange Slav, Meran, Moscow/Anti-Moscow, Chebanenko',
 yaad:[
  'Slav main: `4.Nc3 dxc4 5.a4 Bf5 6.e3 e6 7.Bxc4 Bb4 8.O-O`.',
  'Exchange Slav `cxd5 cxd5`: symmetrical. Black copy-cat tricks se bacho.',
  'Semi-Slav `...e6` + `...c6`: Meran `6.Bd3 dxc4 7.Bxc4 b5`. Moscow `5.Bg5 h6`.',
  'Chebanenko `4...a6`: `...b5` ka idea, flexible.',
  'Slav ka fayda: bishop `c8` `...e6` se pehle bahar.'],
 steps:[
  {t:'line',h:'Slav: main line',drill:'b',md:'Black pawn leta hai, phir bishop bahar aur pawn wapas.',moves:'d4 d5 c4 c6 Nf3 Nf6 Nc3 dxc4 a4 Bf5 e3 e6 Bxc4 Bb4 O-O Nbd7 Qe2 Bg6 e4 O-O',theory:1},
  {t:'line',h:'Semi-Slav: Meran',drill:'b',md:'Black `...dxc4` aur `...b5` se queenside par jagah.',moves:'d4 d5 c4 c6 Nf3 Nf6 Nc3 e6 e3 Nbd7 Bd3 dxc4 Bxc4 b5 Bd3 Bb7 O-O a6 e4 c5 d5 Qc7',theory:1},
  {t:'line',h:'Semi-Slav: Moscow',drill:'b',md:'`5.Bg5 h6 6.Bxf6 Qxf6`: Black ko 2 bishops, White ko center.',moves:'d4 d5 c4 c6 Nf3 Nf6 Nc3 e6 Bg5 h6 Bxf6 Qxf6 e3 Nd7 Bd3 dxc4 Bxc4 g6 O-O Bg7'},
  {t:'line',h:'Exchange Slav',drill:'b',md:'Symmetrical. Black solid develop karta hai.',moves:'d4 d5 c4 c6 cxd5 cxd5 Nc3 Nf6 Bf4 Nc6 e3 Bf5 Nf3 e6 Qb3 Bb4 Bb5 O-O'},
  {t:'line',h:'Chebanenko (4...a6)',drill:'b',md:'Modern Slav: `...b5` ke saath flexible.',moves:'d4 d5 c4 c6 Nf3 Nf6 Nc3 a6 e3 b5 b3 Bg4 h3 Bxf3 Qxf3 e6'},
  {t:'move',after:'d4 d5 c4 c6 Nf3 Nf6 Nc3 dxc4',q:'Slav. White pawn wapas lene se pehle `...b5` rokta hai. Kaunsi chaal?',line:['a4'],ok:['a4','e4','e3'],why:'`5.a4` `...b5` roka. `5.e4` (Geller Gambit) aur `5.e3` bhi khele jaate hain.'}
 ]},
/* ---------------------------------------------------------------- */
{id:'op2qgo',title:'Tarrasch, Chigorin, Albin, Baltic (club)',sub:'Queen\'s Gambit ke active jawab, aur White ka sahi khel',
 yaad:[
  'Tarrasch `...c5`: Black IQP leta hai active pieces ke liye. White `g3` + `Bg2` se `d5` par dabaav.',
  'Chigorin `2...Nc6`: pieces se center. White `Nc3` + `e4` ya `cxd5`.',
  'Albin `...e5 ...d4`: White `g3`, `Bg2`, `Nbd2`, `Nb3` se `d4` pawn jeetne ki koshish.',
  'Baltic `2...Bf5`: bishop jaldi; White `Qb3` se `b7` par.',
  'Har gambit ke khilaaf: develop, pawn wapas mat do jab tak zaroori na ho, aur `Qb3` jaisi tricks.'],
 steps:[
  {t:'line',h:'Tarrasch: main line',drill:'b',md:'Black IQP lekar active khelta hai.',moves:'d4 d5 c4 e6 Nc3 c5 cxd5 exd5 Nf3 Nc6 g3 Nf6 Bg2 Be7 O-O O-O Bg5 cxd4 Nxd4 h6 Be3 Re8',theory:1},
  {t:'line',h:'Chigorin',drill:'w',md:'Black knights se `d4` par. White center se jawab.',moves:'d4 d5 c4 Nc6 Nc3 dxc4 Nf3 Nf6 e4 Bg4 Be3 e6 Bxc4 Bb4 Qc2 O-O Rd1 Bxf3 gxf3'},
  {t:'line',h:'Albin: White ka modern jawab',drill:'w',md:'`g3`, `Bg2`, `Nbd2` aur `d4` pawn par dabaav.',moves:'d4 d5 c4 e5 dxe5 d4 Nf3 Nc6 g3 Be6 Nbd2 Qd7 Bg2 O-O-O O-O Bh3 Qa4 Bxg2 Kxg2'},
  {t:'move',after:'d4 d5 c4 Bf5',q:'Baltic Defence (`2...Bf5`). White ka sabse strong jawab?',line:['cxd5'],ok:['cxd5','Qb3','Nc3'],why:'`3.cxd5 Bxb1 4.Qa4+!` aur `5.Rxb1`: White ko 2 bishops aur center. `3.Qb3` (`b7` par) bhi strong idea: bishop jaldi gaya to queenside kamzor.'},
  {t:'quiz',q:'Tarrasch Defence mein White `g3` + `Bg2` kyun khelta hai?',opts:['Kingside attack','Bishop se IQP `d5` par seedha dabaav','Castle ke liye'],a:1,why:'Long diagonal `h1-a8` par bishop `d5` ko target karta hai.'}
 ]},
/* ---------------------------------------------------------------- */
{id:'op2sys',title:'Systems (club): London, Jobava, Colle-Zukertort, Torre, BDG',sub:'White ke systems aur Black ke tayyar jawab',
 yaad:[
  'London ke khilaaf: `...c5` + `...Qb6`, ya `...Nh5` se bishop trade, ya KID setup (`...g6`, `...d6`, `...e5`).',
  'Jobava London `Nc3` + `Bf4`: `Nb5` ka khatra. Black `...a6`/`...c6` aur `...Bf5`.',
  'Colle-Zukertort `b3`, `Bb2`, `Ne5`, `f4`: Black `...c5`, `...Nc6`, `...Bb7` mirror.',
  'Torre `Bg5`: `...c5`, `...Qb6`/`...h6` se sawaal.',
  'BDG ke khilaaf: `...Bf5`, `...e6`, `...c6` (Teichmann/Euwe): solid, pawn upar.'],
 steps:[
  {t:'line',h:'London: modern main line',drill:'w',md:'Black `...c5` aur `...Qb6` ke baad White ka standard jawab.',moves:'d4 d5 Bf4 Nf6 e3 c5 c3 Nc6 Nd2 e6 Ngf3 Bd6 Bg3 O-O Bd3 b6 Ne5 Bb7 f4 {Kingside attack: Stonewall jaisa.}'},
  {t:'line',h:'London ke khilaaf: ...Nh5',drill:'b',md:'Bishop `f4` ko trade karne ka simple idea.',moves:'d4 Nf6 Bf4 d5 e3 c5 Nd2 Nc6 c3 e6 Ngf3 Bd6 Bg3 O-O Bd3 Nh5 {Bishop trade ka offer.} Bh4 Be7 Bxe7 Qxe7'},
  {t:'line',h:'Jobava London',drill:'b',md:'`Nc3` + `Bf4`: aggressive. Black `Nb5` rokta hai.',moves:'d4 d5 Nc3 Nf6 Bf4 a6 e3 e6 Nf3 c5 Bd3 Nc6 O-O Be7'},
  {t:'line',h:'Colle-Zukertort',drill:'w',md:'Bishop `b2` aur knight `e5`: kingside attack.',moves:'d4 d5 Nf3 Nf6 e3 e6 Bd3 c5 b3 Nc6 Bb2 Bd6 O-O O-O Nbd2 b6 Ne5 Bb7 a3'},
  {t:'line',h:'BDG: Teichmann Defence',drill:'b',md:'Black pawn rakhta hai aur `...Bg4` se knight trade.',moves:'d4 d5 e4 dxe4 Nc3 Nf6 f3 exf3 Nxf3 Bg4 h3 Bxf3 Qxf3 c6 Be3 e6 Bd3 Nbd7'},
  {t:'move',after:'d4 d5 Bf4 c5 e3 Nc6 c3 Qb6 Qb3',q:'London: White ne `Qb3` khela. Black ka active jawab?',line:['c4'],ok:['c4','Nf6','cxd4'],why:'`...c4` queen ko bhagao aur queenside jagah. `...Nf6`, `...cxd4` bhi theek.'},
  {t:'quiz',q:'London ke khilaaf `...Nh5` ka idea?',opts:['Knight ko kinare par bhejna','Bishop `f4`/`g3` ko trade karna (White ka best piece)','Pawn jeetna'],a:1,why:'London ka sabse achha piece dark bishop hai. Trade se Black aaram se barabar.'}
 ]}
 ]
};
