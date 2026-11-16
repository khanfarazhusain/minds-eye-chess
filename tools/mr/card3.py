exec(open('/tmp/claude-0/rk/sim.py').read())
CARD={'qGain':10/100,'stopMate':12,'mateThreat':10,'castle':9,'fork':8,'trade':7,'check':7,'threat':6,'defendAttacked':6,'pawnAdv':6,'loseCastle':-5,'allowFork':-5,'samePieceTwice':-5,'kCtr':-5,'escapeAttack':4,'allowChecks':-3,'pawnThreat':3,'allowMate':-100,'mate':1000}
def cardpts(f):
  s=sum(w*(f.get(k,0) or 0) for k,w in CARD.items());s+=6*(f.get('pstDelta',0) or 0)/10;return s
def cardint(f):
  s=0
  for k,w in CARD.items():
    v=f.get(k,0) or 0
    if k=='qGain': s+=round(v/100)*10
    elif v: s+=w*(1 if k not in('pawnAdv','kCtr','allowChecks') else v)
  d=f.get('pstDelta',0) or 0;s+=3 if d>=8 else 2 if d>=4 else 1 if d>=1 else -3 if d<=-8 else -2 if d<=-4 else -1 if d<=-1 else 0
  return s*10+d/10
for name,fn in [('pts4',pts4),('card',cardpts),('cardint',cardint)]:
  D=[(d,prep(d,fn)) for s,d in P if s==3]
  for q in [(0,0,0,0,1),(1,0,0,0,3),(2,1,1,1,1),(1,0,1,0,3)]:
    h3=h5=0
    for d,(Gg,Gi) in D:
      good={i for i,r in enumerate(d['rows']) if r['good']};o=walk(Gi,q,5);h5+=any(m in good for m in o);h3+=any(m in good for m in o[:3])
    print(name,q,round(100*h3/len(D),1),round(100*h5/len(D),1),flush=True)
