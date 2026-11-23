/* Openings Ladder, Level 2 (Club): Indian defences, Dutch, Benoni/Benko, Budapest, Catalan, English, Reti, KIA, Bird. Main Course l4b ke end, Road Level 4. */
module.exports = {
 to: 'l4b',
 road: 4,
 lessons: [
/* ---------------------------------------------------------------- */
{id:'op2kid',title:'King\'s Indian aur Grunfeld (club): dono taraf',sub:'KID Classical/Mar del Plata, Samisch, Four Pawns, Fianchetto; Grunfeld Exchange, Russian',
 yaad:[
  'KID Mar del Plata: `9.Ne1 Nd7 10.Be3 f5 11.f3 f4`: Black kingside attack, White queenside (`c5`).',
  'Samisch `5.f3`: White `Be3`, `Qd2`, `O-O-O`/`g4`. Black `...c5` ya `...e5`, `...Nc6`+`...a6`+`...Rb8`+`...b5`.',
  'Four Pawns `f4`: Black `...c5` se turant center todo.',
  'Grunfeld Exchange: White ka bada center `c3`+`d4`+`e4`. Black `...c5`, `...Nc6`, `...Bg4`, `...Qa5` se `d4` par.',
  'Grunfeld Russian `Qb3`: Black `...dxc4`, phir `...a6`/`...Nc6`/`...Bg4` lines.'],
 steps:[
  {t:'line',h:'KID: Mar del Plata',drill:'b',md:'Sabse mashhoor KID. Opposite sides par race.',moves:'d4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Nf3 O-O Be2 e5 O-O Nc6 d5 Ne7 Ne1 Nd7 Be3 f5 f3 f4 Bf2 g5 {Kingside storm.} b4 Nf6 c5 Ng6',theory:1},
  {t:'line',h:'KID: Samisch',drill:'b',md:'`5.f3`: White `e4` ko pakka karta hai aur kingside attack ki soch.',moves:'d4 Nf6 c4 g6 Nc3 Bg7 e4 d6 f3 O-O Be3 c5 Nge2 Nc6 d5 Ne5 Ng3 e6 Be2 exd5 cxd5 a6',theory:1},
  {t:'line',h:'KID: Fianchetto',drill:'b',md:'White `g3` + `Bg2`: solid. Black `...Nbd7`, `...e5`, `...c6`.',moves:'d4 Nf6 c4 g6 Nf3 Bg7 g3 O-O Bg2 d6 O-O Nbd7 Nc3 e5 e4 c6 h3 Qb6'},
  {t:'line',h:'Grunfeld Exchange',drill:'b',md:'White bada center leta hai, Black usse door se todta hai.',moves:'d4 Nf6 c4 g6 Nc3 d5 cxd5 Nxd5 e4 Nxc3 bxc3 Bg7 Nf3 c5 Rb1 O-O Be2 cxd4 cxd4 Qa5+ Bd2 Qxa2 O-O',theory:1},
  {t:'line',h:'Grunfeld: Russian System',drill:'b',md:'`5.Qb3`: White `d5` par dabaav. Black `...dxc4` aur pieces se.',moves:'d4 Nf6 c4 g6 Nc3 d5 Nf3 Bg7 Qb3 dxc4 Qxc4 O-O e4 a6 Be2 b5 Qb3 c5',theory:1},
  {t:'move',after:'d4 Nf6 c4 g6 Nc3 Bg7 e4 d6 f4',q:'Four Pawns Attack. Black ka sabse principled jawab: center todo.',line:['O-O'],ok:['O-O','c5'],why:'`5...O-O` aur phir `6...c5` (ya seedha `5...c5`). Bade center ko jaldi todo.'},
  {t:'quiz',q:'KID Mar del Plata mein dono ke plans?',opts:['Dono center mein','Black kingside (`...f5-f4-g5`), White queenside (`c5`, `b4`)','Dono draw'],a:1,why:'Band center (`d5` vs `e5`) = flanks par race. Pawns jahan "point" karte hain, wahan khelo.'}
 ]},
/* ---------------------------------------------------------------- */
{id:'op2nimzo',title:'Nimzo-Indian, QID, Bogo, Catalan (club)',sub:'4.e3 Rubinstein, 4.Qc2 Classical, Samisch; QID 4.g3; Catalan open/closed',
 yaad:[
  'Nimzo Rubinstein `4.e3`: `...O-O`, `...d5`, `...c5`. Classical `4.Qc2`: `...O-O`, `...d5` ya `...c5`.',
  'Nimzo ka trade `...Bxc3`: White ko 2 bishops, Black ko better structure (doubled `c` pawns).',
  'QID `4.g3 Ba6`: `c4` par chot. `5.b3 Bb4+ 6.Bd2 Be7`.',
  'Bogo-Indian `3...Bb4+`: Nimzo ka "Nf3" version. Simple, solid.',
  'Catalan `g3` + `Bg2`: long diagonal se queenside par dabaav. Black `...dxc4` (open) ya `...Be7`, `...c6` (closed).'],
 steps:[
  {t:'line',h:'Nimzo: Rubinstein (4.e3)',drill:'b',md:'Sabse mazboot White system.',moves:'d4 Nf6 c4 e6 Nc3 Bb4 e3 O-O Bd3 d5 Nf3 c5 O-O Nc6 a3 Bxc3 bxc3 dxc4 Bxc4 Qc7',theory:1},
  {t:'line',h:'Nimzo: Classical (4.Qc2)',drill:'b',md:'White `Qc2` se doubled pawns se bachta hai.',moves:'d4 Nf6 c4 e6 Nc3 Bb4 Qc2 O-O a3 Bxc3+ Qxc3 b6 Bg5 Bb7 f3 h6 Bh4 d5 e3 Nbd7'},
  {t:'line',h:'Queen\'s Indian: 4.g3',drill:'b',md:'Light squares ki ladai.',moves:'d4 Nf6 c4 e6 Nf3 b6 g3 Ba6 b3 Bb4+ Bd2 Be7 Bg2 c6 Bc3 d5 Nbd2 Nbd7 O-O O-O'},
  {t:'line',h:'Catalan: Open',drill:'b',md:'Black `c4` pawn leta hai. White long diagonal se dabaav.',moves:'d4 Nf6 c4 e6 g3 d5 Bg2 dxc4 Nf3 Be7 O-O O-O Qc2 a6 Qxc4 b5 Qc2 Bb7 Bd2 Be4 Qc1'},
  {t:'line',h:'Bogo-Indian',drill:'b',md:'`3...Bb4+`: seedha develop.',moves:'d4 Nf6 c4 e6 Nf3 Bb4+ Bd2 Qe7 g3 Nc6 Bg2 Bxd2+ Nbxd2 d6 O-O a5'},
  {t:'move',after:'d4 Nf6 c4 e6 Nc3 Bb4 e3 O-O Bd3 d5 Nf3 c5 O-O Nc6 a3',q:'Nimzo Rubinstein: White ne `a3` se bishop se sawaal kiya. Black?',line:['Bxc3'],ok:['Bxc3','Ba5'],why:'`...Bxc3` trade: White ke doubled pawns. Phir `...dxc4` aur `...Qc7`.'},
  {t:'quiz',q:'Nimzo mein `...Bxc3` ke baad kiske paas kya?',opts:['White: 2 bishops; Black: better pawn structure','Dono barabar','Black: 2 bishops'],a:0,why:'Bishop vs structure ka trade. Black `c4` ko target karta hai, White center aur bishops se khelta hai.'}
 ]},
/* ---------------------------------------------------------------- */
{id:'op2ben',title:'Benoni, Benko, Budapest, Dutch (club)',sub:'Black ke fighting defences aur White ke best jawab',
 yaad:[
  'Modern Benoni: Black queenside majority (`...b5`), White center (`e5` break, `f4`). Taimanov `f4`+`Bb5+` sabse khatarnaak.',
  'Benko Gambit `...b5`: pawn ke badle a/b files par long-term dabaav.',
  'Budapest `...e5`: White `Bf4`, `Nf3`, `e3`, `Nbd2`/`Nc3`; Black pawn wapas leta hai. Trap: `axb4??` par `...Nd3#`.',
  'Dutch Leningrad (`...g6`) aur Stonewall (`...d5`, `...e6`, `...c6`): `e4` square ki ladai.',
  'Dutch ke khilaaf White: Staunton `2.e4` ya `Bg5`, `Nc3`, `e4` break.'],
 steps:[
  {t:'line',h:'Modern Benoni: Classical',drill:'b',md:'Asymmetric structure: Black queenside, White center.',moves:'d4 Nf6 c4 c5 d5 e6 Nc3 exd5 cxd5 d6 e4 g6 Nf3 Bg7 Be2 O-O O-O Re8 Nd2 Na6 f3 Nc7 a4 b6',theory:1},
  {t:'line',h:'Benko Gambit',drill:'b',md:'Black pawn deta hai: queenside files ka long-term dabaav.',moves:'d4 Nf6 c4 c5 d5 b5 cxb5 a6 bxa6 Bxa6 Nc3 d6 e4 Bxf1 Kxf1 g6 g3 Bg7 Kg2 O-O Nf3 Nbd7',theory:1},
  {t:'line',h:'Budapest: White ka sahi khel',drill:'w',md:'White pawn rakhne ki koshish karta hai, par development pehle.',moves:'d4 Nf6 c4 e5 dxe5 Ng4 Bf4 Nc6 Nf3 Bb4+ Nbd2 Qe7 e3 Ngxe5 Nxe5 Nxe5 Be2 O-O O-O'},
  {t:'line',h:'Dutch: Stonewall',drill:'b',md:'`...d5`, `...e6`, `...f5`, `...c6`: `e4` par pakad. Kamzori: `e5` square.',moves:'d4 f5 g3 Nf6 Bg2 e6 Nf3 d5 O-O Bd6 c4 c6 b3 Qe7 Ne5 O-O Nd2 b6'},
  {t:'line',h:'Dutch ke khilaaf: Staunton Gambit',drill:'w',md:'White `2.e4` se turant center kholta hai.',moves:'d4 f5 e4 fxe4 Nc3 Nf6 Bg5 Nc6 d5 Ne5 Qd4 Nf7 Bxf6 exf6 Nxe4'},
  {t:'move',after:'d4 Nf6 c4 c5 d5 e6 Nc3 exd5 cxd5 d6 e4 g6 f4 Bg7 Bb5+',q:'Benoni Taimanov Attack: `Bb5+`. Black ka sabse safe jawab?',line:['Nfd7'],why:'`...Nfd7` (`...Bd7?` par `e5!` aur Black mushkil mein). Isliye Benoni ke move order dhyan se.'},
  {t:'quiz',q:'Benko Gambit mein Black pawn ke badle kya leta hai?',opts:['Kingside attack','Khuli a- aur b-files par rooks/queen ka long-term dabaav','Kuch nahi'],a:1,why:'Endgame mein bhi Black ka dabaav rehta hai: isliye yeh "positional gambit" hai.'}
 ]},
/* ---------------------------------------------------------------- */
{id:'op2flank',title:'English, Reti, KIA, Bird, Larsen (club): dono taraf',sub:'Flank openings ke main lines aur Black ke seedhe jawab',
 yaad:[
  'English `1.c4 e5` (Reversed Sicilian): White `g3`, `Bg2`, `Nc3`, `d3`. Black `...Nc6`, `...g6` ya `...Nf6`, `...d5`.',
  'Symmetrical English `1...c5`: dono fianchetto; break `d4`/`...d5`.',
  'Reti `1.Nf3 d5 2.c4`: Black `...d4` (space), `...e6` (QGD jaisa) ya `...c6` (Slav jaisa).',
  'KIA: `d3`, `Nd2`, `g3`, `Bg2`, `O-O`, `e4`, phir `e5` + kingside. Black queenside (`...b5`, `...c5`).',
  'Bird `1.f4`: Black `...d5`, `...Nf6`, `...g6` ya From `...e5`. Larsen `1.b3`: Black `...e5` + `...Nc6` + `...d5`.'],
 steps:[
  {t:'line',h:'English: Reversed Sicilian',drill:'b',md:'Black ek tempo kam ke saath Sicilian ka White side khel raha hai.',moves:'c4 e5 Nc3 Nf6 Nf3 Nc6 g3 d5 cxd5 Nxd5 Bg2 Nb6 O-O Be7 d3 O-O a3 Be6 b4'},
  {t:'line',h:'English: Botvinnik setup (Black)',drill:'b',md:'Black `...g6`, `...Bg7`, `...e5`, `...Nge7`: closed, solid.',moves:'c4 e5 Nc3 Nc6 g3 g6 Bg2 Bg7 d3 d6 e4 Nge7 Nge2 O-O O-O f5'},
  {t:'line',h:'Symmetrical English',drill:'b',md:'Dono same setup. Jo pehle center khole, aage.',moves:'c4 c5 Nf3 Nf6 Nc3 Nc6 g3 g6 Bg2 Bg7 O-O O-O d4 cxd4 Nxd4 Nxd4 Qxd4 d6 Qd3'},
  {t:'line',h:'Reti: 2...d4',drill:'b',md:'Black jagah leta hai.',moves:'Nf3 d5 c4 d4 e3 Nc6 exd4 Nxd4 Nxd4 Qxd4 Nc3 e5 d3 Bc5'},
  {t:'line',h:'KIA ke khilaaf: queenside plan',drill:'b',md:'White kingside par aayega. Black queenside par tez.',moves:'Nf3 d5 g3 Nf6 Bg2 c6 O-O Bg4 d3 Nbd7 Nbd2 e5 e4 dxe4 dxe4 Bc5'},
  {t:'line',h:'Larsen: 1.b3 e5',drill:'b',md:'Bishop `b2` `e5` par. Black seedha center.',moves:'b3 e5 Bb2 Nc6 e3 d5 Bb5 Bd6 f4 Qh4+ g3 Qe7'},
  {t:'move',after:'f4 d5 Nf3 g6 e3 Bg7 Be2 Nf6 O-O O-O d3',q:'Bird Opening (Leningrad setup). Black ka sabse seedha plan?',line:['c5'],ok:['c5','b6','Nc6'],why:'`...c5`, `...Nc6`, phir `...d4` ya `...e5` se center. Black ka setup bahut natural.'},
  {t:'quiz',q:'English `1.c4 e5` ko "Reversed Sicilian" kyun kehte hain?',opts:['Black ne c-pawn khela','White Sicilian (`...c5`) ka mirror khel raha hai, ek extra tempo ke saath','Galat naam'],a:1,why:'Colors badal ke Sicilian. Isliye Sicilian ke ideas (jaise Dragon) yahan ulte kaam aate hain.'}
 ]}
 ]
};
