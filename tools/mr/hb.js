const E=require('./me-engine.js');const R=require('./me-rules.js');const fs=require('fs');
const [part,np,which]=[+process.argv[2],+process.argv[3],process.argv[4]];let items=[];
if(which==='held'||which==='new40'||which==='new80'){const NL=Object.assign({},...[0,1,2,3].map(i=>require((which==='held'?'./hlab':which==='new80'?'./n3lab':'./n2lab')+i+'.json')));for(const fen in NL)items.push({src:'n2',fen,best:NL[fen].best,lab:NL[fen].m});}
else{const D=require('./feat.json');const LAB=Object.assign({},require('./lab0.json'),require('./lab1.json'));D.forEach(p=>items.push({src:p.src,fen:p.fen,lab:LAB[p.fen],bestIdx:p.bi,best:LAB[p.fen]?LAB[p.fen].reduce((x,y)=>y[1]>x[1]?y:x)[0]:undefined}));
 const NL=Object.assign({},...[0,1,2,3].map(i=>require('./nlab'+i+'.json')));for(const fen in NL)items.push({src:'n',fen,best:NL[fen].best,lab:NL[fen].m});items=items.filter((_,i)=>i%2===1);}
const res=[];
items.forEach((it,i)=>{if(i%np!==part||!it.lab)return;const pos=new E.Position(it.fen);const F=R.features3(pos,0);
 const best=it.best||pos.uci(require('./me-explain.js').ruleFeatures(pos)[it.bestIdx].move);const sc={};for(const [u,s] of it.lab)sc[u]=s;const mx=Math.max(...it.lab.map(x=>x[1]));const good=u=>u===best||sc[u]>=mx-30;
 const rk=F.map(x=>({m:x.move,u:pos.uci(x.move),p:R.simplePts(x.f,4).pts,sq:x.f.sqL||0,ps:x.f.pstDelta||0})).sort((a,b)=>b.p-a.p||b.sq-a.sq||b.ps-a.ps);
 const r={src:it.src,need:rk.findIndex(x=>good(x.u))+1,g:[],s:[]};
 for(const x of rk.slice(0,5)){const h=R.humanCalc(pos,x.m);r.g.push(good(x.u)?1:0);r.s.push(h.score);}
 res.push(r);});
fs.writeFileSync('hb_'+which+part+'.json',JSON.stringify(res));console.log('done',res.length);
