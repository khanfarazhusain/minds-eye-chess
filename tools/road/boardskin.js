/* ---------- App (index.html) jaisa board ----------
   Ye functions course.html ke boardHTML/Board/promoPick ki jagah lete hain (baad me declare hue, isliye yahi chalte hain).
   Farq: pieces par p-K/p-Q... class (app ke image piece sets ke liye), last move app ki tarah 'sel' rang me,
   chuna hua mohra app ki tarah 'from' ring se. Theme / piece set / 2D-3D app ki settings (mindseye.chess.v1) se. */
const SKIN_KEY='mindseye.chess.v1';
const SKIN_PSETS=['classic','heavy','flat','royal','glass','rhosgfx','font'];
const SKIN_THEMES=['classic','wood','marble','neon','space','mughal'];
function skinSet(){try{const j=JSON.parse(localStorage.getItem(SKIN_KEY)||'null');return(j&&j.set)||{}}catch(e){return{}}}
function applySkin(){const s=skinSet(),b=document.body,r=document.documentElement;if(!b)return;
  if(s.appth==='light'||s.appth==='dark')r.dataset.theme=s.appth;
  [...b.classList].forEach(c=>{if(/^(ps-|pz-|th-)/.test(c))b.classList.remove(c)});
  let ps=s.pcs||'classic';if(!SKIN_PSETS.includes(ps))ps='classic';
  b.classList.toggle('psimg',ps!=='font');if(ps!=='font')b.classList.add('ps-'+ps);
  if(s.pcsz&&s.pcsz!=='m')b.classList.add('pz-'+s.pcsz);
  const th=s.theme||'classic';if(th!=='classic'&&SKIN_THEMES.includes(th))b.classList.add('th-'+th);
  b.classList.toggle('b3d',s.board3d==='3d');skinView()}
// 3D me app jaisa jhukav (tilt) aur ghumav (yaw)
function skinView(){const s=skinSet(),on=document.body.classList.contains('b3d');const t=s.tilt!=null?s.tilt:30,y=s.yaw||0,r=y*Math.PI/180,
  sc=(1-.07*Math.abs(Math.sin(2*r)))/(Math.abs(Math.cos(r))+Math.abs(Math.sin(r))),tc=Math.max(.5,Math.cos(t*Math.PI/180));
  document.querySelectorAll('.board[data-board="main"]').forEach(b=>{const st=b.style;
    if(!on){st.transform='';return}
    st.transform=`perspective(1100px) rotateX(${t}deg) translateY(-50%) rotateZ(${y}deg) scale(${sc.toFixed(4)}) translateY(50%)`;
    st.setProperty('--yaw',y+'deg');st.setProperty('--tilt',t+'deg');st.setProperty('--tiltn',t);st.setProperty('--tcos',tc.toFixed(3));st.setProperty('--pco',((156-5*tc)/206*100).toFixed(1)+'%')})}
addEventListener('storage',e=>{if(e.key===SKIN_KEY)applySkin()});
addEventListener('pageshow',()=>applySkin());
function boardHTML(o){const persp=o.persp||'w';let h=`<div class="board${o.plain?' plain':''}${o.cls?' '+o.cls:''}" data-board="${o.id||'main'}">`;
  for(let row=0;row<8;row++)for(let col=0;col<8;col++){const r=persp==='w'?7-row:row,f=persp==='w'?col:7-col,s=r*8+f,name=sn(s);
    const c=['sq',light(s)?'l':'d'];if(o.hl&&o.hl.includes(name))c.push('hl');const mk=o.marks&&o.marks[name];if(mk)c.push('m-'+mk);if(o.dots&&o.dots.includes(name))c.push('dot');if(o.from===name)c.push('from');
    let inner='';if(o.coords){if(row===7)inner+=`<span class="cf">${FILES[f]}</span>`;if(col===0)inner+=`<span class="cr">${r+1}</span>`}
    if(o.labels)inner+=`<span class="lab">${name}</span>`;
    const p=o.pieces&&o.pieces[name];if(p)inner+=`<span class="pc ${isW(p)?'w':'b'} p-${p.toUpperCase()}">${GLYPH[p.toUpperCase()]}︎</span>`;
    const st=o.heat&&o.heat[name]!=null?` style="background:${o.heat[name]}"`:'';
    h+=`<div class="${c.join(' ')}" data-sq="${name}"${st}>${o.heat&&o.heatLab?name:inner}</div>`}
  return h+'</div>'}
function Board(host,o){const el=h('div','bwrap');host.appendChild(el);
  const B={o:Object.assign({persp:'w',coords:true},o),sel:null,dots:[],last:null,marks:{},lock:false,el};
  B.draw=()=>{const o=B.o;const pieces=o.st?toMap(o.st.b):(o.pieces||{});const marks=Object.assign({},o.marks||{},B.marks);
    // app me pichhli chaal ke dono squares peele (m-sel) hote hain
    if(B.last)for(const q of B.last)if(!marks[q])marks[q]='sel';
    el.innerHTML=boardHTML({persp:o.persp,coords:o.coords,labels:o.labels,hl:o.hl,marks,dots:B.dots,pieces,from:B.sel,cls:o.cls})+arrowsSVG(o.arr,o.persp);skinView()};
  B.set=(o2)=>{Object.assign(B.o,o2);B.draw()};
  B.clear=()=>{B.sel=null;B.dots=[];B.marks={};};
  el.addEventListener('click',e=>{const d=e.target.closest('[data-sq]');if(!d)return;const name=d.dataset.sq;
    if(B.o.onTap){B.o.onTap(name);return}
    const st=B.o.st;if(!B.o.side||!st||B.lock)return;if(st.w!==(B.o.side==='w'))return;
    const ms=legal(st);
    if(B.sel){const cand=ms.filter(m=>sn(m.f)===B.sel&&sn(m.t)===name);
      if(cand.length){B.sel=null;B.dots=[];
        if(cand.length>1&&cand[0].promo)promoPick(el,st.w,pr=>{B.draw();B.o.onMove(cand.find(m=>m.promo===pr))});else B.o.onMove(cand[0]);return}}
    const p=st.b[si(name)];
    if(p&&isW(p)===st.w&&B.sel!==name){B.sel=name;B.dots=ms.filter(m=>sn(m.f)===name).map(m=>sn(m.t))}else{B.sel=null;B.dots=[]}
    B.draw()});
  B.draw();return B}
function promoPick(el,w,cb){const ov=h('div','promo');ov.innerHTML='<div class="promobox"><b>Pawn ko kya banana hai?</b><div class="row">'+'QRBN'.split('').map(p=>`<button class="btn" data-p="${p}"><span class="pc ${w?'w':'b'} p-${p}">${GLYPH[p]}︎</span></button>`).join('')+'</div></div>';
  ov.addEventListener('click',e=>{const b=e.target.closest('[data-p]');if(!b)return;ov.remove();cb(b.dataset.p)});el.appendChild(ov)}
applySkin();
