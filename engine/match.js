// usage: node match.js <sfElo|full> <games> <myMs> <sfMs> [concurrency]
const E=require('./me-engine.js');const {spawn}=require('child_process');
const OPEN=['e4 e5 Nf3 Nc6 Bb5 a6','e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3','d4 d5 c4 e6 Nc3 Nf6','d4 Nf6 c4 g6 Nc3 Bg7 e4 d6','e4 e6 d4 d5 Nc3 Bb4','e4 c6 d4 d5 e5 Bf5','c4 e5 Nc3 Nf6 g3','Nf3 d5 g3 Nf6 Bg2 c6','e4 e5 Nf3 Nc6 Bc4 Bc5 c3','d4 d5 Bf4 Nf6 e3 c5','e4 d5 exd5 Qxd5 Nc3 Qa5','d4 Nf6 c4 e6 Nf3 b6','e4 c5 Nc3 Nc6 g3 g6','e4 e5 Nf3 Nf6 Nxe5 d6 Nf3 Nxe4','d4 f5 g3 Nf6 Bg2 e6','e4 g6 d4 Bg7 Nc3 d6','c4 c5 Nf3 Nc6 Nc3 g6','e4 c5 Nf3 e6 d4 cxd4 Nxd4 a6','d4 d5 c4 c6 Nf3 Nf6 Nc3 dxc4','e4 e5 f4 exf4 Nf3 g5'];
const [eloArg,G,myMs,sfMs,conc]=[process.argv[2],+process.argv[3],+process.argv[4],+process.argv[5],+(process.argv[6]||3)];
function sf(){const p=spawn('/usr/games/stockfish');let buf='',waiters=[];p.stdout.on('data',d=>{buf+=d;let i;while((i=buf.indexOf('\n'))>=0){const l=buf.slice(0,i);buf=buf.slice(i+1);for(const w of waiters.slice())if(w.test(l)){waiters.splice(waiters.indexOf(w),1);w.res(l);}}});
 const send=s=>p.stdin.write(s+'\n');const wait=re=>new Promise(res=>waiters.push({test:l=>re.test(l),res}));return {p,send,wait};}
const PGN=[];const PGNFILE=process.argv[7]||('games-'+process.argv[2]+'.pgn');
async function game(idx){
 const s=sf();s.send('uci');await s.wait(/uciok/);s.send('setoption name Threads value 1');s.send('setoption name Hash value 32');
 if(eloArg!=='full'){s.send('setoption name UCI_LimitStrength value true');s.send('setoption name UCI_Elo value '+eloArg);}
 s.send('isready');await s.wait(/readyok/);
 const pos=new E.Position();const moves=[];const sans=[];
 for(const san of OPEN[(idx>>1)%OPEN.length].split(' ')){const m=pos.parseSan(san);moves.push(pos.uci(m));sans.push(pos.san(m));pos.make(m);}const nOpen=sans.length;
 const meWhite=idx%2===0;const S=new E.Searcher(19);let result=null;
 while(true){
  const legal=pos.legalMoves();
  if(!legal.length){result=pos.inCheck()?(pos.side===0?'0-1':'1-0'):'1/2';break;}
  if(pos.half>=100||pos.insufficient()||pos.isRepetition()){result='1/2';break;}
  if(moves.length>400){result='1/2';break;}
  const meToMove=(pos.side===0)===meWhite;let u;
  if(meToMove){const r=S.go(pos,{time:myMs});u=pos.uci(r.move);}
  else{s.send('position startpos moves '+moves.join(' '));s.send('go movetime '+sfMs);const l=await s.wait(/^bestmove/);u=l.split(' ')[1];}
  const m=pos.parseUci(u);if(!m){console.error('bad move',u);result='?';break;}
  sans.push(pos.san(m));pos.make(m);moves.push(u);
 }
 s.send('quit');
 const sfName=eloArg==='full'?'Stockfish 16':'Stockfish 16 (Elo '+eloArg+')';const W=meWhite?'ME Engine v1':sfName,B=meWhite?sfName:'ME Engine v1';
 const res=result==='1/2'?'1/2-1/2':result;let mv='';sans.forEach((x,i)=>{if(i%2===0)mv+=(i/2+1)+'. ';mv+=x+' ';if(i===nOpen-1)mv+='{opening book end} ';});
 PGN.push(`[Event "ME Engine test"]\n[Site "Mind's Eye Chess"]\n[Round "${idx+1}"]\n[White "${W}"]\n[Black "${B}"]\n[Result "${res}"]\n[TimeControl "${myMs}ms/move vs ${sfMs}ms/move"]\n\n${mv.trim()} ${res}\n`);
 require('fs').writeFileSync(PGNFILE,PGN.join('\n'));
 const sc=result==='1/2'?0.5:((result==='1-0')===meWhite?1:0);
 return sc;
}
(async()=>{let done=0,tot=0,next=0,w=0,d=0,l=0;const run=async()=>{while(next<G){const i=next++;const sc=await game(i);tot+=sc;done++;sc===1?w++:sc===0?l++:d++;}};
await Promise.all(Array.from({length:conc},run));
const p=Math.min(Math.max(tot/G,0.01),0.99);const diff=-400*Math.log10(1/p-1);
console.log(`vs SF ${eloArg}: +${w} =${d} -${l}  score ${(100*tot/G).toFixed(1)}%  elo diff ${diff.toFixed(0)} => est ${eloArg==='full'?'':Math.round(+eloArg+diff)}`);})();
