/* Openings Ladder, Level 1 (Beginner): har family ki pehli chaalein.
   Main Course: "Safety, captures aur opening basics" (l2b) ke end mein judta hai.
   Road to 3000: Level 2 mein.
   Sirf woh cheezein use hoti hain jo is se pehle sikhaayi gayi: board, rules, notation, basic mates,
   hanging pieces, captures, opening ke 10 principles, shuruaati traps, forcing moves (CCT).
   Format (tools/openings/build.js samajhta hai):
   - line: moves "e4 {note} e5 ..." (note us chaal ke baad dikhta hai). drill 'w'/'b' = baad mein khud khelo.
   - move/quiz: after:"e4 e5" = start se in chaalon ke baad ki position (fen build karta hai). */
module.exports = {
 to: 'l2b',
 road: 2,
 lessons: [
/* ---------------------------------------------------------------- */
{id:'opmap',title:'Openings ka naksha: families aur repertoire',sub:'4 families, gambit, system, aur openings seekhne ki 5 seedhiyan',
 yaad:[
  '`1.e4 e5` = Open game. `1.e4` + koi aur jawab = Semi-open. `1.d4 d5` = Closed. Baaki (`c4`, `Nf3`, `...Nf6` + `...g6`) = Indian aur flank.',
  'Repertoire = 3 tayyar jawab: White ke liye ek opening, Black ke liye `1.e4` ke khilaaf ek, `1.d4` ke khilaaf ek.',
  'Naam se pehle idea: har opening chaal center, development ya king safety ke liye hoti hai.',
  'Gambit = pawn (ya piece) de kar tez development ya attack. System = opponent kuch bhi khele, same setup.',
  'Anjaan opening mile to ghabrao mat: 10 principles se khelo.'],
 steps:[
  {t:'info',h:'Har opening 4 families mein se ek',fen:'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',md:'Duniya mein hazaaron opening naam hain, par sab 4 families mein aate hain:\n\n- **Open game** (`1.e4 e5`): pieces jaldi bahar, tez khel. Italian, Ruy Lopez, Scotch.\n- **Semi-open** (`1.e4` aur Black `...e5` nahi khelta): Sicilian, French, Caro-Kann, Scandinavian.\n- **Closed** (`1.d4 d5`): dheema, plan wala khel. Queen\'s Gambit, London.\n- **Indian aur flank** (`1.d4 Nf6`, `1.c4`, `1.Nf3`): center ko door se control. King\'s Indian, Nimzo-Indian, English.\n\nFamily pata ho to plan bhi aadha pata hota hai.'},
  {t:'quiz',after:'e4 e5',q:'Yeh kaunsi family hai?',opts:['Open','Semi-open','Closed','Indian / flank'],a:0,why:'Dono ne king pawn 2 square chalaya: **Open game**.'},
  {t:'quiz',after:'e4 c5',q:'Black ne `1...c5` khela. Kaunsi family?',opts:['Open','Semi-open','Closed','Indian / flank'],a:1,why:'`1.e4` ke baad Black ne `...e5` nahi khela: **Semi-open**. Yeh Sicilian hai.'},
  {t:'quiz',after:'d4 d5',q:'Kaunsi family?',opts:['Open','Semi-open','Closed','Indian / flank'],a:2,why:'Queen pawns aamne-saamne: **Closed game**.'},
  {t:'quiz',after:'d4 Nf6 c4 g6',q:'Kaunsi family?',opts:['Open','Semi-open','Closed','Indian / flank'],a:3,why:'Black knight aur `...g6` se center ko door se dekh raha hai: **Indian** (King\'s Indian ya Grunfeld).'},
  {t:'quiz',after:'c4',q:'White ne `1.c4` khela. Kaunsi family?',opts:['Open','Semi-open','Closed','Indian / flank'],a:3,why:'`1.c4` **English Opening** hai: flank (side) se center ka control.'},
  {t:'info',h:'Repertoire: tumhare 3 tayyar jawab',md:'Har opening yaad karna zaroori nahi. Tumhe sirf **apna repertoire** chahiye:\n\n- **White ke liye 1 opening** (jaise `1.e4` aur Italian Game)\n- **Black: `1.e4` ke khilaaf 1 jawab** (jaise `1...e5`, ya Caro-Kann)\n- **Black: `1.d4` ke khilaaf 1 jawab** (jaise Queen\'s Gambit Declined)\n\nBaaki openings ki sirf **pehli chaalein aur idea** jaano, taaki opponent kuch bhi khele, tum ghabrao nahi. Yeh lesson series wahi sikhaati hai.'},
  {t:'quiz',q:'Ek beginner ka repertoire kitne hisse ka hota hai?',opts:['1: sirf White','3: White, Black vs 1.e4, Black vs 1.d4','Har opening ka poora theory'],a:1,why:'Teen tayyar jawab kaafi hain. Baaki openings ka bas idea.'},
  {t:'info',h:'Gambit aur system kya hote hain?',after:'e4 e5 f4',arr:[['f4','e5','r']],md:'**Gambit**: opening mein jaan-boojh kar pawn (kabhi piece) dena, taaki badle mein **tez development, center ya attack** mile. Yahan `2.f4` King\'s Gambit hai: White `f4` pawn deta hai taaki `e5` hate aur center khule.\n\n**System**: ek setup jo opponent kuch bhi khele, lagbhag same rehta hai. Jaise **London System**: `d4`, `Bf4`, `e3`, `Nf3`, `c3`, `Bd3`. Kam theory, par opponent ko pata ho to woh sahi plan se jawab de sakta hai.\n\nIs series mein har gambit aur har system ke saath uska **defence** bhi sikhoge.'},
  {t:'quiz',q:'King\'s Gambit (`2.f4`) mein White pawn kyun deta hai?',opts:['Galti se','Center aur tez development ke liye','Endgame jeetne ke liye'],a:1,why:'Gambit = material ke badle samay (development) aur center.'},
  {t:'quiz',q:'"System" opening ka sabse bada fayda?',opts:['Har position mein jeet','Kam theory: same setup har baar','Queen jaldi bahar aati hai'],a:1,why:'System kam yaad karna padta hai. Nuksaan: opponent ko tayyar jawab pata ho sakta hai.'},
  {t:'info',h:'Har opening ki 5 seedhiyan',md:'Har opening is course mein 5 level mein aayegi:\n\n1. **Beginner** (abhi): pehli 4-8 chaal, har chaal kyun, aur 1 trap.\n2. **Club**: main line 10 chaal tak, opponent ki galat sidelines ko saza.\n3. **Advanced**: 12-15+ chaal ka tree, move orders aur transpositions, pawn structure aur middlegame plan.\n4. **Master**: model games, critical lines, typical endgames.\n5. **Mastery**: apni repertoire file, roz ka review, apni games se update.\n\nAbhi sirf seedhi 1. Baaki seedhiyan tactics, plans aur endgames seekhne ke baad aayengi.'},
  {t:'quiz',q:'Opponent ne aisi opening khel di jo tumne kabhi nahi dekhi. Kya karoge?',opts:['Resign','10 principles se khelo: center, development, castle','Uski chaalein copy karo'],a:1,why:'Principles har opening mein kaam karte hain. Naam pata hona zaroori nahi.'}
 ]},
/* ---------------------------------------------------------------- */
{id:'op1open',title:'Open games: pehli chaalein (1.e4 e5)',sub:'Italian, Ruy Lopez, Scotch, Petrov, Philidor, Vienna, King\'s Gambit',
 yaad:[
  '`1.e4 e5 2.Nf3 Nc6` ke baad teesri chaal naam deti hai: `3.Bc4` Italian, `3.Bb5` Ruy Lopez, `3.d4` Scotch.',
  'Italian: bishop `c4` kamzor `f7` ko dekhta hai. Plan: `c3`, `d3`, castle.',
  'Ruy Lopez: bishop `b5` `e5` ke defender (`Nc6`) par dabaav. `3...a6 4.Ba4` bishop rakho.',
  'Petrov `2...Nf6`: `3.Nxe5` ke baad `3...d6!` pehle. `3...Nxe4?` par `4.Qe2!`.',
  'Ajeeb jawab (`2...f5`, `2...d5`) ka jawab: seedha development aur center, laalach nahi.'],
 steps:[
  {t:'info',h:'Sabse purani family',after:'e4 e5 Nf3 Nc6',md:'`1.e4 e5 2.Nf3` (knight `e5` par attack) `2...Nc6` (pawn bachao) sabse common shuruaat hai.\n\nAb White ki **teesri chaal** opening ka naam tay karti hai:\n\n- `3.Bc4` **Italian Game**\n- `3.Bb5` **Ruy Lopez** (Spanish)\n- `3.d4` **Scotch Game**\n- `3.Nc3` (`...Nf6` ke saath) **Four Knights**'},
  {t:'line',h:'Italian Game (Giuoco Piano)',drill:'w',md:'Beginner ke liye sabse achhi opening: seedhe plans.',moves:'e4 {Center aur bishop/queen ke liye raasta.} e5 Nf3 {Knight develop, `e5` par attack.} Nc6 {Pawn bachaya.} Bc4 {Bishop `f7` ko dekhta hai: shuru mein `f7` ko sirf king bachata hai.} Bc5 {Black bhi `f2` ko dekhta hai.} c3 {Idea: baad mein `d4` se center.} Nf6 d3 {Shaant aur solid: `e4` bacha.} d6 O-O {Castle! King safe.} O-O'},
  {t:'move',after:'e4 e5 Nf3 Nc6 Bc4',q:'Italian Game. Black ki achhi developing chaal chalo.',line:['Bc5'],ok:['Bc5','Nf6','Be7'],why:'`3...Bc5` (Giuoco Piano) ya `3...Nf6` (Two Knights) dono principle wali chaalein hain: piece bahar, center par nazar.'},
  {t:'line',h:'Ruy Lopez (Spanish)',drill:'w',md:'Top players ki favourite. Dheere-dheere dabaav.',moves:'e4 e5 Nf3 Nc6 Bb5 {Bishop `e5` ke defender `Nc6` par dabaav.} a6 {Bishop se pucho: kya karoge?} Ba4 {Bishop rakha (Morphy Defence).} Nf6 O-O {Pehle castle, `e4` ki chinta baad mein.} Be7 Re1 {Rook `e4` ko bachata hai.} b5 Bb3 {Bishop phir bhi `f7` ki line par.} d6 c3 {`d4` ki taiyaari.} O-O'},
  {t:'quiz',after:'e4 e5 Nf3 Nc6 Bb5',q:'Ruy Lopez mein White ka bishop `b5` asal mein kisko dabaata hai?',opts:['Black king ko','`Nc6` ko, jo `e5` bachata hai','`a7` pawn ko'],a:1,why:'`Nc6` hata to `e5` kamzor. Isi liye dabaav dheere-dheere badhta hai.'},
  {t:'line',h:'Scotch Game',drill:'w',md:'White turant `d4` se center kholta hai.',moves:'e4 e5 Nf3 Nc6 d4 {Seedha center par chot.} exd4 Nxd4 {Knight center mein, pawn wapas.} Bc5 {Knight `d4` par dabaav.} Be3 {Knight bachaya, bishop develop.} Qf6 c3 {Knight ko aur sahara.} Nge7'},
  {t:'line',h:'Petrov Defence: copy mat karo!',drill:'b',md:'Black `2...Nf6` se ulta `e4` par attack karta hai. Solid opening, par ek zaroori trick yaad rakho.',moves:'e4 e5 Nf3 Nf6 {Petrov: Black bhi attack karta hai.} Nxe5 d6 {Pehle knight ko bhagao! `3...Nxe4?` galat hai.} Nf3 Nxe4 {Ab pawn wapas lo.} d4 d5 Bd3 Nc6 O-O Be7'},
  {t:'move',after:'e4 e5 Nf3 Nf6 Nxe5 Nxe4',q:'Black ne galti se copy kiya: `3...Nxe4?`. White ki sabse achhi chaal?',line:['Qe2'],hint:'Queen se `e4` knight par attack, aur e-file par Black king ki taraf dekho.',why:'`4.Qe2!` knight par attack. `4...Nf6??` `5.Nc6+` (discovered check) se queen jaati hai. `4...Qe7 5.Qxe4 d6 6.d4` aur White pawn aage.'},
  {t:'line',h:'Philidor Defence',drill:'b',md:'`2...d6`: Black `e5` ko pawn se bachata hai. Solid par thoda passive.',moves:'e4 e5 Nf3 d6 {`e5` bacha, par bishop `f8` thoda band.} d4 Nf6 {`e4` par counter-attack.} Nc3 Nbd7 {`e5` ko phir se bachaya.} Bc4 Be7 O-O O-O'},
  {t:'line',h:'Vienna Game',drill:'w',md:'`2.Nc3`: pehle knight, phir `f4` ka idea.',moves:'e4 e5 Nc3 {Knight `d5` aur `e4` dekhta hai.} Nf6 f4 {`e5` par chot: attacking idea.} d5 {Black ka sahi jawab: center mein counter.} fxe5 Nxe4 Nf3 {Develop karo, `d4` ki taiyaari.} Be7'},
  {t:'line',h:'King\'s Gambit: accept aur develop',drill:'b',md:'`2.f4` pawn deta hai. Black pawn le sakta hai, par phir **jaldi development** aur **center mein counter** zaroori.',moves:'e4 e5 f4 {Gambit: `e5` ko hatao, f-file kholo.} exf4 {Gambit accept.} Nf3 {`...Qh4+` rokta hai aur develop.} d5 {Center mein counter! Pawn wapas dene ko bhi tayyar.} exd5 Nf6 {Develop karo, `d5` wapas loge.} Bc4 Nxd5'},
  {t:'move',after:'e4 e5 Nf3 f5 Nxe5 Qf6',q:'Black ne ajeeb `2...f5?` (Latvian Gambit) khela, White ne `e5` le liya, aur Black ne `3...Qf6` se knight par attack kiya. White: knight ko support do aur center lo.',line:['d4'],ok:['d4','Nc4'],why:'`4.d4!` knight ko sahara aur center. Latvian gambit apne king ko kamzor karta hai, White seedha development se aage rehta hai.'},
  {t:'move',after:'e4 e5 Nf3 d5 exd5 e4',q:'Elephant Gambit (`2...d5?!`) mein Black ne `3...e4` khela, knight par attack. White ki achhi chaal?',line:['Qe2'],hint:'Knight ko bachao aur saath mein `e4` pawn par chot karo.',why:'`4.Qe2!` knight bhi bacha aur `e4` pawn par dabaav. `4...Nf6 5.d3` aur White pawn aage. Knight hatana (`Nd4`) kamzor hai.'},
  {t:'quiz',after:'e4 e5 Nf3 Nc6 d4',q:'Yeh kaunsi opening hai?',opts:['Italian','Ruy Lopez','Scotch','Vienna'],a:2,why:'`3.d4` = **Scotch Game**.'}
 ]},
/* ---------------------------------------------------------------- */
{id:'op1sic',title:'Sicilian: pehli chaalein (1.e4 c5)',sub:'Open Sicilian, Najdorf, Dragon, Sveshnikov, Taimanov, Alapin, Smith-Morra, Grand Prix',
 yaad:[
  '`1...c5` se Black `d4` ko side se rokta hai. Board ek-tarfa (asymmetric): jeet ke chances dono taraf.',
  'Open Sicilian: `2.Nf3` + `3.d4`, `cxd4`, `Nxd4`. Black ko c-file aur center ka extra pawn milta hai.',
  'Black ki 2nd/5th chaal family batati hai: `...a6` Najdorf, `...g6` Dragon, `...e5` Sveshnikov (`Nc6` + `Nf6` ke saath), `...e6` + `...Nc6` Taimanov.',
  'Anti-Sicilian: `2.c3` Alapin (`...Nf6` ya `...d5`), `2.d4 cxd4 3.c3` Smith-Morra (lo aur jaldi develop, ya `...Nf6` se mana), `2.Nc3` + `f4` Grand Prix.',
  'Open Sicilian mein `Nxd4 ...Nf6` ke baad `Nc3` se `e4` bachao.'],
 steps:[
  {t:'info',h:'Sicilian ka idea',after:'e4 c5',arr:[['c5','d4']],md:'`1...c5` duniya mein `1.e4` ka sabse popular jawab hai.\n\n- Black `d4` ko **side se** control karta hai.\n- Baad mein `...cxd4` ke badle Black ko **c-file** (aadhi khuli) aur center mein **ek extra pawn** milta hai.\n- Position ek-tarfa hoti hai: jo achha khele woh jeete. Draw kam.'},
  {t:'line',h:'Open Sicilian: Najdorf',drill:'b',md:'Fischer aur Kasparov ki opening.',moves:'e4 c5 Nf3 d6 {`e5` rokta hai, `Nf6` ki taiyaari.} d4 {White center kholta hai: Open Sicilian.} cxd4 Nxd4 Nf6 {`e4` par attack.} Nc3 {`e4` bachaya.} a6 {**Najdorf**: `b5` aur `e5` ke liye taiyaari, `Nb5` rokta hai.}'},
  {t:'move',after:'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6',q:'Black ka knight `e4` par attack kar raha hai. White ki sahi chaal?',line:['Nc3'],ok:['Nc3','f3'],why:'`5.Nc3` develop bhi aur `e4` ki raksha bhi. Principle: develop karte hue bachao.'},
  {t:'line',h:'Dragon',drill:'b',md:'Bishop `g7` par: lambi diagonal ka "dragon".',moves:'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 {**Dragon**: bishop `g7` par aayega.} Be3 Bg7 f3 {White `g4`, `h4` se attack ki soch raha hai.} O-O Qd2 Nc6'},
  {t:'line',h:'Sveshnikov',drill:'b',md:'Black `...e5` se knight ko bhagata hai. `d5` square kamzor hota hai, par pieces active.',moves:'e4 c5 Nf3 Nc6 d4 cxd4 Nxd4 Nf6 Nc3 e5 {Knight ko bhagao, center lo.} Ndb5 {Knight `d6` square par nazar.} d6 {`Nd6+` roka.}'},
  {t:'line',h:'Taimanov',drill:'b',md:'Flexible: `...e6`, `...Nc6`, `...Qc7`.',moves:'e4 c5 Nf3 e6 d4 cxd4 Nxd4 Nc6 Nc3 Qc7 {Queen `e5` aur c-file par.}'},
  {t:'line',h:'Alapin (2.c3) aur Black ka jawab',drill:'b',md:'White `c3` se `d4` mein pawn se wapas lena chahta hai. Black ka seedha jawab: `...Nf6` se `e4` par chot.',moves:'e4 c5 c3 {Agle `d4` ki taiyaari.} Nf6 {`e4` par attack!} e5 Nd5 d4 cxd4 Nf3 Nc6 cxd4 d6'},
  {t:'line',h:'Smith-Morra Gambit: lena aur bachna',drill:'b',md:'White 1 pawn deta hai tez development ke liye. Black le sakta hai, par **jaldi develop karo** aur `d6`/`e6` se pieces ke raaste kholo.',moves:'e4 c5 d4 cxd4 c3 {Gambit.} dxc3 Nxc3 {White tez develop karega.} Nc6 Nf3 d6 Bc4 e6 {`Bc4` ki diagonal band, `d5` control.} O-O Nf6'},
  {t:'line',h:'Smith-Morra: mana karna (decline)',drill:'b',md:'Lena nahi chahte? `3...Nf6` se `e4` par chot: ab position Alapin jaisi.',moves:'e4 c5 d4 cxd4 c3 Nf6 {Gambit decline, `e4` par attack.} e5 Nd5 {Knight center mein.}'},
  {t:'line',h:'Grand Prix Attack',drill:'b',md:'`2.Nc3` aur `f4`: kingside attack. Black fianchetto se seedha develop karta hai.',moves:'e4 c5 Nc3 Nc6 f4 {Attack ka idea: `f5` aage.} g6 Nf3 Bg7 Bc4 e6 {Bishop `c4` ki diagonal band.}'},
  {t:'quiz',after:'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6',q:'Yeh kaunsa Sicilian hai?',opts:['Dragon','Najdorf','Sveshnikov','Taimanov'],a:1,why:'`5...a6` = **Najdorf**.'},
  {t:'quiz',q:'Open Sicilian mein `...cxd4` trade se Black ko kya milta hai?',opts:['Extra piece','Aadhi khuli c-file aur center mein extra pawn','Kuch nahi'],a:1,why:'Black ka `d`/`e` pawn bachta hai (2 center pawns vs White ka 1), aur c-file rooks ke liye.'}
 ]},
/* ---------------------------------------------------------------- */
{id:'op1semi',title:'French, Caro-Kann, Scandinavian aur baaki',sub:'1.e4 ke solid aur ajeeb jawab: unka idea aur White ka plan',
 yaad:[
  'French `1...e6 2.d4 d5`: solid. Kamzori: bishop `c8` andar band. Advance (`3.e5`) ke khilaaf `...c5!`.',
  'Caro-Kann `1...c6 2.d4 d5`: French jaisa solid, par bishop `c8` pehle bahar (`...Bf5`/`...Bg4`), phir `...e6`.',
  'Scandinavian `1...d5`: `2.exd5 Qxd5 3.Nc3` tempo ke saath queen ko bhagao.',
  'Pirc/Modern (`...d6`, `...g6`) aur Alekhine (`1...Nf6`): White ko center dete hain, baad mein chot karte hain. White: bada center + develop.',
  'Caro-Kann trap: `...Nd7` aur `Qe2` ke baad `...Ngf6??` par `Nd6#`.'],
 steps:[
  {t:'line',h:'French Defence: Advance Variation',drill:'b',md:'`1...e6` aur `2...d5`. White `3.e5` se jagah leta hai. Black ka sabse zaroori jawab: `...c5` se pawn chain ki **jad** (`d4`) par chot.',moves:'e4 e6 {`d5` ki taiyaari.} d4 d5 {Center mein chot.} e5 {Advance: jagah lo.} c5 {Pawn chain ki jad `d4` par chot!} c3 Nc6 {`d4` par aur dabaav.} Nf3 Qb6 {`d4` aur `b2` dono par.}'},
  {t:'move',after:'e4 e6 d4 d5 e5',q:'French Advance. Black ki sabse principled chaal?',line:['c5'],ok:['c5'],why:'`3...c5!` White ki chain `d4-e5` ki jad par chot. French ka asli idea.'},
  {t:'line',h:'French: Winawer aur Tarrasch (pehli chaalein)',drill:'b',md:'`3.Nc3` par Black `...Bb4` (Winawer) se pin karta hai. `3.Nd2` (Tarrasch) par `...Nf6` ya `...c5`.',moves:'e4 e6 d4 d5 Nc3 {`e4` bachaya.} Bb4 {**Winawer**: knight par pin, `e4` par dabaav.} e5 c5 a3 Bxc3+ bxc3 Ne7'},
  {t:'info',h:'French ki kamzori: bishop c8',after:'e4 e6 d4 d5 e5',hl:['c8','e6','d5'],md:'French mein Black ke pawns `e6`-`d5` light squares par hain, isliye **bishop `c8` andar band** ho jaata hai. Black ke plans: `...b6` + `...Ba6` se bishop trade, ya `...f6` se chain todna.\n\nIsi kamzori ka hal Caro-Kann mein hai.'},
  {t:'line',h:'Caro-Kann: Classical',drill:'b',md:'`1...c6` aur `2...d5`. Bishop `e6` se pehle bahar.',moves:'e4 c6 {`d5` ki taiyaari.} d4 d5 Nc3 dxe4 Nxe4 Bf5 {Bishop pehle bahar, phir `...e6`.} Ng3 {Bishop par attack.} Bg6 h4 {`h5` se bishop ko pareshan karna.} h6 Nf3 Nd7'},
  {t:'line',h:'Caro-Kann: Advance',drill:'b',md:'`3.e5` par bhi bishop pehle bahar, phir `...e6` aur `...c5`.',moves:'e4 c6 d4 d5 e5 {Advance.} Bf5 {Bishop chain ke bahar.} Nf3 e6 Be2 c5 {Chain ki jad par chot.}'},
  {t:'move',after:'e4 c6 d4 d5 Nc3 dxe4 Nxe4 Nd7 Qe2 Ngf6',q:'Black ne `5...Ngf6??` khela. Ek chaal mein jeeto!',line:['Nd6#'],why:'`6.Nd6#` smothered mate: `e7` pawn ko queen `e2` ne pin kiya hai. Isliye Caro-Kann mein `...Nd7` ke baad `...Ngf6` se pehle `Qe2` ka dhyan rakho.'},
  {t:'line',h:'Scandinavian: queen ko tempo se bhagao',drill:'w',md:'`1...d5` se Black turant center mein. White `exd5` aur `Nc3` se queen ko bhagata hai: har baar Black ki queen hile, White ka ek piece develop.',moves:'e4 d5 exd5 Qxd5 Nc3 {Queen par attack, develop karte hue.} Qa5 d4 Nf6 Nf3 Bf5 Bc4 e6 Bd2 c6'},
  {t:'line',h:'Pirc aur Modern',drill:'w',md:'Black `...d6`, `...Nf6`, `...g6` se center White ko deta hai. White: **bada center** aur seedha development (`Be3`, `Qd2`, `f3`).',moves:'e4 d6 d4 Nf6 Nc3 g6 Be3 Bg7 Qd2 c6 f3 {`e4` mazboot, `g4`/`h4` ka attack plan.} b5'},
  {t:'line',h:'Alekhine Defence',drill:'w',md:'`1...Nf6` White ko pawns aage chalne ke liye uksaata hai. White aaram se center rakhta hai, laalach mein zyada pawn aage nahi.',moves:'e4 Nf6 {Knight `e4` par.} e5 Nd5 d4 d6 Nf3 {Modern variation: seedha develop.} Bg4 Be2 e6 O-O Be7'},
  {t:'quiz',q:'Caro-Kann French se behtar kis cheez mein hai?',opts:['Queen jaldi bahar','Bishop c8 pehle bahar aa jaata hai','Castling nahi karni padti'],a:1,why:'`...c6` + `...d5` ke baad `...Bf5`/`...Bg4`, phir `...e6`. Bishop band nahi hota.'},
  {t:'quiz',after:'e4 d5 exd5 Qxd5',q:'Scandinavian. White ki sabse principled chaal?',opts:['Qf3','Nc3: develop + queen par tempo','c4'],a:1,why:'`3.Nc3` develop karta hai aur queen ko phir chalna padta hai. Har tempo White ka.'}
 ]},
/* ---------------------------------------------------------------- */
{id:'op1qg',title:'1.d4 d5: Queen\'s Gambit aur uske jawab',sub:'QGD, QGA, Slav, Albin Countergambit',
 yaad:[
  'Queen\'s Gambit `1.d4 d5 2.c4`: asli gambit nahi, White pawn aksar wapas le leta hai.',
  'QGD `2...e6`: sabse solid. Plan: `...Nf6`, `...Be7`, castle, baad mein `...c5` ya `...e5`.',
  'QGA `2...dxc4`: lo, par pawn pakad ke mat rakho. `...b5?` par `a4` aur `Qf3` jaisi tricks.',
  'Slav `2...c6`: `d5` bachao aur bishop `c8` bahar rakho.',
  'Albin `2...e5`: tricky. White `e3??` mat khele: Lasker trap mein `...fxg1=N+!`.'],
 steps:[
  {t:'info',h:'Queen\'s Gambit ka idea',after:'d4 d5 c4',arr:[['c4','d5']],md:'`2.c4` White ka `c` pawn Black ke `d5` (center) pawn ko hatane ki koshish hai.\n\nNaam "gambit" hai, par Black pawn le to bhi White aksar `e3` + `Bxc4` se wapas le leta hai. Black ke teen main jawab:\n\n- `2...e6` **Declined (QGD)**\n- `2...dxc4` **Accepted (QGA)**\n- `2...c6` **Slav**'},
  {t:'line',h:'Queen\'s Gambit Declined',drill:'b',md:'Classical solid setup. Champions ki favourite.',moves:'d4 d5 c4 e6 {`d5` ko pawn se bachaya.} Nc3 Nf6 Bg5 {Knight par pin.} Be7 {Pin hataya.} e3 O-O Nf3 Nbd7 {Plan: `...c6`, `...dxc4`, `...e5` ya `...c5`.}'},
  {t:'line',h:'Queen\'s Gambit Accepted',drill:'b',md:'Black pawn leta hai par usse pakad ke nahi rakhta. Badle mein free development aur `...c5`.',moves:'d4 d5 c4 dxc4 {Pawn liya.} Nf3 Nf6 e3 e6 {Bishop `f8` ka raasta khula.} Bxc4 {Pawn wapas.} c5 {Center par chot.} O-O a6'},
  {t:'move',after:'d4 d5 c4 dxc4 e3 b5 a4 c6 axb5 cxb5',q:'Black ne laalach mein pawn `...b5` se pakda. White ke paas ek zabardast chaal hai!',line:['Qf3'],hint:'Queen ek saath do cheezein attack kar sakti hai: `a8` rook aur...',why:'`6.Qf3!` `a8` rook par attack (bishop `c8` aur knight `b8` beech mein band). Black ek piece kho dega. Seekh: QGA mein pawn wapas dena theek hai.'},
  {t:'line',h:'Slav Defence',drill:'b',md:'`2...c6`: `d5` ko pawn se bachao, bishop `c8` free rahe.',moves:'d4 d5 c4 c6 {`d5` bachaya.} Nf3 Nf6 Nc3 dxc4 {Ab pawn liya, kyunki `a4` ke baad bishop bahar aayega.} a4 Bf5 {Bishop bahar, `...e6` se pehle.} e3 e6 Bxc4 Bb4'},
  {t:'line',h:'Albin Countergambit',drill:'w',md:'`2...e5` Black ka gambit. White pawn le aur aaram se develop kare.',moves:'d4 d5 c4 e5 {Albin.} dxe5 d4 {Pawn `d4` White ke liye kaanta.} Nf3 {Seedha develop.} Nc6 g3 {Bishop `g2` se long diagonal.} Be6 Nbd2'},
  {t:'move',after:'d4 d5 c4 e5 dxe5 d4 e3 Bb4+ Bd2 dxe3 Bxb4 exf2+ Ke2',q:'Albin mein White ne `4.e3?` khela aur ab king `e2` par hai. Black, jeet ki chaal dhundo!',line:['fxg1=N+'],hint:'Promotion with check, par queen nahi!',why:'`7...fxg1=N+!` (**Lasker trap**): knight banao, check ke saath. `8.Ke1 Qh4+` ya `8.Rxg1 Bg4+` jeetta hai. Underpromotion yaad hai?'},
  {t:'quiz',q:'Queen\'s Gambit Accepted mein Black ko sabse zyada kya nahi karna chahiye?',opts:['Develop karna','Pawn ko `...b5` se pakad ke rakhna','`...c5` khelna'],a:1,why:'`...b5` se queenside kamzor hota hai aur `a4`, `Qf3` jaisi tricks aati hain.'},
  {t:'quiz',after:'d4 d5 c4 c6',q:'Yeh kaunsa jawab hai?',opts:['QGD','QGA','Slav','Albin'],a:2,why:'`2...c6` = **Slav**.'}
 ]},
/* ---------------------------------------------------------------- */
{id:'op1ind',title:'Indian defences aur flank openings',sub:'King\'s Indian, Nimzo, Queen\'s Indian, Grunfeld, Benoni, Dutch, English, Reti, KIA, Bird',
 yaad:[
  'Indian = `1.d4 Nf6`: knight pehle, pawns baad mein. Bishop aksar fianchetto (`g7`/`b7`).',
  'King\'s Indian (`...g6`, `...Bg7`, `...d6`, `...e5`): White ko center do, phir kingside attack. Grunfeld (`...g6` + `...d5`): center par turant chot.',
  'Nimzo (`3.Nc3 Bb4`): knight par pin, `e4` rokna. Queen\'s Indian (`3.Nf3 b6`): bishop `b7`/`a6`.',
  'Dutch `1...f5`: `e4` square ko control, kingside attack. Benoni `...c5` + `...e6`: queenside majority.',
  'Flank: English `1.c4`, Reti `1.Nf3`, KIA (`d3`, `Nf3`, `g3`, `Bg2`), Bird `1.f4`. From Gambit trap: `Nc3??` par `...Qh4+`.'],
 steps:[
  {t:'line',h:'King\'s Indian Defence',drill:'b',md:'Black White ko bada center deta hai, phir `...e5` se chot aur kingside par attack.',moves:'d4 Nf6 c4 g6 {Fianchetto ki taiyaari.} Nc3 Bg7 e4 d6 {White ka bada center.} Nf3 O-O Be2 e5 {Center par chot.} O-O Nc6 d5 Ne7 {Plan: `...Nd7`/`...Ne8`, `...f5` aur kingside attack.}'},
  {t:'line',h:'Grunfeld',drill:'b',md:'`...g6` aur `...d5`: Black center ko turant challenge karta hai, phir bishop `g7` se `d4` par dabaav.',moves:'d4 Nf6 c4 g6 Nc3 d5 {Grunfeld!} cxd5 Nxd5 e4 Nxc3 bxc3 Bg7 {Bishop `c3`/`d4` par.} Nf3 c5 {Aur dabaav.}'},
  {t:'line',h:'Nimzo-Indian',drill:'b',md:'`3...Bb4`: knight par pin, taaki White `e4` na khel sake.',moves:'d4 Nf6 c4 e6 Nc3 Bb4 {Pin: `e4` roko.} e3 O-O Bd3 d5 Nf3 c5 O-O'},
  {t:'line',h:'Queen\'s Indian',drill:'b',md:'`3.Nf3` par (Nimzo ka pin nahi) Black `...b6` se bishop `b7`/`a6`.',moves:'d4 Nf6 c4 e6 Nf3 b6 {Bishop fianchetto.} g3 Ba6 {`c4` par dabaav.} b3 Bb4+ Bd2 Be7'},
  {t:'line',h:'Benoni',drill:'b',md:'`...c5` se White `d5` aage aata hai. Black ko queenside majority aur active pieces.',moves:'d4 Nf6 c4 c5 d5 e6 Nc3 exd5 cxd5 d6 e4 g6 Nf3 Bg7 {Plan: `...a6`, `...b5`.}'},
  {t:'line',h:'Dutch Defence (Leningrad)',drill:'b',md:'`1...f5` `e4` square ko control karta hai. Leningrad setup: `...Nf6`, `...g6`, `...Bg7`.',moves:'d4 f5 {`e4` square control.} g3 Nf6 Bg2 g6 Nf3 Bg7 O-O O-O c4 d6 {Plan: `...e5` aur kingside.}'},
  {t:'line',h:'English Opening',drill:'w',md:'`1.c4`: ulta Sicilian. White `d5` ko side se control karta hai.',moves:'c4 {Flank se center.} e5 Nc3 Nf6 g3 {Bishop `g2` se long diagonal.} d5 cxd5 Nxd5 Bg2 Nb6 Nf3 Nc6'},
  {t:'line',h:'Reti Opening',drill:'w',md:'`1.Nf3` aur `2.c4`: flexible. Pieces pehle, pawns baad mein.',moves:'Nf3 d5 c4 {`d5` par side se chot.} e6 g3 Nf6 Bg2 Be7 O-O O-O'},
  {t:'line',h:'King\'s Indian Attack (KIA)',drill:'w',md:'System: `e4`, `d3`, `Nd2`, `Ngf3`, `g3`, `Bg2`, castle. Baad mein `e5` aur kingside attack.',moves:'e4 e6 d3 {KIA setup.} d5 Nd2 Nf6 Ngf3 c5 g3 Nc6 Bg2 Be7 O-O O-O'},
  {t:'move',after:'f4 e5 fxe5 d6 exd6 Bxd6 Nc3',q:'Bird Opening ke khilaaf From Gambit! White ne `4.Nc3??` khela. Black, mate karo!',line:['Qh4+','g3','Qxg3+','hxg3','Bxg3#'],mate:1,hint:'`f2` pawn gaya: `e1-h4` diagonal khula hai.',why:'`4...Qh4+ 5.g3 Qxg3+! 6.hxg3 Bxg3#`. Sahi tha `4.Nf3` (`h4` control).'},
  {t:'quiz',after:'d4 Nf6 c4 e6 Nc3 Bb4',q:'Yeh kaunsi opening hai?',opts:['King\'s Indian','Nimzo-Indian','Queen\'s Indian','Grunfeld'],a:1,why:'`3...Bb4` (Nc3 par pin) = **Nimzo-Indian**.'},
  {t:'quiz',after:'d4 Nf6 c4 g6 Nc3 d5',q:'Yeh kaunsi opening hai?',opts:['King\'s Indian','Grunfeld','Dutch','Benoni'],a:1,why:'`...g6` + `...d5` = **Grunfeld**.'}
 ]},
/* ---------------------------------------------------------------- */
{id:'op1gam',title:'Gambits: lena hai ya mana karna hai?',sub:'King\'s Gambit, Evans, Danish, Blackmar-Diemer, Budapest, Englund, Stafford',
 yaad:[
  'Gambit ke 3 jawab: (1) lo aur jaldi develop karo, (2) lo aur sahi waqt par wapas do, (3) mana karo aur solid center chaal khelo.',
  'Pawn lene ke baad bhi principles: develop, castle, center. Laalach mein queen se pawn mat bhaago.',
  'King\'s Gambit decline `2...Bc5`: `3.fxe5??` par `3...Qh4+` rook jeetta hai.',
  'Budapest mein `axb4??` par `...Nd3#`. Englund (`1.d4 e5?!`) mein `Bc3??` par `...Qc1#`.',
  'Stafford (`3...Nc6`) ke khilaaf: `4.Nxc6 dxc6 5.d3` seedha aur safe.'],
 steps:[
  {t:'info',h:'Gambit se kaise niptein',md:'Gambit tumhe pawn deta hai aur badle mein **samay** chahta hai. Tumhare 3 raaste:\n\n1. **Lo aur jaldi develop karo.** Pawn lo, par phir pieces bahar, castle.\n2. **Lo aur wapas do.** Jab pawn bachana mushkil ho, use wapas de kar apne pieces active karo.\n3. **Mana karo (decline).** Ek solid center chaal ya develop karte hue jawab.\n\nGalat raasta: pawn ko bachane ke liye queen ya pawns se baar-baar chaalein, aur development bhool jaana.'},
  {t:'move',after:'e4 e5 f4 Bc5 fxe5',q:'King\'s Gambit Declined: Black ne `2...Bc5` khela aur White ne laalach mein `3.fxe5??` le liya. Black, saza do!',line:['Qh4+'],hint:'Check se shuru karo. `e1-h4` diagonal dekho.',why:'`3...Qh4+!` `4.g3 Qxe4+` aur `h1` rook gaya, ya `4.Ke2 Qxe4#`. Isliye `2...Bc5` ke baad White `3.Nf3` khelta hai.'},
  {t:'line',h:'Evans Gambit: lo aur wapas do',drill:'b',md:'Italian mein `4.b4`. Black pawn leta hai aur `...d6` se jaldi develop karta hai.',moves:'e4 e5 Nf3 Nc6 Bc4 Bc5 b4 {Evans Gambit.} Bxb4 c3 {Tempo ke saath bishop par attack, `d4` ki taiyaari.} Ba5 d4 d6 {Pawn wapas dene ko tayyar, pieces bahar.}'},
  {t:'line',h:'Danish Gambit: pawn wapas do',drill:'b',md:'White do pawns deta hai! Sabse aasaan jawab: `...d5` se ek pawn wapas aur free development.',moves:'e4 e5 d4 exd4 c3 {Danish.} d5 {Center mein counter, pawn wapas.} exd5 Qxd5 cxd4 Nc6 {`d4` par attack, develop karte hue.} Nf3 Bg4'},
  {t:'line',h:'Blackmar-Diemer Gambit',drill:'b',md:'`1.d4 d5 2.e4`: White `f3` se pawn wapas ya attack chahta hai. Black pawn le, solid develop kare.',moves:'d4 d5 e4 {BDG.} dxe4 Nc3 Nf6 f3 exf3 Nxf3 e6 {Solid: bishop `f8` free.} Bg5 Be7'},
  {t:'move',after:'d4 Nf6 c4 e5 dxe5 Ng4 Bf4 Nc6 Nf3 Bb4+ Nbd2 Qe7 a3 Ngxe5 axb4',q:'Budapest Gambit: White ne laalach mein bishop `axb4??` le liya. Black, ek chaal mein khatam karo!',line:['Nd3#'],why:'`8...Nd3#` smothered mate jaisa: White ke apne pieces king ko gher rahe hain. Sahi tha `8.Nxe5`.'},
  {t:'move',after:'d4 e5 dxe5 Nc6 Nf3 Qe7 Bf4 Qb4+ Bd2 Qxb2 Bc3 Bb4 Qd2 Bxc3 Qxc3',q:'Englund Gambit (`1...e5?!`) ka trap. White ne galtiyan ki. Black, mate in 1!',line:['Qc1#'],why:'`8...Qc1#`. White ko `6.Nc3` ya `5.Nc3` khelna tha. Englund kharab gambit hai, par trap jaano.'},
  {t:'move',after:'e4 e5 Nf3 Nf6 Nxe5 Nc6 Nxc6 dxc6',q:'Stafford Gambit: Black ne pawn diya aur tricks ki taiyaari ki. White ki seedhi, safe chaal?',line:['d3'],ok:['d3','Nc3'],why:'`5.d3` `e4` ko pawn se bachao, phir `Be2`, castle. Trick ki koshish (`...Bc5`, `...Ng4`) ke saamne seedha development.'},
  {t:'quiz',q:'Gambit lene ke baad sabse badi galti kya hai?',opts:['Castle karna','Pawn bachane ke liye development bhool jaana','Pawn wapas dena'],a:1,why:'Gambit ka poora idea tumhe development mein peeche karna hai. Pieces bahar laao.'},
  {t:'quiz',after:'d4 d5 e4',q:'Yeh kaunsa gambit hai?',opts:['Queen\'s Gambit','Blackmar-Diemer','Albin','Danish'],a:1,why:'`1.d4 d5 2.e4` = **Blackmar-Diemer Gambit**.'}
 ]},
/* ---------------------------------------------------------------- */
{id:'op1sys',title:'Systems: London, Colle, Stonewall aur unke khilaaf',sub:'System ka setup, aur Black ka seedha plan',
 yaad:[
  'London: `d4`, `Bf4`, `e3`, `Nf3`, `c3`, `Nbd2`, `Bd3`. Bishop pawn chain ke bahar.',
  'London ke khilaaf: `...c5` aur `...Qb6` se `b2` aur `d4` par chot.',
  'Colle: `d4`, `Nf3`, `e3`, `Bd3`, `c3`, `Nbd2`, phir `e4`. Black: bishop `c8` jaldi bahar (`...Bg4`/`...Bf5`).',
  'Stonewall: `d4`, `e3`, `f4`, `Bd3`. `e5` square kamzor; Black `...b6` + `...Ba6` se achha bishop trade kare.',
  'Systems mein kam theory, par plan ek jaisa: opponent ka plan jaano.'],
 steps:[
  {t:'line',h:'London System',drill:'w',md:'Club players ki favourite. Ek setup, har jawab ke khilaaf.',moves:'d4 d5 Bf4 {Bishop pehle bahar, `e3` se pehle.} Nf6 e3 e6 Nf3 c5 c3 {`d4` mazboot.} Nc6 Nbd2 Bd6 Bg3 {Bishop trade se bachao.} O-O Bd3'},
  {t:'line',h:'London ke khilaaf: ...c5 aur ...Qb6',drill:'b',md:'Black ka seedha aur strong plan: `...c5` se center par chot, `...Qb6` se `b2` par (bishop `f4` ab `b2` ko nahi bachata).',moves:'d4 d5 Bf4 c5 {Turant chot.} e3 Nc6 c3 Qb6 {`b2` par attack.} Qb3 c4 {Queen ko bhagao, queenside par jagah.} Qc2 Nf6 {Develop. Black ko queenside par jagah mili, plan `...b5-b4`.}'},
  {t:'move',after:'d4 d5 Bf4 Nf6 e3 c5 c3 Nc6 Nd2',q:'London ke khilaaf Black ka plan. `b2` kamzor hai. Achhi chaal chalo.',line:['Qb6'],ok:['Qb6','e6','Bf5','cxd4'],why:'`5...Qb6` `b2` par attack. `...e6`, `...Bf5` bhi achhi developing chaalein hain.'},
  {t:'line',h:'Colle System',drill:'w',md:'Bishop `d3`, phir `e4` se center kholo.',moves:'d4 d5 Nf3 Nf6 e3 e6 Bd3 c5 c3 Nc6 Nbd2 Bd6 O-O O-O dxc5 Bxc5 e4 {Colle ka asli idea: `e4` break.}'},
  {t:'line',h:'Stonewall Attack',drill:'w',md:'`d4`, `e3`, `f4`, `Bd3`: kingside attack ka setup. Kamzori: `e4` aur `e5` squares. Black sahi khele (jaise yahan bishop `g4` jaldi bahar) to Black ko aaram milta hai, isliye iska defence zaroor jaano.',moves:'d4 d5 e3 Nf6 Bd3 c5 c3 Nc6 f4 {Stonewall: pawns `c3-d4-e3-f4`.} Bg4 {Bishop bahar, chain ke baahar.} Nf3 e6 O-O Bd6'},
  {t:'line',h:'Trompowsky (2.Bg5)',drill:'b',md:'`1.d4 Nf6 2.Bg5`: knight par chot. Black `...Ne4` se bishop ko bhagata hai.',moves:'d4 Nf6 Bg5 {Trompowsky.} Ne4 {Bishop ko pucho.} Bf4 c5 {Center par chot.} f3 Qa5+ {Check se `b2`/`c3` kamzor.} c3 Nf6'},
  {t:'quiz',q:'London System ke khilaaf Black ka sabse seedha plan?',opts:['`...h6` aur `...g5`','`...c5` aur `...Qb6`','Kuch nahi, wait karo'],a:1,why:'Bishop `f4` par jaane ke baad `b2` ko koi nahi bachata. `...c5` + `...Qb6` turant sawaal poochhta hai.'},
  {t:'quiz',q:'System openings ka nuksaan kya hai?',opts:['Bahut theory','Opponent ko plan pata ho to tayyar jawab de sakta hai','Castle nahi hota'],a:1,why:'Same setup = predictable. Isliye har system ke khilaaf ek tayyar plan rakho.'}
 ]},
/* ---------------------------------------------------------------- */
{id:'op1mix',title:'Practice: openings pehchano aur chalao',sub:'Mixed sawaal: naam, idea aur agli chaal',
 yaad:[
  'Pehli 2-3 chaal se family aur opening ka naam pehchano.',
  'Agli chaal dhundo: develop + kisi cheez par nazar (center, attack, defence).',
  'Trap dekho: opponent ki pichhli chaal ne kya khula chhoda?'],
 steps:[
  {t:'quiz',after:'e4 e5 Nf3 Nc6 Bb5',q:'Opening ka naam?',opts:['Italian','Ruy Lopez','Scotch','Petrov'],a:1,why:'`3.Bb5` = Ruy Lopez.'},
  {t:'quiz',after:'e4 e6 d4 d5',q:'Opening ka naam?',opts:['Caro-Kann','French','Scandinavian','Pirc'],a:1,why:'`1...e6` + `2...d5` = French.'},
  {t:'quiz',after:'d4 d5 Bf4',q:'Opening ka naam?',opts:['Colle','London','Stonewall','Trompowsky'],a:1,why:'`2.Bf4` = London System.'},
  {t:'quiz',after:'e4 c5 d4 cxd4 c3',q:'Opening ka naam?',opts:['Alapin','Smith-Morra Gambit','Grand Prix','Open Sicilian'],a:1,why:'`2.d4 cxd4 3.c3` = Smith-Morra Gambit.'},
  {t:'move',after:'e4 e5 Nf3 Nc6',q:'Italian Game khelo (White).',line:['Bc4'],why:'`3.Bc4` bishop `f7` ko dekhta hai.'},
  {t:'move',after:'d4 d5 c4',q:'Black: Queen\'s Gambit Declined khelo.',line:['e6'],why:'`2...e6` `d5` ko solid tareeke se bachata hai.'},
  {t:'move',after:'e4 c6 d4 d5 e5',q:'Caro-Kann Advance. Black ka bishop band hone se pehle bahar lao.',line:['Bf5'],why:'`3...Bf5`: bishop pawn chain ke bahar, phir `...e6`.'},
  {t:'move',after:'e4 d5 exd5 Qxd5',q:'White: queen ko tempo se bhagao.',line:['Nc3'],why:'`3.Nc3` develop + queen par attack.'},
  {t:'move',after:'d4 Nf6 c4 g6 Nc3 Bg7',q:'White: King\'s Indian ke khilaaf bada center banao.',line:['e4'],ok:['e4','Nf3'],why:'`4.e4` center lo. Black baad mein `...d6` aur `...e5` khelega.'},
  {t:'move',after:'e4 e5 Nf3 Nf6 Nxe5',q:'Petrov. Black ki sahi chaal?',line:['d6'],why:'`3...d6!` pehle knight ko bhagao. `3...Nxe4?` par `4.Qe2!`.'},
  {t:'move',after:'e4 e6 d4 d5 e5',q:'French Advance. Black ki sabse achhi chaal?',line:['c5'],why:'`3...c5!` chain ki jad par chot.'},
  {t:'move',after:'e4 c5 Nf3 d6 d4 cxd4',q:'Open Sicilian. White, pawn wapas lo.',line:['Nxd4'],why:'`4.Nxd4`: knight center mein, aur `...Nf6` ke baad `5.Nc3`.'}
 ]}
 ]
};
