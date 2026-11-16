// JS wrapper for the FHK wasm core. Same API shape as Searcher.go(pos, opts).
const fs = require('fs'), path = require('path');
function create(E, wasmPath, ttBits) {
  const bytes = fs.readFileSync(wasmPath || path.join(__dirname, 'eng.wasm'));
  let iterCb = null, inst;
  const imports = { env: { host_now: () => Date.now(), host_iter: (d, s, n, l) => { if (iterCb) iterCb(d, s, n, l); } } };
  inst = new WebAssembly.Instance(new WebAssembly.Module(bytes), imports);
  const X = inst.exports, mem = () => X.memory.buffer;
  const pmg = X.ptr_pst_mg(), peg = X.ptr_pst_eg();
  { const a = new Int32Array(mem(), pmg, 16 * 120), b = new Int32Array(mem(), peg, 16 * 120); for (let p = 0; p < 16; p++) for (let s = 0; s < 120; s++) { a[p * 120 + s] = E.PST_MG[p][s]; b[p * 120 + s] = E.PST_EG[p][s]; } }
  X.init(); X.lmr_init(); X.set_tt_bits(ttBits || 20); X.tt_clear();
  function load(pos, moves) {
    new Int8Array(mem(), X.ptr_board(), 120).set(pos.b);
    const h = pos.hist.length > 2000 ? pos.hist.slice(-2000) : pos.hist; new Int32Array(mem(), X.ptr_hist(), h.length).set(h);
    const rf = moves && moves.length ? moves : []; if (rf.length) new Int32Array(mem(), X.ptr_rootFilter(), rf.length).set(rf);
    X.set_state(pos.side, pos.castle, pos.ep, pos.half, h.length, rf.length);
  }
  return {
    X, load,
    loadNet(file) { const buf0 = fs.readFileSync(file); const buf = Buffer.from(buf0);
      if (buf.readInt32LE(0) < 0) { const Hn = -buf.readInt32LE(0), KB = buf.readInt32LE(4); const f = new Float32Array(buf.buffer, buf.byteOffset + 8, (buf.length - 8) / 4);
        if (Hn !== X.nn_h() || !X.ptr_nb2v) throw new Error('v2 net needs NNKB wasm');
        const w1 = new Int16Array(mem(), X.ptr_nw1(), KB * 768 * Hn), b1 = new Int16Array(mem(), X.ptr_nb1(), Hn), w2 = new Int16Array(mem(), X.ptr_nw2(), 16 * Hn), b2 = new Int32Array(mem(), X.ptr_nb2v(), 8); let o = 0;
        const q = (v, s) => Math.max(-32767, Math.min(32767, Math.round(v * s)));
        for (let i = 0; i < KB * 768 * Hn; i++) w1[i] = q(f[o++], 255); for (let i = 0; i < Hn; i++) b1[i] = q(f[o++], 255); for (let i = 0; i < 16 * Hn; i++) w2[i] = q(f[o++], 1024); for (let i = 0; i < 8; i++) b2[i] = Math.round(f[o++] * 255 * 1024);
        X.set_nn(1, 0); X.tt_clear(); return; }
      const f = new Float32Array(buf.buffer, buf.byteOffset + 4, (buf.length - 4) / 4); const Hn = buf.readInt32LE(0); if (Hn !== (X.nn_h ? X.nn_h() : 256)) throw new Error('net H ' + Hn);
      const w1 = new Int16Array(mem(), X.ptr_nw1(), 768 * Hn), b1 = new Int16Array(mem(), X.ptr_nb1(), Hn), w2 = new Int16Array(mem(), X.ptr_nw2(), 2 * Hn); let o = 0;
      const q = (v, s) => Math.max(-32767, Math.min(32767, Math.round(v * s)));
      for (let i = 0; i < 768 * Hn; i++) w1[i] = q(f[o++], 255); for (let i = 0; i < Hn; i++) b1[i] = q(f[o++], 255); for (let i = 0; i < 2 * Hn; i++) w2[i] = q(f[o++], 1024);
      X.set_nn(1, Math.round(f[o] * 255 * 1024)); X.tt_clear(); },
    nnOff() { X.set_nn(0, 0); X.tt_clear(); },
    evaluate(pos) { load(pos); return X.evaluate(); },
    clear() { X.tt_clear(); },
    go(pos, opts) {
      opts = opts || {}; load(pos, opts.moves);
      iterCb = opts.onIter ? (d, s, n, l) => { const pv = Array.from(new Int32Array(mem(), X.ptr_pv(), l)); opts.onIter({ move: pv[0], score: s, depth: d, pv, nodes: n }); } : null;
      const t0 = Date.now(); const mv = X.go(opts.time || 1000, opts.depth || 0, opts.nodes || 0);
      const l = X.res_pvlen(); const pv = Array.from(new Int32Array(mem(), X.ptr_pv(), l));
      this.nodes = X.res_nodes();
      return { move: mv, score: X.res_score(), depth: X.res_depth(), pv, nodes: X.res_nodes(), time: Date.now() - t0 };
    }
  };
}
module.exports = { create };
