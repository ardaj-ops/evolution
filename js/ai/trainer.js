// js/ai/trainer.js – SAMOHRA: AI se učí na simulovaných hráčích (kempař, kiter, bojovník, okrajář, střelec naslepo) bez vykreslování
const TR={on:false,run:0,n:0,style:'camper',tick:0},STYLES=['camper','kiter','brawler','edge','sprayer'];
function nearE(p){let b=null,bd=1e9;for(const e of en){const d=hyp(e.x-p.x,e.z-p.z);if(d<bd){bd=d;b=e}}return b}
function botTick(){const p=P[1],tg=nearE(p);let dx=0,dz=0,ax=p.x+1,az=p.z;
 if(tg){ax=tg.x;az=tg.z;const d=hyp(tg.x-p.x,tg.z-p.z)||1,ux=(tg.x-p.x)/d,uz=(tg.z-p.z)/d;
  if(TR.style=='kiter'&&d<16){dx=-ux;dz=-uz}else if(TR.style=='brawler'&&d>4){dx=ux;dz=uz}}
 if(TR.style=='edge'){if(Math.abs(p.x)>ar-5||Math.abs(p.z)>ar-5){dx=-Math.sign(p.z||1)*.7;dz=Math.sign(p.x||1)*.7}else dx=p.x>=0?1:-1}
 if(TR.style=='sprayer'){ax+=(R()-.5)*30;az+=(R()-.5)*30}
 {const mm=WP[p.wp].mel;if(mm&&tg){const d=hyp(tg.x-p.x,tg.z-p.z)||1;if(d>mm.r*.6){dx=(tg.x-p.x)/d;dz=(tg.z-p.z)/d}else{dx=0;dz=0}}}
 p.inp={dx,dz,ax,az,f:1};if(st.ph=='pick')for(const id in P)pickUp(id,R()*3|0);
 st.t+=1/60;upd(1/60);ev.length=0;TR.tick++}
function beginTrainRun(){TR.run++;TR.style=STYLES[(TR.run-1)%STYLES.length];for(const k in P)delete P[k];P[1]=newPlayer(1,TR.run%CLS.length);startRun();P[1].mhp=P[1].hp=1e6;TR.tick=0}
function startTrain(n){if(TR.on||net.on||st.ph!='menu')return;TR.on=true;TRAIN=true;TR.n=n;TR.run=0;menuMsg='';beginTrainRun()}
function trainSlice(){const t0=performance.now();while(TR.on&&performance.now()-t0<12){botTick();if(st.wave>=8||TR.tick>14000){saveNN();if(TR.run>=TR.n)finishTrain();else beginTrainRun()}}}
function finishTrain(){TR.on=false;TRAIN=false;for(const k in P)delete P[k];[en,bl,eb,hz,ev,evOut].forEach(a=>a.length=0);
 Object.assign(st,{ph:'menu',wave:0,score:0,sp:[],str:[],strA:{},actS:[],spawnQ:[],tl:{flank:0,pred:0,pack:0,stand:0}});prof={still:.2,near:.2,far:.2,edge:.15,acc:.5,mel:0};vs=null;
 menuMsg='Trénink dokončen – síť má '+nn.steps+' kroků učení.';ovKey=''}
