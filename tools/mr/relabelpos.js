// Re-check training positions with the v147 FHK engine: best move, gap to 2nd best, PV line. Keep only clear-best positions (gap >= 150).
const fs = require('fs'); const E = require('./me-engine.js'); const W = require('../lab/fhkw.js');
const F = W.create(E, '../lab/lab147.wasm', 20); F.loadNet('../lab/nets/current.bin');
const J = require('./in/positions_v146.json'); const out = []; let same = 0, drop = 0, chg = 0;
for (const p of J.positions) { const pos = new E.Position(p.fen); const L = pos.legalMoves(); const sc = [];
  for (const m of L) { F.clear(); const r = F.go(pos, { depth: 10, time: 60000, moves: [m] }); sc.push([m, r.score]); }
  sc.sort((a, b) => b[1] - a[1]); const bm = sc[0][0], gap = sc.length > 1 ? sc[0][1] - sc[1][1] : 999;
  F.clear(); const r = F.go(pos, { depth: 12, time: 60000, moves: [bm] });
  const line = []; const q = new E.Position(p.fen); for (const mv of r.pv.slice(0, 6)) { const lm = q.legalMoves().find(x => x === mv); if (!lm) break; line.push(q.san(lm)); q.make(lm); }
  const u = pos.uci(bm); if (gap < 150) { drop++; continue; } if (u === p.best) same++; else chg++;
  out.push(Object.assign({}, p, { best: u, san: pos.san(bm), gap, line: line.length ? line : [pos.san(bm)] })); }
fs.writeFileSync('positions_v147.json', JSON.stringify({ engine: 'FHK v147', version: 3, positions: out }));
console.log('kept', out.length, 'same best', same, 'changed', chg, 'dropped (no clear best)', drop);
