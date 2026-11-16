import json,itertools,numpy as np,sys
V={0:0,1:1,2:3,3:3,4:5,5:9}
P=[]
for s in range(4):
  for l in open(f'/tmp/claude-0/rk/d{s}.jsonl'):
    d=json.loads(l)
    if any(r['good'] for r in d['rows']):P.append((s,d))
def g4(f): return 4*f.get('qGain',0)/100*10 if False else 0
def pts4(f): # simplePts(f,4)*10 + pstDelta/10 replicated approx
  p=round((f.get('qGain',0))/100)*10+(3 if (f.get('check') or f.get('mate')) else 0)+(2 if f.get('threat') else 0)+(-100 if f.get('allowMate') else 0)
  sq=f.get('sqL');
  if sq is None:
    d=f.get('pstDelta',0);sq=3 if d>=8 else 2 if d>=4 else 1 if d>=1 else -3 if d<=-8 else -2 if d<=-4 else -1 if d<=-1 else 0
  return (p+sq)*10+f.get('pstDelta',0)/10
def prep(d,quiet):
  rows=d['rows'];info=[]
  for i,r in enumerate(rows):
    f=r['f'];pc=next((int(k[2:]) for k in f if k.startswith('pc') and k[2:].isdigit()),0)
    info.append(dict(i=i,good=r['good'],cap=f.get('cap',0),see=f.get('see',0),chk=f.get('chk',0),att=f.get('att',0),pc=pc,
      thr=(f.get('threat',0) or 0)+(f.get('pawnAttackPiece',0) or 0)+(f.get('pin',0) or 0)+(f.get('skewer',0) or 0),dev=quiet(f)))
  G=[sorted([x for x in info if x['cap'] and x['see']>=0],key=lambda x:(-x['cap'],V.get(x['pc'],0))),
     sorted([x for x in info if x['chk']],key=lambda x:-x['see']),
     sorted([x for x in info if x['att'] and x['pc']!=6],key=lambda x:(-x['att'],-x['dev'])),
     sorted([x for x in info if x['thr']>0],key=lambda x:(-x['thr'],-x['dev'])),
     sorted(info,key=lambda x:-x['dev'])]
  return [[x['good'] for x in g] for g in G],[[x['i'] for x in g] for g in G]
def walk(Gi,q,K):
  seen=set();out=[];ix=[0]*5;added=True
  while added and len(out)<K:
    added=False
    for g in range(5):
      t=0
      while t<q[g] and ix[g]<len(Gi[g]):
        m=Gi[g][ix[g]];ix[g]+=1
        if m not in seen:seen.add(m);out.append(m);t+=1;added=True
  return out[:K]
