import numpy as np, wave, os
SR=44100;R=np.random.default_rng(7)
def T(d):return np.arange(int(SR*d))/SR
def wr(name,x):
  x=np.asarray(x,float);m=np.max(np.abs(x))or 1;x=x/m*0.9
  with wave.open('syn/'+name+'.wav','wb') as w:
    w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR);w.writeframes((x*32767).astype('<i2').tobytes())
def biq(x,f,q=0.7,kind='lp'):
  w0=2*np.pi*f/SR;a=np.sin(w0)/(2*q);c=np.cos(w0)
  if kind=='lp':b=[(1-c)/2,1-c,(1-c)/2]
  elif kind=='hp':b=[(1+c)/2,-(1+c),(1+c)/2]
  else:b=[a,0,-a]
  A=[1+a,-2*c,1-a];b=[v/A[0] for v in b];A=[v/A[0] for v in A]
  y=np.zeros_like(x);x1=x2=y1=y2=0.0
  for i,v in enumerate(x):
    o=b[0]*v+b[1]*x1+b[2]*x2-A[1]*y1-A[2]*y2;x2=x1;x1=v;y2=y1;y1=o;y[i]=o
  return y
def env(t,a,tau):return np.minimum(1,t/max(a,1e-4))*np.exp(-np.maximum(0,t-a)/tau)
def place(buf,x,at):
  i=int(at*SR);n=min(len(x),len(buf)-i);buf[i:i+n]+=x[:n];return buf
def modes(d,parts,noise=0,nt=.005):
  t=T(d);y=sum(g*np.sin(2*np.pi*f*t+R.random()*6)*np.exp(-t/tau) for f,g,tau in parts)
  if noise:y=y+noise*R.standard_normal(len(t))*np.exp(-t/nt)
  return y
# --- footsteps ---
def gravel(d=.28):
  t=T(d);n=R.standard_normal(len(t))*env(t,.006,.05);cr=np.zeros(len(t))
  for k in range(70):
    at=R.random()*.15;g=R.random()**2;place(cr,g*R.standard_normal(60)*np.exp(-np.arange(60)/12),at)
  return biq(biq(n*.6+cr*env(t,.01,.08),3500,.7,'lp'),300,.7,'hp')+0.6*modes(d,[(95,1,.04),(160,.5,.03)])
def wood(d=.2,f0=180):return modes(d,[(f0,1,.05),(f0*2.33,.6,.03),(f0*5.1,.35,.012)],.4,.003)
def clop(f=1.0):return modes(.18,[(520*f,1,.016),(830*f,.7,.012),(1350*f,.3,.008),(140,.8,.035)],.6,.004)
def sand(d=.35):
  t=T(d);n=R.standard_normal(len(t));g=1+0.8*R.standard_normal(len(t)//200+1).repeat(200)[:len(t)]
  return biq(biq(n*g*env(t,.02,.09),2600,.8,'bp'),5000,.7,'lp')
def rock(d=.3):
  t=T(d);n=R.standard_normal(len(t))*env(t,.004,.04)
  return biq(n,900,.7,'lp')+modes(d,[(70,1.2,.07),(120,.6,.05)])
def metal(d=.5,base=1240,n=6,tau=.18):
  rat=[1,1.78,2.56,3.65,4.42,5.83,7.1]
  return modes(d,[(base*rat[i],1/(1+i*.5),tau/(1+i*.35)) for i in range(n)],.3,.002)
def chain(d=.5):
  y=np.zeros(int(SR*d))
  for k in range(14):place(y,.4*R.random()*metal(.12,2400+R.random()*2600,4,.03),R.random()*.25)
  return y
def sword(d=.7,base=1650,tau=.32):
  t=T(d);sc=biq(R.standard_normal(len(t))*env(t,.03,.03),4000,1.2,'bp')*.5
  y=metal(d,base,7,tau);y=np.concatenate([np.zeros(int(.012*SR)),y])[:len(t)]
  return y+sc
# --- brass ---
def brass(f,d,a=.035,vib=5.5):
  t=T(d);ph=2*np.pi*f*t+.004*f/vib*np.sin(2*np.pi*vib*t)*np.minimum(1,t/.25)
  y=sum((1/k)*np.sin(k*ph)*np.exp(-t*(k-1)*.9) for k in range(1,12))
  e=np.minimum(1,t/a)*np.minimum(1,(d-t)/.06)*(0.85+0.15*np.exp(-t/.08))
  return biq(y*e,2600+f*1.5,.7,'lp')
def nf(n):return 440*2**((n-69)/12)
def seq(notes,tot,amp=1):
  y=np.zeros(int(SR*tot))
  for n,at,d,g in notes:
    for m in (n if isinstance(n,(list,tuple)) else [n]):place(y,g*amp*brass(nf(m),d),at)
  return y
def timp(f=73,d=1.2):return modes(d,[(f,1,.45),(f*1.5,.4,.25),(f*1.99,.25,.18)],.5,.01)
# build
P=np.zeros(int(.4*SR));place(P,gravel(),0);place(P,.35*wood(.2,210),.03);wr('P',P)
N=np.zeros(int(.7*SR))
for at,g,f in [(0,.8,1),(.085,.6,1.06),(.2,1,.95),(.33,.5,1.02),(.42,.45,.97)]:place(N,g*clop(f),at)
wr('N',N)
Nc=np.zeros(int(.9*SR))
for at,g,f in [(0,.6,1),(.07,.5,1.05),(.16,.9,.95),(.24,.8,.9)]:place(Nc,g*clop(f),at)
place(Nc,.6*sword(.6,1500,.22),.28);wr('Nc',Nc)
B=np.zeros(int(.6*SR));place(B,sand(),0);place(B,.8*sand(),.18);wr('B',B)
K=np.zeros(int(.8*SR));place(K,rock(),0);place(K,.35*chain(.5),.06);place(K,.25*metal(.5,980,5,.2),.08);wr('K',K)
for nm,b,tau in [('cap1',1650,.25),('cap2',1820,.28),('cap3',1500,.4)]:
  y=np.zeros(int(.8*SR));place(y,sword(.7,b,tau),0);wr(nm,y)
y=np.zeros(int(1.0*SR));place(y,sword(.9,2100,.5),0);place(y,.5*sword(.6,2350,.35),.12);wr('check',y)
g=np.zeros(int(1.6*SR));t=T(.75);gr=biq(R.standard_normal(len(t))*np.minimum(1,t/.5)*np.minimum(1,(.75-t)/.03),220,1.2,'bp')*1.4
place(g,gr,0);place(g,1.3*timp(58,.9),.72);place(g,.6*rock(.4),.72);place(g,.5*chain(.6),.74);wr('castle',g)
pr=seq([(72,0,.11,.8),(76,.11,.11,.8),(79,.22,.11,.85),([72,76,79,84],.33,.8,.5)],1.3);wr('promo',pr)
win=seq([(67,0,.14,.8),(72,.14,.14,.8),(76,.28,.14,.85),(79,.42,.3,.9),(76,.74,.12,.75),([67,72,76,79,84],.86,1.6,.38)],2.9)
place(win,.9*timp(65,1.5),.86);wr('win',win)
lose=seq([(67,0,.35,.7),(63,.38,.35,.7),(60,.76,.35,.7),([48,55,60,63],1.14,1.5,.4)],2.9,.9)
place(lose,.9*timp(49,1.6),1.14);wr('lose',lose)
print('ok')
