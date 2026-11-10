// js/ai/behavior.js – chování druhu podle genů: pohyb, útok a schopnost
function behave(e,p,d,rx,rz,ux,uz,dt){const g=e.g,s=e.side;let vx=ux,vz=uz,spd=e.sp;const br=g.brain&&g.brain.length;if(br){const o=think(e,p,d,rx,rz,s,dt);vx=o[0];vz=o[1];spd*=o[2]}
 if(br){}else if(g.move=='orbit'){const k=d>10?1:d<7?-.4:0;vx=rx*k-rz*s;vz=rz*k+rx*s}
 else if(g.move=='zigzag'){const z=Math.sin(st.t*5+e.ph)*1.5;vx=rx-rz*z;vz=rz+rx*z}
 else if(g.move=='stalk')spd*=Math.sin(st.t*2+e.ph)>0?1.7:.15;
 else if(g.move=='flank'&&d>7){vx=rx-rz*s*.9;vz=rz+rx*s*.9}
 if(g.atk=='shoot'||g.atk=='burst'){const f=d<12?-1:d>18?1:0;if(!br){vx=rx*f-rz*.5*s;vz=rz*f+rx*.5*s}e.cd-=dt;
  if(e.cd<=0){const n=g.atk=='burst'?3:1,tt=d/15*Math.min(1,e.pred*.3);e.cd=n>1?3:1.6;
   for(let i=0;i<n;i++){const a=Math.atan2(p.z+(p.vz||0)*tt-e.z,p.x+(p.vx||0)*tt-e.x)+(i-(n-1)/2)*.2;eb.push({x:e.x,z:e.z,vx:Math.cos(a)*15,vz:Math.sin(a)*15,dm:g.dmg*.8,sid:e.sid,str:e.str})}}}
 if(g.atk=='bomb'){if(e.fuse>0){e.fuse-=dt;vx=vz=0;if(e.fuse<=0){ev.push(['x',e.x,e.z]);
  for(const id in P){const q=P[id];if(!q.dead&&hyp(q.x-e.x,q.z-e.z)<3.5){const h0=q.hp;hurt(q,g.dmg*1.6*DF[opt.dif].d,1);credit(e.sid,h0-q.hp,e.str)}}if(e.boss){e.fuse=0;e.nb=st.t+4}else{e.hp=0;st.score+=e.pts}}}else if(d<3&&!(e.nb>st.t))e.fuse=.6}
 if(g.atk=='trail'){e.tr=(e.tr||0)-dt;if(e.tr<=0){e.tr=.7;hz.push({x:e.x,z:e.z,t:.8,done:0,f:0,r:1.8,dm:g.dmg*.7,sid:e.sid,str:e.str})}}
 e.pt=(e.pt||2+R()*2)-dt;
 if(g.pow=='dash'){if(e.pt<=0){e.pt=4;e.dash=.5}if(e.dash>0){e.dash-=dt;vx=rx;vz=rz;spd*=3}}
 if(g.pow=='blink'&&e.pt<=0){e.pt=4+R();const a=R()*6.28;e.x=cl(p.x+Math.cos(a)*6,-ar+1,ar-1);e.z=cl(p.z+Math.sin(a)*6,-ar+1,ar-1);ev.push(['p',e.x,e.z])}
 if(g.pow=='summon'&&e.pt<=0){e.pt=6;if(en.length<100)spawn('swarm',e)}
 if(g.pow=='aura')for(const o of en)if(o!==e&&o.hp<o.mhp&&hyp(o.x-e.x,o.z-e.z)<9)o.hp=Math.min(o.mhp,o.hp+2*dt);
 if(g.pow=='regen')e.hp=Math.min(e.mhp,e.hp+e.mhp*.08*dt);
 return[vx,vz,spd]}
