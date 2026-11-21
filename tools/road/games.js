/* ================= My Games: record (PGN), game ke baad review, galtiyon ke drills =================
   Engine (Stockfish) SIRF game khatam hone ke baad review ke liye. Course ke lessons aur puzzles mein engine nahi. */
const GK='mindseye.road.games';
let GAMES=(()=>{try{return JSON.parse(localStorage.getItem(GK)||'{}')||{}}catch(e){return{}}})();
function gsave(){const ids=Object.keys(GAMES).sort((a,b)=>GAMES[b].at-GAMES[a].at);ids.slice(80).forEach(k=>delete GAMES[k]);try{localStorage.setItem(GK,JSON.stringify(GAMES))}catch(e){}}
const gameList=()=>Object.values(GAMES).sort((a,b)=>b.at-a.at);
const RESN={win:'Jeet',loss:'Haar',draw:'Draw'};
/* Lichess game JSON -> hamara record */
function gameRec(j,me){const W=j.players.white,B=j.players.black;const wn=(W.user&&W.user.name)||(W.aiLevel?'Lichess AI '+W.aiLevel:'?'),bn=(B.user&&B.user.name)||(B.aiLevel?'Lichess AI '+B.aiLevel:'?');
  const color=lcs(bn)===lcs(me)?'b':'w';const mine=color==='w'?W:B,opp=color==='w'?B:W;
  const res=!j.winner?(j.status==='started'?'live':'draw'):(j.winner===(color==='w'?'white':'black')?'win':'loss');
  return{id:j.id,at:j.createdAt||Date.now(),color,opp:color==='w'?bn:wn,oppR:opp.rating||0,myR:mine.rating||0,diff:mine.ratingDiff||0,res,status:j.status,speed:j.speed,rated:!!j.rated,
    moves:j.moves||'',fen:j.initialFen||'',open:(j.opening&&j.opening.name)||'',pgn:j.pgn||'',an:(GAMES[j.id]&&GAMES[j.id].an)||null}}
const lcs=s=>(s||'').toLowerCase();
function lhead(){const t=lichToken();const h={Accept:'application/x-ndjson'};if(t)h.Authorization='Bearer '+t;return h}
/* pichhle rated rapid/classical games Lichess se (lichess.org par khele gaye bhi) */
async function syncGames(){if(!SP.user)return 0;const since=Math.max(0,...gameList().map(g=>g.at))||Date.now()-14*864e5;
  const r=await fetch(`https://lichess.org/api/games/user/${encodeURIComponent(SP.user)}?since=${since}&max=20&rated=true&perfType=rapid,classical&opening=true&pgnInJson=true&clocks=false&evals=false`,{headers:lhead()});
  if(!r.ok)return 0;const t=await r.text();let n=0;
  t.split('\n').filter(x=>x.trim()).forEach(l=>{try{const j=JSON.parse(l);const g=gameRec(j,SP.user);if(g.res!=='live'&&!GAMES[g.id]){GAMES[g.id]=g;n++}}catch(e){}});gsave();return n}
async function fetchGame(id){const r=await fetch(`https://lichess.org/game/export/${encodeURIComponent(id)}?pgnInJson=true&opening=true&clocks=false&evals=false`,{headers:{Accept:'application/json'}});
  if(!r.ok)throw new Error('Game nahi mila ('+r.status+')');const g=gameRec(await r.json(),SP.user||(LT&&LT.user)||'');if(g.res!=='live'){GAMES[g.id]=g;gsave()}return g}
const unreviewed=()=>gameList().filter(g=>!g.an&&g.at>Date.now()-7*864e5);

/* ---------- Stockfish (engine/sf-worker.js, offline, phone par) ---------- */
const ENG={w:null,ready:null,cb:null};
function engStart(){if(ENG.ready)return ENG.ready;ENG.ready=new Promise((res,rej)=>{let w;try{w=new Worker('engine/sf-worker.js')}catch(e){rej(new Error('Engine is phone par shuru nahi hua'));return}
  ENG.w=w;let ok=false;const t=setTimeout(()=>{if(!ok){ENG.ready=null;try{w.terminate()}catch(e){}rej(new Error('Engine shuru hone mein bahut der lagi'))}},90000);
  w.onmessage=e=>{const l=String(e.data);if(l==='uciok'){w.postMessage('setoption name Hash value 16');w.postMessage('setoption name MultiPV value 2');w.postMessage('isready')}
    else if(l==='readyok'&&!ok){ok=true;clearTimeout(t);res()}else if(ENG.cb)ENG.cb(l)};
  w.onerror=e=>{try{e.preventDefault()}catch(x){}clearTimeout(t);ENG.ready=null;rej(new Error('Engine band ho gaya (memory kam?)'))};w.postMessage('uci')});return ENG.ready}
/* ek waqt me ek hi search; mpv = kitni alag lines (MultiPV) */
function engEval(fen,ms,mpv){const run=()=>engEval1(fen,ms,mpv||2);const p=(ENG.q||Promise.resolve()).then(run,run);ENG.q=p.catch(()=>{});return p}
function engEval1(fen,ms,mpv){return new Promise(res=>{const lines=[];ENG.w.postMessage('setoption name MultiPV value '+mpv);ENG.cb=l=>{
  if(l.startsWith('info ')&&l.includes(' pv ')&&!/ (lower|upper)bound/.test(l)){const g=k=>{const m=l.match(new RegExp(' '+k+' (-?\\d+)'));return m?+m[1]:null};
    const mp=g('multipv')||1,mate=g('mate');let pv=l.split(' pv ')[1].trim().split(/\s+/);const pr=lines[mp-1];if(pr&&pr.pv[0]===pv[0]&&pr.pv.length>pv.length&&pv.length<4)pv=pr.pv;lines[mp-1]={cp:mate!=null?null:g('cp'),mate,pv}}
  else if(l.startsWith('bestmove')){ENG.cb=null;res({lines:lines.filter(Boolean),best:l.split(/\s+/)[1]})}};
  ENG.w.postMessage('position fen '+fen);ENG.w.postMessage('go movetime '+ms)})}
/* jeet ka chance (0-100) chaal wale side ke liye, Lichess wala formula */
const wpCp=cp=>50+50*(2/(1+Math.exp(-0.00368208*cp))-1);
const wpLine=l=>!l?50:l.mate!=null?(l.mate>0?100:0):wpCp(Math.max(-1500,Math.min(1500,l.cp||0)));
const sanLine=(st,pv,n)=>{const o=[];for(const u of pv.slice(0,n)){const m=fromUci(st,u);if(!m)break;o.push(sanOf(st,m));st=make(st,m)}return o};
const evTxt=(l,w)=>{if(!l)return'';if(l.mate!=null){const m=w?l.mate:-l.mate;return(m>0?'+':'-')+'M'+Math.abs(m)}const c=(w?1:-1)*(l.cp||0)/100;return(c>0?'+':'')+c.toFixed(1)};
const CLS={inacc:['Inaccuracy','?!'],mist:['Mistake','?'],blund:['Blunder','??']};
async function analyseGame(g,onProg){await engStart();const sans=g.moves.split(' ').filter(Boolean);let st=parseFEN(g.fen||START_FEN);const pos=[st],mv=[];
  for(const x of sans){const m=findMove(st,x);if(!m)break;mv.push(m);st=make(st,m);pos.push(st)}
  const ms=pos.length>120?200:300;const ev=[];
  for(let i=0;i<pos.length;i++){const p=pos[i];if(!legal(p).length){ev.push({wp:inCheck(p)?0:50,lines:[]})}
    else{const r=await engEval(fenOf(p),ms);ev.push({wp:wpLine(r.lines[0]),lines:r.lines})}onProg&&onProg(i+1,pos.length)}
  const out=[];let accSum=0,accN=0;const cnt={inacc:0,mist:0,blund:0};
  for(let i=0;i<mv.length;i++){const p=pos[i];if((p.w?'w':'b')!==g.color)continue;const E=ev[i],best=E.lines[0];
    const played=uciOf(mv[i]),isBest=!!best&&best.pv[0]===played;const before=E.wp,after=100-ev[i+1].wp;const drop=isBest?0:Math.max(0,before-after);
    accSum+=Math.max(0,Math.min(100,103.1668*Math.exp(-0.04354*drop)-3.1669));accN++;
    const cls=drop>=30?'blund':drop>=20?'mist':drop>=10?'inacc':'';if(!cls||!best)continue;cnt[cls]++;
    const alt=(E.lines[1]&&wpLine(E.lines[1])>=before-5)?E.lines[1].pv[0]:null;
    out.push({ply:i,fen:fenOf(p),san:sanOf(p,mv[i]),cls,drop:Math.round(drop),before:Math.round(before),after:Math.round(after),best:sanLine(p,best.pv,1)[0],line:sanLine(p,best.pv,6).join(' '),
      alt:alt?sanLine(p,[alt],1)[0]:null,ev:evTxt(best,p.w),x:explainMistake(p,mv[i],E,ev[i+1])})}
  g.an={at:Date.now(),acc:accN?Math.round(accSum/accN):100,cnt,mis:out,evs:ev.map((e,i)=>Math.round(pos[i].w?e.wp:100-e.wp))};
  /* mistake aur blunder -> drill cards (aaj se due) */
  SP.gm=SP.gm||{};out.filter(x=>x.cls!=='inacc').forEach(x=>{const k=g.id+':'+x.ply;if(!SP.gm[k])SP.gm[k]={fen:x.fen,best:x.best,alt:x.alt,line:x.line,san:x.san,gid:g.id,ply:x.ply,opp:g.opp,due:dayNum(),box:0,ok:0}});
  GAMES[g.id]=g;gsave();sday().review=(sday().review||0)+1;ssave();return g}
/* galti-drill: wahi position, sahi chaal dhundo. 1, 3, 7, 21 din; 3 baar sahi = pakka */
const dueGm=()=>Object.entries(SP.gm||{}).filter(([k,c])=>c.due<=dayNum()).map(([k])=>k);
function gmResult(k,ok){const c=SP.gm[k];if(!c)return;if(!ok){c.box=0;c.ok=0;c.due=dayNum()+1;return}c.ok++;c.box++;if(c.ok>=3)delete SP.gm[k];else c.due=dayNum()+GAPS[Math.min(c.box,3)]}
function gmStep(k){const c=SP.gm[k];const n=Math.floor(c.ply/2)+1;
  return{t:'move',fen:c.fen,line:[c.best],ok:c.alt?[c.alt]:undefined,q:`Aapke game (vs ${c.opp}) ki position, chaal ${n}. Game mein aapne **${c.san}** khela tha. Ab sahi chaal dhundo.`,
    why:`Behtar tha: **${c.best}**${c.alt?' (ya '+c.alt+')':''}. Line: ${c.line}`,hint:'Pehle checks, captures aur threats dekho. Opponent ki dhamki kya hai?'}}

/* ---------- screens ---------- */
function gameRow(g){const r=g.res==='win'?'🟢':g.res==='loss'?'🔴':'⚪';const a=g.an;
  return`<div class="qrow"><span class="qi">${r}</span><div class="qt"><b>vs ${esc(g.opp)} (${g.oppR})</b><div class="muted small">${esc(RESN[g.res]||g.res)}${g.diff?' '+(g.diff>0?'+':'')+g.diff:''} · ${g.color==='w'?'White':'Black'} · ${esc(g.open||g.speed||'')}${a?` · Accuracy ${a.acc}% · ${a.cnt.blund}?? ${a.cnt.mist}? ${a.cnt.inacc}?!`:' · Review baaki'}</div></div><button class="btn small ${a?'':'primary'}" data-go="#/game/${g.id}">${a?'Open':'Review'}</button></div>`}
async function vGames(){const app=$('#app');const L=gameList();
  app.innerHTML=`<div class="stack"><button class="btn small backbtn" data-go="#/">‹ Today's Work</button><h1>My Games</h1>
   <p class="muted small">Aapke rated Lichess games (rapid/classical). Har game ki chaalein PGN mein save hoti hain. Review mein Stockfish batata hai kahan galti hui aur kya khelna chahiye tha (sirf game ke baad). Galtiyan "Mistake Flashcards" mein wapas aati rahengi.</p>
   <div class="row"><button class="btn" data-act="gsync">Lichess se laao</button>${L.length?'<button class="btn" data-act="gpgn">Download PGN</button>':''}</div><p class="small" id="gmsg"></p>
   ${L.length?`<div class="qlist">${L.map(gameRow).join('')}</div>`:'<div class="card">Abhi koi game nahi. Lichess par rated rapid game khelo, phir "Lichess se laao" dabao.</div>'}</div>`}
function vGame(id){const app=$('#app');let g=GAMES[id];
  if(!g){app.innerHTML='<p class="muted">Game la raha hoon…</p>';fetchGame(id).then(()=>{if(location.hash==='#/game/'+id)vGame(id)}).catch(e=>{app.innerHTML=`<div class="card">${esc(e.message)}</div><button class="btn block" data-go="#/games">‹ My Games</button>`});return}
  const sans=g.moves.split(' ').filter(Boolean);const pos=[parseFEN(g.fen||START_FEN)],last=[null];
  for(const x of sans){const st=pos[pos.length-1];const m=findMove(st,x);if(!m)break;last.push([sn(m.f),sn(m.t)]);pos.push(make(st,m))}
  let cur=pos.length-1;const a=g.an;const misBy={};(a?a.mis:[]).forEach(x=>misBy[x.ply]=x);
  app.innerHTML=`<div class="stack"><button class="btn small backbtn" data-go="#/games">‹ My Games</button>
   <p class="eyebrow">${esc(RESN[g.res]||g.res)} · ${g.color==='w'?'White':'Black'} · ${esc(g.speed||'')} ${g.rated?'Rated':''}</p><h2 style="margin:0">vs ${esc(g.opp)} (${g.oppR})</h2><p class="small muted">${esc(g.open)}</p>
   <div id="gbd"></div><div class="row" style="justify-content:center"><button class="btn small" data-nav="0">⏮</button><button class="btn small" data-nav="-1">◀</button><span class="small" id="gply"></span><button class="btn small" data-nav="1">▶</button><button class="btn small" data-nav="9999">⏭</button></div>
   <div id="gnote"></div><div id="gxp"></div><div class="moves" id="gmv"></div>
   <div id="gan">${a?anHTML(g):`<button class="btn primary block" data-act="ganalyse">Review this game (Stockfish)</button><p class="small muted">Phone par 30-60 second lagenge. Engine sirf is review ke liye, course mein nahi.</p>`}</div>
   <div class="row wrapr"><button class="btn small" data-act="gcopy">Copy PGN</button><a class="btn small" style="text-decoration:none" href="https://lichess.org/${g.id}" target="_blank" rel="noopener">Open on Lichess</a></div></div>`;
  const B=Board($('#gbd'),{st:pos[cur],persp:g.color});
  /* notation me chuni hui chaal = board par us chaal ke BAAD ki position. Galti ka note aur "Explain" usi chaal ka. */
  let XOPEN=false;
  function show(i){cur=Math.max(0,Math.min(pos.length-1,i));XL=null;
    const nx=cur>0?misBy[cur-1]:null;const arr=[];
    if(nx){const P0=pos[cur-1];const pm=findMove(P0,nx.san);if(pm)arr.push([sn(pm.f),sn(pm.t),'r']);const bm=findMove(P0,nx.best);if(bm)arr.push([sn(bm.f),sn(bm.t),'g'])}
    B.last=last[cur];B.set({st:pos[cur],arr,hl:[]});
    $('#gply').textContent=cur?`${Math.ceil(cur/2)}${cur%2?'.':'...'} ${sans[cur-1]}`:'Start';
    $('#gnote').innerHTML=nx?noteHTML(nx,cur):'';
    $('#gxp').innerHTML=`<button class="btn block" data-xp="1">🔍 ${cur?'Explain this move: '+esc(xNum(pos[cur-1],sans[cur-1])):'Explain the start position'}</button>`;
    $('#gmv').innerHTML=sans.map((x,k)=>{const mk=misBy[k];return(k%2===0?`<span class="mn">${k/2+1}.</span> `:'')+`<span class="mvx${k+1===cur?' on':''}${mk?' '+mk.cls:''}" data-nav-to="${k+1}">${esc(x)}${mk?CLS[mk.cls][1]:''}</span>`}).join(' ');
    if(XOPEN)explainHere()}
  function noteHTML(nx,cur){const X=nx.x,num=`${Math.floor(nx.ply/2)+1}${nx.ply%2?'...':'.'}`;
  const head=`<b>${num} ${esc(nx.san)}${CLS[nx.cls][1]} ${CLS[nx.cls][0]}</b>`;
  if(!X)return`<div class="card ${nx.cls==='inacc'?'':'alert'}">${head}<div class="small">Behtar tha: <b>${esc(nx.best)}</b> (${nx.ev}). Line: ${esc(nx.line)}<br>Jeet ka chance ${nx.before}% → ${nx.after}%</div><p class="small muted">Is game ka review purane version se hai. "Review Again" dabao to har galti ki wajah bhi milegi.</p></div>`;
  const th=XTHEME[X.theme],PL=X.plan,op=nx.ply<24?xOpening(g.open):'';
  return`<div class="card stack ${nx.cls==='inacc'?'':'alert'}">${head}
   ${(()=>{try{const P0=pos[nx.ply],pm=findMove(P0,nx.san);if(!pm)return'';const SM=xSummary(P0,pm,{pv:X.bpv||[]},{pv:X.ref||[]},X.loss);return`<div class="xsum"><b>Seedhi baat</b>${SM.lines.map(l=>`<p>${xb(l)}</p>`).join('')}</div>`}catch(e){return''}})()}
   <div class="small"><b>Detail – kyun galat:</b></div><ul class="xwhy small">${X.why.map(t=>`<li>${xb(t)}</li>`).join('')}</ul>
   <div class="small"><b>Behtar chaal: ${esc(X.bestSan)}</b> (${nx.ev})${PL&&PL.does.length?`<ul class="xwhy">${PL.does.slice(0,3).map(t=>`<li>Ye chaal ${esc(t)}.</li>`).join('')}${PL.next?`<li>Agla plan: <b>${esc(PL.next)}</b>${PL.nextDoes.length?' – '+esc(PL.nextDoes.join(' aur ')):''}.</li>`:''}</ul>`:X.bestWhy?' – ye chaal '+esc(X.bestWhy)+'<br>':'<br>'}<span class="muted">Best line: ${esc(X.bestLine)}</span></div>
   ${X.refWhy?`<div class="small"><b>Opponent ki behtar line:</b> ${esc(X.refLine)}<br>${X.why.some(t=>t.startsWith('Opponent ka jawab'))?'':`<span class="muted">Opponent ka iraada: ${esc(X.refWhy)}.</span>`}</div>`:''}
   ${op?`<div class="small"><b>Opening:</b> ${esc(g.open)} – ${esc(op)}</div>`:''}
   <div class="small muted">Engine note: ${X.loss!=null?`lagbhag ${xPawns(X.loss)} ka fark · `:''}jeet ka chance ${nx.before}% → ${nx.after}%</div>
   <div class="small muted">Board: <span style="color:#D2462C">laal tir</span> = tumhari chaal, <span style="color:#1F9D5A">hara tir</span> = behtar chaal.</div>
   <div class="row wrapr">${X.ref.length?'<button class="btn small" data-refute="1">Opponent ka jawab dikhao</button>':''}${th?`<button class="btn small primary" data-go="#/run/th/${th[1]}">${esc(th[0])} Drill ›</button>`:''}</div></div>`}
  /* ---------- "Explain this move": chuni hui chaal ka poora samjhana (engine sirf review me) ----------
     Har hissa: 📖 Text (kholo/band) aur ➡ Board (us hisse ke tir, 1-2-3 number ke saath). */
  const XPC={};let XL=null;
  const sideName=w=>(w?'White':'Black')+((w?'w':'b')===g.color?' (aap)':' (opponent)');
  const evW=(st,l)=>{if(!l)return null;if(l.mate!=null)return{mate:(st.w?1:-1)*l.mate};return{cp:(st.w?1:-1)*(l.cp||0)}};
  function evWords(e){if(!e)return'';if(e.mate!=null)return`${e.mate>0?'White':'Black'} ke paas mate in ${Math.abs(e.mate)} hai`;
    const x=e.cp/100,a=Math.abs(x),s=x>0?'White':'Black';return a<0.3?'Position barabar hai':a<1?`${s} thoda behtar hai (${x>0?'+':''}${x.toFixed(1)})`:a<2.5?`${s} saaf behtar hai (${x>0?'+':''}${x.toFixed(1)})`:`${s} jeet ki taraf hai (${x>0?'+':''}${x.toFixed(1)})`}
  /* pv ki pehli n chaalein: har chaal ka tir (number ke saath) aur ek line ka matlab */
  function plySteps(st,pv,n,mover){const o=[];let s=st;for(const u of pv.slice(0,n)){const m=fromUci(s,u);if(!m)break;const I=xIdeas(s,m);const mine=s.w===mover;
      o.push({k:o.length+1,san:xNum(s,sanOf(s,m)),who:sideName(s.w),mine,arr:[sn(m.f),sn(m.t),mine?'g':'y',String(o.length+1)],txt:I.pos.slice(0,2).join(' aur ')||I.neg[0]||'position majboot karti hai, agli chaal ki taiyari'});s=make(s,m)}return o}
  const stepList=S=>`<ol class="xsteps">${S.map(x=>`<li><span class="xn ${x.mine?'g':'y'}">${x.k}</span><b>${esc(x.san)}</b> <span class="muted">${esc(x.who)}</span>: ${esc(x.txt)}.</li>`).join('')}</ol>`;
  async function explainHere(){XOPEN=true;const i=cur,box=$('#gxp');const P=i?pos[i-1]:pos[0],m=i?findMove(P,sans[i-1]):null,A=m?pos[i]:null;
    box.innerHTML='<div class="card"><b>🔍 Soch raha hoon…</b><p class="small muted">Stockfish is chaal se pehle aur baad ki position dekh raha hai (2-3 second).</p></div>';
    try{await engStart();let D=XPC[i];
      if(!D){const E0=legal(P).length?await engEval(fenOf(P),1500,3):null;const E1=A&&legal(A).length?await engEval(fenOf(A),1200,2):null;D=XPC[i]={E0,E1}}
      if(cur!==i)return;box.innerHTML=xpHTML(i,P,m,A,D);if(XL.lines.best.length||XL.lines.game.length)xLineSet(XL.lines.game.length?'game':'best')}
    catch(e){box.innerHTML=`<div class="card alert">${esc(e.message||String(e))}</div>`}}
  function xpHTML(i,P,m,A,D){const mover=P.w;const L=D.E0?D.E0.lines:[],best=L[0],bm=best?fromUci(P,best.pv[0]):null;const V={};const secs=[];
    const sec=(id,title,body,open)=>secs.push(`<div class="xsec"><div class="xsh"><b>${title}</b><span class="xbtns"><button class="btn small${open?' on':''}" data-xt="${id}">📖 Text</button>${V[id]?`<button class="btn small" data-xv="${id}">➡ Board</button>`:''}</span></div><div class="xsb small" id="xt-${id}"${open?'':' hidden'}>${body}</div></div>`);
    let head='';
    if(m){const san=xNum(P,sanOf(P,m)),I=xIdeas(P,m),isBest=best&&best.pv[0]===uciOf(m);
      const wb=best?wpLine(best):50,wa=D.E1&&D.E1.lines[0]?100-wpLine(D.E1.lines[0]):(inCheck(A)&&!legal(A).length?100:50),drop=isBest?0:Math.max(0,wb-wa);
      const SM=xSummary(P,m,best,D.E1&&D.E1.lines[0],null,L),lp=SM.loss||0,dd=Math.max(drop,lp>=1.5?20:lp>=0.6?10:0);const mk=misBy[i-1],VD={inacc:['🟨','Inaccuracy (?!)'],mist:['🟧','Mistake (?)'],blund:['🟥','Blunder (??)']};
      const vd=mk?VD[mk.cls]:isBest?['✅','Best chaal']:dd<3?['✅','Best jaisi chaal']:dd<10?['👍','Achhi chaal']:dd<20?['🟨','Inaccuracy (?!)']:dd<30?['🟧','Mistake (?)']:['🟥','Blunder (??)'];
      head=`<h3 style="margin:0">${vd[0]} ${esc(san)} · ${vd[1]}</h3><p class="small muted" style="margin:0">${esc(sideName(mover))} ki chaal. Pehle: ${esc(evWords(evW(P,best)))}. Ab: ${esc(D.E1&&D.E1.lines[0]?evWords(evW(A,D.E1.lines[0])):(legal(A).length?'':'game khatam'))}.</p>`+`<div class="xsum"><b>Seedhi baat</b>${SM.lines.map(l=>`<p>${xb(l)}</p>`).join('')}</div>`;
      /* 1. is chaal ne kya kiya + nayi dhamkiyan */
      const thr=xHanging(A,!mover).filter(h=>h.gain>=1),mine=xHanging(A,mover).filter(h=>h.gain>=1);
      const tArr=xSqs(A,m.t).filter(t=>A.b[t]&&xw(A.b[t])!==mover&&A.b[t].toUpperCase()!=='K').slice(0,3).map(t=>[sn(m.t),sn(t),'r']);
      V.mv={st:A,last:[sn(m.f),sn(m.t)],arr:[[sn(m.f),sn(m.t),'b']].concat(tArr),hl:mine.map(h=>sn(h.s))};
      sec('mv','1. Is chaal ne kya kiya',`<ul class="xwhy">${I.pos.map(t=>`<li>✔ ${esc(t)}</li>`).join('')}${I.neg.map(t=>`<li>✘ ${esc(t)}</li>`).join('')}${!I.pos.length&&!I.neg.length?'<li>Shaant chaal: koi seedha hamla ya kamzori nahi; mohre ki jagah thodi behtar ki.</li>':''}
        ${thr.length?`<li>⚡ Nayi dhamki: opponent ka ${xList(thr.slice(0,2).map(h=>xs(h.p)+' ('+sn(h.s)+')'))} ab khatre me hai.</li>`:''}${mine.length?`<li>⚠ Dhyan: apna ${xList(mine.slice(0,2).map(h=>xs(h.p)+' ('+sn(h.s)+')'))} ab asurakshit hai (board par peela square).</li>`:''}</ul><p class="muted" style="margin:4px 0 0">Board: neela tir = ye chaal, laal tir = jin mohron par ab hamla hai.</p>`,true);
      /* 2. behtar kya tha */
      if(!isBest&&bm&&drop>=3){V.cmp={st:P,last:last[i-1],arr:[[sn(m.f),sn(m.t),'r'],[sn(bm.f),sn(bm.t),'g']]};
        sec('cmp','2. Isme kami kya thi',`<ul class="xwhy">${xWhyPositional(P,m,bm,D.E1&&D.E1.lines[0],best.pv).map(t=>`<li>${xb(t)}</li>`).join('')}</ul><p class="muted" style="margin:4px 0 0">Board: laal = khela gaya, hara = behtar. Fark: jeet ka chance lagbhag ${Math.round(drop)}% kam hua.</p>`)}
      /* 3. opponent ka plan (aage ki 4 chaalein, number ke saath) */
      if(D.E1&&D.E1.lines[0]){const S=plySteps(A,D.E1.lines[0].pv,4,mover);V.opp={st:A,last:[sn(m.f),sn(m.t)],arr:S.map(x=>x.arr)};
        const alt=D.E1.lines[1]?fromUci(A,D.E1.lines[1].pv[0]):null;
        sec('opp','3. Ab opponent kya karega (plan)',`${stepList(S)}${alt?`<p style="margin:4px 0 0">Doosra raasta: <b>${esc(xNum(A,sanOf(A,alt)))}</b> – ${esc(xIdeas(A,alt).pos.slice(0,2).join(' aur ')||'thos chaal')}.</p>`:''}<p class="muted" style="margin:4px 0 0">Board: peele tir = ${esc(sideName(!mover))}, hare = ${esc(sideName(mover))}. Number = chaal ka kram (1 pehle).</p>`)}}
    else head=`<h3 style="margin:0">Shuruaati position</h3><p class="small muted" style="margin:0">${esc(evWords(evW(P,best)))}.</p>`;
    /* 4. best chaal aur uska plan */
    if(bm){const S=plySteps(P,best.pv,5,mover),PL=xPlan(P,best.pv),same=m&&best.pv[0]===uciOf(m);V.best={st:P,last:i?last[i-1]:null,arr:S.map(x=>x.arr)};
      sec('best',`${m?'4. ':''}Best chaal: ${esc(xNum(P,sanOf(P,bm)))} – kyun best?`,`<ul class="xwhy">${same?'<li>Game me yahi chaal kheli gayi. Shabaash!</li>':''}${PL.does.slice(0,3).map(t=>`<li>Ye chaal ${esc(t)}.</li>`).join('')||'<li>Ye position ko sabse majboot rakhti hai, koi kamzori nahi deti.</li>'}${PL.neg&&PL.neg.length?`<li class="muted">Dhyan dene wali baat: ${esc(PL.neg[0])}.</li>`:''}</ul><p style="margin:6px 0 2px"><b>Plan, chaal dar chaal:</b></p>${stepList(S)}`,!m)}
    /* 5. top chaalein */
    if(L.length>1){V.cand={st:P,last:i?last[i-1]:null,arr:L.map((l,k)=>{const c=fromUci(P,l.pv[0]);return c?[sn(c.f),sn(c.t),k?'b':'g',String(k+1)]:null}).filter(Boolean)};
      let h='<div class="xcands">';L.forEach((l,k)=>{const cm=fromUci(P,l.pv[0]);if(!cm)return;const I=xIdeas(P,cm);const d=k&&best.mate==null&&l.mate==null?((best.cp||0)-(l.cp||0))/100:0;
        const cons=I.neg.slice(0,2);if(d>=0.3)cons.push(`best se lagbhag ${xPawns(d)} kam`);const S1=make(P,cm),rp=l.pv[1]?fromUci(S1,l.pv[1]):null;
        h+=`<div class="xcand"><div class="row" style="justify-content:space-between"><b><span class="xn ${k?'b':'g'}">${k+1}</span> ${esc(sanOf(P,cm))}</b><span class="mono">${esc(evWords(evW(P,l)).replace(/^.*\(|\)$/g,'')||'')}</span></div>
          ${I.pos.slice(0,2).map(t=>`<div>👍 ${esc(t)}</div>`).join('')||'<div>👍 thos, surakshit chaal</div>'}${cons.map(t=>`<div>👎 ${esc(t)}</div>`).join('')}${rp?`<div class="muted">Jawab: ${esc(xNum(S1,sanOf(S1,rp)))} – ${esc(xIdeas(S1,rp).pos[0]||'thos jawab')}</div>`:''}</div>`});
      sec('cand',`${m?'5. ':''}Top ${L.length} chaalein (pros / cons)`,h+'</div>')}
    /* 6. position ka haal, dono taraf */
    {const S=m?A:P;const fw=xFeat(S,true),fb=xFeat(S,false);const mat=xmat(S,true)-xmat(S,false);
      const side=(w,f)=>{const o=[];o.push(f.castled?'raja castle karke surakshit':f.canC?'raja beech me, castle abhi baaki':'raja beech me aur castle ka haq gaya');
        if(f.undev.length)o.push(`${f.undev.length} chhote mohre abhi ghar par (${f.undev.map(sn).join(', ')})`);else o.push('saare chhote mohre nikal chuke');
        if(f.doubled)o.push(`${f.doubled} doubled pyada`);if(f.isolated)o.push(`${f.isolated} isolated pyada`);if(f.passed.length)o.push(`passed pyada: ${f.passed.map(sn).join(', ')}`);
        if(f.bpair)o.push('dono oont (bishop pair)');const hg=xHanging(S,w).filter(h=>h.gain>=1);if(hg.length)o.push(`latakta mohra: ${hg.map(h=>xs(h.p)+' '+sn(h.s)).join(', ')}`);return o};
      const lead=(a,b,t)=>a>b?`White ${t} me aage`:b>a?`Black ${t} me aage`:`${t} barabar`;
      V.pos={st:S,last:last[i],arr:[],hl:[...xHanging(S,true),...xHanging(S,false)].filter(h=>h.gain>=1).map(h=>sn(h.s))};
      sec('pos',`${m?'6. ':''}Position ka haal (dono taraf)`,`<ul class="xwhy"><li>Material: ${mat?`${mat>0?'White':'Black'} ${Math.abs(mat)} pyade jitna aage`:'barabar'}. ${esc(lead(fw.cen,fb.cen,'center'))}, ${esc(lead(fw.mob,fb.mob,'mohron ki activity'))} (${fw.mob} vs ${fb.mob} squares), ${esc(lead(fw.space,fb.space,'space'))}.</li>
        <li><b>${esc(sideName(true))}:</b> ${esc(side(true,fw).join('; '))}.</li><li><b>${esc(sideName(false))}:</b> ${esc(side(false,fb).join('; '))}.</li></ul><p class="muted" style="margin:4px 0 0">Board: peele square = latakte mohre.</p>`)}
    XL={P,i,m,A,D,V,lines:{best:best?best.pv.slice(0,8):[],game:m&&D.E1&&D.E1.lines[0]?D.E1.lines[0].pv.slice(0,7):[]},k:0,which:'best',on:null};
    return`<div class="card stack xp">${head}${secs.join('')}
      <div class="xsec"><div class="xsh"><b>Line chala kar dekho (◀ ▶)</b></div><div class="small"><div class="seg sm" style="margin:6px 0">${XL.lines.game.length?'<button data-xl="game">Is chaal ke baad</button>':''}${XL.lines.best.length?`<button data-xl="best">Best line${m?' (chaal se pehle)':''}</button>`:''}</div>
      <div class="row" style="justify-content:center"><button class="btn small" data-xs="-1">◀</button><span class="small" id="xlk"></span><button class="btn small" data-xs="1">▶</button></div><div class="small" id="xlc" style="min-height:2.6em"></div></div></div>
      <div class="row wrapr"><button class="btn small" data-xback="1">Board wapas is chaal par</button><button class="btn small" data-xclose="1">Explanation band karo</button></div>
      <div class="small muted">Tir: <span style="color:#2F6FD0">neela</span> = ye chaal, <span style="color:#1F9D5A">hara</span> = best / aapka plan, <span style="color:#B7791F">peela</span> = opponent, <span style="color:#D2462C">laal</span> = galti ya hamla. Number = chaal ka kram.</div></div>`}
  function xLineSet(which){if(!XL)return;XL.which=which;XL.k=0;document.querySelectorAll('[data-xl]').forEach(b=>b.classList.toggle('on',b.dataset.xl===which));xLineDraw(false)}
  function xLineDraw(draw=true){const pv=XL.lines[XL.which]||[];const s0=XL.which==='game'?XL.A:XL.P;let s=s0,lm=null;const sts=[s],ms=[];for(const u of pv){const mm=fromUci(s,u);if(!mm)break;ms.push(mm);s=make(s,mm);sts.push(s)}
    XL.k=Math.max(0,Math.min(ms.length,XL.k));const k=XL.k,st=sts[k];if(k)lm=[sn(ms[k-1].f),sn(ms[k-1].t)];const nx=ms[k];
    if(draw){B.last=lm||(XL.which==='game'&&XL.m?[sn(XL.m.f),sn(XL.m.t)]:B.last);B.set({st,arr:nx?[[sn(nx.f),sn(nx.t),st.w===XL.P.w?'g':'y',String(k+1)]]:[]})}
    const c=$('#xlc'),kk=$('#xlk');if(kk)kk.textContent=`${k}/${ms.length}`;
    if(c){if(!k)c.innerHTML=nx?`Shuruaat. Pehli chaal (tir 1): <b>${esc(xNum(sts[0],sanOf(sts[0],nx)))}</b>. ▶ dabao.`:'Line khali hai.';
      else{const pm=ms[k-1],ps=sts[k-1],I=xIdeas(ps,pm);
        c.innerHTML=`<b>${k}. ${esc(xNum(ps,sanOf(ps,pm)))}</b> (${esc(sideName(ps.w))}): ${esc((I.pos.slice(0,2).join(' aur ')||I.neg[0]||'position majboot karti hai'))}.${nx?' Agli chaal tir me.':' Line yahin tak.'}`}}}
  function xView(id,btn){if(!XL||!XL.V[id])return;const on=XL.on===id;document.querySelectorAll('[data-xv]').forEach(b=>b.classList.remove('on'));
    if(on){XL.on=null;B.last=last[cur];B.set({st:pos[cur],arr:[],hl:[]});return}
    XL.on=id;btn.classList.add('on');const v=XL.V[id];B.last=v.last;B.set({st:v.st,arr:v.arr,hl:v.hl||[]})}
  app.onclick=e=>{
    if(e.target.closest('[data-xp]')){explainHere();return}
    if(e.target.closest('[data-xclose]')){XOPEN=false;show(cur);return}
    const xt=e.target.closest('[data-xt]');if(xt){const el=$('#xt-'+xt.dataset.xt);if(el){el.hidden=!el.hidden;xt.classList.toggle('on',!el.hidden)}return}
    const xv=e.target.closest('[data-xv]');if(xv){xView(xv.dataset.xv,xv);window.scrollTo({top:Math.max(0,$('#gbd').getBoundingClientRect().top+scrollY-80),behavior:'smooth'});return}
    const xl=e.target.closest('[data-xl]');if(xl){xLineSet(xl.dataset.xl);xLineDraw();return}
    const xs2=e.target.closest('[data-xs]');if(xs2&&XL){XL.k+=+xs2.dataset.xs;xLineDraw();return}
    if(e.target.closest('[data-xback]')){if(XL)XL.on=null;document.querySelectorAll('[data-xv]').forEach(b=>b.classList.remove('on'));B.last=last[cur];B.set({st:pos[cur],arr:[],hl:[]});return}
    const rf=e.target.closest('[data-refute]');if(rf){const nx=cur?misBy[cur-1]:null;if(!nx||!nx.x)return;const A=pos[cur];const r=nx.x.ref.length?fromUci(A,nx.x.ref[0]):null;
      B.last=last[cur];B.set({st:A,arr:r?[[sn(r.f),sn(r.t),'y']]:[]});rf.textContent='Opponent ka jawab: peela tir';return}
    const n=e.target.closest('[data-nav]');if(n){const d=+n.dataset.nav;show(d===0?0:d===9999?pos.length-1:cur+d);return}
    const t=e.target.closest('[data-nav-to]');if(t){show(+t.dataset.navTo);return}const mm=e.target.closest('[data-mis]');if(mm){show(+mm.dataset.mis+1);window.scrollTo(0,0)}};
  show(cur)}
function anHTML(g){const a=g.an;return`<div class="card stack"><h3>Review: Accuracy ${a.acc}%</h3><p class="small">${a.cnt.blund} Blunder (??) · ${a.cnt.mist} Mistake (?) · ${a.cnt.inacc} Inaccuracy (?!)</p>
  ${a.mis.length?`<div class="qlist">${a.mis.map(x=>`<button class="qrow" style="text-align:left;font:inherit;color:inherit" data-mis="${x.ply}"><span class="qi">${x.cls==='blund'?'🟥':x.cls==='mist'?'🟧':'🟨'}</span><div class="qt"><b>${Math.floor(x.ply/2)+1}${x.ply%2?'...':'.'} ${esc(x.san)}${CLS[x.cls][1]}</b><div class="small muted">${x.x&&XTHEME[x.x.theme]?'<b>'+esc(XTHEME[x.x.theme][0])+'</b> · ':''}Khelna chahiye tha: <b>${esc(x.best)}</b> · ${x.before}% → ${x.after}%</div></div></button>`).join('')}</div>`:'<p>Koi badi galti nahi. Shabaash!</p>'}
  ${a.mis.some(x=>!x.x||x.x.v!==2)?'<button class="btn block" data-act="ganalyse">Review Again (nayi, poori explanation ke saath)</button>':''}
  ${a.cnt.blund+a.cnt.mist?`<p class="small muted">Mistake aur Blunder wali positions "Mistake Flashcards" mein aa gayi hain. Roz wapas aayengi jab tak 3 baar sahi na ho.</p><button class="btn primary block" data-go="#/run/flash">Drill These Mistakes Now</button>`:''}</div>`}
async function runAnalyse(){const id=(location.hash.split('/')[2]||'');const g=GAMES[id];if(!g)return;const box=$('#gan');
  box.innerHTML='<div class="card stack"><b>Stockfish review chal raha hai…</b><div class="bar"><i id="gpb" style="width:0%"></i></div><p class="small muted" id="gpt">Engine shuru ho raha hai</p></div>';
  try{await analyseGame(g,(i,n)=>{const b=$('#gpb'),t=$('#gpt');if(b)b.style.width=Math.round(i/n*100)+'%';if(t)t.textContent=`Position ${i}/${n}`});if(location.hash==='#/game/'+id)vGame(id)}
  catch(e){box.innerHTML=`<div class="card alert">${esc(e.message)}. Dobara try karo, ya "Open on Lichess" par analysis dekho.</div><button class="btn block" data-act="ganalyse">Try Again</button>`}}
function allPgn(){return gameList().map(g=>g.pgn||'').filter(Boolean).join('\n\n')}
document.addEventListener('click',async e=>{const a=e.target.closest('[data-act]');if(!a)return;const act=a.dataset.act;
  if(act==='ganalyse')runAnalyse();
  else if(act==='gsync'){const m=$('#gmsg');m.textContent='Lichess se la raha hoon…';try{const n=await syncGames();m.textContent=n?`${n} naye game aaye.`:'Koi naya game nahi.';if(n)vGames()}catch(x){m.textContent='Lichess tak nahi pahunch paya.'}}
  else if(act==='gpgn'){const b=new Blob([allPgn()],{type:'application/x-chess-pgn'});const u=URL.createObjectURL(b);const l=document.createElement('a');l.href=u;l.download='my-games.pgn';document.body.appendChild(l);l.click();l.remove();setTimeout(()=>URL.revokeObjectURL(u),2000)}
  else if(act==='gcopy'){const g=GAMES[location.hash.split('/')[2]];if(g)try{await navigator.clipboard.writeText(g.pgn);a.textContent='Copied'}catch(x){a.textContent='Copy nahi hua'}}});
