/* Road to 3000: NEW lessons only (jo purane course.html mein nahi hain).
   Step format wahi hai jo course.html use karta hai (info, quiz, move, line, play...).
   Extra: quiz/move step mein `after:"e4 e5 Nf3"` diya ho to app start position se FEN khud bana leta hai.
   Saari opening lines packs/openings.json (ECO book) se li gayi hain, apni taraf se koi line nahi ghadi. */
const ROAD_NEW = [
/* ============ Openings Chapter 1: 4 families ============ */
{key:'sf.fam0',title:'Openings Ch 1.0: Spot the 4 Families',sub:'Pehli 1-2 chaal se pata karo kaunsi family hai',
 yaad:['1.e4 e5 = Open game.','1.e4 aur Black ka koi aur jawab (c5, e6, c6, d5...) = Semi-open.','1.d4 d5 = Closed game.','Centre ko door se control (c4, Nf3, fianchetto, ...Nf6 + ...g6) = Hypermodern.'],
 steps:[
  {t:'info',h:'The Only Theory You Need',md:'Har opening 4 parivaar (families) mein se kisi ek mein aati hai. Family pata ho to plan bhi pata hota hai.\n\n- **Open (1.e4 e5):** pieces jaldi bahar, tez tactics. Italian, Ruy Lopez, Scotch, Petrov.\n- **Semi-open (1.e4 aur Black e5 nahi khelta):** ek taraf ki file khulti hai, position asymmetric. Sicilian, French, Caro-Kann, Scandinavian.\n- **Closed (1.d4 d5):** pawns aamne-saamne, dheere plan. Queen\'s Gambit, Slav, London.\n- **Hypermodern:** centre ko pawn se nahi, pieces se door se control. English (1.c4), Reti (1.Nf3), King\'s Indian, Nimzo-Indian, Grunfeld.\n\nAb practice. Board dekho aur family batao.'},
  {t:'quiz',after:'e4 e5',q:'Yeh kaunsi family hai?',opts:['Open','Semi-open','Closed','Hypermodern'],a:0,why:'`1.e4 e5`: dono ne king pawn do square chalaya. Yeh **Open game** hai.'},
  {t:'quiz',after:'e4 c5',q:'Yeh kaunsi family hai?',opts:['Open','Semi-open','Closed','Hypermodern'],a:1,why:'`1.e4 c5` **Sicilian** hai. Black ne e5 nahi khela, isliye **Semi-open**.'},
  {t:'quiz',after:'d4 d5',q:'Yeh kaunsi family hai?',opts:['Open','Semi-open','Closed','Hypermodern'],a:2,why:'`1.d4 d5`: queen pawns aamne-saamne. **Closed game**.'},
  {t:'quiz',after:'c4',q:'White ne `1.c4` khela. Kaunsi family?',opts:['Open','Semi-open','Closed','Hypermodern'],a:3,why:'`1.c4` **English Opening** hai: centre (d5) ko side se control. **Hypermodern**.'},
  {t:'quiz',after:'e4 e6',q:'Yeh kaunsi family hai?',opts:['Open','Semi-open','Closed','Hypermodern'],a:1,why:'`1.e4 e6` **French Defense** hai. Semi-open.'},
  {t:'quiz',after:'d4 Nf6 c4 g6',q:'Black ne knight aur g6 khela. Kaunsi family?',opts:['Open','Semi-open','Closed','Hypermodern'],a:3,why:'`...Nf6` aur `...g6` (bishop g7 par aayega): Black centre ko door se dekh raha hai. **Hypermodern** (King\'s Indian ya Grunfeld).'},
  {t:'quiz',after:'e4 c6',q:'Yeh kaunsi family hai?',opts:['Open','Semi-open','Closed','Hypermodern'],a:1,why:'`1.e4 c6` **Caro-Kann** hai. Semi-open.'},
  {t:'quiz',after:'Nf3 d5 c4',q:'Yeh kaunsi family hai?',opts:['Open','Semi-open','Closed','Hypermodern'],a:3,why:'`1.Nf3 d5 2.c4` **Reti Opening** hai. Hypermodern.'},
  {t:'quiz',after:'e4 d5',q:'Yeh kaunsi family hai?',opts:['Open','Semi-open','Closed','Hypermodern'],a:1,why:'`1.e4 d5` **Scandinavian** hai. Semi-open.'},
  {t:'quiz',after:'d4 d5 c4',q:'`2.c4` ke saath yeh kaunsi opening hai?',opts:['Queen\'s Gambit','Italian Game','Sicilian','English'],a:0,why:'`1.d4 d5 2.c4` **Queen\'s Gambit** hai (Closed family).'}
 ]},
{key:'sf.fam1',title:'Openings Ch 1.1: Open games (1.e4 e5)',sub:'Italian, Ruy Lopez, Scotch, Petrov: khel ke dekho',
 yaad:['Open game mein pehle knights aur bishops, phir castle.','Italian: Bc4 f7 ko dekhta hai. Ruy Lopez: Bb5 e5 ke defender (Nc6) ko dabata hai.','Scotch: 3.d4 se centre turant kholo. Petrov: Black 2...Nf6 se ulta attack.'],
 steps:[
  {t:'info',h:'The Big Idea',md:'`1.e4 e5` ke baad dono taraf ke bishops aur queen ke raaste khul jaate hain. Isliye **development aur king safety** sabse zaroori. Jo pehle castle karke rooks jodta hai, uska haath upar.'},
  {t:'line',h:'Italian Game: Giuoco Pianissimo',moves:'e4 e5 Nf3 Nc6 Bc4 Bc5 d3',notes:{3:'`2.Nf3`: knight e5 pawn par attack karta hai.',4:'`2...Nc6`: e5 ko bachata hai aur develop hota hai.',5:'`3.Bc4`: bishop f7 (Black ka kamzor square) ko dekhta hai.',6:'`3...Bc5`: Black bhi f2 ko dekhta hai.',7:'`4.d3`: shaant chaal. e4 mazboot, bishop c1 ka raasta khula. Ab castle aayega.'}},
  {t:'line',h:'Ruy Lopez: Closed',moves:'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7',drill:'w',notes:{5:'`3.Bb5`: Nc6 e5 ko bacha raha hai; bishop us defender ko dabata hai.',6:'`3...a6`: bishop se poochha: lena hai ya peeche hatna?',7:'`4.Ba4`: bishop pin ki line par bana rehta hai.',8:'`4...Nf6`: develop + e4 par attack.',9:'`5.O-O`: pehle king safe. e4 ka hisaab baad mein.',10:'`5...Be7`: Black bhi castle ki taiyaari.'}},
  {t:'line',h:'Scotch Game: Classical',moves:'e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Bc5',notes:{5:'`3.d4`: centre turant kholo.',6:'`3...exd4`: Black ne pawn le liya.',7:'`4.Nxd4`: White ne pawn wapas liya, knight centre mein.',8:'`4...Bc5`: bishop knight d4 par dabav banata hai.'}},
  {t:'line',h:'Petrov\'s Defense: Classical Attack',flip:true,drill:'b',moves:'e4 e5 Nf3 Nf6 Nxe5 d6 Nf3 Nxe4 d4',notes:{4:'`2...Nf6`: Black e5 ko bachata nahi, ulta e4 par attack.',5:'`3.Nxe5`: White pawn leta hai.',6:'`3...d6`: pehle knight ko bhagao. Seedha `3...Nxe4` mein trap hai (Ch 1 traps mein).',7:'`4.Nf3`: knight wapas.',8:'`4...Nxe4`: ab Black pawn wapas leta hai. Material barabar.',9:'`5.d4`: White centre leta hai.'}},
  {t:'move',after:'e4 e5',q:'Open game: `1.e4 e5` ke baad sabse common chaal chalo (knight develop, e5 par attack).',line:['Nf3'],why:'`2.Nf3`: develop bhi aur e5 par attack bhi. Italian, Ruy Lopez, Scotch sab isi se.',hint:'Kingside knight.'},
  {t:'move',after:'e4 e5 Nf3 Nc6',q:'Ruy Lopez ki chaal chalo: bishop se Nc6 (e5 ka defender) ko dabao.',line:['Bb5'],why:'`3.Bb5` **Ruy Lopez** hai.',hint:'Light-square bishop, b5 par.'},
  {t:'move',after:'e4 e5 Nf3 Nc6',q:'Italian Game ki chaal chalo: bishop f7 ki taraf.',line:['Bc4'],why:'`3.Bc4` **Italian Game** hai: bishop f7 ko dekhta hai.',hint:'Bishop c4 par.'},
  {t:'move',after:'e4 e5 Nf3 Nc6',q:'Scotch ki chaal chalo: centre turant kholo.',line:['d4'],why:'`3.d4` **Scotch Game** hai.',hint:'Queen pawn do square.'},
  {t:'quiz',after:'e4 e5 Nf3 Nf6',q:'Black ne `2...Nf6` khela. Is opening ka naam?',opts:['Petrov\'s Defense','Italian Game','French Defense','Scotch Game'],a:0,why:'`2...Nf6` **Petrov (Russian) Defense** hai: Black e4 par ulta attack karta hai.'},
  {t:'quiz',q:'Ruy Lopez mein `3.Bb5` ka main idea kya hai?',opts:['Nc6 (e5 ka defender) ko dabana','Turant check dena','Queen ko bahar nikalna'],a:0,why:'Bb5 us knight par dabav daalta hai jo e5 ko bacha raha hai. Yeh dheere-dheere ka dabav hai.'}
 ]},
{key:'sf.fam2',title:'Openings Ch 1.2: Semi-open (Sicilian, French, Caro-Kann)',sub:'1.e4 ke against e5 ke alawa jawab',
 yaad:['Sicilian (1...c5): c-file par Black ka khel, sabse tez jawab.','French (1...e6 + ...d5): mazboot par c8 bishop band; ...c5 se d4 par hamla.','Caro-Kann (1...c6 + ...d5): mazboot, bishop pehle bahar (Bf5).','Scandinavian (1...d5): queen jaldi bahar, Nc3 se tempo milta hai.'],
 steps:[
  {t:'info',h:'The Big Idea',md:'Black `1...e5` nahi khelta, isliye position barabar (symmetric) nahi hoti. Black ko ek file (jaise c-file) aur jawabi khel milta hai. White ko centre aur space.'},
  {t:'line',h:'Sicilian Defense: Najdorf Variation',flip:true,drill:'b',moves:'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6',notes:{2:'`1...c5`: d4 ko side se control.',5:'`3.d4`: White centre kholta hai.',6:'`3...cxd4`: Black c-pawn de kar centre ka d-pawn bacha leta hai. Ab c-file Black ki.',8:'`4...Nf6`: e4 par attack.',10:'`5...a6`: **Najdorf**. b5 square ka control aur knights ko Bb5 se roka.'}},
  {t:'line',h:'French Defense: Advance Variation',moves:'e4 e6 d4 d5 e5 c5 c3',drill:'w',notes:{2:'`1...e6`: d5 ki taiyaari.',4:'`2...d5`: e4 par hamla.',5:'`3.e5`: White aage badh kar space leta hai.',6:'`3...c5`: French ka main idea: pawn chain ki jad (d4) par hamla.',7:'`4.c3`: d4 ko mazboot.'}},
  {t:'line',h:'Caro-Kann Defense: Classical, Main Line',flip:true,drill:'b',moves:'e4 c6 d4 d5 Nd2 dxe4 Nxe4 Bf5 Ng3 Bg6 h4',notes:{2:'`1...c6`: d5 ki taiyaari, par c8 bishop band nahi hota.',4:'`2...d5`: e4 par hamla.',6:'`3...dxe4`: pawn lo.',8:'`4...Bf5`: Caro-Kann ka idea: bishop pawn chain ke **bahar** develop.',9:'`5.Ng3`: bishop par attack, tempo.',11:'`6.h4`: White h5 se bishop ko pareshan karna chahta hai.'}},
  {t:'line',h:'Scandinavian Defense: Main Line',flip:true,drill:'b',moves:'e4 d5 exd5 Qxd5 Nc3 Qa5',notes:{2:'`1...d5`: seedha e4 par hamla.',4:'`2...Qxd5`: queen jaldi bahar.',5:'`3.Nc3`: develop + queen par attack = tempo.',6:'`3...Qa5`: queen safe jagah, a5 se e1-a5 pin ka khel.'}},
  {t:'move',after:'e4',q:'Black ho. Sicilian khelo.',line:['c5'],why:'`1...c5` **Sicilian Defense**.',hint:'c-pawn do square.',flip:true},
  {t:'move',after:'e4 e6 d4 d5 e5',q:'French Advance: Black ka main hamla chalo (pawn chain ki jad par).',line:['c5'],why:'`3...c5`: d4 par hamla, French ka dil.',hint:'c-pawn.',flip:true},
  {t:'move',after:'e4 c6 d4 d5 Nd2 dxe4 Nxe4',q:'Caro-Kann: bishop ko pawn chain ke bahar develop karo.',line:['Bf5'],why:'`4...Bf5`: Classical Caro-Kann.',hint:'Light-square bishop.',flip:true},
  {t:'move',after:'e4 d5 exd5 Qxd5',q:'White ho. Develop karte hue queen par attack karo (tempo).',line:['Nc3'],why:'`3.Nc3`: develop + tempo. Opening mein queen jaldi nikle to aise attack karo.',hint:'Queenside knight.'},
  {t:'quiz',q:'French Defense ki sabse badi kamzori kya maani jaati hai?',opts:['c8 bishop pawns ke peeche band ho jaata hai','King castle nahi kar sakta','Queen bahar nahi aa sakti'],a:0,why:'`...e6` aur `...d5` ke baad c8 bishop ka raasta band. Isliye Black aksar ...b6/...Ba6 ya ...c5 se khel kholta hai.'},
  {t:'quiz',q:'Caro-Kann mein Black `...Bf5` kyun khelta hai?',opts:['Bishop ko pawn chain ke bahar nikalne ke liye','Turant check ke liye','Queen bachane ke liye'],a:0,why:'Caro-Kann ka plus point: French ki tarah c8 bishop band nahi hota. Pehle bishop bahar, phir ...e6.'}
 ]},
{key:'sf.fam3',title:'Openings Ch 1.3: Closed games (1.d4 d5)',sub:'Queen\'s Gambit, QGA, Slav, London',
 yaad:['Queen\'s Gambit (2.c4): d5 ko side se challenge.','QGD (...e6): mazboot centre. QGA (...dxc4): pawn le kar baad mein lautana.','Slav (...c6): d5 bachao aur c8 bishop khula rakho.','London (Bf4 + e3 + c3): ek system jo har jawab par chalta hai.'],
 steps:[
  {t:'info',h:'The Big Idea',md:'Pawns d4 aur d5 aamne-saamne ruk jaate hain, isliye tactics kam aur **plans** zyada. White aksar `c4` se d5 ko challenge karta hai. Dheere develop karo, centre ko pakdo, phir plan.'},
  {t:'line',h:'Queen\'s Gambit Declined: Three Knights',moves:'d4 d5 c4 e6 Nc3 Nf6 Nf3 Be7 e3 O-O',drill:'w',notes:{3:'`2.c4`: **Queen\'s Gambit**. c-pawn de kar d5 ko hatana chahta hai.',4:'`2...e6`: Declined. d5 ko mazboot bachaya.',5:'`3.Nc3`: d5 par aur dabav.',7:'`4.Nf3`: develop.',8:'`4...Be7`: castle ki taiyaari.',10:'`5...O-O`: dono taraf normal development. Ab plans ka khel.'}},
  {t:'line',h:'Queen\'s Gambit Accepted: Classical',flip:true,drill:'b',moves:'d4 d5 c4 dxc4 Nf3 Nf6 e3 e6 Bxc4 c5 O-O',notes:{4:'`2...dxc4`: Accepted. Black pawn le leta hai, par use bachane ki koshish nahi karta.',7:'`4.e3`: bishop f1 ke liye raasta, c4 pawn wapas lene ki taiyaari.',9:'`5.Bxc4`: pawn wapas. Material barabar.',10:'`5...c5`: Black d4 par hamla karta hai.',11:'`6.O-O`: king safe.'}},
  {t:'line',h:'Slav Defense: Modern Line',flip:true,drill:'b',moves:'d4 d5 c4 c6 Nf3 Nf6 g3 Bg4 Bg2 e6 O-O',notes:{4:'`2...c6`: **Slav**. d5 ko c-pawn se bachaya, c8 bishop ka raasta khula rakha.',8:'`4...Bg4`: bishop bahar, pawn chain se pehle.',10:'`5...e6`: ab mazboot centre.',11:'`6.O-O`: White castle.'}},
  {t:'line',h:'Queen\'s Pawn Game: London System',moves:'d4 d5 Nf3 Nf6 Bf4',notes:{3:'`2.Nf3`: develop.',5:'`3.Bf4`: **London System**. Bishop pehle bahar, phir e3, c3, Bd3, Nbd2. Ek hi setup lagbhag har jawab ke against.'}},
  {t:'move',after:'d4 d5',q:'Queen\'s Gambit khelo.',line:['c4'],why:'`2.c4` **Queen\'s Gambit**.',hint:'c-pawn do square.'},
  {t:'move',after:'d4 d5 c4',q:'Black ho. Slav khelo: d5 bachao, bishop ka raasta band mat karo.',line:['c6'],why:'`2...c6` **Slav Defense**.',hint:'c-pawn ek square.',flip:true},
  {t:'move',after:'d4 d5 Nf3 Nf6',q:'London System ki pehchaan wali chaal chalo.',line:['Bf4'],why:'`3.Bf4`: London System.',hint:'Dark-square bishop.'},
  {t:'quiz',after:'d4 d5 c4 dxc4',q:'Is opening ka naam?',opts:['Queen\'s Gambit Accepted','Queen\'s Gambit Declined','Slav Defense','London System'],a:0,why:'`2...dxc4`: Black ne gambit pawn le liya: **Accepted**.'},
  {t:'quiz',q:'QGA mein White aksar c4 pawn kaise wapas leta hai?',opts:['e3 khel ke bishop f1 se (Bxc4)','Queen a4 se turant','Pawn wapas lene ki zaroorat nahi'],a:0,why:'`e3` ke baad `Bxc4`: develop bhi aur pawn bhi wapas. Black ke liye pawn bachana mushkil hota hai.'}
 ]},
{key:'sf.fam4',title:'Openings Ch 1.4: Hypermodern (English, Reti, KID, Nimzo)',sub:'Centre ko door se control',
 yaad:['English (1.c4) aur Reti (1.Nf3): pehle pieces, centre baad mein.','King\'s Indian: Black centre White ko de deta hai, phir ...e5 ya ...c5 se todta hai.','Nimzo-Indian: ...Bb4 se Nc3 ko pin, e4 ko roko.','Grunfeld: ...d5 se centre ko turant challenge, phir Bg7 se dabav.'],
 steps:[
  {t:'info',h:'The Big Idea',md:'Purana usool tha: centre mein pawns rakho. Hypermodern players ne kaha: centre ko **door se** pieces (fianchetto bishop, knights) se control karo, aur opponent ke bade centre ko baad mein todo. Isme jaldbaazi nahi, timing zaroori hai.'},
  {t:'line',h:'King\'s Indian Defense: Orthodox',moves:'d4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Nf3 O-O Be2 e5 O-O',drill:'b',flip:true,notes:{2:'`1...Nf6`: e4 ko roko, centre ko door se dekho.',4:'`2...g6`: bishop g7 ki taiyaari (fianchetto).',6:'`3...Bg7`: lambi diagonal par bishop.',7:'`4.e4`: White bada centre leta hai. Black ne jaan-boojh kar diya.',8:'`4...d6`: ...e5 ki taiyaari.',10:'`5...O-O`: pehle king safe.',12:'`6...e5`: ab Black centre ko todta hai.',13:'`7.O-O`: dono castle. Aage kingside (Black) vs queenside (White) ka khel.'}},
  {t:'line',h:'Nimzo-Indian Defense: Normal, Classical',flip:true,drill:'b',moves:'d4 Nf6 c4 e6 Nc3 Bb4 e3 O-O Bd3 d5',notes:{6:'`3...Bb4`: **Nimzo-Indian**. Nc3 ko pin, taaki White e4 na khel sake.',7:'`4.e3`: shaant development.',8:'`4...O-O`: king safe.',10:'`5...d5`: ab Black bhi centre mein.'}},
  {t:'line',h:'Grunfeld Defense: Exchange',flip:true,drill:'b',moves:'d4 Nf6 c4 g6 Nc3 d5 cxd5 Nxd5 e4 Nxc3 bxc3 Bg7 Nf3',notes:{6:'`3...d5`: **Grunfeld**. Turant centre ko challenge.',8:'`4...Nxd5`: knight centre mein.',9:'`5.e4`: White bada centre banata hai.',10:'`5...Nxc3`: exchange.',12:'`6...Bg7`: bishop ab d4 aur c3 par dabav daalta hai. Black ka plan: ...c5 se centre todo.'}},
  {t:'line',h:'Reti Opening',moves:'Nf3 d5 c4',notes:{1:'`1.Nf3`: e5 ko roko, pehle develop.',3:'`2.c4`: **Reti**. d5 ko side se challenge.'}},
  {t:'move',after:'',q:'English Opening khelo.',line:['c4'],why:'`1.c4` **English Opening**.',hint:'c-pawn do square.'},
  {t:'move',after:'d4 Nf6 c4 e6 Nc3',q:'Black ho. Nimzo-Indian khelo: Nc3 ko pin karo.',line:['Bb4'],why:'`3...Bb4` **Nimzo-Indian**.',hint:'Dark-square bishop.',flip:true},
  {t:'move',after:'d4 Nf6 c4 g6 Nc3',q:'Black ho. Grunfeld khelo: centre ko turant challenge.',line:['d5'],why:'`3...d5` **Grunfeld**. (`3...Bg7` hota to King\'s Indian.)',hint:'d-pawn do square.',flip:true},
  {t:'move',after:'d4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Nf3 O-O Be2',q:'Black ho. King\'s Indian ka main centre-break chalo.',line:['e5'],why:'`6...e5`: KID ka dil. White ke centre ko todna.',hint:'e-pawn do square.',flip:true},
  {t:'quiz',q:'Hypermodern openings ka main idea kya hai?',opts:['Centre ko door se pieces se control karna','Pehli chaal se queen nikalna','Kabhi castle na karna'],a:0,why:'Fianchetto bishop aur knights door se centre dekhte hain; opponent ka centre baad mein toda jaata hai.'},
  {t:'quiz',after:'d4 Nf6 c4 g6 Nc3 Bg7',q:'Yeh Black ki kaunsi defense hai?',opts:['King\'s Indian','French','Slav','Petrov'],a:0,why:'`...Nf6`, `...g6`, `...Bg7` (bina ...d5 ke) = **King\'s Indian**.'}
 ]},
/* ============ Level 4: anjaan opening ka checklist ============ */
{key:'sf.unknown',title:'Unknown Openings: 4-Question Checklist',sub:'Jo opening nahi aati, usmein kya karein',
 yaad:['1. Centre: kya main centre (e4/d4/e5/d5) le sakta hoon ya challenge kar sakta hoon?','2. Development: kaunsa piece abhi tak ghar par hai?','3. King safety: kya castle kar sakta hoon? Opponent ka king kahan hai?','4. Tactics: opponent ne kya dhamki di? Koi piece latak raha hai?'],
 steps:[
  {t:'info',h:'4 Questions for Any Unknown Opening',md:'Opponent ne koi ajeeb chaal khel di jo tumne kabhi nahi dekhi? Ghabrao mat. Har chaal se pehle yeh 4 sawaal pucho, isi kram mein:\n\n- **1. Centre:** kya main centre le sakta hoon, ya uske centre ko challenge kar sakta hoon?\n- **2. Development:** kaunsa piece abhi ghar par hai? Use bahar lao.\n- **3. King safety:** kya castle kar sakta hoon?\n- **4. Tactics:** opponent ki pichhli chaal ne kya dhamki di? Mera ya uska koi piece latak raha hai?\n\nAjeeb openings (jaise 1.b4, 1.g4, 1.a3, 1...a6) aksar kamzor hoti hain. Saaf development se fayda khud milta hai.'},
  {t:'move',after:'g4',q:'Black ho. White ne ajeeb `1.g4` khela. Sawaal 1 (centre): centre lo aur g4 pawn par nazar rakho.',line:['d5'],ok:['d5','e5'],why:'`1...d5` (ya `1...e5`): centre lo. `1...d5` ke baad bishop c8 bhi g4 ko dekhta hai.',hint:'Centre ka pawn do square.',flip:true},
  {t:'move',after:'b4',q:'Black ho. White ne `1.b4` khela. Centre lo aur b4 pawn ko target karo.',line:['e5'],ok:['e5','d5'],why:'`1...e5`: centre bhi aur bishop f8 ab b4 ko dekhta hai.',hint:'e-pawn do square.',flip:true},
  {t:'quiz',q:'Opponent ne koi anjaan chaal khel di. Sabse PEHLE kya dekhna chahiye (har chaal se pehle)?',opts:['Uski chaal ne kya dhamki di (tactics)','Opening ka naam yaad karna','Turant queen bahar nikalna'],a:0,why:'Naam yaad hona zaroori nahi. Pehle dekho: kya koi piece latak raha hai, koi check ya capture ki dhamki hai? Phir centre, development, king safety.'},
  {t:'quiz',q:'Checklist ka sahi kram kya hai?',opts:['Centre, Development, King safety, Tactics','Tactics, Queen, Pawns, King','Castle, Queen, Rook, Pawn'],a:0,why:'Centre, Development, King safety, Tactics. Aur tactics ka sawaal har chaal par (dhamki dekhna) sabse zaroori.'},
  {t:'quiz',q:'Opening mein queen jaldi bahar aaye to aksar kya karna chahiye?',opts:['Develop karte hue use attack karo (tempo lo)','Apni queen bhi bahar nikalo','Kuch mat karo'],a:0,why:'Develop karte hue queen par attack = tempo. Jaise Scandinavian mein `Nc3`.'}
 ]}
];

/* 10 levels. lessons: purane course ke lesson keys (course.html se link, copy nahi) + naye ROAD_NEW keys. */
const ROAD_LEVELS = [
 {n:1,name:'Foundation',lo:0,gate:1000,games:20,hold:7,band:[400,1100],quota:{flash:10,puz:20,quiz:5,end:1,open:1,calc:0,mins:45},
  lessons:['l1.intro','l1.board','l1.pieces','l1.special','l1.values','l1b.mate','l1b.draws','l1b.notation','l1b.tourney','l2b.safety','l2b.captures','l2b.opening','sf.fam0','sf.fam1','sf.fam2','sf.fam3','sf.fam4','l2.kqk','l2.krk','l2.ladder']},
 {n:2,name:'Tactics 1',lo:1000,gate:1250,games:35,hold:7,band:[900,1350],quota:{flash:15,puz:25,quiz:5,end:2,open:2,calc:3,mins:60},
  lessons:['l2b.traps1','l2b.think','l3.process','l3.fork','l3.pin','l3.skewer','lm.mates','lm.backrank','l4.ideas','l4.systems','l4.italian']},
 {n:3,name:'Tactics 2',lo:1250,gate:1500,games:50,hold:7,band:[1150,1600],quota:{flash:15,puz:25,quiz:5,end:2,open:2,calc:3,mins:60},
  lessons:['l3.disc','l3.remove','lm.smother','lm.patterns1','lm.patterns2','l5.egthemes','l5.kp','l5.square','l4.ruy','l4.sicilian','l4.french']},
 {n:4,name:'Calculation',lo:1500,gate:1750,games:65,hold:7,band:[1400,1850],quota:{flash:20,puz:25,quiz:6,end:2,open:3,calc:5,mins:75},
  lessons:['l3b.deflect','l3b.more','l3b.golden','l3b.calc','l4b.qg','l4b.indian','l4b.gambits','l4b.traps','sf.unknown','l5.bb','l5b.pawnend']},
 {n:5,name:'Plans',lo:1750,gate:2000,games:80,hold:10,band:[1650,2100],quota:{flash:20,puz:25,quiz:6,end:2,open:3,calc:5,mins:75},
  lessons:['l6.elements','l6.pawns','l6.pawns2','l6.squares','l6b.files','l6b.plans','l5b.rook','l5b.minor','l4b.rep','l7.analysis']},
 {n:6,name:'Core',lo:2000,gate:2200,games:100,hold:14,band:[1900,2350],quota:{flash:25,puz:20,quiz:6,end:3,open:4,calc:3,mins:90},core:true,
  lessons:['l6b.prophy','l6b.sacs','l7.calc2','l7.time','l7.psych','l7.tips','l7b.plan']},
 {n:7,name:'Master 1',lo:2200,gate:2400,games:130,hold:14,band:[2100,2550],quota:{flash:30,puz:15,quiz:5,end:3,open:5,calc:3,mins:120},
  lessons:['l7b.masters','l7b.champs1','l7b.champs2']},
 {n:8,name:'Master 2',lo:2400,gate:2600,games:160,hold:21,band:[2300,2750],quota:{flash:30,puz:15,quiz:5,end:3,open:5,calc:3,mins:120},
  lessons:['l7b.qgs1','l7b.qgs2','l7b.quotes']},
 {n:9,name:'Elite',lo:2600,gate:2800,games:200,hold:30,band:[2500,3000],quota:{flash:30,puz:15,quiz:5,end:3,open:5,calc:3,mins:120},lessons:[]},
 {n:10,name:'Legend',lo:2800,gate:3000,games:200,hold:30,band:[2700,3000],quota:{flash:30,puz:15,quiz:5,end:3,open:5,calc:3,mins:120},lessons:[]}
];
if(typeof module!=='undefined')module.exports={ROAD_NEW,ROAD_LEVELS};
