/* ---------- Lichess Connect: OAuth PKCE (ek baar login, token is device par save) ----------
   road.html aur lichess.html dono yahi code aur yahi saved token use karte hain.
   Lichess ko app register karne ki zaroorat nahi; client_id koi bhi naam ho sakta hai.
   Password kabhi app mein nahi aata: login Lichess ke apne page par hota hai. */
const LTOK='mindseye.road.lichess';
const LCLIENT='64squares.app';
const LSCOPES=['board:play','challenge:read','challenge:write'];
let LT=null;try{LT=JSON.parse(localStorage.getItem(LTOK)||'null')}catch(e){}
const lichScopesOk=()=>!!LT&&LSCOPES.every(x=>(LT.scopes||[]).includes(x));
const lichToken=()=>LT&&LT.exp>Date.now()&&lichScopesOk()?LT.tok:null;
const lichNeedsReconnect=()=>!!LT&&!lichToken();
function ltSave(v){LT=v;try{v?localStorage.setItem(LTOK,JSON.stringify(v)):localStorage.removeItem(LTOK)}catch(e){}}
const redirectUri=()=>location.origin+location.pathname;
const b64u=buf=>btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
async function lichConnect(){const ver=b64u(crypto.getRandomValues(new Uint8Array(32)));const state=b64u(crypto.getRandomValues(new Uint8Array(12)));
  const chal=b64u(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(ver)));
  try{sessionStorage.setItem('road.pkce',JSON.stringify({ver,state,back:location.hash||'#/'}))}catch(e){}
  location.href='https://lichess.org/oauth?'+new URLSearchParams({response_type:'code',client_id:LCLIENT,redirect_uri:redirectUri(),code_challenge_method:'S256',code_challenge:chal,scope:LSCOPES.join(' '),state})}
/* Lichess se wapas aane par (?code=...&state=...) token lo aur save karo. window.__lmsg mein nateeja. */
async function lichReturn(){const q=new URLSearchParams(location.search);if(!q.get('code')&&!q.get('error'))return null;
  let pk=null;try{pk=JSON.parse(sessionStorage.getItem('road.pkce')||'null');sessionStorage.removeItem('road.pkce')}catch(e){}
  history.replaceState(null,'',location.pathname+(pk&&pk.back?pk.back:'#/'));
  if(q.get('error')||!pk||pk.state!==q.get('state')){window.__lmsg='Lichess se judna poora nahi hua. Dobara "Connect Lichess" dabao.';return null}
  try{const r=await fetch('https://lichess.org/api/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'authorization_code',code:q.get('code'),code_verifier:pk.ver,redirect_uri:redirectUri(),client_id:LCLIENT})});
    if(!r.ok)throw new Error('token');const j=await r.json();
    const a=await (await fetch('https://lichess.org/api/account',{headers:{Authorization:'Bearer '+j.access_token}})).json();
    ltSave({tok:j.access_token,exp:Date.now()+(j.expires_in||31536000)*1000,user:a.username,scopes:LSCOPES});window.__lmsg='Lichess jud gaya: '+a.username+'. Ab baar-baar login nahi karna padega.';return a.username}
  catch(e){window.__lmsg='Lichess se token nahi mila. Internet check karke dobara try karo.';return null}}
async function lichDisconnect(){const t=LT&&LT.tok;ltSave(null);if(t)try{await fetch('https://lichess.org/api/token',{method:'DELETE',headers:{Authorization:'Bearer '+t}})}catch(e){}}
/* token ke saath API call; 401 par token purana maana jaata hai */
async function lapi(path,opt){const t=lichToken();if(!t)throw new Error('noauth');opt=Object.assign({},opt||{});opt.headers=Object.assign({Authorization:'Bearer '+t},opt.headers||{});
  const r=await fetch('https://lichess.org'+path,opt);if(r.status===401){ltSave(Object.assign({},LT,{exp:0}));throw new Error('expired')}return r}
async function lform(path,data,signal){const r=await lapi(path,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(data||{}),signal});
  if(!r.ok){let m='';try{const j=await r.json();m=typeof j.error==='string'?j.error:JSON.stringify(j.error||j).replace(/[{}"\[\]]/g,' ').trim()}catch(e){}throw new Error(m||('Lichess error '+r.status))}return r}
/* ndjson stream padho (event stream, game stream, seek) */
async function lstream(path,onLine,opt){const r=await lapi(path,opt);if(!r.ok){let m='';try{const j=await r.json();m=typeof j.error==='string'?j.error:JSON.stringify(j.error||j).replace(/[{}"\[\]]/g,' ').trim()}catch(e){}throw new Error(m||('Lichess error '+r.status))}
  if(opt&&opt.onOpen)opt.onOpen();
  const rd=r.body.getReader(),dec=new TextDecoder();let buf='';
  for(;;){const{done,value}=await rd.read();if(done)break;buf+=dec.decode(value,{stream:true});let i;while((i=buf.indexOf('\n'))>=0){const line=buf.slice(0,i).trim();buf=buf.slice(i+1);if(line)try{onLine(JSON.parse(line))}catch(e){}}}}

/* ---------- UCI <-> app ki chaal (dono pages) ---------- */
const uciOf=m=>sn(m.f)+sn(m.t)+(m.promo?m.promo.toLowerCase():'');
function fromUci(st,u){const L=legal(st);let m=L.find(x=>uciOf(x)===u);if(!m&&u.length===4){/* castling as king-takes-rook */const f=si(u.slice(0,2)),t=si(u.slice(2,4));const p=st.b[f];if(p&&p.toUpperCase()==='K')m=L.find(x=>x.f===f&&Math.abs((x.t&7)-(f&7))===2&&((t&7)>(f&7))===((x.t&7)>(f&7)))}return m}
