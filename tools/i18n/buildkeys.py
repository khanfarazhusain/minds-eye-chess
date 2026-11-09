# Merge crawl keys + source-extracted keys into tools/i18n/keys-all.json (junk filtered).
import json,re,subprocess,sys
subprocess.run([sys.executable,'tools/i18n/extract.py','index.html','tools/i18n/keys-src.json'],check=True)
e=json.load(open('tools/i18n/keys-src.json'));c=json.load(open('tools/i18n/keys.json'))
JUNK={'Nc','Rc','Pp','AIza','AQ.','Bearer','Authorization','Safari','Claude','Gemini','Backspace','Space','Enter','K{n}PQ{n}M','MEC{n}.','en-IN','en-US','hi-IN','English','Hinglish','Hindi'}
def ok(k):
  if k in JUNK:return False
  if re.search(r'^[:\[(.)]|\)\.|^\w+[:/][\w.\-]+$|l\{n\}\.|\.v\{n\}|auth/|rotate\(|data-|:scope|:not\(|application/|text/plain|audio/|gemini-|apikey|replace\(',k):return False
  if ' ' not in k and re.search(r'[a-z],[a-z]',k):return False
  if re.fullmatch(r'[a-z]+[:,]',k):return False
  return True
raw=set(e)|set(c)
raw={k.replace("\\'","'").replace('\\"','"') for k in raw if '\\u{n}' not in k}
keys=sorted(k for k in raw if ok(k))
json.dump(keys,open('tools/i18n/keys-all.json','w'),ensure_ascii=False,indent=0)
print(len(keys),sum(map(len,keys)))
