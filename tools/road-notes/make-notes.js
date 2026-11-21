// Road to 3000: sirf theory (info + line slides) ke notes -> PDF
// Chalane ka tareeka: repo root se `python3 -m http.server 8765` chalao, phir `node tools/road-notes/<script>.js out.pdf`. Lesson number (jaise 1.3) app ki Level list jaisa hai.
const {chromium}=require('playwright');const fs=require('fs');const S=__dirname+'/';const OUT=process.argv[2]||S+'notes.pdf';
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:900,height:1200}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.route('https://lichess.org/**',r=>r.fulfill({status:200,contentType:'application/json',body:'{}'}));
await p.goto('http://localhost:8765/road.html');await p.waitForTimeout(900);
const stats=await p.evaluate(()=>{
  const css=[...document.querySelectorAll('style')].map(s=>s.textContent).join('\n');const bodyCls=document.body.className;
  const G={K:'♔',Q:'♕',R:'♖',B:'♗',N:'♘',P:'♙',k:'♚',q:'♛',r:'♜',b:'♝',n:'♞',p:'♟'};
  const dia=(fen,o)=>{try{const st=parseFEN(fen),mp=toMap(st.b),fl=!!o.flip;const xy=q=>{const f=q.charCodeAt(0)-97,r=+q[1]-1;return fl?[7-f,r]:[f,7-r]};let s='<svg class="dg" viewBox="0 0 8 8" xmlns="http://www.w3.org/2000/svg">';
    for(let y=0;y<8;y++)for(let x=0;x<8;x++){const f=fl?7-x:x,r=fl?y:7-y,q=String.fromCharCode(97+f)+(r+1);const hl=(o.hl||[]).includes(q);s+=`<rect x="${x}" y="${y}" width="1" height="1" fill="${hl?'#F2D16B':(x+y)%2?'#7A9A63':'#EBE5D0'}"/>`}
    for(const q in mp){const[x,y]=xy(q);const pc=mp[q];const w=pc===pc.toUpperCase();s+=`<text x="${x+.5}" y="${y+.8}" font-size=".86" text-anchor="middle" fill="${w?'#fff':'#111'}" stroke="${w?'#111':'none'}" stroke-width=".03" font-family="DejaVu Sans,Segoe UI Symbol,sans-serif">${G[w?pc.toUpperCase():pc.toLowerCase()].replace('♙','♟').replace('♔','♚').replace('♕','♛').replace('♖','♜').replace('♗','♝').replace('♘','♞')}</text>`}
    const C={g:'#1F9D5A',r:'#D2462C',y:'#E0A100',b:'#2D6CDF'};for(const a of o.arr||[]){const[x1,y1]=xy(a[0]),[x2,y2]=xy(a[1]);const c=C[a[2]]||C.g;const dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L,hx=x2+.5-ux*.2,hy=y2+.5-uy*.2,bx=hx-ux*.38,by=hy-uy*.38;
      s+=`<line x1="${x1+.5}" y1="${y1+.5}" x2="${bx}" y2="${by}" stroke="${c}" stroke-width=".16" opacity=".85"/><polygon points="${hx},${hy} ${bx-uy*.22},${by+ux*.22} ${bx+uy*.22},${by-ux*.22}" fill="${c}" opacity=".85"/>`}
    return s+'<rect x="0" y="0" width="8" height="8" fill="none" stroke="#33443A" stroke-width=".05"/></svg>'}catch(e){return''}};
  const lineHTML=s=>{const mv=s.moves.trim().split(/\s+/).map(x=>x.replace(/^\d+\.(\.\.)?/,'')).filter(Boolean);let st=parseFEN(s.fen||START_FEN);const fen0=st;const num=[];const sw=st.w;
    let plyNo=0;for(const x of mv){const m=findMove(st,x);if(!m)break;num.push((st.w?`${st.fm}. `:(plyNo===0?`${st.fm}... `:''))+x);st=make(st,m);plyNo++}
    const notes=s.notes?Object.keys(s.notes).sort((a,b)=>a-b).map(k=>`<li>${inl(s.notes[k])}</li>`).join(''):'';
    return`${s.md?md(s.md):''}<p class="mv"><b>Line:</b> ${esc(num.join(' '))}</p>${notes?`<ul class="nt">${notes}</ul>`:''}<div class="dgw">${dia(fenOf(st),{})}<div class="cap">Line ke baad ki position</div></div>`};
  let n=0,nl=0,nline=0;const toc=[],idx=[];let body='';
  ROAD_LEVELS.forEach(L=>{let lv='';const li=[];L.lessons.forEach((k,i)=>{const les=lesOf(k);if(!les)return;const no=`${L.n}.${i+1}`;li.push(`<li><b>${no}</b> ${esc(les.title)}</li>`);const th=(les.steps||[]).filter(s=>s.t==='info'||s.t==='line');nl++;
      if(!th.length){lv+=`<section class="les"><h2><span class="no">Lesson ${no}</span> ${esc(les.title)}</h2><p class="muted">Is lesson me sirf puzzles/sawaal hain, theory slide nahi.</p></section>`;return}
      lv+=`<section class="les"><h2><span class="no">Lesson ${no}</span> ${esc(les.title)}</h2>`+th.map(s=>{n++;if(s.t==='line')nline++;
        return`<div class="sl${s.fen&&s.t==='info'?' hasdg':''}"><h3>${inl(s.h||'')}</h3>${s.t==='info'?`${s.fen?`<div class="dgw r">${dia(s.fen,s)}</div>`:''}<div class="tx">${md(s.md||'')}</div>`:lineHTML(s)}</div>`}).join('')+'</section>'});
    idx.push(`<div class="ixl"><h3>Level ${L.n}: ${esc(L.name)}</h3><ol>${li.join('')}</ol></div>`);if(!lv)return;toc.push(`<li><b>Level ${L.n}: ${esc(L.name)}</b> <span>(Lichess ${L.lo}${L.hi?'-'+L.hi:'+'})</span></li>`);
    body+=`<div class="lvl"><div class="lvh"><span>Level ${L.n}</span><h1>${esc(L.name)}</h1></div>${lv}</div>`});
  const html=`<!doctype html><html data-theme="light"><head><meta charset="utf-8"><title>Road to 3000 – Theory Notes</title><style>
  @page{size:A4;margin:16mm 14mm 18mm}
  html,body{background:#fff;color:#17201B}body{margin:0;font-family:Inter,'Segoe UI',Roboto,Arial,sans-serif;font-size:12.5px;line-height:1.55}
  .cover{height:250mm;display:flex;flex-direction:column;justify-content:center;page-break-after:always}
  .cover .k{font-size:13px;letter-spacing:.18em;text-transform:uppercase;color:#2E7D4F;font-weight:700}.cover h1{font-size:44px;margin:.2em 0;line-height:1.05}.cover p{font-size:15px;color:#46534B;max-width:120mm}
  .toc{margin-top:18mm;padding:0;list-style:none}.toc li{padding:5px 0;border-bottom:1px solid #DDE5DF;font-size:14px}.toc span{color:#6B776F;font-size:12px}
  .lvl{page-break-before:always}.lvh{border-bottom:3px solid #2E7D4F;margin-bottom:6mm;padding-bottom:2mm}.lvh span{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#2E7D4F;font-weight:800}.lvh h1{margin:0;font-size:28px}
  .les h2 .no{display:block;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#2E7D4F}.muted{color:#6B776F}
  .ix{page-break-before:always}.ix h1{font-size:24px;margin:0 0 4mm}.ixl{break-inside:avoid}.ixl h3{font-size:13px;margin:4mm 0 1mm;color:#1F5E3A}.ixl ol{list-style:none;margin:0;padding:0}.ixl li{padding:1px 0;font-size:12px}.ixl li b{display:inline-block;width:11mm;color:#2E7D4F}
  .les h2{break-inside:avoid;page-break-inside:avoid;font-size:18px;margin:7mm 0 2mm;color:#17201B;border-left:4px solid #2E7D4F;padding-left:8px;break-after:avoid}
  .sl{break-inside:avoid;padding:3mm 0 3mm;border-bottom:1px dashed #DDE5DF;overflow:hidden}.sl h3{font-size:14px;margin:0 0 1.5mm;color:#1F5E3A;break-after:avoid}
  .sl ul{margin:1mm 0 1mm 5mm;padding:0}.sl li{margin:.6mm 0}.sl p{margin:1mm 0}
  .dgw{width:52mm;margin:1mm 0 1mm 5mm;float:right}.dgw .cap{font-size:10px;color:#6B776F;text-align:center}
  .dg{display:block;width:52mm;height:52mm}
  .mv{font-family:ui-monospace,Menlo,monospace;font-size:11.5px;background:#F1F5F2;padding:2mm;border-radius:2mm}
  code{background:#F1F5F2;padding:0 3px;border-radius:3px}
  </style></head><body><div class="cover"><div class="k">64 Squares · Road to 3000</div><h1>Theory Notes</h1><p>Course ke saare lessons ki sirf theory: samjhane wali slides aur opening lines ke notes. Puzzles, quiz aur practice is me nahi hain.</p><ul class="toc">${toc.join('')}</ul></div><div class="ix"><h1>Lessons ki list (app jaisa kram)</h1><p class="muted">Lesson 1.3 = Level 1 ka teesra lesson, bilkul app ki Level list jaisa.</p>${idx.join('')}</div>${body}</body></html>`;
  window.__NOTES=html;return{n,nl,nline,idx:idx.length}});
const html=await p.evaluate(()=>window.__NOTES);fs.writeFileSync(S+'notes.html',html);
const q=await b.newPage();await q.setContent(html,{waitUntil:'load'});await q.waitForTimeout(500);
await q.pdf({path:OUT,format:'A4',printBackground:true,displayHeaderFooter:true,headerTemplate:'<span></span>',footerTemplate:'<div style="font-size:8px;width:100%;text-align:center;color:#6B776F">Road to 3000 · Theory Notes · <span class="pageNumber"></span>/<span class="totalPages"></span></div>',margin:{top:'16mm',bottom:'18mm',left:'14mm',right:'14mm'}});
console.log(JSON.stringify(stats),'ERR',errs);await b.close()})();
