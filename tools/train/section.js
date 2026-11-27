/* Pro Training = course ka ek section (Main Course aur Road to 3000 dono mein, yeh code core ka hissa hai).
   7 modes, har mode ek ladder. Drills khud TRAIN mein hain aur course mein apne `after` lesson ke turant baad aate hain;
   yahan sirf unhe ek jagah dikhaate aur kholte hain (link asli lesson par, koi copy nahi). Taala wahi jo us lesson ka. */
const TR_MODES=[
 {id:'ev',ic:'📊',t:'Position eval',sub:'Material gino, phir 5 elements, phir engine jaisa number aur compensation'},
 {id:'eg',ic:'♔',t:'Endgame vs engine',sub:'Basic mates, king + pawn, Lucena/Philidor/Vancura, B+N mate'},
 {id:'df',ic:'🛡',t:'Defence',sub:'Check se bacho, piece bachao, phir only-move defence 2800 tak'},
 {id:'rs',ic:'⏱',t:'Time pressure',sub:'Clock ke saath: mate-in-1 rush se increment aur GM rush tak'},
 {id:'sp',ic:'🤺',t:'Sparring',sub:'Engine ke against khelo: develop aur castle se full engine tak'},
 {id:'gm',ic:'🎯',t:'Guess the move',sub:'Traps, openings, phir asli master games (2000 se 2800)'},
 {id:'mr',ic:'🔍',t:'Apne games ka review',sub:'Apne game ki galtiyan: blunders se GM level review tak'}];
const trRoad=()=>typeof ROAD_LEVELS!=='undefined';
const trMode=k=>TR_MODES.find(M=>k.slice(3,5)===M.id);
const trKeys=m=>TRAIN.map(T=>T.les.key).filter(k=>!m||k.slice(3,5)===m).sort((a,b)=>a.slice(3,5)===b.slice(3,5)?+a.slice(5)-+b.slice(5):0);
const trDone=k=>!!PR.done[k];
const trT=k=>TRAIN.find(T=>T.les.key===k);
function trTitle(k){const l=lesByKey(k);return l?l.title.replace(/^🏋\s*/,'').replace(/^Drill:\s*/,'').replace(/^./,c=>c.toUpperCase()):k}
/* khula hai? Main Course: lessonUnlocked (Unlock all bhi wahi dekhta hai). Road: Unlock all, ho chuka, pichhla level, ya aaj ka agla lesson. */
function trOpen(k){if(trDone(k))return true;
  if(trRoad()){if(OPENALL())return true;const L=ROAD_LEVELS.find(L=>L.lessons.includes(k));if(!L)return false;if(L.n<SP.lvl)return true;return L.n===SP.lvl&&nextLes()===k&&canLesson().ok}
  const l=lesByKey(k);return!!l&&lessonUnlocked(l)}
/* drill course mein kahan: "Level 3" (Road ke levels Road mein) */
function trWhere(k){if(trRoad()){const L=ROAD_LEVELS.find(L=>L.lessons.includes(k));return L?'Level '+L.n:''}const l=lesByKey(k);return l?'Level '+(l.li+1):''}
/* band drill: kaunsa zaroori lesson abhi baaki hai */
function trNeed(k){const T=trT(k);if(!T)return null;const n=T.needs.find(x=>!PR.done[x]);return n||T.after}
function trLockMsg(k){const n=trNeed(k);return n&&!PR.done[n]?`Pehle: ${esc(cgLesTitle(n).replace(/^🏋\s*/,''))}`:`${esc(trWhere(k))} mein, pichhle lesson ke baad khulega`}
const trHref=k=>cgLesHref(k);
function trGo(k){location.replace(trOpen(k)&&lesByKey(k)?trHref(k):'#/train')}
function trNextBtn(ks,label){const nx=ks.find(k=>!trDone(k));if(!nx)return`<button class="btn block" data-go="#/train">🏆 Sab poore · Pro Training kholo</button>`;
  const op=trOpen(nx);if(op)return`<button class="btn primary block" data-go="${trHref(nx)}">▶ ${label||'Agla drill'}: ${esc(trTitle(nx))} ›</button>`;
  const n=trNeed(nx);return`<button class="btn block" data-go="${!PR.done[n]&&lesByKey(n)?cgLesHref(n):'#/train'}">🔒 ${trLockMsg(nx)} ›</button>`}
function trPill(k,i){const d=trDone(k),op=trOpen(k),M=trMode(k);
  return`<button class="cgpill trpill${d?' pass':''}${!d&&op?' now':''}${op?'':' locked'}" ${op?`data-go="${trHref(k)}"`:'disabled'} title="${esc(trTitle(k))}">${d?'✓':op?(i+1):'🔒'}<small>${esc(trWhere(k))}</small></button>`}
function trMeter(n,N){return`<div class="cgmeter"><i style="width:${N?n/N*100:0}%"></i></div>`}
/* ek mode ka card: compact (section home) ya poori ladder (#/train/<mode>) */
function trModeCard(M,full){const ks=trKeys(M.id),n=ks.filter(trDone).length,all=n>=ks.length;
  let h=`<div class="card stack trmode${all?' cgok':''}" id="tr-${M.id}"><div class="cgsech"><b>${M.ic} ${esc(M.t)}</b><small class="muted">${all?'🏅 ':''}${n}/${ks.length} drills</small></div>
   <p class="small muted">${esc(M.sub)}</p>${trMeter(n,ks.length)}`;
  if(full){h+=`<ol class="trlad">${ks.map((k,i)=>{const d=trDone(k),op=trOpen(k),l=lesByKey(k)||{};
     return`<li><button class="trr${d?' pass':!d&&op?' now':''}${op?'':' locked'}" ${op?`data-go="${trHref(k)}"`:'disabled'}><span class="trn">${d?'✓':op?i+1:'🔒'}</span><span class="stack" style="gap:1px;text-align:left;min-width:0"><b>${esc(trTitle(k))}</b><small>${esc(trWhere(k))} · ${esc(l.sub||'')}</small>${!op?`<small class="trlk">${trLockMsg(k)}</small>`:''}</span></button></li>`}).join('')}</ol>`}
  else h+=`<div class="cgpills">${ks.map(trPill).join('')}</div>`;
  h+=`<div class="row wrap">${trNextBtn(ks)}${full?'':`<button class="btn small" data-go="#/train/${M.id}">Poori ladder ›</button>`}</div></div>`;return h}
function trHome(m){const app=$('#app'),road=trRoad(),ks=trKeys(),n=ks.filter(trDone).length,M=TR_MODES.find(x=>x.id===m);
  let o=`<div class="stack">${M?'<button class="back" data-go="#/train">‹ Pro Training</button>':road?'<button class="btn small backbtn" data-go="#/">‹ Today\'s Work</button>':'<button class="back" data-go="#/">‹ Course</button>'}
   <span class="eyebrow">Pro Training · course ka section</span><h1>${M?M.ic+' '+esc(M.t):'🏋 7 training modes'}</h1>
   <p class="muted">${M?esc(M.sub)+'. Har drill course mein apne zaroori lesson ke turant baad aata hai, aur wahi se khulta hai.':`${ks.length} drills, beginner se GM tak. Har drill course mein apne zaroori lessons ke baad aata hai (wahi taala, wahi progress). Yahan se kisi bhi mode ka agla drill seedha kholo.`}</p>
   <div class="card stack"><div class="cgsech"><b>Kul progress</b><small class="muted">${n}/${ks.length} drills</small></div>${trMeter(n,ks.length)}
   <div class="trchips">${TR_MODES.map(X=>{const a=trKeys(X.id);return`<button class="btn small${X.id===m?' primary':''}" data-go="#/train/${X.id}">${X.ic} ${esc(X.t)} <small>${a.filter(trDone).length}/${a.length}</small></button>`}).join('')}</div></div>`;
  if(M)o+=trModeCard(M,true);else o+=TR_MODES.map(X=>trModeCard(X,false)).join('');
  o+=trPlanHTML();
  o+=`<p class="small muted">Har drill: pehle practice (hint, undo), phir test (naye sawaal, 80% par pass). Drill poora = lesson poora, aur level test ke liye bhi ginta hai.</p></div>`;
  app.innerHTML=o;if(typeof setCtx==='function')setCtx({where:'Pro Training'+(M?': '+M.t:'')})}
/* kis level mein kaunse drills (Road mein Road ke levels) */
function trPlanHTML(){const rows=[];
  if(trRoad())ROAD_LEVELS.forEach(L=>{const ks=L.lessons.filter(k=>k.startsWith('tr.'));if(ks.length)rows.push([`Level ${L.n}: ${L.name}`,ks,'#/level/'+L.n])});
  else COURSE.forEach((L,li)=>{const ks=L.lessons.filter(l=>l.tr).map(l=>l.key);if(ks.length)rows.push([`Level ${li+1}: ${L.title}`,ks,'#/level/'+li])});
  if(!rows.length)return'';
  return`<details class="card cgr cgplan"><summary><b>📍 Course mein drills kahan aate hain</b></summary><p class="small muted">Pro Training course ka section hai: har level ke lessons ke beech uske drills. Level page par bhi yahi drills test se pehle dikhte hain.</p>
   <div class="cgplanl">${rows.map(([t,ks,href])=>{const d=ks.filter(trDone).length;return`<a class="cgpr${d>=ks.length?' pass':d?' now':''}" href="${href}"><span>${d>=ks.length?'✓':d?'▶':'·'}</span><b>${esc(t)}</b><small>${ks.map(k=>trMode(k).ic+' '+esc(trTitle(k))).join(' · ')}</small></a>`}).join('')}</div></details>`}
/* level page par, test se pehle: is level ke drills */
function trLevelHTML(ks){if(!ks.length)return'';const n=ks.filter(trDone).length,all=n>=ks.length;
  return`<h2 class="cgh">🏋 Pro Training (is level ka hissa)</h2><div class="card stack trsec${all?' cgok':''}"><div class="cgsech"><b>${ks.length} drill${ks.length>1?'s':''} is level mein</b><small class="muted">${n}/${ks.length} poore</small></div>
   <p class="small muted">Yeh drills is level ke lessons ke beech aate hain, aur level test se pehle poore karne hain.</p>
   <div class="stack" style="gap:6px">${ks.map(k=>{const d=trDone(k),op=trOpen(k),M=trMode(k);return`<button class="trr${d?' pass':!d&&op?' now':''}${op?'':' locked'}" ${op?`data-go="${trHref(k)}"`:'disabled'}><span class="trn">${d?'✓':op?M.ic:'🔒'}</span><span class="stack" style="gap:1px;text-align:left;min-width:0"><b>${esc(trTitle(k))}</b><small>${M.ic} ${esc(M.t)}${!op?' · '+trLockMsg(k):''}</small></span></button>`}).join('')}</div>
   <div class="row wrap">${trNextBtn(ks,'Drill karo')}<button class="btn small" data-go="#/train">🏋 Saare 7 modes ›</button></div></div>`}
/* course list / Road home ka section card */
function trFirstLi(){const ls=COURSE.flatMap(L=>L.lessons).filter(l=>l.tr);return ls.length?Math.min(...ls.map(l=>l.li)):-1}
function trSectionRow(){const ks=trKeys(),N=ks.length,n=ks.filter(trDone).length,lk=!unlockAll()&&!ks.some(trOpen);
  return`<button class="lvl cgsecrow trsecrow${lk?' locked':''}" data-go="#/train"><span class="lnum">🏋</span><span class="stack" style="gap:2px;text-align:left"><span class="eyebrow">Section · har level ke saath</span><b>Pro Training: 7 modes</b><small>${TR_MODES.map(M=>M.ic).join(' ')} ${N} drills: eval, endgame, defence, clock, sparring, guess the move, apne games.${lk?' Pehle: '+esc(cgLesTitle(trNeed(ks[0])||'')):''}</small>
   <span class="prog sm"><i style="width:${N?n/N*100:0}%"></i></span></span><span class="lst">${lk?'🔒':n>=N?'🏅':n+'/'+N}</span></button>`}
function trRoadSection(){const ks=trKeys(),N=ks.length,n=ks.filter(trDone).length;
  return`<h2>Pro Training</h2><div class="card stack trroad"><div class="cgsech"><b>🏋 7 modes · ${N} drills</b><small class="muted">${n>=N?'🏅 poora':n+'/'+N+' poore'}</small></div>${trMeter(n,N)}
   <p class="small muted">Road ka section: har level mein uske drills lessons ke beech aate hain. Yahan se kisi bhi mode ka agla drill kholo.</p>
   <div class="trchips">${TR_MODES.map(M=>{const a=trKeys(M.id);return`<button class="btn small" data-go="#/train/${M.id}">${M.ic} ${esc(M.t)} <small>${a.filter(trDone).length}/${a.length}</small></button>`}).join('')}</div>
   <button class="btn primary block" data-go="#/train">🏋 Pro Training kholo ›</button></div>`}
