/* Explanation layer for the ME engine: turns the search into the same steps a human should follow.
 * Step 1 Khatra (opponent threat, via a null-move search)
 * Step 2 Latakte mohre (hanging pieces, via SEE)
 * Step 3 Forcing chaalein (checks, captures, threats)
 * Step 4 Candidates (multi-PV search) and why alternatives lose (restricted root search)
 * Step 5 Best move + reason (material along the PV, mate, or eval-term change)
 */
(function (root) {
'use strict';
const E = root.MEEngine || (typeof require !== 'undefined' ? require('./me-engine.js') : null);
const { PAWN, KNIGHT, BISHOP, ROOK, QUEEN, KING, WHITE, BLACK, MATE, MATE_BOUND, OFF, mFrom, mTo, mPromo, mFlag, F_CAP, F_EP, sqName, see, evaluate, SEEVAL } = E;

const PNAME = ['', 'pawn', 'knight', 'bishop', 'rook', 'queen', 'king'];
const VAL = [0, 1, 3, 3, 5, 9, 0];
const sideName = s => s === WHITE ? 'White' : 'Black';

function material(pos, side) { // material of side in pawns
  let v = 0; for (let s = 21; s < 99; s++) { const p = pos.b[s]; if (p && p !== OFF && (p & 8) === side) v += VAL[p & 7]; } return v;
}
function matDiff(pos, side) { return material(pos, side) - material(pos, side ^ 8); }

function sanLine(pos, moves) {
  const out = []; let k = 0;
  for (const m of moves) { if (!m) break; out.push(pos.san(m)); if (!pos.make(m)) { out.pop(); break; } k++; }
  while (k--) pos.unmake();
  return out;
}
function scoreText(cp) { // from mover's view
  if (cp > MATE_BOUND) return 'Mate in ' + Math.ceil((MATE - cp) / 2);
  if (cp < -MATE_BOUND) return 'Mate khaoge (' + Math.ceil((MATE + cp) / 2) + ')';
  const v = (cp / 100); return (v > 0 ? '+' : '') + v.toFixed(2);
}
function isMate(cp) { return Math.abs(cp) > MATE_BOUND; }

// Pieces of `side` attacked by the other side where the capture wins material (SEE > 0)
function hangingPieces(pos, side) {
  const res = [];
  const saveSide = pos.side, saveEp = pos.ep;
  pos.side = side ^ 8; pos.ep = 0;
  const buf = new Int32Array(256); const n = pos.gen(buf, 0, true);
  const bestOn = new Map();
  for (let i = 0; i < n; i++) {
    const m = buf[i]; if (!(mFlag(m) & F_CAP) || (mFlag(m) & F_EP)) continue;
    if (!pos.make(m)) continue; pos.unmake();
    const v = see(pos, m); const t = mTo(m);
    if (v > 0 && (!bestOn.has(t) || bestOn.get(t).v < v)) bestOn.set(t, { v, m });
  }
  for (const [t, o] of bestOn) {
    const p = pos.b[t] & 7; if (p === KING) continue;
    res.push({ sq: sqName(t), piece: PNAME[p], gain: o.v, by: PNAME[pos.b[mFrom(o.m)] & 7], bySq: sqName(mFrom(o.m)), san: pos.san(o.m) });
  }
  pos.side = saveSide; pos.ep = saveEp;
  res.sort((a, b) => b.gain - a.gain);
  return res;
}

// what enemy pieces does the piece on square s attack (after a move)
function attacksFrom(pos, s) {
  const b = pos.b, p = b[s], t = p & 7, us = p & 8, out = [];
  const add = x => { const q = b[x]; if (q && q !== OFF && (q & 8) !== us) out.push(x); };
  if (t === PAWN) { const f = us === WHITE ? -10 : 10; add(s + f - 1); add(s + f + 1); }
  else if (t === KNIGHT || t === KING) for (const d of (t === KNIGHT ? E.N_OFF : E.K_OFF)) add(s + d);
  else for (const d of (t === BISHOP ? E.B_OFF : t === ROOK ? E.R_OFF : E.K_OFF)) { let x = s + d; while (b[x] === 0) x += d; add(x); }
  return out;
}
function defended(pos, s) { const p = pos.b[s]; return pos.attacked(s, p & 8); }

// Describe a single move tactically, in Hinglish
function describeMove(pos, m) {
  const from = mFrom(m), to = mTo(m), p = pos.b[from] & 7, tags = [];
  const capT = (mFlag(m) & F_EP) ? PAWN : (pos.b[to] & 7);
  const s = see(pos, m);
  pos.make(m);
  const check = pos.inCheck();
  const mate = check && pos.legalMoves().length === 0;
  const targets = attacksFrom(pos, to).filter(x => {
    const q = pos.b[x] & 7; if (q === KING) return true;
    return VAL[q] > VAL[p] || !defended(pos, x);
  });
  pos.unmake();
  if (mate) tags.push('checkmate');
  else if (check) tags.push('check');
  if (capT && !mate) tags.push(s > 0 ? `${PNAME[capT]} jeetta hai` : s === 0 ? `${PNAME[capT]} ka badla (trade)` : `${PNAME[capT]} leta hai par wapas kat jayega`);
  if (mPromo(m)) tags.push(PNAME[mPromo(m)] + ' banta hai');
  const tnames = targets.map(x => { pos.make(m); const n = PNAME[pos.b[x] & 7]; pos.unmake(); return n; });
  const bigTargets = tnames.filter(n => n !== 'pawn');
  if (targets.length >= 2 && bigTargets.length >= 1 && (bigTargets.length >= 2 || check || tnames.includes('king'))) tags.push('fork: ' + tnames.join(' + ') + ' par ek saath hamla');
  else if (bigTargets.length && bigTargets[0] !== 'king') tags.push(bigTargets.filter(n => n !== 'king').join(' + ') + ' par hamla');
  return { san: pos.san(m), uci: pos.uci(m), tags, see: s, check, capture: !!capT, threat: bigTargets.some(n => n !== 'king') && !capT };
}

// All forcing moves for the side to move
function forcingMoves(pos) {
  const out = { checks: [], captures: [], threats: [] };
  for (const m of pos.legalMoves()) {
    const d = describeMove(pos, m);
    if (d.check) out.checks.push(d);
    if (d.capture) out.captures.push(d);
    else if (d.threat && !d.check && see(pos, m) >= 0) out.threats.push(d);
  }
  out.captures.sort((a, b) => b.see - a.see);
  return out;
}

// Material change along a line (from mover's perspective), plus where it ends
function lineOutcome(pos, moves, plies) {
  const side = pos.side; const before = matDiff(pos, side); let k = 0;
  const mv = moves.slice(0, plies || 8);
  let after = before;
  for (let i = 0; i < mv.length; i++) {
    if (!pos.make(mv[i])) break; k++;
    const next = mv[i + 1];
    // only trust material at quiet points (next move in line is not a capture)
    if (next ? !(mFlag(next) & F_CAP) : (!(mFlag(mv[i]) & F_CAP) || !E.leastAttacker(pos, mTo(mv[i]), pos.side))) after = matDiff(pos, side);
  }
  const terms = {}; evaluate(pos, terms);
  while (k--) pos.unmake();
  return { matGain: after - before, terms };
}

const TERM_TEXT = {
  king: ['raja ki safety behtar / opponent ke raja par hamla', 'apne raja ki safety kamzor'],
  mobility: ['mohre zyada active (zyada squares)', 'mohre passive ho jaate hain'],
  passed: ['passed pawn aage badhta / mazboot', 'opponent ka passed pawn mazboot'],
  pawns: ['pawn structure behtar', 'pawn structure kharab (doubled/isolated)'],
  placement: ['mohre achhe squares par', 'mohre kharab squares par'],
  rooks: ['rook open file / 7th rank par', 'rook band (closed) file par'],
  bishops: ['bishop pair ka fayda', 'bishop pair chala jaata hai'],
  material: ['material ka fayda', 'material ka nuksan']
};
function reasonFrom(pos, best, cur) {
  // cur: terms now (white persp); best: lineOutcome
  if (isMate(best.score)) return best.score > 0 ? `Forced mate: ${scoreText(best.score)}.` : 'Har chaal haar rahi hai, ye sabse lamba bachaav hai.';
  if (best.out.matGain >= 1) return `Material jeetti hai: line ke end tak +${best.out.matGain} pawn ke barabar.`;
  const sign = pos.side === WHITE ? 1 : -1;
  const deltas = Object.keys(TERM_TEXT).filter(k => k !== 'material').map(k => ({ k, d: sign * ((best.out.terms[k] || 0) - (cur[k] || 0)) })).sort((a, b) => b.d - a.d);
  const good = deltas.filter(x => x.d >= 12).slice(0, 2).map(x => TERM_TEXT[x.k][0]);
  if (best.out.matGain === 0 && good.length) return 'Material barabar rehta hai, par: ' + good.join(', ') + '.';
  if (best.out.matGain < 0 && good.length) return `Line mein ${-best.out.matGain} pawn ka sacrifice hai, badle mein: ` + good.join(', ') + '.';
  return 'Position ko sabse achha banaye rakhti hai (koi bada nuksan nahi).';
}

// Search one root move only; returns {score, pv}
function searchMove(pos, S, m, time) {
  const r = S.go(pos, { time, moves: [m] });
  return { score: r.score, pv: r.pv, depth: r.depth };
}

// Main entry. opts: {time: ms for main search, multi: candidates count, altTime}
function explain(pos, S, opts) {
  opts = opts || {};
  const time = opts.time || 1500, multi = opts.multi || 3, altTime = opts.altTime || Math.max(250, time / 4);
  const side = pos.side, fen = pos.fen();
  const steps = [];
  const legal = pos.legalMoves();
  const inCheck = pos.inCheck();
  const curTerms = {}; evaluate(pos, curTerms);

  // Step 1: threat via null move
  let threat = null;
  if (!inCheck) {
    pos.makeNull();
    const r = S.go(pos, { time: Math.max(200, time / 5) });
    if (r && r.move) {
      const tm = r.move; const d = describeMove(pos, tm);
      const out = lineOutcome(pos, r.pv, 4);
      const pv = sanLine(pos, r.pv.slice(0, 4));
      pos.unmakeNull();
      const base = -evaluate(pos); // opponent's static view if nothing happened (pos is back to us to move)
      const severe = isMate(r.score) && r.score > 0 ? 'mate' : (out.matGain >= 1 && r.score > base + 120 ? 'material' : null);
      threat = { san: d.san, line: pv, tags: d.tags, kind: severe, gain: out.matGain, score: r.score,
        text: severe === 'mate' ? `Khatra! Agar aap kuch na karo to opponent ${d.san} se mate kar sakta hai.`
          : severe === 'material' ? `Khatra: opponent ${d.san} khel kar ${out.matGain} pawn ke barabar material jeet sakta hai (${pv.join(' ')}).`
          : `Koi seedha khatra nahi. Opponent ka plan: ${d.san}${d.tags.length ? ' (' + d.tags.join(', ') + ')' : ''}.` };
    } else pos.unmakeNull();
  } else threat = { kind: 'check', text: 'Aap check mein ho: pehle check se bachna hai (raja hatao, beech mein mohra lao, ya check dene wale ko maaro).' };
  steps.push({ id: 'threat', title: 'Khatra (opponent kya chahta hai?)', data: threat });

  // Step 2: hanging pieces
  const mine = hangingPieces(pos, side), theirs = hangingPieces(pos, side ^ 8);
  steps.push({ id: 'hanging', title: 'Latakte mohre', data: { mine, theirs } });

  // Step 3: forcing moves
  const forcing = forcingMoves(pos);
  steps.push({ id: 'forcing', title: 'Checks, captures, threats', data: forcing });

  // Step 4: main search + multi-PV
  const iters = [];
  const main = S.go(pos, { time, onIter: it => iters.push({ depth: it.depth, san: pos.san(it.move), score: it.score }) });
  const cands = [{ move: main.move, score: main.score, pv: main.pv, depth: main.depth }];
  const rest = legal.filter(m => m !== main.move);
  for (let k = 1; k < multi && rest.length; k++) {
    const r = S.go(pos, { time: altTime * 2, depth: Math.max(2, main.depth - 2), moves: rest });
    if (!r || !r.move) break;
    cands.push({ move: r.move, score: r.score, pv: r.pv, depth: r.depth });
    rest.splice(rest.indexOf(r.move), 1);
  }
  const tail = cands.slice(1).sort((a, b) => b.score - a.score); cands.length = 1; cands.push(...tail);
  for (const c of cands) {
    c.san = pos.san(c.move); c.uci = pos.uci(c.move); c.line = sanLine(pos, c.pv.slice(0, 8));
    c.out = lineOutcome(pos, c.pv); c.desc = describeMove(pos, c.move); c.scoreText = scoreText(c.score);
  }
  // Why the natural forcing alternatives fail
  const tried = new Set(cands.map(c => c.move));
  const alts = [];
  const natural = [...forcing.captures, ...forcing.checks, ...forcing.threats].map(d => pos.parseUci(d.uci)).filter((m, i, a) => m && !tried.has(m) && a.indexOf(m) === i);
  for (const m of natural.slice(0, opts.maxAlts || 4)) {
    tried.add(m);
    const r = searchMove(pos, S, m, Math.max(150, altTime / 2));
    alts.push(refutationText(pos, m, r, cands[0]));
  }
  steps.push({ id: 'candidates', title: 'Candidate chaalein', data: { cands: cands.map(c => ({ san: c.san, uci: c.uci, score: c.score, scoreText: c.scoreText, line: c.line, tags: c.desc.tags, matGain: c.out.matGain })), alts } });

  const best = cands[0];
  let reason = reasonFrom(pos, best, curTerms);
  // does the best move stop the threat?
  if (threat && (threat.kind === 'mate' || threat.kind === 'material')) {
    pos.make(best.move);
    const r2 = S.go(pos, { time: Math.max(150, time / 6) });
    const o2 = r2 && r2.move ? lineOutcome(pos, r2.pv, 4) : { matGain: 0 };
    pos.unmake();
    const stopped = threat.kind === 'mate' ? !(r2 && r2.score > MATE_BOUND) : o2.matGain < threat.gain;
    if (stopped && !(best.score > MATE_BOUND)) reason = `Pehle khatra roka (${threat.san} ab kaam nahi karta). ` + reason;
  }
  const gap = cands[1] ? best.score - cands[1].score : 999;
  steps.push({ id: 'best', title: 'Best move', data: { san: best.san, uci: best.uci, scoreText: best.scoreText, line: best.line, reason, gap, tags: best.desc.tags } });
  return { fen, side: sideName(side), steps, best: best.uci, bestSan: best.san, score: best.score, gap, depth: main.depth, nodes: main.nodes, iters };
}

function refutationText(pos, m, r, best) {
  const san = pos.san(m);
  const line = sanLine(pos, r.pv.slice(0, 6));
  const out = lineOutcome(pos, r.pv, 6);
  const loss = best.score - r.score;
  let why;
  if (isMate(r.score) && r.score < 0) why = `iske baad opponent mate kar deta hai (${line.slice(1, 6).join(' ')})`;
  else if (out.matGain <= -1) why = `opponent ${line[1] || ''} khelta hai aur aap ${-out.matGain} pawn ke barabar material kho dete ho`;
  else if (loss >= 150) why = `opponent ka jawab ${line[1] || ''} hai, aur best move se ${(loss / 100).toFixed(1)} pawn kam`;
  else if (loss >= 50) why = `chal sakti hai, par best se ${(loss / 100).toFixed(1)} pawn kam`;
  else why = 'lagbhag utni hi achhi hai';
  return { san, uci: pos.uci(m), score: r.score, scoreText: scoreText(r.score), loss, line, matGain: out.matGain, text: `${san}: ${why}.` };
}

// Explain why a user's move is (not) the best. best: result of explain()
function judge(pos, S, uci, bestInfo, time) {
  const m = pos.parseUci(uci); if (!m) return null;
  if (uci === bestInfo.best) return { ok: true, san: pos.san(m) };
  const r = searchMove(pos, S, m, time || 600);
  const res = refutationText(pos, m, r, { score: bestInfo.score });
  res.ok = res.loss < 30 && !isMate(bestInfo.score); // practically as good
  return res;
}

const api = { explain, judge, hangingPieces, forcingMoves, describeMove, scoreText, sanLine };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
root.MEExplain = api;
})(typeof self !== 'undefined' ? self : this);
