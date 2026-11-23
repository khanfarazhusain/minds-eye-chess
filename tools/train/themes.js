// Kaunsa puzzle theme kis lesson mein sikhaya jaata hai: Road ka LES_TH (tools/road/app.js) hi single source hai.
// taughtBefore(X, idx) = course order mein idx se pehle ke lessons ke saare themes.
const fs=require('fs'),path=require('path');const {ROOT}=require('./lib');
function lesTh(X){const s=fs.readFileSync(path.join(ROOT,'tools','road','app.js'),'utf8');const m=s.match(/const LES_TH=(\{[\s\S]*?\});\n/);const o=Function('return '+m[1])();const out={};
  for(const [p,th] of Object.entries(o)){const[c,l]=p.split('.');const C=X.COURSE.find(x=>x.id===c);const les=C&&C.lessons.find(x=>x.id===l);out[les?les.key:p]=th}return out}
function taughtBefore(X,key,incl){const T=lesTh(X);const set=new Set();for(const C of X.COURSE)for(const l of C.lessons){if(l.key===key&&!incl)return set;(T[l.key]||[]).forEach(t=>set.add(t));if(l.key===key)return set}return set}
module.exports={lesTh,taughtBefore};
