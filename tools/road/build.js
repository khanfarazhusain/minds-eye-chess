// Builds road.html (the 10-level rated program) from course.html + tools/road/*.
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
const app=fs.readFileSync(path.join(__dirname,'app.js'),'utf8');
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
#lu{flex:1;min-width:0;font:inherit;padding:9px 10px;border-radius:8px;border:1px solid var(--line);background:var(--bg);color:var(--fg)}
`;
let html=head.replace(/<title>[^<]*<\/title>/,'<title>Road to 3000 · 64 Squares</title>')
 .replace(/<meta name="description"[^>]*>/,'<meta name="description" content="Zero se Lichess 3000 tak: roz ka quota, unlimited puzzles, Lichess rating se level.">')
 +css+`</style>
</head>
<body>
<header class="top"><div class="wrap"><a class="brand" href="#/" style="color:inherit;text-decoration:none"><i style="font-style:normal;font-weight:800;font-size:15px;letter-spacing:-.04em">64</i> Road to 3000</a><div class="chips"><span class="chip" id="xp">0 XP</span><span class="chip" id="streak">🔥 0</span></div></div></header>
<main><div class="wrap" id="app"></div></main>
<nav class="tabs"><div class="wrap">
<button data-tab="course" data-go="#/"><span>🗓</span>Today</button>
<button data-go="#/run/extra"><span>♾</span>Practice</button>
<button onclick="location.href='course.html'"><span>📚</span>Course</button>
<button onclick="location.href='index.html'"><span>👁</span>Trainer</button>
</div></nav>
<script>
${core}
${playerFns}
${content}
${app}
</script>
</body>
</html>
`;
fs.writeFileSync(path.join(root,'road.html'),html);
console.log('road.html',html.length,'bytes');
