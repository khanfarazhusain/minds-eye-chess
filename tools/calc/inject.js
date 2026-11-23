// Puts tools/calc/gym.js + gym.css into course.html (between markers). Then run: node tools/road/build.js
// Run: node tools/calc/inject.js
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..','..'),f=path.join(root,'course.html');let s=fs.readFileSync(f,'utf8');
const js=fs.readFileSync(path.join(__dirname,'gym.js'),'utf8').trim(),css=fs.readFileSync(path.join(__dirname,'gym.css'),'utf8').trim();
const put=(s,a,b,body,anchor)=>{const i=s.indexOf(a);if(i>=0){const j=s.indexOf(b,i);return s.slice(0,i)+a+'\n'+body+'\n'+s.slice(j)}
  const k=s.indexOf(anchor);if(k<0)throw new Error('anchor not found: '+anchor);return s.slice(0,k)+a+'\n'+body+'\n'+b+'\n'+s.slice(k)};
s=put(s,'/* ==== calc gym js ==== */','/* ==== /calc gym js ==== */',js,'/* ---------- views ---------- */');
s=put(s,'/* ==== calc gym css ==== */','/* ==== /calc gym css ==== */',css,'</style>');
fs.writeFileSync(f,s);console.log('course.html updated');
// lessons: tools/calc/lessons.js -> COURSE (same id hai to replace, warna level ke end mein)
{let s=fs.readFileSync(f,'utf8');const a=s.indexOf('const COURSE=')+13,e=s.indexOf(';\n',a);const C=JSON.parse(s.slice(a,e));
 const LS=require('./lessons.js');for(const lid in LS){const L=C.find(x=>x.id===lid);if(!L)throw new Error('level '+lid);
  for(const les of LS[lid]){const k=L.lessons.findIndex(x=>x.id===les.id);if(k>=0)L.lessons[k]=les;else L.lessons.push(les)}}
 s=s.slice(0,a)+JSON.stringify(C)+s.slice(e);fs.writeFileSync(f,s);console.log('lessons updated')}
