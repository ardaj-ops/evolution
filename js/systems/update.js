// js/systems/update.js – jeden herní tik (běží jen u hostitele) a snímek stavu pro vykreslení / síť
function upd(dt){if(st.ph=='pick'){pickTick(dt);return}
 for(const id in P)updPlayer(P[id],dt);spawning(dt);updEnemies(dt);updBullets(dt);updEnemyBullets(dt);updHazards(dt);waveFlow(dt)}
function flushEv(){for(const x of ev){if(!TRAIN)fx(x);if(net.on)evOut.push(x)}ev.length=0}
function makeSnap(){const r=n=>Math.round(n*100)/100,t=M.t>0?M.t:1;
 return{ph:st.ph,w:st.wave,sc:st.score,nt:st.notes,pk:Math.ceil(st.pickT),
 p:Object.values(P).map(p=>[p.id,r(p.x),r(p.z),r(p.ry),Math.ceil(p.hp),p.mhp,p.dead?1:0,p.offer,p.inv>0?1:0,p.dcd<=0?1:0,p.wp,p.own,p.nsh|0,p.name,p.col]),
 e:en.map(e=>[e.id,e.k,r(e.x),r(e.z),r(e.hp/e.mhp),e.fuse>0?1:0,e.boss?1:0]),b:bl.map(b=>[r(b.x),r(b.z),b.w,Math.round(b.vx),Math.round(b.vz)]),q:eb.map(b=>[r(b.x),r(b.z)]),h:hz.map(h=>[r(h.x),r(h.z),r(h.t),h.done,h.r||3.5]),
 bh:(()=>{const b=en.find(e=>e.boss);return b?r(b.hp/b.mhp):-1})(),bk:st.bosses,dr:Math.round(st.dir*100),ss:st.str.map(t=>[t.id,t.name,st.actS.includes(t.id)?1:0]),sp:st.sp.map(s=>[s.id,s.name,s.g,s.src]),pf:[M.still/t,M.near/t,M.far/t,M.edge/t,M.shots>3?Math.min(1,M.hits/M.shots):prof.acc]}}
