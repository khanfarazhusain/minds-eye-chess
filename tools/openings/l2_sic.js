/* Openings Ladder, Level 2 (Club): Sicilian, dono taraf. Main Course l4 ke end, Road Level 3. */
module.exports = {
 to: 'l4',
 road: 3,
 lessons: [
/* ---------------------------------------------------------------- */
{id:'op2najd',title:'Najdorf (club): English Attack, 6.Bg5, 6.Be2',sub:'White ke 3 main systems aur Black ke jawab',
 yaad:[
  'English Attack `6.Be3 e5 7.Nb3 Be6 8.f3`: White `Qd2`, `O-O-O`, `g4`. Black `...b5`, `...Nbd7`. Opposite castling race.',
  '`6.Be3 Ng4!?` bishop ko pareshan karta hai: `7.Bg5 h6 8.Bh4 g5 9.Bg3 Bg7`.',
  '`6.Bg5 e6 7.f4`: sabse tez. `7...Be7 8.Qf3 Qc7 9.O-O-O Nbd7`.',
  '`6.Be2 e5 7.Nb3 Be7 8.O-O O-O`: Classical, positional. `d5` square ki ladai.',
  'Najdorf `...e5` ke baad `d5` square kamzor: Black use `...Be6` se control kare.'],
 steps:[
  {t:'line',h:'English Attack',drill:'b',md:'Aaj ka sabse popular. Dono kings alag taraf: jo tez attack kare, woh jeete.',moves:'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6 Be3 {English Attack.} e5 Nb3 Be6 {`d5` control.} f3 Be7 Qd2 O-O O-O-O Nbd7 g4 {White ka pawn storm.} b5 {Black ka bhi!} g5 b4 {Race!}',theory:1},
  {t:'move',after:'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6 Be3',q:'`6.Be3` ke khilaaf Black ka tricky aur strong idea: bishop ko pareshan karo.',line:['Ng4'],ok:['Ng4','e5','e6'],why:'`6...Ng4!?` `7.Bg5 h6 8.Bh4 g5 9.Bg3 Bg7`. `6...e5` aur `6...e6` bhi main lines.'},
  {t:'line',h:'6.Bg5: sabse sharp',drill:'b',md:'White `f4`, `Qf3`, `O-O-O`. Black solid setup se jawab deta hai.',moves:'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6 Bg5 e6 {`Nd5` aur `e5` roka.} f4 Be7 Qf3 Qc7 O-O-O Nbd7 g4 b5',theory:1},
  {t:'line',h:'6.Be2: Classical',drill:'w',md:'Positional. White `d5` square par knight laane ki koshish karta hai.',moves:'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6 Be2 e5 Nb3 Be7 O-O O-O Be3 Be6 Qd2 Nbd7 a4 {Queenside ko jagah nahi dena.}'},
  {t:'quiz',q:'Najdorf mein `...e5` ke baad sabse kamzor square kaunsa hai?',opts:['`d5`','`h7`','`a6`'],a:0,why:'`d6` pawn `e5` ke baad `d5` ko pawn se control nahi kar sakta. White knight wahan aana chahta hai. Isliye `...Be6`.'},
  {t:'move',after:'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6 Bg5 e6 f4 Qb6',q:'Poisoned Pawn! Black ki queen `b2` par nazar rakh rahi hai. White ka main line jawab?',line:['Qd2'],ok:['Qd2','Nb3'],why:'`8.Qd2` pawn de deta hai (Poisoned Pawn variation, bahut sharp). `8.Nb3` safe tareeka.'},
  {t:'quiz',q:'English Attack mein dono taraf ka plan?',opts:['Dono center mein khelte hain','Opposite castling: White kingside pawns (`g4-g5`), Black queenside pawns (`...b5-b4`)','Dono draw chahte hain'],a:1,why:'Opposite castling = pawn storm race. Ek tempo bhi keemti.'}
 ]},
/* ---------------------------------------------------------------- */
{id:'op2drag',title:'Dragon aur Accelerated Dragon (club)',sub:'Yugoslav Attack, 9...d5, Maroczy Bind',
 yaad:[
  'Yugoslav: `Be3`, `f3`, `Qd2`, `O-O-O`, `Bc4`/`g4`/`h4`. Plan: `Bh6` se dragon bishop trade, phir h-file par mate.',
  '`9.O-O-O` ke khilaaf `9...d5!` center todo.',
  '`9.Bc4 Bd7 10.O-O-O Rc8 11.Bb3 Ne5 12.h4 h5` (Soltis): `h5` se White ka h-file attack dheema.',
  'Accelerated Dragon (`...g6` jaldi, `...d6` nahi): `...d5` ek chaal mein. White `c4` (Maroczy Bind) se `d5` rokta hai.',
  'Maroczy ke khilaaf Black: pieces trade (`...Nxd4`), `...Bd7-c6`, `...a5`, `...b5`/`...f5` breaks.'],
 steps:[
  {t:'line',h:'Yugoslav Attack: 9.Bc4 main line',drill:'b',md:'Dragon ki sabse mashhoor ladai.',moves:'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Be3 Bg7 f3 O-O Qd2 Nc6 Bc4 {`d5` aur `f7` par.} Bd7 O-O-O Rc8 Bb3 Ne5 h4 h5 {Soltis: h-file ko band rakho.}',theory:1},
  {t:'line',h:'Yugoslav: 9.O-O-O d5!',drill:'b',md:'White ne `Bc4` nahi khela to Black turant center todta hai.',moves:'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Be3 Bg7 f3 O-O Qd2 Nc6 O-O-O d5 {Center!} exd5 Nxd5 Nxc6 bxc6 Bd4 Bxd4 Qxd4 Qb6'},
  {t:'move',after:'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Be3 Bg7 f3 O-O Qd2 Nc6 O-O-O',q:'Dragon, White ne `9.O-O-O` khela. Black ki sabse principled chaal?',line:['d5'],ok:['d5','Nxd4'],why:'`9...d5!` center kholo: White king queenside par hai, khula center Black ke kaam aata hai.'},
  {t:'quiz',q:'Yugoslav Attack mein White `Bh6` kyun khelta hai?',opts:['Rook jeetne','Dragon bishop `g7` (Black king ka sabse bada rakshak) ko trade karna','Pawn bachana'],a:1,why:'`g7` bishop gaya to `h`-file aur dark squares par mate ke chances.'},
  {t:'line',h:'Accelerated Dragon: Maroczy Bind',drill:'b',md:'`...g6` jaldi. White `c4` se `d5` ko pakka rokta hai. Black dheere khelta hai.',moves:'e4 c5 Nf3 Nc6 d4 cxd4 Nxd4 g6 c4 {Maroczy Bind: `c4`+`e4`.} Bg7 Be3 Nf6 Nc3 d6 Be2 O-O O-O Bd7 Qd2 Nxd4 {Trade: Black ke paas kam jagah, kam pieces behtar.} Bxd4 Bc6'},
  {t:'move',after:'e4 c5 Nf3 Nc6 d4 cxd4 Nxd4 g6 Nc3 Bg7 Be3 Nf6 Bc4',q:'Accelerated Dragon, White ne `c4` nahi khela. Black ka sabse achha idea?',line:['O-O'],ok:['O-O','Qa5'],why:'`7...O-O` aur `...d5` ka idea. `7...Qa5` bhi achha (`Nxe4`/pin tricks). `...d6` ki zaroorat nahi: `...d5` ek chaal mein.'},
  {t:'quiz',q:'Maroczy Bind mein Black ko kam jagah hai. Uska general plan?',opts:['Sab pawns aage','Pieces trade karo aur sahi waqt par `...b5` ya `...f5` break','Queen se attack'],a:1,why:'Kam jagah = kam pieces achha. Phir break se position kholo.'}
 ]},
/* ---------------------------------------------------------------- */
{id:'op2svesh',title:'Sveshnikov, Taimanov, Kan (club)',sub:'...e5 aur ...e6 Sicilians ke main lines',
 yaad:[
  'Sveshnikov main: `6.Ndb5 d6 7.Bg5 a6 8.Na3 b5 9.Bxf6 gxf6 10.Nd5 f5`. Black ke doubled pawns, par 2 bishops aur `...f5` break.',
  '`7.Nd5` (Sveshnikov) knight trade se `d5` par pakad.',
  'Taimanov `...e6`, `...Nc6`, `...Qc7`, `...a6`: flexible. English Attack setup ke khilaaf bhi.',
  'Kan `...e6`, `...a6`: queen `c7`, bishop `c5`/`d6`/`e7`. White `Bd3`, `c4` (Maroczy jaisa).',
  '...e6 Sicilians mein `d6` pawn kamzor ho sakta hai: White `Nb5`/`Ndb5` tricks par dhyan.'],
 steps:[
  {t:'line',h:'Sveshnikov main line',drill:'b',md:'Kramnik aur Carlsen ki opening. Black dynamic structure leta hai.',moves:'e4 c5 Nf3 Nc6 d4 cxd4 Nxd4 Nf6 Nc3 e5 Ndb5 d6 Bg5 a6 Na3 b5 {Knight `a3` par phansa.} Bxf6 gxf6 Nd5 f5 {Center par chot, bishop `g7`/`h6`.} Bd3 Be6 O-O Bxd5 exd5 Ne7',theory:1},
  {t:'quiz',q:'Sveshnikov mein Black ko doubled `f` pawns milte hain. Badle mein kya?',opts:['Kuch nahi','2 bishops, `...f5` se center par chot, aur knight `a3` ka kharab hona','Extra pawn'],a:1,why:'Structure kharab dikhta hai par active pieces aur breaks se dynamic barabari.'},
  {t:'line',h:'Taimanov: English Attack setup ke khilaaf',drill:'b',md:'Taimanov flexible hai: Black apne pieces sahi squares par rakhta hai.',moves:'e4 c5 Nf3 e6 d4 cxd4 Nxd4 Nc6 Nc3 Qc7 Be3 a6 Qd2 Nf6 O-O-O Bb4 f3 Ne5 {Knight `c4` ki taraf.} Nb3 b5'},
  {t:'line',h:'Kan',drill:'b',md:'Sabse flexible Sicilian: `...e6` aur `...a6`, pieces baad mein.',moves:'e4 c5 Nf3 e6 d4 cxd4 Nxd4 a6 Bd3 {`e4` bacha.} Bc5 Nb3 Ba7 O-O Nc6 Qe2 d6 c4 Nge7 Nc3 O-O'},
  {t:'move',after:'e4 c5 Nf3 Nc6 d4 cxd4 Nxd4 Nf6 Nc3 e5 Ndb5 d6 Bg5 a6 Na3',q:'Sveshnikov. Black ka main line idea?',line:['b5'],ok:['b5'],why:'`8...b5!` knight `a3` ko `b5`/`c4` se rok do. Knight kinare par ganda.'},
  {t:'move',after:'e4 c5 Nf3 e6 d4 cxd4 Nxd4 Nc6 Nc3 Qc7 Be3 a6 Qd2 Nf6 O-O-O',q:'Taimanov. Black ka active idea: pin karke `e4` par dabaav.',line:['Bb4'],ok:['Bb4','Be7','b5'],why:'`...Bb4` knight `c3` par pin, `e4` kamzor. `...Be7`/`...b5` bhi normal.'}
 ]},
/* ---------------------------------------------------------------- */
{id:'op2anti',title:'Anti-Sicilians (club): dono taraf',sub:'Alapin, Rossolimo, Moscow, Closed, Grand Prix, Smith-Morra trap',
 yaad:[
  'Alapin `2.c3`: `2...d5 3.exd5 Qxd5 4.d4 Nf6 5.Nf3 Bg4` ya `2...Nf6 3.e5 Nd5`.',
  'Rossolimo `3.Bb5` (`2...Nc6` ke baad): `3...g6 4.Bxc6 dxc6 5.d3 Bg7`: Black ko 2 bishops, White ko achha structure.',
  'Moscow `3.Bb5+` (`2...d6` ke baad): `3...Bd7 4.Bxd7+ Qxd7 5.c4`: Maroczy jaisa.',
  'Closed `2.Nc3` + `g3`: Black `...g6`, `...Bg7`, `...d6`, `...e6`/`...e5`, `...Nge7`.',
  'Smith-Morra Siberian trap: `...Qc7`, `...Nf6`, `...Ng4`. `h3??` par `...Nd4!`.'],
 steps:[
  {t:'line',h:'Alapin: 2...d5',drill:'b',md:'Black turant center mein. Queen `d5` par safe hai kyunki White ka knight `c3` nahi aa sakta.',moves:'e4 c5 c3 d5 {Center!} exd5 Qxd5 d4 Nf6 Nf3 Bg4 {Bishop bahar.} Be2 e6 O-O Nc6 Be3 cxd4 cxd4 Be7 {IQP structure: White ka `d4` isolated.}'},
  {t:'line',h:'Rossolimo',drill:'b',md:'White `2...Nc6` ke baad Ruy Lopez jaisa bishop `b5`. Black fianchetto karta hai.',moves:'e4 c5 Nf3 Nc6 Bb5 g6 O-O Bg7 Re1 e5 Bxc6 dxc6 d3 Qe7 {Plan: `...Nf6-d7-f8-e6`, `d4` square.} Nbd2 Nf6'},
  {t:'line',h:'Moscow Variation',drill:'b',md:'`2...d6 3.Bb5+`: White bishop trade karta hai, phir `c4` se jagah.',moves:'e4 c5 Nf3 d6 Bb5+ Bd7 Bxd7+ Qxd7 c4 Nc6 Nc3 g6 d4 cxd4 Nxd4 Bg7 Be3 Nf6 f3 O-O'},
  {t:'line',h:'Closed Sicilian',drill:'b',md:'`2.Nc3` aur `g3`: White kingside attack (`f4-f5`) dheere banata hai.',moves:'e4 c5 Nc3 Nc6 g3 g6 Bg2 Bg7 d3 d6 Be3 e6 Qd2 Rb8 {Plan: `...b5-b4` queenside par, aur `...Nd4`.} Nge2 b5 O-O b4 Nd1 Nd4'},
  {t:'move',after:'e4 c5 d4 cxd4 c3 dxc3 Nxc3 Nc6 Nf3 e6 Bc4 Qc7 O-O Nf6 Qe2 Ng4 h3',q:'Smith-Morra Siberian trap! White ne `h3??` khela. Black ki jeet wali chaal?',line:['Nd4'],hint:'`h2` par mate ka khatra: queen `c7` aur knight `g4`.',why:'`10...Nd4!` queen `e2` par attack, aur `Nxd4` par `...Qh2#`. Queen jaati hai.'},
  {t:'move',after:'e4 c5 c3 Nf6 e5 Nd5 d4 cxd4 Nf3',q:'Alapin `2...Nf6`. Black ka sabse achha developing move?',line:['Nc6'],ok:['Nc6','e6','d6'],why:'`5...Nc6` develop karke `d4` aur `e5` par dabaav. `...e6`, `...d6` bhi theory.'},
  {t:'quiz',q:'Anti-Sicilian (Alapin, Rossolimo, Closed) se White kya chahta hai?',opts:['Open Sicilian ki theory se bachna','Turant mate','Pawn jeetna'],a:0,why:'Najdorf/Dragon jaisi bahut theory se bachna. Black ko bhi har anti-Sicilian ka plan pata hona chahiye.'}
 ]}
 ]
};
