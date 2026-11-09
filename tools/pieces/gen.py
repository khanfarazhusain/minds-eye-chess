# Original 64 Squares piece artwork (drawn from scratch for this app). Generates SVGs per style.
import os,sys,json
BASE='M10.5 33.5h24a1.5 1.5 0 0 1 1.5 1.5v2.5a1.5 1.5 0 0 1-1.5 1.5h-24A1.5 1.5 0 0 1 9 37.5V35a1.5 1.5 0 0 1 1.5-1.5z'
G={
 'P':{'body':['M22.5 8a4.6 4.6 0 0 0-2.7 8.3c-2 1-3.3 2.6-3.3 4.2h12c0-1.6-1.3-3.2-3.3-4.2A4.6 4.6 0 0 0 22.5 8z',
              'M18.8 20.5c-.2 5.4-3.2 9.2-6 13h19.4c-2.8-3.8-5.8-7.6-6-13z',BASE],'det':[]},
 'R':{'body':['M11.5 8.5h4.5v3.5h3.2V8.5h6.6v3.5H29V8.5h4.5v7l-2.5 2.5H14l-2.5-2.5z',
              'M14.5 18h16l-.6 10.5H15.1z','M13 28.5h19l1.5 5h-22z',BASE],'det':['M14 18h17','M15 28.5h15']},
 'B':{'body':['M22.5 5.2a2.4 2.4 0 1 1 0 4.8 2.4 2.4 0 0 1 0-4.8z',
              'M22.5 10c-4.8 3.2-7.6 7.3-7.6 11 0 3 1.8 4.7 3.1 5.5h9c1.3-.8 3.1-2.5 3.1-5.5 0-3.7-2.8-7.8-7.6-11z',
              'M17.2 26.5h10.6l-.9 3H18.1z','M18.2 29.5c-1.2 2.1-3.2 3.2-5.6 4h19.8c-2.4-.8-4.4-1.9-5.6-4z',BASE],'det':['M25.2 14.6l-4.6 4.6','M18 26.5h9']},
 'Q':{'body':['M10.5 13.5l4 14h16l4-14-6 7.5-2-9.5-4.5 8.5-4.5-8.5-2 9.5z',
              'M14.5 27.5h16l-1 3h-14z','M15.5 30.5c-1 1.4-2.2 2.3-3.9 3h21.8c-1.7-.7-2.9-1.6-3.9-3z',BASE,
              'C10.5 12.5 2.2','C16.5 10.8 2.1','C22.5 10 2.2','C28.5 10.8 2.1','C34.5 12.5 2.2'],'det':['M15 27.5h15']},
 'K':{'body':['M21.2 3.5h2.6v2.6h2.6v2.6h-2.6v3.2h-2.6V8.7h-2.6V6.1h2.6z',
              'M22.5 11.8c-1.8 0-3 1.3-3 2.9 0 .9.3 1.6.8 2.2-3.2-1.9-9.1-1.6-10.1 2.9-.9 4.1 2.7 6.9 4.8 8.7h15c2.1-1.8 5.7-4.6 4.8-8.7-1-4.5-6.9-4.8-10.1-2.9.5-.6.8-1.3.8-2.2 0-1.6-1.2-2.9-3-2.9z',
              'M14.8 27.5h15.4l-1 3H15.8z','M15.8 30.5c-1 1.4-2.2 2.3-3.9 3h21.2c-1.7-.7-2.9-1.6-3.9-3z',BASE],'det':['M22.5 16.9v10.6','M15.3 27.5h14.4']},
 'N':{'body':['M24.2 8.6c6.6.7 10.6 5.6 11 13.4.3 5.2-.8 8.6-1.6 11.5H16c-.4-3.6 2.4-6.4 5.4-8.7 2.2-1.7 3-3.7 2.5-5.6-1.3 2-3.6 3-5.6 3.4-1.4.3-2.6 1.3-3.5 2.4-1 1.2-2.8 1-3.3-.4-.4-1.2.1-2.4.1-2.4s-1.5-.3-1.3-2c.3-2 3.6-5.8 5.6-7.6 1.1-1 1.6-2.4 1.8-3.7.6-.9 1.6-1.4 2.6-1.3.1-1.1.7-2.6 1.8-3.2.8.9 1.4 1.7 1.7 2.6z',BASE],
      'det':['C17.8 14.8 1.1','M11.3 21.9c.6-.2 1.2-.6 1.5-1.1','M26.5 11.4c3.6 2 5.6 5.6 5.9 10.3']},
}
STYLES={
 # name: (white fill, white stroke, white detail, black fill, black stroke, black detail, stroke width, defs)
 'bold':  dict(wf='#FFFFFF',ws='#111',wd='#111',bf='#1E1E22',bs='#000',bd='#E9E9E9',sw=1.6),
 'flat':  dict(wf='#F6EEDC',ws='#A8977A',wd='#B9A889',bf='#3B3B46',bs='#24242C',bd='#8B8B99',sw=.9,shadow=1),
 'royal': dict(wf='url(#gw)',ws='#8A6A1F',wd='#8A6A1F',bf='url(#gb)',bs='#D9B24C',bd='#E7C65E',sw=1.4,
               defs='<linearGradient id="gw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFDF6"/><stop offset="1" stop-color="#E9DDBD"/></linearGradient><linearGradient id="gb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5A3A22"/><stop offset="1" stop-color="#2A170B"/></linearGradient>'),
 'glass': dict(wf='url(#gw)',ws='#2C6FB0',wd='#2C6FB0',bf='url(#gb)',bs='#7A1730',bd='#FFC2CF',sw=1.4,
               defs='<linearGradient id="gw" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".55" stop-color="#D6ECFF"/><stop offset="1" stop-color="#9CCBF5"/></linearGradient><linearGradient id="gb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F0607E"/><stop offset=".55" stop-color="#B3203F"/><stop offset="1" stop-color="#6E0E22"/></linearGradient>'),
 'outline':dict(wf='#FFFFFF',ws='#111',wd='#111',bf='#111',bs='#111',bd='#FFFFFF',sw=2.4,thin=1),
}
def shape(d,fill,stroke,sw):
  if d.startswith('C'):
    cx,cy,r=d[1:].split();return f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>'
  return f'<path d="{d}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" stroke-linejoin="round"/>'
def svg(style,col,p):
  S=STYLES[style];f,s,dc=(S['wf'],S['ws'],S['wd']) if col=='w' else (S['bf'],S['bs'],S['bd'])
  sw=S['sw'];out=[]
  if S.get('defs'):out.append('<defs>'+S['defs']+'</defs>')
  g=G[p]
  if S.get('shadow'):
    out.append('<g transform="translate(.8 1)" opacity=".28">'+''.join(shape(d,'#000','none',0) for d in g['body'])+'</g>')
  # draw body back-to-front: base last so it overlaps cleanly
  order=[d for d in g['body'] if d!=BASE]+[BASE]
  if p=='Q':order=[d for d in g['body'] if d.startswith('C')]+[d for d in g['body'] if not d.startswith('C') and d!=BASE]+[BASE]
  for d in order:out.append(shape(d,f,s,sw))
  for d in g['det']:
    if d.startswith('C'):out.append(shape(d,dc,'none',0))
    else:out.append(f'<path d="{d}" fill="none" stroke="{dc}" stroke-width="{1.3 if sw else 1.5}" stroke-linecap="round"/>')
  return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">{"".join(out)}</svg>'
outdir=sys.argv[1]
for st in STYLES:
  os.makedirs(f'{outdir}/{st}',exist_ok=True)
  for c in 'wb':
    for p in 'KQRBNP':open(f'{outdir}/{st}/{c}{p}.svg','w').write(svg(st,c,p))
print('ok')
