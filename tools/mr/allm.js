const E=require('./me-engine.js');const R=require('./me-rules.js');const fs=require('fs');
const [part,np,which,lim]=[+process.argv[2],+process.argv[3],process.argv[4],+(process.argv[5]||0)];let items=[];
if(which==='held'||which==='new40'||which==='new80'){const NL=Object.assign({},...[0,1,2,3].map(i=>require((which==='held'?'./hlab':which==='new80'?'./n3lab':'./n2lab')+i+'.json')));for(const fen in NL)items.push({src:'n2',fen,best:NL[fen].best,lab:NL[fen].m});}
else{const D=require('./feat.json');const LAB=Object.assign({},require('./lab0.json'),require('./lab1.json'));D.forEach(p=>items.push({src:p.src,fen:p.fen,lab:LAB[p.fen],bestIdx:p.bi,best:LAB[p.fen]?LAB[p.fen].reduce((x,y)=>y[1]>x[1]?y:x)[0]:undefined}));
 const NL=Object.assign({},...[0,1,2,3].map(i=>require('./nlab'+i+'.json')));for(const fen in NL)items.push({src:'n',fen,best:NL[fen].best,lab:NL[fen].m});items=items.filter((_,i)=>i%2===1);}
const S=new E.Searcher(18);S.deadline=Infinity;const res=[];let cnt=0;const t0=Date.now();
items.forEach((it,i)=>{if(i%np!==part||!it.lab)return;if(lim&&cnt>=lim)return;cnt++;const pos=new E.Position(it.fen);const F=R.features3(pos,0);
 const best=it.best||pos.uci(require('./me-explain.js').ruleFeatures(pos)[it.bestIdx].move);const sc={};for(const [u,s] of it.lab)sc[u]=s;const mx=Math.max(...it.lab.map(x=>x[1]));const good=u=>u===best||sc[u]>=mx-30;
 const mv=F.map(x=>({m:x.move,u:pos.uci(x.move),f:x.f,sq:x.f.sqL||0,ps:x.f.pstDelta||0}));mv.forEach(x=>{x.g=good(x.u)?1:0;for(const n of [4,6,8])x['p'+n]=R.simplePts(x.f,n).pts;});
 const r={src:it.src};
 for(const n of [4,6,8]){const rk=mv.slice().sort((a,b)=>b['p'+n]-a['p'+n]||b.sq-a.sq||b.ps-a.ps);r['need'+n]=rk.findIndex(x=>x.g)+1;r['o'+n]=rk.map(x=>mv.indexOf(x));}
 r.g=mv.map(x=>x.g);
 for(const d of [1,2,3,4])r['c'+d]=mv.map(x=>S.go(pos,{depth:d,time:5000,moves:[x.m]}).score);
 res.push(r);});
fs.writeFileSync('allm_'+which+part+'.json',JSON.stringify(res));console.log('done',res.length,(Date.now()-t0)/1000+'s');
