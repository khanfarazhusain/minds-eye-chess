import json,numpy as np,sys
P=[];keys=set()
for s in range(4):
  for l in open(f'/tmp/claude-0/rk/d{s}.jsonl'):
    d=json.loads(l);P.append((s,d))
    for r in d['rows']:keys.update(k for k,v in r['f'].items() if isinstance(v,(int,float)))
keys=sorted(keys);K={k:i for i,k in enumerate(keys)}
def vec(r,ph):
  x=np.zeros(len(keys));
  for k,v in r['f'].items():
    if k in K and isinstance(v,(int,float)):x[K[k]]=v
  return x
X=[];Y=[];S=[];split=[]
for s,d in P:
  ph=min(d['ph'],24)/24
  x=np.array([vec(r,ph) for r in d['rows']]);y=np.array([r['good'] for r in d['rows']],float)
  if y.sum()==0:continue
  X.append(x);Y.append(y);split.append(s)
mu=np.concatenate(X).mean(0);sd=np.concatenate(X).std(0)+1e-6
X=[(x-mu)/sd for x in X]
tr=[i for i,s in enumerate(split) if s!=3];te=[i for i,s in enumerate(split) if s==3]
def ev(W,idx,hid=None):
  h={1:0,3:0,5:0}
  for i in idx:
    z=score(W,X[i]);o=np.argsort(-z)
    for k in h:h[k]+=Y[i][o[:k]].max()
  return {k:round(100*v/len(idx),1) for k,v in h.items()}
H=int(sys.argv[1]) if len(sys.argv)>1 else 0
rng=np.random.default_rng(0);D=len(keys)
if H: W={'a':rng.normal(0,.1,(D,H)),'b':np.zeros(H),'c':rng.normal(0,.1,H)}
else: W={'w':np.zeros(D)}
def score(W,x):
  if H: return np.maximum(x@W['a']+W['b'],0)@W['c']
  return x@W['w']
lr=0.05;m={k:np.zeros_like(v) for k,v in W.items()};v2={k:np.zeros_like(v) for k,v in W.items()};t=0
for ep in range(12):
  rng.shuffle(tr)
  for bi in range(0,len(tr),64):
    g={k:np.zeros_like(v) for k,v in W.items()}
    for i in tr[bi:bi+64]:
      x=X[i];y=Y[i]/Y[i].sum()
      if H: a=x@W['a']+W['b'];hh=np.maximum(a,0);z=hh@W['c']
      else: z=x@W['w']
      p=np.exp(z-z.max());p/=p.sum();dz=p-y
      if H:
        g['c']+=hh.T@dz;dh=np.outer(dz,W['c'])*(a>0);g['a']+=x.T@dh;g['b']+=dh.sum(0)
      else: g['w']+=x.T@dz
    t+=1
    for k in W:
      gg=g[k]/64+1e-4*W[k];m[k]=.9*m[k]+.1*gg;v2[k]=.999*v2[k]+.001*gg*gg
      W[k]-=lr*.1*(m[k]/(1-.9**t))/(np.sqrt(v2[k]/(1-.999**t))+1e-8)
  print(ep,'train',ev(W,tr[:3000]),'test',ev(W,te),flush=True)
np.savez(f'/tmp/claude-0/rk/W{H}.npz',keys=np.array(keys),mu=mu,sd=sd,**W)
if not H:
  o=np.argsort(-np.abs(W['w']/sd))[:25];print([(keys[i],round(W['w'][i]/sd[i],3)) for i in o])
