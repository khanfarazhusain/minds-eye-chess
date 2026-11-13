/* Web Worker wrapper for the ME engine. Messages in: {id, cmd:'analyze'|'judge'|'play', fen, time, uci, best}
 * Messages out: {id, ok, result} */
importScripts('me-engine.js', 'me-explain.js');
const S = new MEEngine.Searcher(19);
onmessage = function (e) {
  const d = e.data || {};
  try {
    const pos = new MEEngine.Position(d.fen);
    let result;
    if (d.cmd === 'analyze') result = MEExplain.explain(pos, S, { time: d.time || 1500, multi: d.multi || 3 });
    else if (d.cmd === 'judge') result = MEExplain.judge(pos, S, d.uci, d.best, d.time || 700);
    else if (d.cmd === 'play') { const r = S.go(pos, { time: d.time || 1000, depth: d.depth || 0 }); result = { uci: pos.uci(r.move), san: pos.san(r.move), score: r.score, depth: r.depth, nodes: r.nodes, line: MEExplain.sanLine(pos, r.pv.slice(0, 6)) }; }
    else if (d.cmd === 'legal') result = pos.legalMoves().map(m => ({ uci: pos.uci(m), san: pos.san(m) }));
    else if (d.cmd === 'newgame') { S.clear(); result = true; }
    postMessage({ id: d.id, ok: true, result });
  } catch (err) { postMessage({ id: d.id, ok: false, error: String(err && err.message || err) }); }
};
