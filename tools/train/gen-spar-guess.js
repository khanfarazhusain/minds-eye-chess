// Sparring (engine ke against plan/advantage), guess-the-move, aur apne games ka review ladders.
// Run: node tools/train/gen-spar-guess.js  -> ladders/spar.json, ladders/guess.json, ladders/review.json
const fs=require('fs'),path=require('path');const {ROOT,core,SF,pgnGames,uciOf,rng}=require('./lib');
const X=core();const R=rng(9090);const sh=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const V={P:1,N:3,B:3,R:5,Q:9,K:0};const cnt=st=>st.b.filter(Boolean).length;

async function main(){const sf=new SF();
  const gamesBy={};for(const f of fs.readdirSync(path.join(__dirname,'data')).filter(f=>f.endsWith('.pgn'))){const elo=+(f.match(/\d{4}/)||[0])[0];gamesBy[elo]=pgnGames(fs.readFileSync(path.join(__dirname,'data',f),'utf8'))}
  const evalW=async fen=>{const st=X.parseFEN(fen);const r=await sf.go(fen,{depth:14});const l=r.lines[0];if(!l)return 0;const e=l.mate!=null?(l.mate>0?99:-99):l.cp/100;return st.w?e:-e};
  const quiet=async st=>{if(X.inCheck(st))return false;const r=await sf.go(X.fenOf(st),{depth:8});const bm=X.legal(st).find(m=>uciOf(m)===r.best.slice(0,4)+(r.best[4]||''));return!!bm&&!st.b[bm.t]&&!X.inCheck(X.make(st,bm))};

  /* ---------- sparring positions ---------- */
  const all=[];for(const elo in gamesBy)for(const g of gamesBy[elo]){let st=X.parseFEN(X.START_FEN);g.moves.forEach((x,k)=>{const m=X.findMove(st,x);if(!m)return;st=X.make(st,m);if(k>=14&&k%4===0)all.push(st)})}
  sh(all);const S2=[],S3=[],S4=[],S5=[];if(process.env.ONLY_GUESS)all.length=0;
  for(const st of all){if(S2.length>=28&&S3.length>=28&&S4.length>=28&&S5.length>=28)break;const n=cnt(st);if(!(await quiet(st)))continue;const fen=X.fenOf(st);const e=await evalW(fen);const me=e>=0?'w':'b',em=Math.abs(e);
    /* learner always plays the side to move (FEN side), so flip sign to side-to-move */
    const es=st.w?e:-e;
    if(n>=20&&es>=1.5&&es<=3.5&&S2.length<28)S2.push({fen,e:es});
    else if(n>=20&&Math.abs(es)<=0.5&&S3.length<28)S3.push({fen,e:es});
    else if(n>=20&&Math.abs(es)<=0.4&&S5.length<28)S5.push({fen,e:es});
    else if(n<=14&&es>=2&&es<=6&&S4.length<28)S4.push({fen,e:es})}
  console.error('spar',S2.length,S3.length,S4.length,S5.length);
  const ply=(o,q,goal,max,need,skill,why)=>({t:'play',fen:o.fen,goal,max,need,sf:300,skill,q,why});
  const S1=['','e4','d4','e4 e5','d4 d5','e4 c5','c4','Nf3'].map(mv=>{let st=X.parseFEN(X.START_FEN);for(const x of mv.split(' ').filter(Boolean))st=X.make(st,X.findMove(st,x));return{fen:X.fenOf(st)}});
  const sp1=S1.map(o=>ply(o,'Opening sparring: **12 chaal** mein saare 4 chhote pieces (knights, bishops) bahar lao aur **castle** karo. Material mat khona!','dev',12,0,2,'Opening principles: center, knights pehle, bishops, phir castle. Ek piece baar baar mat chalao, queen jaldi mat nikalo.'));
  const sp2=S2.map(o=>ply(o,`Tum aage ho (engine ka number **+${o.e.toFixed(1)}**). **12 chaal** khelo: fayda bachao, forcing chaalein dekho. End mein engine ka number **+1.5** ya zyada chahiye.`,'eval',12,1.5,5,'Aage ho to: pehle apni safety (hanging pieces), phir forcing chaalein (check, capture, threat), aur pieces trade karo.'));
  const sp3=S3.map(o=>ply(o,'Barabar middlegame. Ek **plan** chuno (kamzor pawn, open file, outpost, king attack) aur **15 chaal** khelo. End mein engine ka number **−0.3** se behtar.','eval',15,-0.3,10,'Plan: pehle sabse kamzor dushman point dhundo, phir apna sabse bura piece behtar karo.'));
  const sp4=S4.map(o=>ply(o,`Jeeta hua endgame (engine ka number **+${o.e.toFixed(1)}**). **20 chaal** mein technique se fayda bachao: king active, passed pawn aage. End mein **+2** ya jeet.`,'eval',20,2,15,'Endgame: king center mein, passed pawn push, pieces trade karo (pawns nahi).'));
  const sp5=S5.map(o=>ply(o,'GM sparring: barabar position, engine **poori taakat** se. **20 chaal** khelo aur balance mat khona (end mein **−0.3** se behtar).','eval',20,-0.3,20,'Har chaal par prophylaxis: opponent kya chahta hai? Phir apna plan.'));
  const spar=(id,ch,after,needs,title,sub,yaad,md,arr,nP,qn)=>({ch,after,needs,les:{id:'tr_'+id,key:'tr.'+id,title,sub,yaad,steps:[{t:'info',h:'Sparring: engine ke against',md},...arr.slice(0,nP)],pool:arr.slice(nP),qn}});
  const SP=[
    spar('sp1','l2b','l2.opening',['l1.special','l2.opening'],'🏋 Sparring: develop aur castle','Engine ke against opening principles',['Knights pehle, phir bishops, phir castle.','Material mat khona.'],
      'Ab principles **engine ke against**. Engine kamzor level par khelta hai, par tumhari galti ka fayda uthayega.\n\nGoal: 12 chaal mein **4 chhote pieces bahar + castle**, bina material khoye.\n\nPractice ke baad test: 5 naye positions, **4/5**.',sp1,3,5),
    spar('sp2','l3','l3.remove',['l2.safety','l2.think','l3.fork','l3.pin','l3.remove','tr.ev1'],'🏋 Sparring: fayda bachao (middlegame)','Aage wali position engine ke against khelo',['Aage ho: pehle safety, phir forcing chaalein.','Pieces trade karo jab aage ho.'],
      'Asli games ki middlegame positions jahan tum **aage** ho. Engine (medium level) wapas aane ki koshish karega.\n\nGoal: 12 chaal ke baad Stockfish ka number **+1.5** ya zyada (tumhari taraf se).\n\nTest: 5 positions, **4/5**.',sp2,3,5),
    spar('sp3','l6b','l6.plans',['l6.elements','l6.squares','l6.files','l6.plans'],'🏋 Sparring: plan banao aur chalao','Barabar middlegame, strong engine ke against',['Kamzor point dhundo, bura piece behtar karo.','Plan badlo sirf jab position badle.'],
      'Barabar middlegame positions. Pehle position padho (elements), **plan** chuno, phir 15 chaal khelo. Engine kaafi strong level par hai.\n\nGoal: end mein engine ka number **−0.3** se behtar.\n\nTest: 5 positions, **4/5**.',sp3,3,5),
    spar('sp4','l5b','l5.minor',['l5.egthemes','l5.kp','l5.pawnend','l5.rook','l5.minor'],'🏋 Sparring: jeeta endgame jeeto','Endgame technique engine ke against',['King active, passed pawn aage.','Aage ho to pieces trade karo, pawns nahi.'],
      'Endgame mein aage ho. Engine bachne ki poori koshish karega. **20 chaal** technique se khelo.\n\nGoal: end mein **+2** ya jeet.\n\nTest: 5 positions, **4/5**.',sp4,3,5),
    spar('sp5','l7','l7.psych',['l6.prophy','l7.calc2','l7.psych'],'🏋 Sparring: GM level (full engine)','Barabar position, engine poori taakat se',['Prophylaxis: opponent ka plan pehle.','Practical: simple aur safe chaalein jab confuse ho.'],
      'Sabse mushkil sparring: Stockfish **poori taakat** se. Barabar position, 20 chaal, balance mat khona.\n\nGoal: end mein engine ka number **−0.3** se behtar.\n\nTest: 5 positions, **4/5**.',sp5,3,5)];

  /* ---------- guess the move ---------- */
  const COURSE_LINES=k=>X.ALLLES.filter(l=>k(l.key)).flatMap(l=>l.steps.filter(s=>s.t==='line'&&s.moves&&!s.fen).map(s=>({h:s.h||l.title,moves:s.moves.trim(),drill:s.drill})));
  const winner=mv=>mv.length%2===1?'w':'b';
  const traps=COURSE_LINES(k=>k==='l2.traps1');
  const g1=traps.map(t=>({t:'guess',game:t.h.replace(/`/g,''),moves:t.moves,me:winner(t.moves.split(' ')),from:0,to:t.moves.split(' ').length,mode:'exact',need:70,q:`**${t.h}**: tum **${winner(t.moves.split(' '))==='w'?'White':'Black'}** ho (jeetne wali side). Har chaal guess karo.`}));
  const opens=COURSE_LINES(k=>/^l4\./.test(k)&&k!=='l4.traps').filter(t=>t.moves.split(' ').length>=8);
  const g2=opens.map(t=>{const me=/Defen[cs]e|\(Black\)|Counter|Sicilian|French|Caro|Slav|Indian|Grunfeld|Nimzo/.test(t.h)&&!/English|Attack|System/.test(t.h)?'b':'w';const mv=t.moves.split(' ');
    return{t:'guess',game:t.h.replace(/`/g,''),moves:t.moves,me,from:0,to:mv.length,mode:'exact',need:70,q:`**${t.h}**: tum **${me==='w'?'White':'Black'}** ho. Opening ki har chaal yaad se khelo.`}});
  async function sfSeg(g,me,from,n){let st=X.parseFEN(X.START_FEN);const mv=g.moves;const sc={};let k=0,taken=0;
    for(;k<mv.length&&taken<n;k++){const m=X.findMove(st,mv[k]);if(!m)return null;
      if(k>=from&&(st.w?'w':'b')===me){const r=await sf.go(X.fenOf(st),{depth:13,multipv:4});const best=r.lines[0];const sv=l=>l.mate!=null?(l.mate>0?99:-99):l.cp/100;
        const o={};for(const l of r.lines){const mm=X.legal(st).find(x=>uciOf(x)===l.pv[0].slice(0,4)+(l.pv[0][4]||''));if(!mm)continue;const loss=sv(best)-sv(l);const p=loss<=0.3?8:loss<=1?4:0;if(p)o[X.sanOf(st,mm)]=p}
        sc[k]=o;taken++}
      st=X.make(st,m)}
    return taken>=n?{sc,to:k}:null}
  async function engG(elos,need,cap){const out=[];for(const elo of elos)for(const g of gamesBy[elo]||[]){if(out.length>=cap)break;const sfSide=/Stockfish/.test(g.tags.White||'')?'w':'b';if(g.moves.length<50)continue;
      const from=16+2*Math.floor(R()*6);const seg=await sfSeg(g,sfSide,from,10);if(!seg)continue;
      out.push({t:'guess',game:`${g.tags.White} vs ${g.tags.Black}`.replace(/\s*\(Elo (\d+)\)/g,' ($1)'),moves:g.moves.join(' '),me:sfSide,from,to:seg.to,mode:'sf',sc:seg.sc,need,
        q:`Tum **${sfSide==='w'?'White':'Black'}** (Stockfish, ${elo} Elo) ho. 10 chaalein guess karo. Game wali chaal = 10 point, engine ke hisaab se achhi chaal = 8 ya 4.`})}return out}
  /* asli OTB classical games (Lichess broadcast database, CC0): tools/train/data/masters/otb-<band>.pgn */
  const OTB=b=>pgnGames(fs.readFileSync(path.join(__dirname,'data','masters','otb-'+b+'.pgn'),'utf8'));
  const tname=(t,c)=>(t[c+'Title']?t[c+'Title']+' ':'')+String(t[c]||'?').replace(/^(.+?), (.+)$/,'$2 $1')+(t[c+'Elo']?' ('+t[c+'Elo']+')':'');
  async function otbG(bands,need,cap){const out=[];for(const b of bands)for(const g of OTB(b)){if(out.length>=cap)break;const me=g.tags.Result==='1-0'?'w':'b';
      const from=16+2*Math.floor(R()*6)+(me==='b'?1:0);const seg=await sfSeg(g,me,from,10);if(!seg)continue;const who=tname(g.tags,me==='w'?'White':'Black');
      out.push({t:'guess',game:`${tname(g.tags,'White')} vs ${tname(g.tags,'Black')} · ${g.tags.BroadcastName||g.tags.Event||''}${(n=>String(g.tags.BroadcastName||'').includes(n)?'':' '+n)(String(g.tags.Date||'').slice(0,4))}`.trim(),moves:g.moves.join(' '),me,from,to:seg.to,mode:'sf',sc:seg.sc,need,
        q:`Asli tournament game. Tum **${me==='w'?'White':'Black'}** ho: **${who}** (jeetne wale). 10 chaalein guess karo. Game wali chaal = 10 point, engine ke hisaab se achhi chaal = 8 ya 4.`})}return out}
  const g3=await otbG(['2000','2200'],50,45),g4=await otbG(['2400'],55,40);
  const masters=COURSE_LINES(k=>['l6.elements','l7.masters','l7.champs1'].includes(k)).filter(t=>t.moves.split(' ').length>=30);
  const g5m=[];for(const t of masters){const mv=t.moves.split(' ');const me=winner(mv);const seg=await sfSeg({moves:mv},me,Math.max(0,mv.length-24),10);if(seg)g5m.push({t:'guess',game:t.h.replace(/`/g,''),moves:t.moves,me,from:Math.max(0,mv.length-24),to:mv.length,mode:'sf',sc:seg.sc,need:55,q:`**${t.h}**: tum **${me==='w'?'White':'Black'}** (jeetne wale) ho. Aakhri 10+ chaalein guess karo.`})}
  const g5=[...g5m,...await otbG(['2700','2600'],55,45)];
  console.error('guess',g1.length,g2.length,g3.length,g4.length,g5.length);
  const gl=(id,ch,after,needs,title,sub,yaad,md,arr,nP,qn)=>({ch,after,needs,les:{id:'tr_'+id,key:'tr.'+id,title,sub,yaad,steps:[{t:'info',h:'Guess the move',md},...arr.slice(0,nP)],pool:arr.slice(nP),qn}});
  sh(g2);sh(g3);sh(g4);
  const GU=[
    gl('gm1','l2b','l2.traps1',['l2.traps1'],'🏋 Guess the move: traps','Jo traps seekhe, unki har chaal khud khelo',['Jeetne wali side ki har chaal yaad se.','Trap ka idea samjho, sirf ratta nahi.'],
      'Pichle lesson ke traps ab **game ki tarah**: tum jeetne wali side ho, har chaal guess karo. **70%** sahi = pass.\n\nTest: 5 games.',g1,4,5),
    gl('gm2','l4b','l4.rep',['l4.ideas','l4.italian','l4.ruy','l4.sicilian','l4.french','l4.qg','l4.indian','l4.gambits','l4.rep'],'🏋 Guess the move: openings','Seekhi hui openings ki har chaal',['Har chaal ka idea: center, development, king safety.','Apne repertoire wali lines sabse pehle pakki.'],
      'Opening lessons ki saari lines: tum ek side ho, har chaal guess karo. **70%** = pass. Har baar alag lines.\n\nTest: 5 lines.',g2,5,5),
    gl('gm3','l6b','l6.plans',['l6.elements','l6.plans'],'🏋 Guess the move: tournament games (2000-2400)','Asli classical games, FM/IM level',['Pehle plan, phir chaal.','Forcing chaalein pehle check karo.'],
      'Asli tournament games (classical, 2000-2400 rating, 2026). Jeetne wale player ki opening ke baad ki **10 chaalein** guess karo. Game wali chaal 10 point, engine ke hisaab se lagbhag utni hi achhi 8, theek-thaak 4.\n\nPass: **50%**. Test: 5 games.',g3,3,5),
    gl('gm4','l7','l7.analysis',['tr.gm3','l7.analysis'],'🏋 Guess the move: IM/GM games (2400-2600)','Asli classical games, IM aur GM',['Har chaal se pehle candidates (2-3).','Opponent ka plan bhi socho.'],
      'Ab 2400-2600 rating ke asli tournament games (IM, GM). **55%** = pass. Har chaal par 2-3 candidates socho, phir chuno.\n\nTest: 5 games.',g4,3,5),
    gl('gm5','l7b','l7.champs2',['l7.masters','l7.champs1','l7.champs2','tr.gm4'],'🏋 Guess the move: famous masters aur elite GMs (2600+)','Opera, Immortal, Lasker aur aaj ke top GMs',['Masters ke plans: attack, sacrifice, endgame.','Jeetne wale ki aankh se dekho.'],
      'Famous master games (Opera, Immortal, Lasker...) aur 2026 ke elite tournaments (Norway Chess, Prague Masters, TePe Sigeman, Saint Louis...) ke 2600-2800 GMs ke games. **55%** = pass. GM level.\n\nTest: 5 games.',g5,3,5)];

  /* ---------- apne games ka review ---------- */
  const rv=(id,ch,after,needs,lvl,title,sub,yaad,md)=>({ch,after,needs,les:{id:'tr_'+id,key:'tr.'+id,title,sub,yaad,steps:[{t:'info',h:'Apne game se seekho',md},{t:'myrev',lvl}],pool:[{t:'myrev',lvl}],qn:0}});
  const RV=[
    rv('mr1','l1b','l1.notation',['l1.notation','l1.values'],1,'🏋 Apna game review: blunders','Engine tumhare game ki badi galtiyan dhundega, har galti ek card',['Har game ke baad review.','Galti ka card baar baar aayega jab tak pakka na ho.'],
      'Lichess ya Chess.com par khela koi game (PGN) yahan daalo. Engine **blunders** (badi galtiyan) dhundega. Har galti ek **card** banegi: abhi solve karo, aur kuch din baad review mein dobara aayegi.\n\nHar haare game ke baad yeh lesson dobara kholo (lesson list se).'),
    rv('mr2','l2b','l2.think',['l2.think','tr.mr1'],2,'🏋 Apna game review: CCT se galti samjho','Mistakes bhi, aur har galti ki wajah (check, capture, threat)',['Galti ki wajah likho: kya miss hua?','Sabse zyada wali wajah par practice.'],
      'Ab engine **mistakes** bhi dhundega. Har card solve karne ke baad batao **kya miss hua**: check, capture, threat, ya apna piece latka. App ginti rakhega ki tumhari sabse zyada galti kahan hoti hai.'),
    rv('mr3','l7','l7.analysis',['l7.analysis','tr.mr2'],3,'🏋 Apna game review: pehle khud, phir engine','Pro tareeka: khud analyse karo, engine se milao, category banao',['Pehle khud, phir engine.','Galtiyon ki category: tactic, blunder, time, plan, endgame.'],
      'Analysis lesson ka tareeka: **pehle khud** apni galat chaalein chuno, phir engine. App batayega kitni galtiyan tumne khud pakdi aur kitni chhoot gayi. Phir har galti ki **category** (tactic, blunder, time, plan, endgame).'),
    rv('mr4','l7b','l7.plan',['l7.plan','tr.mr3'],4,'🏋 Apna game review: GM level','Inaccuracies bhi, 5 cards tak, deep engine',['Chhoti galtiyan bhi jodkar game haarte hain.','Har hafte kam se kam 3 games review.'],
      'GM level review: engine **inaccuracies** bhi pakdega (chhoti galtiyan), aur sabse badi 5 cards banengi. Pehle khud, phir engine, phir category. Training plan: har hafte kam se kam 3 games.')];
  sf.quit();
  const W=(n,o)=>fs.writeFileSync(path.join(__dirname,'ladders',n+'.json'),JSON.stringify(o,null,1));if(!process.env.ONLY_GUESS)W('spar',SP);W('guess',GU);W('review',RV);
  console.log([...SP,...GU,...RV].map(l=>l.les.key+': '+l.les.steps.length+' steps, pool '+l.les.pool.length).join('\n'))}
main().catch(e=>{console.error(e);process.exit(1)});
