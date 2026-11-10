// js/ai/nn.js – VLASTNÍ AI NÁVRHÁŘ: malá neuronová síť (7 vstupů → 16 skrytých → výstupní hlavy), která vymýšlí druhy příšer i strategie.
// Učí se posilovaným učením (REINFORCE): odměna = skutečné poškození hráčů a doba přežití příšer. Váhy se ukládají mezi běhy.
const NI=8,NH=16,NR=4,OFF={};let NO=0;
[['body',GN.body.length],['move',GN.move.length],['atk',GN.atk.length],['pow',GN.pow.length],['num',5],['str',4]].forEach(([k,n])=>{OFF[k]=NO;NO+=n});
OFF.rule=NO;const RL=BCOND.length+BACT.length;NO+=NR*RL;
const sig=x=>1/(1+Math.exp(-x)),gauss=()=>{let u=0;for(let i=0;i<6;i++)u+=R();return(u-3)*1.414};
function initNN(){const r=(n,s)=>Array.from({length:n},()=>(R()-.5)*2*s);
 return{v:[NI,NH,NO],W1:r(NI*NH,.5),b1:new Array(NH).fill(0),W2:r(NH*NO,.1),b2:new Array(NO).fill(0),base:{sp:{m:0,s:1},st:{m:0,s:1}},hist:[],steps:0}}
let nn=(()=>{try{const j=JSON.parse(store.get('evo_nn')||'null');if(j&&j.v&&j.v[0]==NI&&j.v[1]==NH&&j.v[2]==NO&&j.W1.length==NI*NH&&j.W2.length==NH*NO&&j.b2.length==NO)return j}catch(e){}return initNN()})();
const saveNN=()=>store.set('evo_nn',JSON.stringify(nn,(k,v)=>typeof v=='number'?Math.round(v*1e4)/1e4:v));
const resetNN=()=>{nn=initNN();saveNN()};
function fwd(x){const h=new Array(NH),z=new Array(NO);
 for(let j=0;j<NH;j++){let s=nn.b1[j];for(let i=0;i<NI;i++)s+=x[i]*nn.W1[i*NH+j];h[j]=Math.tanh(s)}
 for(let o=0;o<NO;o++){let s=nn.b2[o];for(let j=0;j<NH;j++)s+=h[j]*nn.W2[j*NO+o];z[o]=s}return{h,z}}
function softmax(z,off,n){let m=-1e9;for(let i=0;i<n;i++)m=Math.max(m,z[off+i]);const e=[];let s=0;for(let i=0;i<n;i++){const v=Math.exp(z[off+i]-m);e.push(v);s+=v}return e.map(v=>v/s)}
function pickC(z,off,n,tr){const p=softmax(z,off,n);let u=R(),i=0;for(;i<n-1;i++){u-=p[i];if(u<=0)break}tr.push({t:'c',off,n,i,p});return i}
function pickG(z,off,tr){const mu=sig(z[off]),x=cl(mu+.15*gauss(),0,1);tr.push({t:'g',off,mu,x});return x}
const inVec=()=>[prof.still,prof.near,prof.far,prof.edge,prof.acc,Math.min(1,st.wave/20),prof.mel||0,1];
// navrhne nový druh: vzorkuje z rozdělení pravděpodobností, které síť vydala pro aktuální styl hráčů
function nnSpecies(){const x=inVec(),{h,z}=fwd(x),tr=[],g={};
 for(const k of['body','move','atk','pow'])g[k]=GN[k][pickC(z,OFF[k],GN[k].length,tr)];
 ['size','speed','hp','dmg','hue'].forEach((k,i)=>{g[k]=NG[k][0]+pickG(z,OFF.num+i,tr)*(NG[k][1]-NG[k][0])});
 g.brain=[];for(let r=0;r<NR;r++){const o=OFF.rule+r*RL;g.brain.push([BCOND[pickC(z,o,BCOND.length,tr)],BACT[pickC(z,o+BCOND.length,BACT.length,tr)]])}
 return{g,tr:{x,h,items:tr}}}
function nnStrat(){const x=inVec(),{h,z}=fwd(x),tr=[],v=[0,1,2,3].map(i=>pickG(z,OFF.str+i,tr));
 return{s:{flankP:v[0]*.9,gather:Math.round(v[1]*8),hold:10+v[2]*10,bait:v[3]*.4},tr:{x,h,items:tr}}}
// jeden krok učení: zvýší pravděpodobnost rozhodnutí, která vedla k nadprůměrné odměně, a sníží ostatní
let NNFREEZE=false;const EVALR=[];
function learnNN(kind,tr,r,advO){if(NNFREEZE){EVALR.push(r);return}const B=nn.base[kind],adv=cl(advO!==undefined?advO:(r-B.m)/(B.s+.5),-2,2);B.m=B.m*.9+r*.1;B.s=B.s*.9+Math.abs(r-B.m)*.1;
 nn.hist.push(Math.round(r*100)/100);if(nn.hist.length>400)nn.hist.shift();
 const dz=new Array(NO).fill(0),lr=.03;
 for(const e of tr.items){if(e.t=='c'){const H=-e.p.reduce((s,p)=>s+p*Math.log(p+1e-9),0);
   for(let j=0;j<e.n;j++)dz[e.off+j]+=adv*((j==e.i?1:0)-e.p[j])+.01*(-e.p[j]*(Math.log(e.p[j]+1e-9)+H))}
  else dz[e.off]+=adv*((e.x-e.mu)/.0225)*e.mu*(1-e.mu)}
 for(let o=0;o<NO;o++)dz[o]=cl(dz[o],-2,2);
 const dh=new Array(NH).fill(0);
 for(let j=0;j<NH;j++)for(let o=0;o<NO;o++){const k=j*NO+o;dh[j]+=nn.W2[k]*dz[o];nn.W2[k]+=lr*tr.h[j]*dz[o]}
 for(let o=0;o<NO;o++)nn.b2[o]+=lr*dz[o];
 for(let j=0;j<NH;j++){const dp=dh[j]*(1-tr.h[j]*tr.h[j]);nn.b1[j]+=lr*dp;for(let i=0;i<NI;i++)nn.W1[i*NH+j]+=lr*tr.x[i]*dp}
 nn.steps++}
