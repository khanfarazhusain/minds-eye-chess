const R=['old','new40','new80'].flatMap(w=>[0,1,2,3].flatMap(p=>require('./allm_'+w+p+'.json')));
const H=['old','new40','new80'].flatMap(w=>[0,1,2,3].flatMap(p=>require('./hb_'+w+p+'.json')));
const out={};const pc=(A,f)=>+(100*A.filter(f).length/A.length).toFixed(1);
const top=(A,fn)=>[1,2,3].map(k=>pc(A,r=>fn(r).slice(0,k).some(i=>r.g[i])));
const sortBy=(idx,sc)=>idx.slice().sort((a,b)=>sc[b]-sc[a]);// stable
for(const set of ['games','training']){const A=R.filter(r=>set==='training'?r.src==='t':r.src!=='t');const o=out[set]={n:A.length};
 for(const n of [4,6,8])for(const K of [5,7,8,9,10,12])o['r'+n+'_'+K]=pc(A,r=>r['need'+n]&&r['need'+n]<=K);
 for(const d of [1,2,3,4])o['c'+d]=top(A,r=>sortBy(r.g.map((_,i)=>i),r['c'+d]));
 o.m4_12=top(A,r=>sortBy(r.o4.slice(0,12),r.c4));o.m8_10=top(A,r=>sortBy(r.o8.slice(0,10),r.c4));o.m8_8=top(A,r=>sortBy(r.o8.slice(0,8),r.c4));
 const B=H.filter(r=>set==='training'?r.src==='t':r.src!=='t');o.hb=[1,2,3].map(k=>pc(B,r=>{const c=r.s.map((s,i)=>({s,i,g:r.g[i]})).sort((a,b)=>b.s-a.s||a.i-b.i);return c.slice(0,k).some(x=>x.g);}));}
console.log(JSON.stringify(out,null,1));require('fs').writeFileSync('allmres.json',JSON.stringify(out));
