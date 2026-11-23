// Builds packs/calc/ (Calculation Gym) from packs/road (Lichess open puzzle database, CC0).
// Depth d = kitni apni chaalein (1..8; 8 = 8 ya zyada). Har depth rating ke hisaab se sort, 400-400 ke chunks.
// index.json: har depth ke chunks ki rating range + quartiles (q: 25/50/75%), jinse ladder ke Asaan/Medium/Mushkil/GM steps bante hain.
// Run: node tools/calc/build.js
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..','..'),src=path.join(root,'packs','road'),out=path.join(root,'packs','calc');
const CAP={2:12000,3:12000},CH=400,DS=[1,2,3,4,5,6,7,8];
const T={};DS.forEach(d=>T[d]=[]);
const tierOf=n=>Math.min(8,n);
for(const f of fs.readdirSync(src).filter(f=>/^b\d+_\d+\.json$/.test(f)).sort()){
  for(const p of JSON.parse(fs.readFileSync(path.join(src,f),'utf8'))){const n=Math.ceil(p[2].split(' ').length/2);T[tierOf(n)].push(p)}}
// seeded shuffle so the sample is stable between builds
let seed=12345;const rnd=()=>(seed=(seed*1103515245+12345)%2147483648)/2147483648;
fs.mkdirSync(out,{recursive:true});for(const f of fs.readdirSync(out))fs.unlinkSync(path.join(out,f));
const idx={v:Date.now(),src:'Lichess open puzzle database (CC0), via packs/road',chunk:CH,tiers:{}};
for(const t of DS){let a=T[t];
  if(CAP[t]&&a.length>CAP[t]){for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]]}a=a.slice(0,CAP[t])}
  a.sort((x,y)=>x[3]-y[3]);const ch=[];
  for(let k=0;k*CH<a.length;k++){const part=a.slice(k*CH,(k+1)*CH);fs.writeFileSync(path.join(out,`t${t}_${k}.json`),JSON.stringify(part));ch.push([part[0][3],part[part.length-1][3]])}
  const q=[.25,.5,.75].map(x=>a[Math.floor(a.length*x)][3]);idx.tiers[t]={n:a.length,chunks:ch,q,lo:a[0][3],hi:a[a.length-1][3]};console.log('depth',t,a.length,'puzzles',ch.length,'chunks',q.join('/'))}
fs.writeFileSync(path.join(out,'index.json'),JSON.stringify(idx));
