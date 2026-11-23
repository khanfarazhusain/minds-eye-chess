/* ---------- Calculation Gym: 1 se 8 chaal tak, chhote-chhote steps, rule-based ----------
   Source: tools/calc/gym.js  (node tools/calc/inject.js isko course.html mein daalta hai; Road build.js wahan se leta hai).
   Puzzles: packs/calc (Lichess open puzzle database, CC0), tools/calc/build.js se bane.
   Har depth (apni chaalein) ke 6 steps: Asaan → Medium → Andhe → Mushkil → Poori line → GM.
   Step pass: kam se kam cgMinN(step) puzzles, aakhri 10 mein 8 saaf sahi (GM step: 9) bina hint/jhaank, aur sahi waalon ka median time target ke andar.
   Logical sequence: depth tabhi khulti hai jab uska rules lesson ho gaya, aur puzzle mein sirf woh themes aate hain jinka lesson ho chuka.
   Course gate: har level ka test tabhi jab Gym ladder us level tak pahunch gayi (CG_GATE). */
const CG_SEC=[0,15,30,50,75,100,140,180,240];
const CG_STAGE=[
 {k:'A',name:'Asaan',mode:'see',coach:1,lo:'min',hi:'q0',sub:'Board dikhega, coach saath'},
 {k:'B',name:'Medium',mode:'see',lo:'q0',hi:'q1',sub:'Board dikhega'},
 {k:'C',name:'Andhe',mode:'blind',lo:'min',hi:'q1',sub:'Dekho, yaad karo, phir board chhup jaata hai'},
 {k:'D',name:'Mushkil',mode:'see',lo:'q1',hi:'q2',sub:'Board dikhega, zyada mushkil'},
 {k:'E',name:'Poori line',mode:'line',lo:'q0',hi:'q2',sub:'Board nahi hilta: poori line dimaag mein'},
 {k:'F',name:'GM',mode:'line',lo:'q2',hi:'max',sub:'Sabse mushkil, poori line dimaag mein'}];
const CG_MODE={see:'Board dekh ke',cand:'Pehle candidates',blind:'Board chhupa ke',line:'Poori line dimaag mein'};
const CG_LES={1:'l2b.cg1',2:'l3b.cg2',3:'l3b.cg3',4:'l3b.cg3',5:'l3b.cg3',6:'l7.cg4',7:'l7.cg4',8:'l7.cg4'};
/* depth ke liye zaroori lesson (pehle rules, phir practice) */
const CG_NEED={1:'l2b.cg1',2:'l3b.cg2',3:'l3b.cg3',4:'l3b.cg3',5:'l3b.cg3',6:'l7.cg4',7:'l7.cg4',8:'l7.cg4'};
/* puzzle theme -> jis lesson mein sikhaya gaya. Lesson na hua ho to aisa puzzle nahi aata. */
const CG_TH={fork:'l3.fork',pin:'l3.pin',skewer:'l3.skewer',disc:'l3.disc',dblchk:'l3.disc',remdef:'l3.remove',deflect:'l3b.deflect',attract:'l3b.deflect',sac:'l3b.deflect',
  interfere:'l3b.more',clearance:'l3b.more',xray:'l3b.more',zwischen:'l3b.more',smother:'lm.smother',matepat:'lm.mates',
  pawnadv:'l6.pawns',pawnend:'l5.kp',zugzwang:'l5.square',rookend:'l5b.rook',queenend:'l5b.minor',minorend:'l5b.minor',quiet:'l6b.prophy',defence:'l6b.prophy',trapped:'l2b.safety'};
/* course level test ke liye Gym ka zaroori step (kitne steps pass) */
const CG_GATE={l2b:2,l3:5,l3b:8,lm:11,l6:14,l6b:17,l4:20,l4b:23,l5:26,l5b:29,l7:32,l7b:47};
const cgMinN=step=>15+step.d*5;
function cgKnown(k){if(!k||PR.done[k])return true;if(typeof cgRoadKnown==='function'&&cgRoadKnown(k))return true;const l=lesByKey(k);return!!(l&&l.li<PR.placed)}
const cgThemeOk=p=>!p[4].split(',').some(t=>CG_TH[t]&&!cgKnown(CG_TH[t]));
const CG_STEPS=[];[1,2,3,4,5,6,7,8].forEach(d=>CG_STAGE.forEach(s=>{if(d===1&&s.k==='E')return;CG_STEPS.push({i:CG_STEPS.length,id:d+s.k,d,st:s,mode:d===1&&s.mode==='line'?'blind':s.mode})}));
const CG_ROUTINE=['**Dhamki:** opponent ki pichli chaal kya karna chahti hai? Mere kaunse piece par khatra hai?','**Target:** kaunse pieces bina protection hain? King kitna khula hai? Kaun do kaam kar raha hai?','**Candidates:** 2-3 chaalein chuno. Pehle checks, phir captures, phir threats.','**Line:** ek candidate ko end tak socho. Har chaal par opponent ka sabse forcing jawab lo.','**Ruko:** line tab roko jab koi check, capture ya threat na bache. Phir material gino.','**Blunder check:** chalne se pehle dekho ki opponent ke paas koi check, capture ya threat to nahi bacha.'];
const CG_SKIP=['Pehle forcing chaalein dekho. Quiet chaal tabhi socho jab forcing se kuch na mile.','Jo chaal bina check ya mate ke apna piece latka de, use chhod do.','Opponent ke jawab mein pehle uske checks aur captures dekho, phir 1 best defence. Baaki jawab chhod do.','Har line ek hi baar socho aur end mein uska nateeja yaad rakho (+3, barabar, mate). Dobara mat socho.','Ek candidate saaf jeet de raha ho to baaki chhod do. Simple jeet sundar jeet se behtar hai.','Jahan position shaant ho jaaye, wahin ruko. Usse aage sochna time ki barbaadi hai.'];
let CGI=null;const CGB={};
const CGSK='mindseye.calc.seen';let CGSEEN=new Set();try{(localStorage.getItem(CGSK)||'').split(',').forEach(x=>x&&CGSEEN.add(x))}catch(e){}
function cgSeen(id){CGSEEN.delete(id);CGSEEN.add(id);let a=[...CGSEEN];if(a.length>20000){a=a.slice(-20000);CGSEEN=new Set(a)}try{localStorage.setItem(CGSK,a.join(','))}catch(e){}}
function cgS(){if(!PR.cg)PR.cg={f:0,s:{},day:{d:'',n:0,ok:0}};if(PR.cg.day.d!==today())PR.cg.day={d:today(),n:0,ok:0};return PR.cg}
function cgStat(step){const hh=(cgS().s[step.id]||{h:[]}).h,L=hh.slice(-10),good=L.filter(x=>x[0]&&x[2]);const ts=good.map(x=>x[1]).sort((a,b)=>a-b);
  return{n:hh.length,last:L.length,ok:good.length,med:ts.length?ts[Math.floor(ts.length/2)]:0,acc:L.length?good.length/L.length:0}}
const cgTarget=step=>Math.round(CG_SEC[step.d]*(step.mode==='see'?1:1.5));
const cgNeedOk=step=>step.st.k==='F'?9:8;
function cgPassed(step){const s=cgStat(step);return s.n>=cgMinN(step)&&s.last>=10&&s.ok>=cgNeedOk(step)&&s.med<=cgTarget(step)}
const cgLesOk=step=>cgKnown(CG_NEED[step.d]);
const cgOpen=i=>i<=cgS().f&&cgLesOk(CG_STEPS[i]);
async function cgIdx(){if(!CGI)CGI=await(await fetch('packs/calc/index.json')).json();return CGI}
async function cgChunk(d,k){const key=d+'_'+k;if(!CGB[key])CGB[key]=await(await fetch(`packs/calc/t${d}_${k}.json`)).json();return CGB[key]}
function cgRange(step){const T=CGI.tiers[step.d];const v=k=>k==='min'?0:k==='max'?4000:T.q[+k[1]];return[v(step.st.lo),v(step.st.hi)]}
async function cgPick(step){await cgIdx();const[a,b]=cgRange(step);
  const ch=CGI.tiers[step.d].chunks.map((c,k)=>[c,k]).filter(([c])=>c[1]>=a&&c[0]<=b).map(x=>x[1]);
  for(const k of shuffle(ch)){const arr=(await cgChunk(step.d,k)).filter(p=>p[3]>=a&&p[3]<=b&&!CGSEEN.has(p[0])&&cgThemeOk(p));if(arr.length)return arr[rnd(arr.length)]}
  // sab dekh liye: sabse purane dekhe hue wapas (tab tak bhool chuke hote ho)
  for(const id of CGSEEN)for(const k of ch){const p=(await cgChunk(step.d,k)).find(p=>p[0]===id&&p[3]>=a&&p[3]<=b&&cgThemeOk(p));if(p)return p}
  return null}
/* notation: 'san' (Nxd5), 'words' (Knight takes Pawn), 'both'. User apni pasand chunta hai (Gym home par). */
const cgNot=()=>(PR.g&&PR.g.cgNot)||'both';
const CG_PN={K:'King',Q:'Queen',R:'Rook',B:'Bishop',N:'Knight',P:'Pawn'};
function cgWords(st,san){const m=findMove(st,san);if(!m)return san;const pc=(st.b[m.f]||'P').toUpperCase();let w;
  if(pc==='K'&&Math.abs((m.f&7)-(m.t&7))===2)w=(m.t&7)>4?'Castles kingside':'Castles queenside';
  else{const cap=st.b[m.t]||(pc==='P'&&(m.f&7)!==(m.t&7)?'p':null);w=CG_PN[pc]+(cap?' takes '+CG_PN[cap.toUpperCase()]+' on '+sn(m.t):' to '+sn(m.t));if(m.promo)w+=', becomes '+CG_PN[m.promo.toUpperCase()]}
  const n=make(st,m);if(inCheck(n))w+=legal(n).length?', check':', checkmate';return w}
function cgShow(st,san){const k=cgNot();return k==='san'?san:k==='words'?cgWords(st,san):san+' ('+cgWords(st,san)+')'}
function cgSeq(st0,sans){let st=st0;return sans.map(x=>{const t=cgShow(st,x);const m=findMove(st,x);if(m)st=make(st,m);return t})}
/* galti ka rule-based kaaran: kaunsa rule toda */
function cgWhy(st,m,exp){const e=findMove(st,exp);if(!e)return'';const ms=sanOf(st,m),es=exp;
  const chk=s=>/[+#]/.test(s),cap=s=>/x/.test(s);const n=make(st,m),to=m.t,pc=n.b[to];
  const val={P:1,N:3,B:3,R:5,Q:9,K:0}[(pc||'P').toUpperCase()];
  if(pc&&val>=3&&!chk(ms)&&attacked(n.b,to,!st.w)&&!attacked(n.b,to,st.w))return'**Skip rule 2:** is chaal se tumhara '+({N:'knight',B:'bishop',R:'rook',Q:'queen'}[pc.toUpperCase()])+' latak gaya. Aisi chaal pehle hi chhod do.';
  if(chk(es)&&!chk(ms))return'**Rule 3 (Candidates):** sabse pehle **checks** dekho. Sahi chaal ek check thi.';
  if(cap(es)&&!chk(ms)&&!cap(ms))return'**Rule 3 (Candidates):** checks ke baad **captures** dekho. Sahi chaal ek capture thi.';
  if(!chk(es)&&!cap(es)&&(chk(ms)||cap(ms)))return'**Quiet chaal:** yahan check ya capture kaam nahi karta. Jab forcing se kuch na mile, ek **threat** (quiet chaal) dhundo.';
  return'**Rule 4 (Line):** tumhari chaal ke baad opponent ke paas achha jawab hai. Har candidate ko opponent ke sabse forcing jawab tak socho.'}
/* ek puzzle chalao. done(ok, sec, clean, info) */
function cgPlay(el,p,step,mode,coach,done){const st0=parseFEN(p[1]),line=p[2].split(' '),me=st0.w,persp=me?'w':'b',nMe=Math.ceil(line.length/2);
  let st=st0,ply=0,fin=false,t0=Date.now(),clean=true,phase=mode==='blind'||mode==='cand'?'pre':'go',cands=[],sel=null,entered=[],hints=0;
  const top=h('div','row cgtop');top.innerHTML=`<span class="sidetag ${persp}">${me?'White':'Black'} ki chaal</span><span class="chip">${nMe} chaal${nMe>1?'ein':''}</span><span class="chip">${CG_MODE[mode]}</span><span class="chip cgclock">0s / ${cgTarget(step)}s</span>`;el.appendChild(top);
  const pr=h('div','prompt');el.appendChild(pr);const bh=h('div','cgb');el.appendChild(bh);
  const log=h('div','moves cglog');el.appendChild(log);const bar=h('div','row cgbar');el.appendChild(bar);
  const rt=h('details','cgr');rt.open=!!coach;rt.innerHTML='<summary>🧭 Sochne ka routine (6 steps)</summary><ol>'+CG_ROUTINE.map(x=>'<li>'+inl(x)+'</li>').join('')+'</ol>';el.appendChild(rt);
  const B=Board(bh,{st:st0,persp,onTap:tap});
  const clock=top.querySelector('.cgclock');const iv=setInterval(()=>{if(!document.body.contains(el)||fin){clearInterval(iv);return}const s=Math.round((Date.now()-t0)/1000);clock.textContent=s+'s / '+cgTarget(step)+'s';clock.classList.toggle('late',s>cgTarget(step))},500);
  const say=t=>{pr.innerHTML=md(t)};
  const lineState=()=>{let s=st0;for(const x of entered)s=make(s,findMove(s,x));return s};
  const cur=()=>mode==='line'?lineState():st;
  const showP=()=>!(mode==='blind'&&phase==='go');
  function draw(){B.set({st:mode==='line'?st0:showP()?st:null,arr:phase==='pre'&&mode==='cand'?cands.map(c=>[c.f,c.t,'b']):[]})}
  function moveNo(k){const idx=k+(st0.w?0:1);return Math.floor(idx/2)+(st0.fm||1)+(idx%2?'…':'.')}
  function renderLog(arr,mark){const sh=cgSeq(st0,arr);log.innerHTML=sh.map((x,k)=>`<span class="mv${mark===k?' bad':''}">${(k===0||(k+(st0.w?0:1))%2===0)?`<span class="mn">${moveNo(k)}</span> `:''}${esc(x)}</span>`).join(' ')}
  function tap(n){if(fin||B.lock)return;if(mode==='blind'&&phase==='pre')return;const c=cur();
    if(sel){const ms=legal(c).filter(m=>sn(m.f)===sel&&sn(m.t)===n);
      if(ms.length){sel=null;B.marks={};B.dots=[];if(ms.length>1&&ms[0].promo)promoPick(B.el,c.w,q=>act(ms.find(m=>m.promo===q)));else act(ms[0]);return}}
    const pc=c.b[si(n)];
    if(pc&&isW(pc)===c.w&&sel!==n){sel=n;B.marks={[n]:'sel'};B.dots=mode==='see'||mode==='cand'?legal(c).filter(m=>sn(m.f)===n).map(m=>sn(m.t)):[]}
    else{if(sel&&!showP()||sel&&mode==='line')say('Yeh chaal legal nahi. Dimaag mein position dobara dekho: piece kahan hai, raasta khula hai?');sel=null;B.marks={};B.dots=[]}
    draw()}
  function act(m){
    if(phase==='pre'&&mode==='cand'){const s=sanOf(st,m);if(cands.some(c=>c.s===s))cands=cands.filter(c=>c.s!==s);else if(cands.length<3)cands.push({s,f:sn(m.f),t:sn(m.t)});candPrompt();draw();return}
    if(mode==='line'){const c=lineState();entered.push(sanOf(c,m));linePrompt();if(entered.length>=line.length||mates(make(c,m)))checkLine();return}
    const mySan=sanOf(st,m),exp=line[ply];let ok=sameSan(mySan,exp);if(!ok&&ply===line.length-1&&mates(make(st,m)))ok=true;
    if(!ok)return fail(cgWhy(st,m,exp),cgShow(st,mySan),ply);
    B.last=[sn(m.f),sn(m.t)];st=make(st,m);ply++;draw();renderLog(line.slice(0,ply));
    if(ply>=line.length||mates(st))return win();
    B.lock=true;setTimeout(()=>{const r=findMove(st,line[ply]);const rs=cgShow(st,line[ply]);B.last=[sn(r.f),sn(r.t)];st=make(st,r);ply++;B.lock=false;draw();renderLog(line.slice(0,ply));
      say(`Opponent ne **${rs}** khela.${showP()?'':' (Board chhupa hai: dimaag mein yeh chaal lagao.)'} Ab tumhari chaal: ${Math.ceil((line.length-ply)/2)} baaki.`)},450)}
  function candPrompt(){say(`**Step 3 · Candidates:** 1-3 chaalein chuno (neela teer). Pehle **checks**, phir **captures**, phir **threats**. Chuni hui: ${cands.length?cands.map(c=>'**'+cgShow(st,c.s)+'**').join(', '):'koi nahi'}.`);gb.disabled=!cands.length}
  function linePrompt(){renderLog(entered);say(`Poori line daalo: apni chaal, phir opponent ka **best jawab**, phir apni... Board nahi hilega, sab dimaag mein. **${entered.length}/${line.length}** (apni aur opponent ki chaalein milake). Agli: **${entered.length%2?'opponent ka jawab':'tumhari chaal'}**.`)}
  function checkLine(){let i=0;for(;i<entered.length;i++){if(sameSan(entered[i],line[i]))continue;if(i%2===0&&i===line.length-1){const s=lineState();if(mates(s))continue}break}
    if(i>=line.length||(i===entered.length&&mates(lineState())))return win();
    if(i>=entered.length)return fail('**Rule 5 (Ruko):** line adhoori reh gayi. Position abhi shaant nahi thi, aage aur forcing chaalein thi.',null,i);
    let s=st0;for(let k=0;k<i;k++)s=make(s,findMove(s,entered[k]));const shE=cgShow(s,entered[i]),shL=cgShow(s,line[i]);
    if(i%2===0)return fail(cgWhy(s,findMove(s,entered[i]),line[i]),shE,i);
    return fail(`**Opponent ka jawab:** tumne socha opponent **${shE}** khelega, par uska best jawab **${shL}** tha. Opponent ke liye bhi pehle checks, captures, phir best defence socho.`,entered[i],i)}
  function secs(){return Math.round((Date.now()-t0)/100)/10}
  function win(){fin=true;B.lock=true;const s=secs();st=mode==='line'?lineState():st;B.set({st,arr:[]});renderLog(line);
    const candHit=mode==='cand'?cands.some(c=>sameSan(c.s,line[0])):null;const fast=s<=cgTarget(step);
    fb(el,true,`Sahi! ✓ ${s}s ${fast?'⚡':''}`,(fast?'Target time ke andar.':`Sahi hai, par target ${cgTarget(step)}s hai. Agli baar routine se tez socho.`)+(candHit===false?'\n\nSahi chaal tumhari candidate list mein nahi thi. Candidates mein pehle checks aur captures daalo.':'')+(clean?'':'\n\nHint ya jhaank use hua, isliye yeh step ke score mein nahi gina.'));
    done(true,s,clean,{candHit})}
  function fail(msg,tried,at){fin=true;B.lock=true;const s=secs();if(mode==='line')renderLog(entered,at);phase='done';draw();
    fb(el,false,tried?`Galat: ${tried}`:'Line poori nahi',`Sahi line: **${cgSeq(st0,line).join(' · ')}**\n\n${msg||''}`);
    const rb=h('button','btn small','▶ Sahi line board par dekho');el.appendChild(rb);
    rb.onclick=()=>{rb.disabled=true;let s2=st0,k=0;B.last=null;B.set({st:s2,arr:[]});const go=()=>{if(k>=line.length)return;const m=findMove(s2,line[k]);B.last=[sn(m.f),sn(m.t)];s2=make(s2,m);k++;B.set({st:s2});renderLog(line.slice(0,k));setTimeout(go,900)};setTimeout(go,600)};
    done(false,s,clean,{})}
  // buttons per mode
  const gb=h('button','btn primary','Calculate karo ›'),hb=h('button','btn small','👁 Bas 2 second jhaanko'),ub=h('button','btn small','↶ Hatao'),cb=h('button','btn primary','Line check karo'),hint=h('button','btn small','💡 Hint');
  if(mode==='cand'){bar.append(gb);gb.onclick=()=>{phase='go';gb.remove();draw();say(`Ab chalo. Apni candidate list se shuru karo aur har chaal par opponent ka sabse forcing jawab socho.`)};candPrompt()}
  else if(mode==='blind'){const rd=h('button','btn primary','Yaad ho gaya, board chhupao ›');bar.append(rd);
    say(`Position dhyan se dekho. **Poori line dimaag mein socho** (${nMe} chaal${nMe>1?'ein':''}). Ready ho to board chhupao. Phir khali board par chaalein chalo.`);
    rd.onclick=()=>{phase='go';rd.remove();bar.append(hb);draw();say('Board chhup gaya. Khali board par apni pehli chaal chalo: pehle piece ka square, phir jahan jaana hai.')};
    hb.onclick=()=>{if(fin)return;clean=false;phase='peek';draw();setTimeout(()=>{if(!fin){phase='go';draw()}},2000)}}
  else if(mode==='line'){bar.append(ub,cb);ub.onclick=()=>{if(fin)return;entered.pop();linePrompt()};cb.onclick=()=>{if(!fin&&entered.length)checkLine()};linePrompt()}
  else say(coach?`**Routine se socho** (neeche list hai). ${nMe>1?`Poori line (${nMe} chaalein) socho, phir pehli chaal chalo.`:'Ek chaal mein jeet hai.'}`:`Sabse achhi line dhundo (${nMe} chaal${nMe>1?'ein':''}).`);
  if(coach&&mode!=='line'){bar.append(hint);hint.onclick=()=>{if(fin)return;clean=false;hints++;const f=findMove(cur(),line[ply]);if(!f)return;
    const name={P:'pawn',N:'knight',B:'bishop',R:'rook',Q:'queen',K:'king'}[(cur().b[f.f]||'P').toUpperCase()];
    if(!showP())say(`Hint: tumhara **${name}** chalega${hints>1?`, square **${sn(f.t)}** par`:''}.`);else{B.marks=hints>1?{[sn(f.f)]:'ring',[sn(f.t)]:'ring'}:{[sn(f.f)]:'ring'};B.draw();B.marks={}}}}
  draw()}

function cgLesHref(k){if(typeof NEWLES!=='undefined')return'#/les/'+k;const l=lesByKey(k);return l?`#/lesson/${l.li}/${l.lj}`:'#/'}
function cgStepName(s){return`Depth ${s.d} · ${s.st.name}`}
function cgHome(){const app=$('#app');const S=cgS(),F=Math.min(S.f,CG_STEPS.length-1),cur=CG_STEPS[F],cs=cgStat(cur),done=S.f>=CG_STEPS.length;
  let o=`<div class="stack"><span class="eyebrow">Calculation Gym</span><h1>🧠 1 chaal se 8 chaal tak</h1>
   <p class="muted">${CG_STEPS.length} chhote steps, lagbhag 1,800+ puzzles. Har step: kam se kam 20-55 puzzles, aakhri 10 mein 8 bina hint ke sahi (GM step par 9), aur target time ke andar. Tab agla step khulta hai. Course ke har level ka test bhi Gym ke step se juda hai. Jitni practice lage utni karo: puzzles khatam nahi hote.</p>
   <div class="card stack cgnow">${done?'<b>🏆 Saare steps poore! Ab GM steps roz karte raho.</b>':`<span class="eyebrow">Tumhara step ${F+1}/${CG_STEPS.length}</span><h2>${esc(cgStepName(cur))}</h2><p class="muted">${esc(cur.st.sub)} · ${CG_MODE[cur.mode]} · target ${cgTarget(cur)}s</p>
     <div class="cgmeter"><i style="width:${Math.min(100,Math.min(cs.n/cgMinN(cur),cs.ok/cgNeedOk(cur))*100)}%"></i></div><p class="small muted">Puzzles ${Math.min(cs.n,cgMinN(cur))}/${cgMinN(cur)} · aakhri ${cs.last}: ${cs.ok} saaf sahi${cs.med?` · median ${cs.med}s`:''} · pass: ${cgNeedOk(cur)}/10 aur ≤${cgTarget(cur)}s</p>`}
     ${!done&&!cgLesOk(cur)?`<div class="card cgalert">🔒 Pehle yeh lesson karo: <a href="${cgLesHref(CG_NEED[cur.d])}">${esc((lesByKey(CG_NEED[cur.d])||{}).title||'rules lesson')}</a>. Pehle rules, phir practice.</div>`:`<button class="btn primary block" data-go="#/calc/run/${F}">${cs.n?'Practice jaari rakho ›':'Shuru karo ›'}</button>`}
     <p class="small muted">Aaj: ${S.day.n} puzzles, ${S.day.ok} sahi.</p></div>
   <div class="card stack"><b>Chaalein kaise dikhein?</b><div class="row wrap">${[['san','Nxd5'],['words','Knight takes Pawn'],['both','Dono']].map(([k,t])=>`<button class="btn small${cgNot()===k?' primary':''}" data-cgnot="${k}">${t}</button>`).join('')}</div><small class="muted">Jo aaraam se padh sako, wahi chuno. Board par chaal chalna dono mein same hai.</small></div>
   <details class="card cgr" open><summary><b>🧭 Har puzzle ka routine (6 steps)</b></summary><ol>${CG_ROUTINE.map(x=>'<li>'+inl(x)+'</li>').join('')}</ol></details>
   <details class="card cgr"><summary><b>✂️ Kya chhodna hai (skip rules)</b></summary><ol>${CG_SKIP.map(x=>'<li>'+inl(x)+'</li>').join('')}</ol></details>
   <h2>Ladder</h2><div class="cglad">`;
  for(let d=1;d<=8;d++){o+=`<div class="cgrow"><b class="cgd">${d}</b><div class="cgpills">`;
    for(const s of CG_STEPS.filter(x=>x.d===d)){const op=cgOpen(s.i),pass=s.i<S.f,now=s.i===S.f;
      o+=`<button class="cgpill${pass?' pass':''}${now?' now':''}${op?'':' locked'}" ${op?`data-go="#/calc/run/${s.i}"`:'disabled'} title="${esc(cgStepName(s))}">${pass?'✓':op?s.st.k:'🔒'}<small>${esc(s.st.name)}</small></button>`}
    o+='</div></div>'}
  o+=`</div><p class="small muted">A Asaan · B Medium · C Andhe (board chhupa) · D Mushkil · E Poori line dimaag mein · F GM. Depth = kitni apni chaalein.</p>`;
  const nd=cur&&!done?CG_STEPS.find(x=>x.d===cur.d+1&&cgLesOk(x)):null;
  if(nd)o+=`<div class="card stack"><b>Pehle se aata hai?</b><p class="small muted">Depth ${nd.d} ka jump test: 5 puzzles. 4 bina hint ke sahi, target time ke andar, to seedha Depth ${nd.d} khul jaayega.</p><button class="btn block" data-go="#/calc/jump/${nd.i}">Jump test do ›</button></div>`;
  o+=`<div class="card stack"><b>📘 Rules ke lessons</b><div class="row wrap">${[['l2b.cg1','1: Routine aur 1 chaal'],['l3b.cg2','2: Skip rules aur 2 chaal'],['l3b.cg3','3: 3-5 chaal ka tree'],['l7.cg4','4: Legendary 6-8 chaal']].map(([k,t])=>`<a class="btn small" style="text-decoration:none" href="${cgLesHref(k)}">${t}</a>`).join('')}</div>
    <p class="small muted">Board dimaag mein nahi tikta? Pehle <a href="index.html">Trainer</a> ki blindfold drills karo, phir "Andhe" steps.</p></div>
   <p class="small muted">Puzzles: Lichess open puzzle database (CC0).</p></div>`;
  app.innerHTML=o;app.querySelectorAll('[data-cgnot]').forEach(b=>b.onclick=()=>{PR.g.cgNot=b.dataset.cgnot;save();cgHome()});setCtx({where:'Calculation Gym'})}

function cgRun(i,opt){opt=opt||{};const step=CG_STEPS[i],app=$('#app');if(!step||(!cgOpen(i)&&!opt.test))return go('#/calc');
  if(!cgLesOk(step))return go('#/calc');const S=cgS();let n=0,okN=0,retry=[],lastOk=[];const test=!!opt.test,TN=5;
  const top=h('div','qhead');top.innerHTML=`<button class="x" aria-label="Back">‹</button><div class="prog"><i></i></div><span class="count"></span>`;top.querySelector('.x').onclick=()=>go('#/calc');app.appendChild(top);
  const head=h('p','eyebrow');app.appendChild(head);const stage=h('div','stack');app.appendChild(stage);
  const foot=h('div','foot');const nb=h('button','btn primary block','Agla puzzle ›');foot.appendChild(nb);app.appendChild(foot);nb.onclick=()=>next();
  function bar(){const s=cgStat(step);if(test){top.querySelector('.count').textContent=`${n}/${TN}`;top.querySelector('.prog i').style.width=n/TN*100+'%'}
    else{top.querySelector('.count').textContent=`${s.ok}/8`;top.querySelector('.prog i').style.width=Math.min(100,s.ok/8*100)+'%'}
    head.textContent=(test?'Jump test · ':'')+cgStepName(step)+(step.st.k==='E'?'':' · '+CG_MODE[step.mode])}
  async function next(){if(test&&n>=TN)return testEnd();stage.innerHTML='<p class="muted">Puzzle aa raha hai…</p>';nb.disabled=true;bar();
    let p=null,again=false;const r=retry.findIndex(x=>x.at<=n);if(r>=0&&!test){p=retry.splice(r,1)[0].p;again=true}
    if(!p){try{p=await cgPick(step)}catch(e){}}
    if(!p){stage.innerHTML='<div class="card"><p>Puzzle nahi mila. Internet check karo. Agar internet theek hai to course ke agle lessons karo: naye themes khulte hi naye puzzles aayenge.</p></div>';return}
    const st=cgStat(step);const coach=!test&&(step.st.coach||(st.last>=5&&st.acc<0.6));
    const mode=coach&&step.mode==='see'&&step.d>1?'cand':step.mode;
    stage.innerHTML='';if(again)stage.appendChild(h('div','card cgalert','🔁 Yeh puzzle pehle galat hua tha. Ab routine se dobara socho.'));
    if(coach&&!step.st.coach)stage.appendChild(h('p','small muted','Coach mode on: aakhri puzzles mushkil lage, isliye routine aur hint saath hain.'));
    const box=h('div','stack step');stage.appendChild(box);
    cgPlay(box,p,step,mode,coach,(ok,sec,clean,info)=>{cgSeen(p[0]);n++;const good=ok&&clean;if(good)okN++;
      const S2=cgS();S2.day.n++;if(ok)S2.day.ok++;
      if(!again){const rec=S2.s[step.id]||(S2.s[step.id]={h:[]});rec.h.push([good?1:0,sec,clean?1:0]);if(rec.h.length>30)rec.h.splice(0,rec.h.length-30)}
      if(!ok&&!test)retry.push({p,at:n+3});
      touchDay();if(good)addXP(5+step.d*2);
      const mate=/#$/.test(p[2]);
      grade({t:'move',id:'calc.'+p[0],les:CG_LES[step.d],fen:p[1],line:p[2].split(' '),mate:mate?1:0,q:`Calculation: ${Math.ceil(p[2].split(' ').length/2)} chaal ki line. Pehle poori line socho, phir chalo.`,why:`Lichess puzzle [${p[0]}] · rating ${p[3]}`,hint:'Routine: dhamki, target, candidates (checks, captures, threats), line.'},good);
      if(typeof onCalcDone==='function')onCalcDone(good);
      let msg='';if(!test&&step.i===S2.f&&cgPassed(step)){S2.f++;const nx=CG_STEPS[S2.f];msg=nx?`🎉 **Step pass!** Agla step khul gaya: **${cgStepName(nx)}**.`:'🏆 **Poori ladder poori!** GM level ki calculation.'}
      save();bar();
      if(msg){const c=h('div','card cgok');c.innerHTML=md(msg);box.appendChild(c);if(CG_STEPS[S2.f]){const b=h('button','btn primary block','Agla step shuru karo ›');b.onclick=()=>go('#/calc/run/'+S2.f);box.appendChild(b)}}
      nb.disabled=false;nb.textContent=test&&n>=TN?'Nateeja dekho ›':'Agla puzzle ›';
      if(!test&&!msg){const s=cgStat(step);if(s.last>=10&&s.ok>=cgNeedOk(step)&&s.med>cgTarget(step))box.appendChild(h('p','small muted',`Accuracy pakki hai (${s.ok}/10). Ab sirf speed: sahi waalon ka median ${s.med}s, target ${cgTarget(step)}s.`));
        else if(s.last>=10&&s.ok>=cgNeedOk(step)&&s.n<cgMinN(step))box.appendChild(h('p','small muted',`Accuracy achhi hai. Step pakka karne ke liye ${cgMinN(step)-s.n} puzzles aur.`));
        else if(s.last>=10&&s.acc<0.5&&step.i>0)box.appendChild(h('div','card',`Yeh step abhi mushkil lag raha hai (${s.ok}/10). Koi baat nahi: <a href="#/calc/run/${step.i-1}">pichla step</a> thoda aur karo, ya routine ko dhyan se follow karo. Practice se hi hoga.`))}});
    window.scrollTo(0,0)}
  function testEnd(){const pass=okN>=4;const S2=cgS();if(pass&&S2.f<step.i){S2.f=step.i;save()}
    app.innerHTML=`<div class="stack center"><div class="big">${pass?'🚀':'💪'}</div><h1>${okN}/${TN}</h1><p>${pass?`Depth ${step.d} khul gaya. Ab wahan se practice karo.`:'Abhi apne step par practice karo. Jab ready lage, test phir do.'}</p><button class="btn primary block" data-go="#/calc">Gym par wapas</button></div>`}
  next()}

/* course level test ka gate: Gym ladder kahan tak pahunchi */
function cgGateMsg(levelId){const need=CG_GATE[levelId];if(!need||cgS().f>=need||PR.tests[levelId]>=70)return'';const LL=COURSE.find(x=>x.id===levelId);if(LL&&LL.li<PR.placed)return'';const st=CG_STEPS[Math.min(need,CG_STEPS.length)-1];
  return`🧠 **Calculation Gym pehle:** is level ka test dene se pehle Gym mein **${cgStepName(st)}** tak pass karo (abhi step ${cgS().f}/${need}). Pro banne ke liye practice course ka hissa hai.`}
