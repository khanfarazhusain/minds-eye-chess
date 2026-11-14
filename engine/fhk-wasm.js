/* FHK Engine fast core: our own C engine (tools/fhk-engine.c) compiled to WebAssembly, with FHK-Net,
 * our own neural evaluation trained on public games + FHK self-play. Used for 'play'; falls back to JS. */
var FHKW = (function () {
  var X = null, failed = false;
  function load(url) { var x = new XMLHttpRequest(); x.open('GET', url, false); x.responseType = 'arraybuffer'; x.send(); if (x.status !== 200 && x.status !== 0) throw new Error('load ' + url); return x.response; }
  function init() {
    if (X || failed) return X;
    try {
      var inst = new WebAssembly.Instance(new WebAssembly.Module(load('fhk.wasm')), { env: { host_now: function () { return Date.now(); }, host_iter: function () {} } });
      X = inst.exports; var mem = X.memory.buffer;
      var a = new Int32Array(mem, X.ptr_pst_mg(), 16 * 120), b = new Int32Array(mem, X.ptr_pst_eg(), 16 * 120);
      for (var p = 0; p < 16; p++) for (var s = 0; s < 120; s++) { a[p * 120 + s] = MEEngine.PST_MG[p][s]; b[p * 120 + s] = MEEngine.PST_EG[p][s]; }
      X.init(); X.lmr_init(); X.set_tt_bits(20); X.tt_clear();
      var nb = load('fhk-net.bin'), hd = new Int32Array(nb, 0, 2), H = hd[0], w = new Int16Array(nb, 8);
      if (H !== 256) throw new Error('net');
      new Int16Array(mem, X.ptr_nw1(), 768 * H).set(w.subarray(0, 768 * H));
      new Int16Array(mem, X.ptr_nb1(), H).set(w.subarray(768 * H, 769 * H));
      new Int16Array(mem, X.ptr_nw2(), 2 * H).set(w.subarray(769 * H, 771 * H));
      X.set_nn(1, hd[1]); X.tt_clear();
    } catch (e) { failed = true; X = null; }
    return X;
  }
  function go(pos, opts) {
    var E = init(); if (!E) return null; var mem = E.memory.buffer;
    var hs = [], pr = opts.prev || [];
    for (var i = Math.max(0, pr.length - 100); i < pr.length; i++) { var q = pr[i]; new Int8Array(mem, E.ptr_board(), 120).set(q.b); E.set_state(q.side, q.castle, q.ep, q.half, 0, 0); hs.push(E.get_hl()); }
    if (hs.length) new Int32Array(mem, E.ptr_hist(), hs.length).set(hs);
    new Int8Array(mem, E.ptr_board(), 120).set(pos.b);
    var rf = opts.moves || []; if (rf.length) new Int32Array(mem, E.ptr_rootFilter(), rf.length).set(rf);
    E.set_state(pos.side, pos.castle, pos.ep, pos.half, hs.length, rf.length);
    var mv = E.go(opts.time || 1000, opts.depth || 0, opts.nodes || 0); if (!mv) return null;
    var l = E.res_pvlen(); var pv = Array.prototype.slice.call(new Int32Array(E.memory.buffer, E.ptr_pv(), l));
    return { move: mv, score: E.res_score(), depth: E.res_depth(), pv: pv, nodes: E.res_nodes() };
  }
  return { go: go, clear: function () { if (init()) X.tt_clear(); }, ok: function () { return !!init(); } };
})();
