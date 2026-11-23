// Sequence checker: koi drill kisi aisi cheez ko use na kare jo pehle sikhayi nahi gayi.
// 1) har drill ke `needs` lessons, Main Course aur Road to 3000 dono mein, drill se PEHLE aate hain
// 2) chess terms (TERMS): drill ke text mein jo term aaye, woh kisi normal lesson mein drill se PEHLE sikhaya gaya ho,
//    ya drill khud use apne pehle info step mein sikhaye (T.teaches mein likha ho)
// Run: node tools/train/check-order.js   (exit 1 on any problem)
const fs=require('fs'),path=require('path');const {ROOT,core}=require('./lib');
const X=core();const errs=[];
const TERMS=['stalemate','checkmate','castle','opposition','key square','square rule','triangulation','outside passed pawn','passed pawn','lucena','philidor','vancura','bridge',
  'development','king safety','space','pawn structure','isolated','doubled','compensation','fork','pin','skewer','discovered','deflection','decoy','zwischenzug','x-ray','back-rank','smothered',
  'outpost','open file','7th rank','prophylaxis','blunder','increment','time trouble','zugzwang','candidate','forcing','hanging','exchange','underpromotion','en passant','eval','tempo','w shape'];
const order=[];X.COURSE.forEach(C=>C.lessons.forEach(l=>order.push(l)));
const pos=k=>order.findIndex(l=>l.key===k);
const textOf=l=>JSON.stringify([l.title,l.sub,l.yaad,l.steps,l.pool||[]]).toLowerCase();
const has=(t,term)=>new RegExp('(^|[^a-z])'+term.replace(/[-]/g,'\\-')+'(s|es|d|ed|ing)?([^a-z]|$)').test(t);
// first mention of each term in the course (lesson index)
const first={};order.forEach((l,i)=>{if(l.tr)return;const t=textOf(l);TERMS.forEach(term=>{if(first[term]==null&&has(t,term))first[term]=i})});

const TRAIN=X.TRAIN;if(!TRAIN.length)errs.push('TRAIN khaali hai (build.js chalao)');
for(const T of TRAIN){const k=T.les.key,i=pos(k);if(i<0){errs.push(k+': course mein nahi mila');continue}
  if(pos(T.after)<0)errs.push(k+': after "'+T.after+'" nahi mila');
  for(const n of T.needs){const j=pos(n);if(j<0)errs.push(k+': needs "'+n+'" course mein nahi');else if(j>=i)errs.push(`${k} (#${i+1}) needs ${n} (#${j+1}): pehle sikhao`)}
  const t=textOf(T.les);for(const term of TERMS)if(has(t,term)&&!(T.teaches||[]).includes(term)&&first[term]!=null&&first[term]>i)errs.push(`${k}: term "${term}" pehli baar #${first[term]+1} ${order[first[term]].key} mein sikhaya jaata hai, drill #${i+1} usse pehle hai`)}

/* Road to 3000: same insertion logic as tools/road/app.js */
const rc=fs.readFileSync(path.join(ROOT,'tools','road','content.js'),'utf8');const RM={exports:{}};new Function('module',rc)(RM);const {ROAD_LEVELS,ROAD_NEW}=RM.exports;
const NEW=new Set(ROAD_NEW.map(l=>l.key));
const LV=ROAD_LEVELS.map(L=>({n:L.n,lessons:L.lessons.map(p=>{if(NEW.has(p))return p;const[c,l]=p.split('.');const C=X.COURSE.find(x=>x.id===c);const les=C&&C.lessons.find(x=>x.id===l);return les?les.key:null}).filter(Boolean)}));
for(const T of TRAIN){const a=T.roadAfter||T.after;let ok=false;for(const L of LV){const i=L.lessons.indexOf(a);if(i>=0){let j=i+1;while(L.lessons[j]&&L.lessons[j].startsWith('tr.'))j++;L.lessons.splice(j,0,T.les.key);ok=true;break}}if(!ok)errs.push(T.les.key+': Road mein "'+a+'" nahi mila')}
const rorder=[];LV.forEach(L=>L.lessons.forEach(k=>rorder.push({k,n:L.n})));const rpos=k=>rorder.findIndex(x=>x.k===k);
for(const T of TRAIN){const i=rpos(T.les.key);if(i<0)continue;for(const n of T.needs){const j=rpos(n);if(j<0)errs.push(`Road: ${T.les.key} needs ${n}, jo Road ke kisi level mein nahi`);else if(j>i)errs.push(`Road: ${T.les.key} (L${rorder[i].n}) needs ${n} (L${rorder[j].n}): pehle sikhao`)}}

if(errs.length){console.error('SEQUENCE PROBLEMS:\n- '+errs.join('\n- '));process.exit(1)}
console.log(`Sequence OK: ${TRAIN.length} drills. Main Course: `+TRAIN.map(T=>`${T.les.key}@#${pos(T.les.key)+1}`).join(', ')+'\nRoad: '+TRAIN.map(T=>`${T.les.key}@L${rorder[rpos(T.les.key)].n}`).join(', '));
