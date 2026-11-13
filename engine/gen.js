// node gen.js <outfile> <games> <seed>
const E=require('./me-engine.js');const X=require('./me-explain.js');const {spawn}=require('child_process');const fs=require('fs');
const [out,G,seed]=[process.argv[2],+process.argv[3],+process.argv[4]||1];
let rs=seed*7919+13;const rand=()=>{rs=(rs*1103515245+12345)&0x7fffffff;return rs/0x7fffffff;};
function sf(){const p=spawn('/usr/games/stockfish');let buf='',lines=[],waiters=[];p.stdout.on('data',d=>{buf+=d;let i;while((i=buf.indexOf('\n'))>=0){const l=buf.slice(0,i);buf=buf.slice(i+1);lines.push(l);for(const w of waiters.slice())if(w.re.test(l)){waiters.splice(waiters.indexOf(w),1);w.res(l);}}});
 return {send:s=>p.stdin.write(s+'\n'),wait:re=>new Promise(res=>waiters.push({re,res})),take:()=>{const l=lines;lines=[];return l;},kill:()=>p.kill()};}
const player=sf(), an=sf();
async function init(){for(const s of [player,an]){s.send('uci');await s.wait(/uciok/);s.send('setoption name Hash value 64');}an.send('setoption name MultiPV value 2');an.send('isready');await an.wait(/readyok/);}
async function analyse(fen){an.take();an.send('position fen '+fen);an.send('go depth 14');await an.wait(/^bestmove/);const ls=an.take();const pv={};
 for(const l of ls){const m=l.match(/ depth (\d+) .*multipv (\d) score (cp|mate) (-?\d+).* pv (.*)$/);if(!m)continue;let sc=m[3]==='cp'?+m[4]:(+m[4]>0?30000-+m[4]:-30000-+m[4]);pv[m[2]]={sc,move:m[5].split(' ')[0],line:m[5].split(' ').slice(0,6)};}
 return pv;}
const S=new E.Searcher(19);const res=[];
(async()=>{await init();
for(let g=0;g<G;g++){
 const elo=1320+Math.floor(rand()*700);player.send('setoption name UCI_LimitStrength value true');player.send('setoption name UCI_Elo value '+elo);
 const pos=new E.Position();const moves=[];
 // random first 2-4 moves for variety
 const rnd=2+Math.floor(rand()*3);
 for(let i=0;i<rnd;i++){const l=pos.legalMoves();const m=l[Math.floor(rand()*l.length)];moves.push(pos.uci(m));pos.make(m);}
 while(moves.length<160){
  if(!pos.legalMoves().length||pos.half>=100||pos.insufficient()||pos.isRepetition())break;
  if(moves.length>=14 && rand()<0.45){
   const fen=pos.fen();const a=await analyse(fen);
   if(a[1]&&a[2]){const gap=a[1].sc-a[2].sc;
    if(gap>=150 && a[1].sc>-250 && a[1].sc<1500 && !(a[1].sc>29000&&a[2].sc>29000)){
      const p2=new E.Position(fen);const t=Date.now();let firstD=99,prev=null;const r=S.go(p2,{time:1000,onIter:it=>{const u=p2.uci(it.move);if(u!==prev){prev=u;firstD=it.depth;}}});
      const mine=p2.uci(r.move);
      if(mine===a[1].move){const m=r.move;const d=X.describeMove(p2,m);const forced=p2.legalMoves().length;
        res.push({fen,best:mine,san:p2.san(m),sf:a[1].sc,gap,d:firstD,tags:d.tags,line:(()=>{const q=new E.Position(fen);const o=[];for(const u of a[1].line){const mm=q.parseUci(u);if(!mm)break;o.push(q.san(mm));q.make(mm);}return o;})(),n:forced});
        fs.writeFileSync(out,JSON.stringify(res));}
    }}
  }
  player.send('position startpos moves '+moves.join(' '));player.send('go movetime 40');const l=await player.wait(/^bestmove/);const u=l.split(' ')[1];const m=pos.parseUci(u);if(!m)break;pos.make(m);moves.push(u);
 }
 process.stderr.write(`game ${g} done, ${res.length} positions\n`);
}
player.kill();an.kill();process.exit(0);})();
