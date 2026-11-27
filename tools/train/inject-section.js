// Pro Training section ka code (section.js + section.css) course.html mein markers ke beech daalta hai (Gym block ke baad, core ka hissa,
// isliye road.html ko bhi milta hai). tools/train/build.js isse chalata hai.
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..','..'),f=path.join(root,'course.html');let s=fs.readFileSync(f,'utf8');
const js=fs.readFileSync(path.join(__dirname,'section.js'),'utf8').trim(),css=fs.readFileSync(path.join(__dirname,'section.css'),'utf8').trim();
const put=(s,a,b,body,anchor)=>{const i=s.indexOf(a);if(i>=0){const j=s.indexOf(b,i);return s.slice(0,i)+a+'\n'+body+'\n'+s.slice(j)}
  const k=s.indexOf(anchor);if(k<0)throw new Error('anchor not found: '+anchor);return s.slice(0,k)+a+'\n'+body+'\n'+b+'\n'+s.slice(k)};
s=put(s,'/* ==== pro training js ==== */','/* ==== /pro training js ==== */',js,'/* ---------- views ---------- */');
s=put(s,'/* ==== pro training css ==== */','/* ==== /pro training css ==== */',css,'</style>');
fs.writeFileSync(f,s);console.log('course.html: pro training section updated');

/* App (index.html) ke course path aur level page ke liye drills ka chhota data: [key, title, level id, pichhla lesson, mode] */
{const {core}=require('./lib');const X=core();const ip=path.join(root,'index.html');let h=fs.readFileSync(ip,'utf8');
 const MODES=[['ev','📊','Position eval'],['eg','♔','Endgame vs engine'],['df','🛡','Defence'],['rs','⏱','Time pressure'],['sp','🤺','Sparring'],['gm','🎯','Guess the move'],['mr','🔍','Apne games ka review']];
 const D=[];let first=null;X.COURSE.forEach(C=>C.lessons.forEach((l,j)=>{if(!l.tr)return;if(!first)first=C.id;D.push([l.key,l.title.replace(/^🏋\s*/,'').replace(/^Drill:\s*/,'').replace(/^./,c=>c.toUpperCase()),C.id,j?C.lessons[j-1].key:'',l.key.slice(3,5)])}));
 const data=JSON.stringify({first,modes:MODES,d:D});const a=h.indexOf('/*TR-APP*/'),b=h.indexOf('/*TR-APP-END*/');if(a<0||b<0)throw new Error('TR-APP markers missing in index.html');
 h=h.slice(0,a+10)+data+h.slice(b);fs.writeFileSync(ip,h);console.log('index.html: TR_APP '+D.length+' drills')}
