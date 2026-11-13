const E=require('./me-engine.js');
function perft(p,d){if(!d)return 1;const buf=new Int32Array(256);const n=p.gen(buf,0,false);let c=0;for(let i=0;i<n;i++){if(!p.make(buf[i]))continue;c+=perft(p,d-1);p.unmake();}return c;}
const tests=[['rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',4,197281],
['r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1',3,97862],
['8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1',5,674624],
['r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1',4,422333],
['rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8',3,62379]];
for(const [f,d,e] of tests){const p=new E.Position(f);const t=Date.now();const r=perft(p,d);console.log(r===e?'OK':'FAIL',r,e,Date.now()-t+'ms', p.fen()===f);}
