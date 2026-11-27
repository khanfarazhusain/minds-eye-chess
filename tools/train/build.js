// Pro-training ladders ko course.html (TRAIN) mein likhta hai, sequence check karta hai, phir road.html rebuild.
// Pro Training section ka UI (section.js/.css) bhi course.html mein daalta hai.
// Run: node tools/train/build.js
const fs=require('fs'),path=require('path'),cp=require('child_process');const {ROOT}=require('./lib');
const ORDER=['eval','endgame','defence','rush','spar','guess','review'];/* ladders/<name>.json, jo maujood hain */
const T=[];for(const n of ORDER){const f=path.join(__dirname,'ladders',n+'.json');if(fs.existsSync(f))T.push(...JSON.parse(fs.readFileSync(f,'utf8')))}
const p=path.join(ROOT,'course.html');let s=fs.readFileSync(p,'utf8');
const a=s.indexOf('/*TRAIN-DATA*/'),b=s.indexOf('/*TRAIN-DATA-END*/');if(a<0||b<0)throw new Error('TRAIN markers missing in course.html');
s=s.slice(0,a+14)+JSON.stringify(T).replace(/<\/script/gi,'<\\/script')+s.slice(b);fs.writeFileSync(p,s);
console.log('TRAIN: '+T.length+' drill lessons, '+T.reduce((n,x)=>n+x.les.steps.length+(x.les.pool||[]).length,0)+' items');
cp.execFileSync('node',[path.join(__dirname,'inject-section.js')],{stdio:'inherit'}); /* Pro Training section (7 modes) ka UI */
cp.execFileSync('node',[path.join(__dirname,'check-order.js')],{stdio:'inherit'});
cp.execFileSync('node',[path.join(ROOT,'tools','road','build.js')],{stdio:'inherit'});
