// Builds notes.html from course.html's own lesson data.
const fs=require('fs');
// Load the course data + chess helpers straight from course.html
const path=require('path'),vm=require('vm');
const ROOT=path.resolve(__dirname,'..','..');
const src=fs.readFileSync(path.join(ROOT,'course.html'),'utf8');
const a=src.indexOf("'use strict';"),z=src.indexOf('const today=');
if(a<0||z<0)throw new Error('course.html markers not found');
const L=vm.runInNewContext(src.slice(a,z)+';({COURSE,LINES,parseFEN,legal,make,san,findMove,md,inl,esc,sn,si,light,START_FEN})',{console});
const {KP,EXTRA}=require('./keypoints.js');
const {COURSE,LINES,parseFEN,legal,make,san,findMove,md,inl,esc,sn,si,light,START_FEN}=L;
const FILES='abcdefgh';
const GLYPH={K:'♚',Q:'♛',R:'♜',B:'♝',N:'♞',P:'♟'};
const isW=p=>p===p.toUpperCase();
let warnings=[],nBoards=0;

function xy(n,p){const f=FILES.indexOf(n[0]),r=+n[1]-1;return p==='b'?[7-f+.5,r+.5]:[f+.5,7-r+.5]}
function arrows(arr,p){if(!arr||!arr.length)return'';let s='<svg class="arrows" viewBox="0 0 8 8" aria-hidden="true">';
  for(const a of arr){const[x1,y1]=xy(a[0],p),[x2,y2]=xy(a[1],p);const dx=x2-x1,dy=y2-y1,Ln=Math.hypot(dx,dy),ux=dx/Ln,uy=dy/Ln;
    const hx=x2-ux*.18,hy=y2-uy*.18,bx=hx-ux*.42,by=hy-uy*.42,px=-uy*.24,py=ux*.24,cl=a[2]||'g',f=v=>+v.toFixed(3);
    s+=`<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(bx)}" y2="${f(by)}" class="ar ${cl}"/><polygon points="${f(hx)},${f(hy)} ${f(bx+px)},${f(by+py)} ${f(bx-px)},${f(by-py)}" class="ah ${cl}"/>`}
  return s+'</svg>'}
// o: {st|fen, persp, hl, arr, marks, dots, labels, cap, small, side}
function board(o){nBoards++;const st=o.st||parseFEN(o.fen||START_FEN);const persp=o.persp||'w';
  let h=`<figure class="fig${o.small?' small':''}"><div class="bwrap"><div class="board">`;
  for(let row=0;row<8;row++)for(let col=0;col<8;col++){const r=persp==='w'?7-row:row,f=persp==='w'?col:7-col,s=r*8+f,name=sn(s);
    const c=['sq',light(s)?'l':'d'];if(o.hl&&o.hl.includes(name))c.push('hl');const mk=o.marks&&o.marks[name];if(mk)c.push('m-'+mk);if(o.dots&&o.dots.includes(name))c.push('dot');
    let inner='';if(row===7)inner+=`<span class="cf">${FILES[f]}</span>`;if(col===0)inner+=`<span class="cr">${r+1}</span>`;
    if(o.labels)inner+=`<span class="lab">${name}</span>`;
    const p=st.b[s];if(p)inner+=`<span class="pc ${isW(p)?'w':'b'}">${GLYPH[p.toUpperCase()]}︎</span>`;
    h+=`<div class="${c.join(' ')}">${inner}</div>`}
  h+='</div>'+arrows(o.arr,persp)+'</div>';
  const tag=o.side?`<span class="sidetag ${o.side}">${o.side==='w'?'White':'Black'} ki chaal</span>`:'';
  if(o.cap||tag)h+=`<figcaption>${tag}${o.cap?inl(o.cap):''}</figcaption>`;
  return h+'</figure>'}

// play SAN list from a state; returns {sts, sans, moves}
function playLine(st,list,ctx){const sts=[st],sans=[],mv=[];for(const x of list){const m=findMove(st,x);if(!m){warnings.push(ctx+': cannot play '+x);break}
  sans.push(san(st,m,legal(st)));mv.push(m);st=make(st,m);sts.push(st)}return{sts,sans,mv}}
function numbered(sans,whiteFirst,start){start=start||1;let o=[],n=start,w=whiteFirst;
  sans.forEach((s,i)=>{if(w)o.push(`<b>${n}.</b>&nbsp;${esc(s)}`);else{o.push(i===0?`<b>${n}…</b>&nbsp;${esc(s)}`:esc(s));n++}w=!w});return o.join(' ')}
const lastArr=m=>m?[[sn(m.f),sn(m.t),'y']]:[];
const lastMarks=m=>m?{[sn(m.f)]:'last',[sn(m.t)]:'last'}:{};

function lessonHTML(Lv,li,les,lj){const key=Lv.id+'.'+les.id,anchor=Lv.id+'-'+les.id;
  let head=`<section class="lesson" id="${anchor}"><div class="lhead"><span class="lno">${li+1}.${lj+1}</span><div><h3>${esc(les.title)}</h3><p class="muted">${esc(les.sub||'')}</p></div></div>`;
  if(KP[key])head+=`<div class="yaad"><b class="eyebrow">Yaad rakho</b><ul>${KP[key].map(t=>'<li>'+inl(t)+'</li>').join('')}</ul></div>`;
  else warnings.push('no KP '+key);
  let qn=0,o='';const topics=[];
  // numbered topic heading (x.y.z) for every block
  const H=(kind,title)=>{const no=`${li+1}.${lj+1}.${topics.length+1}`,id=`${anchor}-${topics.length+1}`;const t=(kind?kind+': ':'')+title;topics.push({no,id,t});
    return `<h4 id="${id}"><span class="tno">${no}</span> ${kind?`<span class="kind">${esc(kind)}:</span> `:''}${esc(title)}</h4>`};
  les.steps.forEach((s,i)=>{const sk=key+'.'+i;
    if(s.t==='info'){o+=`<div class="blk">${H('',s.h||les.title)}`;
      const bd=(s.fen)?board({fen:s.fen,hl:s.hl,arr:s.arr,marks:s.marks,persp:s.flip?'b':'w'}):'';
      o+=`<div class="txt">${pts(s.md)}</div>${bd}</div>`}
    else if(s.t==='line'){const st0=s.fen?parseFEN(s.fen):parseFEN(START_FEN);const list=s.moves.trim().split(/\s+/);
      const r=playLine(st0,list,sk);const persp=s.flip||s.drill==='b'?'b':'w';
      o+=`<div class="blk line">${H('',s.h||'Game')}${s.md?`<div class="txt">${pts(s.md)}</div>`:''}${s.fen?board({st:st0,persp,side:st0.w?'w':'b',cap:'Shuruaati position',small:true}):''}<p class="moves">${numbered(r.sans,st0.w)}</p>`;
      const notes=Object.entries(s.notes||{}).map(([k,v])=>[+k,v]).sort((a,b)=>a[0]-b[0]);
      // mid diagram for long lines: the noted ply nearest the middle
      const N=r.sans.length;let mid=null;
      if(N>=12&&notes.length){const target=N/2;mid=notes.map(n=>n[0]).filter(k=>k<N-1&&k>2).sort((a,b)=>Math.abs(a-target)-Math.abs(b-target))[0]}
      if(notes.length)o+=`<ul class="notes">${notes.map(([k,v])=>`<li>${v.trim().startsWith('`')?'':`<span class="n">${esc(moveLabel(r.sans,st0.w,k))}</span> `}${inl(v).replace(/\n/g,'<br>')}</li>`).join('')}</ul>`;
      if(mid){const mm=r.mv[mid-1];o+=board({st:r.sts[mid],persp,arr:lastArr(mm),marks:lastMarks(mm),cap:`Position after ${moveLabel(r.sans,st0.w,mid)}`,small:true})}
      const lm=r.mv[r.mv.length-1];o+=board({st:r.sts[r.sts.length-1],persp,arr:lastArr(lm),marks:lastMarks(lm),cap:`Final position (${moveLabel(r.sans,st0.w,N)})`});
      o+='</div>'}
    else if(s.t==='move'){const st=parseFEN(s.fen||START_FEN);const side=st.w?'w':'b';
      const line=(s.line&&s.line.length?s.line:(LINES[sk]&&LINES[sk].line)||(s.sol?[s.sol]:[]));
      const r=playLine(st,line,sk);
      o+=`<div class="blk ex">${H('Abhyaas',short(s.q))}<div class="txt"><p>${inl(s.q||'')}</p></div>`;
      o+=board({st,persp:side,side});
      if(r.sans.length){const fm=r.mv[0];
        o+=`<details><summary>Jawab dekho</summary><p class="moves">${numbered(r.sans,st.w)}</p>`;
        if(s.ok&&s.ok.length>1)o+=`<p class="muted small">Ye bhi sahi: ${s.ok.filter(x=>x!==r.sans[0]).map(x=>'<span class="n">'+esc(x)+'</span>').join(' ')}</p>`;
        if(s.why)o+=`<div class="txt">${pts(s.why)}</div>`;
        o+=board({st:r.sts[r.sts.length-1],persp:side,arr:r.mv.length===1?lastArr(fm):[],marks:lastMarks(r.mv[r.mv.length-1]),cap:r.mv.length>1?'Line ke baad position':'Chaal ke baad',small:true});
        o+='</details>'}
      o+='</div>'}
    else if(s.t==='quiz'){qn++;o+=`<div class="blk quiz">${H('Sawal '+qn,short(s.q))}<p class="q">${inl(s.q)}</p>`;
      if(s.fen)o+=board({fen:s.fen,arr:s.arr,hl:s.hl,small:true,persp:s.flip?'b':'w'});
      if(s.pos)o+=`<div class="pos">${s.pos.map(l=>'<div>'+inl(l)+'</div>').join('')}</div>`;
      o+=`<details><summary>Jawab</summary><p class="ans">✓ ${inl(s.opts[s.a])}</p>${s.why?`<div class="txt">${pts(s.why)}</div>`:''}</details></div>`}
    else if(s.t==='reach'){const st=parseFEN(s.fen);const from=si(s.from);st.w=isW(st.b[from]);
      const dots=[...new Set(legal(st).filter(m=>m.f===from).map(m=>sn(m.t)))];
      o+=`<div class="blk">${H('Board par dekho',short(s.q.replace(/\*\*Saare squares tap karo\*\*, phir Check karo\.|Saare squares tap karo\./g,'').replace(/ ke saare squares tap karo\.?/g,' kahan ja sakta hai?').replace(/tap karo/g,'dekho')))}<p class="q">${inl(s.q.replace(/\*\*Saare squares tap karo\*\*, phir Check karo\.|Saare squares tap karo\.| ke saare squares tap karo\./g,'').replace(/tap karo/g,'dekho'))}</p>`;
      o+=board({st,dots,hl:[s.from],cap:`${dots.length} squares: ${dots.sort().join(', ')}`});
      if(s.why)o+=`<div class="txt">${pts(s.why)}</div>`;o+='</div>'}
    else if(s.t==='play'){const st=parseFEN(s.fen);const side=st.w?'w':'b';
      const g={mate:'Checkmate karo',promote:'Pawn ko queen banao',draw:'Draw bachao'}[s.goal]||'';
      o+=`<div class="blk ex">${H('Khud khelo',g)}<div class="txt"><p>${inl(s.q||'')}</p>${s.hint?`<p class="muted">Hint: ${inl(s.hint)}</p>`:''}${s.why?pts(s.why):''}</div>`;
      o+=board({st,persp:side,side});
      o+=`<p><a class="btn small" href="course.html#/lesson/${li}/${lj}">Course mein ye position khelo ›</a></p></div>`}
    // 'tap' steps are interactive drills only; skipped in notes
  });
  for(const x of (EXTRA[key]||[]))o+=`<div class="blk">${H('Diagram',short(x.cap))}${board(x)}</div>`;
  head+=`<nav class="ltoc"><b class="eyebrow">Is lesson ke topics</b><ol>${topics.map(t=>`<li><a href="#${t.id}"><span class="tno">${t.no}</span> ${esc(t.t)}</a></li>`).join('')}</ol></nav>`;
  o=head+o;
  o+=`<p class="lfoot"><a href="course.html#/lesson/${li}/${lj}">▶ Course mein ye lesson karo</a> · <a href="#top">↑ Upar</a></p></section>`;
  return o}
// Turn lesson text into bullet points: every sentence / list item becomes a point.
// A sentence ending with ":" followed by a list gets that list nested under it.
function pts(text){if(!text)return'';const items=[];let nestTo=null;
  const sent=t=>t.split(/(?<=[.!?])\s+(?=[A-Z`*"(])/).map(x=>x.trim()).filter(Boolean);
  for(const line of text.split(/\n/)){const l=line.trim();if(!l){nestTo=null;continue}
    if(/^- /.test(l)){const x=l.slice(2).trim();
      if(nestTo===null){const last=items[items.length-1];nestTo=(last&&/:$/.test(last.t))?last:false;if(nestTo)nestTo.sub=[]}
      if(nestTo)nestTo.sub.push(x);else items.push({t:x})}
    else{nestTo=null;sent(l).forEach(x=>items.push({t:x}))}}
  return'<ul class="pts">'+items.map(it=>'<li>'+inl(it.t)+(it.sub?'<ul>'+it.sub.map(x=>'<li>'+inl(x)+'</li>').join('')+'</ul>':'')+'</li>').join('')+'</ul>'}
function short(t){t=String(t||'').replace(/\*\*|`/g,'').trim();const m=t.match(/^(.{8,}?[.?!:])(\s|$)/);if(m)t=m[1].replace(/[.:]$/,'');return t.length>70?t.slice(0,67).replace(/\s+\S*$/,'')+'…':t}
function moveLabel(sans,wf,k){// k = ply count played
  const idx=k-1,ply=idx+(wf?0:1),n=Math.floor(ply/2)+1;return(ply%2===0?n+'.':n+'…')+sans[idx]}

let toc='',body='';let nLes=0;
COURSE.forEach((Lv,li)=>{
  toc+=`<details class="tocl"${li===0?' open':''}><summary><span class="lnum">${li+1}</span><span><b>${esc(Lv.title)}</b><small>${esc(Lv.sub)}</small></span></summary><ol>${Lv.lessons.map((les,lj)=>`<li><a href="#${Lv.id}-${les.id}">${li+1}.${lj+1} ${esc(les.title)}</a></li>`).join('')}</ol></details>`;
  body+=`<section class="level" id="${Lv.id}"><div class="lvhead"><span class="eyebrow">Level ${li+1}</span><h2>${esc(Lv.title)}</h2><p class="muted">${esc(Lv.sub)}</p>${Lv.intro?`<div class="intro">${pts(Lv.intro)}</div>`:''}</div>`;
  Lv.lessons.forEach((les,lj)=>{nLes++;body+=lessonHTML(Lv,li,les,lj)});
  body+=`</section>`});

const css=fs.readFileSync(__dirname+'/notes.css','utf8');
const html=`<!doctype html>
<html lang="hi-Latn">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#23664A">
<title>Chess Course Notes</title>
<meta name="description" content="Chess course ke poore notes: 7 levels, ${nLes} lessons, board diagrams ke saath.">
<style>
${css}
</style>
</head>
<body>
<header class="top" id="top"><div class="wrap"><a class="brand" href="#top"><i>♞</i> Course Notes</a><nav class="hl-links"><a href="course.html">Course</a><a href="index.html">Trainer</a></nav></div></header>
<main><div class="wrap">
<div class="hero"><span class="eyebrow">Basics se pro tak · 7 levels · ${nLes} lessons</span><h1>Chess course ke notes</h1>
<p class="muted">Har lesson ka saar, board diagrams, abhyaas positions aur sawal-jawab. Jawab chhupe hain: pehle khud socho, phir "Jawab dekho" dabao.</p>
<div class="dl"><a class="btn" href="downloads/Chess-Course-Notes.docx" download>⬇ Word file (.docx)</a><a class="btn" href="downloads/Chess-Course-Notes.txt" download>⬇ Text file (.txt)</a></div>
<div class="legend"><span><i class="lg arrow"></i> Arrow = chaal / attack</span><span><i class="lg hlb"></i> Peela = important square</span><span><i class="lg dotb"></i> Dot = piece yahan ja sakta hai</span></div></div>
<h2 class="toch">Fehrist (contents)</h2>
<div class="toc">${toc}</div>
${body}
<p class="muted end">Notes course.html ke lessons se bane hain. Course mein har lesson interactive hai: wahan khud khel kar pakka karo.</p>
</div></main>
<a class="totop" href="#top" aria-label="Upar jao">↑</a>
</body>
</html>
`;
fs.writeFileSync(process.argv[2]||path.join(ROOT,'notes.html'),html);
console.log('lessons',nLes,'boards',nBoards,'bytes',html.length);console.log(warnings.join('\n'));
