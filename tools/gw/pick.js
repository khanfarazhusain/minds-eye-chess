// node pick.js in.pgn out.json N  -> real broadcast games (CC0), both players 2200+
const E=require('../../engine/me-engine.js');const fs=require('fs');
const [inp,out,N]=[process.argv[2],process.argv[3],+process.argv[4]];
const txt=fs.readFileSync(inp,'utf8').split(/\n(?=\[Event )/);
let rs=12345;const rand=()=>{rs=(rs*1103515245+12345)&0x7fffffff;return rs/0x7fffffff;};
const cand=[];
for(const g of txt){const H={};for(const m of g.matchAll(/^\[(\w+) "(.*)"\]$/gm))H[m[1]]=m[2];
 if((H.Variant&&H.Variant!=='Standard')||H.FEN||H.SetUp)continue;
 const we=+H.WhiteElo||0,be=+H.BlackElo||0;if(we<2200||be<2200)continue;
 if(!/^(1-0|0-1|1\/2-1\/2)$/.test(H.Result||''))continue;
 let mv=g.replace(/^\[.*\]$/gm,'').replace(/\{[^}]*\}/g,' ');
 while(/\([^()]*\)/.test(mv))mv=mv.replace(/\([^()]*\)/g,' ');
 mv=mv.replace(/\$\d+/g,' ').replace(/\d+\.(\.\.)?/g,' ').replace(/(1-0|0-1|1\/2-1\/2|\*)\s*$/,'').trim().split(/\s+/).filter(Boolean).map(s=>s.replace(/[?!]+$/,''));
 if(mv.length<50||mv.length>130)continue;
 const pos=new E.Position();const uci=[];let ok=true;
 for(const s of mv){const m=pos.legalMoves().find(x=>pos.san(x).replace(/[+#]/g,'')===s.replace(/[+#]/g,''));if(!m){ok=false;break;}uci.push(pos.uci(m));pos.make(m);}
 if(!ok)continue;
 cand.push({w:H.White,b:H.Black,we,be,ev:H.BroadcastName||H.Event,dt:H.Date||'',r:H.Result,u:uci});}
// distinct pairs, shuffle
for(let i=cand.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[cand[i],cand[j]]=[cand[j],cand[i]];}
const seen=new Map(),pick=[];for(const c of cand){const k=c.w,k2=c.b;if((seen.get(k)||0)>=1||(seen.get(k2)||0)>=1)continue;seen.set(k,1);seen.set(k2,1);pick.push(c);if(pick.length>=N)break;}
fs.writeFileSync(out,JSON.stringify(pick));console.log('candidates',cand.length,'picked',pick.length,'draws',pick.filter(p=>p.r==='1/2-1/2').length);
