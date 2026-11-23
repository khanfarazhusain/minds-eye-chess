// Shared helpers for the pro-training generators (node only, offline).
// - core(): course.html ki chess core (parseFEN, legal, make, san...) node mein load karta hai
// - SF: Stockfish (system binary, `apt install stockfish`) se UCI baat-cheet
// - pgnGames(): simple PGN reader
const fs=require('fs'),path=require('path'),vm=require('vm'),cp=require('child_process');
const ROOT=path.join(__dirname,'..','..');

function core(){const s=fs.readFileSync(path.join(ROOT,'course.html'),'utf8');const a=s.indexOf("'use strict';"),b=s.indexOf('/* ---------- views ---------- */');
  const stub={document:{querySelector:()=>null,querySelectorAll:()=>[],cookie:'',createElement:()=>({})},localStorage:{getItem:()=>null,setItem(){}},location:{hash:'',search:''},
    window:{addEventListener(){}},addEventListener(){},navigator:{},setTimeout,clearTimeout,setInterval,clearInterval,console,indexedDB:null,module:undefined,Worker:undefined};
  stub.self=stub.window;const ctx=vm.createContext(stub);
  vm.runInContext(s.slice(a,b)+'\n;this.__X={parseFEN,fenOf,legal,make,findMove,sanOf,inCheck,START_FEN,COURSE,ALLLES,attacked,kingSq,STEPS,isW:typeof isW!=="undefined"?isW:null,TRAIN:typeof TRAIN!=="undefined"?TRAIN:[]};',ctx);return ctx.__X}

class SF{constructor(bin){this.p=cp.spawn(bin||process.env.STOCKFISH||'/usr/games/stockfish');this.buf='';this.waiters=[];
    this.p.stdout.on('data',d=>{this.buf+=d;let i;while((i=this.buf.indexOf('\n'))>=0){const l=this.buf.slice(0,i).trim();this.buf=this.buf.slice(i+1);this.waiters.slice().forEach(w=>w(l))}});
    this.send('uci');this.send('setoption name Threads value 1');this.send('setoption name Hash value 64')}
  send(c){this.p.stdin.write(c+'\n')}
  until(pred){return new Promise(res=>{const w=l=>{if(pred(l)){this.waiters.splice(this.waiters.indexOf(w),1);res(l)}};this.waiters.push(w)})}
  async ready(){this.send('isready');await this.until(l=>l==='readyok')}
  // returns {lines:[{cp,mate,pv:[uci...]}], best}  (scores: side to move)
  async go(fen,{depth,movetime,multipv}={}){await this.ready();this.send('setoption name MultiPV value '+(multipv||1));this.send('position fen '+fen);
    const lines=[];const w=l=>{if(l.startsWith('info ')&&l.includes(' pv ')&&!/ (lower|upper)bound/.test(l)){const g=k=>{const m=l.match(new RegExp(' '+k+' (-?\\d+)'));return m?+m[1]:null};
      lines[(g('multipv')||1)-1]={cp:g('mate')!=null?null:g('cp'),mate:g('mate'),depth:g('depth'),pv:l.split(' pv ')[1].trim().split(/\s+/)}}};
    this.waiters.push(w);this.send(depth?'go depth '+depth:'go movetime '+(movetime||300));const b=await this.until(l=>l.startsWith('bestmove'));this.waiters.splice(this.waiters.indexOf(w),1);
    return{lines:lines.filter(Boolean),best:b.split(/\s+/)[1]}}
  quit(){try{this.send('quit')}catch(e){}}}

function pgnGames(txt){const out=[];for(const blk of txt.split(/\n(?=\[Event )/)){const tags={};blk.replace(/\[(\w+) "([^"]*)"\]/g,(_,k,v)=>{tags[k]=v});
  const mv=blk.replace(/\[[^\]]*\]/g,'').replace(/\{[^}]*\}/g,'').replace(/\([^)]*\)/g,'').replace(/\$\d+/g,'').replace(/\d+\.(\.\.)?/g,' ').replace(/(1-0|0-1|1\/2-1\/2|\*)\s*$/,'').trim().split(/\s+/).filter(Boolean);
  if(mv.length)out.push({tags,moves:mv})}return out}

const uciOf=m=>'abcdefgh'[m.f&7]+((m.f>>3)+1)+'abcdefgh'[m.t&7]+((m.t>>3)+1)+(m.promo?m.promo.toLowerCase():'');
function fromUci(X,st,u){return X.legal(st).find(m=>uciOf(m)===u.slice(0,4)+(u[4]||''))||X.legal(st).find(m=>uciOf(m).slice(0,4)===u.slice(0,4))}
// white-POV score in pawns (mate -> +-99)
const wScore=(l,whiteToMove)=>{if(!l)return 0;const s=l.mate!=null?(l.mate>0?99:-99):(l.cp||0)/100;return whiteToMove?s:-s};
function rng(seed){let s=seed>>>0||1;return()=>{s^=s<<13;s>>>=0;s^=s>>17;s^=s<<5;s>>>=0;return s/4294967296}}
module.exports={ROOT,core,SF,pgnGames,uciOf,fromUci,wScore,rng};
