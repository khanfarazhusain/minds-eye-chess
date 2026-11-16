import json,numpy as np
FE=['qGain','mate','check','fork','threat','pin','skewer','escapeAttack','defendAttacked','saveHang','newHang','allowFork','allowMate','stopMate','mateThreat','castle','develop','centralize','kingAttackers','mobDelta','pstDelta','rookOpen','pawnAdv','backRankThreat','trade','promo','allowChecks','knightRim','queenEarly','samePieceTwice','backRetreat','kingWalkMid','loseCastle','pawnBreak','shieldPawn','kCtr','capLoss','pawnThreat','pawnAttackPiece']
P=[]
for s in range(4):
  for l in open(f'/tmp/claude-0/rk/d{s}.jsonl'):
    d=json.loads(l)
    if any(r['good'] for r in d['rows']):P.append((s,d))
rows=[];Y=[];seg=[];spl=[]
for i,(s,d) in enumerate(P):
  for r in d['rows']:
    f=r['f'];rows.append([float(f.get(k,0) or 0) for k in FE]);Y.append(r['good']);seg.append(i)
  spl.append(s)
X=np.array(rows,np.float32);X[:,0]/=100;X[:,FE.index('pstDelta')]/=10;Y=np.array(Y,np.float32);seg=np.array(seg);spl=np.array(spl);N=len(P)
np.savez('/tmp/claude-0/rk/flat.npz',X=X,Y=Y,seg=seg,spl=spl)
def fit(Xc,m_,iters=600,l1=0.0):
  segt=seg[m_];Yt=Y[m_];Xt=Xc[m_];w=np.zeros(Xc.shape[1],np.float32);m=np.zeros_like(w);v=np.zeros_like(w)
  ys=np.bincount(segt,Yt,minlength=N);npos=(ys>0).sum()
  for t in range(1,iters+1):
    z=Xt@w;mx=np.full(N,-1e9,np.float32);np.maximum.at(mx,segt,z);e=np.exp(z-mx[segt]);se=np.bincount(segt,e,minlength=N)
    g=Xt.T@(e/se[segt]-Yt/np.maximum(ys[segt],1))/npos+l1*np.sign(w)
    m=.9*m+.1*g;v=.999*v+.001*g*g;w-=0.05*(m/(1-.9**t))/(np.sqrt(v/(1-.999**t))+1e-8)
  return w
def topk(z,mask):
  # vectorized: for each seg, rank of best good = number of moves with score > max good score
  zg=np.where(Y>0,z,-1e9);mg=np.full(N,-1e9);np.maximum.at(mg,seg,zg)
  above=np.bincount(seg,(z>mg[seg]).astype(float),minlength=N)
  return {k:round(100*(above[mask]<k).mean(),1) for k in (1,3,5)}
tr=spl[seg]!=3;te=spl==3
w=fit(X,tr);print('all',topk(X@w,te))
for k,v in sorted(zip(FE,w),key=lambda x:-abs(x[1])):print(k,round(float(v),2))
json.dump(dict(zip(FE,[float(x) for x in w])),open('/tmp/claude-0/rk/w_lin.json','w'))
