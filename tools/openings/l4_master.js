/* Openings Ladder, Level 4 (Master): asli master games (2026 OTB, Lichess broadcast, CC0) se har family ka
   opening -> middlegame transition, "master ki chaal" sawaal, aur engine ke khilaaf opening positions se sparring.
   Course: naya level "Openings 4" (Openings 3 ke baad). Road to 3000: Level 8.
   Games aur sawaal tools/openings/gen_l4.js banata hai (l4_auto.json): har "master ki chaal" Stockfish ki best chaal hai. */
const A=require('./l4_auto.json');
const FAMS={
 open:{id:'mopen',title:'Master games: Open games (1.e4 e5)',sub:'Ruy Lopez aur Italian: top players ka opening se middlegame',
  spar:[['e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3 d6 c3 O-O h3 Na5 Bc2 c5 d4 Qc7','Closed Ruy (Chigorin), White ki taraf se'],
        ['e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d3 d6 O-O a6 a4 Ba7 Re1 O-O h3 h6 Nbd2 Re8 Nf1','Giuoco Pianissimo, Black ki taraf se']]},
 sic:{id:'msic',title:'Master games: Sicilian',sub:'Dragon aur Open Sicilian: elite level par plans',
  spar:[['e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6 Be3 e5 Nb3 Be6 f3 Be7 Qd2 O-O O-O-O Nbd7','Najdorf English Attack, White ki taraf se'],
        ['e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Be3 Bg7 f3 O-O Qd2 Nc6 O-O-O','Dragon (9.O-O-O), Black ki taraf se']]},
 semi:{id:'msemi',title:'Master games: Pirc, French, Caro-Kann aur baaki',sub:'Semi-open defences mein elite players kaise khelte hain',
  spar:[['e4 e6 d4 d5 e5 c5 c3 Nc6 Nf3 Qb6 a3 c4 Nbd2 Na5','French Advance, White ki taraf se'],
        ['e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5 Ng3 Bg6 h4 h6 Nf3 Nd7 h5 Bh7 Bd3 Bxd3 Qxd3 e6 Bd2 Ngf6 O-O-O','Caro-Kann Classical, Black ki taraf se']]},
 qg:{id:'mqg',title:'Master games: Queen\'s Gambit aur d-pawn',sub:'QGD Exchange aur London jaise setups: elite level',
  spar:[['d4 d5 c4 e6 Nc3 Nf6 cxd5 exd5 Bg5 Be7 e3 c6 Qc2 Nbd7 Bd3 O-O Nge2 Re8 O-O Nf8','QGD Exchange (Carlsbad), White ki taraf se'],
        ['d4 d5 c4 c6 Nf3 Nf6 Nc3 dxc4 a4 Bf5 e3 e6 Bxc4 Bb4 O-O Nbd7 Qe2','Slav main line, Black ki taraf se']]},
 ind:{id:'mind',title:'Master games: Indian defences aur flank',sub:'Nimzo aur Indian setups: elite level',
  spar:[['d4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Nf3 O-O Be2 e5 O-O Nc6 d5 Ne7 Ne1 Nd7 Be3 f5 f3','KID Mar del Plata, Black ki taraf se'],
        ['d4 Nf6 c4 e6 Nc3 Bb4 e3 O-O Bd3 d5 Nf3 c5 O-O Nc6 a3 Bxc3 bxc3 dxc4 Bxc4 Qc7','Nimzo Rubinstein, White ki taraf se']]}
};
const lessons=Object.keys(FAMS).map(f=>{const F=FAMS[f],D=A[f];const steps=[];
 steps.push({t:'info',h:'Master level: theory ke baad kya?',md:'Masters ki asli taakat opening ki aakhri theory chaal ke **baad** dikhti hai: woh structure se plan banate hain.\n\nIs lesson mein 2026 ke asli tournament games (Lichess broadcast database) hain. Har game mein dekho: **theory kahan khatam hui**, structure kaisa bana, aur kisne kaunsa plan chuna. Phir master ki chaal guess karo, aur engine ke khilaaf usi opening ki position se khelo.'});
 D.games.forEach(g=>steps.push({t:'line',game:1,h:g.h.replace(/ \| [^,]*$/,'').replace(/ (\d{4})$/,(m,y)=>g.h.slice(0,-5).includes(y)?'':m),md:`Opening: **${g.eco}**. Chaal-dar-chaal dekho. Har chaal se pehle socho: main kya khelta?`,moves:g.moves,notes:g.notes}));
 D.guess.forEach((q,i)=>steps.push({t:'move',fen:q.fen,line:q.line,q:`**${q.game}** (${q.eco}), move ${q.mvn}: master ne yahan kya khela? Sirf ek chaal sabse achhi hai.`,why:`Master ne \`${q.line[0]}\` khela, aur engine bhi isse sabse achhi maanta hai (doosri chaal se kaafi behtar). Socho: is chaal ne kya badla: material, king safety, ya structure?`,hint:'Forcing chaalein pehle dekho (check, capture, threat), phir plan.',test:i===0?1:0}));
 F.spar.forEach(([mv,label])=>{steps.push({t:'play',after:mv,goal:'eval',max:12,need:-0.5,sf:300,skill:6,
  q:`**Sparring: ${label}.** Engine ke khilaaf **12 chaal** khelo. Plan yaad karo (Level 3). End mein engine ka number **-0.5** ya behtar chahiye.`,why:'Opening ke baad plan: structure dekho, pawn break chuno, aur pieces ko us break ke liye lagao. Hanging pieces aur forcing chaalein har chaal par check karo.'})});
 return {id:F.id,title:F.title,sub:F.sub,yaad:['Theory ki aakhri chaal ke baad plan structure se aata hai, yaad se nahi.','Masters pehle pieces ko break ke liye lagaate hain, phir break khelte hain.','Har opening ka ek typical structure aur 2-3 plans jaano: yahi master level hai.'],steps}});
// play steps sirf usi side se jiski chaal ho: after wali position side-to-move ke hisaab se label check
module.exports={
 newLevel:{id:'op4',title:'Openings 4: master games aur sparring',sub:'Asli elite games, master ki chaal guess, engine ke khilaaf opening positions',
  intro:'Ab har family ke asli 2026 elite games dekho, master ki chaal guess karo, aur engine ke khilaaf usi opening ki positions se khelo. Yahi opening ko "pakka" karne ka tareeka hai.'},
 road: 8,
 lessons
};
