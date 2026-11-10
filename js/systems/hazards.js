// js/systems/hazards.js – minomety: varování a výbuch
function spawnMortar(dt){if((st.mortarT-=dt)>0)return;st.mortarT=st.mortarRate;const al=Object.values(P).filter(p=>!p.dead),p=al[R()*al.length|0];
 if(p)hz.push({x:p.x+(R()-.5)*3,z:p.z+(R()-.5)*3,t:1.1,done:0,f:0})}
function updHazards(dt){for(const h of hz){h.t-=dt;if(!h.done&&h.t<=0){h.done=1;h.f=.3;ev.push([h.r?'s':'x',h.x,h.z]);for(const id in P)if(hyp(h.x-P[id].x,h.z-P[id].z)<(h.r||3.5)){const h0=P[id].hp;hurt(P[id],h.dm||18,1);credit(h.sid,h0-P[id].hp,h.str)}}if(h.done)h.f-=dt}
 sweep(hz,h=>!h.done||h.f>0)}
