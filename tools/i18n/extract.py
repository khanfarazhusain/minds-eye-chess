# Extract translatable English UI strings from index.html script literals.
import re,json,html,sys
src=open(sys.argv[1] if len(sys.argv)>1 else 'index.html',encoding='utf8').read()
scripts=re.findall(r'<script(?![^>]*src)[^>]*>(.*?)</script>',src,re.S)
code='\n'.join(scripts)
out=set()
def lits(c):
  i=0;n=len(c)
  while i<n:
    ch=c[i]
    if ch=='/' and i+1<n and c[i+1]=='/':
      j=c.find('\n',i);i=n if j<0 else j;continue
    if ch=='/' and i+1<n and c[i+1]=='*':
      j=c.find('*/',i+2);i=n if j<0 else j+2;continue
    if ch in '\'"':
      j=i+1;buf=[]
      while j<n and c[j]!=ch:
        if c[j]=='\\':buf.append(c[j:j+2]);j+=2;continue
        if c[j]=='\n':break
        buf.append(c[j]);j+=1
      yield ''.join(buf);i=j+1;continue
    if ch=='`':
      j=i+1;buf=[];depth=0
      while j<n:
        if c[j]=='\\':buf.append(c[j:j+2]);j+=2;continue
        if c[j:j+2]=='${':
          # skip expression, collect nested literals
          k=j+2;d=1;start=k
          while k<n and d:
            if c[k]=='{':d+=1
            elif c[k]=='}':d-=1
            elif c[k] in '\'"`':
              q=c[k];k+=1
              while k<n and c[k]!=q:
                if c[k]=='\\':k+=1
                elif q=='`' and c[k:k+2]=='${':
                  # nested template expr: crude skip
                  dd=1;k+=2
                  while k<n and dd:
                    if c[k]=='{':dd+=1
                    elif c[k]=='}':dd-=1
                    k+=1
                  continue
                k+=1
            k+=1
          yield from lits(c[start:k-1]);buf.append('\x00');j=k;continue
        if c[j]=='`':break
        buf.append(c[j]);j+=1
      yield ''.join(buf);i=j+1;continue
    i+=1
CODEY=re.compile(r'^[\w$.#\[\]=\-:>*~+(),"\'/% !^|]*$')
def good(t):
  t=t.strip()
  if not re.search(r'[A-Za-z]{2}',t):return False
  if re.search(r'[{};=]|=>|\bfunction\b|\.(js|json|png|svg|webp|html)\b|https?:|^#|^\.|data:|var\(--|px\b|rgba?\(|cqh|cqw|\bvh\b',t):return False
  if re.fullmatch(r'[a-z0-9_\-]+',t):return False  # identifiers / classes
  if re.fullmatch(r'[a-z0-9_\-]+( [a-z0-9_\-]+)+',t) and not re.search(r'[aeiou]{1}[a-z]* [a-z]+ [a-z]+',t):return False
  if re.fullmatch(r'[A-Za-z0-9_]+',t) and not re.fullmatch(r'[A-Z][a-z]+',t) and t not in('OK','AI','XP','PGN','FEN','PIN','ON','OFF'):return False
  if re.fullmatch(r'[a-h][1-8](\s+[a-h][1-8])*|[KQRBNP]?[a-h]?[1-8]?x?[a-h][1-8].*',t):return False
  return True
norm=lambda s:re.sub(r'\s+',' ',s).strip()
for L in lits(code):
  if '<' in L or '\x00' in L or '&' in L:
    s=re.sub(r'<(script|style)[^>]*>.*?</\1>',' ',L,flags=re.S)
    for a in re.findall(r'(?:placeholder|aria-label|title)="([^"\x00]*)"',s):
      if good(a):out.add(norm(a))
    for seg in re.split(r'<[^>]*>',s):
      seg=html.unescape(seg)
      for part in [seg]:
        p=norm(part.replace('\x00','{s}'))
        p=re.sub(r'^(\{s\}\s*)+|(\s*\{s\})+$','',p).strip()
        if p and good(p.replace('{s}','')):out.add(p)
  else:
    p=norm(html.unescape(L))
    if good(p):out.add(p)
# Hinglish (second L2 argument) segments are not English UI text
HS=set()
for m in re.finditer(r"L2\(\s*(?:'(?:[^'\\]|\\.)*'|\"(?:[^\"\\]|\\.)*\"|`(?:[^`\\]|\\.)*`)\s*,\s*('((?:[^'\\]|\\.)*)'|\"((?:[^\"\\]|\\.)*)\"|`((?:[^`\\]|\\.)*)`)",code):
  t=m.group(2) or m.group(3) or m.group(4) or ''
  for seg in re.split(r'<[^>]*>|\$\{[^}]*\}',html.unescape(t)):
    seg=norm(seg)
    if seg:HS.add(re.sub(r'\d+','{n}',seg))
EN=set()
for m in re.finditer(r"L2\(\s*('((?:[^'\\]|\\.)*)'|\"((?:[^\"\\]|\\.)*)\"|`((?:[^`\\]|\\.)*)`)\s*,",code):
  t=m.group(2) or m.group(3) or m.group(4) or ''
  for seg in re.split(r'<[^>]*>|\$\{[^}]*\}',html.unescape(t)):
    seg=norm(seg)
    if seg:EN.add(re.sub(r'\d+','{n}',seg))
FEN=re.compile(r'^[rnbqkpRNBQKP{}n/]+(\s|$)')
def keep(k):
  if FEN.match(k) and k.count('/')>=3:return False
  if k in HS and k not in EN:return False
  if '\\n' in k or 'Reply in' in k or 'You are a' in k:return False
  if re.fullmatch(r'[a-z]+\.[a-z.]+',k):return False
  return True
keys=sorted(k for k in {re.sub(r'\d+','{n}',x) for x in out} if keep(k))
json.dump(keys,open(sys.argv[2] if len(sys.argv)>2 else '/dev/stdout','w'),ensure_ascii=False,indent=0)
print(len(keys),sum(map(len,keys)),file=sys.stderr)
