// js/core/game.js – běh hry: start, konec, režimy sólo / multiplayer
function startRun(){[en,bl,eb,hz,ev,evOut].forEach(a=>a.length=0);Object.assign(st,{wave:0,score:0,ph:'play',wT:1.5,dir:1,wl:0,bosses:0,str:[],strA:{},actS:[],sidS:0,sp:[],tl:{flank:0,pred:0,pack:0,stand:0},spawnQ:[],spawnT:0,t:0});
 M=newM();prof={still:.2,near:.2,far:.2,edge:.15,acc:.5,mel:0};for(const id in P){const o=P[id];P[id]=newPlayer(+id,o.cls,o.ml,o.wp0);P[id].name=o.name;P[id].col=o.col}seedFromMemory();nextWave();if(net.on&&isHost)netSend({t:'start'})}
function die(){st.ph='over';if(st.wave>(+store.get('evo_best')||0))store.set('evo_best',st.wave);learn();st.notes=RT.filter((_,i)=>flags(prof)[i]);rememberRun()}
function solo(){if(TR.on)return;if(net.on)netSend({t:'leave'});net.on=false;isHost=true;me=1;for(const k in P)delete P[k];P[1]=newPlayer(1,opt.cls);ppSelf(P[1]);startRun()}
function pick(i){sfx('pick');if(isHost)pickUp(me,i);else netSend({t:'pick',i})}
