import subprocess,os
Y='syn/';K='sfx-kit/sounds/'
S={
 'P':[(Y+'P.wav',0,0,0,.3)],
 'N':[(Y+'N.wav',0,0,0,.6)],
 'B':[(Y+'B.wav',0,0,0,.5),(K+'everyday-props/props-shop-bell.wav',.05,-13,0,.6)],
 'K':[(Y+'K.wav',0,0,0,.6),(K+'impacts/impact-heavy-firm.wav',0,-6,0,.3)],
 'Nc':[(Y+'Nc.wav',0,0,0,.85),(K+'swishes-and-zips/swish-medium.wav',.2,-6,0,.2)],
 'cap1':[(K+'swishes-and-zips/swish-medium.wav',0,0,0,.2),(Y+'cap1.wav',.07,-3,0,.45)],
 'cap2':[(K+'swishes-and-zips/swish-hard.wav',0,0,0,.2),(Y+'cap2.wav',.07,0,0,.47)],
 'cap3':[(K+'swishes-and-zips/swish-hard.wav',0,0,0,.2),(Y+'cap3.wav',.07,0,0,.6),(K+'impacts/impact-heavy-hard.wav',.07,-3,0,.3)],
 'castle':[(Y+'castle.wav',0,0,0,1.5)],
 'promo':[(Y+'promo.wav',0,0,0,1.3),(K+'shimmers/shimmer-short-bright.wav',0,-6,0,.5)],
 'check':[(Y+'check.wav',0,0,0,.7),(K+'notifications/notification-alert-clear.wav',.05,-3,0,.66)],
 'win':[(Y+'win.wav',0,0,0,2.9),(K+'celebration/celebration-applause-small.wav',.9,-14,0,1.9)],
 'lose':[(Y+'lose.wav',0,0,0,2.9)],
}
POST={'P':-4,'B':-2,'cap1':-6,'cap2':-2.5,'cap3':0,'K':-1,'N':-2,'Nc':-1}
LP={'cap1':6000,'cap2':6000,'cap3':6000}
os.makedirs('out2',exist_ok=True)
for k,L in S.items():
  ins=[];fl=[]
  for i,(f,d,g,ss,du) in enumerate(L):
    ins+=['-i',f];fl.append(f'[{i}:a]aformat=sample_rates=44100:channel_layouts=mono,atrim={ss}:{ss+du:.3f},asetpts=PTS-STARTPTS,afade=t=out:st={max(0,du-.12):.3f}:d=0.12,volume={g}dB,adelay={int(d*1000)}[a{i}]')
  n=len(L);lp=f',lowpass=f={LP[k]}' if k in LP else ''
  mix=''.join(f'[a{i}]' for i in range(n))+(f'amix=inputs={n}:normalize=0' if n>1 else 'anull')+lp+f',loudnorm=I=-14:TP=-1.2:LRA=11,volume={POST.get(k,0)}dB,aresample=44100[o]'
  subprocess.run(['ffmpeg','-loglevel','error','-y',*ins,'-filter_complex',';'.join(fl)+';'+mix,'-map','[o]','-ac','1','-b:a','64k',f'out2/{k}.mp3'],check=True)
  print(k,os.path.getsize(f'out2/{k}.mp3'))
