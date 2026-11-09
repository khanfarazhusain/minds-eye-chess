/* ---- i18n: language packs ---- */
const LANGS=[
 // [code, English name, native name, group, rtl]
 ['hi','Hinglish','Hinglish','in'],['hin','Hindi','हिन्दी','in'],['ur','Urdu','اردو','in',1],['bn','Bengali','বাংলা','in'],['mr','Marathi','मराठी','in'],['gu','Gujarati','ગુજરાતી','in'],['pa','Punjabi','ਪੰਜਾਬੀ','in'],['ta','Tamil','தமிழ்','in'],['te','Telugu','తెలుగు','in'],['kn','Kannada','ಕನ್ನಡ','in'],['ml','Malayalam','മലയാളം','in'],['or','Odia','ଓଡ଼ିଆ','in'],['as','Assamese','অসমীয়া','in'],['ne','Nepali','नेपाली','in'],['sa','Sanskrit','संस्कृतम्','in'],['kok','Konkani','कोंकणी','in'],['ks','Kashmiri','کٲشُر','in',1],['sd','Sindhi','سنڌي','in',1],['mai','Maithili','मैथिली','in'],['doi','Dogri','डोगरी','in'],['sat','Santali','ᱥᱟᱱᱛᱟᱲᱤ','in'],['brx','Bodo','बड़ो','in'],['mni','Manipuri','ꯃꯤꯇꯩꯂꯣꯟ','in'],
 ['en','English','English','int'],['es','Spanish','Español','int'],['fr','French','Français','int'],['de','German','Deutsch','int'],['pt','Portuguese','Português','int'],['it','Italian','Italiano','int'],['ru','Russian','Русский','int'],['ar','Arabic','العربية','int',1],['fa','Persian','فارسی','int',1],['tr','Turkish','Türkçe','int'],['zh','Chinese','中文','int'],['ja','Japanese','日本語','int'],['ko','Korean','한국어','int'],['id','Indonesian','Bahasa Indonesia','int'],['ms','Malay','Bahasa Melayu','int'],['vi','Vietnamese','Tiếng Việt','int'],['th','Thai','ไทย','int'],['nl','Dutch','Nederlands','int'],['pl','Polish','Polski','int'],['uk','Ukrainian','Українська','int'],['el','Greek','Ελληνικά','int'],['he','Hebrew','עברית','int',1],['sw','Swahili','Kiswahili','int'],['fil','Filipino','Filipino','int']];
const BUILTIN=['en','hi'];
const PACK_BASE=(()=>{try{return/github\.io$/.test(location.hostname)||location.protocol==='file:'?'packs/':'https://khanfarazhusain.github.io/minds-eye-chess/packs/'}catch(e){return'packs/'}})();
const I18N={code:'en',dict:null,pats:[],idx:null,busy:false,dl:null};
let PACKIDX=window.PACKIDX_INLINE||{};
function langRow(c){return LANGS.find(x=>x[0]===c)}
function curLang(){return(P.set&&P.set.lang)||'en'}
function isPackLang(c){return!BUILTIN.includes(c)}
async function packCache(){try{return await caches.open('squares64-lang')}catch(e){return null}}
async function packInstalled(c){const C=await packCache();if(!C)return!!localStorage.getItem('lp_'+c);const r=await C.match(PACK_BASE+c+'.json');return!!r}
async function packLoad(c){const C=await packCache();let txt=null;
  if(C){const r=await C.match(PACK_BASE+c+'.json');if(r)txt=await r.text()}
  if(!txt)try{txt=localStorage.getItem('lp_'+c)}catch(e){}
  if(!txt)return null;try{return JSON.parse(txt)}catch(e){return null}}
async function packDownload(c,onp){const url=PACK_BASE+c+'.json?v='+((PACKIDX[c]||{}).v||1);let res;
  try{res=await fetch(url,{cache:'no-store'})}catch(e){res=null}
  if((!res||!res.ok)&&PACK_BASE!=='https://khanfarazhusain.github.io/minds-eye-chess/packs/'){try{res=await fetch('https://khanfarazhusain.github.io/minds-eye-chess/packs/'+c+'.json?v='+Date.now(),{cache:'no-store'})}catch(e){res=null}}
  if(!res||!res.ok)throw new Error('net');
  const tot=+res.headers.get('content-length')||((PACKIDX[c]||{}).size||0);let got=0,parts=[];
  if(res.body&&res.body.getReader){const rd=res.body.getReader();for(;;){const {done,value}=await rd.read();if(done)break;parts.push(value);got+=value.length;onp&&onp(tot?Math.min(99,Math.round(got/tot*100)):0)}}
  else{parts=[new Uint8Array(await res.arrayBuffer())]}
  const txt=new TextDecoder().decode(await new Blob(parts).arrayBuffer());JSON.parse(txt);
  const C=await packCache();if(C)await C.put(PACK_BASE+c+'.json',new Response(txt,{headers:{'content-type':'application/json'}}));else try{localStorage.setItem('lp_'+c,txt)}catch(e){}
  onp&&onp(100);return JSON.parse(txt)}
async function packDelete(c){const C=await packCache();if(C)await C.delete(PACK_BASE+c+'.json');try{localStorage.removeItem('lp_'+c)}catch(e){}}
function keyOf(s){return s.replace(/\s+/g,' ').trim()}
function i18nSet(pack){I18N.dict=pack?pack.ui||{}:null;I18N.pats=[];
  if(pack)for(const k in I18N.dict){if(k.includes('{s}')){const re=new RegExp('^'+k.replace(/[.*+?^$()|[\]\\]/g,'\\$&').replace(/\\?\{n\\?\}/g,'(\\d+)').replace(/\{n\}/g,'(\\d+)').replace(/\{s\}/g,'(.+?)')+'$');I18N.pats.push([re,k])}}}
function trStr(raw){const D=I18N.dict;if(!D)return null;const s=keyOf(raw);if(!s)return null;
  const nums=[];const k=s.replace(/\d+/g,m=>{nums.push(m);return'{n}'});let v=D[k];
  if(v!=null){let i=0;return v.replace(/\{n\}/g,()=>nums[i++]??'')}
  for(const [re,pk] of I18N.pats){const m=s.match(re);if(m){const caps=m.slice(1);const kinds=(pk.match(/\{[ns]\}/g)||[]);let ni=0,si=0;const N=[],S=[];kinds.forEach((t,j)=>{if(t==='{n}')N.push(caps[j]);else S.push(caps[j])});
      return D[pk].replace(/\{([ns])\}/g,(_,t)=>t==='n'?(N[ni++]??''):(()=>{const x=S[si++]??'';return trStr(x)||x})())}}
  if(s.includes(' · ')){const parts=s.split(' · ');const tp=parts.map(p=>trStr(p));if(tp.some(x=>x!=null))return parts.map((p,i)=>tp[i]??p).join(' · ')}
  return null}
const TR_SKIP='script,style,.board,svg,.gamemoves,.mvlist,.notation,.mono.clk,textarea,input,[data-notr]';
const TRW=new WeakMap();
function trText(n){const pe=n.parentElement;if(!pe||pe.closest(TR_SKIP))return;let o=TRW.get(n);const cur=n.nodeValue;
  if(o&&cur===o.t)return;// already ours
  const src=cur;if(!/[A-Za-z]{2}/.test(src))return;const t=trStr(src);if(t==null)return;
  const lead=src.match(/^\s*/)[0],trail=src.match(/\s*$/)[0];const val=lead+t+trail;TRW.set(n,{s:src,t:val});if(val!==cur)n.nodeValue=val}
function trAttrs(el){for(const a of['placeholder','aria-label','title']){const v=el.getAttribute&&el.getAttribute(a);if(v&&/[A-Za-z]{2}/.test(v)){const t=trStr(v);if(t!=null&&t!==v)el.setAttribute(a,t)}}}
function trTree(root){if(!I18N.dict||!root)return;if(root.nodeType===3){trText(root);return}if(root.nodeType!==1)return;if(root.closest&&root.closest(TR_SKIP))return;
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT,{acceptNode:x=>x.nodeType===1&&x.matches(TR_SKIP)?2:1});
  trAttrs(root);let x;while(x=w.nextNode()){if(x.nodeType===3)trText(x);else trAttrs(x)}}
let TRMO=null,TRQ=new Set(),TRT=0;
function trStart(){if(TRMO)return;TRMO=new MutationObserver(ms=>{if(!I18N.dict)return;for(const m of ms){if(m.type==='characterData')TRQ.add(m.target);else m.addedNodes.forEach(n=>TRQ.add(n))}if(!TRT)TRT=requestAnimationFrame?0:0;queueMicrotask(trFlush)});
  TRMO.observe(document.body,{childList:true,subtree:true,characterData:true})}
function trFlush(){const q=[...TRQ];TRQ.clear();for(const n of q){if(n.isConnected)trTree(n)}}
function applyDir(){const r=langRow(curLang());document.documentElement.dir=r&&r[4]?'rtl':'ltr';document.documentElement.lang={hi:'en',hin:'hi'}[curLang()]||curLang()}
async function i18nApply(){const c=curLang();applyDir();
  if(!isPackLang(c)){i18nSet(null);return}
  const pk=await packLoad(c);if(!pk){i18nSet(null);return}
  I18N.code=c;i18nSet(pk);trStart();trTree(document.body)}
function packPct(c){if(BUILTIN.includes(c))return 100;const x=PACKIDX[c];return x?x.pct:0}
function langLabel(r){const pc=packPct(r[0]);return`${r[2]}${r[2]!==r[1]?' · '+r[1]:''}${BUILTIN.includes(r[0])?'':pc?` (${pc}%)`:' (soon)'}`}
function langPickHTML(){const c=curLang(),grp=(g,t)=>`<optgroup label="${t}">${LANGS.filter(r=>r[3]===g).map(r=>`<option value="${r[0]}" ${r[0]===c?'selected':''} ${!BUILTIN.includes(r[0])&&!packPct(r[0])?'disabled':''}>${esc(langLabel(r))}</option>`).join('')}</optgroup>`;
  return`<div class="lpick"><select id="langsel" aria-label="Language" data-notr>${grp('in','Indian languages')}${grp('int','International languages')}</select></div><div id="lpcard">${packCardHTML(c)}</div>`}
function fmtKB(b){return b>1048576?(b/1048576).toFixed(1)+' MB':Math.max(1,Math.round(b/1024))+' KB'}
function packCardHTML(c){if(!isPackLang(c))return'';const x=PACKIDX[c]||{},r=langRow(c);const D=I18N.dl&&I18N.dl.c===c?I18N.dl:null;
  return`<div class="lpc" data-c="${c}"><div class="lpch"><b>${esc(r?r[2]:c)}</b><small class="muted">${L2('Language pack','Language pack')} · ${fmtKB(x.size||0)} · ${L2('App','App')} ${x.ui||0}% · ${L2('Course','Course')} ${x.course||0}% · ${L2('Notes','Notes')} ${x.notes||0}%</small></div>
   ${D?`<div class="lpbar"><i style="width:${D.p}%"></i></div><small class="muted">${D.err?L2('Download failed. Check the internet and try again.','Download nahi hua. Internet check karke phir try karo.'):L2('Downloading','Download ho raha hai')+' '+D.p+'%'}</small>`:''}
   <div class="row lpbtns" id="lpbtns"></div></div>`}
async function packButtons(){const el=document.getElementById('lpbtns');if(!el)return;const c=curLang();if(!isPackLang(c)){el.innerHTML='';return}
  const inst=await packInstalled(c);const pk=inst?await packLoad(c):null,x=PACKIDX[c]||{},upd=pk&&x.v&&pk.v<x.v;
  el.innerHTML=inst?`<span class="lpok">✓ ${L2('Installed','Installed')}</span>${upd?`<button class="btn small primary" data-act="lp-dl">⬆ ${L2('Update','Update')}</button>`:''}<button class="btn small" data-act="lp-del">🗑 ${L2('Delete','Delete')}</button>`
   :`<button class="btn small primary" data-act="lp-dl">⬇ ${L2('Download','Download')} · ${fmtKB(x.size||0)}</button>`}
async function langChoose(c){const prev=curLang();if(!langRow(c))return;
  if(isPackLang(c)&&!(await packInstalled(c))){I18N.dl={c,p:0};P.set.lang=c;rerenderLangCard();
    try{await packDownload(c,p=>{I18N.dl={c,p};const b=document.querySelector('.lpbar i'),t=document.querySelector('.lpc small.muted:last-of-type');if(b)b.style.width=p+'%'})}catch(e){I18N.dl={c,p:0,err:1};P.set.lang=prev;rerenderLangCard();return}
    I18N.dl=null}
  P.set.lang=c;if(P.set.cvoice&&P.set.cvoice!=='off')P.set.cvoice=c==='hi'?'hi':'en';save();
  if(!isPackLang(c)){i18nSet(null);applyDir();render();return}
  await i18nApply();render();setTimeout(()=>trTree(document.body),0)}
function rerenderLangCard(){const el=document.getElementById('lpcard');if(el){el.innerHTML=packCardHTML(curLang());packButtons()}}
document.addEventListener('change',e=>{if(e.target&&e.target.id==='langsel')langChoose(e.target.value)});
async function i18nBoot(){try{const r=await fetch(PACK_BASE+'index.json',{cache:'no-store'});if(r.ok){PACKIDX=await r.json();try{localStorage.setItem('lp_index',JSON.stringify(PACKIDX))}catch(e){}}}catch(e){try{PACKIDX=JSON.parse(localStorage.getItem('lp_index')||'{}')}catch(e2){}}
  if(document.getElementById('langsel')){rerenderLangCard()}}
