/* ================= Road to 3000 (rated program) =================
   course.html ka chess code, board aur step player isi page mein (build.js se) aate hain.
   Yahan sirf naya program hai: levels, Lichess rating gates, roz ka quota, puzzle bank, galti-theme repeat. */
const SK='mindseye.road.v1',SEENK='mindseye.road.seen';
const PREVIEW=/[?&]preview=1/.test(location.search);
const SDEF=()=>({v:1,user:'',lich:null,lvl:1,tests:{},pr:0,day:{d:''},cards:{},gm:{},games:{d:'',n:0,wk:'',wn:0},hist:[]});
let SP=(()=>{try{const j=JSON.parse(localStorage.getItem(SK)||'null');if(j&&j.v===1)return Object.assign(SDEF(),j)}catch(e){}return SDEF()})();
function ssave(){try{localStorage.setItem(SK,JSON.stringify(SP))}catch(e){}}
let SEEN=new Set();try{(localStorage.getItem(SEENK)||'').split(',').forEach(x=>x&&SEEN.add(x))}catch(e){}
function seenSave(){try{localStorage.setItem(SEENK,[...SEEN].join(','))}catch(e){}}
const LV=n=>ROAD_LEVELS[n-1];
const CUR=()=>LV(SP.lvl);

/* ---------- naye lessons ko index karo (purane COURSE wale already STEPS mein hain) ---------- */
function fenAfter(moves){let st=parseFEN(START_FEN);for(const x of (moves||'').split(/\s+/).filter(Boolean)){const m=findMove(st,x);if(!m)throw new Error('bad move '+x+' in '+moves);st=make(st,m)}return fenOf(st)}
const NEWLES={};
ROAD_NEW.forEach(les=>{les.steps.forEach((s,k)=>{if(s.after!=null&&!s.fen)s.fen=fenAfter(s.after);s.id=les.key+'.'+k;s.les=les.key;STEPS[s.id]=s});NEWLES[les.key]=les;ALLLES.push(les)});
const lesOf=k=>NEWLES[k]||ALLLES.find(l=>l.key===k);
const isDone=k=>!!PR.done[k];
/* levels mein purane lessons "chapterId.lessonId" (course.html ka path) se likhe hain; unki asli key progress ke liye */
const NOTEPATH={};
COURSE.forEach(C=>C.lessons.forEach(l=>{NOTEPATH[l.key]=C.id+'-'+l.id}));
ROAD_LEVELS.forEach(L=>{L.lessons=L.lessons.map(p=>{if(NEWLES[p])return p;const[c,l]=p.split('.');const C=COURSE.find(x=>x.id===c);const les=C&&C.lessons.find(x=>x.id===l);return les?les.key:null}).filter(Boolean)});

/* ---------- din ka hisaab ---------- */
function sday(){const t=today();if(SP.day.d!==t){SP.day={d:t,srs:0,flash:0,puz:0,quiz:0,end:0,open:0,calc:0,lesson:0,extra:0,review:0,flashNone:false};ssave()}return SP.day}
const QUOTA_KEYS=[['lesson','Today\'s Lesson','📘'],['srs','Spaced Review','🧠'],['puz','Tactics Puzzles','🧩'],['quiz','Review Quiz','❓'],['flash','Mistake Flashcards','🔁'],['end','Endgame Drill','♔'],['open','Opening Drill','📖'],['calc','Calculation & Defence','🧠'],['game','Rated Game (Lichess)','♟'],['review','Game Review','🔍']];
/* Pehle seekho, phir practice: puzzles sirf un themes ke jo lessons mein seekh liye (pichhle levels ke saare + is level ke kiye hue) */
const LES_TH={'l1.values':['hanging'],'l2b.safety':['hanging'],'l2b.captures':['hanging'],'l1b.mate':['mate1','kingatk'],'l2.kqk':['mate1'],'l2.krk':['mate1'],'l2.ladder':['mate1'],
 'l2b.traps1':['hanging','trapped'],'l3.fork':['fork'],'l3.pin':['pin'],'l3.skewer':['skewer'],'lm.mates':['mate1','mate2'],'lm.backrank':['backrank'],
 'l3.disc':['disc','dblchk'],'l3.remove':['remdef'],'lm.smother':['matepat','mate2'],'lm.patterns1':['matepat','mate2'],'lm.patterns2':['matepat','mate3'],
 'l5.egthemes':['endgame'],'l5.kp':['pawnend'],'l5.square':['pawnend'],'l3b.deflect':['deflect','attract'],'l3b.more':['trapped','xray','interfere','clearance'],
 'l3b.golden':['quiet','defence'],'l3b.calc':['long','zwischen'],'l5.bb':['minorend'],'l5b.pawnend':['pawnend'],'l6.pawns':['pawnadv','promotion'],'l6.pawns2':['pawnadv','promotion'],
 'l5b.rook':['rookend'],'l5b.minor':['minorend'],'l6b.sacs':['sac','kingatk'],'l6b.prophy':['defence','quiet'],'l7.calc2':['long','zwischen'],'l6b.files':['kingatk']};
const ENDT=['endgame','rookend','pawnend','queenend','minorend'],CALCT=['defence','quiet','long','zwischen'];
function learnedTh(){const o=new Set();for(const L of ROAD_LEVELS)for(const k of L.lessons)if(L.n<SP.lvl||isDone(k))(LES_TH[k]||[]).forEach(t=>o.add(t));return[...o]}
function poolOf(k){const l=learnedTh();if(k==='puz')return l.filter(t=>!ENDT.includes(t));if(k==='end')return l.filter(t=>ENDT.includes(t));if(k==='calc')return l.filter(t=>CALCT.includes(t));return null}
function need(k){const q=CUR().quota;if(k==='srs')return Math.min(q.srs||20,srsDue().length+(sday().srs||0));if(k==='review')return(unreviewed().length||sday().review)?1:0;if(k==='lesson'||k==='game')return 1;
  if(!PREVIEW&&(k==='puz'||k==='end')&&!poolOf(k).length)return 0;
  if(!PREVIEW&&k==='calc'&&!cgLesOk(CG_STEPS[0]))return 0;
  if(k==='flash')return Math.min(q.flash||0,flashDue());return q[k]||0}
const flashDue=()=>dueCards().length+dueGm().length;
function have(k){const D=sday();if(k==='game')return SP.games.d===today()?Math.min(1,SP.games.n):0;if(k==='flash'&&(D.flashNone||!flashDue()))return need('flash');if(k==='lesson'&&!nextLes())return 1;return D[k]||0}
const partDone=k=>need(k)===0||have(k)>=need(k);
/* aaj ki practice (lesson, game, review ke alawa sab) */
const practiceDone=()=>QUOTA_KEYS.every(([k])=>k==='lesson'||k==='game'||k==='review'||partDone(k));
const dayDone=()=>QUOTA_KEYS.every(([k])=>partDone(k));

/* ---------- Lichess rating (public API, login nahi) ---------- */
async function fetchLichess(){if(!SP.user)throw new Error('nouser');const tk=lichToken();
  const r=tk?await fetch('https://lichess.org/api/account',{headers:{Authorization:'Bearer '+tk}}):await fetch('https://lichess.org/api/user/'+encodeURIComponent(SP.user));
  if(r.status===401&&tk){ltSave(Object.assign({},LT,{exp:0}));throw new Error('expired')}if(!r.ok)throw new Error(r.status===404?'notfound':'net');
  const j=await r.json();const p=(j.perfs||{}).rapid||{},c=(j.perfs||{}).classical||{};
  SP.lich={rating:p.rating||0,prov:!!p.prov,games:p.games||0,cls:c.rating||0,clsGames:c.games||0,at:Date.now()};
  try{const h=await (await fetch('https://lichess.org/api/user/'+encodeURIComponent(SP.user)+'/rating-history')).json();
    const rp=(h.find(x=>x.name==='Rapid')||{}).points||[];SP.hist=rp.slice(-120).map(([y,m,d,v])=>[Math.floor(Date.UTC(y,m,d)/864e5),v])}catch(e){}
  try{const st=new Date();st.setHours(0,0,0,0);const wk=new Date(st);wk.setDate(st.getDate()-((st.getDay()+6)%7));
    const cnt=async since=>{const g=await fetch(`https://lichess.org/api/games/user/${encodeURIComponent(SP.user)}?since=${since}&rated=true&perfType=rapid,classical&max=50&moves=false`,{headers:{Accept:'application/x-ndjson'}});const t=await g.text();return t.split('\n').filter(x=>x.trim()).length};
    SP.games={d:today(),n:await cnt(st.getTime()),wk:wk.toISOString().slice(0,10),wn:await cnt(wk.getTime())}}catch(e){}
  ssave();return SP.lich}
/* gate: rating target par, provisional nahi, kaafi games, aur `hold` din se tiki hui */
function heldDays(target){const H=SP.hist;if(!H.length||H[H.length-1][1]<target)return 0;let k=H.length-1;while(k>0&&H[k-1][1]>=target)k--;return Math.floor((Date.now()-new Date().getTimezoneOffset()*60000)/864e5)-H[k][0]}
function gateStatus(L){const R=SP.lich;const s={test:(SP.tests[L.n]||0)>=75,rating:!!R&&R.rating>=L.gate,prov:!!R&&!R.prov,games:!!R&&(R.games+(L.n>=7?R.clsGames||0:0))>=L.games,hold:heldDays(L.gate)>=L.hold};s.ok=s.test&&s.rating&&s.prov&&s.games&&s.hold;return s}
function tryAdvance(){const L=CUR();if(L.n<10&&(gateStatus(L).ok)){SP.lvl++;ssave();return true}return false}
/* rating level ke darwaze se neeche: naye lessons band, sirf practice */
const ratingLocked=()=>!PREVIEW&&SP.lvl>1&&!!SP.lich&&SP.lich.rating<CUR().lo;

/* ---------- puzzle bank (packs/road) ---------- */
let PIDX=null;const BANK={};const LOADED={};
async function pidx(){if(!PIDX)PIDX=await (await fetch('packs/road/index.json')).json();return PIDX}
async function loadChunk(b,k){const key=b+'_'+k;if(LOADED[key])return;LOADED[key]=1;try{const a=await (await fetch(`packs/road/b${b}_${k}.json`)).json();(BANK[b]=BANK[b]||[]).push(...a)}catch(e){LOADED[key]=0}}
const NEAR={fork:['disc','pin','skewer'],pin:['skewer','fork','xray'],skewer:['pin','xray'],disc:['fork','dblchk'],mate1:['mate2','backrank'],mate2:['mate1','mate3','matepat'],mate3:['mate2','matepat'],backrank:['mate2','matepat'],matepat:['mate2','backrank'],hanging:['trapped','remdef'],trapped:['hanging'],deflect:['attract','remdef'],attract:['deflect','sac'],remdef:['deflect','hanging'],rookend:['endgame','pawnend'],pawnend:['endgame','rookend'],queenend:['endgame'],minorend:['endgame'],endgame:['rookend','pawnend'],defence:['quiet','zwischen'],quiet:['defence','clearance'],promotion:['pawnadv'],pawnadv:['promotion','pawnend'],kingatk:['sac','mate2'],sac:['kingatk','attract'],zwischen:['quiet','defence'],interfere:['clearance','deflect'],clearance:['interfere','quiet'],xray:['skewer','pin']};
const TNAME={fork:'Fork',pin:'Pin',skewer:'Skewer',disc:'Discovered attack',mate1:'Mate in 1',mate2:'Mate in 2',mate3:'Lamba mate',backrank:'Back-rank mate',matepat:'Mate patterns',hanging:'Latakta piece',trapped:'Phansa piece',deflect:'Deflection',attract:'Decoy',remdef:'Defender hatao',rookend:'Rook endgame',pawnend:'Pawn endgame',queenend:'Queen endgame',minorend:'Minor piece endgame',endgame:'Endgame',defence:'Defence',quiet:'Quiet move',promotion:'Promotion',pawnadv:'Aage pawn',kingatk:'King par hamla',sac:'Sacrifice',zwischen:'Zwischenzug',interfere:'Interference',clearance:'Clearance',xray:'X-ray',zugzwang:'Zugzwang',special:'Special moves',long:'Lambi calculation'};
const GENERIC=['middle','opening','long','endgame','sac'];
function mainTheme(t){const a=(t||'').split(',').filter(Boolean);return a.find(x=>!GENERIC.includes(x))||a[0]||'mixed'}
function bandsFor(lo,hi){const o=[];for(let b=Math.floor(lo/100)*100;b<hi&&b<=3100;b+=100)if(b>=400)o.push(b);return o}
/* naya (kabhi na dekha) puzzle: theme (optional), rating ke paas; nahi mila to aas-paas ki rating, phir milta-julta theme */
async function getPuzzle(o){const I=await pidx();const L=CUR();const pr=SP.pr||L.band[0]+150;
  const tries=[];const around=w=>[Math.max(L.band[0]-(w?150:0),400),Math.min(L.band[1]+(w?150:0),3200)];
  const center=Math.min(Math.max(pr,L.band[0]),L.band[1]);
  const mk=(lo,hi,th)=>({lo,hi,th});
  const [a,b]=around(false),[c,d]=around(true);
  if(o.theme){tries.push(mk(Math.max(a,center-150),Math.min(b,center+150),[o.theme]),mk(c,d,[o.theme]),mk(c,d,NEAR[o.theme]||[]))}
  else if(o.any){tries.push(mk(Math.max(a,center-150),Math.min(b,center+150),o.any),mk(c,d,o.any))}
  const ok=o.strict?(()=>{const al=new Set(learnedTh().concat(GENERIC));return tg=>tg.split(',').every(x=>!x||al.has(x))})():()=>true;
  if(!o.strict)tries.push(mk(Math.max(a,center-200),Math.min(b,center+200),null),mk(a,b,null),mk(c,d,null));
  for(const t of tries){if(t.th&&!t.th.length)continue;const bs=shuffle(bandsFor(t.lo,t.hi));
    for(const bnd of bs){const nCh=(I.bands||{})[bnd]||0;for(let k=0;k<nCh;k++){if(!LOADED[bnd+'_'+k])await loadChunk(bnd,k);
        const hit=(BANK[bnd]||[]).find(p=>!SEEN.has(p[0])&&p[3]>=t.lo&&p[3]<t.hi&&(!t.th||t.th.some(x=>p[4].split(',').includes(x)))&&ok(p[4]));
        if(hit)return hit;}}}
  return null}
function puzStep(p,o){const th=p[4].split(',').filter(Boolean);const mate=th.find(x=>/^mate\d/.test(x));
  return{t:'move',fen:p[1],line:p[2].split(' '),mate:mate?1:0,pid:p[0],pr:p[3],th,q:o&&o.q||'',why:`Lichess puzzle [${p[0]}] · rating ${p[3]} · ${th.map(x=>TNAME[x]||x).join(', ')}`,hint:(TNAME[mainTheme(p[4])]||'Forcing chaal')+' dhundo. Pehle checks, captures aur threats.'}}
/* galti-card: theme ke hisaab se (puzzle nahi). 1, 3, 7, 21 din. Lagatar 3 sahi = pakka. */
const GAPS=[1,3,7,21];
function cardResult(theme,ok){const c=SP.cards[theme];if(!ok){SP.cards[theme]={due:dayNum()+1,box:0,ok:0,miss:((c&&c.miss)||0)+1};return}
  if(c){c.ok++;c.box++;if(c.ok>=3&&c.box>=3)delete SP.cards[theme];else c.due=dayNum()+GAPS[Math.min(c.box,3)]}}
const dueCards=()=>Object.entries(SP.cards).filter(([t,c])=>c.due<=dayNum()).map(([t])=>t);
function rate(pr,ok){const me=SP.pr||CUR().band[0]+150;const e=1/(1+Math.pow(10,(pr-me)/400));SP.pr=Math.round(me+24*((ok?1:0)-e))}

/* ---------- puzzle session: ek ke baad ek, kabhi repeat nahi ---------- */
function vPuzzleRun(kind,arg){if(kind==='calc')return go('#/calc');const app=$('#app');sday();
  const cfg=kind==='th'&&arg?{title:(TNAME[arg]||arg)+' Drill',any:[arg]}:{puz:{title:'Tactics Puzzles',any:null},end:{title:'Endgame Drill',any:['endgame','rookend','pawnend','queenend','minorend']},calc:{title:'Calculation & Defence',any:['defence','quiet','long','zwischen']},flash:{title:'Mistake Flashcards',flash:true},extra:{title:'Unlimited Practice',any:null},weak:{title:'Weak Spot Drills',weak:true}}[kind];
  if(!cfg)return go('#/');
  let n=0,ok=0,cur=null;const D=sday();
  const top=h('div','qhead');top.innerHTML=`<button class="x" aria-label="Back">‹</button><div class="prog"><i></i></div><span class="count"></span>`;top.querySelector('.x').onclick=()=>go('#/');app.appendChild(top);
  const head=h('p','eyebrow',esc(cfg.title));app.appendChild(head);const stage=h('div');app.appendChild(stage);
  const foot=h('div','foot');const nb=h('button','btn primary block','Agla puzzle ›');foot.appendChild(nb);app.appendChild(foot);
  const goal=()=>kind==='extra'||kind==='weak'||kind==='th'?0:need(kind);
  function bar(){const g=goal(),done=kind==='extra'||kind==='weak'||kind==='th'?n:have(kind);top.querySelector('.count').textContent=g?`${Math.min(done,g)}/${g}`:`${n} kiye`;top.querySelector('.prog i').style.width=g?Math.min(100,done/g*100)+'%':'100%'}
  async function next(){stage.innerHTML='<p class="muted">Puzzle aa raha hai…</p>';nb.disabled=true;bar();
    if(goal()&&have(kind)>=goal()&&kind!=='flash'){return finish()}
    let p=null,theme=null;
    if(cfg.flash){const gd=dueGm();if(gd.length){return gmNext(gd[0])}const due=dueCards();if(!due.length){if(!D.flash){D.flashNone=true;ssave()}return finish()}theme=due[0];p=await getPuzzle({theme})}
    else if(cfg.weak){const ws=Object.entries(SP.cards).sort((a,b)=>(b[1].miss||0)-(a[1].miss||0)).map(x=>x[0]);theme=ws[n%Math.max(1,ws.length)];p=await getPuzzle(theme?{theme}:{})}
    else{const pool=PREVIEW||kind==='extra'||kind==='th'?null:poolOf(kind);p=await getPuzzle(pool&&pool.length?{any:pool,strict:true}:cfg.any?{any:cfg.any}:{})}
    if(!p){stage.innerHTML='<div class="card"><p>Is waqt naya puzzle nahi mila (shayad internet band hai). Thodi der baad try karo.</p></div>';return}
    cur={p,theme};const s=puzStep(p,{q:theme?`Galti wala pattern: **${TNAME[theme]||theme}**. Naya puzzle, sahi chaal dhundo.`:''});
    stage.innerHTML='';stage.appendChild(renderStep(s,{test:false,lessonTitle:cfg.title,where:cfg.title,done:res=>{
      SEEN.add(p[0]);seenSave();rate(p[3],!!res);n++;if(res)ok++;
      const lt=learnedTh();const th=cur.theme||p[4].split(',').find(x=>lt.includes(x))||mainTheme(p[4]);if(cur.theme)cardResult(cur.theme,!!res);else if(!res)cardResult(th,false);
      if(kind==='flash'||kind==='puz'||kind==='end'||kind==='calc')D[kind]=(D[kind]||0)+1;else D.extra=(D.extra||0)+1;
      ssave();nb.disabled=false;bar();
      if(goal()&&have(kind)>=goal()&&kind!=='flash')nb.textContent='Ho gaya ✓';else if(kind==='flash'&&!flashDue())nb.textContent='Ho gaya ✓'}}));
    window.scrollTo(0,0)}
  function gmNext(k){const s=gmStep(k);stage.innerHTML='';stage.appendChild(renderStep(s,{test:false,lessonTitle:cfg.title,where:cfg.title,done:res=>{
      gmResult(k,!!res);n++;if(res)ok++;D.flash=(D.flash||0)+1;ssave();nb.disabled=false;bar();if(!flashDue())nb.textContent='Ho gaya ✓'}}));window.scrollTo(0,0)}
  function finish(){stage.innerHTML=`<div class="stack center"><div class="big">✅</div><h2>${esc(cfg.title)}: aaj ka hissa poora</h2><p>${n?`${ok}/${n} pehli koshish mein sahi.`:''} ${kind==='flash'&&!n?'Aaj koi purani galti due nahi.':''}</p><button class="btn primary block" data-go="#/">Today's Work ›</button><button class="btn block" data-go="#/run/extra">Unlimited Practice ›</button></div>`;foot.remove()}
  nb.onclick=()=>{if(nb.textContent.startsWith('Ho gaya'))return finish();nb.textContent='Agla puzzle ›';next()};
  next()}

/* ---------- lesson, quiz, opening drill ---------- */
function nextLes(){const L=CUR();return L.lessons.find(k=>!isDone(k))||null}
function canLesson(){if(PREVIEW)return{ok:true};if(ratingLocked())return{ok:false,why:`Lichess rating ${SP.lich.rating} hai, Level ${SP.lvl} ka darwaza ${CUR().lo}. Jab tak rating wapas nahi aati, naye lessons band. Sirf practice aur games.`};
  if(SP.owe&&practiceDone()){SP.owe=0;ssave()}
  if(SP.owe)return{ok:false,why:'Pichhle lesson ki practice (puzzles, quiz, drills) poori karo, phir agla lesson khulega.'};
  if(sday().lesson>=1&&!dayDone())return{ok:false,why:'Aaj ka lesson ho gaya. Agla lesson tab, jab aaj ka poora kaam (practice aur game) ho jaye.'};return{ok:true}}
function runLesson(k,back){const les=lesOf(k),app=$('#app');if(!les)return go('#/');
  player(app,les.steps,{back:back||'#/',title:()=>les.title,where:'Lesson',finish:()=>{const qz=lessonQuiz(les);if(!qz.length)return lesFinish(k,null);
    app.innerHTML=`<div class="stack center"><div class="big">🎯</div><h1>Lesson Quiz</h1><p>${esc(les.title)}</p><div class="card tut">${md(`**${qz.length} sawaal**, zyadatar board par. **80%** sahi karo to lesson poora.`)}</div><button class="btn primary block" id="qgo">Start Quiz ›</button></div>`;
    $('#qgo').onclick=()=>{app.innerHTML='';player(app,qz,{test:true,again:true,back:back||'#/',title:()=>les.title+' · quiz',head:()=>'Quiz · '+les.title,where:'Lesson quiz',finish:res=>{const okn=res.filter(Boolean).length,pct=Math.round(okn/qz.length*100);
      if(pct>=80)lesFinish(k,pct);else app.innerHTML=`<div class="stack center"><div class="big">📘</div><h1>${pct}%</h1><p>80% chahiye. Galat sawaal review mein chale gaye.</p><button class="btn primary block" data-go="#/les/${k}" data-re="1">Redo Lesson</button><button class="btn block" data-go="#/">Today's Work</button></div>`}})}}})}
function lesFinish(k,pct){const first=!PR.done[k];PR.done[k]=1;if(lesOf(k))srsEnroll(lesOf(k),false);save();if(first){sday().lesson++;SP.owe=1;ssave();addXP(25)}
  const app=$('#app'),les=lesOf(k);const old=!NEWLES[k];
  app.innerHTML=`<div class="stack center"><div class="big">🎉</div><h1>Lesson poora!</h1><p>${esc(les.title)}</p>${pct!=null?`<p class="muted">Quiz: ${pct}%</p>`:''}
   ${old&&NOTEPATH[k]?`<a class="btn block" style="text-decoration:none" href="notes.html#${NOTEPATH[k]}">📝 Lesson Notes</a>`:''}<button class="btn primary block" data-go="#/">Today's Work ›</button></div>`}
function doneLessonsUpTo(n){const o=[];for(let i=1;i<=n;i++)o.push(...LV(i).lessons.filter(isDone));return o}
function runQuiz(){const app=$('#app');const ks=doneLessonsUpTo(SP.lvl);
  const pool=[].concat(...ks.map(k=>lesOf(k).steps.filter(s=>s.t==='quiz'||(s.t==='move'&&s.fen&&s.line&&s.line.length))));
  if(!pool.length){sday().quiz=need('quiz');ssave();app.innerHTML=`<div class="stack center"><div class="big">📘</div><h2>Abhi quiz ke liye koi poora lesson nahi</h2><p>Pehla lesson karo, kal se uske sawaal yahan aayenge.</p><button class="btn primary block" data-go="#/">Today's Work</button></div>`;return}
  const qs=shuffle(pool).slice(0,need('quiz'));
  player(app,qs,{test:true,again:true,back:'#/',title:s=>lesOf(s.les)?lesOf(s.les).title:'Quiz',head:s=>'Quiz · '+(lesOf(s.les)?lesOf(s.les).title:''),where:'Daily quiz',finish:res=>{const D=sday();D.quiz=(D.quiz||0)+qs.length;ssave();
    app.innerHTML=`<div class="stack center"><div class="big">❓</div><h2>Quiz poora: ${res.filter(Boolean).length}/${qs.length}</h2><p>Galat sawaal review mein chale gaye.</p><button class="btn primary block" data-go="#/">Today's Work ›</button></div>`}})}
function openLines(){const ks=doneLessonsUpTo(SP.lvl);const o=[];ks.forEach(k=>lesOf(k).steps.forEach(s=>{if(s.t==='line'&&s.moves&&!s.fen&&s.moves.split(' ').length>=3)o.push(s)}));return o}
function runOpen(){const app=$('#app');const ls=openLines();
  if(!ls.length){sday().open=need('open');ssave();app.innerHTML=`<div class="stack center"><div class="big">📖</div><h2>Abhi koi opening line nahi</h2><p>Openings Chapter 1 ke lessons karo. Unki lines yahan drill ke liye aayengi.</p><button class="btn primary block" data-go="#/">Today's Work</button></div>`;return}
  const qs=shuffle(ls).slice(0,need('open')).map(s=>Object.assign({},s,{drill:s.drill||(s.flip?'b':'w'),id:undefined}));
  player(app,qs,{test:false,back:'#/',title:s=>s.h||'Opening',head:s=>'Opening Drill · '+(s.h||''),where:'Opening drill',finish:()=>{const D=sday();D.open=(D.open||0)+qs.length;ssave();
    app.innerHTML=`<div class="stack center"><div class="big">📖</div><h2>Opening Drill: done</h2><button class="btn primary block" data-go="#/">Today's Work ›</button></div>`}})}

/* ---------- level test ---------- */
function testSteps(L){const ks=L.lessons;const S=[];
  COURSE.forEach(C=>(C.test||[]).forEach(s=>{if(ks.includes(s.les))S.push(s)}));
  ks.filter(k=>NEWLES[k]).forEach(k=>NEWLES[k].steps.forEach(s=>{if(s.t==='quiz'||s.t==='move')S.push(s)}));
  /* 30-40% purane levels se (kamzor/bhoole hue pehle) */
  const cur=shuffle(S).slice(0,L.n>1?13:20);if(L.n===1)return cur;
  const prev=doneLessonsUpTo(L.n-1),pk=new Set(prev);const oldT=[];COURSE.forEach(C=>(C.test||[]).forEach(s=>{if(pk.has(s.les))oldT.push(s)}));
  return cur.concat(oldSteps(prev,7,oldT).map(s=>Object.assign({},s,{_old:1})))}
/* Calculation Gym ke saath: Gym ka har puzzle roz ke 'calc' quota mein ginta hai; Road ke pichle levels ke lessons "seekhe hue" maane jaate hain */
function onCalcDone(ok){const D=sday();D.calc=(D.calc||0)+1;ssave()}
function cgRoadKnown(k){return ROAD_LEVELS.some(L=>L.n<SP.lvl&&L.lessons.includes(k))}
/* level test se pehle Gym ladder kahan tak (steps pass): pro banne ke liye practice zaroori */
const CG_RGATE={2:5,3:11,4:17,5:23,6:29,7:35,8:41,9:47,10:47};
function cgRoadGate(n){const need=CG_RGATE[n]||0;if(PREVIEW||cgS().f>=need)return'';const st=CG_STEPS[need-1];return`🧠 **Calculation Gym pehle:** Level ${n} test se pehle Gym mein **${cgStepName(st)}** tak pass karo (abhi ${cgS().f}/${need} steps).`}
async function runTest(){const L=CUR(),app=$('#app');{const gm=cgRoadGate(L.n);if(gm){app.innerHTML=`<div class="card stack">${md(gm)}<button class="btn primary block" data-go="#/calc">🧠 Calculation Gym ›</button><button class="btn block" data-go="#/level/${L.n}">‹ Level</button></div>`;return}}
  if(!PREVIEW&&L.lessons.some(k=>!isDone(k)))return go('#/level/'+L.n);
  if(ratingLocked())return go('#/');
  app.innerHTML='<p class="muted">Test taiyaar ho raha hai…</p>';
  const S=testSteps(L);const pz=[];for(let i=0;i<10;i++){const p=await getPuzzle({});if(p){SEEN.add(p[0]);pz.push(puzStep(p))}}seenSave();
  const all=shuffle(S.concat(pz));app.innerHTML='';
  player(app,all,{test:true,back:'#/level/'+L.n,title:()=>'Level '+L.n+' test',head:s=>'Level '+L.n+' test'+(s._old?' · purana':''),where:'Level test',finish:res=>{
    const ok=res.filter(Boolean).length,pct=Math.round(ok/all.length*100);SP.tests[L.n]=Math.max(SP.tests[L.n]||0,pct);ssave();
    const gs=gateStatus(L);
    app.innerHTML=`<div class="stack center"><div class="big">${pct>=75?'🏅':'📘'}</div><h1>${pct}%</h1><p>${pct>=75?'Test pass! Ab Lichess rating ka darwaza bacha hai.':'Pass ke liye 75% chahiye. Practice karo aur dobara do.'}</p>${gateHTML(L)}<button class="btn primary block" data-go="#/">Today's Work ›</button></div>`}})}


function lichCard(){const t=lichToken(),exp=lichNeedsReconnect();
  return`<div class="card stack"><h3>Lichess Connect</h3>
   ${t?`<p>✅ Connected: <b>${esc(LT.user)}</b>. Login yaad hai, dobara nahi karna.</p><p class="small muted">Rating aur games yahin se aate hain. Games Lichess par khelo: rapid 15+10.</p><div class="row"><button class="btn" data-act="sync">Refresh</button><button class="btn" data-act="lout">Disconnect</button></div>`
   :`${exp?'<p class="warn">Lichess ko ek baar dobara jodo (login purana ho gaya ya nayi permission chahiye).</p>':''}<p class="small muted">Ek baar jodo, phir app login yaad rakhega. Password Lichess ke apne page par daalna hai, app mein nahi.</p>
   <button class="btn primary block" data-act="lconnect">Connect Lichess</button>
   <a class="btn block" style="text-decoration:none;text-align:center" href="https://lichess.org/signup" target="_blank" rel="noopener">Create a Lichess Account</a>
   <details><summary class="small muted">Ya sirf username daalo (login ke bina)</summary><div class="row" style="margin-top:8px"><input id="lu" placeholder="Lichess username" value="${esc(SP.user||'')}" autocomplete="off" autocapitalize="off"><button class="btn" data-act="saveuser">Save</button></div></details>`}
   <p class="small" id="lmsg">${esc(window.__lmsg||'')}</p></div>`}

/* ---------- screens ---------- */
function ratingChip(){const R=SP.lich,t=lichToken();const who=t?`Connected as ${esc(LT.user)} · `:'';return R?who+(R.rating?`Lichess rapid ${R.rating}${R.prov?'?':''}`:'Lichess rapid: abhi koi game nahi'):t?`Connected as ${esc(LT.user)}`:'Lichess: not connected'}
function gateHTML(L){const s=gateStatus(L),R=SP.lich;const row=(ok,t)=>`<li>${ok?'✅':'⬜'} ${t}</li>`;
  return`<div class="card stack" style="text-align:left"><h3>Level ${L.n+1<=10?L.n+1:''} Gate</h3><ul class="gate">
   ${row(s.test,`Level ${L.n} test 75%+ (abhi: ${SP.tests[L.n]||0}%)`)}
   ${row(s.rating,`Lichess rapid ${L.gate}+ (abhi: ${R?R.rating:'?'})`)}
   ${row(s.prov,'Rating provisional nahi (Lichess par "?" na ho)')}
   ${row(s.games,`Kam se kam ${L.games} rated games (abhi: ${R?R.games+(L.n>=7?R.clsGames||0:0):'?'})`)}
   ${row(s.hold,`Rating ${L.hold} din tak ${L.gate}+ tiki rahe (abhi: ${heldDays(L.gate)} din)`)}</ul></div>`}
function quotaRow(k,label,icon){const n=need(k),hv=have(k),done=partDone(k);
  let act='',note='';
  if(k==='lesson'){const nx=nextLes(),c=canLesson();if(!nx){note='Is level ke saare lessons ho gaye'}else{note=esc(lesOf(nx).title);act=c.ok?`<button class="btn small primary" data-go="#/les/${nx}">Start</button>`:`<span class="muted small">🔒</span>`;if(!c.ok)note+=`<br><small class="muted">${esc(c.why)}</small>`}}
  else if(k==='game'){note=SP.user?`Aaj: ${SP.games.d===today()?SP.games.n:0} game · Is hafte: ${SP.games.wn||0}`:'Pehle neeche Lichess Connect karo';act=`<a class="btn small primary" style="text-decoration:none" href="lichess.html#/road">Play</a>`+(SP.user?`<button class="btn small" data-act="sync">Check</button>`:'')}
  else if(k==='review'){const u=unreviewed();note=u.length?`${u.length} game ka review baaki · galtiyan drills ban jayengi`:hv?'Aaj ka review ho gaya':'Koi naya game nahi';act=u.length?`<button class="btn small primary" data-go="#/game/${u[0].id}">Review</button>`:`<button class="btn small" data-go="#/games">My Games</button>`}
  else if(k==='srs'){note=n?`${Math.min(hv,n)}/${n} · ${srsDue().length} due · sahi wale lambe gap par wapas`:'Aaj kuch due nahi. Seekhi hui cheezein sahi din par yahan aayengi.';act=n&&!done?`<button class="btn small primary" data-go="#/review">Start</button>`:`<button class="btn small" data-go="#/viz">👁 Drill</button>`}
  else if(k==='flash'&&n===0){note='Abhi koi galti nahi. Puzzle ya game mein jo galti hogi, wahi yahan wapas aayegi.'}
  else if(n===0&&(CUR().quota[k]||0)>0){note='Lesson ke baad khulega: jo seekha hi nahi, uska puzzle nahi aayega.'}
  else if(n===0){note='Is level mein nahi'}
  else{act=done?'':`<button class="btn small primary" data-go="#/${k==='quiz'?'quiz':k==='open'?'open':'run/'+k}">Start</button>`;note=`${Math.min(hv,n)}/${n}`;if(k==='flash'){const d=dueCards().length,gd=dueGm().length;note+=(d?` · ${d} galti-pattern due`:'')+(gd?` · ${gd} apne game ki galtiyan`:'')}}
  return`<div class="qrow${done?' done':''}"><span class="qi">${done?'✅':icon}</span><div class="qt"><b>${label}</b><div class="muted small">${note}</div></div>${act}</div>`}
function vHome(){const app=$('#app');sday();const L=CUR();const lock=ratingLocked();const adv=tryAdvance();const L2=CUR();
  const done=QUOTA_KEYS.filter(([k])=>partDone(k)).length;
  let o=`<div class="stack">${PREVIEW?'<div class="card alert">Preview mode: saare taale khule hain (sirf dekhne ke liye).</div>':''}
   ${adv?`<div class="card okc"><b>🎉 Level ${L2.n} khul gaya: ${esc(L2.name)}!</b></div>`:''}
   <div class="shero card"><p class="eyebrow">Level ${L2.n} / 10 · ${esc(L2.name)}</p><h1>${L2.lo||'Start'} → ${L2.gate}</h1><p class="muted">${ratingChip()} · Puzzle rating ${SP.pr||L2.band[0]+150}</p>
   <div class="bar"><i style="width:${Math.round(done/QUOTA_KEYS.length*100)}%"></i></div><p class="small muted">Aaj: ${done}/${QUOTA_KEYS.length} hisse · ~${L2.quota.mins} min</p></div>
   ${lock?`<div class="card alert">${md(`**Rating girne se naye lessons band.** Lichess rapid ${SP.lich.rating}, Level ${L2.n} ka darwaza ${L2.lo}. Jab tak wapas nahi aati: roz ka puzzle quota, apni galtiyon ke drills aur rated games.`)}<button class="btn block" data-go="#/run/weak">Weak Spot Drills ›</button></div>`:''}
   <h2>Today's Work</h2><div class="qlist">${QUOTA_KEYS.map(([k,l,i])=>quotaRow(k,l,i)).join('')}</div>
   ${dayDone()?'<div class="card okc"><b>Aaj ka poora kaam ho gaya. Shabaash!</b> Chaho to aur practice karo.</div>':''}
   <div class="card stack"><div class="row" style="justify-content:space-between"><h3>🧠 Yaad ka meter</h3><small class="muted">${srsStats().total} items</small></div>${srsMeterHTML()||'<p class="small muted">Lesson poora karte hi uske sawaal aur yaad points yahan aate hain (1, 3, 7, 21, 60, 120 din par wapas).</p>'}
    <div class="row"><button class="btn" data-go="#/review">🔁 Review (${srsDue().length})</button><button class="btn" data-go="#/viz">👁 Board-hidden drill</button></div></div>
   <button class="btn primary block" data-go="#/calc">🧠 Calculation Gym · step ${Math.min(cgS().f+1,CG_STEPS.length)}/${CG_STEPS.length}</button>
   <div class="row"><button class="btn block" data-go="#/run/extra">♾ Unlimited Practice</button><button class="btn block" data-go="#/games">♟ My Games</button></div>
   <h2>Levels</h2><div class="lvls">${ROAD_LEVELS.map(x=>`<button class="lv${x.n===L2.n?' on':''}${x.n>L2.n&&!PREVIEW?' locked':''}" data-go="#/level/${x.n}"><b>${x.n}</b><span>${esc(x.name)}</span><small>${x.lo||0}-${x.gate}</small></button>`).join('')}</div>
   ${lichCard()}
   <p class="small muted">Puzzles: Lichess open puzzle database (CC0). Purane lessons: 64 Squares course.</p></div>`;
  app.innerHTML=o;if(SP.user&&(!SP.lich||Date.now()-SP.lich.at>30*60e3))sync(true)}
async function sync(quiet){const m=$('#lmsg');if(m)m.textContent='Lichess se la raha hoon…';
  try{await fetchLichess();try{await syncGames()}catch(x){}if(m)m.textContent='Ho gaya.';if(!quiet||$('#app'))route()}catch(e){if(m)m.textContent=e.message==='expired'?'Lichess login purana ho gaya. Ek baar dobara Connect karo.':e.message==='notfound'?'Yeh username Lichess par nahi mila.':'Lichess tak nahi pahunch paya. Internet check karo.'}}
function vLevelS(n){const L=LV(n),app=$('#app');if(!L)return go('#/');const open=PREVIEW||n<=SP.lvl;
  const items=L.lessons.map(k=>{const l=lesOf(k),d=isDone(k);return`<div class="qrow${d?' done':''}"><span class="qi">${d?'✅':NEWLES[k]?'🆕':'📘'}</span><div class="qt"><b>${esc(l.title)}</b><div class="muted small">${esc(l.sub||'')}</div></div>${open&&(d||PREVIEW)?`<button class="btn small" data-go="#/les/${k}">${d?'Redo':'Open'}</button>`:''}</div>`}).join('');
  app.innerHTML=`<div class="stack"><button class="btn small backbtn" data-go="#/">‹ Today's Work</button><p class="eyebrow">Level ${n} / 10</p><h1>${esc(L.name)}</h1><p class="muted">Lichess rapid ${L.lo||'shuru'} se ${L.gate} · Puzzles ${L.band[0]}-${L.band[1]} · Roz ~${L.quota.mins} min</p>
   ${!open?'<div class="card">🔒 Yeh level pichhla level aur uska Lichess darwaza paar karne par khulega.</div>':''}
   <h2>Lessons (${L.lessons.filter(isDone).length}/${L.lessons.length})</h2>${L.lessons.length?`<div class="qlist">${items}</div>`:'<div class="card">Is level ka content jald aa raha hai. Tab tak roz ka puzzle quota, opening drills aur games.</div>'}
   <p class="small muted">Naye lessons roz ki list se ek-ek karke khulte hain. ✅ wale yahan se dobara kar sakte ho.</p>
   ${n===SP.lvl||PREVIEW?`<h2>Level Test</h2>${cgRoadGate(n)?`<div class="card">${md(cgRoadGate(n))}<a class="btn small" style="text-decoration:none" href="#/calc">Gym kholo ›</a></div>`:''}<button class="btn ${L.lessons.every(isDone)||PREVIEW?'primary':''} block" ${L.lessons.every(isDone)||PREVIEW?'data-go="#/test"':'disabled'}>Take Level ${n} Test (75% to pass)</button>`+gateHTML(L):''}
   ${n%2===0&&(open||PREVIEW)?`<h2>Mixed Exam</h2><button class="btn block" data-go="#/exam/${n}">🧩 Mixed Exam: Level 1-${n}${(SP.exam||{})[n]!=null?' · best '+SP.exam[n]+'%':''}</button><p class="small muted">Har 2 level baad: 25 sawaal, sab purane lessons se mila-jula. Kamzor topics pehle.</p>`:''}</div>`}

function vExamS(n){if(!(n>=2))return go('#/');SP.exam=SP.exam||{};const prev=doneLessonsUpTo(Math.min(n,SP.lvl)),pk=new Set(prev);const ex=[];COURSE.forEach(C=>(C.test||[]).forEach(s=>{if(pk.has(s.les))ex.push(s)}));
  examSession($('#app'),{keys:prev,extra:ex,n:25,title:'Mixed Exam: Level 1-'+n,range:'Level 1 se '+n+' tak',best:SP.exam[n],back:'#/level/'+n,store:p=>{SP.exam[n]=Math.max(SP.exam[n]||0,p);ssave();if(p>=70)addXP(40)}})}

/* ---------- router ---------- */
function go(hash){if(location.hash!==hash)location.hash=hash;else route()}
window.addEventListener('hashchange',route);
function navOn(){const h=location.hash||'#/';const bs=[...document.querySelectorAll('nav.tabs button[data-go]')];const hit=bs.find(b=>b.dataset.go===h)||bs.find(b=>h.startsWith(b.dataset.go+'/')&&b.dataset.go!=='#/')||bs[0];bs.forEach(b=>b.classList.toggle('on',b===hit))}
function route(){closeTutor();navOn();const p=(location.hash||'#/').slice(2).split('/');const app=$('#app');app.innerHTML='';app.onclick=null;window.scrollTo(0,0);
  if(p[0]==='calc'){if(p[1]==='run')cgRun(+p[2]);else if(p[1]==='jump')cgRun(+p[2],{test:1});else cgHome()}else if(p[0]==='run')vPuzzleRun(p[1],p[2]);else if(p[0]==='les')runLesson(p[1],'#/');else if(p[0]==='quiz')runQuiz();else if(p[0]==='open')runOpen();
  else if(p[0]==='test')runTest();else if(p[0]==='review')srsSession(app,{back:'#/',backTxt:"Today's Work ›",self:'#/review',viz:'#/viz',onDone:n=>{const D=sday();D.srs=(D.srs||0)+n;ssave()}});else if(p[0]==='viz')vizSession(app,{back:'#/',self:'#/viz'});else if(p[0]==='exam')vExamS(+p[1]);else if(p[0]==='level')vLevelS(+p[1]);else if(p[0]==='games')vGames();else if(p[0]==='game'&&p[1])vGame(p[1]);else vHome();chips()}
document.addEventListener('click',e=>{const g=e.target.closest('[data-go]');if(g){e.preventDefault();const t=g.dataset.go;if(location.hash===t)route();else go(t);return}
  const a=e.target.closest('[data-act]');if(!a)return;
  if(a.dataset.act==='saveuser'){const v=($('#lu').value||'').trim();SP.user=v;SP.lich=null;ssave();if(v)sync(false);else route()}
  else if(a.dataset.act==='sync')sync(false);
  else if(a.dataset.act==='lconnect')lichConnect();
  else if(a.dataset.act==='lout')lichDisconnect().then(route)});
touchDay();srsInit();save();lichReturn().then(u=>{if(u){SP.user=u;SP.lich=null;ssave()}
  /* Lichess Play page se connect kiya ho to bhi yahan username le lo */
  else if(lichToken()&&LT.user&&lcs(SP.user)!==lcs(LT.user)){SP.user=LT.user;SP.lich=null;ssave()}route()});
