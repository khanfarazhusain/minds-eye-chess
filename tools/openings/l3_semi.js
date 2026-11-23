/* Openings Ladder, Level 3 (Advanced): French/Caro-Kann structures, Scandi/Pirc plans. Course "Openings 3", Road Level 6. */
module.exports = {
 newLevel: {id:'op3',title:'Openings 3: advanced trees, structures aur plans',sub:'12-15+ chaal ke trees, move orders, transpositions, har opening ka middlegame plan',
  intro:'Ab har opening ko gehraai se: lambi lines, move order ki chaalaakiyan, aur opening se aane wale pawn structures ke plans. Yahan structures aur plans wale lessons kaam aayenge.'},
 road: 6,
 lessons: [
/* ---------------------------------------------------------------- */
{id:'frstr',title:'French structures: chain, ...f6 break, good/bad bishop',sub:'Advance chain aur Winawer ke gehre plans',
 yaad:[
  'Pawn chain `d4-e5` vs `d5-e6`: Black `...c5` (jad) aur `...f6` (sir) dono breaks.',
  'White ka plan: `e5` rakhna, kingside attack (`Qg4`, `h4-h5`, `f4-f5`).',
  'Black ka bad bishop `c8`: `...b6` + `...Ba6` se trade, ya `...Bd7-e8-h5`.',
  'Winawer mein White ke doubled `c` pawns aur 2 bishops; Black ke paas knights aur achha structure.',
  'Agar chain khule (`...cxd4 cxd4`), to `c`-file aur `d4` par Black ka dabaav.'],
 steps:[
  {t:'line',h:'Advance: Milner-Barry Gambit',drill:'b',md:'White `d4` pawn de deta hai development ke liye. Black ko sahi defence aani chahiye.',moves:'e4 e6 d4 d5 e5 c5 c3 Nc6 Nf3 Qb6 Bd3 cxd4 cxd4 Bd7 O-O Nxd4 Nxd4 Qxd4 Nc3 a6 Qe2 Ne7 Rd1 Qb6 {Pawn upar, ab development aur castling.}',theory:1},
  {t:'line',h:'Advance: ...f6 break',drill:'b',theory:1,md:'Chain ke sir par chot: `...f6`. Black ke pieces aur king safety ke saath hi khelo.',moves:'e4 e6 d4 d5 e5 c5 c3 Nc6 Nf3 Qb6 a3 c4 Nbd2 Na5 g3 Bd7 h4 O-O-O Bh3 h6 O-O f6'},
  {t:'quiz',q:'French Advance chain `d4-e5`. Black ke 2 breaks?',opts:['`...c5` (jad) aur `...f6` (sir)','`...g5` aur `...h5`','`...a5` aur `...b5`'],a:0,why:'Jad par chot sabse principled, par `...f6` se bhi `e5` todte hain.',test:1},
  {t:'line',h:'Winawer: Poisoned Pawn',drill:'b',md:'`7.Qg4 Qc7 8.Qxg7 Rg8 9.Qxh7 cxd4`: dono taraf ka bada khel.',moves:'e4 e6 d4 d5 Nc3 Bb4 e5 c5 a3 Bxc3+ bxc3 Ne7 Qg4 Qc7 Qxg7 Rg8 Qxh7 cxd4 Ne2 Nbc6 f4 dxc3 Qd3 Bd7 Nxc3 a6',theory:1},
  {t:'move',after:'e4 e6 d4 d5 e5 c5 c3 Nc6 Nf3 Qb6 a3 c4 Nbd2 Na5',q:'Advance `...c4` ke baad White ka idea: queenside par Black ka knight `b3` mein na aaye, aur kingside khelo.',line:['g3'],ok:['g3','h4','Be2','b4'],why:'`g3`/`h4`/`Bh3`: White kingside par jagah leta hai. `b4` bhi idea.'},
  {t:'quiz',q:'Winawer ke baad (`...Bxc3 bxc3`) structure mein White ka sabse bada fayda?',opts:['Extra pawn','2 bishops aur kingside dark squares par attack','Better pawn structure'],a:1,why:'White ke doubled `c` pawns kharab hain, par 2 bishops aur `g7` ki kamzori.'}
 ]},
/* ---------------------------------------------------------------- */
{id:'ckstr',title:'Caro-Kann: Carlsbad, IQP aur Advance plans',sub:'Ek structure, kai openings',
 yaad:[
  'Carlsbad (Exchange Caro / QGD Exchange): queenside minority attack (`b4-b5`) us side jiske pawns `a`/`b` hain.',
  'Panov IQP: White `d5` push, Black `d5` blockade. Same plan Alapin aur QGD Tarrasch mein.',
  'Advance Caro: Black `...c5` se `d4` par, `...Nc6`, `...Qb6`. French jaisa par bishop bahar.',
  'Classical Caro mein Black ka king aksar `O-O-O` ya center: `h5` pawn White ke liye target bhi.',
  'Structure yaad karo, chaalein khud aayengi.'],
 steps:[
  {t:'line',h:'Panov: IQP deep',drill:'w',md:'White IQP ke saath kingside attack.',moves:'e4 c6 d4 d5 exd5 cxd5 c4 Nf6 Nc3 e6 Nf3 Be7 cxd5 Nxd5 Bd3 Nc6 O-O O-O Re1 Bf6 Be4 Nce7 Qd3 g6 Bh6 {Dark squares par attack.}',theory:1},
  {t:'line',h:'Exchange Caro: Black ka minority attack',drill:'b',md:'Carlsbad mein Black (jiske `a`/`b` pawns zyada hain) `...b5-b4` se White ke `c3` ko kamzor karta hai.',moves:'e4 c6 d4 d5 exd5 cxd5 Bd3 Nc6 c3 Nf6 Bf4 Bg4 Qb3 Qd7 Nd2 e6 Ngf3 Bxf3 Nxf3 Bd6 Bxd6 Qxd6 O-O O-O Rae1 Rab8 {Minority attack: `...b5-b4`.}',theory:1},
  {t:'quiz',q:'Carlsbad structure mein "minority attack" kaun karta hai?',opts:['Jiske paas queenside par 2 pawns (a, b) zyada nahi, kam hain: unhe aage badha kar opponent ke 3 pawns ko kamzor karna','Jiske paas kingside majority','Koi nahi'],a:0,why:'2 pawns (`a`,`b`) vs 3 (`a`,`b`,`c`): `b4-b5` (ya `...b5-b4`) se `c` pawn kamzor ya backward.',test:1},
  {t:'line',h:'Advance Caro: Short line deep',drill:'b',md:'Black `d4` par pieces se dabaav. Structure French jaisa par bishop bahar.',moves:'e4 c6 d4 d5 e5 Bf5 Nf3 e6 Be2 c5 Be3 Nd7 O-O Ne7 c4 dxc4 Na3 Nd5 Nxc4 Nxe3 fxe3 Be7'},
  {t:'move',after:'e4 c6 d4 d5 exd5 cxd5 c4 Nf6 Nc3 e6 Nf3 Be7 cxd5 Nxd5 Bd3 Nc6 O-O O-O Re1',q:'Panov IQP. Black: `d4` par dabaav aur blockade ki taiyaari.',line:['Bf6'],ok:['Bf6','Nf6','Ncb4'],why:'`...Bf6` `d4` par dabaav. `...Nf6`, `...Ncb4` bhi theory.'}
 ]},
/* ---------------------------------------------------------------- */
{id:'scpi',title:'Scandinavian aur Pirc (advanced plans)',sub:'Scandi structure, Pirc ...e5 aur ...c5 breaks',
 yaad:[
  'Scandi: Black ka structure `c6-e6` (Caro jaisa), White ka `d4`. Black `...Nbd7`, `...Be7`, castle; break `...c5`.',
  'White Scandi plan: `d5` push ya kingside `Ne5`, `Qe2`, `O-O-O`.',
  'Pirc: Black `...e5` (center) ya `...c6-b5` (queenside). White `f4-e5` ya `Bh6` + `h4-h5`.',
  'Hypermodern defences: center White ko do, phir breaks se chot.',
  'Agar White ne zyada aage badha (overextend), to piece pressure se pawns jeeto.'],
 steps:[
  {t:'line',h:'Scandinavian: White ka O-O-O plan',drill:'w',md:'Opposite castling aur `d5` break.',moves:'e4 d5 exd5 Qxd5 Nc3 Qa5 d4 Nf6 Nf3 c6 Bc4 Bf5 Bd2 e6 Qe2 Bb4 Ne5 Nbd7 O-O-O Nxe5 dxe5 Nd5 Nxd5 Bxd2+ Rxd2 cxd5',theory:1},
  {t:'line',h:'Pirc: Classical (4.Nf3)',drill:'b',md:'Solid White. Black `...e5` se center par.',moves:'e4 d6 d4 Nf6 Nc3 g6 Nf3 Bg7 Be2 O-O O-O c6 a4 a5 h3 Na6 Be3 Nb4 Re1 e5'},
  {t:'quiz',q:'Pirc mein Black ke do main pawn breaks?',opts:['`...e5` aur `...c5`','`...h5` aur `...g5`','`...f5` sirf'],a:0,why:'Bishop `g7` ke saath center par `...e5`/`...c5` se chot. Kabhi `...c6-b5` queenside.',test:1},
  {t:'move',after:'e4 d6 d4 Nf6 Nc3 g6 f4 Bg7 Nf3 O-O Bd3',q:'Austrian Attack. Black ka sabse active break?',line:['Na6'],ok:['Na6','Nc6','c5'],why:'`...Na6` (`...c5` ka support), `...Nc6`, `...c5`: center par chot. Yahan `...e5` thoda jaldi hai.'}
 ]}
 ]
};
