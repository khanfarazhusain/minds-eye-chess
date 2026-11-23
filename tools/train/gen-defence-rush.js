// Defence / only-move ladder + time-pressure (puzzle rush) ladder.
// D1, D2: engine games ki positions, Stockfish se (sahi chaalein = best se 0.5 pawn ke andar).
// D3-D5 aur rush: packs/road ke Lichess puzzles runtime par, sirf un themes ke jo drill se pehle sikhaye gaye (themes.js).
// Run: node tools/train/gen-defence-rush.js  -> ladders/defence.json, ladders/rush.json
const fs=require('fs'),path=require('path');const {ROOT,core,SF,pgnGames,uciOf,rng}=require('./lib');const {taughtBefore}=require('./themes');
const X=core();const R=rng(4242);const sh=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const V={P:1,N:3,B:3,R:5,Q:9,K:0},NM={P:'pawn',N:'knight',B:'bishop',R:'rook',Q:'queen',K:'king'};const isW=p=>p===p.toUpperCase();
const sqName=i=>'abcdefgh'[i&7]+((i>>3)+1);
const al=after=>[...taughtBefore(X,after,true)];

async function main(){const sf=new SF();const pos=[];
  const pg=[...fs.readdirSync(path.join(__dirname,'data')).map(f=>path.join(__dirname,'data',f)),path.join(ROOT,'engine','test-games.pgn')];
  for(const f of pg)for(const g of pgnGames(fs.readFileSync(f,'utf8'))){let st=X.parseFEN(X.START_FEN);for(const mv of g.moves){const m=X.findMove(st,mv);if(!m)break;st=X.make(st,m);if(X.legal(st).length>1)pos.push(st)}}
  sh(pos);const chk=[],hang=[];const seen=new Set();
  const multi=async(st,n)=>{const r=await sf.go(X.fenOf(st),{depth:12,multipv:n});return r.lines.map(l=>({u:l.pv[0],e:l.mate!=null?(l.mate>0?99:-99):l.cp/100}))};
  for(const st of pos){if(chk.length>=70&&hang.length>=70)break;const fen=X.fenOf(st);if(seen.has(fen))continue;seen.add(fen);const L=X.legal(st);
    if(X.inCheck(st)&&chk.length<70&&L.length>=3){const ls=await multi(st,Math.min(8,L.length));if(!ls.length)continue;const e0=ls[0].e;if(e0<-3||e0>=99)continue;
      const good=ls.filter(l=>l.e>=e0-0.5),bad=ls.filter(l=>l.e<=e0-2);if(!bad.length&&ls.length===L.length)continue;
      const mv=u=>L.find(m=>uciOf(m).startsWith(u.slice(0,4)));const best=mv(ls[0].u);if(!best)continue;const san=X.sanOf(st,best);
      const how=st.b[best.f].toUpperCase()==='K'?(st.b[best.t]?'king ne khud checking piece capture kiya':'king ko safe square par hataya'):st.b[best.t]?'checking piece ko capture kiya':'beech mein piece rakh kar check block kiya';
      chk.push({t:'move',fen,line:[san],ok:good.map(l=>mv(l.u)).filter(Boolean).map(m=>X.sanOf(st,m)),q:'**Check!** Bachne ke 3 tareeke: king hatao, block karo, ya checking piece capture karo. **Sabse achha** tareeka chuno.',
        why:`Best: \`${san}\`: ${how}.${good.length>1?` Yeh bhi theek thi: ${good.slice(1).map(l=>'`'+X.sanOf(st,mv(l.u))+'`').join(', ')}.`:''} Har tareeka barabar nahi hota: dekho kahan piece ya king zyada safe hai.`,hint:'Teeno tareeke dekho, phir woh chuno jisme kuch nahi khota.'})}
    else if(!X.inCheck(st)&&hang.length<70){const me=st.w;let tgt=-1;
      for(let i=0;i<64;i++){const p=st.b[i];if(!p||isW(p)!==me||'Pp'.includes(p)||'Kk'.includes(p))continue;
        const att=X.attacked(st.b,i,!me),def=X.attacked(st.b,i,me);if(!att)continue;
        // attacked by a cheaper piece or undefended
        const cheaper=L.length&&(()=>{const s2=Object.assign({},st,{w:!me,ep:-1});return X.legal(s2).some(m=>m.t===i&&V[s2.b[m.f].toUpperCase()]<V[p.toUpperCase()])})();
        if(!def||cheaper){tgt=i;break}}
      if(tgt<0)continue;const ls=await multi(st,8);if(ls.length<5)continue;const e0=ls[0].e;if(e0<-1.5||e0>4)continue;
      const good=ls.filter(l=>l.e>=e0-0.6),bad=ls.filter(l=>l.e<=e0-2);if(good.length>4||bad.length<2)continue;
      const mv=u=>L.find(m=>uciOf(m).startsWith(u.slice(0,4)));const best=mv(ls[0].u);if(!best||st.b[best.t])continue;/* best = quiet save, not a capture */
      const p=st.b[tgt].toUpperCase();const san=X.sanOf(st,best);
      hang.push({t:'move',fen,line:[san],ok:good.map(l=>mv(l.u)).filter(Boolean).map(m=>X.sanOf(st,m)),q:`Tumhara **${NM[p]}** \`${sqName(tgt)}\` par khatre mein hai. Use bachao (aur kuch aur mat khona).`,
        why:`Best: \`${san}\`.${good.length>1?` Yeh bhi theek: ${good.slice(1).map(l=>'`'+X.sanOf(st,mv(l.u))+'`').join(', ')}.`:''} Chaal ke baad dekho: naya square safe hai? Koi doosra piece latak to nahi gaya?`,hint:'Piece ko safe square par le jao, ya use protect karo.'})}}
  sf.quit();console.error('check',chk.length,'hang',hang.length);

  const mkPz=(o,k)=>Array.from({length:k},()=>Object.assign({t:'pzset'},o));
  const D=[
    {ch:'l1b',after:'l1.mate',needs:['l1.mate'],les:{id:'tr_df1',key:'tr.df1',title:'🏋 Drill: check se bacho (defence 1)',sub:'Asli games ki positions: sabse achha bachaav chuno',yaad:['Check se bachne ke 3 tareeke: king hatao, block, capture.','Sabse achha woh jisme kuch na khoye.'],
      steps:[{t:'info',h:'Drill: defence ki shuruaat',md:'Achha player sirf attack nahi karta, **bachaav** bhi karta hai. Yahan har position mein tumhe **check** mila hai. Teeno tareeke socho (king hatao, block, capture) aur **sabse achha** chuno.\n\nJawab Stockfish se check kiye gaye hain.\n\nTest: 10 naye positions, **80%**.'},...chk.slice(0,10)],pool:chk.slice(10),qn:10}},
    {ch:'l2b',after:'l2.safety',needs:['l1.values','l2.safety'],les:{id:'tr_df2',key:'tr.df2',title:'🏋 Drill: khatre mein piece bachao (defence 2)',sub:'Attack mein aaye piece ko bina kuch khoye bachao',yaad:['Har chaal se pehle: mera koi piece attack mein to nahi?','Bachao: hatao, protect karo, ya beech mein rok do.'],
      steps:[{t:'info',h:'Drill: piece bachao',md:'Opponent ne tumhare ek piece par attack kiya hai. Use **bachao**, aur dhyan rakho ki bachate waqt koi **doosra piece latak** na jaaye.\n\nTest: 10 naye positions, **80%**.'},...hang.slice(0,10)],pool:hang.slice(10),qn:10}},
    {ch:'l3b',after:'l3.golden',needs:['l3.golden','l2.safety'],les:{id:'tr_df3',key:'tr.df3',title:'🏋 Drill: only-move defence (1000-1500)',sub:'Lichess ke defence puzzles: sirf ek chaal bachaati hai',yaad:['Pehle opponent ki dhamki dekho.','Forcing jawab: check, capture, threat.'],
      steps:[{t:'info',h:'Drill: sirf ek chaal bachaati hai',md:'In puzzles mein tum **muskil mein** ho. Sirf ek chaal sab kuch bachaati hai. Golden rule yaad karo: pehle **opponent ki dhamki** dekho, phir forcing chaalein.\n\nPractice set: 10 puzzles, **7** sahi chahiye. Har set mein naye puzzles. Test bhi aisa hi ek set.'},
        {t:'pzset',mode:'set',lo:900,hi:1500,th:['defence'],al:al('l3.golden'),n:10,need:7,q:'**Defence set**: 10 puzzles, kam se kam **7** sahi.'}],pool:mkPz({mode:'set',lo:900,hi:1500,th:['defence'],al:al('l3.golden'),n:10,need:7,q:'**Test set**: 10 defence puzzles, **7** sahi chahiye.'},3),qn:1}},
    {ch:'l6b',after:'l6.prophy',needs:['l6.prophy','tr.df3'],les:{id:'tr_df4',key:'tr.df4',title:'🏋 Drill: defence aur quiet moves (1500-2100)',sub:'Prophylaxis ke baad: shaant bachaav wali chaalein',yaad:['Opponent ka plan pehle socho (prophylaxis).','Sabse achhi defence aksar shaant chaal hoti hai.'],
      steps:[{t:'info',h:'Drill: mushkil defence',md:'Ab rating 1500-2100 ke defence aur **quiet move** puzzles. Prophylaxis ka sawaal pucho: **opponent kya karna chahta hai?** Phir use roko.\n\nSet: 10 puzzles, **7** sahi.'},
        {t:'pzset',mode:'set',lo:1500,hi:2100,th:['defence','quiet'],al:al('l6.prophy'),n:10,need:7,q:'**Defence set**: 10 puzzles, **7** sahi.'}],pool:mkPz({mode:'set',lo:1500,hi:2100,th:['defence','quiet'],al:al('l6.prophy'),n:10,need:7,q:'**Test set**: 10 puzzles, **7** sahi.'},3),qn:1}},
    {ch:'l7',after:'l7.calc2',needs:['l7.calc2','tr.df4'],les:{id:'tr_df5',key:'tr.df5',title:'🏋 Drill: GM level defence (2100-2800)',sub:'Sabse mushkil only-move positions',yaad:['Lamba calculation: opponent ka sabse achha jawab.','Haar maan ke mat baitho: sirf ek chaal bhi kaafi hai.'],
      steps:[{t:'info',h:'Drill: GM defence',md:'Ab 2100 se 2800 rating ke defence puzzles. Deep calculation lagao: har candidate ke baad **opponent ka sabse achha jawab** socho.\n\nSet: 10 puzzles, **6** sahi.'},
        {t:'pzset',mode:'set',lo:2100,hi:2800,th:['defence'],al:al('l7.calc2'),n:10,need:6,q:'**GM defence set**: 10 puzzles, **6** sahi.'}],pool:mkPz({mode:'set',lo:2100,hi:2800,th:['defence'],al:al('l7.calc2'),n:10,need:6,q:'**Test set**: 10 puzzles, **6** sahi.'},3),qn:1}}];
  const rush=(id,ch,after,needs,title,sub,yaad,md,o)=>({ch,after,needs,les:{id:'tr_'+id,key:'tr.'+id,title,sub,yaad,steps:[{t:'info',h:'Drill: time pressure',md},Object.assign({t:'pzset',mode:'rush',al:al(after),q:o.q},o)],pool:mkPz(Object.assign({mode:'rush',al:al(after)},o,{q:'**Test rush**: '+o.q}),3),qn:1}});
  const RS=[
    rush('rs1','l1b','l7.tourney',['l1.mate','l7.tourney'],'🏋 Drill: mate-in-1 rush','3 minute mein jitne mate-in-1',['Clock chalti hai: jaldi par dhyan se.','Pehle check wali chaalein dekho.'],
      'Ab **clock** ke saath! 3 minute mein jitne ho sake **mate in 1** karo. Galat chaal par 1 second ka break, phir agla puzzle.\n\nTarget: **10 sahi**. Har baar naye puzzles.',{lo:400,hi:1100,th:['mate1'],secs:180,need:10,q:'3 minute, **10 mate** chahiye.'}),
    rush('rs2','l2b','l2.captures',['l2.safety','l2.captures'],'🏋 Drill: free piece rush','3 minute mein latakte pieces pakdo',['Har position: kaun sa piece bina protection hai?','Attackers aur defenders gino.'],
      '3 minute mein **free pieces** (hanging) pakdo. Attackers aur defenders jaldi gino.\n\nTarget: **12 sahi**.',{lo:400,hi:1200,th:['hanging'],secs:180,need:12,q:'3 minute, **12 sahi** chahiye.'}),
    rush('rs3','l3','l3.remove',['l3.fork','l3.pin','l3.skewer','l3.disc','l3.remove'],'🏋 Drill: tactics rush','5 minute: fork, pin, skewer, discovered, defender hatao',['Pehle forcing chaalein: check, capture, threat.','Pattern pehchano, phir chalo.'],
      '5 minute mein tactics: **fork, pin, skewer, discovered attack, defender hatao**. Sirf pehli chaal sahi karni hai.\n\nTarget: **15 sahi**.',{lo:600,hi:1300,th:['fork','pin','skewer','disc','remdef'],secs:300,need:15,q:'5 minute, **15 sahi** chahiye.'}),
    rush('rs4','l7','l7.time',['l7.time','tr.rs3'],'🏋 Drill: clock handling (increment)','1 minute + 8 second har sahi par, 3 galti = khatam',['Increment: har sahi chaal par time judta hai.','Time trouble mein simple aur safe.'],
      'Asli game jaisa clock: shuru mein sirf **1 minute**, har sahi jawab par **+8 second** (increment). **3 galtiyan** = game khatam. Jaldi bhi, sahi bhi.\n\nTarget: **15 sahi**.',{lo:1200,hi:1900,secs:60,inc:8,lives:3,need:15,q:'1:00 + 8s, 3 jaan, **15 sahi** chahiye.'}),
    rush('rs5','l7','l7.tips',['l7.time','l7.tips','tr.rs4'],'🏋 Drill: GM rush (1800-2500)','3 minute, 3 galti = khatam, mushkil puzzles',['Speed ke saath accuracy: pehle CCT.','Ek galti ke baad ruko mat, agla socho.'],
      'GM level speed: **3 minute**, mushkil puzzles (1800-2500), **3 galtiyan** = khatam.\n\nTarget: **12 sahi**.',{lo:1800,hi:2500,secs:180,lives:3,need:12,q:'3 minute, 3 jaan, **12 sahi** chahiye.'})];
  fs.writeFileSync(path.join(__dirname,'ladders','defence.json'),JSON.stringify(D,null,1));fs.writeFileSync(path.join(__dirname,'ladders','rush.json'),JSON.stringify(RS,null,1));
  console.log([...D,...RS].map(l=>l.les.key+': '+l.les.steps.length+' steps, pool '+l.les.pool.length+(l.les.steps[1]&&l.les.steps[1].al?' al='+l.les.steps[1].al.join('/'):'')).join('\n'))}
main().catch(e=>{console.error(e);process.exit(1)});
