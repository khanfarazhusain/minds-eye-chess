/* Openings Ladder, Level 3 (Advanced): Open games ke gehre trees, move orders, structures aur plans.
   Main Course: naya level "Openings 3" (course ke end mein, Pro ke baad: tab tak tactics, structures,
   plans, endgames sab ho chuke). Road to 3000: Level 6. */
module.exports = {
 newLevel: {id:'op3',title:'Openings 3: advanced trees, structures aur plans',sub:'12-15+ chaal ke trees, move orders, transpositions, har opening ka middlegame plan',
  intro:'Ab har opening ko gehraai se: lambi lines, move order ki chaalaakiyan, aur opening se aane wale pawn structures ke plans. Yahan structures aur plans wale lessons kaam aayenge.'},
 road: 6,
 lessons: [
/* ---------------------------------------------------------------- */
{id:'ital',title:'Italian (advanced): tree, IQP aur ...d5 break',sub:'Giuoco Pianissimo 15+ chaal, 5.d4 se isolated pawn, Black ka equalizer',
 yaad:[
  'Pianissimo mein Black ka sabse achha equalizer: sahi waqt par `...d5` break.',
  '`5.d4 exd4 6.cxd4 Bb4+ 7.Bd2 Bxd2+ 8.Nbxd2 d5!`: White ko isolated `d4` pawn (IQP).',
  'IQP wala: pieces active, kingside attack, `d5` push. Doosra: `d5` square block karo, pieces trade karo.',
  'Bishop trade `...Be6` se: White `Bxe6 Rxe6` ya bishop `c2` rakhe. `Bb3`/`a4` bishop ki jagah.',
  'Move order: `4.d3` (Two Knights) aur `4.c3 Nf6 5.d3` (Giuoco) aksar same position.'],
 steps:[
  {t:'line',h:'Pianissimo: 15+ chaal aur ...d5 break',drill:'b',md:'Dono taraf development poora, phir Black `...d5` se center kholta hai.',moves:'e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d3 d6 O-O a6 a4 Ba7 Re1 O-O h3 h6 Nbd2 Re8 Nf1 Be6 {Bishop trade ka offer: White ka strong bishop.} Bxe6 Rxe6 Ng3 d5 {Break! Center khula, Black ke pieces active.}',theory:1},
  {t:'quiz',q:'Pianissimo mein Black `...d5` kab khele?',opts:['Pehli chaal par','Jab pieces develop ho jaayein aur `e5`/`d5` ko support ho (jaise `...Re8`, `...Be6`)','Kabhi nahi'],a:1,why:'Jaldi `...d5` se `e5` kamzor ho sakta hai. Development poora karke break do.',test:1},
  {t:'line',h:'5.d4: isolated queen pawn (IQP)',drill:'w',md:'`5.d4` se White bada center leta hai. Black ke `...d5` ke baad structure IQP ban jaata hai.',moves:'e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d4 exd4 cxd4 Bb4+ Bd2 Bxd2+ Nbxd2 d5 {Center todo.} exd5 Nxd5 Qb3 {`d5` knight aur `b7` par dabaav.} Nce7 O-O O-O Rfe1 c6 {Ab `d4` White ka isolated pawn.}'},
  {t:'info',h:'IQP structure: dono ka plan',after:'e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d4 exd4 cxd4 Bb4+ Bd2 Bxd2+ Nbxd2 d5 exd5 Nxd5 Qb3 Nce7 O-O O-O Rfe1 c6',hl:['d4','d5'],md:'**White (IQP wala):** pieces active rakho, `Ne5`, rooks e-file par, kingside attack, sahi waqt par `d5` push. Pieces trade mat karo.\n\n**Black:** `d5` square par knight rakho (blockade), pieces trade karo. Endgame mein `d4` pawn kamzor.\n\nYeh plan Queen\'s Gambit, Caro-Kann Panov aur Sicilian Alapin mein bhi aata hai: ek structure, kai openings.'},
  {t:'quiz',q:'IQP position mein Black ka sabse achha general plan?',opts:['Kingside pawn storm','Pieces trade karke endgame mein `d4` pawn jeetna, `d5` par blockade','Queen jaldi bahar'],a:1,why:'Har trade ke saath isolated pawn aur kamzor hota hai.',test:1},
  {t:'move',after:'e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d4 exd4 cxd4 Bb4+ Bd2 Bxd2+ Nbxd2 d5 exd5 Nxd5 Qb3',q:'White ne `Qb3` se `d5` aur `b7` par dabaav dala. Black ki sabse solid chaal?',line:['Nce7'],ok:['Nce7','Na5'],why:'`10...Nce7` `d5` knight ko sahara aur baad mein `...c6`. Blockade mazboot.'},
  {t:'line',h:'Transposition: Two Knights 4.d3 = Giuoco',drill:'w',md:'Alag move order, same position. Repertoire mein yeh jaanna zaroori hai taaki ek hi plan dono jagah kaam aaye.',moves:'e4 e5 Nf3 Nc6 Bc4 Nf6 d3 Bc5 c3 {Ab Giuoco Pianissimo.} d6 O-O O-O a4 a5 Re1 h6 Nbd2 Be6'},
  {t:'move',after:'e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d3 d6 O-O O-O Re1 a6 a4 Ba7 h3 h6 Nbd2 Re8 Nf1',q:'White ka knight `f1` par. Kahan jaayega? Agli chaal se pehle Black ek useful chaal khele.',line:['Be6'],ok:['Be6','d5'],why:'`...Be6` White ke strong bishop ko challenge karta hai. `...d5` bhi theek: center break.'}
 ]},
/* ---------------------------------------------------------------- */
{id:'ruy',title:'Ruy Lopez (advanced): Zaitsev, anti-Marshall, Berlin plans',sub:'Band center ke plans, move order se Marshall se bachna, Berlin endgame',
 yaad:[
  'Closed Ruy mein `d5` aaya to center band: White kingside (`Nf1-g3`, `Nh2-g4`), Black queenside (`...c4`, `...b4`) ya `...f5`.',
  'Zaitsev: `...Bb7`, `...Re8`, `...Bf8`: `e4` par dabaav.',
  'Anti-Marshall: `8.h3`/`8.a4`/`8.d3` (`8.c3` ki jagah). Move order se opponent ka hathiyaar band.',
  'Berlin endgame: White ka kingside majority (`e5`), Black ke 2 bishops. Black `...h5`, `...Rh6`.',
  'Open center (`exd4 cxd4`): pieces ki ladai. Band center: pawn breaks ki ladai.'],
 steps:[
  {t:'line',h:'Zaitsev: Karpov-Kasparov ka battle',drill:'b',md:'Black ka sabse ambitious Closed Ruy. 17 chaal tak.',moves:'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3 d6 c3 O-O h3 Bb7 {Zaitsev: `e4` par dabaav.} d4 Re8 Nbd2 Bf8 a4 h6 Bc2 exd4 cxd4 Nb4 Bb1 c5 d5 {Center band.} Nd7 Ra3 {Rook teesri rank se kingside par.}',theory:1},
  {t:'quiz',q:'`d5` ke baad center band hai. Plans kahan banenge?',opts:['Center mein','Flanks par: pawn breaks (`...c4`, `...f5`, `a4`, `Nf1-g3`)','Kahin nahi, draw'],a:1,why:'Band center = flanks ki ladai. Jahan tumhare pawns "point" karte hain, wahan khelo.',test:1},
  {t:'line',h:'Anti-Marshall: 8.h3',drill:'w',md:'Marshall se bachna hai? `8.c3` ki jagah `8.h3`. Ab `8...d5?!` pe `c3` ka sahara nahi hota, aur White `d3` se slow khelta hai.',moves:'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3 O-O h3 {Anti-Marshall.} Bb7 d3 d6 a3 {Bishop ke liye `a2`.} Nb8 Nbd2 Nbd7'},
  {t:'quiz',q:'`8.h3` (anti-Marshall) ka idea kya hai?',opts:['Kingside attack','Marshall (`8.c3 d5`) se bachna: move order se opponent ka prepared hathiyaar band','Pawn jeetna'],a:1,why:'Move order ki taakat: same opening, par opponent ki favourite line nahi aane di.',test:1},
  {t:'line',h:'Marshall: aage ki line',drill:'b',md:'Agar White Marshall le, Black ka attack kaisa chalta hai.',moves:'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3 O-O c3 d5 exd5 Nxd5 Nxe5 Nxe5 Rxe5 c6 d4 Bd6 Re1 Qh4 g3 Qh3 Be3 Bg4 Qd3 Rae8 Nd2 Re6 {Rook lift: kingside attack.}',theory:1},
  {t:'line',h:'Berlin endgame ke plans',drill:'b',md:'Queens ke bina middlegame. Black `...h5`, `...Be7`, `...Rh6` jaisi chaalon se apna bishop pair active karta hai.',moves:'e4 e5 Nf3 Nc6 Bb5 Nf6 O-O Nxe4 d4 Nd6 Bxc6 dxc6 dxe5 Nf5 Qxd8+ Kxd8 Nc3 Ke8 h3 h5 {Bishop `c8` ke liye `g4` control, aur `...Rh6` ka idea.} Bf4 Be7 Rad1 Be6 Ng5 Rh6',theory:1},
  {t:'move',after:'e4 e5 Nf3 Nc6 Bb5 Nf6 O-O Nxe4 d4 Nd6 Bxc6 dxc6 dxe5 Nf5 Qxd8+ Kxd8 Nc3 Ke8 h3',q:'Berlin endgame. Black ka typical aur useful idea?',line:['h5'],ok:['h5','Be7','Ne7','h6'],why:'`...h5`: `g4` roko aur rook `h6` se active. `...Be7`, `...Ne7` bhi normal.'},
  {t:'move',after:'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3 d6 c3 O-O h3 Bb7 d4 Re8 Nbd2 Bf8',q:'Zaitsev. White ka standard aur useful plan?',line:['a4'],ok:['a4','d5','Bc2','a3'],why:'`a4` queenside par `b5` ko challenge. `Bc2`, `a3`, `d5` bhi theory mein khele jaate hain.'}
 ]},
/* ---------------------------------------------------------------- */
{id:'scot',title:'Scotch aur Four Knights (advanced)',sub:'Mieses ke structures, doubled c-pawns, move orders',
 yaad:[
  'Mieses (`5.Nxc6 bxc6 6.e5`) mein Black ke `c` pawns doubled par center ke liye `...d5`/`...d6` break.',
  'White ka plan: `e5` pawn rakho, `c4`, `b3`, `Bb2`, queenside par jagah.',
  'Black ka plan: `...O-O-O` ya `...g6`/`...Bg7`, aur `...d6` se `e5` todo.',
  'Scotch Four Knights `4.d4 exd4 5.Nxd4 Bb4`: `Nxc6 bxc6 Bd3 d5`: Black solid.',
  'Ek structure kai openings mein: doubled c-pawn + open b-file Black ke rook ke liye.'],
 steps:[
  {t:'line',h:'Scotch Mieses: 12+ chaal',drill:'w',md:'Kasparov aur Carlsen ki line. White ka `e5` pawn aur queenside jagah.',moves:'e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Nf6 Nxc6 bxc6 e5 Qe7 Qe2 Nd5 c4 Ba6 b3 g6 {Bishop `g7` se `e5` par.} Bb2 Bg7 Nd2 O-O O-O-O {White ka king queenside par, `e5` mazboot.} Rfe8 Nf3 Nb6 {Black `...d6`/`...c5` se `e5` aur center todega.}',theory:1},
  {t:'quiz',q:'Mieses structure mein Black ka sabse zaroori pawn break?',opts:['`...a5`','`...d6` ya `...f6` se `e5` pawn todna','`...h5`'],a:1,why:'`e5` pawn White ki jagah ka aadhaar hai. Use todo to Black ke bishops jaag jaate hain.',test:1},
  {t:'line',h:'Scotch Classical: lambi line',drill:'b',md:'Black ka bishop `c5` aur queen `f6`: pieces se dabaav.',moves:'e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Bc5 Nb3 {Bishop par attack.} Bb6 a4 a6 Nc3 Nf6 Qe2 d6 Nd5 {Bishop `b6` aur `f6` knight par dabaav.} Nxd5 {Trade karo.} exd5 Ne5 {Knight center mein, `e`-file par pin ka khayal.} a5 Ba7 Be3 Bxe3 Qxe3 O-O'},
  {t:'line',h:'Scotch Four Knights: solid Black',drill:'b',md:'Four Knights ka Scotch version. Black `...d5` se seedha barabar.',moves:'e4 e5 Nf3 Nc6 Nc3 Nf6 d4 exd4 Nxd4 Bb4 Nxc6 bxc6 Bd3 d5 exd5 cxd5 O-O O-O Bg5 c6 Na4 h6 Bh4 Re8'},
  {t:'move',after:'e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Nf6 Nxc6 bxc6 e5 Qe7 Qe2 Nd5 c4',q:'Mieses: knight par attack. Black ka sabse active jawab?',line:['Ba6'],ok:['Ba6','Nb6'],why:'`8...Ba6` `c4` par pin (queen `e2` ke peeche). `8...Nb6` bhi khela jaata hai.'},
  {t:'quiz',after:'e4 e5 Nf3 Nc6 Nc3 Nf6 d4 exd4 Nxd4',q:'Yeh position kin do move orders se aa sakti hai?',opts:['Scotch (`3.d4 exd4 4.Nxd4 Nf6 5.Nc3`) aur Four Knights (`3.Nc3 Nf6 4.d4 exd4 5.Nxd4`)','Sirf Four Knights','Ruy Lopez'],a:0,why:'Transposition. Dono raaston se same position: plan bhi same.',test:1}
 ]},
/* ---------------------------------------------------------------- */
{id:'gam',title:'Open games ke gambits: advanced defence',sub:'Evans (Lasker), King\'s Gambit (Fischer, Cunningham), Danish, Fried Liver ka asli hisaab',
 yaad:[
  'Evans Lasker Defence `...d6` + `...Bb6`: pawn wapas, solid endgame jaisi position.',
  'KGA Fischer Defence `3...d6`: `Ne5` roka, phir `...g5`.',
  'Danish: do pawns lene ke baad `...d5` aur `...Nf6` se pieces bahar.',
  'Fried Liver ka "real" hisaab: `5...Na5!` sabse sahi, par `5...Nxd5` mein bhi `6.d4!` (Lolli) sabse strong.',
  'Gambit ke khilaaf golden rule: material wapas do jab woh development rok raha ho.'],
 steps:[
  {t:'line',h:'Evans Gambit: Lasker Defence',drill:'b',md:'Black pawn le kar sahi waqt par wapas deta hai. Endgame jaisi position mein White ka attack khatam.',moves:'e4 e5 Nf3 Nc6 Bc4 Bc5 b4 Bxb4 c3 Ba5 d4 d6 {Lasker idea: `e5` ko pakdo.} O-O Bb6 dxe5 dxe5 Qxd8+ Nxd8 Nxe5 Be6 {Queens gayi, Black ke 2 bishops: barabar.}',theory:1},
  {t:'line',h:'King\'s Gambit: Fischer Defence',drill:'b',md:'Fischer ka "bust": `3...d6` knight ko `e5` se rokta hai, phir `...g5` se pawn pakdo.',moves:'e4 e5 f4 exf4 Nf3 d6 {`Ne5` band.} d4 g5 h4 g4 Ng1 {Knight peeche: King\'s Gambit ki keemat.} Nf6 Nc3 Nh5',theory:1},
  {t:'line',h:'Danish: dono pawns lo, phir wapas do',drill:'b',md:'Black do pawns le sakta hai, par phir `...d5` se ek wapas aur pieces bahar.',moves:'e4 e5 d4 exd4 c3 dxc3 Bc4 cxb2 Bxb2 {White ke 2 bishops `f7`/`g7` par.} d5 {Pawn wapas: diagonal band.} Bxd5 Nf6 Bxf7+ Kxf7 Qxd8 Bb4+ Qd2 Bxd2+ Nxd2 {Endgame: Black ke paas barabar se zyada.}',theory:1},
  {t:'line',h:'Fried Liver ka sach: 6.d4 (Lolli)',drill:'w',win:1,md:'`5...Nxd5` ke baad `6.Nxf7` se bhi strong `6.d4!` hai: center khol ke attack.',moves:'e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 d5 exd5 Nxd5 d4 {Lolli Attack.} exd4 O-O Be7 Nxf7 Kxf7 Qf3+ Ke6 Nc3 {Pin aur attack: Black king center mein. Engine White ko bahut aage maanta hai: isliye Black `5...Na5!` khele.}',theory:1},
  {t:'move',after:'e4 e5 Nf3 Nc6 Bc4 Bc5 b4 Bxb4 c3 Ba5 d4 d6 O-O Bb6 dxe5 dxe5',q:'Evans Lasker. White ke paas queens trade ke alaawa kuch nahi. Kaunsi chaal?',line:['Qxd8+'],ok:['Qxd8+','Qb3'],why:'`Qxd8+`: queens trade. `Qb3` se `f7` par dabaav bhi khela jaata hai.'},
  {t:'quiz',q:'Gambit ke khilaaf Black material kab wapas de?',opts:['Kabhi nahi','Jab extra pawn ko pakadne se development ruk raha ho ya king khatre mein ho','Hamesha turant'],a:1,why:'Material se zyada zaroori development aur king safety.',test:1}
 ]}
 ]
};
