/* Openings Ladder, Level 3 (Advanced): Sicilian ke structures, plans aur move orders. Course "Openings 3", Road Level 6. */
module.exports = {
 newLevel: {id:'op3',title:'Openings 3: advanced trees, structures aur plans',sub:'12-15+ chaal ke trees, move orders, transpositions, har opening ka middlegame plan',
  intro:'Ab har opening ko gehraai se: lambi lines, move order ki chaalaakiyan, aur opening se aane wale pawn structures ke plans. Yahan structures aur plans wale lessons kaam aayenge.'},
 road: 6,
 lessons: [
/* ---------------------------------------------------------------- */
{id:'sicstr',title:'Sicilian structures: Scheveningen, ...e5, Maroczy',sub:'Teen Sicilian structures aur unke plans',
 yaad:[
  'Scheveningen (`...e6` + `...d6`): "small center". Black ke breaks `...d5` aur `...b5`. White `f4`, `g4-g5` ya `e5`.',
  '`...e5` structure (Najdorf, Sveshnikov): `d5` hole, par Black ko center aur `...d5`/`...f5` breaks.',
  'Maroczy Bind (`c4` + `e4`): White ki jagah. Black trade kare, `...b5`/`...d5`/`...f5` break dhundhe.',
  'Sicilian mein `...d5` break aksar Black ka "equalizer": agar safe ho, khelo.',
  'White ka `Nd5` sacrifice/occupation, aur `e5` push: Sicilian ke do bade hathiyaar.'],
 steps:[
  {t:'line',h:'Scheveningen: Keres Attack ke khilaaf',drill:'b',md:'`6.g4!?` (Keres): White turant kingside par. Black ko jaldi counter chahiye.',moves:'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 e6 g4 {Keres Attack.} h6 h4 Nc6 Rg1 h5 {`g4` pawn ko todo.} gxh5 Nxh5 Bg5 Nf6',theory:1},
  {t:'quiz',q:'Scheveningen "small center" (`d6`+`e6`) mein Black ke 2 main pawn breaks?',opts:['`...g5` aur `...h5`','`...d5` aur `...b5`','`...f5` aur `...a5`'],a:1,why:'`...d5` center kholta hai, `...b5` queenside par jagah aur counter-attack.',test:1},
  {t:'line',h:'Najdorf ...e5: d5 square ki ladai',drill:'w',md:'White `Nd5` (ya `Bxf6` + `Nd5`) se hole par baithta hai. Black `...Bxd5` se trade ya `...d5` break.',moves:'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6 Be2 e5 Nb3 Be7 O-O O-O Be3 Be6 Nd5 {Hole par knight.} Nbd7 Qd3 Bxd5 exd5 {Ab `d5` White ka pawn: Black ke paas `...f5` aur kingside majority.}'},
  {t:'quiz',q:'Najdorf `...e5` mein agar White knight `d5` par baithe, to Black ka standard jawab?',opts:['Ignore karo','`...Bxd5` (bishop `e6` se) trade, phir `exd5` ke baad kingside `...f5`','`...h5`'],a:1,why:'Strong knight ko bishop se trade, phir structure badal jaata hai: Black kingside majority se khelta hai.'},
  {t:'move',after:'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 e6 Be2 Be7 O-O O-O f4 Nc6 Be3 a6 a4 Qc7 Kh1 Re8',q:'Scheveningen classical. White ka typical aur strong plan?',line:['Bf3'],ok:['Bf3','Qe1','Bd3','Qd2'],why:'`Bf3` `e4` ko sahara, phir `Qe1-g3`, `g4`. `Qe1` bhi main line.'},
  {t:'move',after:'e4 c5 Nf3 Nc6 d4 cxd4 Nxd4 g6 c4 Bg7 Be3 Nf6 Nc3 O-O Be2 d6 O-O Bd7 Qd2 Nxd4 Bxd4 Bc6 f3',q:'Maroczy Bind. Black ka typical queenside plan shuru karo.',line:['a5'],ok:['a5','Nd7','Qa5'],why:'`...a5` (`...a4`, `...Qb6`, `...Nd7-c5` ka idea). Kam jagah mein pieces active karna.'}
 ]},
/* ---------------------------------------------------------------- */
{id:'sicord',title:'Sicilian move orders aur transpositions',sub:'2...d6 / 2...Nc6 / 2...e6 ka chunav, anti-Sicilian se bachna, Najdorf ke move orders',
 yaad:[
  '`2...d6` Najdorf/Dragon ki taraf, par `3.Bb5+` (Moscow) allow karta hai.',
  '`2...Nc6` Sveshnikov/Classical/Accelerated ki taraf, par `3.Bb5` (Rossolimo).',
  '`2...e6` Taimanov/Kan/Scheveningen, par `3.d3` (KIA) ya `3.c3`.',
  'Scheveningen aksar Najdorf se aata hai (`5...a6 6.Be2 e6`): transposition.',
  'White ka `6.h3` ya `6.Be3` Najdorf mein move order choice: Black ko kaunsa setup dena hai.'],
 steps:[
  {t:'info',h:'Black ka 2nd move: ek chunav, ek keemat',after:'e4 c5 Nf3',md:'Black ki doosri chaal tay karti hai ki kaunsa anti-Sicilian aa sakta hai:\n\n- `2...d6`: Najdorf, Dragon, Scheveningen. White ke paas **Moscow** `3.Bb5+`.\n- `2...Nc6`: Sveshnikov, Classical, Accelerated Dragon, Taimanov. White ke paas **Rossolimo** `3.Bb5`.\n- `2...e6`: Taimanov, Kan, Scheveningen. White ke paas `3.d3` (KIA setup) ya `3.c3`.\n\nRepertoire banate waqt yeh dekho ki kaunse anti-Sicilian tumhe pasand nahi.'},
  {t:'quiz',q:'Tumhe Rossolimo (`3.Bb5` after `2...Nc6`) pasand nahi. Kaunsa 2nd move behtar?',opts:['`2...Nc6`','`2...d6` ya `2...e6`','Koi farak nahi'],a:1,why:'`2...d6`/`2...e6` ke baad `3.Bb5` Rossolimo nahi hota (Moscow ya kuch aur aata hai).',test:1},
  {t:'line',h:'Najdorf se Scheveningen (transposition)',drill:'b',md:'Najdorf player bhi Scheveningen structure mein pahunchta hai. Yeh ek hi family hai.',moves:'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6 Be2 e6 {Ab Scheveningen structure.} O-O Be7 f4 O-O Be3 Qc7 a4 Nc6 Kh1 Re8'},
  {t:'line',h:'Taimanov se Scheveningen',drill:'b',md:'`...e6`, `...Nc6`, `...d6` order se bhi wahi structure.',moves:'e4 c5 Nf3 e6 d4 cxd4 Nxd4 Nc6 Nc3 d6 Be2 Nf6 O-O Be7 Be3 O-O f4 a6'},
  {t:'quiz',after:'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 e6 Be2 Be7 O-O O-O f4 Nc6 Be3 a6',q:'Is position tak kitne move orders se pahunch sakte hain?',opts:['Sirf ek','Kai: Najdorf (`...a6` pehle), Scheveningen, Taimanov order','Sirf Dragon se'],a:1,why:'Sicilian mein transpositions bahut hain. Isliye positions aur plans yaad karo, sirf chaalein nahi.',test:1},
  {t:'move',after:'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6 h3',q:'White ne `6.h3` (Adams Attack) khela: `g4` ki taiyaari. Black ka principled jawab?',line:['e5'],ok:['e5','e6','g6','Nc6'],why:'`6...e5` knight ko bhagao, `d5` par dhyan. `6...e6` bhi main line.'}
 ]},
/* ---------------------------------------------------------------- */
{id:'sicanti',title:'Anti-Sicilians (advanced): Alapin IQP, Rossolimo structures, Smith-Morra defence',sub:'Gehri lines aur unke plans',
 yaad:[
  'Alapin `2...d5` aksar IQP deta hai: Black blockade + trades, White activity.',
  'Rossolimo `...g6` + `Bxc6 dxc6`: Black ke 2 bishops; White `d3`, `h3`, `Be3`, `Qd2`, `Bh6` se trade.',
  'Smith-Morra: Black ka solid setup `...Nc6`, `...e6`, `...d6`, `...a6`, `...Nge7`/`...Nf6`, `...Be7`, castle. `...Qc7` ke saath Siberian ka dhyan.',
  'Smith-Morra decline `3...d5` ya `3...Nf6`: aaram se barabar.',
  'Grand Prix `f4` ke khilaaf `...d5` break sabse seedha.'],
 steps:[
  {t:'line',h:'Alapin: IQP line deep',drill:'w',md:'White IQP leta hai, badle mein active pieces.',moves:'e4 c5 c3 d5 exd5 Qxd5 d4 Nf6 Nf3 e6 Be2 Nc6 O-O cxd4 cxd4 Be7 Nc3 Qd6 Be3 O-O Qd2 b6 Rfd1 Bb7 {IQP: White `Ne5`/`d5` push dhundhe, Black `...Rfd8`, `...Nb4-d5` blockade.}',theory:1},
  {t:'line',h:'Smith-Morra: solid Black setup',drill:'b',md:'Black pawn rakhta hai aur sab tricks band karta hai.',moves:'e4 c5 d4 cxd4 c3 dxc3 Nxc3 Nc6 Nf3 d6 Bc4 e6 O-O a6 Qe2 Nf6 Rd1 Qc7 Bf4 Be7 {Ab castle: Black pawn upar, solid.}',theory:1},
  {t:'line',h:'Rossolimo: modern main line',drill:'w',md:'White dragon bishop ko `Bh6` se trade karta hai.',moves:'e4 c5 Nf3 Nc6 Bb5 g6 Bxc6 dxc6 d3 Bg7 h3 Nf6 Nc3 O-O Be3 b6 Qd2 e5 Bh6 Qd6'},
  {t:'move',after:'e4 c5 Nc3 Nc6 f4 g6 Nf3 Bg7 Bb5',q:'Grand Prix, White ne `Bb5` khela. Black ka solid jawab?',line:['Nd4'],why:'`...Nd4` knight center mein, bishop ko trade ka offer. Ab `...a6` se bishop ko bhagana bhi aata hai.'},
  {t:'quiz',q:'Alapin IQP mein Black ka blockade piece kahan sabse achha?',opts:['`d5` par knight','`a8` par rook','`h7` par king'],a:0,why:'`d5` par knight `d4` pawn ko rokta hai aur hata nahi sakte (pawn se attack nahi).',test:1}
 ]}
 ]
};
