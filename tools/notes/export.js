// Screenshot every board in notes.html and write two flattened HTML variants:
// out/docx.html (boards as images) and out/txt.html (boards as ASCII).
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const OUT=path.join(__dirname,'out');fs.mkdirSync(path.join(OUT,'img'),{recursive:true});
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:700,height:1000},deviceScaleFactor:2,colorScheme:'light'});
await p.goto('file://'+path.resolve(__dirname,'..','..','notes.html')+'');
await p.addStyleTag({content:'.totop,header.top{display:none!important}.fig,.fig.small{max-width:340px!important}html{scroll-behavior:auto!important}'});
await p.evaluate(()=>document.querySelectorAll('details').forEach(d=>d.open=true));
const n=await p.$$eval('.fig .bwrap',els=>els.length);console.log('boards',n);
const els=await p.$$('.fig .bwrap');
for(let i=0;i<els.length;i++){await els[i].screenshot({path:path.join(OUT,'img',`b${String(i+1).padStart(3,'0')}.png`)})}
const variants=await p.evaluate(()=>{
  const GL={'♚':'K','♛':'Q','♜':'R','♝':'B','♞':'N','♟':'P'};
  const clone=document.querySelector('main .wrap').cloneNode(true);
  clone.querySelector('.toc')?.remove();clone.querySelector('.toch')?.remove();clone.querySelector('.legend')?.remove();
  clone.querySelectorAll('.lfoot,.btn').forEach(e=>e.remove());
  clone.querySelectorAll('details').forEach(d=>{const s=d.querySelector('summary');const div=document.createElement('div');
    const h=document.createElement('p');h.innerHTML='<b>'+(s?s.textContent.replace('dekho','').trim():'Jawab')+':</b>';s&&s.remove();div.appendChild(h);while(d.firstChild)div.appendChild(d.firstChild);d.replaceWith(div)});
  clone.querySelectorAll('.lhead').forEach(e=>{const n=e.querySelector('.lno'),h=e.querySelector('h3');if(n&&h){h.textContent=n.textContent+'  '+h.textContent;n.remove()}});clone.querySelectorAll('.lvhead').forEach(e=>{const ey=e.querySelector('.eyebrow'),h=e.querySelector('h2');if(ey&&h){h.textContent=ey.textContent+': '+h.textContent;ey.remove()}});
  clone.querySelectorAll('.tag').forEach(e=>{e.textContent='['+e.textContent.trim()+'] '});
  clone.querySelectorAll('.sidetag').forEach(e=>{e.textContent='('+e.textContent.trim()+') '});
  clone.querySelectorAll('.hero p').forEach(e=>{if(e.textContent.includes('Jawab chhupe'))e.textContent='Har lesson ka saar, board diagrams, abhyaas positions aur sawal-jawab. Har sawal ke neeche jawab diya hai: padhne se pehle khud socho.'});
  const A=clone.cloneNode(true),T=clone.cloneNode(true);
  const ren=(root,from,to)=>root.querySelectorAll(from).forEach(e=>{const n=document.createElement(to);if(e.id)n.id=e.id;n.textContent=e.textContent.replace(/\s+/g,' ').trim();e.replaceWith(n)});
  // Word: real heading levels (Level = Heading 1, Lesson = Heading 2, Topic = Heading 3); Word TOC replaces the per-lesson topic lists
  A.querySelectorAll('.ltoc').forEach(e=>e.remove());A.querySelector('.hero h1')?.remove();
  A.querySelectorAll('section.level').forEach(sec=>{const h=sec.querySelector('h2');if(h)h.id=sec.id+'-h'});
  A.querySelectorAll('section.lesson').forEach(sec=>{const h=sec.querySelector('h3');if(h)h.id=sec.id+'-h'});
  ren(A,'h2','h1');ren(A,'h3','h2');ren(A,'h4','h3');
  // static contents list (Word TOC fields don't show in phone viewers)
  {const box=document.createElement('div');let html='<p><b>Fehrist (contents)</b></p><ul>';
   A.querySelectorAll('section.level').forEach(sec=>{const h=sec.querySelector('h1');html+='<li><a href="#'+h.id+'">'+h.textContent+'</a><ul>';
     sec.querySelectorAll('section.lesson h2').forEach(x=>{html+='<li><a href="#'+x.id+'">'+x.textContent+'</a></li>'});html+='</ul></li>'});
   box.innerHTML=html+'</ul>';const hero=A.querySelector('.hero');hero.after(box)}
  T.querySelectorAll('.ltoc ol').forEach(o=>{const u=document.createElement('ul');u.innerHTML=o.innerHTML;o.replaceWith(u)});
  // Text: draw headings with rules so they stand out
  const deco=(root,sel,f)=>root.querySelectorAll(sel).forEach(e=>{const t=e.textContent.replace(/\s+/g,' ').trim();const pre=document.createElement('pre');pre.textContent=f(t);e.replaceWith(pre)});
  deco(T,'h2',t=>'#'.repeat(70)+'\n##  '+t.toUpperCase()+'\n'+'#'.repeat(70));
  deco(T,'h3',t=>t+'\n'+'='.repeat(Math.min(70,t.length)));
  deco(T,'h4',t=>t+'\n'+'-'.repeat(Math.min(70,t.length)));
  A.querySelectorAll('.fig').forEach((f,i)=>{const small=f.classList.contains('small');const img=document.createElement('img');
    img.src='img/b'+String(i+1).padStart(3,'0')+'.png';img.setAttribute('width',small?'200':'260');img.alt='Chess diagram';
    const p=document.createElement('p');p.appendChild(img);f.querySelector('.bwrap').replaceWith(p)});
  T.querySelectorAll('.fig').forEach(f=>{const sqs=[...f.querySelectorAll('.sq')];let rows=[];
    const files=sqs.slice(56).map(s=>s.querySelector('.cf').textContent);
    for(let r=0;r<8;r++){const rk=sqs[r*8].querySelector('.cr').textContent;let line=rk+' |';
      for(let c=0;c<8;c++){const s=sqs[r*8+c];const pc=s.querySelector('.pc');let ch='.';
        if(pc){const g=GL[pc.textContent.trim()[0]];ch=pc.classList.contains('w')?g:g.toLowerCase()}
        else if(s.classList.contains('dot'))ch='*';else if(s.classList.contains('hl'))ch='#';
        line+=' '+ch}rows.push(line)}
    rows.push('   ----------------');rows.push('    '+files.join(' '));
    const pre=document.createElement('pre');pre.textContent=rows.join('\n');f.querySelector('.bwrap').replaceWith(pre)});
  return{docx:A.innerHTML,txt:T.innerHTML}});
const head='<!doctype html><html><head><meta charset="utf-8"><title>Chess Course Notes</title></head><body>';
fs.writeFileSync(path.join(OUT,'docx.html'),head+variants.docx+'</body></html>');
fs.writeFileSync(path.join(OUT,'txt.html'),head+variants.txt+'</body></html>');
await b.close()})();
