// js/systems/waves.js – vlny podle profilu hráčů + výběr vylepšení mezi vlnami
function nextWave(){st.wave++;learn();if(st.wave>1&&!TRAIN){const mh=Object.values(P).reduce((s,p)=>s+p.mhp,0)||100;st.dir=cl(st.dir*(1+(.35-st.wl/mh)*.6),.6,1.5)}st.wl=0;const f=flags(prof);st.notes=RT.filter((_,i)=>f[i]);if(!st.notes.length)st.notes=['Hra vás zatím sleduje…'];
 const mix={chaser:4};st.mortarRate=f[0]?Math.max(1.8,3.8-st.wave*.12):0;st.mortarT=st.mortarRate;
 const w=st.wave;if(f[1]){mix.runner=3;mix.shooter=2;if(w>=3)mix.phaser=2}if(f[2]){mix.tank=2;if(w>=3)mix.bomber=3}st.surround=f[3];if(f[4])mix.swarm=7;if(f[5]){mix.dodger=3;if(w>=3)mix.healer=2}if(f[6]){mix.thorn=3;mix.shooter=(mix.shooter||0)+2;if(w>=3)mix.phaser=(mix.phaser||0)+1}if(w>=4)mix.splitter=1+(w/4|0);
 const L=st.tl,up=(k,on)=>L[k]=cl(L[k]+(on?1:-.5),0,4);up('flank',f[0]||f[3]);up('pred',f[1]);up('pack',f[4]);up('stand',f[6]);TT.forEach(([k,t])=>{if(L[k]>=1)st.notes.push(`${t} (úr. ${L[k]|0})`)});
 const evn=evolve().concat(evolveStrat());if(!TRAIN)saveNN();st.notes.push(...evn);HOOKS.wave.forEach(f=>f());const sps=st.sp.map(s=>'x'+s.id),sh=Math.min(.6,.12+.07*st.wave);
 const pool=[];for(const k in mix)for(let i=0;i<mix[k];i++)pool.push(k);
 const n=Math.min(50,Math.round((5+st.wave*2)*(.65+.35*Object.keys(P).length)*DF[opt.dif].n*st.dir));st.spawnQ=[];for(let i=0;i<n;i++)st.spawnQ.push(sps.length&&R()<sh?sps[R()*sps.length|0]:pool[R()*pool.length|0]);if(st.wave%5==0){const b=st.sp[0];st.spawnQ.push('B'+(b?'x'+b.id:'tank'));st.notes.push('⚠ BOSS: '+(b?b.name:'Tank'))}
 st.wT=1.5}
function spawning(dt){st.spawnT-=dt;if(st.spawnQ.length&&st.spawnT<=0){spawn(st.spawnQ.pop());const c=st.tl.pack|0;for(let i=0;i<c&&st.spawnQ.length;i++)spawn(st.spawnQ.pop(),en[en.length-1]);st.spawnT=.5+c*.5}if(st.mortarRate)spawnMortar(dt)}
function waveFlow(dt){if(st.spawnQ.length||en.length||(st.wT-=dt)>0)return;startPick()}
function startPick(){st.ph='pick';st.pickT=20;const ks=Object.keys(UP);
 for(const id in P){const p=P[id];if(p.dead){p.dead=false;p.hp=p.mhp*.5}else p.hp=Math.min(p.mhp,p.hp+12);p.offer=ks.sort(()=>R()-.5).slice(0,3+p.ml.cards)}}
function pickUp(id,i){const p=P[id];if(p&&p.offer&&p.offer[i]){applyUp(p,p.offer[i]);p.offer=null}}
function pickTick(dt){if((st.pickT-=dt)<=0)for(const id in P)pickUp(id,0);if(!Object.values(P).some(p=>p.offer)){st.ph='play';nextWave()}}
