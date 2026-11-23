// Position evaluation ladder: "kaun behtar hai aur kyun", har position Stockfish se check.
// Positions: app ke puzzles ki aakhri position (packs/road) + engine games (tools/train/data/*.pgn, engine/test-games.pgn).
// Run: node tools/train/gen-eval.js   -> tools/train/ladders/eval.json
const fs=require('fs'),path=require('path');const {ROOT,core,SF,pgnGames,uciOf,rng}=require('./lib');
const X=core();const R=rng(77);const sh=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const V={P:1,N:3,B:3,R:5,Q:9,K:0};const isW=p=>p===p.toUpperCase();
const NAME={Q:'queen',R:'rook',B:'bishop',N:'knight',P:'pawn'};

/* ---------- position features (White minus Black where it makes sense) ---------- */
function feat(st){const b=st.b;const m={w:0,b:0},cnt={w:{},b:{}};const pf={w:Array(8).fill(0),b:Array(8).fill(0)},pawns={w:[],b:[]};
  for(let i=0;i<64;i++){const p=b[i];if(!p)continue;const c=isW(p)?'w':'b',u=p.toUpperCase();m[c]+=V[u];cnt[c][u]=(cnt[c][u]||0)+1;if(u==='P'){pf[c][i&7]++;pawns[c].push(i)}}
  // development: minor pieces off their start squares + castled
  const home={w:{N:[1,6],B:[2,5]},b:{N:[57,62],B:[58,61]}};
  const dev=c=>{let n=0;for(const u of['N','B'])for(const s of home[c][u]){if(b[s]!==(c==='w'?u:u.toLowerCase()))n++}return n};
  const ks={w:X.kingSq(b,true),b:X.kingSq(b,false)};
  const castled=c=>{const k=ks[c],f=k&7,r=k>>3;return(c==='w'?r===0:r===7)&&(f>=6||f<=2)};
  const center=c=>{const k=ks[c],f=k&7,r=k>>3;return(c==='w'?r<=1:r>=6)&&f>=3&&f<=5};
  // king shield: own pawns on the 3 files around king, 1-2 ranks in front
  const shield=c=>{const k=ks[c],f=k&7,r=k>>3,d=c==='w'?1:-1;let n=0;for(let df=-1;df<=1;df++){const ff=f+df;if(ff<0||ff>7)continue;for(const dr of[1,2]){const rr=r+d*dr;if(rr<0||rr>7)continue;if(b[rr*8+ff]===(c==='w'?'P':'p')){n++;break}}}return n};
  // enemy pieces near king (Chebyshev <=2), non-pawn
  const near=c=>{const k=ks[c];let n=0;for(let i=0;i<64;i++){const p=b[i];if(!p||'Kk'.includes(p)||'Pp'.includes(p))continue;if(isW(p)===(c==='w'))continue;if(Math.max(Math.abs((i&7)-(k&7)),Math.abs((i>>3)-(k>>3)))<=2)n++}return n};
  // pawn structure
  const struct=c=>{const o=c==='w'?'b':'w';let iso=0,dbl=0,passed=0,pass=[];for(let f=0;f<8;f++){if(pf[c][f]>1)dbl+=pf[c][f]-1;if(pf[c][f]&&!(pf[c][f-1]||0)&&!(pf[c][f+1]||0))iso+=pf[c][f]}
    for(const i of pawns[c]){const f=i&7,r=i>>3;const ahead=pawns[o].some(j=>Math.abs((j&7)-f)<=1&&(c==='w'?(j>>3)>r:(j>>3)<r));if(!ahead){passed++;pass.push(i)}}
    const best=pass.length?Math.max(...pass.map(i=>c==='w'?(i>>3):7-(i>>3))):0;return{iso,dbl,passed,best}};
  // space: own pawns/pieces-controlled squares in enemy half by pawns
  const space=c=>{let n=0;for(const i of pawns[c]){const r=i>>3;if(c==='w'?r>=4:r<=3)n++}return n};
  // mobility (activity): legal moves count if it were that side's move
  const mob=w=>{const s2=Object.assign({},st,{w,ep:-1});try{return X.legal(s2).length}catch(e){return 0}};
  const S={w:struct('w'),b:struct('b')};
  return{mat:m.w-m.b,mw:m.w,mb:m.b,cnt,dev:{w:dev('w'),b:dev('b')},castled:{w:castled('w'),b:castled('b')},center:{w:center('w'),b:center('b')},shield:{w:shield('w'),b:shield('b')},near:{w:near('w'),b:near('b')},
    S,space:{w:space('w'),b:space('b')},mob:{w:mob(true),b:mob(false)},pieces:Object.values(cnt.w).reduce((a,x)=>a+x,0)+Object.values(cnt.b).reduce((a,x)=>a+x,0)}}
const matTxt=(F,c)=>{const o=F.cnt[c];return['Q','R','B','N','P'].filter(u=>o[u]).map(u=>`${o[u]} ${NAME[u]}${o[u]>1?'s':''} (${o[u]}×${V[u]})`).join(' + ')+` = **${c==='w'?F.mw:F.mb}**`};
const evTxt=e=>(e>0?'+':'')+e.toFixed(1);

async function main(){const CACHE=process.env.EVAL_CACHE;let out=[];
  if(CACHE&&fs.existsSync(CACHE))out=JSON.parse(fs.readFileSync(CACHE,'utf8')).map(c=>Object.assign(c,{F:feat(X.parseFEN(c.fen))}));else{const sf=new SF();const cands=[];
  /* 1) puzzle end positions */
  const dir=path.join(ROOT,'packs','road');for(const f of fs.readdirSync(dir).filter(f=>/^b\d+_0\.json$/.test(f))){const a=JSON.parse(fs.readFileSync(path.join(dir,f),'utf8'));
    for(const p of sh(a).slice(0,60)){try{let st=X.parseFEN(p[1]);for(const x of p[2].split(' ')){const m=X.findMove(st,x);if(!m)throw 0;st=X.make(st,m)}if(X.legal(st).length)cands.push({fen:X.fenOf(st),src:'puz',band:p[3]})}catch(e){}}}
  /* 2) engine games */
  const pg=[...fs.readdirSync(path.join(__dirname,'data')).map(f=>path.join(__dirname,'data',f)),path.join(ROOT,'engine','test-games.pgn')];
  for(const f of pg)for(const g of pgnGames(fs.readFileSync(f,'utf8'))){let st=X.parseFEN(X.START_FEN);for(let k=0;k<g.moves.length;k++){const m=X.findMove(st,g.moves[k]);if(!m)break;st=X.make(st,m);
      if((k>=11&&k%3===0||k>=9&&k<=34&&k%3!==0&&process.env.EVAL_OPEN)&&X.legal(st).length)cands.push({fen:X.fenOf(st),src:'game',ply:k+1})}}
  console.error('candidates',cands.length);
  let n=0;
  sh(cands);cands.sort((a,b)=>(a.ply&&a.ply<=34?0:1)-(b.ply&&b.ply<=34?0:1));for(const c of cands){if(++n>(+process.env.EVAL_N||2600))break;const st=X.parseFEN(c.fen);if(X.inCheck(st))continue;
    const r=await sf.go(c.fen,{depth:14,multipv:1});const l=r.lines[0];if(!l||l.mate!=null)continue;
    const bm=X.legal(st).find(m=>uciOf(m)===r.best.slice(0,4)+(r.best[4]||''));if(!bm||st.b[bm.t]||bm.promo)continue;/* quiet: best move no capture */
    const n2=X.make(st,bm);if(X.inCheck(n2))continue;
    const e=(st.w?1:-1)*l.cp/100;const r8=await sf.go(c.fen,{depth:8});const e8=(st.w?1:-1)*((r8.lines[0]||{}).cp||0)/100;if(Math.abs(e-e8)>0.6)continue;
    out.push(Object.assign(c,{e,F:feat(st),w:st.w}))}
  sf.quit();console.error('evaluated',out.length);if(CACHE)fs.writeFileSync(CACHE,JSON.stringify(out.map(({F,...c})=>c)))}

  const side=e=>e>0?'White':'Black';
  const WHO=['White behtar hai','Barabar hai','Black behtar hai'];
  const whoIdx=e=>e>=0.8?0:e<=-0.8?2:1;
  /* ---------- E1: points gino ---------- */
  const e1=[];for(const c of out){const F=c.F;if(F.pieces>22)continue;const good=(Math.abs(F.mat)>=2&&Math.sign(F.mat)===Math.sign(c.e)&&Math.abs(c.e)>=1.5&&Math.abs(c.e-F.mat)<2.5)||(F.mat===0&&Math.abs(c.e)<0.5);if(!good)continue;
    const a=F.mat>0?0:F.mat<0?2:1;const why=`White: ${matTxt(F,'w')}\n\nBlack: ${matTxt(F,'b')}\n\n${F.mat?`${side(F.mat)} **${Math.abs(F.mat)} points** aage.`:'Points barabar.'} Stockfish bhi yahi kehta hai: **${evTxt(c.e)}** (+ matlab White behtar, − matlab Black).`;
    const s1={t:'quiz',fen:c.fen,q:'Sirf **points gino** (pawn 1, knight 3, bishop 3, rook 5, queen 9). Kaun aage hai?',opts:['White aage','Barabar','Black aage'],a,why,hint:'Dono taraf ke pieces alag alag jodo, phir farak dekho.'};
    const items=[s1];if(F.mat){const d=Math.abs(F.mat);const opts=[...new Set([d,d+1,Math.max(1,d-1),d+2,Math.max(1,d-2)])].slice(0,4).sort((x,y)=>x-y);
      items.push({t:'quiz',fen:c.fen,q:`${side(F.mat)} kitne **points** se aage hai?`,opts:opts.map(String),a:opts.indexOf(d),why,hint:'White ka total minus Black ka total.'})}
    e1.push(items)}
  /* ---------- E2: development aur king safety (opening principles) ---------- */
  const e2=[],e2eq=[];for(const c of out){const F=c.F;if(F.mat!==0||F.pieces<26||+c.fen.split(' ')[5]>18)continue;const e=c.e;const fav=e>0?'w':'b',opp=fav==='w'?'b':'w';
    let why=null,reason=null;
    if(Math.abs(e)>=0.8&&F.dev[fav]-F.dev[opp]>=2){reason=0;why=`${side(e)} ke **${F.dev[fav]}** chhote pieces bahar hain, ${side(-e)} ke sirf **${F.dev[opp]}**. Material barabar, par development mein aage.`}
    else if(Math.abs(e)>=0.8&&F.castled[fav]&&F.center[opp]&&F.shield[fav]>=2){reason=1;why=`${side(e)} ka king castle karke safe hai, ${side(-e)} ka king abhi **center** mein hai. Material barabar, par king safety mein farak.`}
    else if(Math.abs(e)<0.35&&Math.abs(F.dev.w-F.dev.b)<=1&&F.castled.w===F.castled.b){reason=-1;why='Material barabar, development aur king safety bhi lagbhag barabar.'}
    if(why==null)continue;const ev=`\n\nStockfish: **${evTxt(e)}**.`;
    const s1={t:'quiz',fen:c.fen,q:'Material barabar hai. **Opening principles** (development, king safety) se dekho: kaun behtar?',opts:WHO,a:reason<0?1:whoIdx(e),why:why+ev,hint:'Gino: kis ke knights/bishops bahar aaye? Kis ka king castle hua?'};
    const items=[s1];if(reason>=0)items.push({t:'quiz',fen:c.fen,q:`${side(e)} behtar kyun hai?`,opts:['Zyada pieces develop hue hain','King castled aur safe hai, dushman ka king center mein','Material zyada hai'],a:reason,why:why+ev});(reason<0?e2eq:e2).push(items)}
  sh(e2eq);e2.push(...e2eq.slice(0,Math.ceil(e2.length*0.35)));
  /* ---------- E3: 5 elements ---------- */
  const EL=['Material','Time (development)','Space','King safety','Pawn structure'];
  const e3=[],e3k={};for(const c of out){const F=c.F,e=c.e;if(Math.abs(e)<1)continue;const fav=e>0?'w':'b',opp=fav==='w'?'b':'w';
    const sc=[Math.max(0,(fav==='w'?1:-1)*F.mat)/1.0,Math.max(0,F.dev[fav]-F.dev[opp])/1.5,Math.max(0,F.space[fav]-F.space[opp])/2.5,
      Math.max(0,(F.near[opp]-F.near[fav])*0.8+(F.shield[fav]-F.shield[opp])*0.6+(F.center[opp]&&!F.center[fav]&&F.pieces>18?1.2:0)),
      Math.max(0,((F.S[opp].iso+F.S[opp].dbl)-(F.S[fav].iso+F.S[fav].dbl))*0.6+(F.S[fav].passed-F.S[opp].passed)*0.7+Math.max(0,F.S[fav].best-F.S[opp].best-2)*0.4)];
    const order=sc.map((v,i)=>[v,i]).sort((a,b)=>b[0]-a[0]);if(order[0][0]<1.2||order[0][0]<order[1][0]*1.8)continue;const k=order[0][1];
    const det=[`Material: White ${F.mw}, Black ${F.mb}`,`Development: White ${F.dev.w}/4, Black ${F.dev.b}/4 chhote pieces bahar`,`Space: White ke ${F.space.w}, Black ke ${F.space.b} pawns aadhe board ke paar`,
      `King safety: king ke saamne pawns White ${F.shield.w}/3, Black ${F.shield.b}/3; king ke paas dushman pieces White ${F.near.w}, Black ${F.near.b}`,
      `Pawn structure: isolated/doubled White ${F.S.w.iso+F.S.w.dbl}, Black ${F.S.b.iso+F.S.b.dbl}; passed pawns White ${F.S.w.passed}, Black ${F.S.b.passed}`];
    const why=`Stockfish: **${evTxt(e)}** (${side(e)} behtar).\n\nSabse bada farak: **${EL[k]}**. ${det[k]}.\n\n- ${det.filter((_,i)=>i!==k).join('\n- ')}`;
    (e3k[k]=e3k[k]||[]).push([{t:'quiz',fen:c.fen,q:'Kaun behtar hai?',opts:WHO,a:whoIdx(e),why,hint:'5 elements ek ek karke dekho.'},
      {t:'quiz',fen:c.fen,q:`${side(e)} behtar hai. **5 elements** mein sabse bada farak kahan hai?`,opts:EL,a:k,why}])}
  {const cap=Math.max(12,...Object.entries(e3k).filter(([k])=>k!=='0').map(([,v])=>v.length));Object.values(e3k).forEach(v=>e3.push(...sh(v).slice(0,cap)));console.error('E3 by element',JSON.stringify(Object.fromEntries(Object.entries(e3k).map(([k,v])=>[EL[k],v.length]))))}
  /* ---------- E4/E5: engine number guess (GM) ---------- */
  const BANDS=[['Black jeet raha (−3 se kam)',-99,-3],['Black behtar (−3 se −1)',-3,-1],['Barabar ke paas (−1 se +1)',-1,1],['White behtar (+1 se +3)',1,3],['White jeet raha (+3 se zyada)',3,99]];
  const band=e=>BANDS.findIndex(([_,lo,hi])=>e>=lo&&e<hi);
  const e4=[],e5=[];for(const c of out){const F=c.F,e=c.e;const bi=band(e);const edge=Math.min(...[-3,-1,1,3].map(x=>Math.abs(e-x)));if(edge<0.35)continue;
    const comp=Math.abs(F.mat)>=1&&Math.sign(F.mat)!==Math.sign(e)&&Math.abs(e)>=0.8;
    const why=`Stockfish: **${evTxt(e)}**.${comp?` Dhyan do: ${side(e)} material mein **peeche** hai (${F.mat>0?'+':''}${F.mat}), phir bhi behtar: **compensation** (activity, attack, structure).`:''}\n\nMaterial: White ${F.mw}, Black ${F.mb}. Development ${F.dev.w}/${F.dev.b}, king shield ${F.shield.w}/${F.shield.b}, passed pawns ${F.S.w.passed}/${F.S.b.passed}, chaalein (activity) ${F.mob.w}/${F.mob.b}.`;
    const s={t:'quiz',fen:c.fen,q:'Engine ka number socho (White ki nazar se): eval kis range mein hai?',opts:BANDS.map(x=>x[0]),a:bi,why};
    (comp||edge<0.8?e5:e4).push([s])}
  console.error('E1',e1.length,'E2',e2.length,'E3',e3.length,'E4',e4.length,'E5',e5.length);

  const flat=a=>[].concat(...a);
  const mk=(id,title,sub,yaad,intro,groups,nPrac,qn)=>{sh(groups);const prac=flat(groups.slice(0,nPrac)),pool=flat(groups.slice(nPrac,nPrac+100));return{id,key:'tr.'+id.replace('tr_',''),title,sub,yaad,steps:[{t:'info',h:intro[0],md:intro[1]},...prac],pool,qn}};
  const L=[
    {ch:'l1',after:'l1.values',needs:['l1.board','l1.pieces','l1.values'],les:mk('tr_ev1','🏋 Drill: kaun aage? Points gino','Asli game positions mein material gino, Stockfish se match',['Pawn 1, knight 3, bishop 3, rook 5, queen 9.','Dono taraf alag jodo, phir farak.'],
      ['Drill: points gino','Ab asli games ki positions. Har position mein **dono taraf ke points jodo** aur batao kaun aage hai.\n\nHar jawab **Stockfish** (bahut strong engine) se bhi check kiya gaya hai: jahan engine aur points ek hi baat kehte hain, wahi positions yahan hain.\n\nEngine ka number: **+** matlab White behtar, **−** matlab Black behtar. Jaise **+3** = White lagbhag 3 points aage.\n\nPractice ke baad test: 10 naye sawaal, **80%** par agla lesson.'],e1,6,10)},
    {ch:'l2b',after:'l2.opening',needs:['l1.values','l2.opening'],les:mk('tr_ev2','🏋 Drill: development aur king safety','Material barabar ho to kaun behtar? Opening principles se socho',['Material barabar ho to dekho: kis ke zyada pieces bahar, kis ka king safe.','Center mein reh gaya king = khatra.'],
      ['Drill: opening principles se position padho','Points barabar hon to bhi ek side behtar ho sakti hai. Opening principles yaad karo: **pieces develop karo** aur **jaldi castle karo**.\n\nHar position mein gino: kitne knights/bishops bahar aaye (4 mein se), aur kis ka king castle hua. Jawab Stockfish se check kiya hua hai.\n\nTest: 10 sawaal, **80%**.'],e2,6,10)},
    {ch:'l6',after:'l6.squares',needs:['l6.elements','l6.pawns','l6.pawns2','l6.squares','l2.opening'],les:mk('tr_ev3','🏋 Drill: 5 elements se position samjho','Material, time, space, king safety, pawn structure: sabse bada farak kahan?',['Accountant mat bano: 5 elements dekho.','Ek element mein aage, doosre mein peeche ho sakte ho.'],
      ['Drill: 5 elements','Har position mein pehle batao **kaun behtar** hai (Stockfish se check), phir **5 elements** mein se sabse bada farak kahan hai.\n\nJawab ke saath har element ki ginti dikhegi: material, development, space (aadhe board ke paar pawns), king safety (king ke saamne pawns, paas mein dushman pieces), pawn structure (isolated, doubled, passed).\n\nTest: 10 sawaal, **80%**.'],e3,6,10)},
    {ch:'l6b',after:'l6.sacs',teaches:['eval'],needs:['l6.elements','l6.pawns','l6.squares','l6.files','l6.plans','l6.sacs'],les:mk('tr_ev4','🏋 Drill: engine jaisa number socho','Position dekh kar eval ki range batao: GM ki aadat',['+1 ≈ ek pawn ka fayda, +3 ≈ ek piece: aksar jeet.','Saare elements milakar socho, sirf material nahi.'],
      ['Drill: eval ka number','Strong players position dekh kar andaaza lagate hain ki fayda **kitna** hai. Engine yeh number pawns mein deta hai:\n\n- **0 ke paas**: barabar\n- **+1**: White ko lagbhag ek pawn jitna fayda\n- **+3 ya zyada**: White aksar jeet raha (ek piece jitna)\n- **−** wale number Black ke liye.\n\nSaare elements milakar socho, phir range chuno. Test: 10 sawaal, **80%**.'],e4,8,10)},
    {ch:'l7',after:'l7.analysis',roadAfter:'l7.tips',needs:['tr.ev4','l7.analysis'],les:mk('tr_ev5','🏋 Drill: mushkil evals aur compensation (GM)','Range ke kinare wale aur material ke ulat positions',['Material sab kuch nahi: compensation dekho.','Pehle khud socho, phir engine (analysis ka rule).'],
      ['Drill: GM level eval','Ab mushkil positions: kai mein ek side **material mein peeche** hai par phir bhi behtar (compensation), aur kai range ke kinare par hain. Elements ek ek karke gino, phir number socho.\n\nTest: 10 sawaal, **80%**.'],e5,8,10)}];
  fs.mkdirSync(path.join(__dirname,'ladders'),{recursive:true});fs.writeFileSync(path.join(__dirname,'ladders','eval.json'),JSON.stringify(L,null,1));
  console.log(L.map(l=>l.les.key+': '+l.les.steps.length+' steps, pool '+l.les.pool.length).join('\n'))}
main().catch(e=>{console.error(e);process.exit(1)});
