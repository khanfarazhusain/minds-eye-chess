/* Openings Ladder, Level 3 (Advanced): 1.d4 d5 structures (Carlsbad, IQP, Slav/Meran) aur systems ke plans. Course "Openings 3", Road Level 6. */
module.exports = {
 newLevel: {id:'op3',title:'Openings 3: advanced trees, structures aur plans',sub:'12-15+ chaal ke trees, move orders, transpositions, har opening ka middlegame plan',
  intro:'Ab har opening ko gehraai se: lambi lines, move order ki chaalaakiyan, aur opening se aane wale pawn structures ke plans. Yahan structures aur plans wale lessons kaam aayenge.'},
 road: 6,
 lessons: [
/* ---------------------------------------------------------------- */
{id:'qgstr',title:'QGD structures: Carlsbad, IQP, hanging pawns',sub:'Queen\'s Gambit ke 3 structures aur unke plans',
 yaad:[
  'Carlsbad: White minority attack (`Rb1`, `b4-b5`) ya center `f3`+`e4`. Black kingside (`...Ne4`, `...f5`, `...Rh6`).',
  'IQP (Tarrasch, QGA, Semi-Tarrasch): IQP wala activity, doosra blockade + trades.',
  'Hanging pawns (`c5`+`d5`): mazboot par target. Plan: `...d4` ya `...c4` push sahi waqt par.',
  'Move order: `cxd5` jaldi = Exchange (Carlsbad). `Nf3` pehle = `...Bb4` (Ragozin) ya `...dxc4` options.',
  'Ek structure kai openings mein: Caro Exchange = ulta Carlsbad.'],
 steps:[
  {t:'line',h:'Carlsbad: White ka f3 + e4 plan',drill:'w',md:'Minority attack ke alawa doosra plan: center mein `e4`.',moves:'d4 d5 c4 e6 Nc3 Nf6 cxd5 exd5 Bg5 Be7 e3 O-O Bd3 Nbd7 Nge2 Re8 Qc2 Nf8 O-O-O {Opposite castling!} Be6 f3 c5 {Black ka counter.}',theory:1},
  {t:'quiz',q:'Carlsbad mein White ke 2 main plans?',opts:['Minority attack (`b4-b5`) ya center `f3`+`e4`','Sirf kingside mate','Queen trade'],a:0,why:'Structure ek, plans do. Black ka jawab: kingside (`...Ne4`, `...f5`) ya `...c5`.',test:1},
  {t:'line',h:'Semi-Tarrasch: IQP aur hanging pawns',drill:'w',md:'`...c5` + `...Nxd5`: White IQP ya hanging pawns leta hai.',moves:'d4 d5 c4 e6 Nc3 Nf6 Nf3 c5 cxd5 Nxd5 e3 Nc6 Bd3 Be7 O-O O-O a3 cxd4 exd4 Bf6 Qc2 h6 Rd1',theory:1},
  {t:'move',after:'d4 d5 c4 e6 Nc3 Nf6 Nf3 c5 cxd5 Nxd5 e3 Nc6 Bd3 Be7 O-O O-O a3 cxd4 exd4 Bf6',q:'IQP (White). Typical plan: bishop + queen battery `h7` par.',line:['Qc2'],ok:['Qc2','Be4','Re1'],why:'`Qc2` `Bd3` ke saath `h7` par battery. `Re1`/`Be4` bhi IQP ke typical moves.'},
  {t:'quiz',q:'Hanging pawns (`c5`+`d5`, dono side files khuli) ki sabse badi kamzori?',opts:['Pawns ko pieces bachaate hain, aur ek aage gaya to doosra kamzor','Woh kabhi kamzor nahi','Woh promotion ke paas'],a:0,why:'Pawns ek doosre ko nahi bachate. Push sahi waqt par, warna target.',test:1}
 ]},
/* ---------------------------------------------------------------- */
{id:'slavadv',title:'Slav aur Semi-Slav (advanced)',sub:'Meran ka gehra tree, Botvinnik ka idea, Slav ke move orders',
 yaad:[
  'Meran `8...a6 9.e4 c5 10.d5`: center blockade vs queenside majority.',
  'Botvinnik `5.Bg5 dxc4 6.e4 b5`: sabse sharp. Jaano, khelna optional.',
  'Slav move orders: `3.Nf3`, `3.Nc3`, `3.cxd5` (Exchange). `...a6` Chebanenko flexible.',
  'Anti-Meran `6.Qc2`: Black `...Bd6`, `...O-O`, `...dxc4`, `...e5`.',
  'Slav Exchange mein symmetrical structure: jo pehle `c`-file le, woh aage.'],
 steps:[
  {t:'line',h:'Meran: deep main line',drill:'b',md:'Center blockade vs queenside majority.',moves:'d4 d5 c4 c6 Nf3 Nf6 Nc3 e6 e3 Nbd7 Bd3 dxc4 Bxc4 b5 Bd3 a6 e4 c5 d5 c4 dxe6 cxd3 exd7+ Qxd7 O-O Bb7',theory:1},
  {t:'line',h:'Anti-Meran: 6.Qc2',drill:'b',md:'White Meran se bachta hai. Black `...Bd6` aur `...e5` break.',moves:'d4 d5 c4 c6 Nf3 Nf6 Nc3 e6 e3 Nbd7 Qc2 Bd6 Bd3 O-O O-O dxc4 Bxc4 a6 Rd1 b5 Be2 Qc7 {Phir `...Bb7` aur `...c5`/`...e5` break.}',theory:1},
  {t:'quiz',q:'Meran mein `...c5` + `...c4` ke baad Black ka asli fayda?',opts:['Queenside pawn majority aur active bishop `b7`','Kingside attack','Extra queen'],a:0,why:'Queenside par pawn majority endgame mein passed pawn bana sakti hai.',test:1},
  {t:'move',after:'d4 d5 c4 c6 Nf3 Nf6 Nc3 e6 e3 Nbd7 Qc2 Bd6 Bd3 O-O O-O',q:'Anti-Meran. Black: center kholo.',line:['dxc4'],ok:['dxc4','e5'],why:'`...dxc4` aur phir `...e5`/`...b5`. Seedha `...e5` bhi theory.'}
 ]},
/* ---------------------------------------------------------------- */
{id:'sysadv',title:'Systems (advanced): London aur Colle ke plans, anti-system move orders',sub:'Systems ki kamzori ko move order se pakdo',
 yaad:[
  'London ke khilaaf move order: `1...Nf6 2.Bf4 c5!` (`d5` se pehle): `3.d5` ho to Benoni structure.',
  'London White: `Ne5` + `f4` (Stonewall jaisa) ya `h4`/`Bxh7` attacking ideas.',
  'Colle `e4` break sahi waqt: pieces `d2`, `e1` rook, phir `e4`.',
  'Black ka KID setup (`...g6`, `...d6`, `...e5`) systems ke khilaaf flexible.',
  'Systems = kam theory, par opponent ka setup pehchano aur plan badlo.'],
 steps:[
  {t:'line',h:'London: 1...Nf6 2.Bf4 c5!',drill:'b',md:'Move order trick: `...d5` se pehle `...c5`. White `d5` khele to Benoni jaisa, `c3` khele to `...Qb6`.',moves:'d4 Nf6 Bf4 c5 e3 Qb6 Nc3 cxd4 exd4 a6 Nf3 d5 Ne5 e6 Bd3'},
  {t:'line',h:'London: KID setup se jawab',drill:'b',md:'Black `...g6`, `...d6`, `...e5`: bishop `f4` ko pawn se chot.',moves:'d4 Nf6 Bf4 g6 e3 Bg7 Nf3 d6 h3 O-O Be2 Nbd7 O-O Qe8 c4 e5 Bh2 Ne4 {Knight `e4` par active, `...f5` ka idea.}'},
  {t:'quiz',q:'London ke khilaaf `1...Nf6 2.Bf4 c5` ka idea?',opts:['`...d5` se pehle center par chot: White ke `c3` plan ko pareshan karna','Pawn dena','Draw'],a:0,why:'Move order se White ka comfortable setup tod do.',test:1},
  {t:'move',after:'d4 Nf6 Bf4 c5 e3',q:'London. Black ka sabse active idea?',line:['Qb6'],ok:['Qb6','cxd4','d5'],why:'`...Qb6` `b2` par turant chot. White `Nc3` (pawn de kar) ya `Qc1`. `...d5`, `...cxd4` bhi achhe.'}
 ]}
 ]
};
