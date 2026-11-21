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
  if(!why.length&&bm)why.push(...xWhyPositional(P,m,bm,ref,best.pv));
  else if(!why.length)why.push(`**${mySan}** ke baad opponent ko aasaan khel milta hai.`);
  /* best chaal ka plan aur opponent ki behtar line ka matlab */
  const plan=best?xPlan(P,best.pv):null;let refWhy='';
  if(r1){const R=xIdeas(A,r1);if(R.pos.length)refWhy=`${xNum(A,sanOf(A,r1))}: ${R.pos.slice(0,2).join(' aur ')}`}
  return{v:2,why,theme,bestSan,bestWhy,plan,refWhy,bestLine:best?xLine(P,best.pv,5):'',refLine:ref?xLine(A,ref.pv,4):'',ref:ref?ref.pv.slice(0,6):[],bpv:best?best.pv.slice(0,6):[],loss:loss!=null?Math.round(loss*10)/10:null,refArrow}}
/* theme -> puzzle drill (Lichess puzzle theme code) */
const XTHEME={hanging:['Latakta mohra (Hanging piece)','hanging'],fork:['Fork','fork'],pin:['Pin','pin'],skewer:['Skewer','skewer'],mate:['Mate dhundna','mate2'],mate1:['Mate dhundna','mate1'],backrank:['Back-rank mate','backrank'],kingatk:['Raja par hamla','kingatk']};

/* ================= Positional samajh: jab koi tactic nahi, tab bhi "kyun" =================
   Center, development, raja ki suraksha, mohron ki activity, pyadon ka dhaancha, space, bishop pair, opening ke usool.
   Har chaal ke liye: wo kya karti hai (pos) aur usme kya kamzori hai (neg). */
const XS={P:'pyada',N:'ghoda',B:'oont',R:'haathi',Q:'vazir',K:'raja'};
const xs=p=>XS[p.toUpperCase()];
const XO={P:'pyade',N:'ghode',B:'oont',R:'haathi',Q:'vazir',K:'raja'};const xo=p=>XO[p.toUpperCase()];
const XFL='abcdefgh';
const XCEN=[27,28,35,36];/* d4 e4 d5 e5 */
/* s par khade mohre ke hamle wale squares */
function xSqs(st,s){const p=st.b[s];if(!p)return[];const U=p.toUpperCase(),w=xw(p),f=s&7,r=s>>3,o=[];const b=st.b;
  if(U==='P'){for(const df of[-1,1]){const t=sq(f+df,r+(w?1:-1));if(t>=0)o.push(t)}}
  else if(U==='N'||U==='K'){for(const[df,dr]of(U==='N'?N_OFF:K_OFF)){const t=sq(f+df,r+dr);if(t>=0)o.push(t)}}
  else for(const[df,dr]of(U==='B'?B_DIR:U==='R'?R_DIR:Q_DIR)){let ff=f+df,rr=r+dr;while(ff>=0&&ff<8&&rr>=0&&rr<8){o.push(rr*8+ff);if(b[rr*8+ff])break;ff+=df;rr+=dr}}
  return o}
const xMobOf=(st,s)=>{const w=xw(st.b[s]);return xSqs(st,s).filter(t=>!st.b[t]||xw(st.b[t])!==w).length};
function xAtt(st,w){const a=new Array(64).fill(0);st.b.forEach((p,s)=>{if(p&&xw(p)===w)for(const t of xSqs(st,s))a[t]++});return a}
const XHOME={N:[1,6],B:[2,5]};
function xFeat(st,w){const b=st.b,A=xAtt(st,w),r0=w?0:7,P=w?'P':'p',E=w?'p':'P';
  let cen=0;for(const s of XCEN){cen+=A[s];if(b[s]===P)cen+=2}
  const undev=[];for(const U of'NB')for(const f of XHOME[U])if(b[r0*8+f]===(w?U:U.toLowerCase()))undev.push(r0*8+f);
  let mob=0,lines=0;b.forEach((p,s)=>{if(!p||xw(p)!==w)return;const U=p.toUpperCase();if('NBRQ'.includes(U)){const n=xMobOf(st,s);mob+=n;if('BQ'.includes(U))lines+=n}});
  const k=kingSq(b,w),kf=k&7,kr=k>>3;const castled=kr===r0&&(kf>=6||kf<=2);const canC=w?!!(st.c.K||st.c.Q):!!(st.c.k||st.c.q);
  let shield=0;if(castled)for(const df of[-1,0,1])for(const dr of[1,2]){const t=sq(kf+df,kr+(w?dr:-dr));if(t>=0&&b[t]===P)shield++}
  const files=[0,0,0,0,0,0,0,0];b.forEach((p,s)=>{if(p===P)files[s&7]++});
  let doubled=0,isolated=0;files.forEach((n,f)=>{if(n>1)doubled+=n-1;if(n&&!(files[f-1]||0)&&!(files[f+1]||0))isolated+=n});
  const passed=[];b.forEach((p,s)=>{if(p!==P)return;const f=s&7,r=s>>3;let ok=true;for(let rr=r+(w?1:-1);rr>=0&&rr<8&&ok;rr+=(w?1:-1))for(const ff of[f-1,f,f+1])if(ff>=0&&ff<8&&b[rr*8+ff]===E)ok=false;if(ok)passed.push(s)});
  let space=0;for(let s=0;s<64;s++){const r=s>>3;if((w?r>=4:r<=3)&&A[s])space++}
  return{cen,undev,mob,lines,castled,canC,shield,doubled,isolated,passed,bpair:b.filter(p=>p===(w?'B':'b')).length>=2,space,A}}
const xList=a=>a.length<=1?a.join(''):a.slice(0,-1).join(', ')+' aur '+a[a.length-1];
/* ek chaal kya karti hai: {pos:[...], neg:[...]} chhote Hinglish vaakya (bina chaal ke naam ke) */
function xIdeas(st,m){const w=st.w,A=make(st,m),U=m.p.toUpperCase(),pos=[],neg=[],to=sn(m.t);
  const F0=xFeat(st,w),F1=xFeat(A,w);const cap=st.b[m.t]||(m.ep?(w?'p':'P'):null);
  if(m.castle)pos.push('castle karke raja ko kone me surakshit karti hai aur haathi ko khel me laati hai');
  if(cap){const back=attacked(A.b,m.t,!w),v=xval(cap),mv=xval(m.p);
    if(!back)pos.push(`${xs(cap)} (${to}) muft me le leti hai`);else if(v>mv)pos.push(`chhote mohre se bada ${xs(cap)} (${to}) le leti hai`);
    else if(v===mv)pos.push(`${xs(cap)} ka trade (badla) karti hai`);else neg.push(`${xs(m.p)} dekar sirf ${xs(cap)} milta hai`)}
  if(inCheck(A))pos.push('check deti hai, opponent ko pehle raja bachana padega');
  if('NB'.includes(U)&&F0.undev.includes(m.f))pos.push(`${xo(m.p)} ko ghar se nikal kar khel me laati hai (development)`);
  const cenUp=XCEN.filter(s=>F1.A[s]>F0.A[s]).map(sn);
  if(U==='P'&&XCEN.includes(m.t))pos.push(`center (${to}) me pyada khada karti hai`);
  else if(cenUp.length&&F1.cen>F0.cen)pos.push(`center ke ${xList(cenUp)} square par pakad badhati hai`);
  const hit=xSqs(A,m.t).filter(t=>A.b[t]&&xw(A.b[t])!==w&&A.b[t].toUpperCase()!=='K'&&(xval(A.b[t])>xval(m.p)||!attacked(A.b,t,!w)));
  if(hit.length>=2)pos.push(`ek saath ${xList(hit.map(t=>xo(A.b[t])+' ('+sn(t)+')'))} par hamla (fork) karti hai`);
  else if(hit.length)pos.push(`${xo(A.b[hit[0]])} (${sn(hit[0])}) par hamla karti hai, opponent ko jawab dena padega`);
  if(!hit.length){const soft=xSqs(A,m.t).filter(t=>A.b[t]&&xw(A.b[t])!==w&&!'PK'.includes(A.b[t].toUpperCase()));if(soft.length)pos.push(`${xo(A.b[soft[0]])} (${sn(soft[0])}) par dabav daalti hai: use hatna padega ya trade hoga`)}
  const ray=xRay(A,m.t);if(ray&&ray.kind==='pin')pos.push(`${xo(ray.front.p)} (${sn(ray.front.s)}) ko pin karti hai, peeche ${xs(ray.back.p)} hai`);
  const h0=xHanging(st,w),h1=xHanging(A,w);
  if(h0.some(h=>h.s===m.f)&&!h1.some(h=>h.s===m.t))pos.push(`khatre me pade ${xo(m.p)} ko surakshit jagah le jaati hai`);
  const saved=h0.filter(h=>h.s!==m.f&&!h1.some(x=>x.s===h.s));if(saved.length)pos.push(`${xo(saved[0].p)} (${sn(saved[0].s)}) ko bachati hai`);
  if(U==='P'){const oppM=pseudo(Object.assign({},st,{w:!w,ep:-1})),was=xSqs(st,m.f),nw=xSqs(A,m.t).filter(t=>!was.includes(t));
    const stop=oppM.filter(o=>nw.includes(o.t)&&'NBQ'.includes(o.p.toUpperCase()));if(stop.length)pos.push(`opponent ke ${xo(stop[0].p)} ko ${sn(stop[0].t)} par aane se rokti hai`);
    const tens=xSqs(A,m.t).filter(t=>A.b[t]===(w?'p':'P')&&(t&7)>=2&&(t&7)<=5);if(tens.length&&!cap)pos.push(`${sn(tens[0])} ke pyade se takkar leti hai (center kholne ki koshish)`)}
  if(U==='P'&&F1.lines-F0.lines>=2)pos.push('apne oont/vazir ke liye raasta kholti hai');
  if(F1.passed.length>F0.passed.length&&U==='P')pos.push('passed pyada banati hai (aage koi pyada rokne wala nahi)');
  if(U==='P'&&!cap&&((w&&(m.t>>3)===4)||(!w&&(m.t>>3)===3))&&!XCEN.includes(m.t))pos.push('aage badh kar jagah (space) leti hai');
  const mb0=U!=='P'&&U!=='K'?xMobOf(st,m.f):0,mb1=U!=='P'&&U!=='K'?xMobOf(A,m.t):0;
  if(!m.castle&&U!=='P'&&U!=='K'&&mb1-mb0>=3)pos.push(`${xo(m.p)} ko zyada active jagah deti hai (${mb0} se ${mb1} squares)`);
  /* kamzoriyan */
  if(h1.some(h=>h.s===m.t))neg.push(`${xs(m.p)} ${to} par asurakshit hai, opponent use le sakta hai`);
  const newH=h1.filter(h=>h.s!==m.t&&!h0.some(x=>x.s===h.s));if(newH.length)neg.push(`${xs(newH[0].p)} (${sn(newH[0].s)}) ka bachav hat jaata hai`);
  if(F1.doubled>F0.doubled)neg.push('apne pyade doubled ho jaate hain (ek file par do pyade, kamzor)');
  if(F1.isolated>F0.isolated&&!cap)neg.push('isolated pyada banta hai (bagal me koi saathi pyada nahi)');
  if(F0.castled&&F1.shield<F0.shield&&U==='P')neg.push('raja ke saamne ka pyada hilti hai, raja khul jaata hai');
  if(U==='K'&&!m.castle&&F0.canC&&!F1.canC&&st.fm<30)neg.push('raja chal gaya, ab castle nahi ho sakta');
  else if(U==='R'&&F0.canC&&(w?(A.c.K+A.c.Q):(A.c.k+A.c.q))<(w?(st.c.K+st.c.Q):(st.c.k+st.c.q))&&st.fm<20)neg.push('haathi hilne se us taraf castle ka haq chala gaya');
  if(U==='B'&&cap&&cap.toUpperCase()==='N'&&F0.bpair)neg.push('oont ka joda (bishop pair) chhod diya, khuli position me do oont bahut taakatwar hote hain');
  if(st.fm<=10&&!cap){
    if(U==='Q'&&st.fm<=7)neg.push('vazir bahut jaldi nikala; opponent ke mohre nikalte-nikalte us par hamla karke tempo lenge');
    if('NB'.includes(U)&&!F0.undev.includes(m.f)&&F0.undev.length>=2&&!h0.some(h=>h.s===m.f))neg.push(`opening me ek hi mohra dobara chala, jabki ${F0.undev.length} mohre abhi ghar par baithe hain`);
    if(U==='N'&&((m.t&7)===0||(m.t&7)===7))neg.push('ghoda kinare par gaya; wahan se kam squares milte hain ("knight on the rim is dim")');
    const f=m.t&7,r=m.t>>3,pr=w?1:6,ahead=w?2:5;if('NB'.includes(U)&&f>=2&&f<=4&&r===ahead&&st.b[pr*8+f]===(w?'P':'p'))neg.push(`${XFL[f]}-pyade ke theek aage khada hai; ab ${XFL[f]}${w?'3/'+XFL[f]+'4':'6/'+XFL[f]+'5'} wali pyada chaal nahi chal sakti${f===3?' aur doosra oont bhi band rehta hai':''}`);
    if(U==='P'&&(f===0||f===7||(f===6&&!F0.castled))&&F0.undev.length>=2)neg.push(`kinare ka pyada chala, jabki ${xList(F0.undev.map(q=>xs(st.b[q])+' '+sn(q)))} abhi ghar par baithe hain aur raja ne castle nahi kiya; ye ek chaal (tempo) mohre nikalne me lagni chahiye thi`)}
  if(U==='P'&&F0.castled&&!cap){const k=kingSq(st.b,w);if(Math.abs((k&7)-(m.f&7))<=1&&!neg.some(x=>x.includes('raja')))neg.push('raja ke paas ka pyada aage gaya, raja ke aas-paas kamzor squares bante hain')}
  return{pos,neg}}
/* line (uci list) ki chaal number ke saath SAN */
const xNum=(st,san)=>st.w?`${st.fm}. ${san}`:`${st.fm}... ${san}`;
/* best chaal ka plan: kya karti + agli apni chaal kya tay karti */
function xPlan(P,pv){const m1=pv[0]?fromUci(P,pv[0]):null;if(!m1)return{does:[],next:'',nextDoes:[]};const I=xIdeas(P,m1);let next='',nextDoes=[];
  const S1=make(P,m1),o=pv[1]?fromUci(S1,pv[1]):null;if(o){const S2=make(S1,o),m3=pv[2]?fromUci(S2,pv[2]):null;
    if(m3){next=xNum(S2,sanOf(S2,m3));nextDoes=xIdeas(S2,m3).pos.slice(0,2);
      if(m1.p.toUpperCase()==='P'&&m3.p.toUpperCase()==='P'&&xSqs(S1,m1.t).includes(m3.t))I.pos.unshift(`agli chaal ${sanOf(S2,m3)} ki taiyari karti hai (${sn(m3.t)} ko pyade ka sahara)`)}}
  return{does:I.pos,neg:I.neg,next,nextDoes,reply:o?xNum(S1,sanOf(S1,o)):''}}
/* tactic na ho to: kyun galat (asli wajah, sirf number nahi) */
function xWhyPositional(P,m,bm,ref,bpv){const me=P.w,A=make(P,m),B=make(P,bm);const mySan=sanOf(P,m),bestSan=sanOf(P,bm);const I=xIdeas(P,m),J=xIdeas(P,bm);const out=[];
  if(I.neg.length)out.push(`**${mySan}** ki kamzori: ${I.neg.slice(0,2).join('; ')}.`);
  const fa=xFeat(A,me),fb=xFeat(B,me),d=[];
  if(fb.cen-fa.cen>=2)d.push('center par zyada pakad');
  if(fa.undev.length>fb.undev.length)d.push('ek aur mohra khel me');
  if(fb.castled&&!fa.castled)d.push('raja castle karke surakshit');
  if(fb.canC&&!fa.canC)d.push('castle ka haq bacha rehta');
  if(fb.mob-fa.mob>=4)d.push(`mohron ke paas zyada squares (${fb.mob} vs ${fa.mob})`);
  if(fa.doubled>fb.doubled||fa.isolated>fb.isolated)d.push('pyadon ka dhaancha saaf');
  if(fb.space-fa.space>=3)d.push('zyada jagah (space)');
  const jp=J.pos.filter(x=>!I.pos.includes(x));
  const PL=bpv&&bpv.length>2?xPlan(P,bpv):null;
  if(jp.length||d.length)out.push(`**${bestSan}** ${jp.length?jp.slice(0,2).join(' aur '):'behtar thi'}${d.length?'. Usse milta: '+xList(d):''}.`);
  else if(PL&&PL.next)out.push(`**${bestSan}** ka idea agli chaal **${PL.next}** hai${PL.nextDoes.length?': '+PL.nextDoes.join(' aur '):''}. **${mySan}** se ye plan nahi banta.`);
  const r1=ref&&ref.pv[0]?fromUci(A,ref.pv[0]):null;
  if(r1){const R=xIdeas(A,r1);const rs=xNum(A,sanOf(A,r1));const tempo=R.pos.some(x=>x.includes('hamla'))&&R.pos.some(x=>x.includes('development'));
    if(R.pos.length)out.push(`Opponent ka jawab **${rs}**: ${R.pos.slice(0,2).join(' aur ')}${tempo?' (tempo ke saath: mohra bhi nikla, hamla bhi)':''}.`)}
  if(out.length<2){/* kabhi khali number nahi: kya badla, ek saaf vaakya */
    const pa=fa.mob,pb=fb.mob;out.push(pb>pa?`Fark chhota hai par saaf: **${bestSan}** ke baad tumhare mohron ke paas ${pb} squares hote, **${mySan}** ke baad ${pa}. Yaani mohre thode kam active hain.`
      :fb.cen>fa.cen?`Fark: **${bestSan}** center (d4/e4/d5/e5) par zyada dabav rakhti hai, **${mySan}** nahi.`
      :`Fark: **${mySan}** opponent ko aasaan khel deti hai, jabki **${bestSan}** usse turant jawab dene par majboor karti.`)}
  return out}
/* opening ke naam se ek line idea */
const XOPEN=[['Sicilian','Black c5 se d4 square par side se ladta hai; queenside par khel aur ulta castle hamle aam hain.'],['French','Black e6+d5 se center ko chunauti deta hai; c8 wala oont aksar band rehta hai.'],['Caro-Kann','Black c6+d5: majboot dhaancha, c8 oont ko pehle bahar laata hai.'],['Ruy Lopez','Bb5 se e5 ko bachane wale c6 ghode par dabav; lambi strategic ladai.'],['Italian','Bc4 seedha f7 ko nishana banata hai; c3+d4 se center banana plan hai.'],['Giuoco','Bc4 seedha f7 ko nishana banata hai; c3+d4 se center banana plan hai.'],['Two Knights','f7 par jaldi hamle ki ladai; ...d5 se Black jawab deta hai.'],['Scotch','Jaldi d4 se center khol do; mohre tezi se active hote hain.'],['Petrov','Black seedha e4 par jawab deta hai; barabar aur thos opening.'],['Philidor','Black d6 se e5 ko bachata hai; thoda tight par majboot.'],['Ponziani','c3 phir d4: center me do pyade banane ka plan.'],['Scandinavian','Black turant d5 se e4 ko chunauti deta hai; vazir jaldi bahar aata hai.'],['Pirc','Black pehle mohre lagata hai, center par baad me hamla karta hai.'],["Queen's Gambit",'c4 se d5 pyade ko hata kar center par kabza.'],['Slav','Black c6 se d5 ko bachata hai aur oont bahar nikal sakta hai.'],["King's Indian",'Black g6+Bg7 se khulta hai, baad me e5 ya c5 se center par hamla.'],['Nimzo','Bb4 se c3 ghode ko pin karke e4 rokna.'],['London','d4+Bf4: aasaan setup, e3/c3 ke saath majboot dhaancha.'],['English','c4 se side se center (d5) par dabav.'],['Vienna','Nc3 phir f4 ka idea: f-file par khel.'],["King's Gambit",'f4 pyada de kar f-file aur center lena; tez hamla.'],['Four Knights','Dono taraf ghode nikle; thos, barabar opening.'],['Queen\'s Pawn','d4 se center; c4 ya Nf3/Bf4 setup.'],["King's Pawn",'e4 se center; mohre jaldi nikalo, castle karo.']];
const xOpening=n=>{if(!n)return'';const k=XOPEN.find(([a])=>n.includes(a));return k?k[1]:''};
const xb=t=>esc(t).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>');

/* "Seedhi baat": 3-4 saaf vaakya. Maksad -> kya chhoota (behtar chaal) -> opponent ko kya milta -> seekh */
function xSummary(P,m,best,ref,lossIn,lines){const w=P.w,A=make(P,m),san=sanOf(P,m),I=xIdeas(P,m),o=[],kinds=[];const K=k=>{while(kinds.length<o.length)kinds.push(k)};
  const bm=best&&best.pv&&best.pv[0]?fromUci(P,best.pv[0]):null,isBest=!!bm&&uciOf(bm)===uciOf(m);
  let loss=lossIn;
  /* chaal top lines me ho to usi search ka number lo (do alag searches ka fark opening me galat 'nuksaan' dikhata hai) */
  const own=(lines||[]).find(l=>l.pv[0]===uciOf(m));
  if(loss==null&&own&&best&&best.mate==null&&own.mate==null)loss=Math.max(0,((best.cp||0)-(own.cp||0))/100);
  if(loss==null&&best&&ref&&best.mate==null&&ref.mate==null&&best.cp!=null&&ref.cp!=null)loss=Math.max(0,((best.cp||0)+(ref.cp||0))/100);
  if(loss!=null&&P.fm<=6&&loss<0.6&&!own)loss=Math.min(loss,0.25);
  o.push(I.pos.length?`**${san}** ka maksad: ${I.pos.slice(0,2).join(' aur ')}.`:`**${san}** ek shaant chaal thi: na koi hamla, na koi naya mohra khel me aaya.`);K('mv');
  if(!isBest&&bm&&(loss==null||loss>=0.3)){const J=xIdeas(P,bm),PL=xPlan(P,best.pv);
    o.push(`${I.neg.length?'Kami: '+I.neg[0]+'. ':''}${loss!=null?`Isse lagbhag **${xPawns(loss)}** jitna fayda chhoot gaya. `:''}Behtar tha **${sanOf(P,bm)}**${J.pos.length?', jo '+J.pos.slice(0,2).join(' aur '):''}${PL.next?`; uske baad plan ${PL.next}${PL.nextDoes.length?' – '+PL.nextDoes[0]:''}`:''}.`)}
  else if(isBest)o.push('Engine ki pehli pasand bhi yahi chaal thi.');
  else if(I.neg.length)o.push(`Dhyan: ${I.neg[0]}.`);
  K('bp');
  const r1=ref&&ref.pv&&ref.pv[0]?fromUci(A,ref.pv[0]):null;
  if(r1){const R=xIdeas(A,r1);let t=`Ab ${w?'Black':'White'} ka sabse achha jawab **${xNum(A,sanOf(A,r1))}** hai${R.pos.length?': '+R.pos.slice(0,2).join(' aur '):''}`;
    const fA=xFeat(A,w),fO=xFeat(A,!w),opens=r1.p.toUpperCase()==='P'&&(r1.t&7)>=2&&(r1.t&7)<=5&&(!!A.b[r1.t]||xSqs(make(A,r1),r1.t).some(t=>A.b[t]===(w?'P':'p')));
    if(opens&&!fA.castled&&fA.undev.length>=2&&fO.undev.length<fA.undev.length&&P.fm>=3)t+=`. ${w?'White':'Black'} ka raja abhi beech me hai aur mohre ghar par, isliye center khulna ${w?'White':'Black'} ke liye khatarnak hai`;
    const B2=make(A,r1),r2=ref.pv[1]?fromUci(B2,ref.pv[1]):null,S3=r2?make(B2,r2):null,r3=S3&&ref.pv[2]?fromUci(S3,ref.pv[2]):null;
    if(r3){const R3=xIdeas(S3,r3);if(R3.pos.length)t+=`. Phir ${xNum(S3,sanOf(S3,r3))} se ${R3.pos[0]}`}
    o.push(t+'.')}
  K('op');
  const tip=!isBest&&(loss==null||loss>=0.3)?xTip(I.neg):'';if(tip)o.push('**Seekh:** '+tip);K('');
  return{lines:o,loss,kinds}}
function xTip(neg){const n=neg.join(' ');
  if(/kinare ka pyada/.test(n))return'Opening me pehle ghode-oont nikalo aur castle karo. h/a-pyada tabhi chalo jab koi mohra sach me g5/b5 (ya g4/b4) par aakar pareshan kar raha ho.';
  if(/vazir bahut jaldi/.test(n))return'Vazir ko pehli 6-7 chaal tak andar rakho; pehle chhote mohre nikalo, warna har naya mohra vazir par hamla karke tempo lega.';
  if(/dobara chala/.test(n))return'Opening me har chaal se naya mohra nikalo. Ek mohra do baar tabhi chalo jab seedha fayda ho (capture ya dhamki).';
  if(/kinare par gaya/.test(n))return'Ghoda center ke paas (c3/f3/c6/f6) sabse taakatwar hota hai; kinare par uski chaalein aadhi reh jaati hain.';
  if(/theek aage khada/.test(n))return'c/d/e pyadon ke theek aage mohra mat rakho jab un pyadon ko aage badhana ho: pehle pyada, phir mohra.';
  if(/castle nahi ho sakta|castle ka haq/.test(n))return'Raja ko jaldi castle karke surakshit karo; bina wajah raja ya haathi mat hilao.';
  if(/raja ke saamne|raja ke paas ka pyada/.test(n))return'Castle ke baad raja ke saamne ke pyade (f, g, h) bina wajah mat hilao; har aisi chaal raja ke paas kamzor square banati hai.';
  if(/asurakshit|bachav hat/.test(n))return'Har chaal se pehle dekho: kaunsa mohra bina bachav reh jayega, aur opponent kya le sakta hai.';
  if(/doubled|isolated/.test(n))return'Pyadon ka dhaancha ek baar bigde to wapas nahi sudharta; capture karte waqt center ki taraf lo.';
  return''}
