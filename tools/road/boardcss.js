// Main app (index.html) ke board ka CSS nikaalta hai, taaki Road / Lichess pages ka board bilkul app jaisa dikhe.
// index.html sirf PADHA jaata hai. Board se judi har CSS rule (pieces sets, themes, 2D/3D, highlights) yahan se copy hoti hai.
const BOARD_RE=/\.board\b|\.sq\b|\.pc\b|\.ps-|\.pz-|\.psimg\b|\bb3d\b|\.th-/;

// CSS text ko rules ke tree me todna (comments hata kar). Har item: {sel, body} ya {at, kids} ya {raw}
function parse(t){t=t.replace(/\/\*[\s\S]*?\*\//g,'');let i=0;
  function block(){const out=[];
    while(i<t.length){while(i<t.length&&/\s/.test(t[i]))i++;if(i>=t.length||t[i]==='}'){i++;return out}
      const s=i;while(i<t.length&&t[i]!=='{'&&t[i]!==';'&&t[i]!=='}')i++;
      const pre=t.slice(s,i).trim();
      if(t[i]===';'){i++;out.push({raw:pre+';'});continue}
      if(t[i]==='}'){continue}
      i++;// '{'
      if(pre[0]==='@'&&/^@(media|supports|container|layer)\b/.test(pre)){out.push({at:pre,kids:block()});continue}
      let d=1;const b=i;while(i<t.length&&d){if(t[i]==='{')d++;else if(t[i]==='}')d--;i++}
      out.push({sel:pre,body:t.slice(b,i-1)})}
    return out}
  return block()}
function emit(list){return list.map(r=>r.raw?r.raw:r.at?`${r.at}{${emit(r.kids)}}`:`${r.sel}{${r.body}}`).join('\n')}
// keep(rule) true -> rakho; at-rules ke andar recursively
function filter(list,keep,raw){const out=[];for(const r of list){if(r.raw){if(raw)out.push(r);continue}
  if(r.at){const k=filter(r.kids,keep,raw);if(k.length)out.push({at:r.at,kids:k});continue}
  if(keep(r))out.push(r)}return out}
const isBoard=r=>!/^@/.test(r.sel)&&!/^(from|to|\d+%)/.test(r.sel)&&BOARD_RE.test(r.sel);

function styleOf(html){return html.split('<style>')[1].split('</style>')[0]}

// index.html se board CSS + jo variables woh use karta hai + keyframes
function boardCSS(indexHtml){
  const tree=parse(styleOf(indexHtml));
  const kept=filter(tree,isBoard);let css=emit(kept);
  // kaun se --vars use hue
  const used=new Set((css.match(/var\(--[\w-]+/g)||[]).map(x=>x.slice(4)));
  // page ke apne vars (--fg, --line, --accent, --f-mono...) course.html se hi aate hain; sirf board wale copy karo
  const boardVar=v=>/^--(sq-|pc-|hl|coord|tilt|tcos|bw)/.test(v);
  const vtree=filter(tree,r=>/^(:root|html|body)\b|\[data-theme/.test(r.sel)&&!BOARD_RE.test(r.sel));
  const pickVars=list=>list.map(r=>{if(r.at){const k=pickVars(r.kids).filter(Boolean);return k.length?{at:r.at,kids:k}:null}
    const decl=r.body.split(';').map(s=>s.trim()).filter(s=>{const m=s.match(/^(--[\w-]+)\s*:/);return m&&used.has(m[1])&&boardVar(m[1])});
    return decl.length?{sel:r.sel,body:decl.join(';')}:null}).filter(Boolean);
  const vars=emit(pickVars(vtree));
  // keyframes jinka naam board rules me aata hai
  const kf=[];const re=/@keyframes\s+([\w-]+)\s*\{/g;const src=styleOf(indexHtml);let m;
  while((m=re.exec(src))){if(!new RegExp('\\b'+m[1]+'\\b').test(css))continue;let d=1,i=m.index+m[0].length;while(d&&i<src.length){if(src[i]==='{')d++;else if(src[i]==='}')d--;i++}kf.push(src.slice(m.index,i))}
  return '/* ---- board: index.html se copy (app jaisa board) ---- */\n'+vars+'\n'+css+'\n'+kf.join('\n')}

// course.html ke head CSS se uske apne board rules hatao (index wale unki jagah aayenge)
function stripBoard(headHtml){const a=headHtml.indexOf('<style>')+7;
  return headHtml.slice(0,a)+'\n'+emit(filter(parse(headHtml.slice(a)),r=>/^@/.test(r.sel)||!isBoard(r),true))+'\n'}

module.exports={boardCSS,stripBoard,parse,emit};
