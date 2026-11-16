import json,numpy as np
P=[];keys=set()
for s in range(4):
  for l in open(f'/tmp/claude-0/rk/d{s}.jsonl'):
    d=json.loads(l)
    if not any(r['good'] for r in d['rows']):continue
    P.append((s,d));[keys.update(k for k,v in r['f'].items() if isinstance(v,(int,float))) for r in d['rows']]
keys=sorted(keys);K={k:i for i,k in enumerate(keys)};D=len(keys)
rows=[];Y=[];seg=[];spl=[]
for i,(s,d) in enumerate(P):
  for r in d['rows']:
    x=np.zeros(D,np.float32)
    for k,v in r['f'].items():
      if k in K and isinstance(v,(int,float)):x[K[k]]=v
    rows.append(x);Y.append(r['good']);seg.append(i)
  spl.append(s)
X=np.array(rows);Y=np.array(Y,np.float32);seg=np.array(seg);spl=np.array(spl);N=len(P)
starts=np.r_[0,np.flatnonzero(np.diff(seg))+1]
cnt=np.bincount(seg,minlength=N)
trm=spl[seg]!=3
def topk(z,mask_pos):
  # rank within segment: count of moves with higher score (ties count half -> pessimistic: >=)
  res={1:0,3:0,5:0};
  zs=z.copy()
  for p in np.flatnonzero(mask_pos):
    a,b=starts[p],starts[p]+cnt[p];zz=zs[a:b];yy=Y[a:b];o=np.argsort(-zz,kind='stable')
    for k in res:res[k]+=yy[o[:k]].max()
  n=mask_pos.sum();return {k:round(100*v/n,1) for k,v in res.items()}
def fit(cols,iters=300,l2=1e-3):
  Xc=X[:,cols];w=np.zeros(len(cols),np.float32);m=np.zeros_like(w);v=np.zeros_like(w)
  Xt=Xc[trm];segt=seg[trm];Yt=Y[trm]
  ysum=np.bincount(segt,Yt,minlength=N);
  for t in range(1,iters+1):
    z=Xt@w;mx=np.full(N,-1e9,np.float32);np.maximum.at(mx,segt,z);e=np.exp(z-mx[segt]);se=np.bincount(segt,e,minlength=N)
    p=e/se[segt];yt=Yt/np.maximum(ysum[segt],1)
    g=Xt.T@(p-yt)/len(ysum.nonzero()[0])+l2*w
    m=.9*m+.1*g;v=.999*v+.001*g*g;w-=0.05*(m/(1-.9**t))/(np.sqrt(v/(1-.999**t))+1e-8)
  return w
te=spl==3;tr=~te
# greedy forward selection on a quick proxy (train top3 on subset)
sub=np.zeros(N,bool);sub[np.flatnonzero(tr)[:4000]]=True
sel=[];
import sys
cand=list(range(D))
for step in range(12):
  best=None
  for c in cand:
    if c in sel:continue
    w=fit(sel+[c],iters=120);sc=topk(X[:,sel+[c]]@w,sub)[3]
    if best is None or sc>best[0]:best=(sc,c,w)
  sel.append(best[1]);print(step,keys[best[1]],best[0],flush=True)
w=fit(sel,iters=400);print('full',dict(zip([keys[c] for c in sel],np.round(w,3))),'test',topk(X[:,sel]@w,te))
json.dump({'sel':[keys[c] for c in sel],'w':w.tolist()},open('/tmp/claude-0/rk/card.json','w'))
