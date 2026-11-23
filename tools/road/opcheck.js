/* ================= Opening check: apni games se repertoire update =================
   My Games (Lichess) ke har game mein dekho opening book (packs/openings.json + Openings Ladder ki lines) kahan khatam hua,
   kisne pehle book chhoda, aur wahan engine ki best chaal kya thi. Galat/kamzor chaal = spaced review card (Course aur Road dono).
   Road ka route() badle bina: route ko wrap karta hai (#/opcheck). */
const OPC_K='mindseye.road.opcheck';
let OPC=(()=>{try{return JSON.parse(localStorage.getItem(OPC_K)||'{}')||{}}catch(e){return{}}})();
const opcSave=()=>{try{localStorage.setItem(OPC_K,JSON.stringify(OPC))}catch(e){}};
let OPB=null;
const opN=x=>String(x||'').replace(/[+#!?]/g,'');
async function opBook(){if(OPB)return OPB;const r=await fetch('packs/openings.json');if(!r.ok)throw new Error('Opening book load nahi hui');const E=await r.json();
  const pre=new Map();const node=k=>{let o=pre.get(k);if(!o){o={n:new Set(),name:''};pre.set(k,o)}return o};
  for(const[code,name,line]of E){const m=line.split(' ').map(opN);for(let i=0;i<=m.length;i++){const o=node(m.slice(0,i).join(' '));if(i<m.length)o.n.add(m[i]);else o.name=code+' '+name}}
  const rep=new Map();
  if(typeof OPL!=='undefined')OPL.data.levels.forEach(lv=>lv.lessons.forEach(l=>l.steps.forEach(s=>{if(s.t!=='line'||s.game||s.fen)return;const m=s.moves.split(' ').map(opN);
    for(let i=0;i<m.length;i++){const k=m.slice(0,i).join(' ');if(!rep.has(k))rep.set(k,new Set());rep.get(k).add(m[i])}})));
  return OPB={pre,rep}}
/* game ka opening scan: pehli chaal jo book/repertoire mein nahi */
function opScan(g,B){if(g.fen)return null;const mv=g.moves.split(' ').filter(Boolean).map(opN);let name='',i=0;
  for(;i<mv.length;i++){const k=mv.slice(0,i).join(' ');const o=B.pre.get(k),r=B.rep.get(k);if(o&&o.name)name=o.name;if(!((o&&o.n.has(mv[i]))||(r&&r.has(mv[i]))))break}
  if(i>=mv.length||i<2)return null;const k=mv.slice(0,i).join(' ');const side=i%2===0?'w':'b';
  return{ply:i,who:side===g.color?'me':'opp',name:name||'Opening',move:g.moves.split(' ').filter(Boolean)[i],book:[...new Set([...(B.rep.get(k)||[]),...((B.pre.get(k)||{n:new Set()}).n)])].slice(0,6)}}
/* engine: user ki chaal (book chhodne wali, ya opponent ke chhodne ke baad ka jawab) best se kitni kamzor */
async function opJudge(g,sc){const sans=g.moves.split(' ').filter(Boolean);const ply=sc.who==='me'?sc.ply:sc.ply+1;if(ply>=sans.length)return null;
  let st=parseFEN(START_FEN);for(let i=0;i<ply;i++){const m=findMove(st,sans[i]);if(!m)return null;st=make(st,m)}
  const um=findMove(st,sans[ply]);if(!um)return null;await engStart();const r=await engEval(fenOf(st),900,2);const best=r.lines[0];if(!best)return null;
  const bestSan=sanLine(st,best.pv,1)[0];const before=wpLine(best);let drop=0;
  if(best.pv[0]!==uciOf(um)){const r2=await engEval(fenOf(make(st,um)),600,1);drop=Math.max(0,before-(100-wpLine(r2.lines[0])))}
  return{ply,fen:fenOf(st),mine:sanOf(st,um),best:bestSan,ev:evTxt(best,st.w),drop:Math.round(drop),line:sanLine(st,best.pv,5).join(' ')}}
function opCard(g,sc,j){const ok=[j.best];const st=parseFEN(j.fen);(sc.who==='me'?sc.book:[]).forEach(b=>{if(findMove(st,b)&&!ok.includes(b))ok.push(b)});
  return{t:'move',id:'opc.'+g.id+'.'+j.ply,fen:j.fen,line:[j.best],ok:sc.who==='me'?ok:undefined,
    q:`**Apni game** vs ${g.opp} (${sc.name}): yahan tumne \`${j.mine}\` khela. Behtar chaal?`,
    why:`Engine: \`${j.best}\` (${j.ev}). Line: ${j.line}.${sc.who==='me'&&sc.book.length?' Book/repertoire mein: '+sc.book.map(x=>'`'+x+'`').join(', ')+'.':''} Ise apne repertoire mein jodo.`}}
async function opRun(onProg){const B=await opBook();const L=gameList().filter(g=>!g.fen&&g.moves).slice(0,30);let n=0,cards=0;
  for(const g of L){n++;onProg&&onProg(n,L.length);if(OPC[g.id])continue;const sc=opScan(g,B);if(!sc){OPC[g.id]={none:1};continue}
    let j=null;try{j=await opJudge(g,sc)}catch(e){}
    OPC[g.id]={sc,j,at:Date.now()};if(j&&j.drop>=8){const c=opCard(g,sc,j);if(window.reviewAdd){window.reviewAdd(c,false);cards++}OPC[g.id].card=c.id}opcSave()}
  return cards}
function opRow(g){const R=OPC[g.id];if(!R||R.none||!R.sc)return'';const sc=R.sc,j=R.j;const mn=Math.floor(sc.ply/2)+1;
  const who=sc.who==='me'?'Tumne book chhoda':'Opponent ne book chhoda';
  const verdict=!j?'':j.drop>=8?`<span class="chip" style="background:#FCE8E6">Behtar tha: <b>${esc(j.best)}</b></span>`:`<span class="chip">Achha khela ✓</span>`;
  return`<div class="card stack" style="gap:4px"><div class="row" style="justify-content:space-between"><b>vs ${esc(g.opp)}</b><span class="small muted">${esc(RESN[g.res]||g.res)} · ${g.color==='w'?'White':'Black'}</span></div>
   <div class="small">${esc(sc.name)}</div><div class="small muted">${who}: move ${mn} par <b>${esc(sc.move)}</b>${sc.book.length?' (book: '+sc.book.map(esc).join(', ')+')':''}${j?` · tumhari chaal: ${esc(j.mine)}`:''}</div>
   <div class="row">${verdict}<button class="btn small" data-go="#/game/${esc(g.id)}">Game dekho</button></div></div>`}
function opSummary(){const by={};for(const g of gameList()){const R=OPC[g.id];if(!R||!R.sc)continue;const k=(g.color==='w'?'White: ':'Black: ')+R.sc.name.replace(/^[A-E]\d\d /,'').replace(/:.*$/,'');
  const o=by[k]=by[k]||{n:0,w:0,d:0,l:0,bad:0,ply:0};o.n++;o[g.res==='win'?'w':g.res==='draw'?'d':'l']++;if(R.j&&R.j.drop>=8)o.bad++;o.ply+=R.sc.ply}
  const rows=Object.entries(by).sort((a,b)=>b[1].n-a[1].n);if(!rows.length)return'';
  return`<div class="card"><b>Repertoire report</b><table class="small" style="width:100%;margin-top:6px"><tr><th align="left">Opening</th><th>Games</th><th>+/=/-</th><th>Book tak</th><th>Galti</th></tr>${rows.map(([k,o])=>`<tr><td>${esc(k)}</td><td align="center">${o.n}</td><td align="center">${o.w}/${o.d}/${o.l}</td><td align="center">${Math.round(o.ply/o.n/2)} chaal</td><td align="center">${o.bad}</td></tr>`).join('')}</table>
   <p class="small muted" style="margin:6px 0 0">Jahan "Galti" zyada ya "Book tak" kam hai, us opening ka Openings Ladder lesson dobara karo.</p></div>`}
function vOpCheck(){const app=$('#app');const L=gameList().filter(g=>!g.fen&&g.moves).slice(0,30);
  app.innerHTML=`<div class="stack"><button class="btn small backbtn" data-go="#/games">‹ My Games</button><h1>Opening check</h1>
   <p class="muted small">Apni Lichess games se repertoire update karo. Har game mein dekhte hain opening book kahan khatam hui, kisne pehle naya khela, aur wahan engine ki best chaal kya thi. Kamzor chaal ka card spaced review mein jaata hai, taaki agli baar sahi chaal yaad rahe.</p>
   <div class="row"><button class="btn primary" id="opgo">${L.some(g=>!OPC[g.id])?'Check karo':'Dobara dekho'}</button><button class="btn" data-go="#/games">Lichess se games laao</button></div><p class="small" id="opmsg">${L.length?'':'Pehle My Games mein Lichess se games laao.'}</p>
   <div id="opsum">${opSummary()}</div><div class="stack" id="oplist">${L.map(opRow).join('')}</div></div>`;
  $('#opgo').onclick=async()=>{const m=$('#opmsg');$('#opgo').disabled=true;try{const c=await opRun((i,n)=>{m.textContent=`Game ${i}/${n} check ho raha hai…`});m.textContent=c?`${c} naye review card bane. Review mein milenge.`:'Ho gaya. Koi naya card nahi.';
    $('#opsum').innerHTML=opSummary();$('#oplist').innerHTML=L.map(opRow).join('')}catch(e){m.textContent=e.message}$('#opgo').disabled=false}}
{const r0=route;route=function(){if((location.hash||'').startsWith('#/opcheck')){closeTutor();navOn();$('#app').innerHTML='';window.scrollTo(0,0);vOpCheck();return}return r0()}}
window.addEventListener('hashchange',()=>{if((location.hash||'').startsWith('#/opcheck'))route()});
