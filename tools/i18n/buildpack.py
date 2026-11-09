#!/usr/bin/env python3
"""Build packs/<lang>.json and packs/index.json from tools/i18n/tr/<lang>/*.tsv.
Coverage % = translated countable keys / countable keys in keys-all.json."""
import json, os, re, glob, sys
ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, '..', '..', 'packs')
LANGNAMES = set()
src = open(os.path.join(ROOT, '..', '..', 'index.html'), encoding='utf8').read()
m = re.search(r'const LANGS=\[(.*?)\];', src, re.S)
for row in re.findall(r"\['([^']*)','([^']*)','([^']*)'", m.group(1)):
    LANGNAMES.update(x.strip() for x in row)

def countable(k):
    if k in LANGNAMES: return False
    if not re.search(r'[A-Za-z]{2}', k): return False
    if re.match(r'^(sch:|lm\.|setoption|pc |mate\{n\},|packs/|header\.|#|\.)', k): return False
    if re.search(r'[{}]\s*$', k) and re.search(r'[;:]\s*[a-z-]+\s*:', k): return False
    if k in {'{n} Squares', '✦ AI', '{n} XP', '{n} / {n} XP'}: return False
    if k in SKIP: return False
    return True

SKIP = set(l.rstrip('\n') for l in open(os.path.join(ROOT, 'skip.txt'), encoding='utf8')) if os.path.exists(os.path.join(ROOT, 'skip.txt')) else set()

def load_tsv(lang):
    d = {}
    for f in sorted(glob.glob(os.path.join(ROOT, 'tr', lang, '*.tsv'))):
        for line in open(f, encoding='utf8'):
            line = line.rstrip('\n')
            if '\t' not in line: continue
            k, v = line.split('\t', 1)
            if k and v.strip(): d[k] = v
    return d

def build(lang, course=0):
    keys = json.load(open(os.path.join(ROOT, 'keys-all.json'), encoding='utf8'))
    cnt = [k for k in keys if countable(k)]
    ui = load_tsv(lang)
    done = [k for k in cnt if k in ui]
    miss = [k for k in cnt if k not in ui]
    pct = round(100 * len(done) / max(1, len(cnt)))
    if pct == 100 and miss: pct = 99
    old = {}
    idxf = os.path.join(OUT, 'index.json')
    if os.path.exists(idxf): old = json.load(open(idxf, encoding='utf8'))
    v = (old.get(lang, {}).get('v', 0)) + 1
    os.makedirs(OUT, exist_ok=True)
    pack = {'v': v, 'lang': lang, 'ui': ui, 'course': {}}
    cf = os.path.join(ROOT, 'tr', lang, 'course.json')
    if os.path.exists(cf): pack['course'] = json.load(open(cf, encoding='utf8'))
    txt = json.dumps(pack, ensure_ascii=False, separators=(',', ':'))
    open(os.path.join(OUT, lang + '.json'), 'w', encoding='utf8').write(txt)
    old[lang] = {'v': v, 'size': len(txt.encode('utf8')), 'pct': max(1, pct), 'ui': pct, 'course': course, 'notes': 0}
    open(idxf, 'w', encoding='utf8').write(json.dumps(old, ensure_ascii=False, indent=1))
    open(os.path.join(ROOT, 'missing-' + lang + '.txt'), 'w', encoding='utf8').write('\n'.join(miss))
    print(f'{lang}: {len(done)}/{len(cnt)} = {pct}% · {len(miss)} missing · {len(txt)//1024} KB · v{v}')

if __name__ == '__main__':
    build(sys.argv[1] if len(sys.argv) > 1 else 'hin', int(sys.argv[2]) if len(sys.argv) > 2 else 0)
