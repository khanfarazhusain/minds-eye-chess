/* Openings Ladder, Level 2 (Club): Open games (1.e4 e5), dono taraf se.
   Main Course: "Openings 1: ideas aur e4 openings" (l4) ke end mein (tactics, mates, structures ke baad).
   Road to 3000: Level 3. Main line 10+ chaal, galat sidelines ko saza, traps dono taraf. */
module.exports = {
 to: 'l4',
 road: 3,
 lessons: [
/* ---------------------------------------------------------------- */
{id:'op2ital',title:'Italian Game (club): Giuoco Piano, Two Knights, sidelines',sub:'Main line 10+ chaal, Black ki galat chaalon ko saza, dono taraf ke traps',
 yaad:[
  'Giuoco Pianissimo: `c3`, `d3`, `O-O`, `Re1`, `a4`, `h3`, `Nbd2-f1-g3`. Dheema plan, phir `d4` ya kingside.',
  'Two Knights `4.Ng5 d5 5.exd5 Na5!`: Black pawn deta hai par tez development. `5...Nxd5?` = Fried Liver.',
  'Two Knights `4.d3`: shaant line, Giuoco Pianissimo jaisi (transposition).',
  'Blackburne Shilling `3...Nd4?!`: `4.Nxe5?` mat lo (`4...Qg5!`). `4.Nxd4` ya `4.O-O` seedha.',
  'Black ka passive `3...d6`/`3...Be7` (Hungarian): White `d4` se center le.'],
 steps:[
  {t:'line',h:'Giuoco Pianissimo: modern main line',drill:'w',md:'Aaj ke GMs ki Italian. Koi jaldi nahi: pehle sab pieces, phir plan.',moves:'e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d3 {Shaant: `e4` bachao, `d4` baad mein.} d6 O-O a6 {`...Na5` se bishop trade se bachne ke liye jagah.} a4 {Queenside par jagah, bishop ke liye `a2`.} O-O Re1 Ba7 {Bishop ko `d4`/`c3` se pehle hi peeche.} h3 {`...Bg4` pin roka.} h6 Nbd2 Re8 Nf1 {Knight `g3` aayega, kingside par.} Be6'},
  {t:'quiz',q:'Giuoco Pianissimo mein knight `b1-d2-f1-g3` kyun jaata hai?',opts:['Queenside attack','Kingside par aana aur `f5` square dekhna','Queen ko bachana'],a:1,why:'`c3` pawn ki wajah se knight `c3` par nahi aa sakta. `d2-f1-g3` route se woh kingside (`f5`, `h5`) par active hota hai.'},
  {t:'line',h:'Two Knights: 4.Ng5 d5 main line (Black)',theory:1,drill:'b',md:'Black pawn de kar development aur initiative leta hai. Yeh line har `...Nf6` khelne wale ko aani chahiye.',moves:'e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 d5 exd5 Na5 {Bishop par attack.} Bb5+ c6 {Pawn de kar development.} dxc6 bxc6 Be2 {Bishop peeche.} h6 {Knight ko bhagao.} Nf3 e4 {Tempo par tempo!} Ne5 Bd6 {Black ka bada development lead. Pawn ke badle poora compensation.}'},
  {t:'move',after:'e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 d5 exd5 Na5 Bb5+ c6 dxc6 bxc6 Be2 h6 Nf3',q:'Two Knights main line. Black: knight ko tempo ke saath phir bhagao.',line:['e4'],why:'`8...e4!` knight phir hile. Har tempo Black ke development mein jaata hai.'},
  {t:'line',h:'Two Knights: 4.d3 (shaant)',drill:'w',md:'Jo White player tactics nahi chahta, woh `4.d3` khelta hai. Position Giuoco Pianissimo jaisi ban jaati hai.',moves:'e4 e5 Nf3 Nc6 Bc4 Nf6 d3 {`e4` bacha, koi gambit nahi.} Be7 O-O O-O Re1 d6 c3 {Ab structure Pianissimo jaisa.} Na5 Bb5 a6 Ba4 b5 Bc2 c5'},
  {t:'move',after:'e4 e5 Nf3 Nc6 Bc4 Nd4',q:'Black ne `3...Nd4?!` (Blackburne Shilling) khela. `e5` free dikhta hai. White ki sahi chaal?',line:['Nxd4'],ok:['Nxd4','O-O'],hint:'`4.Nxe5?` par `4...Qg5!` dono `e5` knight aur `g2` par.',why:'`4.Nxd4 exd4 5.O-O` (ya `5.c3`) aur White aage. `4.Nxe5? Qg5!` mein Black ka bada attack.'},
  {t:'move',after:'e4 e5 Nf3 Nc6 Bc4 Nd4 Nxe5 Qg5 Nxf7 Qxg2 Rf1 Qxe4+ Be2',q:'Agar White ne laalach kiya: `4.Nxe5? Qg5 5.Nxf7?? Qxg2 6.Rf1 Qxe4+ 7.Be2`. Black, ek chaal mein khatam!',line:['Nf3#'],why:'`7...Nf3#` smothered mate. Isliye trap waali chaalon par laalach mat karo.'},
  {t:'line',h:'Hungarian aur 3...d6 ke khilaaf: d4!',drill:'w',md:'Black ne passive `3...Be7` khela. White turant `d4` se center leta hai.',moves:'e4 e5 Nf3 Nc6 Bc4 Be7 {Hungarian: solid par passive.} d4 {Center lo.} d6 d5 {Space! Knight ko bhagao.} Nb8 Nc3 Nf6 h3 {`...Bg4` roka.} O-O O-O'},
  {t:'line',h:'Evans Gambit: main line (White)',drill:'w',md:'Club level par sabse khatarnaak Italian. White pawn de kar center aur attack leta hai.',moves:'e4 e5 Nf3 Nc6 Bc4 Bc5 b4 Bxb4 c3 Ba5 d4 {Center!} exd4 O-O {Ek aur pawn ki parwaah nahi: development.} Nge7 cxd4 d5 {Black pawn wapas deta hai.} exd5 Nxd5 Ba3 {Bishop Black king ko castle se rokta hai.}'},
  {t:'quiz',after:'e4 e5 Nf3 Nc6 Bc4 Bc5 b4 Bxb4 c3 Ba5 d4 exd4 O-O Nge7 cxd4 d5 exd5 Nxd5 Ba3',q:'Evans mein `Ba3` ka asli kaam?',opts:['Pawn jeetna','Black king ko castle se rokna (f8 par control)','Queen ko bachana'],a:1,why:'Bishop `a3-f8` diagonal par: `...O-O` nahi ho sakta. King center mein phansa.'},
  {t:'move',after:'e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d4 exd4 cxd4 Bb4+ Bd2 Bxd2+ Nbxd2',q:'Giuoco Piano `5.d4` line. White ka bada center. Black ki sabse principled chaal?',line:['d5'],ok:['d5'],why:'`8...d5!` center ko turant todo. Nahi to White `e5` aur `d5` se kuchal dega.'}
 ]},
/* ---------------------------------------------------------------- */
{id:'op2ruy',title:'Ruy Lopez (club): Closed, Berlin, Marshall, Exchange',sub:'Main lines 12+ chaal aur Noah\'s Ark trap',
 yaad:[
  'Closed Ruy: `...Be7`, `...b5`, `...d6`, `...O-O`, `c3`, `h3`. Chigorin `...Na5`/`...c5`, Breyer `...Nb8-d7`, Zaitsev `...Bb7`/`...Re8`.',
  'Berlin `3...Nf6 4.O-O Nxe4 5.d4 Nd6 6.Bxc6 dxc6 7.dxe5 Nf5 8.Qxd8+ Kxd8`: queens jaldi trade, Black solid.',
  'Marshall `8...d5`: Black pawn de kar White king par attack. `12.d4 Bd6 13.Re1 Qh4 14.g3 Qh3`.',
  'Exchange `4.Bxc6 dxc6`: White ka plan pawn endgame (4 vs 3 kingside). Black ko 2 bishops.',
  'Noah\'s Ark: `...b5`, `...c5`, `...c4` se bishop `b3` phansta hai. White `Qxd4??` mat khelo.'],
 steps:[
  {t:'line',h:'Closed Ruy Lopez: Chigorin',drill:'w',md:'Sabse purana aur gehra main line. Dono taraf ke plans seekhne ke liye best.',moves:'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3 d6 c3 O-O h3 {`...Bg4` pin roka, `d4` ki taiyaari.} Na5 {Chigorin: bishop par attack.} Bc2 c5 d4 Qc7 Nbd2 {Knight `f1-g3` jaayega.} cxd4 cxd4'},
  {t:'line',h:'Closed Ruy: Breyer',drill:'b',md:'Spassky aur Carlsen ki favourite. Knight `b8` se `d7` par: `e5` aur `c5` ko support.',moves:'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3 d6 c3 O-O h3 Nb8 {Breyer: knight wapas!} d4 Nbd7 {`e5` mazboot.} Nbd2 Bb7 Bc2 Re8 Nf1 Bf8'},
  {t:'line',h:'Berlin Defence',drill:'b',md:'Kramnik ne Kasparov ke khilaaf world title isi se jeeta. Queens jaldi jaati hain.',moves:'e4 e5 Nf3 Nc6 Bb5 Nf6 {Berlin.} O-O Nxe4 {Pawn lo, wapas denge.} d4 Nd6 Bxc6 dxc6 dxe5 Nf5 Qxd8+ Kxd8 {King castle nahi kar sakta, par queens nahi hain: king safe.} Nc3 Ke8'},
  {t:'quiz',q:'Berlin endgame mein Black king `d8`/`e8` par hai aur castle nahi kar sakta. Kya yeh problem hai?',opts:['Haan, bahut khatarnaak','Nahi: queens trade ho gayi, aur Black ko 2 bishops mile','Black ko turant resign'],a:1,why:'Queens nahi to king par mate ka khatra kam. Black ke 2 bishops lambe samay mein strong hain.'},
  {t:'line',h:'Marshall Attack',drill:'b',md:'Black ka mashhoor gambit: pawn deta hai, White king par seedha attack.',moves:'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3 O-O c3 d5 {Marshall!} exd5 Nxd5 Nxe5 Nxe5 Rxe5 c6 {Pawn diya, development aur attack.} d4 Bd6 Re1 Qh4 {Kingside par.} g3 Qh3'},
  {t:'line',h:'Exchange Variation',drill:'w',md:'`4.Bxc6`: White bishop deta hai, Black ka pawn structure bigaadta hai. Plan: `d4` aur endgame.',moves:'e4 e5 Nf3 Nc6 Bb5 a6 Bxc6 dxc6 {Black ko doubled pawns, par 2 bishops.} O-O f6 {`e5` mazboot.} d4 exd4 Nxd4 c5 Nb3 Qxd1 Rxd1 {Endgame: White ke kingside par 4 vs 3, Black ke queenside pawns doubled.}'},
  {t:'quiz',q:'Exchange Ruy mein White ka lamba plan kya hai?',opts:['Queenside attack','Pieces trade karke pawn endgame, kingside majority se passed pawn','Black king par seedha mate'],a:1,why:'Black ke queenside doubled pawns passed pawn nahi bana sakte. White ka 4 vs 3 kingside majority bana sakta hai.'},
  {t:'move',after:'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 d6 d4 b5 Bb3 Nxd4 Nxd4 exd4 Qxd4',q:'Noah\'s Ark trap! White ne `8.Qxd4??` khela. Black, bishop ko phansao.',line:['c5'],hint:'Pawn se queen ko bhagao, phir bishop `b3` ka raasta band.',why:'`8...c5! 9.Qd5 Be6 10.Qc6+ Bd7 11.Qd5 c4` aur bishop `b3` pawns mein phans gaya. Sahi tha `8.c3` (Noah\'s Ark se pehle).'},
  {t:'move',after:'e4 e5 Nf3 Nc6 Bb5 f5',q:'Black ne `3...f5` (Schliemann) khela. Sabse safe aur strong jawab?',line:['Nc3'],ok:['Nc3','d3'],why:'`4.Nc3!` `e4` bachao, develop karo. `4...fxe4 5.Nxe4 d5 6.Nxe5!` jaisi tactics White ke paas.'},
  {t:'move',after:'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3 O-O c3',q:'Black: Marshall Attack shuru karo!',line:['d5'],why:'`8...d5!` pawn do, development aur attack lo.'}
 ]},
/* ---------------------------------------------------------------- */
{id:'op2scot',title:'Scotch, Four Knights, Ponziani, Center Game (club)',sub:'White ke seedhe center openings aur Black ke best jawab',
 yaad:[
  'Scotch Classical `4...Bc5 5.Be3 Qf6 6.c3 Nge7`: `d4` knight par dabaav. Mieses `4...Nf6 5.Nxc6 bxc6 6.e5 Qe7 7.Qe2 Nd5 8.c4`.',
  'Scotch Gambit `4.Bc4`: Two Knights jaisi positions mein transpose karta hai.',
  'Four Knights Spanish `4.Bb5`: Black `...Nd4!` (Rubinstein) ya `...Bb4` mirror.',
  'Ponziani `3.c3`: Black `...d5` ya `...Nf6` se turant `e4` par chot.',
  'Center Game `2.d4 exd4 3.Qxd4?!`: queen jaldi bahar, `3...Nc6` tempo se.'],
 steps:[
  {t:'line',h:'Scotch: Mieses (4...Nf6)',drill:'w',md:'Kasparov ne Scotch ko top level par wapas laaya. Yeh sabse critical line hai.',moves:'e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Nf6 {`e4` par attack.} Nxc6 bxc6 e5 {Knight ko bhagao.} Qe7 {Pin: `e5` ko pakda.} Qe2 Nd5 c4 {Knight ko phir bhagao.} Ba6 {`c4` par pin.} b3'},
  {t:'line',h:'Scotch: Classical (4...Bc5)',drill:'b',md:'Black bishop se `d4` knight par dabaav banata hai.',moves:'e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Bc5 {Knight par dabaav.} Be3 Qf6 {Aur dabaav, `f2` par bhi.} c3 Nge7 {Knight `e7` se: `f6` queen ke liye khula.} Bc4 Ne5 Be2 Qg6 O-O d6'},
  {t:'line',h:'Scotch Gambit',drill:'w',md:'`4.Bc4`: pawn wapas lene ki jagah development. `4...Nf6` ke baad yeh Two Knights jaisa hai (transposition).',moves:'e4 e5 Nf3 Nc6 d4 exd4 Bc4 {Gambit.} Nf6 {Ab Two Knights (`4.d4`) wali position.} e5 d5 {Black ka best: center counter.} Bb5 Ne4 Nxd4 Bd7 Bxc6 bxc6 O-O Bc5'},
  {t:'line',h:'Four Knights: Spanish aur Rubinstein',drill:'b',md:'`4.Bb5` par Black ka sabse active jawab `4...Nd4!`.',moves:'e4 e5 Nf3 Nc6 Nc3 Nf6 Bb5 {Four Knights, Spanish.} Nd4 {Rubinstein: counter-attack.} Ba4 Bc5 Nxe5 O-O Nd3 Bb6 e5 Ne8'},
  {t:'line',h:'Four Knights: Scotch Four Knights',drill:'w',md:'`4.d4`: Scotch aur Four Knights ka mel. Simple, seedhe plans.',moves:'e4 e5 Nf3 Nc6 Nc3 Nf6 d4 exd4 Nxd4 Bb4 Nxc6 bxc6 Bd3 d5 exd5 cxd5 O-O O-O Bg5 c6'},
  {t:'line',h:'Ponziani: Black ka jawab',drill:'b',md:'`3.c3`: White `d4` chahta hai. Black turant `e4` par chot karta hai.',moves:'e4 e5 Nf3 Nc6 c3 {Ponziani.} Nf6 {`e4` par attack.} d4 Nxe4 {Pawn lo.} d5 Bc5 {Develop + `f2` par chot. Knight `c6` hilne ki zaroorat nahi: `dxc6` par `...Bxf2+`.}'},
  {t:'line',h:'Center Game: queen ko tempo se bhagao',drill:'b',md:'`3.Qxd4` queen ko jaldi bahar laata hai. Black develop karte hue use bhagata hai.',moves:'e4 e5 d4 exd4 Qxd4 {Center Game.} Nc6 {Tempo!} Qe3 Nf6 Nc3 Bb4 Bd2 O-O O-O-O Re8 {`e4` par dabaav: Black aage.}'},
  {t:'move',after:'e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Bc5 Be3 Qf6 c3 Nge7 Bc4',q:'Scotch Classical. Black: bishop `c4` par active jagah se dabaav dalo.',line:['Ne5'],ok:['Ne5','O-O','b6'],why:'`7...Ne5` bishop par attack, knight center mein. `...O-O` bhi theek.'},
  {t:'quiz',after:'e4 e5 Nf3 Nc6 d4 exd4 Bc4 Nf6',q:'Is position ko aur kis opening se pahunch sakte hain?',opts:['Ruy Lopez','Two Knights Defence (`3.Bc4 Nf6 4.d4 exd4`)','French'],a:1,why:'Move order alag, position same: **transposition**. Isliye openings ko position se pehchano, sirf chaalon se nahi.'},
  {t:'move',after:'e4 e5 Nf3 Nc6 Nc3 Nf6 Bb5 Nd4 Nxe5',q:'Rubinstein mein White ne `5.Nxe5` khela. Black ka active jawab?',line:['Qe7'],why:'`5...Qe7!` knight par attack aur `e4` par dabaav. Black ka initiative.'}
 ]},
/* ---------------------------------------------------------------- */
{id:'op2kgv',title:'King\'s Gambit aur Vienna (club): dono taraf',sub:'Accepted, Falkbeer, Classical declined, Vienna Gambit, Frankenstein-Dracula',
 yaad:[
  'KGA modern: `3...d5 4.exd5 Nf6`: Black pawn wapas deta hai, tez development.',
  'KGA `3...g5`: Black pawn pakadta hai. White `4.h4` (Kieseritzky) se kingside todta hai.',
  'Falkbeer `2...d5 3.exd5 exf4`: Black counter-gambit, `f4` pawn ka sahara.',
  'Vienna Gambit `3.f4 d5!`: Black ka sahi jawab. `4.fxe5 Nxe4 5.Nf3`.',
  'Vienna `2...Nf6 3.Bc4 Nxe4!?` = Frankenstein-Dracula: bahut tez tactics.'],
 steps:[
  {t:'line',h:'King\'s Gambit Accepted: 3...g5 aur Kieseritzky',theory:1,drill:'w',md:'Black pawn pakadta hai `...g5` se. White `h4` se us chain ko todta hai.',moves:'e4 e5 f4 exf4 Nf3 g5 {Pawn bachao.} h4 {Kieseritzky: chain todo.} g4 Ne5 {Knight center mein, `f7` aur `g4` par.} Nf6 d4 d6 Nd3 Nxe4 Bxf4 {Pawn wapas, open lines.}'},
  {t:'line',h:'KGA: modern 3...d5 (Black)',drill:'b',md:'Sabse aasaan aur healthy jawab: pawn wapas do, pieces bahar.',moves:'e4 e5 f4 exf4 Nf3 d5 exd5 Nf6 Bc4 Nxd5 O-O Be7 {Castle ki taiyaari.} Nc3 Nxc3 dxc3 Qxd1 Rxd1 {Queens gayi: King\'s Gambit ka attack khatam, aur Black pawn upar.}'},
  {t:'line',h:'Falkbeer Countergambit',drill:'b',md:'`2...d5`: Black gambit ke khilaaf apna gambit.',moves:'e4 e5 f4 d5 {Falkbeer.} exd5 exf4 {Modern line: `f4` pawn liya.} Nf3 Nf6 Bc4 Nxd5 O-O Be7'},
  {t:'line',h:'King\'s Gambit Declined: Classical',theory:1,drill:'b',md:'`2...Bc5` pawn nahi leta, par White ko castle karne se rokta hai.',moves:'e4 e5 f4 Bc5 {`g1` diagonal band.} Nf3 d6 {`e5` bacha.} c3 Nf6 d4 exd4 cxd4 Bb4+ Bd2 Bxd2+ Nbxd2 d5'},
  {t:'line',h:'Vienna Gambit: Black ka sahi jawab',drill:'b',md:'`3.f4` par `3...d5!` center mein counter.',moves:'e4 e5 Nc3 Nf6 f4 d5 {Center counter!} fxe5 Nxe4 Nf3 Be7 d4 O-O Bd3 f5 {Knight `e4` mazboot.} exf6 Bxf6'},
  {t:'line',h:'Vienna: Frankenstein-Dracula',theory:1,drill:'b',md:'`3.Bc4 Nxe4!?` sabse tez line. Black ko queen aur rook dono ka sacrifice aata hai. Yeh bas jaan lo, khelna optional.',moves:'e4 e5 Nc3 Nf6 Bc4 Nxe4 {Fork trick: `Nxe4` ke baad `...d5`.} Qh5 Nd6 Bb3 Nc6 Nb5 g6 Qf3 f5 Qd5 Qe7 Nxc7+ Kd8 Nxa8 b6'},
  {t:'move',after:'e4 e5 Nc3 Nf6 Bc4 Nxe4 Nxe4',q:'Vienna: White ne `4.Nxe4` khela. Black, fork se piece wapas lo.',line:['d5'],why:'`4...d5!` bishop aur knight dono par fork. Black piece wapas leta hai aur center bhi.'},
  {t:'move',after:'e4 e5 f4 exf4 Nf3 g5 Bc4 g4 O-O gxf3 Qxf3',q:'Muzio Gambit! White ne knight de diya. Black: queen ko tempo se rokho aur develop karo.',line:['Qf6'],ok:['Qf6'],why:'`6...Qf6!` `f4` pawn aur `f`-file ki raksha. White ka attack bahut tez hai, isliye Black ko sahi defence aani chahiye.'},
  {t:'quiz',q:'King\'s Gambit mein Black ka sabse simple aur safe tareeka?',opts:['Har pawn pakad ke rakhna','`...d5` se pawn wapas dena aur develop karna','King ko `e7` par lana'],a:1,why:'`3...d5` (ya Falkbeer `2...d5`) se Black development leta hai aur White ka attack thanda.'}
 ]},
/* ---------------------------------------------------------------- */
{id:'op2pet',title:'Petrov aur Philidor (club): dono taraf',sub:'Black ke solid 1...e5 weapons, aur White ke traps',
 yaad:[
  'Petrov main: `3.Nxe5 d6 4.Nf3 Nxe4 5.d4 d5 6.Bd3`. `5.Nc3 Nxc3 6.dxc3`: opposite castling.',
  'Petrov mein `3...Nxe4?` nahi. Aur `4.Nxf7?!` (Cochrane) dikhe to `4...Kxf7` aur aaram.',
  'Philidor: `...d6`, `...Nf6`, `...Nbd7`, `...Be7`, `...O-O`, `...c6` (Hanham/Lion). `e5` ko pawn se pakdo.',
  'Philidor mein `...Bg4?` + `Nxe5!` = Legal\'s mate ka khatra.',
  'Philidor ke khilaaf White: `d4`, `Nc3`, `Bc4`, phir `Ng5`/`Bxf7+` tricks.'],
 steps:[
  {t:'line',h:'Petrov: Classical main line',drill:'b',md:'Caruana aur Kramnik ka hathiyaar. Bahut solid.',moves:'e4 e5 Nf3 Nf6 Nxe5 d6 Nf3 Nxe4 d4 d5 {Knight `e4` ko pawn ka sahara.} Bd3 Nc6 O-O Be7 c4 Nb4 Be2 O-O Nc3 Bf5'},
  {t:'line',h:'Petrov: 5.Nc3 (White ka aggressive line)',drill:'w',md:'Knight trade, White `O-O-O` aur kingside pawn storm.',moves:'e4 e5 Nf3 Nf6 Nxe5 d6 Nf3 Nxe4 Nc3 {Knight trade ka offer.} Nxc3 dxc3 Be7 Be3 O-O Qd2 Nd7 O-O-O {Opposite castling: dono taraf race.}'},
  {t:'move',after:'e4 e5 Nf3 Nf6 Nxe5 d6 Nf3 Nxe4 Qe2',q:'White ne `5.Qe2` khela, `e4` knight par pin. Black ki sahi chaal?',line:['Qe7'],ok:['Qe7'],why:'`5...Qe7!` Knight `e4` pinned hai (king `e8` ki line par, hil nahi sakta) aur `d3` se jeeta ja sakta tha. Queen se use bachao. `6.d3 Nf6` ke baad queens trade hoti hain aur position barabar.'},
  {t:'line',h:'Philidor: Lion / Hanham setup',drill:'b',md:'Black `e5` ko kabhi nahi chhodta. Solid par thodi kam jagah.',moves:'e4 d6 d4 Nf6 Nc3 e5 {Move order: Pirc se Philidor.} Nf3 Nbd7 Bc4 Be7 O-O O-O a4 c6 Re1 b6'},
  {t:'quiz',q:'Upar wali line `1.e4 d6` (Pirc jaisi) se shuru hui, par Philidor ban gayi. Ise kya kehte hain?',opts:['Gambit','Transposition: alag move order, wahi position','Blunder'],a:1,why:'Move order alag, position same. Openings ko position se pehchano, sirf pehli chaal se nahi.'},
  {t:'move',after:'e4 e5 Nf3 d6 Bc4 Bg4 Nc3 g6',q:'Philidor mein Black ne `...Bg4` aur `...g6?` khela. White, Legal\'s mate!',line:['Nxe5','Bxd1','Bxf7+','Ke7','Nd5#'],hint:'Queen do! `Bg4` ka pin asli nahi hai.',why:'`5.Nxe5! Bxd1 6.Bxf7+ Ke7 7.Nd5#`. Pin "asli" nahi tha kyunki queen ke peeche king nahi.'},
  {t:'move',after:'e4 e5 Nf3 d6 d4 Nd7 Bc4 Be7',q:'Philidor: White ka sabse tez idea. `f7` par chot!',line:['dxe5'],why:'`5.dxe5! dxe5 6.Qd5` `f7` par double attack ka idea. Philidor ko `...Nf6` pehle khelna chahiye (Lion move order).'},
  {t:'move',after:'e4 e5 Nf3 Nf6 Nxe5 d6 Nxf7',q:'White ne `4.Nxf7?!` (Cochrane Gambit) khela. Black?',line:['Kxf7'],why:'`4...Kxf7` piece lo. White ko 2 pawns aur Black king ka thoda khula hona milta hai, par piece zyada hai. Aaram se develop karo.'}
 ]}
 ]
};
