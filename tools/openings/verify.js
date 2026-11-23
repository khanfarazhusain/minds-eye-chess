// Engine check for packs/opl.js (Stockfish chahiye: `stockfish` PATH mein, ya SF=/path).
// - line: drill side ki har chaal best se zyada se zyada LOSS cp kam; line ke end par eval sane.
// - move: sahi jawab (aur ok wale) best ke paas, mate wale steps mein mate.
// Run: node tools/openings/verify.js [depth]
const {spawn}=require('child_process'),fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.resolve(__dirname,'..','..');const DEPTH=+process.argv[2]||16,LOSS=70,TRAPLOSS=40;
const src=fs.readFileSync(path.join(ROOT,'course.html'),'utf8');
const a=src.indexOf("'use strict';"),z=src.indexOf('const today=');const fo=src.slice(src.indexOf('function fenOf('));
const C=vm.runInNewContext(src.slice(a,z)+'\n'+fo.slice(0,fo.indexOf('\n/*'))+';({parseFEN,legal,make,san,findMove,fenOf,START_FEN})',{console});
const OPL=require(path.join(ROOT,'packs','opl.js'));
const sf=spawn(process.env.SF||'stockfish');let buf='',wait=null;
sf.stdout.on('data',d=>{buf+=d;let i;while((i=buf.indexOf('\n'))>=0){const l=buf.slice(0,i);buf=buf.slice(i+1);if(wait)wait(l)}});
const send=s=>sf.stdin.write(s+'\n');
const uci=m=>m.f!=null?sq(m.f)+sq(m.t)+(m.promo?m.promo.toLowerCase():''):'';
const sq=i=>'abcdefgh'[i%8]+(Math.floor(i/8)+1);
function ev(fen,moves){return new Promise(res=>{let sc=null;wait=l=>{const m=l.match(/score (cp|mate) (-?\d+)/);if(m)sc=m[1]==='cp'?+m[2]:(+m[2]>0?100000-+m[2]:-100000-+m[2]);
  if(l.startsWith('bestmove')){wait=null;res({sc,best:l.split(' ')[1]})}};
  send(`position fen ${fen}${moves?' moves '+moves:''}`);send(`go depth ${DEPTH}`)})}
// side-to-move ke liye cp; move ke baad ka score = -ev(after)
async function moveLoss(st,mv){const fen=C.fenOf(st);const b=await ev(fen);const m=C.findMove(st,mv);const af=await ev(fen,uci(m));return{loss:uci(m)===b.best?0:b.sc-(-af.sc),best:b.sc,bm:b.best}}
(async()=>{send('uci');send('setoption name Threads value 4');send('isready');
  const bad=[],info=[];let n=0;
  for(const lv of OPL.data.levels)for(const les of lv.lessons)for(const [k,s] of les.steps.entries()){const where=`${les.key} #${k} ${s.h||s.q}`.slice(0,90);
    if(s.t==='line'){let st=C.parseFEN(s.fen||C.START_FEN);const mv=s.moves.split(' ');
      for(let i=0;i<mv.length;i++){const side=st.w?'w':'b';if(!s.drill||side===s.drill){const r=await moveLoss(st,mv[i]);n++;if(r.loss>(s.theory?140:LOSS))bad.push(`${where}: ply ${i+1} ${mv[i]} loses ${r.loss}cp (best ${r.bm})`)}
        st=C.make(st,C.findMove(st,mv[i]))}
      const e=await ev(C.fenOf(st));const w=st.w?e.sc:-e.sc;info.push(`${where}: end eval (White) ${w}`);if(!s.win&&Math.abs(w)>150)bad.push(`${where}: end eval ${w} (White POV)`)}
    if(s.t==='move'){const st=C.parseFEN(s.fen);const alts=[s.line[0]].concat((s.ok||[]).filter(x=>x!==s.line[0]));
      for(const m of alts){const r=await moveLoss(st,m);n++;const lim=s.mate?5:(m===s.line[0]?TRAPLOSS:LOSS);
        if(r.loss>lim)bad.push(`${where}: answer ${m} loses ${r.loss}cp (best ${r.bm}, ${r.best})`)}}}
  fs.writeFileSync(path.join(__dirname,'verify.txt'),`depth ${DEPTH}, ${n} moves checked\n`+info.join('\n')+'\n\nPROBLEMS:\n'+(bad.join('\n')||'none')+'\n');
  console.log(`${n} moves checked at depth ${DEPTH}. Problems: ${bad.length}`);bad.forEach(b=>console.log(' - '+b));send('quit')})();
