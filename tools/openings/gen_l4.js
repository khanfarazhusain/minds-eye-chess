// Level 4 (Master) generator: asli OTB master games (tools/train/data/masters, Lichess broadcast, CC0)
// ko ECO book se family mein baantta hai, har family ke liye:
//  - 2 model games (opening se ~move 22 tak, notes: kahan tak theory, kahan se naya, engine ka number)
//  - 2 "master ki chaal" sawaal (sirf jahan master ki chaal = Stockfish ki best)
// Output: tools/openings/l4_auto.json (l4_master.js isse padhta hai). Run: SF=/usr/games/stockfish node tools/openings/gen_l4.js
const fs=require('fs'),path=require('path'),vm=require('vm'),{spawn}=require('child_process');
const ROOT=path.resolve(__dirname,'..','..');
const src=fs.readFileSync(path.join(ROOT,'course.html'),'utf8');
const a=src.indexOf("'use strict';"),z=src.indexOf('const today=');const fo=src.slice(src.indexOf('function fenOf('));
const C=vm.runInNewContext(src.slice(a,z)+'\n'+fo.slice(0,fo.indexOf('\n/*'))+';({parseFEN,legal,make,san,findMove,fenOf,START_FEN})',{console});
const ECO=JSON.parse(fs.readFileSync(path.join(ROOT,'packs','openings.json'),'utf8'));
const FAM=[['open',c=>/^C[2-9]/.test(c)],['sic',c=>/^B[2-9]/.test(c)],['semi',c=>/^B[01]|^C[01]/.test(c)],['qg',c=>/^D[0-6]/.test(c)],['ind',c=>/^A|^D[7-9]|^E/.test(c)]];
function games(){const out=[];for(const f of ['otb-2400.pgn','otb-2600.pgn','otb-2700.pgn']){const t=fs.readFileSync(path.join(ROOT,'tools/train/data/masters',f),'utf8');
  for(const g of t.split(/\n(?=\[Event )/)){const tag=k=>{const m=g.match(new RegExp('\\[' +k+' "([^"]*)"\\]'));return m?m[1]:''};
    const body=g.split(/\n\n/).slice(1).join(' ').replace(/\{[^}]*\}/g,'').replace(/\d+\.(\.\.)?/g,' ').trim().split(/\s+/).filter(x=>x&&!/^(1-0|0-1|1\/2-1\/2|\*)$/.test(x));
    const res=tag('Result');if(res!=='1-0'&&res!=='0-1')continue;const we=+tag('WhiteElo'),be=+tag('BlackElo');if(Math.min(we,be)<2550||body.length<50)continue;
    out.push({w:tag('White'),b:tag('Black'),we,be,ev:tag('Event'),date:tag('Date'),res,mv:body})}}return out}
function eco(mv){let best=null;for(const[code,name,line]of ECO){const L=line.split(' ');if(L.length<=mv.length&&L.every((x,i)=>x===mv[i])&&(!best||L.length>best[2]))best=[code,name,L.length]}return best}
const sf=spawn(process.env.SF||'stockfish');let buf='',wait=null;sf.stdout.on('data',d=>{buf+=d;let i;while((i=buf.indexOf('\n'))>=0){const l=buf.slice(0,i);buf=buf.slice(i+1);if(wait)wait(l)}});
const send=s=>sf.stdin.write(s+'\n');const sq=i=>'abcdefgh'[i%8]+(Math.floor(i/8)+1);const uci=m=>sq(m.f)+sq(m.t)+(m.promo?m.promo.toLowerCase():'');
function ev(fen,d){return new Promise(r=>{let sc=null,mp={};wait=l=>{const m=l.match(/multipv (\d+) .*score (cp|mate) (-?\d+).* pv (\S+)/);if(m)mp[m[1]]={sc:m[2]==='cp'?+m[3]:(+m[3]>0?9999:-9999),mv:m[4]};
  if(l.startsWith('bestmove')){wait=null;r(mp)}};send('position fen '+fen);send('go depth '+(d||16))})}
const nm=s=>s.replace(/,.*$/,'');
(async()=>{send('uci');send('setoption name Threads value 4');send('setoption name MultiPV value 2');
  const G=games();const byFam={};
  for(const g of G){let p=C.parseFEN(C.START_FEN);const sans=[],fens=[],movs=[];let ok=true;for(const m of g.mv){const mv=C.findMove(p,m);if(!mv){ok=false;break}fens.push(C.fenOf(p));movs.push(mv);sans.push(C.san(p,mv,C.legal(p)));p=C.make(p,mv)}
    if(!ok)continue;const e=eco(sans);if(!e)continue;const f=FAM.find(x=>x[1](e[0]));if(!f)continue;Object.assign(g,{sans,fens,movs,eco:e});(byFam[f[0]]=byFam[f[0]]||[]).push(g)}
  const out={};
  for(const [fam] of FAM){const L=(byFam[fam]||[]).sort((x,y)=>(y.we+y.be)-(x.we+x.be)).slice(0,2);out[fam]={games:[],guess:[]};
    for(const g of L){const end=Math.min(g.sans.length,44);const e=g.eco;const notes={};notes[String(e[2])]=`Theory yahan tak: **${e[0]} ${e[1]}**. Ab players apne plan se.`;
      const fin=await ev(g.fens[end]||C.fenOf((()=>{let p=C.parseFEN(C.START_FEN);for(let i=0;i<end;i++)p=C.make(p,g.movs[i]);return p})()),18);
      const sc=fin['1']?fin['1'].sc:0;const wsc=(end%2===0?sc:-sc)/100;
      notes[String(end)]=`Move ${Math.ceil(end/2)} tak. Engine: ${wsc>0?'+':''}${wsc.toFixed(1)} (White ke hisaab se). Game ka nateeja: **${g.res}** (${g.res==='1-0'?nm(g.w):nm(g.b)} jeete).`;
      out[fam].games.push({h:`${nm(g.w)} (${g.we}) vs ${nm(g.b)} (${g.be}), ${g.ev} ${g.date.slice(0,4)}`,moves:g.sans.slice(0,end).join(' '),notes,eco:e[0]+' '+e[1]});
      // guess: winner side, plies 16..60, master move == engine best, aur doosri best se 50cp+ behtar (ek hi sahi jawab)
      const wside=g.res==='1-0'?0:1;let got=0;
      for(let i=Math.max(16,e[2]);i<Math.min(g.sans.length,70)&&got<1;i++){if(i%2!==wside)continue;const r=await ev(g.fens[i],16);if(!r['1']||!r['2'])continue;
        if(r['1'].mv===uci(g.movs[i])&&r['1'].sc-r['2'].sc>=50&&Math.abs(r['1'].sc)<400){out[fam].guess.push({fen:g.fens[i],line:[g.sans[i]],game:`${nm(g.w)} vs ${nm(g.b)}`,mvn:Math.floor(i/2)+1,side:i%2?'b':'w',eco:e[1]});got++}}}
    console.log(fam,(byFam[fam]||[]).length,'games ->',out[fam].games.length,'model,',out[fam].guess.length,'guess')}
  fs.writeFileSync(path.join(__dirname,'l4_auto.json'),JSON.stringify(out,null,1));send('quit')})();
