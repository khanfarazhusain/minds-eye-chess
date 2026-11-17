// Per-move human features + Stockfish best-move label, for the trained "rules model" (top-1 match goal).
// stdin: "fen|bestUci" lines (Lichess eval DB, SF depth>=20). argv: shard nShards.
// stdout: one line per position: fen \t phase \t move:good:v1,v2,...  (moves separated by space; values in KEYS order, see first line '#KEYS')
const E = require('./me-engine.js'); const R = require('./me-rules.js'); const rl = require('readline').createInterface({ input: process.stdin });
const [sh, ns] = [+process.argv[2] || 0, +process.argv[3] || 1]; const V = [0, 100, 300, 300, 500, 900, 0]; let i = 0;
const KEYS = ["allowChecks","allowFork","allowMate","backRankThreat","backRetreat","blockPassed","capGain","capLoss","capMinor","capPawn","capQueen","capRook","captureBiggest","captureLowest","captureTowardCenter","centerPawn","centralize","check","checkFew","connectRooks","defendAttacked","develop","discAttack","discCheck","doubleCheck","doubledCreate","edgePawnOpen","escapeAttack","fianchetto","fork","isolatedCreate","kCtr","kingAttackers","kingCentral","kingToPassed","kingWalkMid","kingZone","knightRim","longDiag","mateThreat","mobDelta","newHang","outpost","passedCreate","passedPush","pawnAdv","pawnAttackPiece","pawnBreak","pawnPushEnd","pawnStorm","pawnThreat","pin","promo","pstDelta","qGain","qLose","qWin","queenEarly","queenNearKing","removeDefender","rook7th","rookBehindPassed","rookOpen","rookSemiOpen","samePieceTwice","saveHang","shieldPawn","skewer","sqL","stopMate","threat","totMob","trade","tradeAhead","tradeBehind","tradeQueen","worstPiece","cap","see","chk","att","pr","pc1","pc2","pc3","pc4","pc5","pc6","mate","castle","loseCastle","luft","blockCheck","pinnedMove","movedHang","tz1","tz2","tz3","tz4","tzRank","xChk","xHang","xOppHang","eBpair","eIsl","ePhal","eDbl","eIso","eProt","eThr","eMobN","eMobB","eMobR","eMobQ","eRopen","eRsemi","eBad","eShield"];
const X = require('./me-explain.js'); // v3: missing rules + Tez tarika groups/rank + static 5-step context (steps 1-3 only, no search)
if (sh === 0) process.stdout.write('#KEYS\t' + KEYS.join(',') + '\n');
rl.on('line', l => { if (i++ % ns !== sh) return; const [fen, best] = l.split('|'); if (!best) return;
  try { const pos = new E.Position(fen), us = pos.side; const F = R.features3(pos, 0); const rows = []; let hit = 0;
    const xChk = pos.inCheck() ? 1 : 0, xHang = X.hangingPieces(pos, us).reduce((a, h) => a + h.gain, 0) / 100, xOppHang = X.hangingPieces(pos, us ^ 8).reduce((a, h) => a + h.gain, 0) / 100;
    const info = [];
    for (const { move: m, f } of F) { const u = pos.uci(m);
      const fr = E.mFrom(m), to = E.mTo(m), pc = pos.b[fr] & 7, cap = (E.mFlag(m) & E.F_CAP) ? (pos.b[to] & 7) || 1 : 0;
      pos.make(m); const chk = pos.inCheck() ? 1 : 0; pos.unmake();
      const la = E.leastAttacker(pos, fr, us ^ 8); const att = !!la && (!pos.attacked(fr, us) || V[pos.b[la] & 7] < V[pc]) && pc !== 6 ? V[pc] / 100 : 0;
      const see = cap ? E.see(pos, m) : 0; const pr = E.mPromo(m) ? 1 : 0; const good = u === best ? 1 : 0; hit += good;
      const ff = {}; for (const k in f) if (typeof f[k] === 'number') ff[k] = Math.round(f[k] * 100) / 100;
      const all = { ...ff, cap: V[cap] / 100, see: see / 100, chk, att, pr, ['pc' + pc]: 1 }; const thr = (f.threat || 0) + (f.pawnAttackPiece || 0) + (f.pin || 0) + (f.skewer || 0), dev = (f.pstDelta || 0) + (f.develop || 0) + (f.centralize || 0) - (f.newHang || 0) * 3;
      Object.assign(all, { tz1: cap && see >= 0 ? 1 : 0, tz2: chk, tz3: att ? 1 : 0, tz4: thr > 0 ? 1 : 0, xChk, xHang, xOppHang }); info.push({ u, good, all, cap, see, chk, att, pc, thr, dev }); }
    const ord = [], seen = new Set(), push = a => { for (const x of a) if (!seen.has(x.u)) { seen.add(x.u); ord.push(x); } }; // Tez tarika order (same as fastcand.js)
    push(info.filter(x => x.all.tz1).sort((a, b) => V[b.cap] - V[a.cap] || V[a.pc] - V[b.pc])); push(info.filter(x => x.chk).sort((a, b) => b.see - a.see));
    push(info.filter(x => x.att).sort((a, b) => V[b.pc] - V[a.pc] || b.dev - a.dev)); push(info.filter(x => x.thr > 0).sort((a, b) => b.thr - a.thr || b.dev - a.dev)); push(info.slice().sort((a, b) => b.dev - a.dev));
    ord.forEach((x, k) => { x.all.tzRank = 1 / (1 + k); });
    for (const x of info) rows.push(x.u + ':' + x.good + ':' + KEYS.map(k => x.all[k] ? +x.all[k].toFixed(2) : '').join(','));
    if (hit === 1 && rows.length > 1) process.stdout.write(fen + '\t' + pos.phase + '\t' + rows.join(' ') + '\n');
  } catch (e) {} });
