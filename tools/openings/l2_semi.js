/* Openings Ladder, Level 2 (Club): French, Caro-Kann, Scandinavian, Pirc/Modern, Alekhine. Main Course l4 ke end, Road Level 3. */
module.exports = {
 to: 'l4',
 road: 3,
 lessons: [
/* ---------------------------------------------------------------- */
{id:'op2fr',title:'French Defence (club): Advance, Winawer, Classical, Tarrasch, Exchange',sub:'Har White system ke khilaaf Black ka main line, aur White ke plans',
 yaad:[
  'Advance `3.e5 c5 4.c3 Nc6 5.Nf3 Qb6 6.a3`: Black `d4` par dabaav, White `b4` se jagah.',
  'Winawer `3.Nc3 Bb4 4.e5 c5 5.a3 Bxc3+ 6.bxc3 Ne7 7.Qg4`: White `g7` par, Black queenside par.',
  'Classical `3.Nc3 Nf6 4.Bg5 Be7 5.e5 Nfd7 6.h4` (Alekhine-Chatard) ya Steinitz `4.e5 Nfd7 5.f4 c5`.',
  'Tarrasch `3.Nd2 c5 4.exd5 Qxd5`: IQP ya open lines. `3...Nf6` se closed lines.',
  'Exchange `3.exd5 exd5`: symmetrical, Black ka bishop `c8` free: aaram se barabar.'],
 steps:[
  {t:'line',h:'Advance: main line',drill:'b',md:'Black ka plan: `d4` par har piece se dabaav.',moves:'e4 e6 d4 d5 e5 c5 c3 Nc6 Nf3 Qb6 {`d4` aur `b2` par.} a3 {`b4` ki taiyaari.} c4 {Queenside band, `b3` square.} Nbd2 Na5 {Knight `b3` ki taraf.} Be2 Bd7 O-O Ne7'},
  {t:'move',after:'e4 e6 d4 d5 e5 c5 c3 Nc6 Nf3 Qb6 Bd3',q:'Advance mein White ne `6.Bd3?!` khela. `d4` ab kamzor hai. Black ki chaal?',line:['cxd4'],ok:['cxd4','Bd7'],why:'`6...cxd4 7.cxd4 Bd7` aur `d4` par dabaav. Ek mashhoor trap: `7...Nxd4?? 8.Nxd4 Qxd4?? 9.Bb5+` aur queen gayi (discovered attack).'},
  {t:'move',after:'e4 e6 d4 d5 e5 c5 c3 Nc6 Nf3 Qb6 Bd3 cxd4 cxd4 Nxd4 Nxd4 Qxd4',q:'Black ne laalach mein `d4` pawn le liya. White, queen jeeto!',line:['Bb5+'],why:'`9.Bb5+!` check, aur bishop ke peeche se queen `d1` `d4` queen par attack kholta hai. Black king bachaaye, White `Qxd4`.'},
  {t:'line',h:'Winawer: main line',drill:'b',md:'Sabse sharp French. White `g7` par attack, Black center aur queenside.',moves:'e4 e6 d4 d5 Nc3 Bb4 e5 c5 a3 Bxc3+ bxc3 Ne7 Qg4 {`g7` par attack.} O-O {Ya `...Qc7`: dono main lines.} Nf3 Nbc6 Bd3 f5 exf6 Rxf6',theory:1},
  {t:'line',h:'Classical: Steinitz',drill:'b',md:'`3...Nf6 4.e5 Nfd7 5.f4`: White ka bada center. Black `...c5` aur `...Nc6` se `d4` par.',moves:'e4 e6 d4 d5 Nc3 Nf6 e5 Nfd7 f4 c5 Nf3 Nc6 Be3 a6 Qd2 b5 dxc5 Bxc5 Bxc5 Nxc5'},
  {t:'line',h:'Tarrasch: 3...c5',drill:'b',md:'`3.Nd2` ke khilaaf `3...c5`: open lines, aksar IQP.',moves:'e4 e6 d4 d5 Nd2 c5 exd5 Qxd5 {Queen center mein: knight `c3` par nahi aa sakta.} Ngf3 cxd4 Bc4 Qd6 O-O Nf6 Nb3 Nc6 Nbxd4 Nxd4 Nxd4 a6'},
  {t:'line',h:'Exchange: Black ke liye aasaan',drill:'b',md:'Symmetrical. Black ka bishop `c8` ab free hai.',moves:'e4 e6 d4 d5 exd5 exd5 Bd3 Nc6 c3 Bd6 Nf3 Nge7 O-O Bg4 Re1 Qd7'},
  {t:'quiz',q:'French Advance mein Black ki sabse badi "target"?',opts:['`e5` ka sir','`d4`: White pawn chain ki jad','`h2`'],a:1,why:'Chain ko jad se todo: `...c5`, `...Nc6`, `...Qb6`, `...Ne7-f5`.'},
  {t:'quiz',q:'Winawer `7.Qg4` ka target?',opts:['`g7` (bishop gaya, dark squares kamzor)','`a7`','`d5`'],a:0,why:'`...Bxc3` ke baad Black ka dark bishop nahi: `g7` kamzor.'}
 ]},
/* ---------------------------------------------------------------- */
{id:'op2ck',title:'Caro-Kann (club): Advance, Classical, Panov, Exchange, Two Knights',sub:'Har system ka main line aur traps',
 yaad:[
  'Advance `3.e5 Bf5 4.Nf3 e6 5.Be2 c5` (Short) ya `4.Nc3 e6 5.g4` (Bayonet): bishop ko pareshan karna.',
  'Classical `4...Bf5 5.Ng3 Bg6 6.h4 h6 7.Nf3 Nd7 8.h5 Bh7 9.Bd3 Bxd3 10.Qxd3`.',
  'Panov `3.exd5 cxd5 4.c4`: IQP positions. Black `...Nf6`, `...e6`, `...Be7`.',
  'Exchange `4.Bd3 Nc6 5.c3`: Carlsbad structure (ulta QGD). Black `...Bg4` ya `...Qc7`.',
  'Trap: `...Nd7` + `Qe2` par `...Ngf6??` `Nd6#`. Aur Advance mein `...Bf5` ke baad `g4` se bishop phansta hai.'],
 steps:[
  {t:'line',h:'Advance: Short Variation',drill:'b',md:'Modern main line. Black pehle bishop, phir `...e6` aur `...c5`.',moves:'e4 c6 d4 d5 e5 Bf5 Nf3 e6 Be2 c5 Be3 cxd4 Nxd4 Ne7 O-O Nbc6 c4 dxc4'},
  {t:'line',h:'Advance: Bayonet (4.Nc3 e6 5.g4)',drill:'b',md:'White pawns se bishop `f5` ka peecha karta hai.',moves:'e4 c6 d4 d5 e5 Bf5 Nc3 e6 g4 Bg6 Nge2 c5 h4 h5 Nf4 Bh7 Nxh5 cxd4'},
  {t:'line',h:'Classical: 10 chaal',drill:'b',md:'Sabse solid main line. Black bishop trade karta hai.',moves:'e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5 Ng3 Bg6 h4 h6 Nf3 Nd7 h5 Bh7 Bd3 Bxd3 Qxd3 e6 Bd2 Ngf6 O-O-O Be7'},
  {t:'line',h:'Panov Attack',drill:'b',md:'`4.c4`: White IQP ke saath active khel. Black solid blockade.',moves:'e4 c6 d4 d5 exd5 cxd5 c4 Nf6 Nc3 e6 Nf3 Be7 cxd5 Nxd5 Bd3 Nc6 O-O O-O Re1 Bf6'},
  {t:'line',h:'Exchange: Carlsbad structure',drill:'b',md:'Queen\'s Gambit Exchange ka ulta. White ka minority attack nahi, kingside attack.',moves:'e4 c6 d4 d5 exd5 cxd5 Bd3 Nc6 c3 Nf6 Bf4 Bg4 Qb3 Qd7 Nd2 e6 Ngf3 Bxf3 Nxf3 Bd6'},
  {t:'move',after:'e4 c6 d4 d5 e5 Bf5 Nc3 e6 g4 Bg6 Nge2 c5 h4 h5 Nf4 Bh7',q:'Bayonet. White ka standard aur strong chaal: bishop `h7` ki diagonal par.',line:['Nxh5'],ok:['Nxh5'],why:'`Nxh5` pawn le liya (`...Rxh5?` nahi: `gxh5`). Theory line.'},
  {t:'move',after:'e4 c6 Nc3 d5 Nf3 dxe4 Nxe4 Bf5 Ng3 Bg6 h4 h6 Ne5 Bh7 Qh5 g6 Bc4 e6 Qe2 Nd7',q:'Caro-Kann Two Knights. White ka mashhoor sacrifice!',line:['Nxf7'],ok:['Nxf7'],why:'`11.Nxf7! Kxf7 12.Qxe6+ Kg7 13.Qf7#`. Black ko `10...Nd7?` ki jagah `10...Nf6` ya `10...Be7` khelna tha. Yeh trap dono taraf se jaano.',theory:1},
  {t:'quiz',q:'Caro-Kann Exchange (`3.exd5 cxd5 4.Bd3`) mein structure ka naam?',opts:['IQP','Carlsbad','Maroczy'],a:1,why:'`d4`/`c3` vs `d5`/`e6`: Carlsbad. Black ka minority attack `...b5-b4` possible.'}
 ]},
/* ---------------------------------------------------------------- */
{id:'op2scan',title:'Scandinavian, Pirc/Modern, Alekhine (club): dono taraf',sub:'Qa5, Qd6, Modern Scandi; 150 Attack, Austrian; Four Pawns aur Modern Alekhine',
 yaad:[
  'Scandinavian `3...Qa5`: `...Nf6`, `...Bf5`/`...Bg4`, `...c6`, `...e6`. `3...Qd6`: modern, solid.',
  'Modern Scandi `2...Nf6 3.d4 Nxd5 4.c4 Nb6`: Black center par baad mein chot.',
  'Pirc 150 Attack: `Be3`, `Qd2`, `f3`/`Bh6`. Austrian: `f4` se bada center. Black `...c6`/`...b5` ya `...e5`/`...c5` break.',
  'Alekhine Four Pawns `e5 c4 d4 f4`: bahut jagah par kamzori. Black `...dxe5`, `...Bf5`, `...Nc6`, `...e6`.',
  'In "hypermodern" defences mein White ka simple rule: center rakho, develop karo, zyada aage mat badho.'],
 steps:[
  {t:'line',h:'Scandinavian 3...Qa5',drill:'b',md:'Classical Scandi. Queen `a5` se `e1` pin aur `a5-e5` dabaav.',moves:'e4 d5 exd5 Qxd5 Nc3 Qa5 d4 Nf6 Nf3 c6 Bc4 Bf5 Bd2 e6 Qe2 Bb4 O-O-O Nbd7 a3'},
  {t:'line',h:'Scandinavian 3...Qd6',drill:'b',md:'Modern choice: queen center ke paas, `...a6`, `...Nf6`, `...g6`.',moves:'e4 d5 exd5 Qxd5 Nc3 Qd6 d4 Nf6 Nf3 a6 g3 Bg4 Bg2 Nc6 O-O O-O-O'},
  {t:'line',h:'Modern Scandi: 2...Nf6',drill:'w',md:'White pawn rakhta hai aur center banata hai.',moves:'e4 d5 exd5 Nf6 d4 Nxd5 c4 Nb6 Nf3 g6 Nc3 Bg7 h3 O-O Be3'},
  {t:'line',h:'Pirc: 150 Attack',drill:'w',md:'Club players ka favourite: seedha `Bh6` aur kingside attack.',moves:'e4 d6 d4 Nf6 Nc3 g6 Be3 c6 Qd2 b5 f3 Nbd7 Bh6 Bxh6 Qxh6 Bb7 Nge2 e5'},
  {t:'line',h:'Pirc: Austrian Attack',drill:'b',md:'`4.f4`: bada center. Black `...c5` se turant chot.',moves:'e4 d6 d4 Nf6 Nc3 g6 f4 Bg7 Nf3 c5 dxc5 Qa5 Bd3 Qxc5 Qe2 O-O Be3 Qa5'},
  {t:'line',h:'Alekhine: Four Pawns Attack',drill:'b',md:'White sab pawns aage. Black un pawns ko target banata hai.',moves:'e4 Nf6 e5 Nd5 d4 d6 c4 Nb6 f4 dxe5 fxe5 Nc6 Be3 Bf5 Nc3 e6 Nf3 Be7'},
  {t:'move',after:'e4 d5 exd5 Qxd5 Nc3 Qa5 d4 Nf6 Nf3 c6 Bc4 Bf5 Bd2 e6 Nd5',q:'Scandinavian: White ne `Nd5` khela, queen `a5` par discovered attack! Black?',line:['Qd8'],why:'`...Qd8` queen bachao (`...cxd5?? Bxa5`). `Nd5` trick yaad rakho: `Bd2` ke baad queen `a5` khatre mein.'},
  {t:'quiz',q:'Alekhine Four Pawns mein White ka sabse bada khatra?',opts:['Bahut jagah, par overextension: pawns kamzor target','Black ka king attack','Koi khatra nahi'],a:0,why:'Aage gaye pawns ko piece bachaate hain. Black dabaav se unhe todta hai.'}
 ]}
 ]
};
