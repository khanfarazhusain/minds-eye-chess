// Re-label every legal move of each position with the v147 FHK engine (wasm, c1 search + current net), depth D, root-filtered per move.
const fs = require('fs'); const E = require('./me-engine.js'); const W = require('../lab/fhkw.js');
const [src, D] = [process.argv[2], +(process.argv[3] || 8)];
const F = W.create(E, '../lab/lab147.wasm', 18); F.loadNet('../lab/nets/current.bin');
const inp = JSON.parse(require('zlib').gunzipSync(fs.readFileSync('in/' + src + '.json.gz'))); let out = {}; try { out = JSON.parse(fs.readFileSync(src + '.json')); } catch (e) {} let n = Object.keys(out).length; const t0 = Date.now();
for (const fen in inp) { if (out[fen]) continue; const pos = new E.Position(fen); const L = pos.legalMoves(); const m = [];
  for (const mv of L) { F.clear(); const r = F.go(pos, { depth: D, time: 5000, moves: [mv] }); m.push([pos.uci(mv), r ? r.score : -99999]); }
  let best = m[0][0], bs = -1e9; for (const [u, s] of m) if (s > bs) { bs = s; best = u; }
  out[fen] = inp[fen].m ? { best, m } : m; if (++n % 200 === 0) { fs.writeFileSync(src + '.json', JSON.stringify(out)); console.log(src, n, ((Date.now() - t0) / 1000).toFixed(0) + 's'); } }
fs.writeFileSync(src + '.json', JSON.stringify(out)); console.log('done', src, n);
