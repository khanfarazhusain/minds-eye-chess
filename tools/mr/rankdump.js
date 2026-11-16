// Dump per-move human features + engine label for learning the "Tez candidates" ranker. Usage: node rankdump.js <labelDir> <shard> <nShards> > out.jsonl
const fs = require('fs'), path = require('path'); const E = require('./me-engine.js'); const R = require('./me-rules.js');
const [dir, sh, ns] = [process.argv[2], +process.argv[3] || 0, +process.argv[4] || 1];
const files = fs.readdirSync(dir).filter(f => /^(n2lab|n3lab|nlab|hlab|lab)\d\.json$/.test(f)).sort();
const V = [0, 100, 300, 300, 500, 900, 0]; let i = 0;
for (const f of files) { const NL = JSON.parse(fs.readFileSync(path.join(dir, f)));
  for (const fen in NL) { if (i++ % ns !== sh) continue; const it = NL[fen]; const lab = it.m || it; if (!Array.isArray(lab) || !lab.length) continue;
    const pos = new E.Position(fen), us = pos.side; const sc = {}; for (const [u, s] of lab) sc[u] = s; const mx = Math.max(...lab.map(x => x[1]));
    const F = R.features3(pos, 0); const rows = [];
    for (const { move: m, f } of F) { const u = pos.uci(m); if (sc[u] === undefined) continue;
      const fr = E.mFrom(m), to = E.mTo(m), pc = pos.b[fr] & 7, cap = (E.mFlag(m) & E.F_CAP) ? (pos.b[to] & 7) || 1 : 0;
      pos.make(m); const chk = pos.inCheck() ? 1 : 0; pos.unmake();
      const la = E.leastAttacker(pos, fr, us ^ 8); const att = !!la && (!pos.attacked(fr, us) || V[pos.b[la] & 7] < V[pc]) && pc !== 6 ? V[pc] / 100 : 0;
      const see = cap ? E.see(pos, m) : 0; const pr = E.mPromo(m) ? 1 : 0;
      rows.push({ u, good: (u === it.best || sc[u] >= mx - 30) ? 1 : 0, s: sc[u] - mx, f: { ...f, cap: V[cap] / 100, see: see / 100, chk, att, pr, ['pc' + pc]: 1, ['cp' + cap]: cap ? 1 : 0 } }); }
    if (rows.length > 1) process.stdout.write(JSON.stringify({ fen, ph: pos.phase, rows }) + '\n'); } }
