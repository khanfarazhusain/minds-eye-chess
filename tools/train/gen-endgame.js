// Endgame drills ladder (engine ke against). Har position Stockfish se verify: jeet wali sach mein jeet, draw wali sach mein draw.
// Run: node tools/train/gen-endgame.js   -> tools/train/ladders/endgame.json
const fs=require('fs'),path=require('path');const {core,SF,rng}=require('./lib');
const X=core();const R=rng(20261123);const ri=n=>Math.floor(R()*n);
const F='abcdefgh';const sqn=(f,r)=>F[f]+(r+1);
function fenFrom(pcs,w){const b=Array(64).fill(null);for(const[p,s]of pcs){const i='abcdefgh'.indexOf(s[0])+8*(+s[1]-1);if(b[i])return null;b[i]=p}
  let o='';for(let r=7;r>=0;r--){let e=0;for(let f=0;f<8;f++){const p=b[r*8+f];if(!p)e++;else{if(e){o+=e;e=0}o+=p}}if(e)o+=e;if(r)o+='/'}return o+' '+(w?'w':'b')+' - - 0 1'}
function okPos(fen){if(!fen)return false;const st=X.parseFEN(fen);const ks=X.kingSq(st.b,true),kb=X.kingSq(st.b,false);if(Math.max(Math.abs((ks&7)-(kb&7)),Math.abs((ks>>3)-(kb>>3)))<2)return false;
  if(X.attacked(st.b,X.kingSq(st.b,!st.w),st.w))return false;/* side not to move in check = illegal */
  for(let i=0;i<64;i++){const p=st.b[i];if(p&&p.toUpperCase()==='P'&&((i>>3)===0||(i>>3)===7))return false}return X.legal(st).length>0}
const rsq=()=>sqn(ri(8),ri(8));
const mirror=fen=>{const[pos,side]=fen.split(' ');return pos.split('/').map(r=>r.split('').reverse().join('')).join('/')+' '+side+' - - 0 1'};
// colour flip: board upside down + swap colours (white task -> black task)
const flip=fen=>{const[pos,side]=fen.split(' ');return pos.split('/').reverse().map(r=>r.replace(/[a-z]/gi,c=>c===c.toUpperCase()?c.toLowerCase():c.toUpperCase())).join('/')+' '+(side==='w'?'b':'w')+' - - 0 1'};

async function main(){const sf=new SF();const seen=new Set();
  const dtm=async(fen,d)=>{const r=await sf.go(fen,{depth:d||18});const l=r.lines[0];return l&&l.mate>0?l.mate:null};
  const ev=async(fen,d)=>{const r=await sf.go(fen,{depth:d||18});const l=r.lines[0];return l?(l.mate!=null?(l.mate>0?99:-99):l.cp/100):0};
  // random mates: pieces = white extra pieces
  async function mates(extra,lo,hi,n,slack){const out=[];let tries=0;while(out.length<n&&tries++<4000){const pcs=[['K',rsq()],['k',rsq()],...extra.map(p=>[p,rsq()])];const fen=fenFrom(pcs,true);
      if(!okPos(fen)||seen.has(fen))continue;const d=await dtm(fen,16);if(d==null||d<lo||d>hi)continue;seen.add(fen);out.push({fen,d,max:d+slack})}return out}
  const play=(o,goal,q,why)=>({t:'play',fen:o.fen,goal,max:o.max,sf:250,q,why});
  const L=[];

  /* ---------- EG1: basic mates vs engine (after Basic mates chapter) ---------- */
  {const kq=await mates(['Q'],5,9,22,6),kr=await mates(['R'],8,15,22,6),rr=await mates(['R','R'],3,7,10,4),qr=await mates(['Q','R'],2,6,8,4);
    const mk=(o,t)=>play(o,'mate',`${t} Engine poori taakat se bachega. **${o.max} chaal** mein mate karo.`,t.includes('Rook se')?'Box chhota karo: rook se line kaato, king ko saath lao (opposition), phir kinare par mate.':t.includes('Queen se')?'Queen knight ki doori par rakh kar box chhota karo, phir king paas lao. Stalemate se bacho!':'Seedhi (ladder): ek piece rank band kare, doosra agli rank par check de.');
    const P=[...kq.map(o=>mk(o,'Queen se mate.')),...kr.map(o=>mk(o,'Rook se mate.')),...rr.map(o=>mk(o,'Do rooks ki seedhi (ladder) se mate.')),...qr.map(o=>mk(o,'Queen + rook ki seedhi se mate.'))];
    const steps=[{t:'info',h:'Drill: engine ke against mate karo',md:'Yeh lesson nahi, **practice** hai. Jo mates tumne seekhe (queen, rook, do rooks ki seedhi), unhe ab **engine ke against** karna hai. Engine har baar sabse lambi bachne wali chaal chalega.\n\n- Pehle **practice**: galti ho to ↶ Wapas, 💡 hint, ↺ shuru se.\n- Phir **test**: 5 naye positions, **ek hi koshish**, hint nahi. **4/5** par agla lesson khulega.\n\nYaad rakho: **stalemate = draw**. Har chaal se pehle dekho ki opponent king ke paas chaal bachi hai ya nahi.'}];
    const pick=(a,k)=>a.splice(0,k);steps.push(...pick(P.filter(x=>x.q.startsWith('Queen se')),3),...pick(P.filter(x=>x.q.startsWith('Rook se')),3),...pick(P.filter(x=>/seedhi/.test(x.q)),2));
    const used=new Set(steps.map(s=>s.fen));
    L.push({ch:'l2',after:'l2.ladder',needs:['l1.mate','l2.kqk','l2.krk','l2.ladder'],les:{id:'tr_eg1',key:'tr.eg1',title:'🏋 Drill: basic mates engine ke against',sub:'Queen, rook aur seedhi se mate, engine poori taakat se bachta hai',
      yaad:['Box chhota karo, king saath lao, kinare par mate.','Queen se mate karte waqt stalemate se bacho.','Test: 5 mein se 4 bina hint.'],steps,pool:P.filter(x=>!used.has(x.fen)),qn:5}})}

  /* ---------- EG2: King + pawn (after opposition lesson) ---------- */
  {const win=[],draw=[];let tries=0;
    while((win.length<26||draw.length<22)&&tries++<9000){const pf=1+ri(6),pr=1+ri(4);const wk=sqn(Math.max(0,Math.min(7,pf-1+ri(3))),Math.min(7,pr+ri(3)));const bk=rsq();const pawn=sqn(pf,pr);
      const w=R()<0.6;const fen=fenFrom([['K',wk],['k',bk],['P',pawn]],w);if(!okPos(fen)||seen.has(fen))continue;
      const bkf='abcdefgh'.indexOf(bk[0]),bkr=+bk[1]-1;if(Math.abs(bkf-pf)>2||bkr<=pr)continue;/* defender king saamne, taught situation */
      const e=await ev(fen,20);const ew=w?e:-e;
      if(w&&ew>=50&&win.length<26){seen.add(fen);win.push({fen,max:25})}
      else if(!w&&Math.abs(e)<0.3&&draw.length<22){const e2=await ev(fen,26);if(Math.abs(e2)<0.3){seen.add(fen);draw.push({fen:flip(fen),max:20})}}}
    // draw tasks: flip so learner is White? learner should defend as Black like the Philidor lesson; keep Black-to-move original instead
    const P=[...win.map(o=>play(o,'promote','King aur pawn: king aage lao, **opposition** lo aur pawn ko **queen banao**.','King pawn ke aage, key squares par. Kings aamne-saamne ho to opposition jiske paas, woh jeetta hai.')),
      ...draw.map(o=>play({fen:flip(o.fen),max:o.max},'draw','Tum defend kar rahe ho. King pawn ke **saamne** rakho aur **opposition** lo. **20 chaal** tak queen mat banne do.','Defender ka king pawn ke aage, aur jab white king aamne aaye to tum opposition lo (kings ke beech ek square, chaal uski).'))];
    const steps=[{t:'info',h:'Drill: king + pawn, dono taraf se',md:'Opposition aur key squares ab **engine ke against**.\n\n- Kuch positions mein tum **jeetoge** (pawn queen banao).\n- Kuch mein tum **defend** karoge (draw bachao).\n\nPractice ke baad test: 5 naye positions, ek koshish, **4/5** chahiye.'},
      ...P.filter(x=>x.goal==='promote').slice(0,4),...P.filter(x=>x.goal==='draw').slice(0,3)];const used=new Set(steps.map(s=>s.fen));
    L.push({ch:'l5',after:'l5.kp',needs:['l5.kp'],les:{id:'tr_eg2',key:'tr.eg2',title:'🏋 Drill: king + pawn, jeeto aur bachao',sub:'Opposition aur key squares engine ke against',yaad:['King pawn ke aage = jeet ka raasta.','Defend karte waqt king pawn ke saamne, opposition lo.'],steps,pool:P.filter(x=>!used.has(x.fen)),qn:5}})}

  /* ---------- EG3: square rule + passed pawns (after pawn endgame tricks) ---------- */
  {const run=[],catchp=[],two=[];let tries=0;
    while((run.length<16||catchp.length<14||two.length<16)&&tries++<12000){const t=ri(3);
      if(t===0||t===1){const pf=ri(8),pr=1+ri(4);const fen=fenFrom([['K',rsq()],['k',rsq()],['P',sqn(pf,pr)]],t===0);if(!okPos(fen)||seen.has(fen))continue;
        const st=X.parseFEN(fen);const wk=X.kingSq(st.b,true);const pi=pr*8+pf;if(Math.max(Math.abs((wk&7)-pf),Math.abs((wk>>3)-pr))<4)continue;/* white king door: square rule hi faisla kare */
        const e=await ev(fen,20),ew=t===0?e:-e;
        if(t===0&&ew>=50&&run.length<16){seen.add(fen);run.push({fen,max:12})}
        else if(t===1&&Math.abs(e)<0.3&&catchp.length<14){seen.add(fen);catchp.push({fen,max:12})}}
      else{/* 2 pawns vs 1, kings nearby: outside passed pawn */const a=ri(2)?0:7;const pcs=[['K',rsq()],['k',rsq()],['P',sqn(a,1+ri(3))],['P',sqn(a?ri(3):5+ri(3),1+ri(3))]];pcs.push(['p',sqn(pcs[3][1].charCodeAt(0)-97,5+ri(2))]);
        const fen=fenFrom(pcs,true);if(!okPos(fen)||seen.has(fen))continue;const e=await ev(fen,18);if(e>=8&&two.length<16){seen.add(fen);two.push({fen,max:30})}}}
    const P=[...run.map(o=>play(o,'promote','**Square rule**: kya black king pawn pakad payega? Pawn ko **queen banao** (12 chaal).','Pawn se promotion tak box banao. King box ke bahar = pawn bhaag jaata hai.')),
      ...catchp.map(o=>play({fen:flip(o.fen),max:o.max},'draw','Tum defend kar rahe ho. **Square rule**: king ko pawn ke box mein lao aur pawn pakdo (12 chaal tak queen mat banne do).','King ko pawn ke box mein lao, phir pawn ke aage.')),
      ...two.map(o=>play(o,'promote','**Outside passed pawn**: kinare wala pawn dushman king ko kheenchta hai. Plan banao aur **queen banao** (30 chaal).','Passed pawn aage badhao; jab king use pakadne jaaye, tumhara king doosri taraf pawns khaaye.'))];
    const steps=[{t:'info',h:'Drill: square rule aur passed pawns',md:'Pawn endgame ki tricks ab engine ke against: **square rule** (pawn bhagao ya pakdo) aur **outside passed pawn**.\n\nTest: 5 naye positions, **4/5** chahiye.'},
      ...P.filter(x=>x.max===12&&x.goal==='promote').slice(0,2),...P.filter(x=>x.goal==='draw').slice(0,2),...P.filter(x=>x.max===30).slice(0,3)];const used=new Set(steps.map(s=>s.fen));
    L.push({ch:'l5b',after:'l5.pawnend',needs:['l5.square','l5.pawnend'],les:{id:'tr_eg3',key:'tr.eg3',title:'🏋 Drill: square rule aur passed pawns',sub:'Pawn bhagao, pawn pakdo, outside passed pawn se jeeto',yaad:['Square rule: king box mein = pawn pakda jaayega.','Outside passed pawn dushman king ko door kheenchta hai.'],steps,pool:P.filter(x=>!used.has(x.fen)),qn:5}})}

  /* ---------- EG4: Lucena, Philidor, Vancura (after rook endgames) ---------- */
  {const luc=[],phi=[],van=[];
    for(let x=1;x<=6;x++){/* Lucena: K on queening sq, pawn 7th, defender king cut off 2 files away, our rook on the file between */
      for(const side of[1,-1]){const bkf=x+2*side,wrf=x+side,brf=x-side;if(bkf<0||bkf>7||brf<0||brf>7)continue;
        for(const brr of[1,2,3]){const fen=fenFrom([['K',sqn(x,7)],['P',sqn(x,6)],['k',sqn(bkf,6)],['R',sqn(wrf,0)],['r',sqn(brf,brr)]],true);if(!okPos(fen))continue;
          const e=await ev(fen,20);if(e>=5){luc.push({fen,max:20});luc.push({fen:flip(fen),max:20})}}}}
    for(let x=1;x<=6;x++){/* Philidor: defender rook on 6th (3rd from attacker), defender king on queening square, attacker K+P on 5th */
      for(const wrf of[0,7])for(const brf of[0,1,6,7]){if(Math.abs(brf-x)<2)continue;const fen=fenFrom([['k',sqn(x,7)],['P',sqn(x,4)],['K',sqn(Math.max(0,Math.min(7,x-1)),4)],['R',sqn(wrf,6)],['r',sqn(brf,5)]],false);if(!okPos(fen)||Math.abs(wrf-x)<2)continue;
        const e=await ev(fen,22);if(Math.abs(e)<0.4){phi.push({fen,max:15});phi.push({fen:flip(fen),max:15})}}}
    for(const wk of['b1','c2','b3','c4','d3','b4','c5']){for(const bk of['g7','h7']){const fen=fenFrom([['R','a8'],['k',bk],['P','a6'],['r','f6'],['K',wk]],false);if(!okPos(fen))continue;const e=await ev(fen,22);if(Math.abs(e)<0.5){van.push({fen,max:15});van.push({fen:mirror(fen),max:15})}}}
    const sh=a=>{for(let i=a.length-1;i>0;i--){const j=ri(i+1);[a[i],a[j]]=[a[j],a[i]]}return a};sh(luc);sh(phi);sh(van);
    const P=[...luc.map(o=>play(o,'promote','**Lucena**: pawn 7th par, king aage. Rook se **bridge** banao aur pawn ko **queen banao** (20 chaal).','Pehle rook se dushman king ko door rakho, phir rook ko 4th rank (pawn ki taraf se) par lao: king bahar nikle to rook checks block karega (bridge).')),
      ...phi.map(o=>play(o,'draw','**Philidor**: tum defend kar rahe ho. Rook **6th rank** (apni taraf se 3rd) par rakho; pawn aage aaye to rook peeche se **checks**. **15 chaal** bachao.','Rook 6th rank par jab tak pawn aage na aaye; pawn aaya to rook peeche jaa kar checks.')),
      ...van.map(o=>play(o,'draw','**Vancura**: tum defend kar rahe ho. Rook side se pawn par nazar rakhe, king paas aaye to side se **checks**. **15 chaal** bachao.','Rook pawn ke bagal wali rank par, king kone ke paas; checks side se.'))];
    const steps=[{t:'info',h:'Drill: Lucena, Philidor, Vancura',md:'Rook endgames sabse zyada aate hain. Ab teeno technique **engine ke against**, alag alag files aur dono colours se.\n\n- **Lucena**: jeeto (bridge).\n- **Philidor**: draw bachao (6th rank, phir peeche se checks).\n- **Vancura**: draw bachao (side se).\n\nTest: 5 naye positions, **4/5** chahiye.'},
      ...P.filter(x=>x.q.startsWith('**Lucena')).slice(0,3),...P.filter(x=>x.q.startsWith('**Philidor')).slice(0,3),...P.filter(x=>x.q.startsWith('**Vancura')).slice(0,2)];const used=new Set(steps.map(s=>s.fen));
    L.push({ch:'l5b',after:'l5.rook',needs:['l5.rook'],les:{id:'tr_eg4',key:'tr.eg4',title:'🏋 Drill: Lucena, Philidor, Vancura',sub:'Rook endgames har file aur dono colours se',yaad:['Lucena = bridge se jeet.','Philidor = 6th rank, phir peeche se checks.','Vancura = side se defence.'],steps,pool:P.filter(x=>!used.has(x.fen)),qn:5}})}

  /* ---------- EG5 (GM): bishop + knight mate, technique pakka (after minor pieces) ---------- */
  {const bn=[];let tries=0;while(bn.length<16&&tries++<6000){const pcs=[['K',rsq()],['k',rsq()],['B',rsq()],['N',rsq()]];const fen=fenFrom(pcs,true);if(!okPos(fen)||seen.has(fen))continue;
      const st=X.parseFEN(fen);const bk=X.kingSq(st.b,false);const f=bk&7,r=bk>>3;if(f>0&&f<7&&r>0&&r<7)continue;/* black king already near edge: drill = final phase */
      const d=await dtm(fen,22);if(d==null||d<8||d>22)continue;seen.add(fen);bn.push({fen,max:d+8})}
    const P=bn.map(o=>play(o,'mate','**Bishop + knight mate**: king ko **bishop ke colour wale corner** mein le jao aur mate karo ('+o.max+' chaal).','Kings aamne-saamne rakho, knight aur bishop milkar king ko sahi corner ki taraf dhakelte hain (W shape mein knight). Galat corner mein mate nahi hota.'));
    const steps=[{t:'info',h:'Naya: bishop + knight se mate kaise',md:'Pichle lesson mein seekha: K+B+N vs K **jeet** hai, mate sirf **bishop ke colour wale corner** mein. Ab technique:\n\n1. **Teeno saath**: apna king dushman king ke paas, bishop aur knight beech mein squares band karte hain.\n2. Dushman king **galat corner** mein ho to use kinare ke saath **sahi corner** ki taraf dhakelo. Knight ek **W** shape mein chalta hai (jaise `Nf7-e5-d7-c5`), bishop diagonal band karta hai.\n3. Sahi corner ke paas: king ko corner mein band karo, bishop se aakhri check.\n\nYeh **lamba** hai (30 chaal tak). Isliye positions mein dushman king pehle se kinare par hai. Stalemate se bacho.'},...P.slice(0,4)];
    const used=new Set(steps.map(s=>s.fen));
    L.push({ch:'l5b',after:'l5.minor',teaches:['w shape'],needs:['l5.minor','l2.ladder'],les:{id:'tr_eg5',key:'tr.eg5',title:'🏋 Drill: bishop + knight mate (GM level)',sub:'Sabse mushkil basic mate, engine ke against',yaad:['Mate bishop ke colour wale corner mein.','Knight W shape mein, bishop diagonal band kare, king paas.'],steps,pool:P.filter(x=>!used.has(x.fen)),qn:4}})}

  sf.quit();fs.mkdirSync(path.join(__dirname,'ladders'),{recursive:true});fs.writeFileSync(path.join(__dirname,'ladders','endgame.json'),JSON.stringify(L,null,1));
  console.log(L.map(l=>l.les.key+': '+l.les.steps.length+' steps, pool '+l.les.pool.length).join('\n'))}
main().catch(e=>{console.error(e);process.exit(1)});
