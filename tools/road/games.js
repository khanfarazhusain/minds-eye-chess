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
function engEval(fen,ms){return new Promise(res=>{const lines=[];ENG.cb=l=>{
  if(l.startsWith('info ')&&l.includes(' pv ')&&!/ (lower|upper)bound/.test(l)){const g=k=>{const m=l.match(new RegExp(' '+k+' (-?\\d+)'));return m?+m[1]:null};
    const mp=g('multipv')||1,mate=g('mate');lines[mp-1]={cp:mate!=null?null:g('cp'),mate,pv:l.split(' pv ')[1].trim().split(/\s+/)}}
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
  app.innerHTML=`<div class="stack"><button class="btn small" data-go="#/">‹ Today's Work</button><h1>My Games</h1>
   <p class="muted small">Aapke rated Lichess games (rapid/classical). Har game ki chaalein PGN mein save hoti hain. Review mein Stockfish batata hai kahan galti hui aur kya khelna chahiye tha (sirf game ke baad). Galtiyan "Mistake Flashcards" mein wapas aati rahengi.</p>
   <div class="row"><button class="btn" data-act="gsync">Lichess se laao</button>${L.length?'<button class="btn" data-act="gpgn">Download PGN</button>':''}</div><p class="small" id="gmsg"></p>
   ${L.length?`<div class="qlist">${L.map(gameRow).join('')}</div>`:'<div class="card">Abhi koi game nahi. Lichess par rated rapid game khelo, phir "Lichess se laao" dabao.</div>'}</div>`}
function vGame(id){const app=$('#app');let g=GAMES[id];
  if(!g){app.innerHTML='<p class="muted">Game la raha hoon…</p>';fetchGame(id).then(()=>{if(location.hash==='#/game/'+id)vGame(id)}).catch(e=>{app.innerHTML=`<div class="card">${esc(e.message)}</div><button class="btn block" data-go="#/games">‹ My Games</button>`});return}
  const sans=g.moves.split(' ').filter(Boolean);const pos=[parseFEN(g.fen||START_FEN)],last=[null];
  for(const x of sans){const st=pos[pos.length-1];const m=findMove(st,x);if(!m)break;last.push([sn(m.f),sn(m.t)]);pos.push(make(st,m))}
  let cur=pos.length-1;const a=g.an;const misBy={};(a?a.mis:[]).forEach(x=>misBy[x.ply]=x);
  app.innerHTML=`<div class="stack"><button class="btn small" data-go="#/games">‹ My Games</button>
   <p class="eyebrow">${esc(RESN[g.res]||g.res)} · ${g.color==='w'?'White':'Black'} · ${esc(g.speed||'')} ${g.rated?'Rated':''}</p><h2 style="margin:0">vs ${esc(g.opp)} (${g.oppR})</h2><p class="small muted">${esc(g.open)}</p>
   <div id="gbd"></div><div class="row" style="justify-content:center"><button class="btn small" data-nav="0">⏮</button><button class="btn small" data-nav="-1">◀</button><span class="small" id="gply"></span><button class="btn small" data-nav="1">▶</button><button class="btn small" data-nav="9999">⏭</button></div>
   <div id="gnote"></div><div class="moves" id="gmv"></div>
   <div id="gan">${a?anHTML(g):`<button class="btn primary block" data-act="ganalyse">Review this game (Stockfish)</button><p class="small muted">Phone par 30-60 second lagenge. Engine sirf is review ke liye, course mein nahi.</p>`}</div>
   <div class="row wrapr"><button class="btn small" data-act="gcopy">Copy PGN</button><a class="btn small" style="text-decoration:none" href="https://lichess.org/${g.id}" target="_blank" rel="noopener">Open on Lichess</a></div></div>`;
  const B=Board($('#gbd'),{st:pos[cur],persp:g.color});
  function show(i){cur=Math.max(0,Math.min(pos.length-1,i));const mi=misBy[cur];B.last=last[cur];B.set({st:pos[cur],arr:mi?[]:null});
    const nx=misBy[cur];$('#gply').textContent=cur?`${Math.ceil(cur/2)}${cur%2?'.':'...'} ${sans[cur-1]}`:'Start';
    $('#gnote').innerHTML=nx?noteHTML(nx,cur):'';
    if(nx){const arr=[];const pm=findMove(pos[cur],nx.san);if(pm)arr.push([sn(pm.f),sn(pm.t),'r']);const m=findMove(pos[cur],nx.best);if(m)arr.push([sn(m.f),sn(m.t),'g']);B.set({arr})}
    $('#gmv').innerHTML=sans.map((x,k)=>{const mk=misBy[k];return(k%2===0?`<span class="mn">${k/2+1}.</span> `:'')+`<span class="mvx${k+1===cur?' on':''}${mk?' '+mk.cls:''}" data-nav-to="${k+1}">${esc(x)}${mk?CLS[mk.cls][1]:''}</span>`}).join(' ')}
  function noteHTML(nx,cur){const X=nx.x,num=`${Math.floor(nx.ply/2)+1}${nx.ply%2?'...':'.'}`;
  const head=`<b>${num} ${esc(nx.san)}${CLS[nx.cls][1]} ${CLS[nx.cls][0]}</b>`;
  if(!X)return`<div class="card ${nx.cls==='inacc'?'':'alert'}">${head}<div class="small">Behtar tha: <b>${esc(nx.best)}</b> (${nx.ev}). Line: ${esc(nx.line)}<br>Jeet ka chance ${nx.before}% → ${nx.after}%</div><p class="small muted">Is game ka review purane version se hai. "Review Again" dabao to har galti ki wajah bhi milegi.</p></div>`;
  const th=XTHEME[X.theme];
  return`<div class="card stack ${nx.cls==='inacc'?'':'alert'}">${head}
   <div class="small"><b>Kyun galat:</b></div><ul class="xwhy small">${X.why.map(t=>`<li>${md(t).replace(/^<p>|<\/p>$/g,'')}</li>`).join('')}</ul>
   <div class="small"><b>Kya khelna chahiye tha:</b> ${esc(X.bestSan)} (${nx.ev})${X.bestWhy?' – ye chaal '+esc(X.bestWhy):''}<br><span class="muted">Best line: ${esc(X.bestLine)}</span></div>
   <div class="small">${X.loss!=null?`Nuksaan: lagbhag <b>${xPawns(X.loss)}</b> · `:''}Jeet ka chance ${nx.before}% → ${nx.after}%</div>
   <div class="small muted">Board: <span style="color:#D2462C">laal tir</span> = tumhari chaal, <span style="color:#1F9D5A">hara tir</span> = behtar chaal.</div>
   <div class="row wrapr">${X.ref.length?'<button class="btn small" data-refute="1">Opponent ka jawab dikhao</button>':''}${th?`<button class="btn small primary" data-go="#/run/th/${th[1]}">${esc(th[0])} Drill ›</button>`:''}</div></div>`}
/* galti wali chaal par jao: board us chaal se PEHLE ki position dikhata hai, tir = behtar chaal */
  app.onclick=e=>{const rf=e.target.closest('[data-refute]');if(rf){const nx=misBy[cur];if(!nx||!nx.x)return;const A=pos[cur+1];const r=nx.x.ref.length?fromUci(A,nx.x.ref[0]):null;
      B.last=last[cur+1];B.set({st:A,arr:r?[[sn(r.f),sn(r.t),'r']]:[]});rf.textContent='Opponent ka jawab: laal tir';return}
    const n=e.target.closest('[data-nav]');if(n){const d=+n.dataset.nav;show(d===0?0:d===9999?pos.length-1:cur+d);return}
    const t=e.target.closest('[data-nav-to]');if(t){show(+t.dataset.navTo);return}const mm=e.target.closest('[data-mis]');if(mm){show(+mm.dataset.mis);window.scrollTo(0,0)}};
  show(cur)}
function anHTML(g){const a=g.an;return`<div class="card stack"><h3>Review: Accuracy ${a.acc}%</h3><p class="small">${a.cnt.blund} Blunder (??) · ${a.cnt.mist} Mistake (?) · ${a.cnt.inacc} Inaccuracy (?!)</p>
  ${a.mis.length?`<div class="qlist">${a.mis.map(x=>`<button class="qrow" style="text-align:left;font:inherit;color:inherit" data-mis="${x.ply}"><span class="qi">${x.cls==='blund'?'🟥':x.cls==='mist'?'🟧':'🟨'}</span><div class="qt"><b>${Math.floor(x.ply/2)+1}${x.ply%2?'...':'.'} ${esc(x.san)}${CLS[x.cls][1]}</b><div class="small muted">${x.x&&XTHEME[x.x.theme]?'<b>'+esc(XTHEME[x.x.theme][0])+'</b> · ':''}Khelna chahiye tha: <b>${esc(x.best)}</b> · ${x.before}% → ${x.after}%</div></div></button>`).join('')}</div>`:'<p>Koi badi galti nahi. Shabaash!</p>'}
  ${a.mis.some(x=>!x.x)?'<button class="btn block" data-act="ganalyse">Review Again (har galti ki wajah ke saath)</button>':''}
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
