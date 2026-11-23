/* Openings Ladder, Level 5 (Mastery): apna repertoire, poore repertoire ka drill, apni games se update, opponent prep.
   Course: naya level "Openings 5" (sabse aakhir mein). Road to 3000: Level 9. */
module.exports = {
 newLevel:{id:'op5',title:'Openings 5: apna repertoire (mastery)',sub:'Repertoire chuno, poora tree drill karo, apni games se update karo, opponent ke liye taiyaari',
  intro:'Aakhri seedhi: ab tum har opening jaante ho. Yahan apna repertoire pakka karo, use roz drill karo, aur apni games se usse update karte raho. Yahi masters ka tareeka hai.'},
 road: 9,
 lessons: [
/* ---------------------------------------------------------------- */
{id:'rep',title:'Apna repertoire chuno',sub:'Style ke hisaab se 3 tayyar repertoires, aur coverage checklist',
 yaad:[
  'Repertoire = har mumkin jawab ke liye ek tayyar line. Kam par gehra, zyada par kachcha nahi.',
  'Coverage: White `1.e4` ke liye `...e5`, `...c5`, `...e6`, `...c6`, `...d5`, `...d6`/`...g6`, `...Nf6` sab ka jawab.',
  'Black ke liye: `1.e4`, `1.d4`, `1.c4`, `1.Nf3` aur systems (London, KIA) sab ka jawab.',
  'Style: tactical = Sicilian/KID/gambits, positional = Caro/QGD/Catalan, kam theory = systems.',
  'Har 3 mahine repertoire file dekho: kahan games haare, kahan book jaldi khatam hua.'],
 steps:[
  {t:'info',h:'Repertoire ka matlab',md:'Ek **repertoire** tumhari opening "file" hai: har position mein tum kya khelte ho.\n\n- **White:** ek pehli chaal (`1.e4` ya `1.d4`) aur har Black jawab ke liye ek line.\n- **Black vs `1.e4`:** ek defence (jaise `1...e5` ya Caro-Kann).\n- **Black vs `1.d4`:** ek defence (jaise QGD ya Nimzo/KID).\n- **Black vs baaki** (`1.c4`, `1.Nf3`, London, KIA): ek-ek plan.\n\nGehraai level ke hisaab se: 1500 par 8-10 chaal kaafi, 2000+ par 15+ aur middlegame plans.'},
  {t:'info',h:'3 tayyar repertoires (is course ki lines se)',md:'**Solid (positional):** White `1.d4` + Queen\'s Gambit (QGD Exchange plans), London backup. Black: Caro-Kann vs `1.e4`, QGD/Slav vs `1.d4`.\n\n**Aggressive (tactical):** White `1.e4` + Open Sicilian (English Attack), Italian/Evans. Black: Najdorf/Dragon vs `1.e4`, KID vs `1.d4`.\n\n**Kam theory (practical):** White London/KIA system. Black: `1...e5` (Petrov/Italian solid) vs `1.e4`, `...d5` + `...c5`/`...Qb6` vs systems, QGD vs `1.d4`.\n\nJo style tumhe pasand ho, wahi chuno: tumhari games mein woh positions baar-baar aayengi.'},
  {t:'quiz',q:'Tumhe tactics aur attack pasand hai. Black vs `1.e4` ke liye sabse fit?',opts:['Caro-Kann','Sicilian Najdorf ya Dragon','Philidor'],a:1,why:'Sicilian asymmetric aur sharp: dono taraf jeet ke chances.',test:1},
  {t:'quiz',q:'White `1.e4` repertoire mein kaunsa jawab bhool jaate hain log aksar?',opts:['`1...e5`','`1...c5`','`1...Nf6` (Alekhine) aur `1...d6` (Pirc)'],a:2,why:'Kam common defences bhi aate hain. Unke liye ek simple plan (bada center, develop) tayyar rakho.',test:1},
  {t:'quiz',q:'Repertoire ka sabse achha size?',opts:['Har opening ki har line','Kam openings, par unke plans aur structures gehraai se','Sirf pehli 3 chaal'],a:1,why:'Gehraai > chaudai. Structure aur plans jaanoge to theory khatam hone ke baad bhi sahi khel paoge.'}
 ]},
/* ---------------------------------------------------------------- */
{id:'repw',title:'White repertoire drill: 1.e4 (har jawab)',sub:'Italian, Alapin, Advance French/Caro, Scandi, 150 Attack, Alekhine Modern: poora tree',
 yaad:[
  '`1...e5`: Italian Pianissimo (`c3`, `d3`, `a4`, `h3`, `Nbd2-f1-g3`).',
  '`1...c5`: Alapin `2.c3` (`...d5` aur `...Nf6` dono ke jawab).',
  '`1...e6`/`1...c6`: Advance (`3.e5`) aur `c3`/`Nf3`/`Be2`.',
  '`1...d5`: `exd5` + `Nc3` tempo. `1...d6`/`...g6`: 150 Attack. `1...Nf6`: Modern `4.Nf3`.',
  'Ek hi idea har line mein: center, development, phir plan.'],
 steps:[
  {t:'line',h:'vs 1...e5: Italian Pianissimo',drill:'w',md:'Tree ki pehli shaakh.',moves:'e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d3 d6 O-O a6 a4 Ba7 Re1 O-O h3 h6 Nbd2 Re8 Nf1'},
  {t:'line',h:'vs 1...c5: Alapin 2...d5',drill:'w',md:'Queen `d5` par: `d4`, `Nf3`, `Be2`, castle.',moves:'e4 c5 c3 d5 exd5 Qxd5 d4 Nf6 Nf3 Bg4 Be2 e6 O-O Nc6 Be3 cxd4 cxd4 Be7'},
  {t:'line',h:'vs 1...c5: Alapin 2...Nf6',drill:'w',md:'`e5` aur knight `d5` ko pareshan karo.',moves:'e4 c5 c3 Nf6 e5 Nd5 d4 cxd4 Nf3 Nc6 cxd4 d6 Bc4 Nb6 Bb5 dxe5 Nxe5 Bd7'},
  {t:'line',h:'vs 1...e6: French Advance',drill:'w',md:'Chain `d4-e5` ko pieces se bachao.',moves:'e4 e6 d4 d5 e5 c5 c3 Nc6 Nf3 Qb6 a3 c4 Nbd2 Na5'},
  {t:'line',h:'vs 1...c6: Caro Advance (Short)',drill:'w',theory:1,md:'`Nf3`, `Be2`, `O-O`, `c4`.',moves:'e4 c6 d4 d5 e5 Bf5 Nf3 e6 Be2 c5 Be3 cxd4 Nxd4 Ne7 O-O Nbc6 c4 dxc4'},
  {t:'line',h:'vs 1...d5: Scandinavian',drill:'w',md:'Queen ko tempo se bhagao.',moves:'e4 d5 exd5 Qxd5 Nc3 Qa5 d4 Nf6 Nf3 c6 Bc4 Bf5 Bd2 e6 Qe2 Bb4 O-O-O Nbd7 a3'},
  {t:'line',h:'vs 1...d6: 150 Attack',drill:'w',md:'`Be3`, `Qd2`, `f3`, `Bh6`.',moves:'e4 d6 d4 Nf6 Nc3 g6 Be3 c6 Qd2 b5 f3 Nbd7 Bh6 Bxh6 Qxh6 Bb7 Nge2 e5'},
  {t:'line',h:'vs 1...Nf6: Alekhine Modern',drill:'w',md:'Simple center aur development.',moves:'e4 Nf6 e5 Nd5 d4 d6 Nf3 Bg4 Be2 e6 O-O Be7'}
 ]},
/* ---------------------------------------------------------------- */
{id:'repb',title:'Black repertoire drill: 1...e5 aur QGD',sub:'Italian, Ruy (Berlin), Scotch, King\'s Gambit; QGD, London, English: poora tree',
 yaad:[
  'vs Italian: `3...Bc5` Giuoco, plan `...d6`, `...a6`, `...Ba7`, `...Be6`, `...d5`.',
  'vs Ruy: Berlin `3...Nf6`, `4...Nxe4` aur queenless middlegame.',
  'vs Scotch: `4...Bc5` Classical. vs King\'s Gambit: `3...d5`.',
  'vs `1.d4`: QGD Tartakower. vs London: `...c5` + `...Qb6`. vs `1.c4`: Reversed Sicilian `...e5`, `...Nf6`, `...d5`.',
  'Black ka repertoire bhi tree hai: har White system ka ek tayyar jawab.'],
 steps:[
  {t:'line',h:'vs Italian',drill:'b',md:'Giuoco Pianissimo, Black ki taraf se.',moves:'e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d3 d6 O-O a6 a4 Ba7 Re1 O-O h3 h6 Nbd2 Re8 Nf1 Be6'},
  {t:'line',h:'vs Ruy Lopez: Berlin',drill:'b',md:'Queens jaldi trade, solid.',moves:'e4 e5 Nf3 Nc6 Bb5 Nf6 O-O Nxe4 d4 Nd6 Bxc6 dxc6 dxe5 Nf5 Qxd8+ Kxd8 Nc3 Ke8 h3 h5'},
  {t:'line',h:'vs Scotch: Classical',drill:'b',md:'Bishop `c5` + queen `f6`.',moves:'e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Bc5 Be3 Qf6 c3 Nge7 Bc4 Ne5 Be2 Qg6 O-O d6'},
  {t:'line',h:'vs King\'s Gambit',drill:'b',md:'`3...d5` aur pawn wapas, development.',moves:'e4 e5 f4 exf4 Nf3 d5 exd5 Nf6 Bc4 Nxd5 O-O Be7 Nc3 Nxc3 dxc3 Qxd1 Rxd1'},
  {t:'line',h:'vs 1.d4: QGD Tartakower',drill:'b',md:'Classical solid.',moves:'d4 d5 c4 e6 Nc3 Nf6 Bg5 Be7 e3 O-O Nf3 h6 Bh4 b6 cxd5 Nxd5 Bxe7 Qxe7 Nxd5 exd5 Rc1 Be6'},
  {t:'line',h:'vs London',drill:'b',md:'`...c5` aur `...Qb6`.',moves:'d4 d5 Bf4 c5 e3 Nc6 c3 Qb6 Qb3 c4 Qc2 Nf6'},
  {t:'line',h:'vs 1.c4: Reversed Sicilian',drill:'b',md:'`...e5`, `...Nf6`, `...d5`.',moves:'c4 e5 Nc3 Nf6 Nf3 Nc6 g3 d5 cxd5 Nxd5 Bg2 Nb6 O-O Be7'}
 ]},
/* ---------------------------------------------------------------- */
{id:'upd',title:'Apni games se repertoire update',sub:'Book kahan khatam hua, kisne naya khela, aur review cards: Road ka "Opening check"',
 yaad:[
  'Har game ke baad: opening book kahan khatam hua? Pehle kisne chhoda?',
  'Agar tumne chhoda: kya woh chaal achhi thi? Nahi to sahi line repertoire mein jodo.',
  'Agar opponent ne chhoda: uska best jawab dhundo (engine game ke BAAD) aur yaad karo.',
  'Road to 3000 > My Games > **Opening check**: yeh sab apne aap karta hai aur review cards banata hai.',
  'Har mahine repertoire report: kis opening mein score kharab, kahan book jaldi khatam.'],
 steps:[
  {t:'info',h:'Masters ka workflow',md:'1. **Game khelo.** Opening mein engine nahi!\n2. **Game ke baad:** dekho book kahan khatam hua aur kisne pehle naya khela.\n3. **Engine se check:** woh chaal achhi thi ya nahi, aur best kya tha.\n4. **Repertoire update:** sahi line apni file mein jodo, aur use drill karo (spaced review).\n5. **Har mahine report:** kis opening mein haar zyada, kahan galtiyan.\n\nIs app mein: **Road to 3000 > My Games > Opening check**. Woh tumhari Lichess games scan karta hai, har game mein book ka end aur engine ki best chaal dikhata hai, aur galat chaalon ke **review cards** banata hai jo Course aur Road dono ke review mein aate hain.'},
  {t:'quiz',q:'Game mein opponent ne move 6 par book chhod di (naya khela). Tum kya karoge game ke baad?',opts:['Kuch nahi, woh uski galti','Engine se uska best jawab dekho aur apne repertoire mein jodo','Opening badal do'],a:1,why:'Agli baar wahi position aaye to tayyar raho. Yahi repertoire update hai.',test:1},
  {t:'move',after:'e4 c6 d4 d5 e5 Bf5 g4',q:'Tumhari game: Caro Advance mein opponent ne `4.g4?!` khela (book se bahar). Best jawab?',line:['Be4'],ok:['Be4','Bd7'],why:'`4...Be4!` bishop active rehta hai aur `f3` ke baad `...Bg6`. Yeh line repertoire mein jodo.'},
  {t:'move',after:'e4 e5 Nf3 Nc6 Bb5 Nd4',q:'Tumhari game: Ruy Lopez mein opponent ne `3...Nd4` (Bird) khela. Seedha aur achha jawab?',line:['Nxd4'],ok:['Nxd4'],why:'`4.Nxd4 exd4 5.O-O` aur `d3`, `Re1`: White ka development aage. Repertoire mein jodo.'},
  {t:'move',after:'d4 d5 c4 e6 Nc3 c6 e4',q:'Tumhari game (Black): QGD mein White ne `4.e4` (Marshall Gambit) khela. Solid jawab?',line:['dxe4'],ok:['dxe4','Bb4'],why:'`4...dxe4 5.Nxe4 Bb4+` main line. Gambit mein bhi principles: develop, pawn tab tak rakho jab tak development na ruke.'},
  {t:'quiz',q:'Repertoire report mein "Book tak: 4 chaal" aur "Galti: 3" ek opening mein. Matlab?',opts:['Sab theek','Us opening ki theory kam aati hai: uska ladder lesson dobara karo','Opening chhod do'],a:1,why:'Jaldi book khatam + galtiyan = kamzor area. Seedha usi par kaam karo.'}
 ]},
/* ---------------------------------------------------------------- */
{id:'prep',title:'Opponent ke liye taiyaari aur final exam',sub:'Tournament prep ka tareeka, phir poori ladder ka mixed exam',
 yaad:[
  'Prep: opponent ki games (Lichess) se uski openings dekho, apne repertoire mein se sabse achha jawab chuno.',
  'Surprise se pehle apni comfort: aisi line chuno jiske plans tum jaante ho.',
  'Game se pehle 10 minute: chuni hui line 2 baar drill karo, typical plans yaad karo.',
  'Novelty mile to ghabrao mat: principles aur structure ke plans.',
  'Mastery = theory + plans + update ka cycle, roz.'],
 steps:[
  {t:'info',h:'Tournament prep: 4 kadam',md:'1. **Opponent ki games** (Lichess profile, "Opening explorer" mein uska naam): woh White aur Black mein kya khelta hai?\n2. **Apne repertoire se line chuno:** uski favourite line ke khilaaf tumhara best jawab.\n3. **Gehraai:** us line ke plans aur 2-3 sidelines dekho.\n4. **Drill:** game se pehle line 2 baar khud khelo.\n\nYaad rakho: comfort zone wali line > ajeeb surprise jiske plans nahi pata.'},
  {t:'quiz',q:'Opponent hamesha London khelta hai. Tumhara prep?',opts:['Naya opening seekho jo kabhi nahi khela','Apne repertoire ka London plan (`...c5` + `...Qb6` ya `...Nh5`) dobara drill karo','Prep mat karo'],a:1,why:'Jo jaante ho usse pakka karo. Plan ready = confidence.',test:1},
  {t:'move',after:'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6',q:'Final exam: Open Sicilian. White ki chaal?',line:['Nc3'],why:'`5.Nc3` `e4` bachao, develop.'},
  {t:'move',after:'d4 d5 c4 e6 Nc3 Nf6 Bg5 Nbd7 cxd5 exd5 Nxd5',q:'Final exam: QGD. Black, Elephant trap!',line:['Nxd5'],why:'`...Nxd5! Bxd8 Bb4+` aur piece wapas, Black upar.'},
  {t:'move',after:'e4 e6 d4 d5 e5',q:'Final exam: French Advance. Black?',line:['c5'],why:'Chain ki jad par chot.'},
  {t:'move',after:'d4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Nf3 O-O Be2 e5 O-O Nc6 d5',q:'Final exam: KID. Black ka knight kahan?',line:['Ne7'],why:'`...Ne7` aur phir `...Nd7`/`...Ne8`, `...f5`.'},
  {t:'move',after:'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3 O-O c3',q:'Final exam: Ruy Lopez. Black ka gambit?',line:['d5'],ok:['d5','d6'],why:'`8...d5` Marshall. `8...d6` Closed bhi theek.'},
  {t:'move',after:'d4 d5 Bf4 c5 e3 Nc6 c3',q:'Final exam: London. Black ka seedha plan?',line:['Qb6'],ok:['Qb6','Nf6'],why:'`...Qb6` `b2` par.'},
  {t:'move',after:'e4 c6 d4 d5 Nc3 dxe4 Nxe4 Nd7 Qe2 Ngf6',q:'Final exam: Caro-Kann trap. White!',line:['Nd6#'],why:'Smothered mate.'},
  {t:'move',after:'d4 Nf6 c4 e6 Nc3 Bb4 e3 O-O Bd3 d5 Nf3 c5 O-O Nc6 a3',q:'Final exam: Nimzo. Black?',line:['Bxc3'],ok:['Bxc3','Ba5'],why:'`...Bxc3` doubled pawns, phir `...dxc4` aur `...Qc7`.'}
 ]}
 ]
};
