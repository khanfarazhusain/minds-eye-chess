// node tools/gw/merge.js workdir engine/games_tez.json : shards + khiladi ki chaal ka Tez number -> app data
const E=require('../../engine/me-engine.js');const R=require('../../engine/me-rules.js');const fs=require('fs');
const W=process.argv[2];const out=[];
for(const f of fs.readdirSync(W).filter(f=>/^out\d+\.json$/.test(f)).sort())for(const g of JSON.parse(fs.readFileSync(W+'/'+f))){
 const pos=new E.Position();const pr=[];for(const u of g.u){const m=pos.parseUci(u);const fc=R.fastCands(pos,null,0);const i=fc.findIndex(x=>x.m===m);pr.push([i+1,fc[i].pts,fc[i].g,fc[i].why]);pos.make(m);}
 out.push({w:g.w,b:g.b,we:g.we,be:g.be,ev:g.ev,dt:g.dt,r:g.r,u:g.u.join(' '),p:g.p.map((p,j)=>({n:p.n,t:p.t.map(x=>x.slice(0,5)),s:p.s,ps:p.ps,pg:p.pg,b:p.b,bs:p.bs,pr:pr[j]}))});}
fs.writeFileSync(process.argv[3],JSON.stringify({eng:'Stockfish 16',depth:13,games:out}));
let n=0,tz=0,inl=0;for(const g of out)for(const p of g.p){n++;if(p.t.some(x=>x[4]))tz++;if(p.pr[0]<=5)inl++;}
console.log('games',out.length,'plies',n,'tez-has-engine',(100*tz/n).toFixed(1)+'%','player-in-tez5',(100*inl/n).toFixed(1)+'%','bytes',fs.statSync(process.argv[3]).size);
