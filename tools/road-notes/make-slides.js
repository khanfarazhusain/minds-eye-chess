// Road to 3000: app ki asli theory slides (info + line) ki tasveer, lesson ke kram me -> PDF
// Chalane ka tareeka: repo root se `python3 -m http.server 8765` chalao, phir `node tools/road-notes/<script>.js out.pdf`. Lesson number (jaise 1.3) app ki Level list jaisa hai.
const {chromium}=require('playwright');const fs=require('fs');const S=__dirname+'/';const OUT=process.argv[2]||S+'slides.pdf';
const IMG=S+'slides/';fs.mkdirSync(IMG,{recursive:true});
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:420,height:900},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.route('https://lichess.org/**',r=>r.fulfill({status:200,contentType:'application/json',body:'{}'}));
await p.addInitScript(()=>{localStorage.setItem('mindseye.road.v1',JSON.stringify({v:1,user:'Faraz'}))});
await p.goto('http://localhost:8765/road.html');await p.waitForTimeout(900);
const plan=await p.evaluate(()=>{const o=[];ROAD_LEVELS.forEach(L=>{L.lessons.forEach((k,li)=>{const les=lesOf(k);if(!les)return;const idx=[];(les.steps||[]).forEach((s,j)=>{if(s.t==='info'||s.t==='line')idx.push(j)});
  o.push({lv:L.n,lvName:L.name,no:`${L.n}.${li+1}`,k,title:les.title,total:(les.steps||[]).length,idx})})});return o});
await p.evaluate(()=>{document.body.querySelectorAll('nav.tabs,header,.top').forEach(e=>e.style.display='none');const app=document.querySelector('#app');app.innerHTML='<div id="cap" style="padding:12px 16px 16px;background:var(--bg)"></div>';window.scrollTo(0,0)});
const out=[];let n=0;
for(const L of plan){const items=[];for(const j of L.idx){
  const kind=await p.evaluate(([k,j])=>{const les=lesOf(k),s=les.steps[j],cap=document.querySelector('#cap');cap.innerHTML='';
    const el=renderStep(s,{test:false,lessonTitle:les.title,where:'Lesson',done:()=>{}});cap.appendChild(el);
    if(s.t==='line'){const nb=[...el.querySelectorAll('.nav .btn.primary')][0];const N=s.moves.split(' ').length;for(let i=0;i<N&&nb;i++)nb.click();
      const note=el.querySelector('.tut.note');const ks=s.notes?Object.keys(s.notes).sort((a,b)=>a-b):[];
      if(note)note.innerHTML=(s.md?md(s.md):'')+(ks.length?'<ul>'+ks.map(x=>'<li>'+inl(s.notes[x])+'</li>').join('')+'</ul>':'');
      const nav=el.querySelector('.nav');if(nav)nav.remove()}
    return s.t},[L.k,j]);
  await p.waitForTimeout(60);const f=`${IMG}s${String(++n).padStart(3,'0')}.jpg`;await (await p.$('#cap')).screenshot({path:f,type:'jpeg',quality:85});
  items.push({f,j,kind})}
  out.push(Object.assign({},L,{items}))}
fs.writeFileSync(S+'slides.json',JSON.stringify(out));
const lvls=[...new Map(out.map(x=>[x.lv,x.lvName])).entries()];
const img=f=>'data:image/jpeg;base64,'+fs.readFileSync(f).toString('base64');
let body='';let lastLv=0;
for(const L of out){if(L.lv!==lastLv){body+=`<div class="lvh"><span>Level ${L.lv}</span><h1>${L.lvName}</h1></div>`;lastLv=L.lv}
  body+=`<section><h2><span class="no">Lesson ${L.no}</span> ${L.title.replace(/&/g,'&amp;').replace(/</g,'&lt;')}</h2>${L.items.length?'':'<p style="color:#6B776F;font-size:12px">Is lesson me sirf puzzles/sawaal hain, theory slide nahi.</p>'}<div class="grid">${L.items.map(it=>`<figure><img src="${img(it.f)}"><figcaption>Slide ${it.j+1}/${L.total}</figcaption></figure>`).join('')}</div></section>`}
const html=`<!doctype html><html><head><meta charset="utf-8"><title>Road to 3000 – Theory Slides</title><style>
@page{size:A4;margin:12mm 11mm 14mm}body{margin:0;font-family:Inter,'Segoe UI',Roboto,Arial,sans-serif;color:#17201B;background:#fff}
.cover{height:255mm;display:flex;flex-direction:column;justify-content:center;page-break-after:always}.cover .k{font-size:13px;letter-spacing:.18em;text-transform:uppercase;color:#2E7D4F;font-weight:700}.cover h1{font-size:44px;margin:.2em 0}.cover p{font-size:15px;color:#46534B;max-width:130mm}
.cover ul{list-style:none;padding:0;margin-top:14mm}.cover li{padding:5px 0;border-bottom:1px solid #DDE5DF;font-size:14px}
.lvh{page-break-before:always;border-bottom:3px solid #2E7D4F;margin-bottom:4mm;padding-bottom:2mm}.lvh span{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#2E7D4F;font-weight:800}.lvh h1{margin:0;font-size:26px}
section h2 .no{display:block;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#2E7D4F}section h2{break-inside:avoid;page-break-inside:avoid;font-size:16px;margin:5mm 0 3mm;border-left:4px solid #2E7D4F;padding-left:8px;break-after:avoid}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:5mm;align-items:start}figure{margin:0;break-inside:avoid;border:1px solid #DDE5DF;border-radius:3mm;overflow:hidden}figure img{display:block;width:100%}
figcaption{font-size:9px;color:#6B776F;text-align:center;padding:1mm;border-top:1px solid #DDE5DF}
</style></head><body><div class="cover"><div class="k">64 Squares · Road to 3000</div><h1>Theory Slides</h1><p>App ke lessons ki asli slides, usi kram me jaise lesson me aati hain. Puzzles aur questions hata diye gaye hain. Opening line wali slides me poori line aur har chaal ka note ek saath diya hai.</p><ul>${lvls.map(([n,nm])=>`<li><b>Level ${n}: ${nm}</b></li>`).join('')}</ul></div>${body}</body></html>`;
const q=await b.newPage();await q.setContent(html,{waitUntil:'load'});await q.waitForTimeout(800);
await q.pdf({path:OUT,format:'A4',printBackground:true,displayHeaderFooter:true,headerTemplate:'<span></span>',footerTemplate:'<div style="font-size:8px;width:100%;text-align:center;color:#6B776F">Road to 3000 · Theory Slides · <span class="pageNumber"></span>/<span class="totalPages"></span></div>',margin:{top:'12mm',bottom:'14mm',left:'11mm',right:'11mm'}});
console.log('slides',n,'lessons',out.length,'ERR',errs.slice(0,5));await b.close()})();
