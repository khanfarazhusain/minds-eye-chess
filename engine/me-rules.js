/* FHK rule features for the training modes (from the rules research). Browser + Node. */
(function(root){
const E = root.MEEngine || require('./me-engine.js'); const X = root.MEExplain || require('./me-explain.js');
const { PAWN, KNIGHT, BISHOP, ROOK, QUEEN, KING, WHITE, OFF } = E;
const VAL = [0, 1, 3, 3, 5, 9, 0];

const Q = { // rule -> human question (Hinglish)
  // A. Forcing / tactics
  mate: 'Kya ye chaal seedha mate hai?',
  check: 'Kya ye check hai?',
  checkFew: 'Check ke baad raja ke paas 2 ya kam chaalein bachti hain?',
  doubleCheck: 'Kya ye double check hai?',
  discCheck: 'Kya mohra hatane se peeche wala mohra check deta hai (discovered check)?',
  discAttack: 'Kya mohra hatane se peeche wala mohra kisi bade mohre par hamla karta hai?',
  capPawn: 'Kya main pawn muft jeet raha hoon?', capMinor: 'Kya main knight/bishop muft (ya fayde se) jeet raha hoon?', capRook: 'Kya main rook jeet raha hoon?', capQueen: 'Kya main queen jeet raha hoon?',
  capGain: 'Kya main fayde se kuch maar raha hoon (SEE plus)?', capLoss: 'Kya ye capture mujhe wapas mehenga padega?',
  trade: 'Kya ye barabar ka trade hai?', tradeQueen: 'Kya ye queen ka trade hai?',
  promo: 'Kya pawn queen ban raha hai?', fork: 'Kya ek mohra do cheezon par ek saath hamla kar raha hai (fork)?', forkCheck: 'Kya fork mein ek target raja hai?',
  threat: 'Kya main kisi bade ya bina bachaav mohre par hamla kar raha hoon?', pawnThreat: 'Kya main kisi bina bachaav pawn par hamla kar raha hoon?',
  pin: 'Kya main koi mohra pin kar raha hoon?', skewer: 'Kya bada mohra aage aur chhota peeche hai (skewer)?',
  attackLastMoved: 'Kya main us mohre par hamla kar raha hoon jo abhi chala?', removeDefender: 'Kya main us mohre ko maar raha hoon jo kisi aur ko bacha raha tha?',
  mateThreat: 'Kya is chaal ke baad main agli chaal mein mate ki dhamki deta hoon?', backRankThreat: 'Kya opponent ki back rank kamzor hai aur main uspar aa raha hoon?',
  queenNearKing: 'Kya meri queen opponent ke raja ke paas pahunch rahi hai?', kingZone: 'Kya main opponent ke raja ke aas paas zyada squares par hamla kar raha hoon?',
  kingAttackers: 'Kya mera mohra opponent ke raja ke kareeb ja raha hai?',
  // B. Safety
  saveHang: 'Kya main apna latakta mohra bacha raha hoon?', newHang: 'Kya is chaal ke baad mera koi mohra latak jaata hai?', stopMate: 'Kya opponent mate ki dhamki de raha tha aur ye chaal use rokti hai?',
  allowMate: 'Kya is chaal ke baad opponent mate in 1 kar sakta hai?', defendAttacked: 'Kya main hamla hue mohre ko support de raha hoon?', escapeAttack: 'Kya main hamla hue mohre ko safe jagah le ja raha hoon?',
  allowFork: 'Kya is chaal ke baad opponent ke paas fork hai?', allowChecks: 'Kya is chaal ke baad opponent ke paas zyada safe checks hain?', pinnedMove: 'Kya main pin hue mohre ko chala raha hoon?',
  movedHang: 'Kya jo mohra maine chala wo khud latak raha hai?', blockCheck: 'Kya main check ko beech mein mohra laakar rok raha hoon?',
  // C. Piece activity
  develop: 'Kya main koi knight/bishop ghar se bahar nikaal raha hoon?', worstPiece: 'Kya main apna sabse kamzor mohra active kar raha hoon?', mobDelta: 'Kya mohre ke paas pehle se zyada squares hain?',
  totMob: 'Kya meri saari fauj ke squares badh rahe hain?', pstDelta: 'Kya mohra behtar square par ja raha hai?', centralize: 'Kya knight/bishop center ki taraf ja raha hai?',
  outpost: 'Kya mera knight aisi jagah ja raha hai jahan pawn use bhaga nahi sakta?', knightRim: 'Kya knight kinare par ja raha hai?', rookOpen: 'Kya rook open file par ja raha hai?', rookSemiOpen: 'Kya rook half-open file par ja raha hai?',
  rook7th: 'Kya rook 7th rank par ja raha hai?', connectRooks: 'Kya mere dono rook jud rahe hain?', queenEarly: 'Kya opening mein queen jaldi bahar aa rahi hai?', backRetreat: 'Kya mohra bina wajah peeche ja raha hai?',
  longDiag: 'Kya bishop lambi diagonal par ja raha hai?', fianchetto: 'Kya main fianchetto bana raha hoon?', samePieceTwice: 'Kya opening mein ek hi mohra do baar chal raha hoon?',
  // D. Pawn structure
  centerPawn: 'Kya pawn center mein aa raha hai?', pawnBreak: 'Kya main pawn se opponent ke pawn par hamla kar raha hoon (pawn break)?', passedPush: 'Kya main passed pawn aage badha raha hoon?', passedCreate: 'Kya is chaal se mera passed pawn banta hai?',
  isolatedCreate: 'Kya is chaal se mera pawn akela (isolated) ho jaata hai?', doubledCreate: 'Kya is chaal se doubled pawn banta hai?', edgePawnOpen: 'Kya opening mein kinare ka pawn chal raha hai?', pawnStorm: 'Kya main opponent ke raja ki taraf pawn badha raha hoon?',
  pawnAttackPiece: 'Kya mera pawn opponent ke mohre par hamla kar raha hai?', blockPassed: 'Kya main opponent ke passed pawn ke aage mohra rakh raha hoon?',
  // E. King
  castle: 'Kya main castling kar raha hoon?', kingWalkMid: 'Kya middlegame mein raja bina wajah chal raha hai?', luft: 'Kya main raja ko saans (luft) de raha hoon?', shieldPawn: 'Kya main raja ke aage ka pawn hila raha hoon?',
  kingCentral: 'Endgame: kya raja center ya pawns ki taraf ja raha hai?', kingToPassed: 'Endgame: kya raja passed pawn ke paas ja raha hai?', loseCastle: 'Kya main castling ka haq kho raha hoon?',
  // F. Trades & endgame
  tradeAhead: 'Kya main aage hoon aur mohre trade kar raha hoon?', tradeBehind: 'Kya main peeche hoon aur trade kar raha hoon?', pawnPushEnd: 'Endgame: kya pawn aage badh raha hai?', rookBehindPassed: 'Kya rook passed pawn ke peeche ja raha hai?',
  // G. Captures
  recapture: 'Kya main abhi maare gaye mohre ka badla le raha hoon?', captureTowardCenter: 'Kya pawn center ki taraf maar raha hai?', captureLowest: 'Kya main sabse sasta mohra use karke maar raha hoon?',
  captureBiggest: 'Kya main sabse bada mohra maar raha hoon jo mil sakta hai?',
};

const centerDist = s => Math.max(Math.abs(E.fileOf(s) * 2 - 7), Math.abs(E.rowOf(s) * 2 - 7));
const near = (a, c) => Math.max(Math.abs(E.fileOf(a) - E.fileOf(c)), Math.abs(E.rowOf(a) - E.rowOf(c)));
function attacksSq(pos, s) { // all squares attacked by piece on s (incl. own/empty)
  const b = pos.b, p = b[s], t = p & 7, us = p & 8, out = [];
  if (t === PAWN) { const f = us === WHITE ? -10 : 10; for (const x of [s + f - 1, s + f + 1]) if (b[x] !== OFF) out.push(x); }
  else if (t === KNIGHT || t === KING) { for (const d of (t === KNIGHT ? E.N_OFF : E.K_OFF)) if (b[s + d] !== OFF) out.push(s + d); }
  else for (const d of (t === BISHOP ? E.B_OFF : t === ROOK ? E.R_OFF : E.K_OFF)) { let x = s + d; while (b[x] !== OFF) { out.push(x); if (b[x]) break; x += d; } }
  return out;
}
function kingZoneAttacks(pos, side) { // number of (piece, square) attacks by `side` on squares around enemy king
  const ek = pos.kingSq[(side ^ 8) >> 3]; let n = 0;
  for (let s = 21; s < 99; s++) { const p = pos.b[s]; if (!p || p === OFF || (p & 8) !== side || (p & 7) === KING || (p & 7) === PAWN) continue; for (const x of attacksSq(pos, s)) if (near(x, ek) <= 1) n++; }
  return n;
}
function pawnsOn(pos, side, f) { let n = 0; for (let r = 0; r < 8; r++) if (pos.b[E.sqOf(f, r)] === (PAWN | side)) n++; return n; }
function isPassed(pos, s) { const p = pos.b[s], us = p & 8, f = E.fileOf(s), r = E.rowOf(s);
  for (let ff = Math.max(0, f - 1); ff <= Math.min(7, f + 1); ff++) for (let rr = 0; rr < 8; rr++) { if (us === WHITE ? rr >= r : rr <= r) continue; if (pos.b[E.sqOf(ff, rr)] === (PAWN | (us ^ 8))) return false; } return true; }
function passedSquares(pos, side) { const out = []; for (let s = 21; s < 99; s++) if (pos.b[s] === (PAWN | side) && isPassed(pos, s)) out.push(s); return out; }
function safeChecks(pos) { // side to move = opponent; count checking moves not losing the checker
  let n = 0; for (const m of pos.legalMoves()) { pos.make(m); const c = pos.inCheck(); pos.unmake(); if (c && E.see(pos, m) >= 0) n++; } return n;
}
function oppHasFork(pos) { // side to move = opponent
  for (const m of pos.legalMoves()) { const d = X.describeMove(pos, m); if (d.tags.some(t => t.startsWith('fork')) && E.see(pos, m) >= 0) return true; } return false;
}

function features2(pos, lastTo) {
  const base = X.ruleFeatures(pos, lastTo);
  const us = pos.side, them = us ^ 8, b = pos.b;
  const homeRow = us === WHITE ? 7 : 0, seventh = us === WHITE ? 1 : 6;
  const endgame = pos.phase <= 8;
  let devCount = 0; for (let f = 0; f < 8; f++) { const p = b[E.sqOf(f, homeRow)]; if (p === (KNIGHT | us) || p === (BISHOP | us)) devCount++; }
  const opening = devCount >= 2;
  const ek = pos.kingSq[them >> 3];
  const kzBefore = kingZoneAttacks(pos, us);
  const oppPassed = passedSquares(pos, them), myPassedBefore = passedSquares(pos, us).length;
  const hangMine = X.hangingPieces(pos, us).map(h => E.nameSq(h.sq));
  pos.makeNull(); const checksBefore = pos.inCheck() ? 0 : safeChecks(pos); pos.unmakeNull();
  // cheapest capturer per target square
  const lowestCap = {}; for (const x of base) { const m = x.move; if (E.mFlag(m) & E.F_CAP) { const v = VAL[b[E.mFrom(m)] & 7] || 10; const t = E.mTo(m); if (!(t in lowestCap) || v < lowestCap[t]) lowestCap[t] = v; } }
  let biggestVictim = 0; for (const x of base) { const m = x.move; if (E.mFlag(m) & E.F_CAP) biggestVictim = Math.max(biggestVictim, VAL[b[E.mTo(m)] & 7]); }
  const inCheck = pos.inCheck();
  for (const x of base) {
    const m = x.move, f = x.f, from = E.mFrom(m), to = E.mTo(m), pc = b[from], t = pc & 7, cap = b[to] & 7, isCap = !!(E.mFlag(m) & E.F_CAP);
    // split capGain by victim
    if (f.capGain) { const v = (E.mFlag(m) & E.F_EP) ? PAWN : cap; f['cap' + (v === PAWN ? 'Pawn' : v === ROOK ? 'Rook' : v === QUEEN ? 'Queen' : 'Minor')] = 1; }
    if (isCap && cap === QUEEN && t === QUEEN) f.tradeQueen = 1;
    if (isCap) { if (lowestCap[to] === (VAL[t] || 10)) f.captureLowest = 1; if (VAL[cap] === biggestVictim && biggestVictim >= 3) f.captureBiggest = 1; }
    if (lastTo && to !== lastTo && !isCap) { /* attackLastMoved below */ }
    if (inCheck && t !== KING && !isCap) f.blockCheck = 1;
    if (hangMine.includes(from)) f.escapeAttack = 1;
    // before-move geometry
    const mobBefore = t >= KNIGHT && t <= QUEEN ? 0 : 0;
    pos.make(m);
    // after move: our perspective = them to move
    const check = pos.inCheck();
    if (check) {
      // discovered / double check
      const att = attacksSq(pos, to); const direct = att.includes(ek);
      if (!direct) f.discCheck = 1; else { // double check if another piece also checks
        let others = 0; for (let s = 21; s < 99; s++) { const p = pos.b[s]; if (!p || p === OFF || (p & 8) !== us || s === to) continue; if (attacksSq(pos, s).includes(ek)) others++; } if (others) f.doubleCheck = 1; }
    }
    // discovered attack on big piece: slider behind `from` now sees an enemy piece >= rook
    for (const d of [...E.B_OFF, ...E.R_OFF]) {
      let y = from - d; while (pos.b[y] === 0) y -= d; const sl = pos.b[y];
      if (sl === OFF || !sl || (sl & 8) !== us) continue; const st = sl & 7; const diag = E.B_OFF.includes(d);
      if (!((st === QUEEN) || (st === BISHOP && diag) || (st === ROOK && !diag))) continue;
      let z = from + d; while (pos.b[z] === 0) z += d; const tg = pos.b[z]; if (z === to) continue;
      if (tg && tg !== OFF && (tg & 8) === them && (tg & 7) !== KING && VAL[tg & 7] >= 3 && VAL[tg & 7] > VAL[st] - 1) f.discAttack = 1;
    }
    // skewer
    if (t === BISHOP || t === ROOK || t === QUEEN) for (const d of (t === BISHOP ? E.B_OFF : t === ROOK ? E.R_OFF : E.K_OFF)) {
      let y = to + d; while (pos.b[y] === 0) y += d; const q1 = pos.b[y]; if (q1 === OFF || !q1 || (q1 & 8) !== them) continue;
      let z = y + d; while (pos.b[z] === 0) z += d; const q2 = pos.b[z]; if (q2 === OFF || !q2 || (q2 & 8) !== them) continue;
      if ((VAL[q1 & 7] > VAL[q2 & 7] || (q1 & 7) === KING) && (q2 & 7) !== PAWN) f.skewer = 1;
    }
    const att = attacksSq(pos, to);
    if (lastTo && att.includes(lastTo) && pos.b[lastTo] && (pos.b[lastTo] & 8) === them) f.attackLastMoved = 1;
    if (isCap) { /* removeDefender: captured piece defended another enemy piece that is now hanging */ }
    if (t === PAWN && att.some(s => { const q = pos.b[s]; return q && q !== OFF && (q & 8) === them && (q & 7) >= KNIGHT; })) f.pawnAttackPiece = 1;
    const kzAfter = kingZoneAttacks(pos, us); if (kzAfter > kzBefore) f.kingZone = kzAfter - kzBefore;
    if (t === QUEEN && near(to, ek) <= 2 && near(from, ek) > 2) f.queenNearKing = 1;
    // mate threat next move: pretend opponent passes
    if (!check) { pos.makeNull(); let mt = false; for (const mm of pos.legalMoves()) { pos.make(mm); const mate = pos.inCheck() && pos.legalMoves().length === 0; pos.unmake(); if (mate) { mt = true; break; } } pos.unmakeNull(); if (mt) f.mateThreat = 1; }
    // back rank: enemy king on its back rank with no luft and our rook/queen to that rank
    const ekRow = E.rowOf(ek), theirHome = them === WHITE ? 7 : 0;
    if ((t === ROOK || t === QUEEN) && ekRow === theirHome && E.rowOf(to) !== theirHome && att.some(s => E.rowOf(s) === theirHome)) f.backRankThreat = 1;
    // opponent opportunities after the move (them to move)
    if (!check) { const sc = safeChecks(pos); if (sc > checksBefore) f.allowChecks = sc - checksBefore; if (oppHasFork(pos)) f.allowFork = 1; }
    // removeDefender: after capture, any enemy piece now hanging that was not before
    if (isCap) { const hb = X.hangingPieces(pos, them).length; if (hb > 0) f.removeDefender = 1; }
    // pawn structure after move
    if (t === PAWN) {
      const ff = E.fileOf(to);
      if (pawnsOn(pos, us, ff) >= 2 && isCap) f.doubledCreate = 1;
      const isoNow = !pawnsOn(pos, us, ff - 1 >= 0 ? ff - 1 : 0) * (ff > 0) + 0;
      void isoNow;
      if (passedSquares(pos, us).length > myPassedBefore) f.passedCreate = 1;
      if (!endgame && near(to, ek) <= 3 && Math.abs(E.fileOf(to) - E.fileOf(ek)) <= 2) f.pawnStorm = 1;
    }
    // isolated: moving/capturing leaves a neighbour pawn isolated or this pawn isolated
    if (t === PAWN && isCap) { const ff = E.fileOf(to); const l = ff > 0 ? pawnsOn(pos, us, ff - 1) : 0, r = ff < 7 ? pawnsOn(pos, us, ff + 1) : 0; if (!l && !r) f.isolatedCreate = 1; }
    pos.unmake();
    // geometry-only rules
    if ((t === KNIGHT || t === BISHOP) && centerDist(to) < centerDist(from)) f.centralize = 1;
    if (t === KNIGHT) {
      if (E.fileOf(to) === 0 || E.fileOf(to) === 7) f.knightRim = 1;
      const enemyHalf = us === WHITE ? E.rowOf(to) <= 3 : E.rowOf(to) >= 4;
      if (enemyHalf) { let attackable = false; const dir = us === WHITE ? -1 : 1; // enemy pawns that could advance to attack `to`
        for (const df of [-1, 1]) { const ff = E.fileOf(to) + df; if (ff < 0 || ff > 7) continue; for (let r = 0; r < 8; r++) { if (b[E.sqOf(ff, r)] !== (PAWN | them)) continue; if (us === WHITE ? r < E.rowOf(to) : r > E.rowOf(to)) attackable = true; } }
        void dir; if (!attackable) f.outpost = 1; }
    }
    if (t === ROOK && E.fileOf(to) !== E.fileOf(from)) { const own = pawnsOn(pos, us, E.fileOf(to)), opp = pawnsOn(pos, them, E.fileOf(to)); if (!own && opp) f.rookSemiOpen = 1; }
    if ((t === ROOK || t === QUEEN) && E.rowOf(to) === seventh && E.rowOf(from) !== seventh) f.rook7th = 1;
    if (t === ROOK) { // connected after move?
      let other = 0; for (let s = 21; s < 99; s++) if (b[s] === (ROOK | us) && s !== from) other = s;
      if (other && E.rowOf(other) === E.rowOf(to) && E.rowOf(to) === homeRow) { let clear = true; const a = Math.min(E.fileOf(other), E.fileOf(to)), c = Math.max(E.fileOf(other), E.fileOf(to)); for (let ff = a + 1; ff < c; ff++) if (b[E.sqOf(ff, homeRow)] && E.sqOf(ff, homeRow) !== from) clear = false; if (clear) f.connectRooks = 1; }
      for (const ps of passedSquares(pos, us)) if (E.fileOf(ps) === E.fileOf(to) && (us === WHITE ? E.rowOf(to) > E.rowOf(ps) : E.rowOf(to) < E.rowOf(ps))) f.rookBehindPassed = 1;
    }
    if (t === BISHOP) { const onLong = (E.fileOf(to) === E.rowOf(to)) || (E.fileOf(to) + E.rowOf(to) === 7); if (onLong && !((E.fileOf(from) === E.rowOf(from)) || (E.fileOf(from) + E.rowOf(from) === 7))) f.longDiag = 1; }
    if (t === PAWN && opening && ['b2', 'g2', 'b7', 'g7'].includes(E.sqName(from)) && E.mTo(m) - from === (us === WHITE ? -10 : 10)) f.fianchetto = 1;
    if (opening && t >= KNIGHT && t <= QUEEN && E.rowOf(from) !== homeRow && !isCap && !hangMine.includes(from)) f.samePieceTwice = 1;
    if (t === KING && !(E.mFlag(m) & E.F_CASTLE) && (pos.castle & (us === WHITE ? 3 : 12))) f.loseCastle = 1;
    if (t === ROOK && (pos.castle & (us === WHITE ? 3 : 12)) && E.rowOf(from) === homeRow && (E.fileOf(from) === 0 || E.fileOf(from) === 7)) f.loseCastle = 1;
    if (endgame && t === KING) { for (const ps of [...passedSquares(pos, us), ...oppPassed]) if (near(to, ps) < near(from, ps)) { f.kingToPassed = 1; break; } }
    if (t !== PAWN && t !== KING) for (const ps of oppPassed) { const front = ps + (them === WHITE ? -10 : 10); if (to === front) f.blockPassed = 1; }
    if (lowestCap[to] !== undefined && !isCap) { /* nothing */ }
    // pinned piece move: piece on line between own king and enemy slider
    if (t !== KING) { pos.make(m); pos.unmake(); }
  }
  return base;
}


// ---- material-only quiescence: "saare captures gin kar dekho" ----
const QV = [0, 100, 320, 330, 500, 950, 0];
function matOf(pos, side) { let v = 0; for (let s = 21; s < 99; s++) { const p = pos.b[s]; if (p && p !== OFF) v += ((p & 8) === side ? 1 : -1) * QV[p & 7]; } return v; }
function qMat(pos, alpha, beta, depth, side) { // returns material from `side` perspective, side to move = pos.side
  const sgn = pos.side === side ? 1 : -1;
  const stand = sgn * matOf(pos, side);
  if (depth <= 0) return stand;
  if (stand >= beta) return stand; if (stand > alpha) alpha = stand;
  const buf = new Int32Array(256); const n = pos.gen(buf, 0, true);
  const caps = []; for (let i = 0; i < n; i++) caps.push([QV[pos.b[E.mTo(buf[i])] & 7] * 10 - QV[pos.b[E.mFrom(buf[i])] & 7] / 10, buf[i]]);
  caps.sort((a, b) => b[0] - a[0]);
  for (const [, m] of caps) { if (!pos.make(m)) continue; if (pos.legalMoves().length === 0 && pos.inCheck()) { pos.unmake(); return 30000; } const v = -qMat(pos, -beta, -alpha, depth - 1, side); pos.unmake(); if (v >= beta) return v; if (v > alpha) alpha = v; }
  return alpha;
}
function features3(pos, lastTo) {
  const F = features2(pos, lastTo); const us = pos.side; const before = matOf(pos, us);
  // opponent's capture threats if we pass (to know what we must fix)
  for (const x of F) {
    pos.make(x.move);
    let v;
    if (pos.inCheck() && pos.legalMoves().length === 0) v = 30000;
    else v = -qMat(pos, -1e9, 1e9, 6, us ^ 8); // opponent to move; material from opponent view -> negate
    pos.unmake();
    x.f.qGain = Math.max(-1500, Math.min(1500, v - before));
    if (x.f.qGain > 0) x.f.qWin = x.f.qGain; else if (x.f.qGain < 0) x.f.qLose = -x.f.qGain;
    x.f.sqL = sqMove(pos, x.move);
    const b0 = posVals(pos, us); pos.make(x.move); const b1 = posVals(pos, us); pos.unmake();
    x.f.pawnAdv = b1.pawn - b0.pawn; x.f.kCtr = b1.kc - b0.kc;
  }
  return F;
}
Q.qWin = 'Saare captures gin kar: is chaal se kitna material jeetta hoon?';
Q.qLose = 'Saare captures gin kar: is chaal se kitna material khota hoon?';

// ---- Training modes: rule cards (from the research) + calculation ranking ----
const CARDS = {
  4: { qWin: 8, qLose: -10, check: 67.13, pstDelta: 9 },
  8: { qWin: 8, qLose: -10, check: 67.13, threat: 55.38, pawnThreat: 32.67, captureLowest: 90, pstDelta: 9, allowMate: -6000 }
};
// Simple whole-number card (easy mental maths): pawn 10 (1-3-3-5-9 x10, same for win and loss), check +3,
// threat +2, pawn threat +1, cheapest capture +2, better square +1/+2/+3 (worse -1/-2/-3), mate allowed -100
// "Behtar square" thumb-rule map (level per square; points = new level - old level, max +-3).
// r = rank from the mover's side (1..8), f = file 0..7 (a..h). Endgame = phase (Q4 R2 B/N1, start 24) <= 12.
function sqLevel(t, f, r, eg) {
  const ctr = f >= 2 && f <= 5 && r >= 3 && r <= 6, edge = f === 0 || f === 7 || r === 1 || r === 8, corner = (f === 0 || f === 7) && (r === 1 || r === 8);
  switch (t) {
    case PAWN: return r === 7 ? 3 : r === 6 ? 2 : r === 5 ? 1 : 0;
    case KNIGHT: return corner ? -2 : edge ? -1 : (!eg && r === 6) ? 2 : ctr ? 1 : 0;
    case BISHOP: return (r === 1 || r === 8) ? -1 : (ctr || (!eg && f >= 1 && f <= 6)) ? 1 : 0;
    case ROOK: return eg ? 0 : r === 7 ? 2 : (r === 6 || r === 8) ? 1 : 0;
    case QUEEN: return eg ? (r <= 2 ? -1 : ctr ? 1 : 0) : (r >= 6 ? 1 : 0);
    case KING: return eg ? (ctr ? 1 : edge ? -1 : 0) : (r === 1 ? [1, 1, 1, -1, 0, 0, 1, 1][f] : -2);
  }
  return 0;
}
// 6-rule card helpers: pawn levels (mine - his) and "king on c-f file in the middlegame" (mine - his)
function posVals(pos, me) {
  const eg = pos.phase <= 12; let pawn = 0, kc = 0;
  for (let s = 21; s < 99; s++) { const p = pos.b[s]; if (!p || p === OFF) continue; const t = p & 7, c = p & 8, sg = c === me ? 1 : -1;
    const w = c === WHITE, f = E.fileOf(s), r = w ? 8 - E.rowOf(s) : E.rowOf(s) + 1;
    if (t === PAWN) pawn += sg * sqLevel(PAWN, f, r, eg);
    else if (t === KING && !eg && f >= 2 && f <= 5) kc += sg; }
  return { pawn, kc };
}
function sqMove(pos, m) {
  if (E.mPromo(m)) return 3; if (E.mFlag(m) & E.F_CASTLE) return 2;
  const from = E.mFrom(m), to = E.mTo(m), t = pos.b[from] & 7, w = pos.side === WHITE, eg = pos.phase <= 12;
  const L = s => { const f = E.fileOf(s), r = w ? 8 - E.rowOf(s) : E.rowOf(s) + 1; return sqLevel(t, f, r, eg); };
  return Math.max(-3, Math.min(3, L(to) - L(from)));
}
function sqPts(d) { return d >= 8 ? 3 : d >= 4 ? 2 : d >= 1 ? 1 : d <= -8 ? -3 : d <= -4 ? -2 : d <= -1 ? -1 : 0; }
function simplePts(f, n) { let s = 0; const why = []; const add = (k, v) => { if (v) { s += v; why.push([k, v]); } };
  const p = Math.round((f.qGain || 0) / 100); add(p > 0 ? 'qWin' : 'qLose', p * 10);
  add('check', (f.check || f.mate) ? 3 : 0);
  if (n === 6) { add('threat', f.threat ? 1 : 0); add('allowMate', f.allowMate ? -100 : 0); add('pawnAdv', (f.pawnAdv || 0) * 6); add('kCtr', (f.kCtr || 0) * -6); return { pts: s, why }; }
  if (n === 4) { add('threat', f.threat ? 2 : 0); add('allowMate', f.allowMate ? -100 : 0); return { pts: s, why }; }
  if (n === 8) { add('threat', f.threat ? 2 : 0); add('pawnThreat', f.pawnThreat ? 1 : 0); add('captureLowest', f.captureLowest ? 2 : 0); add('allowMate', f.allowMate ? -100 : 0); }
  add('pstDelta', f.sqL !== undefined ? f.sqL : sqPts(f.pstDelta || 0)); return { pts: s, why }; }
function cardPoints(f, W) { return simplePts(f, W === CARDS[4] ? 4 : W === 6 ? 6 : 8); }
// opts: { best (uci, optional), rules: 0|4|8, K, depth: 1..4 }
function modeData(pos, S, opts) {
  const F = features3(pos, 0);
  const moves = F.map(x => {
    const c4 = cardPoints(x.f, CARDS[4]), c8 = cardPoints(x.f, CARDS[8]), c6 = simplePts(x.f, 6);
    return { m: x.move, uci: pos.uci(x.move), san: pos.san(x.move), p4: c4.pts, w4: c4.why, p8: c8.pts, w8: c8.why, p6: c6.pts, w6: c6.why, q: x.f.qGain || 0, ps: x.f.pstDelta || 0 };
  });
  // "engine jaisi chaal": every move searched to depth 6, good = within 30cp of the best
  for (const mv of moves) mv.lab = S.go(pos, { depth: 6, time: 150, moves: [mv.m] }).score;
  const mx = Math.max(...moves.map(m => m.lab));
  let best = opts.best && moves.some(m => m.uci === opts.best) ? opts.best : moves.reduce((a, b) => (b.lab > a.lab ? b : a)).uci;
  for (const mv of moves) mv.good = mv.uci === best || mv.lab >= mx - 30;
  // rule ranking
  const key = opts.rules === 4 ? 'p4' : opts.rules === 6 ? 'p6' : 'p8';
  const ranked = moves.slice().sort((a, b) => b[key] - a[key] || b.ps - a.ps);
  ranked.forEach((mv, i) => { mv.rank = i + 1; });
  // calculation (only for the moves that the mode calculates)
  const calc = [];
  if (opts.depth) {
    const list = opts.rules ? ranked.slice(0, opts.K) : moves;
    for (const mv of list) {
      const r = S.go(pos, { depth: opts.depth, time: 5000, moves: [mv.m] });
      calc.push({ uci: mv.uci, san: mv.san, score: r.score, line: X.sanLine(pos, (r.pv || []).slice(0, opts.depth + 2)) });
    }
    calc.sort((a, b) => b.score - a.score);
  }
  const strip = mv => ({ uci: mv.uci, san: mv.san, p4: mv.p4, w4: mv.w4, p8: mv.p8, w8: mv.w8, p6: mv.p6, w6: mv.w6, q: mv.q, lab: mv.lab, good: mv.good, rank: mv.rank });
  return { best, bestSan: moves.find(m => m.uci === best).san, moves: ranked.map(strip), calc, n: moves.length };
}
const api = { features2, features3, Q, CARDS, modeData, simplePts, sqPts, sqLevel, sqMove };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
root.MERules = api;
})(typeof self !== 'undefined' ? self : this);
