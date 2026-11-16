// Why does Tez miss? For positions where no good move is in fastCands top-K, report which box the best good move is in, and its features.
const fs = require('fs'), path = require('path'); const E = require('./me-engine.js'); const R = require('./me-rules.js');
const dir = process.argv[2], lim = +(process.argv[3] || 3000), K = +(process.argv[4] || 5);
const files = fs.readdirSync(dir).filter(f => /^(n2lab|n3lab|nlab|hlab)\d\.json$/.test(f));
let n = 0, miss = 0; const box = {}, feat = {}, gap = { small: 0, big: 0 }; const ex = [];
outer: for (const f of files) { const NL = JSON.parse(fs.readFileSync(path.join(dir, f))); for (const fen in NL) { const it = NL[fen]; const lab = it.m || it; if (!Array.isArray(lab) || !lab.length) continue;
  const pos = new E.Position(fen); const sc = {}; for (const [u, s] of lab) sc[u] = s; const mx = Math.max(...lab.map(x => x[1])); const good = u => u === it.best || sc[u] >= mx - 30;
  const F = R.features3(pos, 0); const all = R.fastCands(pos, F, 0); const ord = all.map(x => pos.uci(x.m)); n++;
  if (!ord.slice(0, K).some(good)) { miss++; const i = ord.findIndex(good); const g = all[i].g; box[g] = (box[g] || 0) + 1; box['rank' + Math.min(i + 1, 20)] = (box['rank' + Math.min(i + 1, 20)] || 0) + 1;
    const second = Math.max(...lab.filter(x => !good(x[0])).map(x => x[1]), -99999); if (mx - second < 80) gap.small++; else gap.big++;
    const fm = F.find(x => pos.uci(x.move) === ord[i]).f; for (const k in fm) if (fm[k]) feat[k] = (feat[k] || 0) + 1; if (ex.length < 12) ex.push(fen + ' best ' + pos.san(all[i].m) + ' box ' + g + ' rank ' + (i + 1)); }
  if (n >= lim) break outer; } }
console.log({ n, miss, missPct: (100 * miss / n).toFixed(1), box, gap }); console.log(Object.entries(feat).sort((a, b) => b[1] - a[1]).slice(0, 30)); console.log(ex.join('\n'));
