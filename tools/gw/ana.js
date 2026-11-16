// node tools/gw/ana.js games.json out.json shard nshards  (resumable)
// Har chaal: Tez top 5 (me-rules fastCands) + Stockfish 16 depth 13 check (best, aur Tez 5 + khiladi ki chaal ke scores).
const E=require('../../engine/me-engine.js');const R=require('../../engine/me-rules.js');
const {spawn}=require('child_process');const fs=require('fs');
const [inp,out,sh,ns]=[process.argv[2],process.argv[3],+process.argv[4],+process.argv[5]];
const G=JSON.parse(fs.readFileSync(inp)).filter((g,i)=>i%ns===sh);
let res=[];try{res=JSON.parse(fs.readFileSync(out));}catch(e){}
const done=new Set(res.map(g=>g.u.join(' ')));
const p=spawn(process.env.SF||'/usr/games/stockfish');let buf='',lines=[],w=null;
p.stdout.on('data',d=>{buf+=d;let i;while((i=buf.indexOf('\n'))>=0){const l=buf.slice(0,i);buf=buf.slice(i+1);lines.push(l);if(w&&w.re.test(l)){const f=w;w=null;f.res(l);}}});
const send=s=>p.stdin.write(s+'\n'),wait=re=>new Promise(res=>{w={re,res};});
const D=13;
async function sf(fen,moves,mpv){lines=[];send('setoption name MultiPV value '+mpv);send('position fen '+fen);send('go depth '+D+(moves?' searchmoves '+moves.join(' '):''));await wait(/^bestmove/);
 const sc={};for(const l of lines){const m=l.match(/ depth (\d+) .*multipv (\d+) score (cp|mate) (-?\d+).* pv (\S+)/);if(!m||+m[1]!==D)continue;sc[m[5]]=m[3]==='cp'?+m[4]:(+m[4]>0?30000-+m[4]:-30000-+m[4]);}
 return {sc,bm:lines[lines.length-1].split(' ')[1]};}
(async()=>{send('uci');await wait(/uciok/);send('setoption name Hash value 64');send('isready');await wait(/readyok/);
for(const g of G){if(done.has(g.u.join(' ')))continue;const pos=new E.Position();const P=[];
 for(const u of g.u){const fen=pos.fen();const L=pos.legalMoves();const fc=R.fastCands(pos,null,5);const m=pos.parseUci(u);
  const a=await sf(fen,null,1);const best=a.bm,bsc=a.sc[best];
  const set=[...new Set([...fc.map(x=>pos.uci(x.m)),u,best])];
  const b=await sf(fen,set,set.length);const top=Math.max(bsc,...Object.values(b.sc));
  const good=x=>b.sc[x]!==undefined&&b.sc[x]>=top-30;
  P.push({n:L.length,t:fc.map(x=>{const xu=pos.uci(x.m);return [pos.san(x.m),x.pts,x.g,x.why,good(xu)?1:0,b.sc[xu]];}),
   s:pos.san(m),ps:b.sc[u],pg:good(u)?1:0,b:pos.san(pos.parseUci(best)),bs:top});
  pos.make(m);}
 res.push({w:g.w,b:g.b,we:g.we,be:g.be,ev:g.ev,dt:g.dt,r:g.r,u:g.u,p:P});
 fs.writeFileSync(out,JSON.stringify(res));process.stderr.write(`shard ${sh}: ${res.length}/${G.length}\n`);}
p.kill();process.exit(0);})();
