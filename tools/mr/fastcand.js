// "Tez candidates": walk move categories in a fixed human order and stop at K moves. No scoring of every legal move.
// Measures how often the engine's move (or one within 30cp of it) is among the first K. Usage: node fastcand.js <labelDir> [maxPositions]
const fs = require('fs'), path = require('path'); const E = require('./me-engine.js'); const R = require('./me-rules.js');
const dir = process.argv[2] || '.', lim = +(process.argv[3] || 0);
const files = fs.readdirSync(dir).filter(f => /^(n2lab|n3lab|nlab|hlab)\d\.json$/.test(f));
const VAL = [0, 100, 300, 300, 500, 900, 0];
function cats(pos) { // returns legal moves in category order
  const L = pos.legalMoves(), us = pos.side, out = [], seen = new Set(); const F = R.features3(pos, 0); const fm = new Map(F.map(x => [x.move, x.f]));
  const info = L.map(m => { const fr = E.mFrom(m), to = E.mTo(m), pc = pos.pieceAt ? pos.b[fr] & 7 : 0, cap = (E.mFlag(m) & E.F_CAP) ? (pos.b[to] & 7) || 1 : 0;
    pos.make(m); const chk = pos.inCheck(); pos.unmake(); const f = fm.get(m) || {};
    const la = E.leastAttacker(pos, fr, us ^ 8); const attacked = !!la && (!pos.attacked(fr, us) || VAL[pos.b[la] & 7] < VAL[pc]); const see = cap ? E.see(pos, m) : 0;
    return { m, pc, cap, chk, attacked, see, threat: (f.threat || 0) + (f.pawnAttackPiece || 0) + (f.pin || 0) + (f.skewer || 0), dev: (f.pstDelta || 0) + (f.develop || 0) + (f.centralize || 0) - (f.newHang || 0) * 3 }; });
  const groups = [
    info.filter(x => x.cap && x.see >= 0).sort((a, b) => VAL[b.cap] - VAL[a.cap] || VAL[a.pc] - VAL[b.pc]),      // 1. good captures (bigger victim first)
    info.filter(x => x.chk).sort((a, b) => b.see - a.see),                                                           // 2. checks
    info.filter(x => x.attacked && x.pc !== 6).sort((a, b) => VAL[b.pc] - VAL[a.pc] || b.dev - a.dev),             // 3. save attacked piece (biggest first)
    info.filter(x => x.threat > 0).sort((a, b) => b.threat - a.threat || b.dev - a.dev),                            // 4. new threats
    info.slice().sort((a, b) => b.dev - a.dev)];                                                                       // 5. rest: development / centre
  const ORD = (process.env.ORD || '01234').split('').map(Number);
  for (const gi of ORD) for (const x of groups[gi]) if (!seen.has(x.m)) { seen.add(x.m); out.push(x.m); }
  return out; }
const hit = { 3: 0, 5: 0, 7: 0 }; let n = 0, legalSum = 0;
outer: for (const f of files) { const NL = JSON.parse(fs.readFileSync(path.join(dir, f))); for (const fen in NL) { const it = NL[fen]; const lab = it.m || it; if (!lab || !lab.length) continue;
    const pos = new E.Position(fen); const sc = {}; for (const [u, s] of lab) sc[u] = s; const mx = Math.max(...lab.map(x => x[1])); const best = it.best;
    const good = u => u === best || sc[u] >= mx - 30; const ord = cats(pos).map(m => pos.uci(m)); legalSum += ord.length;
    for (const K of [3, 5, 7]) if (ord.slice(0, K).some(good)) hit[K]++; n++; if (lim && n >= lim) break outer; } }
const pc = x => (100 * x / n).toFixed(1); console.log(JSON.stringify({ n, avgLegal: (legalSum / n).toFixed(1), top3: pc(hit[3]), top5: pc(hit[5]), top7: pc(hit[7]) }));
