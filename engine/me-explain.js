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
  let pinTxt = null;
  if ((p === BISHOP || p === ROOK || p === QUEEN) && !mate) {
    const b = pos.b, us = b[to] & 8;
    for (const d of (p === BISHOP ? E.B_OFF : p === ROOK ? E.R_OFF : E.K_OFF)) {
      let x1 = to + d; while (b[x1] === 0) x1 += d; const q1 = b[x1]; if (q1 === OFF || (q1 & 8) === us) continue;
      let x2 = x1 + d; while (b[x2] === 0) x2 += d; const q2 = b[x2]; if (q2 === OFF || (q2 & 8) === us) continue;
      if (VAL[q2 & 7] > VAL[q1 & 7] || (q2 & 7) === KING) { if ((q1 & 7) !== KING) pinTxt = `pin: ${PNAME[q1 & 7]} ${sqName(x1)} ke peeche ${PNAME[q2 & 7]}`; }
    }
  }
  pos.unmake();
  if (pinTxt) tags.push(pinTxt);
  if (mate) tags.push('checkmate');
  else if (check) tags.push('check');
  if (capT && !mate) tags.push(s > 0 ? `${PNAME[capT]} jeetta hai` : s === 0 ? `${PNAME[capT]} ka badla (trade)` : `${PNAME[capT]} leta hai par wapas kat jayega`);
  if (mPromo(m)) tags.push(PNAME[mPromo(m)] + ' banta hai');
  const tnames = targets.map(x => { pos.make(m); const n = PNAME[pos.b[x] & 7]; pos.unmake(); return n; });
  const bigTargets = tnames.filter(n => n !== 'pawn');
  if (targets.length >= 2 && bigTargets.length >= 1 && (bigTargets.length >= 2 || check || tnames.includes('king'))) tags.push('fork: ' + tnames.join(' + ') + ' par ek saath hamla');
  else if (bigTargets.length && bigTargets[0] !== 'king') tags.push(bigTargets.filter(n => n !== 'king').join(' + ') + ' par hamla');
  return { san: pos.san(m), uci: pos.uci(m), tags, see: s, check, capture: !!capT, threat: (bigTargets.some(n => n !== 'king') || !!pinTxt) && !capT };
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


// ---------- Human candidate checklist ----------
// Rules in the order a human should scan them. Each legal move gets the FIRST rule that finds it.
const RULES = {
  A: 'Rule A: Forcing chaal (check, capture ya threat)',
  B: 'Rule B: Khatre se bachao (hamla hue mohre ko hatao ya bachao)',
  C: 'Rule C: Mohra sudhaaro (kamzor mohra active karo, develop karo)',
  D: 'Rule D: Pawn break (opponent ke pawn par pawn se hamla)',
  E: 'Rule E: Raja ki safety (castling)',
  F: 'Rule F: Rook ko open file par lao',
  G: 'Rule G: Center lo / mohron ke raaste kholo'
};
function totalMob(pos, side) { let n = 0; for (let s = 21; s < 99; s++) { const p = pos.b[s]; if (p && p !== OFF && (p & 8) === side) { const t = p & 7; if (t >= KNIGHT && t <= QUEEN) n += pieceMob(pos, s); } } return n; }
// squares a piece controls that are usable (not own piece, not hit by enemy pawn)
function pieceMob(pos, s) {
  const b = pos.b, p = b[s], t = p & 7, us = p & 8; let n = 0;
  const pawnHit = x => us === WHITE ? (b[x - 9] === (PAWN | 8) || b[x - 11] === (PAWN | 8)) : (b[x + 9] === PAWN || b[x + 11] === PAWN);
  const ok = x => { const q = b[x]; return q !== OFF && (q === 0 || (q & 8) !== us) && !pawnHit(x); };
  if (t === KNIGHT || t === KING) { for (const d of (t === KNIGHT ? E.N_OFF : E.K_OFF)) if (ok(s + d)) n++; }
  else if (t === BISHOP || t === ROOK || t === QUEEN) for (const d of (t === BISHOP ? E.B_OFF : t === ROOK ? E.R_OFF : E.K_OFF)) { let x = s + d; while (b[x] !== OFF) { if (ok(x)) n++; if (b[x] !== 0) break; x += d; } }
  return n;
}
function hangValue(pos, side) { return hangingPieces(pos, side).reduce((a, h) => a + h.gain, 0); }
function humanCandidates(pos, threat) {
  const us = pos.side, b = pos.b, res = new Map();
  // worst piece: lowest mobility among our N/B/R/Q
  let worst = null;
  for (let s = 21; s < 99; s++) { const p = b[s]; if (!p || p === OFF || (p & 8) !== us) continue; const t = p & 7; if (t < KNIGHT || t > QUEEN) continue;
    const m = pieceMob(pos, s); const score = m + (t === QUEEN ? 3 : 0); if (!worst || score < worst.score) worst = { s, m, t, score }; }
  const hangBefore = hangValue(pos, us); const totBefore = totalMob(pos, us);
  const homeRow = us === WHITE ? 7 : 0;
  const realThreat = threat && (threat.kind === 'mate' || threat.kind === 'material');
  const ownPawnOnFile = f => { for (let r = 0; r < 8; r++) if (b[E.sqOf(f, r)] === (PAWN | us)) return true; return false; };
  const oppPawnOnFile = f => { for (let r = 0; r < 8; r++) if (b[E.sqOf(f, r)] === (PAWN | (us ^ 8))) return true; return false; };
  for (const m of pos.legalMoves()) {
    const from = mFrom(m), to = mTo(m), p = b[from], t = p & 7;
    const d = describeMove(pos, m);
    if (d.check || d.capture || d.threat) { res.set(m, { rule: 'A', why: d.tags.join(', ') || 'forcing' }); continue; }
    pos.make(m);
    const hangAfter = hangValue(pos, us);
    let threatStopped = false;
    if (realThreat && threat.kind === 'mate') { /* checked by search elsewhere */ }
    const mobAfter = (t >= KNIGHT && t <= QUEEN) ? pieceMob(pos, to) : 0;
    const totAfter = totalMob(pos, us);
    let pawnBreak = false;
    if (t === PAWN) for (const x of attacksFrom(pos, to)) if ((pos.b[x] & 7) === PAWN) pawnBreak = true;
    pos.unmake();
    if (hangBefore > 0 && hangAfter < hangBefore) { res.set(m, { rule: 'B', why: `latakta mohra bacha (${hangBefore - hangAfter >= 300 ? 'bada' : 'chhota'} nuksan ruka)` }); continue; }
    void threatStopped;
    if (worst && from === worst.s && mobAfter - worst.m >= 2) { res.set(m, { rule: 'C', why: `${PNAME[t]} ${sqName(from)} sabse kamzor tha (${worst.m} squares), ${sqName(to)} par ${mobAfter} squares` }); continue; }
    if (pawnBreak) { res.set(m, { rule: 'D', why: `pawn ${sqName(to)} se opponent ke pawn par hamla` }); continue; }
    if (mFlag(m) & E.F_CASTLE) { res.set(m, { rule: 'E', why: 'castling: raja safe, rook khel mein' }); continue; }
    if (t === ROOK && !ownPawnOnFile(E.fileOf(to)) && E.fileOf(to) !== E.fileOf(from)) { res.set(m, { rule: 'F', why: `rook ${'abcdefgh'[E.fileOf(to)]}-file par (${oppPawnOnFile(E.fileOf(to)) ? 'half-open' : 'open'})` }); continue; }
    if ((t === KNIGHT || t === BISHOP) && E.rowOf(from) === homeRow) { res.set(m, { rule: 'C', why: `development: ${PNAME[t]} ghar se bahar, ${mobAfter} squares` }); continue; }
    if (t >= KNIGHT && t <= QUEEN) { const before = pieceMob(pos, from); if (mobAfter - before >= 3) { res.set(m, { rule: 'C', why: `${PNAME[t]} zyada active: ${before} se ${mobAfter} squares` }); continue; } }
    const center = ['d4', 'e4', 'd5', 'e5', 'c4', 'c5', 'f4', 'f5'].includes(sqName(to));
    if (t === PAWN && center) { res.set(m, { rule: 'G', why: `pawn ${sqName(to)}: center par kabza${totAfter - totBefore >= 2 ? ', mohron ke raaste khule (+' + (totAfter - totBefore) + ' squares)' : ''}` }); continue; }
    if (totAfter - totBefore >= 4) res.set(m, { rule: 'G', why: `mohron ke raaste khulte hain: kul ${totBefore} se ${totAfter} squares` });
  }
  return res;
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
  const human = humanCandidates(pos, threat);
  for (const c of cands) {
    const h = human.get(c.move); c.rule = h ? h.rule : null; c.ruleText = h ? RULES[h.rule] + ': ' + h.why : 'Kisi aasaan rule se nahi milti: ye chaal gehri calculation se nikli';
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
  steps.push({ id: 'candidates', title: 'Candidate chaalein', data: { cands: cands.map(c => ({ san: c.san, uci: c.uci, score: c.score, scoreText: c.scoreText, line: c.line, tags: c.desc.tags, matGain: c.out.matGain, rule: c.rule, ruleText: c.ruleText })), alts, checklist: (() => { const g = {}; for (const [m, h] of human) { (g[h.rule] = g[h.rule] || []).push(pos.san(m)); } return Object.keys(RULES).filter(k => g[k]).map(k => ({ rule: k, title: RULES[k], moves: g[k].slice(0, 8), more: Math.max(0, g[k].length - 8) })); })() } });

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


// ---------- Rule-scored candidate ranking (a human-followable method) ----------
// Each legal move gets a feature vector from simple, checkable rules; score = weighted sum.
// Top 3-5 by score = the candidates a human should calculate. Strongly negative = "ignore" (pruned).
const FEAT = ['mate','check','checkFew','capGain','capLoss','trade','promo','fork','threat','pin','saveHang','newHang','stopMate','allowMate',
  'develop','worstPiece','mobDelta','pawnBreak','castle','kingWalkMid','rookOpen','centerPawn','totMob','queenEarly',
  'kingCentral','passedPush','pawnPushEnd','pstDelta','backRetreat','edgePawnOpen','tradeAhead','recapture','attackKingZone','luft','pawnThreat','defendAttacked','shieldPawn','tradeBehind','captureTowardCenter','kingAttackers'];
const FEAT_TEXT = { mate: ['A', 'checkmate'], check: ['A', 'check'], checkFew: ['A', 'check, raja ke paas kam squares'], capGain: ['A', 'material jeetta hai'], capLoss: ['A', 'capture mein nuksan'],
  trade: ['A', 'barabar trade'], promo: ['A', 'promotion'], fork: ['A', 'fork'], threat: ['A', 'bade/bina bachaav mohre par hamla'], pin: ['A', 'pin'], saveHang: ['B', 'latakta mohra bachaya'],
  newHang: ['B', 'mohra latak jaata hai (blunder check)'], stopMate: ['B', 'mate ka khatra roka'], allowMate: ['B', 'mate in 1 de deta hai'], develop: ['C', 'development'], worstPiece: ['C', 'sabse kamzor mohra active'],
  mobDelta: ['C', 'mohra zyada active'], pawnBreak: ['D', 'pawn break'], castle: ['E', 'castling'], kingWalkMid: ['E', 'middlegame mein raja chalana'], rookOpen: ['F', 'rook open file par'],
  centerPawn: ['G', 'center pawn'], totMob: ['G', 'mohron ke raaste khule'], queenEarly: ['C', 'queen jaldi bahar'], kingCentral: ['H', 'endgame: raja center/pawns ki taraf'],
  passedPush: ['H', 'passed pawn aage'], pawnPushEnd: ['H', 'endgame: pawn aage'], pstDelta: ['C', 'mohra behtar square par'], backRetreat: ['C', 'bina wajah peeche'], edgePawnOpen: ['G', 'opening mein kinare ka pawn'],
  tradeAhead: ['A', 'aage ho to trade karo'], recapture: ['A', 'wapas maaro (recapture)'], attackKingZone: ['A', 'raja ke paas hamla'], luft: ['E', 'raja ko saans (luft)'], pawnThreat: ['A', 'pawn/undefended mohre par hamla'], defendAttacked: ['B', 'hamla hue mohre ko support'], shieldPawn: ['E', 'raja ke aage ka pawn hilana'], tradeBehind: ['A', 'peeche ho to trade se bacho'], captureTowardCenter: ['G', 'center ki taraf capture'], kingAttackers: ['A', 'opponent ke raja ki taraf mohre'] };
const RW = { mate: 3000, check: 40, checkFew: 40, capGain: 1, capLoss: 1, trade: 5, promo: 700, fork: 150, threat: 45, pin: 50, saveHang: 0.9, newHang: -1, stopMate: 600, allowMate: -3000,
  develop: 30, worstPiece: 25, mobDelta: 5, pawnBreak: 25, castle: 70, kingWalkMid: -40, rookOpen: 30, centerPawn: 25, totMob: 3, queenEarly: -25,
  kingCentral: 0, passedPush: 0, pawnPushEnd: 0, pstDelta: 0, backRetreat: 0, edgePawnOpen: 0, tradeAhead: 0, recapture: 0, attackKingZone: 0, luft: 0, pawnThreat: 0, defendAttacked: 0, shieldPawn: 0, tradeBehind: 0, captureTowardCenter: 0, kingAttackers: 0 };
function oppHasMateIn1(pos) {
  for (const m of pos.legalMoves()) { pos.make(m); const mate = pos.inCheck() && pos.legalMoves().length === 0; pos.unmake(); if (mate) return true; }
  return false;
}
function isPassed(pos, s) {
  const p = pos.b[s], us = p & 8, f = E.fileOf(s), r = E.rowOf(s);
  for (let ff = Math.max(0, f - 1); ff <= Math.min(7, f + 1); ff++) for (let rr = 0; rr < 8; rr++) {
    if (us === WHITE ? rr >= r : rr <= r) continue; if (pos.b[E.sqOf(ff, rr)] === (PAWN | (us ^ 8))) return false; }
  return true;
}
const centerDist = s => Math.max(Math.abs(E.fileOf(s) * 2 - 7), Math.abs(E.rowOf(s) * 2 - 7)); // 1 (center) .. 7 (corner)
function ruleFeatures(pos, lastTo) {
  const us = pos.side, b = pos.b, out = [];
  const hangBefore = hangValue(pos, us), totBefore = totalMob(pos, us);
  pos.makeNull(); const mateThreat = !pos.inCheck() && oppHasMateIn1(pos); pos.unmakeNull();
  let worst = null;
  for (let s = 21; s < 99; s++) { const p = b[s]; if (!p || p === OFF || (p & 8) !== us) continue; const t = p & 7; if (t < KNIGHT || t > QUEEN) continue;
    const mb = pieceMob(pos, s) + (t === QUEEN ? 3 : 0); if (!worst || mb < worst.m) worst = { s, m: mb }; }
  const homeRow = us === WHITE ? 7 : 0;
  let devCount = 0; for (let f = 0; f < 8; f++) { const p = b[E.sqOf(f, homeRow)]; if (p === (KNIGHT | us) || p === (BISHOP | us)) devCount++; }
  const ownPawnOnFile = f => { for (let r = 0; r < 8; r++) if (b[E.sqOf(f, r)] === (PAWN | us)) return true; return false; };
  const ph = Math.min(pos.phase, 24), endgame = pos.phase <= 8, opening = devCount >= 2;
  const matAhead = matDiff(pos, us);
  const ek = pos.kingSq[(us ^ 8) >> 3], myK = pos.kingSq[us >> 3];
  const near = (a, c) => Math.max(Math.abs(E.fileOf(a) - E.fileOf(c)), Math.abs(E.rowOf(a) - E.rowOf(c)));
  const tap = (p, s) => ((E.PST_MG[p][s] * ph + E.PST_EG[p][s] * (24 - ph)) / 24) * (us === WHITE ? 1 : -1);
  // opponent pawns for king-centralization target
  for (const m of pos.legalMoves()) {
    const from = mFrom(m), to = mTo(m), pc = b[from], t = pc & 7; const f = {};
    const d = describeMove(pos, m);
    const capT = (mFlag(m) & F_EP) ? PAWN : (b[to] & 7);
    if (d.tags.includes('checkmate')) f.mate = 1;
    if (capT) { if (d.see > 0) f.capGain = d.see; else if (d.see < 0) f.capLoss = d.see; else f.trade = 1;
      if (d.see >= 0 && matAhead >= 2 && capT !== PAWN) f.tradeAhead = 1; if (to === lastTo) f.recapture = 1; }
    if (mPromo(m) === QUEEN) f.promo = 1;
    const fork = d.tags.some(x => x.startsWith('fork')), pin = d.tags.some(x => x.startsWith('pin')), thr = d.tags.some(x => x.endsWith('par hamla') && !x.startsWith('fork'));
    const pstBefore = tap(pc, from);
    pos.make(m);
    const check = pos.inCheck();
    const hangAfter = hangValue(pos, us);
    const movedHang = hangingPieces(pos, us).some(x => x.sq === sqName(to));
    const allowMate = !check && oppHasMateIn1(pos);
    const mobAfter = (t >= KNIGHT && t <= QUEEN) ? pieceMob(pos, to) : 0;
    const totAfter = totalMob(pos, us);
    let pawnBreak = false; if (t === PAWN) for (const x of attacksFrom(pos, to)) if ((pos.b[x] & 7) === PAWN) pawnBreak = true;
    const kingEscapes = check ? pos.legalMoves().length : 99;
    const passed = t === PAWN && isPassed(pos, to);
    const pstAfter = tap(pos.b[to], to);
    let kz = 0; if (t >= KNIGHT && t <= QUEEN) for (const x of attacksFrom(pos, to)) {} // placeholder (attacksFrom only returns enemy pieces)
    pos.unmake();
    if (check && !f.mate) { f.check = 1; if (kingEscapes <= 2) f.checkFew = 1; }
    if (fork && !movedHang) f.fork = 1; else if (thr && !movedHang) f.threat = 1;
    if (pin && !movedHang) f.pin = 1;
    if (hangBefore > 0 && hangAfter < hangBefore) f.saveHang = hangBefore - hangAfter;
    if (hangAfter > hangBefore) f.newHang = hangAfter - hangBefore;
    if (mateThreat && !allowMate) f.stopMate = 1;
    if (allowMate) f.allowMate = 1;
    if ((t === KNIGHT || t === BISHOP) && E.rowOf(from) === homeRow) f.develop = 1;
    if (worst && from === worst.s && mobAfter > worst.m) f.worstPiece = 1;
    if (t >= KNIGHT && t <= QUEEN) f.mobDelta = mobAfter - pieceMob(pos, from);
    if (pawnBreak && !capT) f.pawnBreak = 1;
    if (mFlag(m) & E.F_CASTLE) f.castle = 1;
    if (t === KING && !(mFlag(m) & E.F_CASTLE) && pos.phase > 12) f.kingWalkMid = 1;
    if (t === KING && endgame) f.kingCentral = (centerDist(from) - centerDist(to)) + (near(from, ek) - near(to, ek)) * 0.5;
    if (t === ROOK && !ownPawnOnFile(E.fileOf(to)) && E.fileOf(to) !== E.fileOf(from)) f.rookOpen = 1;
    if (t === PAWN && ['d4', 'e4', 'd5', 'e5', 'c4', 'c5', 'f4', 'f5'].includes(sqName(to))) f.centerPawn = 1;
    f.totMob = totAfter - totBefore;
    if (t === QUEEN && devCount >= 3) f.queenEarly = 1;
    if (passed && !capT) f.passedPush = us === WHITE ? 7 - E.rowOf(to) : E.rowOf(to);
    if (t === PAWN && endgame && !capT) f.pawnPushEnd = 1;
    f.pstDelta = (pstAfter - pstBefore) / 10;
    if (t !== PAWN && t !== KING && E.rowOf(to) === homeRow && E.rowOf(from) !== homeRow && !capT) f.backRetreat = 1;
    if (t === PAWN && opening && (E.fileOf(from) === 0 || E.fileOf(from) === 7)) f.edgePawnOpen = 1;
    if (t === PAWN && !endgame && near(to, myK) <= 1 && E.rowOf(myK) === homeRow && !capT && (E.fileOf(from) === 7 || E.fileOf(from) === 6 || E.fileOf(from) === 0)) f.luft = 1;
    void kz;
    // new features
    {
      pos.make(m);
      const att = attacksFrom(pos, to);
      let pthr = 0; for (const s2 of att) { const q = pos.b[s2] & 7; if (q === PAWN && !defended(pos, s2)) pthr = 1; }
      // defend: a piece of ours that is attacked and was undefended becomes defended
      pos.unmake();
      if (pthr && !capT && !movedHang) f.pawnThreat = 1;
      if (capT && d.see === 0 && matAhead <= -2) f.tradeBehind = 1;
      if (capT && t === PAWN && Math.abs(E.fileOf(to) * 2 - 7) < Math.abs(E.fileOf(from) * 2 - 7)) f.captureTowardCenter = 1;
      if (!endgame && t === PAWN && near(from, myK) <= 1 && E.rowOf(myK) === homeRow && !f.luft) f.shieldPawn = 1;
      if (t >= KNIGHT && t <= QUEEN && !endgame) f.kingAttackers = near(from, ek) - near(to, ek);
    }
    if (hangBefore > 0 && !f.saveHang) {
      // supported an attacked piece without moving it?
      pos.make(m); const ha = hangingPieces(pos, us).length; pos.unmake();
      const hb = hangingPieces(pos, us).length; if (ha < hb) f.defendAttacked = 1;
    }
    out.push({ move: m, f });
  }
  return out;
}
function scoreFeat(f, W) { let s = 0; for (const k in f) s += (W[k] || 0) * f[k]; return s; }
function ruleRank(pos, W, lastTo) {
  W = W || RW;
  const fs = ruleFeatures(pos, lastTo);
  const out = fs.map(x => {
    const why = []; for (const k in x.f) { const v = (W[k] || 0) * x.f[k]; if (Math.abs(v) >= 10 && FEAT_TEXT[k]) why.push({ r: FEAT_TEXT[k][0], w: FEAT_TEXT[k][1], v: Math.round(v) }); }
    why.sort((a, b) => Math.abs(b.v) - Math.abs(a.v));
    return { move: x.move, san: pos.san(x.move), uci: pos.uci(x.move), score: Math.round(scoreFeat(x.f, W)), why, f: x.f };
  });
  out.sort((a, b) => b.score - a.score);
  return out;
}

const api = { ruleRank, ruleFeatures, scoreFeat, FEAT, FEAT_TEXT, RW, humanCandidates, RULES, explain, judge, hangingPieces, forcingMoves, describeMove, scoreText, sanLine };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
root.MEExplain = api;
})(typeof self !== 'undefined' ? self : this);
