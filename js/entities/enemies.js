// js/entities/enemies.js – typy nepřátel, spawn, taktiky a chování
const T={chaser:{r:.8,hp:1,sp:5.5,d:10,pts:10,c:0xff5c7a},runner:{r:.6,hp:1,sp:11,d:8,pts:15,c:0xffb84d},tank:{r:1.3,hp:6,sp:3.4,d:20,pts:40,c:0xa06bff},
shooter:{r:.8,hp:2,sp:5,d:8,pts:25,c:0x4dd2ff},dodger:{r:.8,hp:2,sp:7,d:10,pts:25,c:0x5cffa8},swarm:{r:.4,hp:1,sp:7.5,d:5,pts:5,c:0xff8bd0},
bomber:{r:.7,hp:1.5,sp:8,d:0,pts:20,c:0xffe14d},splitter:{r:1,hp:3,sp:4.5,d:12,pts:30,c:0x3dffd0},healer:{r:.8,hp:2.5,sp:4.5,d:6,pts:35,c:0xb6ff5c},phaser:{r:.75,hp:2,sp:6,d:10,pts:30,c:0xc86bff},thorn:{r:.9,hp:3,sp:3.6,d:14,pts:30,c:0xd4ff3a}};
function nearP(x,z){let b=null,bd=1e9;for(const id in P){const p=P[id];if(p.dead)continue;const d=hyp(p.x-x,p.z-z);if(d<bd){bd=d;b=p}}return[b,bd]}
function spawn(k,at){const boss=k[0]=='B';if(boss)k=k.slice(1);const d=T[k],al=Object.values(P).filter(p=>!p.dead),tg=al[R()*al.length|0];if(!tg)return;let x,z;
 if(at){x=cl(at.x+(R()-.5)*3,-ar+1,ar-1);z=cl(at.z+(R()-.5)*3,-ar+1,ar-1)}
 else if(st.surround){const a=R()*6.28,q=13+R()*4;x=cl(tg.x+Math.cos(a)*q,-ar+1,ar-1);z=cl(tg.z+Math.sin(a)*q,-ar+1,ar-1)}
 else{const s=R()*4|0,u=(R()*2-1)*(ar-1);x=s<2?u:s==2?-ar+1:ar-1;z=s<2?(s?ar-1:-ar+1):u}
 const L=st.tl,df=DF[opt.dif],h=d.hp*(1+st.wave*.08)*df.hp;
 const sid_=st.actS&&st.actS.length?st.actS[R()*st.actS.length|0]:0,SS=st.strA&&st.strA[sid_],rl_=SS?(R()<SS.flankP?'flank':R()<SS.bait?'bait':'front'):'front';
 if(SS){const t=st.str.find(q=>q.id==sid_);if(t)t.use++}
 en.push({id:++eid,k,r:d.r,hp:h,mhp:h,sp:d.sp*(1+st.wave*.03),d:(d.g&&d.g.atk!='melee'?0:d.d)*df.d,pts:d.pts,g:d.g,sid:d.sid,arm:d.g&&d.g.pow=='shield'?.5:1,age:0,x,z,cd:1+R()*1.5,ph:R()*6,flank:R()<L.flank*.25?L.flank:0,stand:R()<L.stand*.25?L.stand:0,thorns:k=='thorn'||!!(d.g&&d.g.pow=='thorns'),hr:0,side:R()<.5?-1:1,pred:L.pred,str:sid_,role:rl_});if(boss){const e=en[en.length-1],np=Object.keys(P).length;e.boss=1;e.hp=e.mhp=e.hp*(8+st.wave*.4)*(.6+.4*np);e.r*=1.8;e.sp*=.85;e.d*=1.5;e.pts*=10}if(d.sid){const s=st.sp.find(q=>q.id==d.sid);if(s)s.spawned++}}
function updEnemies(dt){for(const e of en){const[p,d]=nearP(e.x,e.z);if(!p)return;e.age+=dt;const rx=(p.x-e.x)/(d||1),rz=(p.z-e.z)/(d||1);let tx=p.x,tz=p.z;
 if(e.pred&&(e.k=='runner'||e.k=='chaser')){const t=Math.min(1.2,d/e.sp)*.3*e.pred;tx+=(p.vx||0)*t;tz+=(p.vz||0)*t}
 if(e.flank&&d>7){tx+=-rz*e.flank*6*e.side;tz+=rx*e.flank*6*e.side}
 const ax=tx-e.x,az=tz-e.z,dd=hyp(ax,az)||1,ux=ax/dd,uz=az/dd;let vx=ux,vz=uz;
 if(e.k=='shooter'){const f=d<14?-1:d>20?1:0;vx=rx*f-rz*.6;vz=rz*f+rx*.6;e.cd-=dt;
  if(e.cd<=0){e.cd=1.8;const tt=d/15*Math.min(1,e.pred*.3),qx=p.x+(p.vx||0)*tt-e.x,qz=p.z+(p.vz||0)*tt-e.z,q=hyp(qx,qz)||1;eb.push({x:e.x,z:e.z,vx:qx/q*15,vz:qz/q*15,str:e.str})}}
 if(e.k=='healer'){const f=d<13?-1:d>18?1:0;vx=rx*f-rz*.5;vz=rz*f+rx*.5;for(const o of en)if(o!==e&&o.hp<o.mhp&&hyp(o.x-e.x,o.z-e.z)<9)o.hp=Math.min(o.mhp,o.hp+2*dt)}
 if(e.k=='dodger'){const s=Math.sin(st.t*4+e.ph)*1.4;vx=ux-uz*s;vz=uz+ux*s}
 if(e.k=='phaser'){e.cd-=dt;if(e.cd<=0){e.cd=3+R()*1.5;const a=R()*6.28;e.x=cl(p.x+Math.cos(a)*5,-ar+1,ar-1);e.z=cl(p.z+Math.sin(a)*5,-ar+1,ar-1);ev.push(['p',e.x,e.z])}}
 if(e.k=='bomber'){if(e.fuse>0){e.fuse-=dt;vx=vz=0;if(e.fuse<=0){ev.push(['x',e.x,e.z]);for(const id in P){const q=P[id];if(!q.dead&&hyp(q.x-e.x,q.z-e.z)<3.5)hurt(q,22*DF[opt.dif].d,1)}e.hp=0;st.score+=e.pts}}else if(d<3)e.fuse=.6}
 let spd=e.sp;if(e.g){const o=behave(e,p,d,rx,rz,ux,uz,dt);vx=o[0];vz=o[1];spd=o[2]}
 if(e.str){const o=strat(e,p,d,rx,rz,dt);if(o){vx=o[0];vz=o[1];spd=e.sp*o[2]}}
 if(e.hr>0){e.hr-=dt;vx=-rx;vz=-rz;spd=e.sp*1.4}
 e.x=cl(e.x+vx*spd*dt,-ar,ar);e.z=cl(e.z+vz*spd*dt,-ar,ar);if(e.d&&d<e.r+p.r){const h0=p.hp;hurt(p,e.d);credit(e.sid,h0-p.hp,e.str);if(e.stand&&WP[p.wp].mel)e.hr=1+.3*e.stand}}}
