/* ================= Game Review: galti ko insaani zubaan mein samjhao =================
   Stockfish sirf ye batata hai ki chaal kharab thi aur best line kya hai (game ke baad).
   "Kyun" ka jawab yahan ke simple detectors dete hain: latakta mohra, fork, pin/skewer, mate, raja ki suraksha. */
const XV={P:1,N:3,B:3,R:5,Q:9,K:0};
const XN={P:'pyada',N:'ghoda (knight)',B:'oont (bishop)',R:'haathi (rook)',Q:'vazir (queen)',K:'raja'};
const xw=p=>p===p.toUpperCase();
const xval=p=>XV[p.toUpperCase()];
const xname=p=>XN[p.toUpperCase()];
const xmat=(st,w)=>st.b.reduce((a,p)=>a+(p&&xw(p)===w?xval(p):0),0);
/* side `byW` ke kaun se mohre square s par capture kar sakte hain (pseudo-legal, baari ki parwah kiye bina) */
function xAttackers(st,s,byW){return pseudo(Object.assign({},st,{w:byW,ep:-1})).filter(m=>m.t===s&&!m.castle).map(m=>m.f)}
/* side w ke latakte mohre: hamla hai aur (bachav nahi, ya sasta mohra hamla kar raha hai) */
function xHanging(st,w){const o=[];st.b.forEach((p,s)=>{if(!p||xw(p)!==w||p.toUpperCase()==='K')return;const att=xAttackers(st,s,!w);if(!att.length)return;
  const cheap=Math.min(...att.map(f=>xval(st.b[f])||0));const def=attacked(st.b,s,w);if(!def||cheap<xval(p))o.push({s,p,gain:def?xval(p)-cheap:xval(p)})});return o.sort((a,b)=>b.gain-a.gain)}
/* square s par khade mohre ke hamle (kaunse dushman mohre) */
function xTargets(st,s){const p=st.b[s];if(!p)return[];const w=xw(p);return pseudo(Object.assign({},st,{w,ep:-1})).filter(m=>m.f===s&&m.cap).map(m=>({s:m.t,p:st.b[m.t]}))}
/* pin / skewer: slider s se ek seedh mein pehla dushman mohra aur uske peeche zyada keemti (ya raja) */
function xRay(st,s){const p=st.b[s];if(!p)return null;const U=p.toUpperCase();if(!'BRQ'.includes(U))return null;const w=xw(p);
  const dirs=U==='B'?[[1,1],[1,-1],[-1,1],[-1,-1]]:U==='R'?[[1,0],[-1,0],[0,1],[0,-1]]:[[1,1],[1,-1],[-1,1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]];
  for(const[df,dr]of dirs){let f=(s&7)+df,r=(s>>3)+dr;const hit=[];while(f>=0&&f<8&&r>=0&&r<8&&hit.length<2){const q=st.b[r*8+f];if(q){if(xw(q)===w)break;hit.push({s:r*8+f,p:q})}f+=df;r+=dr}
    if(hit.length===2){const[a,b]=hit;const va=a.p.toUpperCase()==='K'?100:xval(a.p),vb=b.p.toUpperCase()==='K'?100:xval(b.p);
      if(a.p.toUpperCase()!=='P'&&vb>va)return{kind:'pin',front:a,back:b};if(va>vb&&vb>=3)return{kind:'skewer',front:a,back:b}}}
  return null}
const xsq=s=>sn(s);
const xPawns=n=>{const v=Math.round(n*10)/10;return v>=0.95&&v<1.05?'1 pyade':v.toFixed(v<3?1:0).replace(/\.0$/,'')+' pyade'};
/* line ko SAN mein, 1. e4 jaisi numbering ke saath */
function xLine(st,pv,n){const o=[];let s=st;for(const u of pv.slice(0,n)){const m=fromUci(s,u);if(!m)break;o.push((s.w?s.fm+'. ':(o.length?'':s.fm+'... '))+sanOf(s,m));s=make(s,m)}return o.join(' ')}
/* P = meri chaal se pehle, m = meri chaal, E0 = P ka engine result, E1 = chaal ke baad ka engine result (opponent ki baari) */
function explainMistake(P,m,E0,E1){const me=P.w,A=make(P,m);const why=[];let theme='',refArrow=null;
  const best=E0.lines[0],ref=E1.lines[0];const bm=best?fromUci(P,best.pv[0]):null;const r1=ref&&ref.pv[0]?fromUci(A,ref.pv[0]):null;
  const mySan=sanOf(P,m),bestSan=bm?sanOf(P,bm):'';
  /* nuksaan pyadon mein (mate na ho to) */
  let loss=null;if(best&&ref&&best.mate==null&&ref.mate==null)loss=Math.max(0,((best.cp||0)+(ref.cp||0))/100);
  /* 1. mate */
  if(ref&&ref.mate!=null&&ref.mate>0){const line=xLine(A,ref.pv,ref.mate*2-1);theme='mate';
    const k=kingSq(A.b,me),back=me?(k>>3)===0:(k>>3)===7;if(back&&r1&&'RQ'.includes(r1.p.toUpperCase())&&((r1.t>>3)===(k>>3)))theme='backrank';
    why.push(`**${mySan}** ke baad opponent ke paas **mate in ${ref.mate}** hai: ${line}.${theme==='backrank'?' Ye **back-rank mate** hai: raja peechhli line par band tha, bahar nikalne ka ghar (luft) nahi tha.':''}`)}
  else if(best&&best.mate!=null&&best.mate>0){theme='mate1';why.push(`Tumhare paas **mate in ${best.mate}** tha: ${xLine(P,best.pv,best.mate*2-1)}. Ye mauka chhoot gaya.`)}
  /* 2. opponent ka pehla jawab kya karta hai */
  if(r1&&!why.length){const B=make(A,r1);const rSan=sanOf(A,r1);refArrow=[sn(r1.f),sn(r1.t),'r'];
    const cap=A.b[r1.t];
    if(cap&&xw(cap)===me){const wasHangingBefore=xHanging(P,me).some(h=>h.s===r1.t);
      if(r1.t===m.t)why.push(`Jo ${xname(cap)} tumne **${xsq(m.t)}** par chala, wo wahan surakshit nahi tha. Opponent **${rSan}** se use le leta hai.`);
      else if(wasHangingBefore)why.push(`Tumhara ${xname(cap)} **${xsq(r1.t)}** par pehle se latak raha tha (bachav kam tha). **${mySan}** ne use nahi bachaya, aur opponent **${rSan}** se le leta hai.`);
      else why.push(`**${mySan}** ke baad tumhara ${xname(cap)} **${xsq(r1.t)}** par latak gaya. Opponent **${rSan}** se use le leta hai.`);
      theme=theme||'hanging'}
    const tg=xTargets(B,r1.t).filter(t=>t.p.toUpperCase()==='K'||xval(t.p)>=3||(xval(t.p)>xval(r1.p)));
    if(tg.length>=2){theme='fork';why.push(`**Fork:** ${rSan} se opponent ka ${xname(r1.p)} ek saath ${tg.slice(0,3).map(t=>xname(t.p)+' ('+xsq(t.s)+')').join(' aur ')} par hamla karta hai. Dono nahi bach sakte.`)}
    const ray=xRay(B,r1.t);if(ray&&!tg.length){theme=ray.kind;
      why.push(ray.kind==='pin'?`**Pin:** ${rSan} ke baad tumhara ${xname(ray.front.p)} (${xsq(ray.front.s)}) hil nahi sakta, kyunki uske peeche ${xname(ray.back.p)} (${xsq(ray.back.s)}) hai.`
        :`**Skewer:** ${rSan} tumhare ${xname(ray.front.p)} (${xsq(ray.front.s)}) par hamla karta hai; woh hatega to peeche wala ${xname(ray.back.p)} (${xsq(ray.back.s)}) jayega.`)}
    if(!why.length&&inCheck(B))why.push(`Opponent **${rSan}** check ke saath hamla shuru karta hai.`)}
  /* 3. line ke ant tak material */
  if(ref&&ref.mate==null){let s=A;let n=0;for(const u of ref.pv.slice(0,6)){const mm=fromUci(s,u);if(!mm)break;s=make(s,mm);n++}
    const d=(xmat(A,me)-xmat(A,!me))-(xmat(s,me)-xmat(s,!me));if(d>=1&&n>=3)why.push(`Opponent ki sabse achhi line: ${xLine(A,ref.pv,n)}. Iske ant tak tum lagbhag **${d} pyade** ka material kho dete ho.`)}
  /* 4. raja ki suraksha: castled raja ke saamne ka pyada */
  if(!why.length&&m.p.toUpperCase()==='P'){const k=kingSq(P.b,me),kf=k&7,f=m.f&7;if((kf>=5&&f>=5)||(kf<=2&&f<=2)){theme=theme||'kingatk';why.push(`**${mySan}** raja ke saamne ka pyada hai. Isse raja khula ho gaya aur opponent ke mohron ke liye raasta ban gaya.`)}}
  /* 5. behtar chaal kya karti */
  let bestWhy='';if(bm){const c=P.b[bm.t];const hangP=xHanging(P,me);const B2=make(P,bm);
    if(best.mate!=null&&best.mate>0)bestWhy='mate ki taraf le jaati.';
    else if(c&&xHanging(P,!me).some(h=>h.s===bm.t))bestWhy=`opponent ka latakta ${xname(c)} (${xsq(bm.t)}) muft mein le leti.`;
    else if(c)bestWhy=`${xname(c)} (${xsq(bm.t)}) le leti.`;
    else if(hangP.some(h=>h.s===bm.f))bestWhy=`latakte ${xname(P.b[bm.f])} ko surakshit jagah le jaati.`;
    else if(hangP.length&&!xHanging(B2,me).some(h=>h.s===hangP[0].s))bestWhy=`${xname(hangP[0].p)} (${xsq(hangP[0].s)}) ko bachati.`;
    else if(inCheck(B2))bestWhy='check ke saath pehal (initiative) le leti.';
    else{const tg=xTargets(B2,bm.t).filter(t=>t.p.toUpperCase()==='K'||xval(t.p)>=3);if(tg.length>=2)bestWhy=`fork banati: ${tg.map(t=>xname(t.p)).join(' aur ')} par ek saath hamla.`}}
  if(!why.length)why.push(`Koi mohra seedha nahi phansta, par Stockfish ke hisaab se is chaal se position ${loss!=null?'lagbhag **'+xPawns(loss)+'** jitni ':''}kamzor hui. Opponent ki behtar line: ${ref?xLine(A,ref.pv,4):'?'}.`);
  return{why,theme,bestSan,bestWhy,bestLine:best?xLine(P,best.pv,5):'',refLine:ref?xLine(A,ref.pv,4):'',ref:ref?ref.pv.slice(0,6):[],loss:loss!=null?Math.round(loss*10)/10:null,refArrow}}
/* theme -> puzzle drill (Lichess puzzle theme code) */
const XTHEME={hanging:['Latakta mohra (Hanging piece)','hanging'],fork:['Fork','fork'],pin:['Pin','pin'],skewer:['Skewer','skewer'],mate:['Mate dhundna','mate2'],mate1:['Mate dhundna','mate1'],backrank:['Back-rank mate','backrank'],kingatk:['Raja par hamla','kingatk']};
