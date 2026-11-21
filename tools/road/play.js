/* ================= Lichess Play =================
   App ke andar Lichess par khelo (Board API + Challenge API). Board, rules aur move-check course.html ke code se.
   Lichess ka koi engine yahan explanation ke liye use nahi hota; "Play with the Computer" mein Lichess ka AI sirf opponent hai. */
const go=h=>{if(location.hash!==h)location.hash=h;else route()};
let GSTART=0,ME=null,EVC=null,CH=[],MSG='',SEEK=null,WAIT=null;
const lc=s=>(s||'').toLowerCase();
const PRESETS=[[10,0],[10,5],[15,10],[20,0],[30,0],[30,20]];
/* Lichess Board API: lobby seek sirf Rapid, Classical, Correspondence. Blitz sirf dost ko challenge aur computer ke saath. Bullet API se bilkul nahi. */
const seekOk=(min,inc)=>['rapid','classical'].includes(speedOf(min,inc));const challengeOk=(min,inc)=>speedOf(min,inc)!=='bullet'&&speedOf(min,inc)!=='ultraBullet';
const MINUTES=[0.25,0.5,0.75,1,1.5,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,25,30,35,40,45,60,75,90,105,120,135,150,165,180];
const INCS=[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,25,30,35,40,45,60,90,120,150,180];
const DAYS=[1,2,3,5,7,10,14];
/* Lichess ke saare variants. App ka board sirf Standard chess chalata hai; baaki variants ka game Lichess par khulta hai */
const VARIANTS={standard:'Standard',chess960:'Chess960',crazyhouse:'Crazyhouse',antichess:'Antichess',atomic:'Atomic',horde:'Horde',kingOfTheHill:'King of the Hill',racingKings:'Racing Kings',threeCheck:'Three-check'};
const fmtMin=m=>m===0.25?'¼':m===0.5?'½':m===0.75?'¾':m===1.5?'1½':String(m);
function speedOf(min,inc){const t=min*60+40*inc;return t<29?'ultraBullet':t<179?'bullet':t<479?'blitz':t<1499?'rapid':'classical'}
const SPNAME={ultraBullet:'UltraBullet',bullet:'Bullet',blitz:'Blitz',rapid:'Rapid',classical:'Classical',correspondence:'Correspondence'};
let CF=(()=>{try{return Object.assign({mode:'real',min:10,inc:5,days:2,rated:true,color:'random',rmin:-500,rmax:500,ai:3,variant:'standard'},JSON.parse(localStorage.getItem('lplay.cf')||'{}'))}catch(e){return{mode:'real',min:10,inc:5,days:2,rated:true,color:'random',rmin:-500,rmax:500,ai:3,variant:'standard'}}})();
const cfSave=()=>{try{localStorage.setItem('lplay.cf',JSON.stringify(CF))}catch(e){}};
const errText=e=>e.message==='expired'?'Lichess login purana ho gaya. Ek baar dobara Connect karo.':e.message==='noauth'?'Pehle Lichess Connect karo.':(e.name==='AbortError'?'':String(e.message||e));
function flash(t){MSG=t;const m=$('#msg');if(m){m.textContent=t;m.className='small'+(t?' errbox':'');m.scrollIntoView({block:'center',behavior:'smooth'})}}

/* ---------- account + event stream ---------- */
async function loadMe(){const r=await lapi('/api/account');if(!r.ok)throw new Error('Lichess error '+r.status);ME=await r.json();const c=$('#luser');if(c)c.textContent=ME.username;return ME}
let EVOPEN=null;
/* Lichess: pehle event stream khulna chahiye, phir seek; warna game start ka event chhoot sakta hai */
function startEvents(){if(EVC)return EVOPEN;EVC=new AbortController();let res;EVOPEN=new Promise(r=>{res=r;setTimeout(r,4000)});
  lstream('/api/stream/event',ev=>{
    if(ev.type==='gameStart'){GSTART=Date.now();RS=null;if(SEEK){SEEK.abort();SEEK=null}WAIT=null;const id=ev.game.gameId||ev.game.id;if(!location.hash.startsWith('#/game/'+id))go('#/game/'+id)}
    else if(ev.type==='challenge'){const c=ev.challenge;if(lc(c.challenger&&c.challenger.id)!==lc(ME&&ME.id)&&!CH.find(x=>x.id===c.id)){CH.push(c);if(isLobby())route()}}
    else if(ev.type==='challengeCanceled'||ev.type==='challengeDeclined'){const c=ev.challenge;CH=CH.filter(x=>x.id!==c.id);
      if(WAIT&&WAIT.id===c.id){WAIT=null;MSG=ev.type==='challengeDeclined'?`${(c.destUser&&c.destUser.name)||'Opponent'} ne challenge decline kiya${c.declineReason?': '+c.declineReason:''}.`:'Challenge cancel ho gaya.';go('#/')}
      else if(isLobby())route()}
  },{signal:EVC.signal,onOpen:()=>res()}).catch(e=>{EVC=null;res();if(e.name!=='AbortError')setTimeout(startEvents,5000)}).then(()=>{EVC=null})}
const isLobby=()=>!location.hash||location.hash==='#/'||location.hash==='#';

/* ---------- lobby ---------- */
function connectHTML(){const exp=lichNeedsReconnect();
  return`<div class="stack"><h1>Lichess Play</h1><p class="muted">Lichess ke players ke saath, dost ke saath, ya Lichess computer ke saath khelo. Saare options Lichess wale.</p>
  <div class="card stack"><h3>Lichess Connect</h3>${exp?'<p class="warn">Lichess ko ek baar dobara jodo (login purana ho gaya ya nayi permission chahiye).</p>':''}
  <p class="small muted">Ek baar jodo, phir app login yaad rakhega. Password Lichess ke apne page par daalna hai, app mein nahi.</p>
  <button class="btn primary block" data-act="lconnect">Connect Lichess</button>
  <a class="btn block" style="text-decoration:none;text-align:center" href="https://lichess.org/signup" target="_blank" rel="noopener">Create a Lichess Account</a>
  <p class="small" id="msg">${esc(window.__lmsg||'')}</p></div></div>`}
const sel=(id,arr,cur,lab)=>`<select id="${id}">${arr.map(v=>`<option value="${v}"${String(v)===String(cur)?' selected':''}>${lab?lab(v):v}</option>`).join('')}</select>`;
function perfChips(){const P=(ME&&ME.perfs)||{};return['bullet','blitz','rapid','classical','correspondence',...Object.keys(VARIANTS).filter(k=>k!=='standard')].filter(k=>P[k]&&(P[k].games||k in SPNAME)).map(k=>`<span class="chip">${SPNAME[k]||VARIANTS[k]} ${P[k].rating}${P[k].prov?'?':''}</span>`).join('')}
let LTK=0;
async function vLobby(){const app=$('#app');const tk=++LTK;
  if(!lichToken()){app.innerHTML=connectHTML();return}
  if(!ME){app.innerHTML='<p class="muted">Lichess se jud raha hoon…</p>';try{await loadMe()}catch(e){app.innerHTML=connectHTML();flash(errText(e));return}}
  startEvents();
  let playing=[];try{const r=await lapi('/api/account/playing');if(r.ok)playing=(await r.json()).nowPlaying||[]}catch(e){}
  try{const r=await lapi('/api/challenge');if(r.ok){const j=await r.json();(j.in||[]).forEach(c=>{if(!CH.find(x=>x.id===c.id))CH.push(c)})}}catch(e){}
  if(!isLobby()||tk!==LTK)return;
  if(MSG)window.scrollTo(0,0);
  const sp=CF.mode==='real'?speedOf(CF.min,CF.inc):'correspondence';
  app.innerHTML=`<div class="stack">
   <div class="row" style="justify-content:space-between;flex-wrap:wrap"><h1 style="margin:0">Lichess Play</h1><div class="chips" style="flex-wrap:wrap">${perfChips()}</div></div>
   <p class="small${MSG?' errbox':''}" id="msg">${esc(MSG)}</p>
   ${CH.length?`<h2>Incoming Challenges</h2><div class="qlist">${CH.map(c=>`<div class="qrow"><span class="qi">⚔️</span><div class="qt"><b>${esc(c.challenger?c.challenger.name:'?')} ${c.challenger&&c.challenger.rating?'('+c.challenger.rating+')':''}</b><div class="muted small">${esc(c.timeControl&&c.timeControl.show||c.speed||'')} · ${c.rated?'Rated':'Casual'} · ${esc(c.variant&&c.variant.name||'Standard')}</div></div><button class="btn small primary" data-act="acc" data-id="${c.id}">Accept</button><button class="btn small" data-act="dec" data-id="${c.id}">Decline</button></div>`).join('')}</div>`:''}
   ${playing.length?`<h2>Ongoing Games</h2><div class="qlist">${playing.map(g=>`<div class="qrow"><span class="qi">${g.isMyTurn?'🟢':'⏳'}</span><div class="qt"><b>vs ${esc(g.opponent&&g.opponent.username||'?')}</b><div class="muted small">${esc(SPNAME[g.speed]||g.speed||'')} · ${g.isMyTurn?'Your move':'Their move'}</div></div><button class="btn small primary" data-go="#/game/${g.gameId}">Open</button></div>`).join('')}</div>`:''}
   <h2>Quick Pairing</h2>
   <div class="row"><label class="tog"><input type="checkbox" id="qrated" ${CF.rated?'checked':''}> Rated</label></div>
   <div class="qgrid">${PRESETS.map(([m,i])=>`<button class="qp" data-act="quick" data-m="${m}" data-i="${i}"><b>${m}+${i}</b><small>${SPNAME[speedOf(m,i)]}</small></button>`).join('')}<button class="qp" data-act="custom"><b>Custom</b><small>Neeche</small></button></div>
   <h2 id="cg">Create a Game</h2>
   <div class="card stack form">
    <label>Variant ${sel('cvar',Object.keys(VARIANTS),CF.variant,v=>VARIANTS[v])}</label>${CF.variant!=='standard'?'<p class="small muted">'+VARIANTS[CF.variant]+' ka board app mein nahi hai: game milte hi Lichess par khulega (wahan login hona chahiye).</p>':''}
    <label>Time control ${sel('cmode',['real','corr','unlimited'],CF.mode,v=>({real:'Real time',corr:'Correspondence',unlimited:'Unlimited (sirf challenge)'}[v]))}</label>
    ${CF.mode==='real'?`<div class="row2"><label>Minutes per side ${sel('cmin',MINUTES,CF.min,fmtMin)}</label><label>Increment (sec) ${sel('cinc',INCS,CF.inc)}</label></div><p class="small muted">${SPNAME[sp]}</p>`:CF.mode==='corr'?`<label>Days per turn ${sel('cdays',DAYS,CF.days)}</label>`:''}
    <div class="seg" id="crated"><button data-v="0" class="${CF.rated?'':'on'}">Casual</button><button data-v="1" class="${CF.rated?'on':''}">Rated</button></div>
    <div class="seg" id="ccolor">${['white','random','black'].map(c=>`<button data-v="${c}" class="${CF.color===c?'on':''}">${c==='white'?'♔ White':c==='black'?'♚ Black':'🎲 Random'}</button>`).join('')}</div>
    <div class="row2"><label>Rating range: min ${sel('crmin',[-500,-450,-400,-350,-300,-250,-200,-150,-100,-50,0],CF.rmin,v=>v>0?'+'+v:v)}</label><label>max ${sel('crmax',[0,50,100,150,200,250,300,350,400,450,500],CF.rmax,v=>'+'+v)}</label></div>
    ${CF.mode==='real'&&!seekOk(CF.min,CF.inc)?`<p class="small errbox">${SPNAME[sp]}: Lichess apne API se ${challengeOk(CF.min,CF.inc)?'Blitz lobby game nahi banane deta. Blitz sirf dost ko challenge ya computer ke saath chalega':'Bullet bilkul nahi khelne deta (na lobby, na challenge)'}. Lobby game ke liye 8+0 ya usse lamba time chuno (Rapid).</p>`:''}
    <button class="btn primary block" data-act="seek" ${CF.mode==='unlimited'||(CF.mode==='real'&&!seekOk(CF.min,CF.inc))?'disabled':''}>Create Lobby Game</button>
    <div class="row"><input id="fuser" placeholder="Friend's Lichess username" autocomplete="off" autocapitalize="off"><button class="btn" data-act="friend">Challenge a Friend</button></div>
   </div>
   <h2>Play with the Computer</h2>
   <div class="card stack"><p class="small muted">Lichess ka computer (Stockfish), level 1 se 8. Time aur colour upar "Create a Game" wale use honge. Computer games hamesha casual.</p>
    <div class="lvgrid">${[1,2,3,4,5,6,7,8].map(l=>`<button class="qp${CF.ai===l?' on':''}" data-act="ailvl" data-l="${l}"><b>${l}</b></button>`).join('')}</div>
    <button class="btn primary block" data-act="ai">Play Level ${CF.ai}</button></div>
   <div class="card stack small"><b>Lichess account</b><span class="muted">Connected: ${esc(ME.username)}</span><div class="row"><a class="btn small" style="text-decoration:none" href="https://lichess.org/@/${encodeURIComponent(ME.username)}" target="_blank" rel="noopener">Profile on Lichess</a><button class="btn small" data-act="lout">Disconnect</button></div></div>
  </div>`;MSG=''}
function readForm(){const v=id=>{const e=$('#'+id);return e?e.value:null};
  if(v('cmode'))CF.mode=v('cmode');if(v('cmin'))CF.min=+v('cmin');if(v('cinc'))CF.inc=+v('cinc');if(v('cdays'))CF.days=+v('cdays');if(v('crmin'))CF.rmin=+v('crmin');if(v('crmax'))CF.rmax=+v('crmax');cfSave()}
function clockParams(forChallenge){if(CF.mode==='real')return forChallenge?{'clock.limit':Math.round(CF.min*60),'clock.increment':CF.inc}:{time:CF.min,increment:CF.inc};if(CF.mode==='corr')return{days:CF.days};return{}}

/* ---------- seek, challenge, AI ---------- */
async function startSeek(params,label){const app=$('#app');const mine=new AbortController();SEEK=mine;const t0=Date.now();
  app.innerHTML=`<div class="stack center"><div class="big">🔎</div><h1>Searching</h1><p>${esc(label)}</p><p class="muted small">Opponent milte hi game khul jayega.</p><button class="btn block" data-act="cancelseek">Cancel</button><p class="small" id="msg"></p></div>`;
  window.scrollTo(0,0);await startEvents();if(SEEK!==mine)return;
  try{/* real-time seek: jawab stream hota hai; connection khula rakhna zaroori, band hua to seek cancel */
    await lstream('/api/board/seek',()=>{},{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(params),signal:mine.signal});
    if(SEEK!==mine)return;SEEK=null;
    if(params.days){MSG='Correspondence seek lobby mein lag gaya. Koi join karega to game "Ongoing Games" mein aayega.';go('#/');return}
    setTimeout(()=>{if(GSTART<t0&&!location.hash.startsWith('#/game/')){MSG='Seek khatam ho gaya, koi opponent nahi mila. Dobara try karo.';go('#/')}},2500)}
  catch(e){if(SEEK===mine)SEEK=null;if(e.name==='AbortError')return;MSG='Lichess ne mana kiya: '+errText(e);go('#/')}}
function seekParams(){const P={rated:CF.rated,variant:CF.variant,...clockParams(false)};if(CF.color!=='random')P.color=CF.color;
  const sp=CF.variant!=='standard'?CF.variant:CF.mode==='real'?speedOf(CF.min,CF.inc):'correspondence';const my=ME&&ME.perfs&&ME.perfs[sp]&&ME.perfs[sp].rating;
  if(my&&(CF.rmin>-500||CF.rmax<500))P.ratingRange=Math.max(400,my+CF.rmin)+'-'+(my+CF.rmax);return P}
const seekLabel=()=>(CF.variant!=='standard'?VARIANTS[CF.variant]+' · ':'')+(CF.mode==='real'?`${fmtMin(CF.min)}+${CF.inc} ${SPNAME[speedOf(CF.min,CF.inc)]} · ${CF.rated?'Rated':'Casual'}`:`${CF.days} day(s) per move · ${CF.rated?'Rated':'Casual'}`);
async function challengeFriend(user){const P={rated:CF.rated,variant:CF.variant,color:CF.color,...clockParams(true)};
  try{const r=await lform('/api/challenge/'+encodeURIComponent(user),P);const j=await r.json();const c=j.challenge||j;WAIT={id:c.id,user};startEvents();
    $('#app').innerHTML=`<div class="stack center"><div class="big">⚔️</div><h1>Challenge sent</h1><p>${esc(user)} ke accept karne ka intezaar…</p><p class="small muted">Dost ko Lichess par notification jayega. Link bhi bhej sakte ho:</p><p class="mono small" style="word-break:break-all">${esc(c.url||('https://lichess.org/'+c.id))}</p><button class="btn block" data-act="copy" data-v="${esc(c.url||('https://lichess.org/'+c.id))}">Copy Link</button><button class="btn block" data-act="cancelch" data-id="${c.id}">Cancel Challenge</button></div>`}
  catch(e){flash('Lichess: '+errText(e))}}
async function playAI(){const P={level:CF.ai,variant:CF.variant,color:CF.color,...clockParams(true)};
  try{const r=await lform('/api/challenge/ai',P);const j=await r.json();go('#/game/'+j.id)}catch(e){flash('Lichess: '+errText(e))}}


/* ---------- Road to 3000 mode: game hamesha Rated, opponent aapki rating ke aas-paas ---------- */
const ROAD_TC=[[10,0],[15,10]],ROAD_RANGE=[100,150,200];let RS=null;
const myRapid=()=>{const r=ME&&ME.perfs&&ME.perfs.rapid;return r&&r.rating||1500};
async function vRoad(){const app=$('#app');window.scrollTo(0,0);
  if(!lichToken()){app.innerHTML=connectHTML();return}
  if(!ME){app.innerHTML='<p class="muted">Lichess se jud raha hoon…</p>';try{await loadMe()}catch(e){app.innerHTML=connectHTML();flash(errText(e));return}}
  startEvents();const my=myRapid(),pv=ME.perfs&&ME.perfs.rapid&&ME.perfs.rapid.prov;
  app.innerHTML=`<div class="stack"><p class="eyebrow">Road to 3000</p><h1>Rated Game</h1>
   <div class="card stack"><p><b>Lichess rapid: ${my}${pv?'?':''}</b></p><p class="small muted">Road to 3000 mein game hamesha <b>Rated</b> hota hai, aur opponent aapki rating ke aas-paas (pehle ±100; match na mile to ±150, phir ±200). Casual ya apni range chunne ka option yahan nahi hai.</p></div>
   <p class="small${MSG?' errbox':''}" id="msg">${esc(MSG)}</p>
   <div class="qgrid" style="grid-template-columns:1fr 1fr">${ROAD_TC.map(([m,i])=>`<button class="qp" data-act="roadseek" data-m="${m}" data-i="${i}"><b>${m}+${i}</b><small>Rapid · Rated</small></button>`).join('')}</div>
   <p class="small muted">Game ke baad Road to 3000 app mein "My Games" se uska review (Stockfish, sirf game ke baad) aur galtiyon ke drills milenge.</p>
   <button class="btn block" onclick="location.href='road.html'">‹ Back to Road to 3000</button>
   <button class="btn block" data-go="#/">All Lichess Options (variants, casual, friends, computer) ›</button></div>`;MSG=''}
async function roadSeek(m,i){const my=myRapid();RS={k:0};const app=$('#app');window.scrollTo(0,0);
  while(RS){const w=ROAD_RANGE[RS.k];const t0=Date.now();
    app.innerHTML=`<div class="stack center"><div class="big">🔎</div><h1>Searching</h1><p>${m}+${i} Rapid · Rated</p><p class="small muted">Opponent rating ${Math.max(400,my-w)}-${my+w}${RS.k?' (range badhayi, match nahi mila tha)':''}</p><button class="btn block" data-act="cancelseek">Cancel</button><p class="small" id="msg"></p></div>`;
    await startEvents();if(!RS)return;
    const mine=new AbortController();SEEK=mine;let widen=false;const t=RS.k<ROAD_RANGE.length-1?setTimeout(()=>{widen=true;mine.abort()},45000):null;
    try{await lstream('/api/board/seek',()=>{},{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({rated:true,time:m,increment:i,variant:'standard',ratingRange:Math.max(400,my-w)+'-'+(my+w)}),signal:mine.signal});
      clearTimeout(t);if(SEEK===mine)SEEK=null;await new Promise(r=>setTimeout(r,2500));if(!RS||GSTART>=t0)return;/* seek expire: range badhao */if(RS.k<ROAD_RANGE.length-1)RS.k++;continue}
    catch(e){clearTimeout(t);if(SEEK===mine)SEEK=null;if(widen&&RS){RS.k++;continue}const run=!!RS;RS=null;if(run&&e.name!=='AbortError'){MSG='Lichess ne mana kiya: '+errText(e);go('#/road')}return}}}

/* ---------- game ---------- */
let G=null;
function posFrom(fen,moves){let st=parseFEN(!fen||fen==='startpos'?START_FEN:fen);const sans=[];let last=null;for(const u of moves){const m=fromUci(st,u);if(!m)break;sans.push(sanOf(st,m));last=[sn(m.f),sn(m.t)];st=make(st,m)}return{st,sans,last}}
const fmtClock=ms=>{if(ms==null)return'--';if(ms>=864e5)return Math.floor(ms/864e5)+'d';const s=Math.max(0,Math.ceil(ms/1000));const h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;return(h?h+':'+String(m).padStart(2,'0'):m)+':'+String(x).padStart(2,'0')};
const STATUS={mate:'Checkmate',resign:'Resigned',stalemate:'Stalemate',timeout:'Timeout',draw:'Draw',outoftime:'Time out',cheat:'Cheat detected',noStart:'Game did not start',aborted:'Aborted',unknownFinish:'Finished',variantEnd:'Variant end'};
function vGame(id){const app=$('#app');if(!lichToken()){app.innerHTML=connectHTML();return}
  if(G&&G.id!==id&&G.ac)G.ac.abort();
  G={id,ac:new AbortController(),full:null,state:null,chat:[],gone:null,at:Date.now(),busy:false};
  app.innerHTML=`<div class="stack gamev"><div class="pl" id="ptop"></div><div id="bd"></div><div class="pl" id="pbot"></div>
   <div class="moves" id="mv"></div><div class="row wrapr" id="ctl"></div><p class="small" id="msg"></p>
   <details class="card"><summary><b>Chat</b></summary><div id="chat" class="chatlog small"></div><div class="row"><input id="chatin" placeholder="Message" maxlength="140"><button class="btn small" data-act="chat">Send</button></div></details></div>`;
  G.B=Board($('#bd'),{st:parseFEN(START_FEN),onMove:m=>myMove(m)});
  (async()=>{if(!ME)try{await loadMe()}catch(e){}startEvents();
    lstream('/api/board/game/stream/'+id,ev=>{if(!G||G.id!==id)return;
      if(ev.type==='gameFull'){G.full=ev;G.state=ev.state;G.at=Date.now();drawGame()}
      else if(ev.type==='gameState'){G.state=ev;G.at=Date.now();G.busy=false;drawGame()}
      else if(ev.type==='chatLine'){G.chat.push(ev);drawChat()}
      else if(ev.type==='opponentGone'){G.gone=ev;drawControls()}},{signal:G.ac.signal}).catch(e=>{const t=errText(e);if(t)flash('Lichess: '+t)})})();
  clearInterval(window.__clk);window.__clk=setInterval(()=>{if(G&&G.full)drawClocks()},250)}
function myColor(){const f=G.full;if(!f||!ME)return'w';return lc(f.black&&f.black.id)===lc(ME.id)?'b':'w'}
function pname(p){if(!p)return'?';if(p.aiLevel)return'Lichess AI level '+p.aiLevel;return(p.title?p.title+' ':'')+(p.name||p.id||'?')+(p.rating?' ('+p.rating+(p.provisional?'?':'')+')':'')}
function drawGame(){const f=G.full,s=G.state;if(!f||!s)return;const mc=myColor();
  const vk=f.variant&&f.variant.key||'standard';if(vk!=='standard'&&vk!=='fromPosition'){const opp=mc==='w'?f.black:f.white;
    if(!$('#vcard')){$('#bd').innerHTML=`<div class="card stack center" id="vcard"><div class="big">♞</div><h2>${esc(VARIANTS[vk]||f.variant.name||vk)}</h2><p>vs ${esc(pname(opp))} · ${mc==='w'?'Aap White ho':'Aap Black ho'}</p><p class="small muted">Is variant ke rules app ke board mein nahi hain, isliye game Lichess par khelo. Resign, draw aur chat yahan se bhi chalenge.</p><a class="btn primary block" style="text-decoration:none" href="https://lichess.org/${G.id}" target="_blank" rel="noopener">Play on Lichess</a></div>`}
    G.over=s.status!=='started'&&s.status!=='created';G.n=(s.moves||'').split(' ').filter(Boolean).length;G.st={w:G.n%2===0};
    $('#ptop').innerHTML=`<span>${esc(pname(opp))}</span><span class="clock" id="ctop"></span>`;$('#pbot').innerHTML=`<span>${esc(pname(mc==='w'?f.white:f.black))}</span><span class="clock" id="cbot"></span>`;
    $('#mv').innerHTML=`<span class="muted">${esc(VARIANTS[vk]||vk)} · ${f.rated?'Rated':'Casual'} · ${G.n} chaalein</span>`;drawClocks();drawControls();return}const moves=(s.moves||'').split(' ').filter(Boolean);
  const P=posFrom(f.initialFen,moves);G.st=P.st;G.n=moves.length;G.over=s.status!=='started'&&s.status!=='created';
  G.B.last=P.last;G.B.clear();G.B.lock=G.over||(P.st.w?'w':'b')!==mc;G.B.set({st:P.st,side:mc,persp:mc});
  const opp=mc==='w'?f.black:f.white,me=mc==='w'?f.white:f.black;
  $('#ptop').innerHTML=`<span>${esc(pname(opp))}</span><span class="clock" id="ctop"></span>`;$('#pbot').innerHTML=`<span>${esc(pname(me))}</span><span class="clock" id="cbot"></span>`;
  $('#mv').innerHTML=P.sans.map((x,k)=>(k%2===0?`<span class="mn">${k/2+1}.</span> `:'')+esc(x)).join(' ')||`<span class="muted">${f.rated?'Rated':'Casual'} · ${esc(SPNAME[f.speed]||f.speed||'')} · ${mc==='w'?'Aap White ho':'Aap Black ho'}</span>`;
  drawClocks();drawControls()}
function clockNow(){const s=G.state,f=G.full;if(!s||s.wtime==null||!f.clock)return null;let w=s.wtime,b=s.btime;
  if(!G.over&&G.n>=2){const el=Date.now()-G.at;if(G.st.w)w-=el;else b-=el}return{w,b}}
function drawClocks(){const c=clockNow(),mc=myColor();const t=$('#ctop'),b=$('#cbot');if(!t||!b)return;
  if(!c){const d=G.full&&G.full.daysPerTurn;t.textContent=b.textContent=d?d+'d/move':'';return}
  const mine=mc==='w'?c.w:c.b,theirs=mc==='w'?c.b:c.w;t.textContent=fmtClock(theirs);b.textContent=fmtClock(mine);
  t.classList.toggle('run',!G.over&&G.n>=2&&(G.st.w?'w':'b')!==mc);b.classList.toggle('run',!G.over&&G.n>=2&&(G.st.w?'w':'b')===mc);b.classList.toggle('low',mine<20000)}
function drawControls(){const el=$('#ctl');if(!el||!G.state)return;const s=G.state,mc=myColor(),f=G.full;let h='';
  const oppDraw=mc==='w'?s.bdraw:s.wdraw,oppTb=mc==='w'?s.btakeback:s.wtakeback,myDraw=mc==='w'?s.wdraw:s.bdraw;
  if(G.over){const win=s.winner?(s.winner===(mc==='w'?'white':'black')?'Aap jeete':'Aap haare'):'Draw';
    h=`<div class="card stack" style="width:100%"><b>${esc(STATUS[s.status]||s.status)} · ${win}</b><div class="row wrapr"><button class="btn primary" data-act="rematch">Rematch</button><a class="btn" style="text-decoration:none" href="road.html#/game/${G.id}">Review in Road to 3000</a><a class="btn" style="text-decoration:none" href="https://lichess.org/${G.id}" target="_blank" rel="noopener">Open on Lichess</a><button class="btn" data-go="#/">New Game</button></div></div>`}
  else{if(oppDraw)h+=`<span class="offer">Draw offer: <button class="btn small primary" data-act="draw-yes">Accept</button><button class="btn small" data-act="draw-no">Decline</button></span>`;
    if(oppTb)h+=`<span class="offer">Takeback request: <button class="btn small primary" data-act="tb-yes">Accept</button><button class="btn small" data-act="tb-no">Decline</button></span>`;
    if(G.n<2)h+=`<button class="btn small" data-act="abort">Abort</button>`;
    else{h+=`<button class="btn small" data-act="resign">Resign</button>`;if(!oppDraw)h+=`<button class="btn small" data-act="draw-yes" ${myDraw?'disabled':''}>${myDraw?'Draw offered':'Offer Draw'}</button>`;if(!f.rated||!f.white.aiLevel)h+=`<button class="btn small" data-act="tb-yes">Takeback</button>`}
    if(G.gone&&G.gone.gone)h+=G.gone.claimWinInSeconds===0?`<button class="btn small primary" data-act="claim">Claim Victory</button>`:`<span class="small muted">Opponent chala gaya. ${G.gone.claimWinInSeconds||''}s mein jeet claim kar sakte ho.</span>`}
  el.innerHTML=h}
function drawChat(){const c=$('#chat');if(c)c.innerHTML=G.chat.slice(-30).map(l=>`<div><b>${esc(l.username)}:</b> ${esc(l.text)}</div>`).join('')}
async function myMove(m){if(!G||G.over)return;const u=uciOf(m);const before=G.st;G.B.last=[sn(m.f),sn(m.t)];G.B.lock=true;G.B.set({st:make(G.st,m)});
  try{await lform(`/api/board/game/${G.id}/move/${u}`)}catch(e){flash('Chaal nahi gayi: '+errText(e));G.B.set({st:before});G.B.lock=false}}
async function gameAct(path,okMsg){try{await lform(`/api/board/game/${G.id}/${path}`);if(okMsg)flash(okMsg)}catch(e){flash('Lichess: '+errText(e))}}
async function rematch(){const f=G.full;const mc=myColor();const opp=mc==='w'?f.black:f.white;const col=mc==='w'?'black':'white';
  const clk=f.clock?{'clock.limit':Math.round(f.clock.initial/1000),'clock.increment':Math.round(f.clock.increment/1000)}:f.daysPerTurn?{days:f.daysPerTurn}:{};
  try{if(opp.aiLevel){const r=await lform('/api/challenge/ai',{level:opp.aiLevel,color:col,...clk});const j=await r.json();go('#/game/'+j.id)}
    else{CF.rated=!!f.rated;CF.color=col;await challengeFriendRaw(opp.id||opp.name,{rated:!!f.rated,color:col,...clk})}}catch(e){flash('Lichess: '+errText(e))}}
async function challengeFriendRaw(user,P){const r=await lform('/api/challenge/'+encodeURIComponent(user),P);const j=await r.json();const c=j.challenge||j;WAIT={id:c.id,user};
  $('#app').innerHTML=`<div class="stack center"><div class="big">🔁</div><h1>Rematch sent</h1><p>${esc(user)} ke accept karne ka intezaar…</p><button class="btn block" data-act="cancelch" data-id="${c.id}">Cancel</button></div>`}

/* ---------- router + clicks ---------- */
window.addEventListener('hashchange',route);
function navOn(){const h=location.hash||'#/';const bs=[...document.querySelectorAll('nav.tabs button[data-go]')];const hit=bs.find(b=>b.dataset.go===h)||bs.find(b=>h.startsWith(b.dataset.go+'/')&&b.dataset.go!=='#/')||bs[0];bs.forEach(b=>b.classList.toggle('on',b===hit))}
function route(){navOn();const p=(location.hash||'#/').slice(2).split('/');if(p[0]!=='game'&&G){if(G.ac)G.ac.abort();G=null;clearInterval(window.__clk)}
  if(p[0]==='game'&&p[1])vGame(p[1]);else if(p[0]==='road')vRoad();else vLobby()}
document.addEventListener('change',e=>{const t=e.target;if(t.id==='qrated'){CF.rated=t.checked;cfSave()}else if(t.id==='cvar'){CF.variant=t.value;cfSave();vLobby()}else if(['cmode','cmin','cinc','cdays','crmin','crmax'].includes(t.id)){readForm();if(t.id==='cmode'||t.id==='cmin'||t.id==='cinc')vLobby()}});
document.addEventListener('click',async e=>{const g=e.target.closest('[data-go]');if(g){e.preventDefault();go(g.dataset.go);return}
  const sg=e.target.closest('.seg button');if(sg){const id=sg.parentElement.id;if(id==='crated')CF.rated=sg.dataset.v==='1';if(id==='ccolor')CF.color=sg.dataset.v;cfSave();sg.parentElement.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b===sg));const q=$('#qrated');if(q)q.checked=CF.rated;return}
  const a=e.target.closest('[data-act]');if(!a)return;const act=a.dataset.act;
  if(act==='lconnect')lichConnect();
  else if(act==='lout'){await lichDisconnect();ME=null;if(EVC)EVC.abort();EVC=null;route()}
  else if(act==='quick'){CF.mode='real';CF.min=+a.dataset.m;CF.inc=+a.dataset.i;cfSave();const P={rated:CF.rated,time:CF.min,increment:CF.inc,variant:CF.variant};startSeek(P,(CF.variant!=='standard'?VARIANTS[CF.variant]+' · ':'')+`${CF.min}+${CF.inc} ${SPNAME[speedOf(CF.min,CF.inc)]} · ${CF.rated?'Rated':'Casual'}`)}
  else if(act==='custom'){const c=$('#cg');if(c)c.scrollIntoView({behavior:'smooth'})}
  else if(act==='seek'){readForm();startSeek(seekParams(),seekLabel())}
  else if(act==='friend'){readForm();const u=($('#fuser').value||'').trim();if(!u){flash('Dost ka Lichess username likho.');return}challengeFriend(u)}
  else if(act==='ailvl'){CF.ai=+a.dataset.l;cfSave();vLobby()}
  else if(act==='ai'){readForm();playAI()}
  else if(act==='cancelseek'){const wasRoad=!!RS;RS=null;if(SEEK)SEEK.abort();SEEK=null;go(wasRoad?'#/road':'#/')}
  else if(act==='roadseek')roadSeek(+a.dataset.m,+a.dataset.i);
  else if(act==='cancelch'){try{await lform('/api/challenge/'+a.dataset.id+'/cancel')}catch(e){}WAIT=null;go('#/')}
  else if(act==='acc'){try{await lform('/api/challenge/'+a.dataset.id+'/accept');CH=CH.filter(x=>x.id!==a.dataset.id)}catch(e){flash('Lichess: '+errText(e))}}
  else if(act==='dec'){try{await lform('/api/challenge/'+a.dataset.id+'/decline');CH=CH.filter(x=>x.id!==a.dataset.id);vLobby()}catch(e){flash('Lichess: '+errText(e))}}
  else if(act==='copy'){try{await navigator.clipboard.writeText(a.dataset.v);a.textContent='Copied'}catch(e){}}
  else if(G){if(act==='resign')gameAct('resign');else if(act==='abort')gameAct('abort');else if(act==='draw-yes')gameAct('draw/yes','Draw offer bheja.');else if(act==='draw-no')gameAct('draw/no');
    else if(act==='tb-yes')gameAct('takeback/yes','Takeback request bheji.');else if(act==='tb-no')gameAct('takeback/no');else if(act==='claim')gameAct('claim-victory');else if(act==='rematch')rematch();
    else if(act==='chat'){const i=$('#chatin');const t=(i.value||'').trim();if(t){i.value='';try{await lform(`/api/board/game/${G.id}/chat`,{room:'player',text:t})}catch(e){flash('Lichess: '+errText(e))}}}}});
lichReturn().then(()=>route());
