/* Mind's Eye explainable chess engine ("ME Engine").
 * Plain JavaScript, no dependencies. Runs in a Web Worker in the browser or in Node.
 * Search: iterative deepening, PVS alpha-beta, aspiration windows, transposition table,
 * null move, reverse futility, futility, LMR, late move pruning, killers, history,
 * check extension, quiescence with SEE.
 * Eval: tapered PeSTO piece-square tables + pawn structure, passed pawns, mobility,
 * king safety, bishop pair, rooks on open files. Every eval term can be reported
 * separately so the explanation layer can say WHY a position is better.
 */
(function (root) {
'use strict';

const PAWN = 1, KNIGHT = 2, BISHOP = 3, ROOK = 4, QUEEN = 5, KING = 6;
const WHITE = 0, BLACK = 8, OFF = 7;
const MATE = 30000, MATE_BOUND = 29000, INF = 32000;
const NAMES = ' pnbrqk';
const SEEVAL = [0, 100, 320, 330, 500, 950, 20000];

// 10x12 mailbox: sq = 21 + file + 10*row, row 0 = rank 8.
const sqOf = (f, r) => 21 + f + 10 * r;          // r = row from top
const FILE_T = new Int8Array(120), ROW_T = new Int8Array(120); for (let s = 0; s < 120; s++) { FILE_T[s] = (s % 10) - 1; ROW_T[s] = ((s / 10) | 0) - 2; }
const fileOf = s => FILE_T[s];
const rowOf = s => ROW_T[s];
const sqName = s => 'abcdefgh'[fileOf(s)] + (8 - rowOf(s));
const nameSq = n => sqOf(n.charCodeAt(0) - 97, 8 - (+n[1]));
const idx64 = s => rowOf(s) * 8 + fileOf(s);

const N_OFF = [-21, -19, -12, -8, 8, 12, 19, 21];
const K_OFF = [-11, -10, -9, -1, 1, 9, 10, 11];
const B_OFF = [-11, -9, 9, 11];
const R_OFF = [-10, -1, 1, 10];

// ---------- PeSTO tables (a8..h8 first) ----------
const MGV = [0, 82, 337, 365, 477, 1025, 0], EGV = [0, 94, 281, 297, 512, 936, 0];
const PHASEW = [0, 0, 1, 1, 2, 4, 0];
const MGT = [null,
[0,0,0,0,0,0,0,0,98,134,61,95,68,126,34,-11,-6,7,26,31,65,56,25,-20,-14,13,6,21,23,12,17,-23,-27,-2,-5,12,17,6,10,-25,-26,-4,-4,-10,3,3,33,-12,-35,-1,-20,-23,-15,24,38,-22,0,0,0,0,0,0,0,0],
[-167,-89,-34,-49,61,-97,-15,-107,-73,-41,72,36,23,62,7,-17,-47,60,37,65,84,129,73,44,-9,17,19,53,37,69,18,22,-13,4,16,13,28,19,21,-8,-23,-9,12,10,19,17,25,-16,-29,-53,-12,-3,-1,18,-14,-19,-105,-21,-58,-33,-17,-28,-19,-23],
[-29,4,-82,-37,-25,-42,7,-8,-26,16,-18,-13,30,59,18,-47,-16,37,43,40,35,50,37,-2,-4,5,19,50,37,37,7,-2,-6,13,13,26,34,12,10,4,0,15,15,15,14,27,18,10,4,15,16,0,7,21,33,1,-33,-3,-14,-21,-13,-12,-39,-21],
[32,42,32,51,63,9,31,43,27,32,58,62,80,67,26,44,-5,19,26,36,17,45,61,16,-24,-11,7,26,24,35,-8,-20,-36,-26,-12,-1,9,-7,6,-23,-45,-25,-16,-17,3,0,-5,-33,-44,-16,-20,-9,-1,11,-6,-71,-19,-13,1,17,16,7,-37,-26],
[-28,0,29,12,59,44,43,45,-24,-39,-5,1,-16,57,28,54,-13,-17,7,8,29,56,47,57,-27,-27,-16,-16,-1,17,-2,1,-9,-26,-9,-10,-2,-4,3,-3,-14,2,-11,-2,-5,2,14,5,-35,-8,11,2,8,15,-3,1,-1,-18,-9,10,-15,-25,-31,-50],
[-65,23,16,-15,-56,-34,2,13,29,-1,-20,-7,-8,-4,-38,-29,-9,24,2,-16,-20,6,22,-22,-17,-20,-12,-27,-30,-25,-14,-36,-49,-1,-27,-39,-46,-44,-33,-51,-14,-14,-22,-46,-44,-30,-15,-27,1,7,-8,-64,-43,-16,9,8,-15,36,12,-54,8,-28,24,14]];
const EGT = [null,
[0,0,0,0,0,0,0,0,178,173,158,134,147,132,165,187,94,100,85,67,56,53,82,84,32,24,13,5,-2,4,17,17,13,9,-3,-7,-7,-8,3,-1,4,7,-6,1,0,-5,-1,-8,13,8,8,10,13,0,2,-7,0,0,0,0,0,0,0,0],
[-58,-38,-13,-28,-31,-27,-63,-99,-25,-8,-25,-2,-9,-25,-24,-52,-24,-20,10,9,-1,-9,-19,-41,-17,3,22,22,22,11,8,-18,-18,-6,16,25,16,17,4,-18,-23,-3,-1,15,10,-3,-20,-22,-42,-20,-10,-5,-2,-20,-23,-44,-29,-51,-23,-15,-22,-18,-50,-64],
[-14,-21,-11,-8,-7,-9,-17,-24,-8,-4,7,-12,-3,-13,-4,-14,2,-8,0,-1,-2,6,0,4,-3,9,12,9,14,10,3,2,-6,3,13,19,7,10,-3,-9,-12,-3,8,10,13,3,-7,-15,-14,-18,-7,-1,4,-9,-15,-27,-23,-9,-23,-5,-9,-16,-5,-17],
[13,10,18,15,12,12,8,5,11,13,13,11,-3,3,8,3,7,7,7,5,4,-3,-5,-3,4,3,13,1,2,1,-1,2,3,5,8,4,-5,-6,-8,-11,-4,0,-5,-1,-7,-12,-8,-16,-6,-6,0,2,-9,-9,-11,-3,-9,2,3,-1,-5,-13,4,-20],
[-9,22,22,27,27,19,10,20,-17,20,32,41,58,25,30,0,-20,6,9,49,47,35,19,9,3,22,24,45,57,40,57,36,-18,28,19,47,31,34,39,23,-16,-27,15,6,9,17,10,5,-22,-23,-30,-16,-16,-23,-36,-32,-33,-28,-22,-43,-5,-32,-20,-41],
[-74,-35,-18,-18,-11,15,4,-17,-12,17,14,17,17,38,23,11,10,17,23,15,20,45,44,13,-8,22,24,27,26,33,26,3,-18,-4,21,24,27,23,9,-11,-19,-3,11,21,23,16,7,-9,-27,-11,4,13,14,4,-5,-17,-53,-34,-21,-11,-28,-14,-24,-43]];

// Combined PST indexed [piece code 0..15][sq 0..119] -> mg, eg (from white's view, sign applied)
const PST_MG = [], PST_EG = [];
for (let p = 0; p < 16; p++) { PST_MG.push(new Int16Array(120)); PST_EG.push(new Int16Array(120)); }
for (let t = 1; t <= 6; t++) for (let r = 0; r < 8; r++) for (let f = 0; f < 8; f++) {
  const s = sqOf(f, r);
  PST_MG[t][s] = MGV[t] + MGT[t][r * 8 + f];
  PST_EG[t][s] = EGV[t] + EGT[t][r * 8 + f];
  PST_MG[t | 8][s] = -(MGV[t] + MGT[t][(7 - r) * 8 + f]);
  PST_EG[t | 8][s] = -(EGV[t] + EGT[t][(7 - r) * 8 + f]);
}

// ---------- Zobrist (two 32-bit halves) ----------
let seed = 0x9E3779B9 | 0;
function rnd() { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; return seed | 0; }
const ZL = [], ZH = [];
for (let p = 0; p < 16; p++) { ZL.push(new Int32Array(120)); ZH.push(new Int32Array(120)); for (let s = 0; s < 120; s++) { ZL[p][s] = rnd(); ZH[p][s] = rnd(); } }
const ZSL = rnd(), ZSH = rnd();
const ZCL = new Int32Array(16), ZCH = new Int32Array(16);
for (let i = 0; i < 16; i++) { ZCL[i] = rnd(); ZCH[i] = rnd(); }
const ZEL = new Int32Array(120), ZEH = new Int32Array(120);
for (let s = 0; s < 120; s++) { ZEL[s] = rnd(); ZEH[s] = rnd(); }

// castle-right masks
const CMASK = new Uint8Array(120).fill(15);
CMASK[nameSq('e1')] = 15 & ~3; CMASK[nameSq('h1')] = 15 & ~1; CMASK[nameSq('a1')] = 15 & ~2;
CMASK[nameSq('e8')] = 15 & ~12; CMASK[nameSq('h8')] = 15 & ~4; CMASK[nameSq('a8')] = 15 & ~8;

// Move encoding
const F_CAP = 1, F_EP = 2, F_CASTLE = 4, F_DOUBLE = 8;
const mFrom = m => m & 127, mTo = m => (m >> 7) & 127, mPromo = m => (m >> 14) & 7, mFlag = m => (m >> 17) & 15;
const mk = (f, t, pr, fl) => f | (t << 7) | (pr << 14) | (fl << 17);

const MAXPLY = 128;

class Position {
  constructor(fen) {
    this.b = new Int8Array(120);
    this.stack = []; // undo records
    this.hist = [];  // hash history (lo) for repetition
    this.setFen(fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  }
  setFen(fen) {
    const b = this.b; b.fill(OFF);
    for (let r = 0; r < 8; r++) for (let f = 0; f < 8; f++) b[sqOf(f, r)] = 0;
    const parts = fen.trim().split(/\s+/);
    let r = 0, f = 0;
    for (const ch of parts[0]) {
      if (ch === '/') { r++; f = 0; continue; }
      if (ch >= '1' && ch <= '8') { f += +ch; continue; }
      const t = NAMES.indexOf(ch.toLowerCase());
      b[sqOf(f, r)] = t | (ch === ch.toLowerCase() ? BLACK : WHITE); f++;
    }
    this.side = parts[1] === 'b' ? BLACK : WHITE;
    const c = parts[2] || '-'; this.castle = (c.includes('K') ? 1 : 0) | (c.includes('Q') ? 2 : 0) | (c.includes('k') ? 4 : 0) | (c.includes('q') ? 8 : 0);
    this.ep = (parts[3] && parts[3] !== '-') ? nameSq(parts[3]) : 0;
    this.half = parseInt(parts[4] || '0', 10) || 0;
    this.fullmove = parseInt(parts[5] || '1', 10) || 1;
    this.stack.length = 0; this.hist.length = 0;
    this.recompute();
  }
  recompute() {
    let hl = 0, hh = 0, mg = 0, eg = 0, ph = 0;
    this.kingSq = [0, 0];
    for (let s = 21; s < 99; s++) {
      const p = this.b[s]; if (p === 0 || p === OFF) continue;
      hl ^= ZL[p][s]; hh ^= ZH[p][s]; mg += PST_MG[p][s]; eg += PST_EG[p][s]; ph += PHASEW[p & 7];
      if ((p & 7) === KING) this.kingSq[p >> 3] = s;
    }
    if (this.side === BLACK) { hl ^= ZSL; hh ^= ZSH; }
    hl ^= ZCL[this.castle]; hh ^= ZCH[this.castle];
    if (this.ep) { hl ^= ZEL[this.ep]; hh ^= ZEH[this.ep]; }
    this.hl = hl; this.hh = hh; this.mg = mg; this.eg = eg; this.phase = ph;
  }
  fen() {
    let out = '';
    for (let r = 0; r < 8; r++) {
      let e = 0;
      for (let f = 0; f < 8; f++) {
        const p = this.b[sqOf(f, r)];
        if (!p) { e++; continue; }
        if (e) { out += e; e = 0; }
        const ch = NAMES[p & 7]; out += (p & 8) ? ch : ch.toUpperCase();
      }
      if (e) out += e; if (r < 7) out += '/';
    }
    let c = (this.castle & 1 ? 'K' : '') + (this.castle & 2 ? 'Q' : '') + (this.castle & 4 ? 'k' : '') + (this.castle & 8 ? 'q' : '');
    return out + ' ' + (this.side ? 'b' : 'w') + ' ' + (c || '-') + ' ' + (this.ep ? sqName(this.ep) : '-') + ' ' + this.half + ' ' + this.fullmove;
  }

  attacked(s, by) { // is square s attacked by color `by` (0 or 8)
    const b = this.b;
    if (by === WHITE) { if (b[s + 9] === PAWN || b[s + 11] === PAWN) return true; }
    else { if (b[s - 9] === (PAWN | 8) || b[s - 11] === (PAWN | 8)) return true; }
    const n = KNIGHT | by, k = KING | by, bq = BISHOP | by, rq = ROOK | by, q = QUEEN | by;
    for (let i = 0; i < 8; i++) { if (b[s + N_OFF[i]] === n) return true; if (b[s + K_OFF[i]] === k) return true; }
    for (let i = 0; i < 4; i++) {
      let d = B_OFF[i], t = s + d, p;
      while ((p = b[t]) === 0) t += d;
      if (p === bq || p === q) return true;
      d = R_OFF[i]; t = s + d;
      while ((p = b[t]) === 0) t += d;
      if (p === rq || p === q) return true;
    }
    return false;
  }
  inCheck(side = this.side) { return this.attacked(this.kingSq[side >> 3], side ^ 8); }

  // Pseudo-legal generation into array `out` starting at n; returns new n. capsOnly for qsearch.
  gen(out, n, capsOnly) {
    const b = this.b, us = this.side, them = us ^ 8;
    const fwd = us === WHITE ? -10 : 10;
    const startRow = us === WHITE ? 6 : 1, promoRow = us === WHITE ? 0 : 7;
    for (let s = 21; s < 99; s++) {
      const p = b[s]; if (p === 0 || p === OFF || (p & 8) !== us) continue;
      const t = p & 7;
      if (t === PAWN) {
        const one = s + fwd;
        const promo = rowOf(one) === promoRow;
        if (b[one] === 0) {
          if (promo) { for (let pr = QUEEN; pr >= KNIGHT; pr--) out[n++] = mk(s, one, pr, 0); }
          else if (!capsOnly) {
            out[n++] = mk(s, one, 0, 0);
            if (rowOf(s) === startRow && b[one + fwd] === 0) out[n++] = mk(s, one + fwd, 0, F_DOUBLE);
          }
        }
        for (let k = 0; k < 2; k++) {
          const to = s + fwd - 1 + 2 * k, q = b[to];
          if (q !== 0 && q !== OFF && (q & 8) === them) {
            if (promo) { for (let pr = QUEEN; pr >= KNIGHT; pr--) out[n++] = mk(s, to, pr, F_CAP); }
            else out[n++] = mk(s, to, 0, F_CAP);
          } else if (to === this.ep && this.ep) out[n++] = mk(s, to, 0, F_CAP | F_EP);
        }
        continue;
      }
      if (t === KNIGHT || t === KING) {
        const offs = t === KNIGHT ? N_OFF : K_OFF;
        for (let i = 0; i < 8; i++) {
          const to = s + offs[i], q = b[to];
          if (q === 0) { if (!capsOnly) out[n++] = mk(s, to, 0, 0); }
          else if (q !== OFF && (q & 8) === them) out[n++] = mk(s, to, 0, F_CAP);
        }
        if (t === KING && !capsOnly) {
          if (us === WHITE && s === 95) {
            if ((this.castle & 1) && b[96] === 0 && b[97] === 0 && b[98] === ROOK && !this.attacked(95, BLACK) && !this.attacked(96, BLACK) && !this.attacked(97, BLACK)) out[n++] = mk(95, 97, 0, F_CASTLE);
            if ((this.castle & 2) && b[94] === 0 && b[93] === 0 && b[92] === 0 && b[91] === ROOK && !this.attacked(95, BLACK) && !this.attacked(94, BLACK) && !this.attacked(93, BLACK)) out[n++] = mk(95, 93, 0, F_CASTLE);
          } else if (us === BLACK && s === 25) {
            if ((this.castle & 4) && b[26] === 0 && b[27] === 0 && b[28] === (ROOK | 8) && !this.attacked(25, WHITE) && !this.attacked(26, WHITE) && !this.attacked(27, WHITE)) out[n++] = mk(25, 27, 0, F_CASTLE);
            if ((this.castle & 8) && b[24] === 0 && b[23] === 0 && b[22] === 0 && b[21] === (ROOK | 8) && !this.attacked(25, WHITE) && !this.attacked(24, WHITE) && !this.attacked(23, WHITE)) out[n++] = mk(25, 23, 0, F_CASTLE);
          }
        }
        continue;
      }
      const dirs = t === BISHOP ? B_OFF : t === ROOK ? R_OFF : K_OFF;
      for (let i = 0; i < dirs.length; i++) {
        const d = dirs[i]; let to = s + d, q;
        while ((q = b[to]) === 0) { if (!capsOnly) out[n++] = mk(s, to, 0, 0); to += d; }
        if (q !== OFF && (q & 8) === them) out[n++] = mk(s, to, 0, F_CAP);
      }
    }
    return n;
  }

  _put(s, p) { this.b[s] = p; this.hl ^= ZL[p][s]; this.hh ^= ZH[p][s]; this.mg += PST_MG[p][s]; this.eg += PST_EG[p][s]; }
  _del(s) { const p = this.b[s]; this.b[s] = 0; this.hl ^= ZL[p][s]; this.hh ^= ZH[p][s]; this.mg -= PST_MG[p][s]; this.eg -= PST_EG[p][s]; return p; }

  // returns false (and undoes) if illegal
  make(m) {
    const from = mFrom(m), to = mTo(m), fl = mFlag(m), pr = mPromo(m);
    const b = this.b, us = this.side;
    this.stack.push(m, this.castle, this.ep, this.half, this.hl, this.hh, this.mg, this.eg, this.phase, 0);
    const si = this.stack.length - 1;
    this.hist.push(this.hl);
    let cap = 0;
    if (this.ep) { this.hl ^= ZEL[this.ep]; this.hh ^= ZEH[this.ep]; }
    if (fl & F_EP) { const cs = to + (us === WHITE ? 10 : -10); cap = this._del(cs); }
    else if (b[to]) { cap = this._del(to); }
    if (cap) this.phase -= PHASEW[cap & 7];
    this.stack[si] = cap;
    const p = this._del(from);
    if (pr) { this._put(to, pr | us); this.phase += PHASEW[pr]; } else this._put(to, p);
    if ((p & 7) === KING) this.kingSq[us >> 3] = to;
    if (fl & F_CASTLE) {
      if (to === 97) this._put(96, this._del(98));
      else if (to === 93) this._put(94, this._del(91));
      else if (to === 27) this._put(26, this._del(28));
      else if (to === 23) this._put(24, this._del(21));
    }
    this.hl ^= ZCL[this.castle]; this.hh ^= ZCH[this.castle];
    this.castle &= CMASK[from] & CMASK[to];
    this.hl ^= ZCL[this.castle]; this.hh ^= ZCH[this.castle];
    this.ep = 0;
    if (fl & F_DOUBLE) { this.ep = (from + to) >> 1; this.hl ^= ZEL[this.ep]; this.hh ^= ZEH[this.ep]; }
    this.half = ((p & 7) === PAWN || cap) ? 0 : this.half + 1;
    this.side ^= 8; this.hl ^= ZSL; this.hh ^= ZSH;
    if (us === BLACK) this.fullmove++;
    if (this.attacked(this.kingSq[us >> 3], this.side)) { this.unmake(); return false; }
    return true;
  }
  unmake() {
    const st = this.stack, b = this.b;
    const cap = st.pop(); this.phase = st.pop(); this.eg = st.pop(); this.mg = st.pop(); this.hh = st.pop(); this.hl = st.pop();
    this.half = st.pop(); this.ep = st.pop(); this.castle = st.pop(); const m = st.pop();
    this.hist.pop();
    this.side ^= 8;
    const from = mFrom(m), to = mTo(m), fl = mFlag(m), us = this.side;
    if (us === BLACK) this.fullmove--;
    let p = b[to]; if (mPromo(m)) p = PAWN | us;
    b[from] = p; b[to] = 0;
    if ((p & 7) === KING) this.kingSq[us >> 3] = from;
    if (fl & F_EP) b[to + (us === WHITE ? 10 : -10)] = cap; else if (cap) b[to] = cap;
    if (fl & F_CASTLE) {
      if (to === 97) { b[98] = b[96]; b[96] = 0; } else if (to === 93) { b[91] = b[94]; b[94] = 0; }
      else if (to === 27) { b[28] = b[26]; b[26] = 0; } else if (to === 23) { b[21] = b[24]; b[24] = 0; }
    }
  }
  makeNull() {
    this.stack.push(0, this.castle, this.ep, this.half, this.hl, this.hh, this.mg, this.eg, this.phase, 0);
    this.hist.push(this.hl);
    if (this.ep) { this.hl ^= ZEL[this.ep]; this.hh ^= ZEH[this.ep]; this.ep = 0; }
    this.side ^= 8; this.hl ^= ZSL; this.hh ^= ZSH; this.half++;
  }
  unmakeNull() {
    const st = this.stack; st.pop(); this.phase = st.pop(); this.eg = st.pop(); this.mg = st.pop(); this.hh = st.pop(); this.hl = st.pop();
    this.half = st.pop(); this.ep = st.pop(); this.castle = st.pop(); st.pop(); this.hist.pop(); this.side ^= 8;
  }
  legalMoves() {
    const buf = new Int32Array(256); const n = this.gen(buf, 0, false); const res = [];
    for (let i = 0; i < n; i++) if (this.make(buf[i])) { this.unmake(); res.push(buf[i]); }
    return res;
  }
  isRepetition() {
    const h = this.hist, n = h.length, lim = Math.max(0, n - this.half);
    for (let i = n - 2; i >= lim; i -= 2) if (h[i] === this.hl) return true;
    return false;
  }
  insufficient() {
    let minors = 0;
    for (let s = 21; s < 99; s++) { const t = this.b[s] & 7; if (this.b[s] === OFF || !t) continue; if (t === PAWN || t === ROOK || t === QUEEN) return false; if (t === KNIGHT || t === BISHOP) minors++; }
    return minors <= 1;
  }
  nonPawnMat(side) { for (let s = 21; s < 99; s++) { const p = this.b[s]; if (p !== OFF && p && (p & 8) === side) { const t = p & 7; if (t >= KNIGHT && t <= QUEEN) return true; } } return false; }

  // ---------- notation ----------
  uci(m) { return sqName(mFrom(m)) + sqName(mTo(m)) + (mPromo(m) ? NAMES[mPromo(m)] : ''); }
  parseUci(u) { for (const m of this.legalMoves()) if (this.uci(m) === u) return m; return 0; }
  san(m) {
    const from = mFrom(m), to = mTo(m), p = this.b[from], t = p & 7, fl = mFlag(m);
    let s;
    if (fl & F_CASTLE) s = (fileOf(to) === 6) ? 'O-O' : 'O-O-O';
    else {
      const cap = (fl & F_CAP);
      if (t === PAWN) { s = (cap ? 'abcdefgh'[fileOf(from)] + 'x' : '') + sqName(to) + (mPromo(m) ? '=' + NAMES[mPromo(m)].toUpperCase() : ''); }
      else {
        s = NAMES[t].toUpperCase();
        const others = this.legalMoves().filter(o => o !== m && mTo(o) === to && this.b[mFrom(o)] === p);
        if (others.length) {
          const sf = others.some(o => fileOf(mFrom(o)) === fileOf(from)), sr = others.some(o => rowOf(mFrom(o)) === rowOf(from));
          if (!sf) s += 'abcdefgh'[fileOf(from)]; else if (!sr) s += (8 - rowOf(from)); else s += sqName(from);
        }
        s += (cap ? 'x' : '') + sqName(to);
      }
    }
    this.make(m);
    if (this.inCheck()) s += this.legalMoves().length ? '+' : '#';
    this.unmake();
    return s;
  }
  parseSan(san) {
    const clean = x => x.replace(/[+#!?]/g, '').replace(/0/g, 'O');
    const c = clean(san);
    for (const m of this.legalMoves()) if (clean(this.san(m)) === c) return m;
    return 0;
  }
  pieceAt(name) { return this.b[nameSq(name)]; }
}

// ---------- SEE ----------
function leastAttacker(pos, s, side) { // returns square or 0
  const b = pos.b;
  if (side === WHITE) { if (b[s + 9] === PAWN) return s + 9; if (b[s + 11] === PAWN) return s + 11; }
  else { if (b[s - 9] === (PAWN | 8)) return s - 9; if (b[s - 11] === (PAWN | 8)) return s - 11; }
  for (let i = 0; i < 8; i++) if (b[s + N_OFF[i]] === (KNIGHT | side)) return s + N_OFF[i];
  let bq = 0, rq = 0, qq = 0, rr = 0;
  for (let i = 0; i < 4; i++) {
    let d = B_OFF[i], t = s + d, p; while ((p = b[t]) === 0) t += d;
    if (p === (BISHOP | side)) return t; if (p === (QUEEN | side)) qq = t;
    d = R_OFF[i]; t = s + d; while ((p = b[t]) === 0) t += d;
    if (p === (ROOK | side)) rr = t; else if (p === (QUEEN | side)) qq = t;
  }
  if (rr) return rr; if (qq) return qq;
  for (let i = 0; i < 8; i++) if (b[s + K_OFF[i]] === (KING | side)) return s + K_OFF[i];
  return 0;
}
// Static exchange evaluation of move m for side to move (in centipawn-ish values)
const SEE_GAIN = new Int32Array(40), SEE_RS = new Int32Array(40), SEE_RP = new Int32Array(40);
function see(pos, m) {
  const b = pos.b, from = mFrom(m), to = mTo(m);
  if (mFlag(m) & F_CASTLE) return 0;
  const gain = SEE_GAIN; const remS = SEE_RS, remP = SEE_RP; let nr = 0;
  let d = 0, side = pos.side;
  let captured = (mFlag(m) & F_EP) ? PAWN : (b[to] & 7);
  gain[0] = SEEVAL[captured];
  let attackerVal = mPromo(m) ? SEEVAL[mPromo(m)] : SEEVAL[b[from] & 7];
  if (mPromo(m)) gain[0] += SEEVAL[mPromo(m)] - 100;
  const saveTo = b[to];
  remS[nr] = from; remP[nr++] = b[from]; b[from] = 0;
  let epSq = 0; if (mFlag(m) & F_EP) { epSq = to + (side === WHITE ? 10 : -10); remS[nr] = epSq; remP[nr++] = b[epSq]; b[epSq] = 0; }
  side ^= 8;
  while (true) {
    const a = leastAttacker(pos, to, side);
    if (!a) break;
    d++;
    gain[d] = attackerVal - gain[d - 1];
    if (Math.max(-gain[d - 1], gain[d]) < 0) break;
    attackerVal = SEEVAL[b[a] & 7];
    remS[nr] = a; remP[nr++] = b[a]; b[a] = 0;
    side ^= 8;
    if (d >= 30) break;
  }
  while (d > 0) { gain[d - 1] = -Math.max(-gain[d - 1], gain[d]); d--; }
  for (let i = nr - 1; i >= 0; i--) b[remS[i]] = remP[i];
  b[to] = saveTo;
  return gain[0];
}

// ---------- Evaluation ----------
const PASSED_MG = [0, 5, 10, 15, 30, 55, 90, 0], PASSED_EG = [0, 10, 18, 30, 55, 95, 150, 0]; // by relative rank (1..6 from own side)
const MOB_MG = [0, 0, 4, 4, 2, 1, 0], MOB_EG = [0, 0, 4, 5, 4, 2, 0];
const KS_W = [0, 0, 20, 20, 40, 80, 0]; // king zone attack weight per piece
const fileMask = new Int8Array(10);

// Returns score from side-to-move perspective. If `terms` object given, fills a breakdown (white perspective, centipawns).
const EV_WP = new Int8Array(10), EV_BP = new Int8Array(10), EV_WMIN = new Int8Array(10), EV_BMAX = new Int8Array(10), EV_WMAX = new Int8Array(10), EV_BMIN = new Int8Array(10);
const kdist = (a, c) => Math.max(Math.abs(fileOf(a) - fileOf(c)), Math.abs(rowOf(a) - rowOf(c)));
const KZONE = new Uint8Array(241); for (const d of [-11, -10, -9, -1, 0, 1, 9, 10, 11]) KZONE[d + 120] = 1;
function evaluate(pos, terms) {
  const b = pos.b;
  let mg = pos.mg, eg = pos.eg;
  const ph = Math.min(pos.phase, 24);
  // pawn files
  const wp = EV_WP.fill(0), bp = EV_BP.fill(0); // counts per file (index file+1)
  const wpMinRow = EV_WMIN.fill(9), bpMaxRow = EV_BMAX.fill(-1); // most advanced pawns
  const wpMaxRow = EV_WMAX.fill(-1), bpMinRow = EV_BMIN.fill(9);
  let wb = 0, bb = 0;
  for (let s = 21; s < 99; s++) {
    const p = b[s]; if (p === 0 || p === OFF) continue;
    const f = fileOf(s) + 1, r = rowOf(s);
    if (p === PAWN) { wp[f]++; if (r < wpMinRow[f]) wpMinRow[f] = r; if (r > wpMaxRow[f]) wpMaxRow[f] = r; }
    else if (p === (PAWN | 8)) { bp[f]++; if (r > bpMaxRow[f]) bpMaxRow[f] = r; if (r < bpMinRow[f]) bpMinRow[f] = r; }
    else if (p === BISHOP) wb++; else if (p === (BISHOP | 8)) bb++;
  }
  let pMG = 0, pEG = 0, passMG = 0, passEG = 0, mobMG = 0, mobEG = 0, ksW = 0, ksB = 0, rookMG = 0, rookEG = 0, bpair = 0, shieldW = 0, shieldB = 0;
  if (wb >= 2) bpair += 1; if (bb >= 2) bpair -= 1;
  const wk = pos.kingSq[0], bk = pos.kingSq[1];
  for (let s = 21; s < 99; s++) {
    const p = b[s]; if (p === 0 || p === OFF) continue;
    const t = p & 7, white = !(p & 8), f = fileOf(s) + 1, r = rowOf(s);
    if (t === PAWN) {
      if (white) {
        if (wp[f] > 1) { pMG -= 6; pEG -= 12; }
        if (!wp[f - 1] && !wp[f + 1]) { pMG -= 10; pEG -= 12; }
        // passed: no black pawn ahead (smaller row) on f-1,f,f+1
        if (!(bpMinRow[f] < r) && !(bpMinRow[f - 1] < r) && !(bpMinRow[f + 1] < r) && r === wpMinRow[f]) {
          const rr = 7 - r; // relative rank index 1..6
          let e = PASSED_EG[rr];
          if (b[s - 10] !== 0) e = e * 2 / 3 | 0; // blocked
          // king distance in endgame
          e += (kdist(s - 10, bk) * 5 - kdist(s - 10, wk) * 2) * rr / 3 | 0;
          passMG += PASSED_MG[rr]; passEG += e;
        }
      } else {
        if (bp[f] > 1) { pMG += 6; pEG += 12; }
        if (!bp[f - 1] && !bp[f + 1]) { pMG += 10; pEG += 12; }
        if (!(wpMaxRow[f] > r) && !(wpMaxRow[f - 1] > r) && !(wpMaxRow[f + 1] > r) && r === bpMaxRow[f]) {
          const rr = r;
          let e = PASSED_EG[rr];
          if (b[s + 10] !== 0) e = e * 2 / 3 | 0;
          e += (kdist(s + 10, wk) * 5 - kdist(s + 10, bk) * 2) * rr / 3 | 0;
          passMG -= PASSED_MG[rr]; passEG -= e;
        }
      }
      continue;
    }
    if (t === KING) continue;
    // mobility & king attack
    const enemyK = white ? bk : wk; const sgn = white ? 1 : -1;
    let mob = 0, katt = 0;
    const us = p & 8;
    if (t === KNIGHT) {
      for (let i = 0; i < 8; i++) { const x = s + N_OFF[i], q = b[x]; if (q === OFF) continue; if ((q === 0 || (q & 8) !== us) && !(white ? (b[x - 9] === 9 || b[x - 11] === 9) : (b[x + 9] === 1 || b[x + 11] === 1))) mob++; if (KZONE[x - enemyK + 120]) katt++; }
      mob -= 4;
    } else {
      const dirs = t === BISHOP ? B_OFF : t === ROOK ? R_OFF : K_OFF;
      for (let i = 0; i < dirs.length; i++) {
        const d = dirs[i]; let x = s + d, q;
        while (true) {
          q = b[x]; if (q === OFF) break;
          if ((q === 0 || (q & 8) !== us) && !(white ? (b[x - 9] === 9 || b[x - 11] === 9) : (b[x + 9] === 1 || b[x + 11] === 1))) mob++;
          if (KZONE[x - enemyK + 120]) katt++;
          if (q !== 0) break; x += d;
        }
      }
      mob -= t === BISHOP ? 6 : t === ROOK ? 6 : 12;
    }
    mobMG += sgn * mob * MOB_MG[t]; mobEG += sgn * mob * MOB_EG[t];
    if (katt) { if (white) ksW += KS_W[t] * Math.min(katt, 3); else ksB += KS_W[t] * Math.min(katt, 3); }
    if (t === ROOK) {
      const own = white ? wp[f] : bp[f], opp = white ? bp[f] : wp[f];
      if (!own) { rookMG += sgn * (opp ? 10 : 25); rookEG += sgn * (opp ? 4 : 10); }
      if (white && r === 1) { rookMG += 10; rookEG += 20; } else if (!white && r === 6) { rookMG -= 10; rookEG -= 20; }
    }
  }
  // king pawn shield (middlegame only)
  {
    const kf = fileOf(wk), kr = rowOf(wk);
    if (kr >= 6) for (let ff = Math.max(0, kf - 1); ff <= Math.min(7, kf + 1); ff++) { if (b[sqOf(ff, kr - 1)] === PAWN) shieldW += 12; else if (kr >= 2 && b[sqOf(ff, kr - 2)] === PAWN) shieldW += 6; else if (!wp[ff + 1]) shieldW -= 12; }
    const kf2 = fileOf(bk), kr2 = rowOf(bk);
    if (kr2 <= 1) for (let ff = Math.max(0, kf2 - 1); ff <= Math.min(7, kf2 + 1); ff++) { if (b[sqOf(ff, kr2 + 1)] === (PAWN | 8)) shieldB += 12; else if (b[sqOf(ff, kr2 + 2)] === (PAWN | 8)) shieldB += 6; else if (!bp[ff + 1]) shieldB -= 12; }
  }
  // king danger: quadratic in attack weight
  const kdW = ksW * ksW / 720 | 0, kdB = ksB * ksB / 720 | 0; // ksW = white attacking black king
  const kingMG = (kdW - kdB) + (shieldW - shieldB);
  const kingEG = 0;
  const bpMG = bpair * 30, bpEG = bpair * 50;
  mg += pMG + passMG + mobMG + kingMG + rookMG + bpMG;
  eg += pEG + passEG + mobEG + kingEG + rookEG + bpEG;
  let score = ((mg * ph + eg * (24 - ph)) / 24) | 0;
  // drawish scaling: no pawns and small material edge
  let anyW = 0, anyB = 0; for (let i = 0; i < 10; i++) { anyW |= wp[i]; anyB |= bp[i]; }
  if (!anyW && score > 0 && score < 400) score = score / 4 | 0;
  if (!anyB && score < 0 && score > -400) score = score / 4 | 0;
  const tempo = 12;
  if (terms) {
    const tp = (m, e) => ((m * ph + e * (24 - ph)) / 24) | 0;
    let matMG = 0, matEG = 0;
    for (let s = 21; s < 99; s++) { const p = b[s]; if (!p || p === OFF) continue; const sg = (p & 8) ? -1 : 1; matMG += sg * MGV[p & 7]; matEG += sg * EGV[p & 7]; }
    terms.material = tp(matMG, matEG);
    terms.placement = tp(pos.mg - matMG, pos.eg - matEG);
    terms.pawns = tp(pMG, pEG);
    terms.passed = tp(passMG, passEG);
    terms.mobility = tp(mobMG, mobEG);
    terms.king = tp(kingMG, kingEG);
    terms.rooks = tp(rookMG, rookEG);
    terms.bishops = tp(bpMG, bpEG);
    terms.total = score;
  }
  return (pos.side === WHITE ? score : -score) + tempo;
}

// ---------- Search ----------
const TT_BITS = 20, TT_SIZE = 1 << TT_BITS, TT_MASK = TT_SIZE - 1;
const TT_EXACT = 1, TT_LOWER = 2, TT_UPPER = 3;

class Searcher {
  constructor(ttBits) {
    const size = 1 << (ttBits || TT_BITS); this.ttMask = size - 1;
    this.ttKey = new Int32Array(size); this.ttMove = new Int32Array(size); this.ttScore = new Int16Array(size); this.ttDepth = new Int8Array(size); this.ttFlag = new Int8Array(size);
    this.moveBuf = new Int32Array(MAXPLY * 256); this.scoreBuf = new Int32Array(MAXPLY * 256); this.quietBuf = new Int32Array(MAXPLY * 256);
    this.killers = new Int32Array(MAXPLY * 2); this.history = new Int32Array(16 * 120);
    this.pvTable = new Int32Array(MAXPLY * MAXPLY); this.pvLen = new Int32Array(MAXPLY);
    this.lmr = []; for (let d = 0; d < 64; d++) { this.lmr.push(new Int8Array(64)); for (let m = 0; m < 64; m++) this.lmr[d][m] = (d && m) ? Math.floor(0.75 + Math.log(d) * Math.log(m) / 2.25) : 0; }
    this.nodes = 0; this.stop = false;
  }
  clear() { this.ttKey.fill(0); this.ttMove.fill(0); this.ttDepth.fill(0); this.ttFlag.fill(0); this.history.fill(0); this.killers.fill(0); }
  ttProbe(pos) { const i = pos.hl & this.ttMask; return this.ttKey[i] === pos.hh && this.ttFlag[i] ? i : -1; }
  ttStore(pos, depth, flag, score, move, ply) {
    const i = pos.hl & this.ttMask;
    if (this.ttKey[i] === pos.hh && this.ttDepth[i] > depth && flag !== TT_EXACT) return;
    if (score > MATE_BOUND) score += ply; else if (score < -MATE_BOUND) score -= ply;
    this.ttKey[i] = pos.hh; this.ttMove[i] = move || (this.ttKey[i] === pos.hh ? this.ttMove[i] : 0); this.ttScore[i] = score; this.ttDepth[i] = depth; this.ttFlag[i] = flag;
  }
  checkTime() { if ((this.nodes & 2047) === 0) { if (Date.now() > this.deadline || (this.nodeLimit && this.nodes > this.nodeLimit)) this.stop = true; } }

  scoreMoves(pos, base, n, ttMove, ply) {
    const b = pos.b, mv = this.moveBuf, sc = this.scoreBuf;
    const k1 = this.killers[ply * 2], k2 = this.killers[ply * 2 + 1];
    for (let i = base; i < base + n; i++) {
      const m = mv[i];
      if (m === ttMove) sc[i] = 2000000;
      else if (mFlag(m) & F_CAP) {
        const victim = (mFlag(m) & F_EP) ? PAWN : (b[mTo(m)] & 7), att = b[mFrom(m)] & 7;
        const s = see(pos, m);
        sc[i] = (s >= 0 ? 1000000 : 100000) + victim * 100 - att;
      } else if (mPromo(m)) sc[i] = mPromo(m) === QUEEN ? 950000 : -100000;
      else if (m === k1) sc[i] = 900000; else if (m === k2) sc[i] = 899000;
      else sc[i] = this.history[b[mFrom(m)] * 120 + mTo(m)];
    }
  }
  pick(base, i, end) {
    const mv = this.moveBuf, sc = this.scoreBuf; let best = i;
    for (let j = i + 1; j < end; j++) if (sc[j] > sc[best]) best = j;
    if (best !== i) { let t = mv[i]; mv[i] = mv[best]; mv[best] = t; t = sc[i]; sc[i] = sc[best]; sc[best] = t; }
    return mv[i];
  }

  qsearch(pos, alpha, beta, ply) {
    this.nodes++; this.checkTime(); if (this.stop) return 0;
    this.pvLen[ply] = 0;
    if (ply >= MAXPLY - 1) return evaluate(pos);
    const qti = this.ttProbe(pos);
    if (qti >= 0) { let ts = this.ttScore[qti]; if (ts > MATE_BOUND) ts -= ply; else if (ts < -MATE_BOUND) ts += ply; const f = this.ttFlag[qti];
      if (f === TT_EXACT || (f === TT_LOWER && ts >= beta) || (f === TT_UPPER && ts <= alpha)) return ts; }
    const stand = evaluate(pos);
    if (stand >= beta) return stand;
    if (stand > alpha) alpha = stand;
    const base = ply * 256;
    const n = pos.gen(this.moveBuf, base, true) - base;
    this.scoreMoves(pos, base, n, 0, ply);
    let best = stand;
    for (let i = base; i < base + n; i++) {
      const m = this.pick(base, i, base + n);
      if (this.scoreBuf[i] < 900000 && !mPromo(m)) continue; // losing capture by SEE
      // delta pruning
      const victim = (mFlag(m) & F_EP) ? PAWN : (pos.b[mTo(m)] & 7);
      if (stand + SEEVAL[victim] + 200 < alpha && !mPromo(m) && pos.phase > 4) continue;
      if (!pos.make(m)) continue;
      const s = -this.qsearch(pos, -beta, -alpha, ply + 1);
      pos.unmake();
      if (this.stop) return 0;
      if (s > best) { best = s; if (s > alpha) { alpha = s; if (s >= beta) return s; } }
    }
    return best;
  }

  search(pos, depth, alpha, beta, ply, allowNull, excluded) {
    const pvNode = beta - alpha > 1;
    this.pvLen[ply] = 0;
    const inCheck = pos.inCheck();
    if (inCheck) depth++;
    if (depth <= 0) return this.qsearch(pos, alpha, beta, ply);
    this.nodes++; this.checkTime(); if (this.stop) return 0;
    if (ply > 0) {
      if (pos.half >= 100 || pos.isRepetition() || pos.insufficient()) return 0;
      // mate distance pruning
      alpha = Math.max(alpha, -MATE + ply); beta = Math.min(beta, MATE - ply - 1); if (alpha >= beta) return alpha;
    }
    if (ply >= MAXPLY - 1) return evaluate(pos);
    // TT
    let ttMove = 0;
    const ti = this.ttProbe(pos);
    if (ti >= 0) {
      ttMove = this.ttMove[ti];
      if (!pvNode && ply > 0 && this.ttDepth[ti] >= depth) {
        let s = this.ttScore[ti]; if (s > MATE_BOUND) s -= ply; else if (s < -MATE_BOUND) s += ply;
        const f = this.ttFlag[ti];
        if (f === TT_EXACT || (f === TT_LOWER && s >= beta) || (f === TT_UPPER && s <= alpha)) return s;
      }
    }
    const staticEval = inCheck ? -INF : evaluate(pos);
    if (!pvNode && !inCheck && ply > 0) {
      // reverse futility
      if (depth <= 6 && staticEval - 85 * depth >= beta && Math.abs(beta) < MATE_BOUND) return staticEval - 85 * depth;
      // null move
      if (allowNull && depth >= 3 && staticEval >= beta && pos.nonPawnMat(pos.side)) {
        const R = 3 + (depth / 4 | 0) + Math.min(3, (staticEval - beta) / 200 | 0);
        pos.makeNull();
        const s = -this.search(pos, depth - R, -beta, -beta + 1, ply + 1, false);
        pos.unmakeNull();
        if (this.stop) return 0;
        if (s >= beta) return s > MATE_BOUND ? beta : s;
      }
    }
    // internal iterative reduction
    if (!ttMove && depth >= 5 && pvNode) depth--;
    const base = ply * 256;
    const n = pos.gen(this.moveBuf, base, false) - base;
    this.scoreMoves(pos, base, n, ttMove, ply);
    if (ply === 0 && this.rootFilter) { for (let i = base; i < base + n; i++) if (!this.rootFilter.has(this.moveBuf[i])) this.scoreBuf[i] = -1e9; }
    let legal = 0, best = -INF, bestMove = 0, origAlpha = alpha;
    const futile = !pvNode && !inCheck && depth <= 3 && staticEval + 120 * depth + 60 <= alpha;
    const qb = ply * 256; let nq = 0; const QT = this.quietBuf;
    for (let i = base; i < base + n; i++) {
      const m = this.pick(base, i, base + n);
      if (ply === 0 && this.rootFilter && !this.rootFilter.has(m)) continue;
      const isCap = (mFlag(m) & F_CAP) !== 0, isQuiet = !isCap && !mPromo(m);
      if (legal > 0 && isQuiet && !inCheck && best > -MATE_BOUND) {
        if (futile) continue;
        if (!pvNode && depth <= 4 && legal >= 4 + depth * depth * 2) continue; // late move pruning
      }
      if (legal > 0 && !pvNode && isCap && depth <= 4 && this.scoreBuf[i] < 900000 && see(pos, m) < -80 * depth) continue;
      if (!pos.make(m)) continue;
      legal++;
      const givesCheck = pos.inCheck();
      let s;
      if (legal === 1) s = -this.search(pos, depth - 1, -beta, -alpha, ply + 1, true);
      else {
        let R = 0;
        if (depth >= 3 && isQuiet && !inCheck && !givesCheck) {
          R = this.lmr[Math.min(depth, 63)][Math.min(legal, 63)];
          if (pvNode) R--; if (m === this.killers[ply * 2] || m === this.killers[ply * 2 + 1]) R--;
          R = Math.max(0, Math.min(R, depth - 2));
        }
        s = -this.search(pos, depth - 1 - R, -alpha - 1, -alpha, ply + 1, true);
        if (s > alpha && R > 0) s = -this.search(pos, depth - 1, -alpha - 1, -alpha, ply + 1, true);
        if (s > alpha && s < beta) s = -this.search(pos, depth - 1, -beta, -alpha, ply + 1, true);
      }
      pos.unmake();
      if (this.stop) return 0;
      if (ply === 0 && this.rootScores) this.rootScores.set(m, s);
      if (s > best) {
        best = s; bestMove = m;
        if (s > alpha) {
          alpha = s;
          // PV update
          const pv = this.pvTable, o = ply * MAXPLY, o1 = (ply + 1) * MAXPLY;
          pv[o] = m; const l = this.pvLen[ply + 1]; for (let j = 0; j < l; j++) pv[o + 1 + j] = pv[o1 + j]; this.pvLen[ply] = l + 1;
          if (s >= beta) {
            if (isQuiet) {
              if (this.killers[ply * 2] !== m) { this.killers[ply * 2 + 1] = this.killers[ply * 2]; this.killers[ply * 2] = m; }
              const hi = pos.b[mFrom(m)] * 120 + mTo(m); this.history[hi] += depth * depth; if (this.history[hi] > 800000) for (let z = 0; z < this.history.length; z++) this.history[z] >>= 1;
              for (let qq = 0; qq < nq; qq++) { const q = QT[qb + qq]; const qi = pos.b[mFrom(q)] * 120 + mTo(q); this.history[qi] -= depth * depth; }
            }
            break;
          }
        }
      }
      if (isQuiet) QT[qb + nq++] = m;
    }
    if (legal === 0) return inCheck ? -MATE + ply : 0;
    this.ttStore(pos, depth, best >= beta ? TT_LOWER : (best > origAlpha ? TT_EXACT : TT_UPPER), best, bestMove, ply);
    return best;
  }

  // opts: {time(ms), depth, nodes, moves:[move ints] (restrict root), onIter(info)}
  go(pos, opts) {
    opts = opts || {};
    this.stop = false; this.nodes = 0;
    this.deadline = Date.now() + (opts.time || 1000);
    this.nodeLimit = opts.nodes || 0;
    this.rootFilter = opts.moves && opts.moves.length ? new Set(opts.moves) : null;
    this.rootScores = new Map();
    for (let i = 0; i < this.killers.length; i++) this.killers[i] = 0;
    for (let i = 0; i < this.history.length; i++) this.history[i] >>= 2;
    const maxDepth = opts.depth || 64;
    let best = null, prev = 0;
    const legal = pos.legalMoves().filter(m => !this.rootFilter || this.rootFilter.has(m));
    if (!legal.length) return { move: 0, score: pos.inCheck() ? -MATE : 0, depth: 0, pv: [], nodes: 0 };
    const t0 = Date.now();
    for (let d = 1; d <= maxDepth; d++) {
      let window = 30, alpha = -INF, beta = INF, s;
      if (d >= 5) { alpha = prev - window; beta = prev + window; }
      while (true) {
        s = this.search(pos, d, alpha, beta, 0, false);
        if (this.stop) break;
        if (s <= alpha) { alpha = Math.max(-INF, alpha - window); window *= 2; }
        else if (s >= beta) { beta = Math.min(INF, beta + window); window *= 2; }
        else break;
        if (window > 1000) { alpha = -INF; beta = INF; }
      }
      if (this.stop && best) break;
      if (this.pvLen[0] > 0 || !best) {
        const pv = []; for (let j = 0; j < this.pvLen[0]; j++) pv.push(this.pvTable[j]);
        if (!pv.length) pv.push(legal[0]);
        best = { move: pv[0], score: s, depth: d, pv, nodes: this.nodes, time: Date.now() - t0 };
        prev = s;
        if (opts.onIter) opts.onIter(best);
      }
      if (this.stop) break;
      if (Math.abs(s) > MATE_BOUND && d > 6) break;
      if (!opts.depth && Date.now() - t0 > (opts.time || 1000) * 0.55) break; // not enough time for next iteration
      if (legal.length === 1 && d >= 4) break;
    }
    best.nodes = this.nodes; best.time = Date.now() - t0;
    return best;
  }
}

const api = { PST_MG, PST_EG, Position, Searcher, evaluate, see, PAWN, KNIGHT, BISHOP, ROOK, QUEEN, KING, WHITE, BLACK, MATE, MATE_BOUND, INF, SEEVAL,
  mFrom, mTo, mPromo, mFlag, F_CAP, F_EP, F_CASTLE, sqName, nameSq, fileOf, rowOf, sqOf, N_OFF, K_OFF, B_OFF, R_OFF, OFF, NAMES, leastAttacker };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
root.MEEngine = api;
})(typeof self !== 'undefined' ? self : this);
