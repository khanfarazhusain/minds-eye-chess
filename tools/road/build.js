// Builds road.html (10-level rated program) and lichess.html (Lichess Play) from course.html + tools/road/*.
// course.html is only READ: its chess rules, board, step player and lessons are reused, never changed.
// Run: node tools/road/build.js
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..','..');
const src=fs.readFileSync(path.join(root,'course.html'),'utf8');
const cut=(a,b,from=0)=>{const i=src.indexOf(a,from);const j=src.indexOf(b,i+a.length);if(i<0||j<0)throw new Error('marker not found: '+a+' / '+b);return src.slice(i,j)};
const head=src.slice(0,src.indexOf('</style>'));
const core=cut("'use strict';",'/* ---------- views ---------- */');
const playerFns=cut('function player(','function vLesson(');
const content=fs.readFileSync(path.join(__dirname,'content.js'),'utf8').replace(/if\(typeof module[^\n]*\n/,'');
const rd=f=>fs.readFileSync(path.join(__dirname,f),'utf8');
const app=rd('app.js'),auth=rd('lichess-auth.js'),play=rd('play.js'),games=rd('games.js'),explain=rd('explain.js');
const coreLite=core.replace(/const COURSE=\[.*?\];\n/s,'const COURSE=[];\n').replace(/const PLACEMENT=\[.*?\];\n/s,'const PLACEMENT=[];\n');
const SV=d=>`<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const IC={
 today:SV('<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/><path d="m9 14.5 2 2 4-4"/>'),
 practice:SV('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>'),
 course:SV('<path d="M2.5 8.5 12 4l9.5 4.5L12 13z"/><path d="M6.5 10.5V16c0 1.4 2.5 3 5.5 3s5.5-1.6 5.5-3v-5.5"/><path d="M21.5 8.5v5"/>'),
 trainer:SV('<path d="M3.5 10.5 12 4l8.5 6.5V20a1 1 0 0 1-1 1h-5v-6h-5v6h-5a1 1 0 0 1-1-1z"/>'),
 lobby:SV('<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.4 2.6 3.5 5.4 3.5 8.5s-1.1 5.9-3.5 8.5c-2.4-2.6-3.5-5.4-3.5-8.5s1.1-5.9 3.5-8.5z"/>'),
 road:SV('<path d="M5 21V4M5 4h11l-2 3.5L16 11H5"/>'),
 games:SV('<path d="M8 20h9"/><path d="M9 20c0-3 1.5-5 3-6.5-2.2.4-4 .1-5-1l3.5-6.5c3.5-.5 7 2 7 7.5V20"/><circle cx="12.6" cy="8.6" r=".7" fill="currentColor"/>')};
/* main app (index.html) jaisa neeche ka bar: patla, poori chaudai, upar gol kone */
const navCSS=`
nav.tabs{left:0!important;right:0!important;bottom:0!important;max-width:none!important;margin:0!important;border:0!important;border-radius:18px 18px 0 0!important;background:rgba(18,32,25,.94)!important;-webkit-backdrop-filter:blur(18px) saturate(1.5);backdrop-filter:blur(18px) saturate(1.5);box-shadow:0 -6px 20px rgba(10,25,18,.18)!important;padding-bottom:max(4px,calc(env(safe-area-inset-bottom,0px) - 12px))!important}
nav.tabs .wrap{display:grid;grid-template-columns:repeat(5,1fr)!important;gap:2px;padding:4px 6px 2px!important;max-width:560px;margin:0 auto}
nav.tabs button{position:relative;display:flex;flex-direction:column;align-items:center;gap:2px!important;line-height:1;padding:5px 0 4px!important;border:0;border-radius:18px;color:#8FA398!important;font-family:var(--f-body);font-size:11px!important;font-weight:600;letter-spacing:.01em;white-space:nowrap;background:none!important;transition:color .2s}
nav.tabs button::before{content:"";position:absolute;inset:1px 8px;border-radius:16px;background:rgba(123,224,166,.16);opacity:0;transform:scale(.85);transition:opacity .2s,transform .2s}
nav.tabs button.on{color:#7BE0A6!important;font-weight:800}
nav.tabs button.on::before{opacity:1;transform:scale(1)}
nav.tabs button.on svg{transform:translateY(-1px)}
nav.tabs button span{position:relative;display:grid;place-items:center;width:21px!important;height:21px!important;line-height:0;background:none!important;font-size:0!important}
nav.tabs button svg{display:block;transition:transform .2s}
@media (max-width:360px){nav.tabs button{font-size:10px!important}nav.tabs button svg{width:20px;height:20px}}
body:not(.emb) main{padding-bottom:calc(80px + env(safe-area-inset-bottom,0px))!important}
`;
const nav=(items)=>`<nav class="tabs"><div class="wrap">\n${items.map(([ic,label,act,on])=>`<button ${act}${on?' class="on"':''}><span>${IC[ic]}</span>${label}</button>`).join('\n')}\n</div></nav>`;
const BUILD=new Date().toISOString().slice(0,16).replace('T',' ')+' UTC';
const css=`
/* ---- Road to 3000 ---- */
.tbtn{display:none!important}
.shero h1{font-size:30px;margin:2px 0}
.qlist{display:flex;flex-direction:column;gap:8px}
.qrow{display:flex;align-items:center;gap:12px;background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:10px 12px}
.qrow.done{background:var(--good-soft);border-color:transparent}
.qi{font-size:20px;width:26px;text-align:center;flex:none}
.qt{flex:1;min-width:0}
.small{font-size:13px}
.lvls{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}
.lv{display:flex;flex-direction:column;align-items:center;gap:1px;padding:8px 2px;border-radius:10px;border:1px solid var(--line);background:var(--surface)}
.lv b{font-family:var(--f-display);font-size:20px}.lv span{font-size:11px;font-weight:700;text-align:center}.lv small{font-size:10px;color:var(--muted)}
.lv.on{border-color:var(--accent);background:var(--surface2)}.lv.locked{opacity:.5}
.card.alert{border-color:var(--bad);background:var(--bad-soft)}.card.okc{border-color:var(--good);background:var(--good-soft)}
ul.gate{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:6px;font-size:14px}
#gmv .mvx{cursor:pointer;padding:0 2px;border-radius:4px}#gmv .mvx.on{background:var(--surface2);font-weight:700}#gmv .mvx.blund{color:var(--bad);font-weight:700}#gmv .mvx.mist{color:#d9822b;font-weight:700}#gmv .mvx.inacc{color:var(--brass)}
.moves{font-family:var(--f-mono);font-size:13px;max-height:120px;overflow:auto;line-height:1.7;word-break:break-word}.moves .mn{color:var(--muted)}
.bar{height:8px;border-radius:6px;background:var(--surface2);overflow:hidden}.bar i{display:block;height:100%;background:var(--accent)}
.wrapr{flex-wrap:wrap;gap:6px}
ul.xwhy{margin:0;padding-left:18px;display:flex;flex-direction:column;gap:4px}
#lu{flex:1;min-width:0;font:inherit;padding:9px 10px;border-radius:8px;border:1px solid var(--line);background:var(--bg);color:var(--fg)}
`;
let html=head.replace(/<title>[^<]*<\/title>/,'<title>Road to 3000 · 64 Squares</title>')
 .replace(/<meta name="description"[^>]*>/,'<meta name="description" content="Zero se Lichess 3000 tak: roz ka quota, unlimited puzzles, Lichess rating se level.">')
 +css+navCSS+`</style>
</head>
<body>
<header class="top"><div class="wrap"><a class="brand" href="#/" style="color:inherit;text-decoration:none"><i style="font-style:normal;font-weight:800;font-size:15px;letter-spacing:-.04em">64</i> Road to 3000</a><div class="chips"><span class="chip" id="xp">0 XP</span><span class="chip" id="streak">🔥 0</span></div></div></header>
<main><div class="wrap" id="app"></div><p class="small muted" style="text-align:center;opacity:.6;margin-top:18px">Version ${BUILD}</p></main>
${nav([['today','Today','data-go="#/"',1],['practice','Practice','data-go="#/run/extra"'],['games','My Games','data-go="#/games"'],['course','Course',"onclick=\"location.href='course.html'\""],['trainer','Home',"onclick=\"location.href='index.html'\""]])}
<script>
${core}
${playerFns}
${content}
${auth}
${explain}
${games}
${app}
</script>
</body>
</html>
`;
fs.writeFileSync(path.join(root,'road.html'),html);
console.log('road.html',html.length,'bytes');

const pcss=fs.readFileSync(path.join(__dirname,'play.css'),'utf8');
const phtml=head.replace(/<title>[^<]*<\/title>/,'<title>Lichess Play · 64 Squares</title>')
 .replace(/<meta name="description"[^>]*>/,'<meta name="description" content="Lichess par khelo: quick pairing, custom game, dost ko challenge, Lichess computer.">')
 +css+pcss+navCSS+`</style>
</head>
<body>
<header class="top"><div class="wrap"><a class="brand" href="#/" style="color:inherit;text-decoration:none"><i style="font-style:normal;font-weight:800;font-size:15px;letter-spacing:-.04em">64</i> Lichess Play</a><div class="chips"><span class="chip" id="luser"></span></div></div></header>
<main><div class="wrap" id="app"></div><p class="small muted" style="text-align:center;opacity:.6;margin-top:18px">Version ${BUILD}</p></main>
${nav([['lobby','Lobby','data-go="#/"',1],['games','Rated','data-go="#/road"'],['road','Road',"onclick=\"location.href='road.html'\""],['course','Course',"onclick=\"location.href='course.html'\""],['trainer','Home',"onclick=\"location.href='index.html'\""]])}
<script>
${coreLite}
${auth}
${play}
</script>
</body>
</html>
`;
fs.writeFileSync(path.join(root,'lichess.html'),phtml);
console.log('lichess.html',phtml.length,'bytes');
