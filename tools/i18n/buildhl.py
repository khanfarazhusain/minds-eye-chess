#!/usr/bin/env python3
"""Inline the Hinglish supplement (tools/i18n/tr/hi/*.tsv) into index.html as HL_DICT."""
import glob, json, os, re
ROOT = os.path.dirname(os.path.abspath(__file__)); IDX = os.path.join(ROOT, '..', '..', 'index.html')
d = {}
for f in sorted(glob.glob(os.path.join(ROOT, 'tr', 'hi', '*.tsv'))):
    for l in open(f, encoding='utf8'):
        l = l.rstrip('\n')
        if '\t' in l:
            k, v = l.split('\t', 1)
            if v.strip() and k != v: d[k] = v
js = '/*HL_DICT_START*/const HL_DICT=' + json.dumps(d, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/') + ';/*HL_DICT_END*/'
s = open(IDX, encoding='utf8').read()
if '/*HL_DICT_START*/' in s:
    s = re.sub(r'/\*HL_DICT_START\*/.*?/\*HL_DICT_END\*/', lambda m: js, s, flags=re.S)
else:
    s = s.replace('/* ---- i18n: language packs ---- */', js + '\n/* ---- i18n: language packs ---- */', 1)
open(IDX, 'w', encoding='utf8').write(s)
print('HL_DICT', len(d), 'keys', len(js) // 1024, 'KB')
