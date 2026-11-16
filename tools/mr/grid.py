exec(open('/tmp/claude-0/rk/sim.py').read())
D=[(d,prep(d,pts4)) for s,d in P[:8000]]
res=[]
for q in itertools.product([0,1,2,3],repeat=5):
  if q[4]==0:continue
  h3=h5=0
  for d,(Gg,Gi) in D:
    good={i for i,r in enumerate(d['rows']) if r['good']}
    o=walk(Gi,q,5);h5+=any(m in good for m in o);h3+=any(m in good for m in o[:3])
  res.append((h5,h3,q))
res.sort(reverse=True);n=len(D)
for h5,h3,q in res[:10]:print(q,round(100*h5/n,1),round(100*h3/n,1))
res.sort(key=lambda x:-x[1])
for h5,h3,q in res[:5]:print('top3',q,round(100*h5/n,1),round(100*h3/n,1))
