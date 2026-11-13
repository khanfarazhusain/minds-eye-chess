/* UCI-compatible Web Worker for the ME engine, so the app can swap it in wherever it uses Stockfish.
 * Supports: uci, isready, ucinewgame, setoption (Skill Level 0-20, MultiPV, UCI_LimitStrength/UCI_Elo ignored),
 * position startpos|fen ... [moves ...], go [movetime N] [depth N] [wtime/btime/winc/binc] [infinite], stop, quit.
 * Output: id/option/uciok, readyok, info depth .. score cp|mate .. multipv k .. pv .., bestmove. */
importScripts('me-engine.js');
const E = self.MEEngine;
const S = new E.Searcher(19);
let pos = new E.Position();
let skill = 20, multiPV = 1;
// Skill -> depth limit (0 = no limit, time only) and blunder chance
const SKILL_DEPTH = [1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 5, 5, 6, 7, 8, 9, 10, 12, 14, 0];
const out = s => postMessage(s);
function scoreStr(sc) { if (Math.abs(sc) > E.MATE_BOUND) { const n = sc > 0 ? Math.ceil((E.MATE - sc) / 2) : -Math.ceil((E.MATE + sc) / 2); return 'mate ' + n; } return 'cp ' + sc; }
function setPosition(args) {
  let i = 0, fen;
  if (args[0] === 'startpos') { fen = undefined; i = 1; }
  else if (args[0] === 'fen') { const j = args.indexOf('moves'); fen = args.slice(1, j < 0 ? args.length : j).join(' '); i = j < 0 ? args.length : j; }
  pos = new E.Position(fen);
  const k = args.indexOf('moves');
  if (k >= 0) for (const u of args.slice(k + 1)) { const m = pos.parseUci(u); if (!m) break; pos.make(m); }
}
function go(args) {
  const g = {}; for (let i = 0; i < args.length; i += 2) g[args[i]] = +args[i + 1];
  if (args.includes('infinite')) g.movetime = 5000;
  let time = g.movetime || 0;
  if (!time && (g.wtime || g.btime)) { const left = pos.side === E.WHITE ? g.wtime : g.btime, inc = (pos.side === E.WHITE ? g.winc : g.binc) || 0; time = Math.max(50, Math.min(left / 25 + inc * 0.8, left / 4)); }
  if (!time) time = g.depth ? 60000 : 1000;
  let depth = g.depth || 0;
  const sd = SKILL_DEPTH[Math.max(0, Math.min(20, skill))]; if (sd && (!depth || sd < depth)) depth = sd;
  const legal = pos.legalMoves();
  if (!legal.length) { out('info depth 0 score ' + (pos.inCheck() ? 'mate 0' : 'cp 0')); out('bestmove (none)'); return; }
  const t0 = Date.now();
  const main = S.go(pos, { time, depth, onIter: it => { const pv = it.pv.map(m => pos.uci(m)).join(' '); out(`info depth ${it.depth} score ${scoreStr(it.score)} nodes ${S.nodes} time ${Date.now() - t0} multipv 1 pv ${pv}`); } });
  let best = main.move;
  // extra lines for MultiPV
  if (multiPV > 1) {
    const rest = legal.filter(m => m !== main.move);
    for (let k = 2; k <= multiPV && rest.length; k++) {
      const r = S.go(pos, { time: Math.max(100, time / 3), depth: depth || Math.max(2, main.depth - 2), moves: rest });
      if (!r || !r.move) break;
      out(`info depth ${r.depth} score ${scoreStr(r.score)} nodes ${S.nodes} time ${Date.now() - t0} multipv ${k} pv ${r.pv.map(m => pos.uci(m)).join(' ')}`);
      rest.splice(rest.indexOf(r.move), 1);
    }
  }
  // weaker skill: sometimes pick a reasonable but not best move
  if (skill < 15 && legal.length > 1 && Math.abs(main.score) < E.MATE_BOUND) {
    const chance = (15 - skill) / 30; // skill 0: 50%, skill 14: 3%
    if (Math.random() < chance) {
      const margin = 40 + (15 - skill) * 15; // centipawns we accept losing
      const cands = [];
      for (const m of legal) { if (m === main.move) continue; const r = S.go(pos, { time: 200, depth: Math.max(1, Math.min(3, depth || 3)), moves: [m] }); if (r && main.score - r.score <= margin) cands.push(m); if (cands.length >= 5) break; }
      if (cands.length) best = cands[Math.floor(Math.random() * cands.length)];
    }
  }
  out('bestmove ' + pos.uci(best));
}
const queue = [];
let busy = false;
function handle(line) {
  const a = String(line).trim().split(/\s+/), c = a[0];
  if (c === 'uci') { out('id name FHK Engine 1'); out('id author Mind\'s Eye Chess'); out('option name Skill Level type spin default 20 min 0 max 20'); out('option name MultiPV type spin default 1 min 1 max 5'); out('option name Hash type spin default 16 min 1 max 64'); out('uciok'); }
  else if (c === 'isready') out('readyok');
  else if (c === 'ucinewgame') { S.clear(); pos = new E.Position(); }
  else if (c === 'setoption') { const ni = a.indexOf('name'), vi = a.indexOf('value'); const name = a.slice(ni + 1, vi < 0 ? a.length : vi).join(' ').toLowerCase(), val = vi < 0 ? '' : a.slice(vi + 1).join(' ');
    if (name === 'skill level') skill = Math.max(0, Math.min(20, parseInt(val, 10) || 0)); else if (name === 'multipv') multiPV = Math.max(1, Math.min(5, parseInt(val, 10) || 1)); }
  else if (c === 'position') setPosition(a.slice(1));
  else if (c === 'go') go(a.slice(1));
  else if (c === 'quit') close();
  // 'stop' is a no-op: searches are time-limited and synchronous
}
onmessage = e => handle(e.data);
