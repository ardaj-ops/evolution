// js/entities/projectiles.js – střely hráčů a nepřátel
function killE(e,o){st.score+=e.pts;ev.push(['k',e.x,e.z,e.k]);if(e.boss)st.bosses++;if(e.k=='splitter'||(e.g&&e.g.pow=='split'))for(let i=0;i<2;i++)spawn('runner',e);if(o&&o.u.vamp)o.hp=Math.min(o.mhp,o.hp+2*o.u.vamp)}
function segD(px,pz,x,z,ex,ez){const dx=x-px,dz=z-pz,l=dx*dx+dz*dz||1e-9;let t=((ex-px)*dx+(ez-pz)*dz)/l;t=t<0?0:t>1?1:t;return hyp(ex-(px+t*dx),ez-(pz+t*dz))}
function updBullets(dt){for(const b of bl){const px=b.x,pz=b.z;b.x+=b.vx*dt;b.z+=b.vz*dt;b.l-=dt;
 for(const e of en)if(e.hp>0&&!b.hit.includes(e.id)&&segD(px,pz,b.x,b.z,e.x,e.z)<e.r+.3){const o=P[b.own],dm=b.dmg*(o&&R()<o.u.crit?2.5:1);e.hp-=dm*(e.arm||1);M.hits++;ev.push(['s',b.x,b.z]);
  if(b.pi>0){b.pi--;b.hit.push(e.id)}else b.l=0;
  if(b.ao){ev.push(['e',b.x,b.z,b.ao]);for(const q of en)if(q!==e&&q.hp>0&&hyp(q.x-b.x,q.z-b.z)<b.ao){q.hp-=dm*.6*(q.arm||1);if(q.hp<=0)killE(q,o)}}
  if(e.hp<=0)killE(e,o);break}}
 sweep(bl,b=>b.l>0&&Math.abs(b.x)<ar&&Math.abs(b.z)<ar);for(const e of en)if(e.hp<=0&&e.sid)died(e);sweep(en,e=>e.hp>0)}
function updEnemyBullets(dt){for(const b of eb){b.x+=b.vx*dt;b.z+=b.vz*dt;
 for(const id in P){const p=P[id];if(!p.dead&&hyp(b.x-p.x,b.z-p.z)<p.r+.3){b.x=999;const h0=p.hp;hurt(p,b.dm||8);credit(b.sid,h0-p.hp,b.str)}}}
 sweep(eb,b=>Math.abs(b.x)<ar+5&&Math.abs(b.z)<ar+5)}
