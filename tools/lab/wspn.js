// Same as wsp.js but MS = nodes per move (equal-nodes match): node wspn.js A.cfg B.cfg nPairs nodes part np out.json
// node wsp.js A.cfg B.cfg nPairs ms part np out.json ; cfg = "wasmfile[:netfile]" (net 'hce' = none)
const fs=require('fs');const [Ac,Bc,NP,MS,part,np,out]=process.argv.slice(2);
const E=require(__dirname+'/s6z.js'),W=require(__dirname+'/fhkw.js');const OP=require(__dirname+'/openings.json');
function mk(c){const [wf,net]=c.split(':');const w=W.create(E,wf,18);if(net&&net!=='hce')w.loadNet(net);return {w,net}}
const A=mk(Ac),B=mk(Bc);const res=[];
function reset(x){x.w.clear();}
for(let i=0;i<+NP;i++){if(i%+np!==+part)continue;const fen=OP[i%OP.length];
 for(const aWhite of [true,false]){reset(A);reset(B);const p=new E.Position(fen);let r=null,ply=0,adj=0,aRes=null;
  while(true){const L=p.legalMoves();if(!L.length){r=p.inCheck()?((p.side===0)?0:1):0.5;break;}
   if(p.half>=100||p.insufficient()||p.isRepetition()||ply>300){r=0.5;break;}
   const aMove=(p.side===0)===aWhite;const g=(aMove?A:B).w.go(p,{nodes:+MS,time:100000});
   const sc=aMove?g.score:-g.score;if(Math.abs(sc)>1200){if(++adj>=6){aRes=sc>0?1:0;break;}}else adj=0;
   p.make(g.move);ply++;}
  res.push(aRes!==null?aRes:(r===0.5?0.5:(aWhite?r:1-r)));fs.writeFileSync(out,JSON.stringify(res));}}
console.log('A score',res.reduce((a,b)=>a+b,0),'/',res.length);
