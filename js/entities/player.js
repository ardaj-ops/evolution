// js/entities/player.js – hráči: pohyb, střelba, zranění a roguelike vylepšení
const UP={dmg:['Síla','+30 % poškození'],rate:['Rychlopalba','+25 % rychlost střelby'],spd:['Sprint','+15 % rychlost pohybu'],hp:['Pancíř','+25 max. životů a vyléčení'],
multi:['Rozptyl','+1 projektil'],pierce:['Průraz','Střely probíjejí +1 nepřítele'],vamp:['Upír','+2 životy za každé zabití'],crit:['Kritik','+12 % šance na 2,5× poškození'],regen:['Regenerace','+1 život za sekundu'],shield:['Štít','Delší nezranitelnost po zásahu']};
const WP=[
{n:'Blaster',d:'Vyvážená, 1 střela',w:{cd:.16,n:1,fan:.25,sp:.05,v:40,l:1.2,dmg:1,pi:0}},
{n:'Brokovnice',d:'5 broků, silná nablízko',w:{cd:.65,n:5,fan:.6,sp:.1,v:32,l:.5,dmg:.8,pi:0}},
{n:'Kulomet',d:'Extrémně rychlá palba',w:{cd:.07,n:1,fan:.2,sp:.12,v:42,l:1.1,dmg:.55,pi:0}},
{n:'Railgun',d:'Pomalý, probíjí nepřátele',w:{cd:.8,n:1,fan:.15,sp:.01,v:75,l:1,dmg:3,pi:3}},
{n:'Plamenomet',d:'Krátký dosah, probíjí dav',w:{cd:.05,n:2,fan:.5,sp:.3,v:22,l:.35,dmg:.35,pi:99}},
{n:'Raketomet',d:'Pomalý, výbuch zasáhne okolí',w:{cd:.9,n:1,fan:.1,sp:.02,v:26,l:1.6,dmg:2,pi:0,aoe:3.2}},
{n:'Meč',d:'Sek v oblouku, odráží střely',w:{cd:.45,dmg:2.6},mel:{r:3.2,ang:1.9,kb:.9,defl:1}},
{n:'Kladivo',d:'Pomalý úder do kruhu, odhodí nepřátele',w:{cd:1.1,dmg:4.5},mel:{r:4.2,ang:6.3,kb:2.5,defl:1}},
{n:'Kopí',d:'Dlouhé bodnutí v řadě, probíjí',w:{cd:.7,dmg:3},mel:{r:6.5,ang:0,line:.9,kb:.5,defl:0}},
{n:'Dýky',d:'Rychlé krátké seky, léčí',w:{cd:.16,dmg:.9},mel:{r:2.3,ang:1.3,kb:.2,defl:0,ls:.6}}];
const CLS=[
{n:'Střelec',d:'Blaster · vyvážený, 100 životů',hp:100,spd:1,rate:1,dmg:1,wd:0},
{n:'Tank',d:'Brokovnice · 150 životů, pomalejší',hp:150,spd:.85,rate:1,dmg:1.2,wd:1},
{n:'Stíhač',d:'Kulomet · 80 životů, rychlá palba',hp:80,spd:1,rate:1.2,dmg:1,wd:2},
{n:'Průzkumník',d:'Railgun · 75 životů, rychlý',hp:75,spd:1.3,rate:1.1,dmg:1,wd:3},
{n:'Granátník',d:'Raketomet · 110 životů',hp:110,spd:.95,rate:1,dmg:1,wd:5},
{n:'Žhář',d:'Plamenomet · 100 životů',hp:100,spd:1,rate:1,dmg:1,wd:4},
{n:'Rytíř',d:'Meč · 130 životů, odráží střely',hp:130,spd:1,rate:1,dmg:1,wd:6},
{n:'Berserker',d:'Kladivo · 160 životů, pomalejší',hp:160,spd:.9,rate:1,dmg:1.1,wd:7},
{n:'Lovec',d:'Kopí · 100 životů, dlouhý dosah',hp:100,spd:1.1,rate:1,dmg:1,wd:8},
{n:'Zabiják',d:'Dýky · 85 životů, rychlý, léčí se',hp:85,spd:1.25,rate:1,dmg:1,wd:9}];
const newPlayer=(id,c=0,ml,wp)=>{const C=CLS[c]||CLS[0],W0=cl(wp===undefined?C.wd:wp|0,0,WP.length-1),ML=ml||sanM(id==me?META.lv:null);return{id,cls:c,ml:ML,wp:W0,wp0:W0,own:[W0],name:'Hráč',col:0,x:(id%4-1.5)*3,z:0,ry:0,hp:C.hp+10*ML.hp,mhp:C.hp+10*ML.hp,r:.7,cd:0,inv:0,dead:false,offer:null,inp:{dx:0,dz:0,ax:0,az:0,f:0,ds:0,sw:0},dash:0,dcd:0,u:{dmg:C.dmg*(1+.05*ML.dmg),rate:C.rate,spd:C.spd*(1+.04*ML.spd),multi:1,pierce:0,vamp:0,crit:0,regen:0,shield:0}}};
const addPlayer=id=>P[id]=newPlayer(id);
function applyUp(p,k){const u=p.u;if(k=='dmg')u.dmg*=1.3;if(k=='rate')u.rate*=1.25;if(k=='spd')u.spd*=1.15;if(k=='multi')u.multi++;if(k=='pierce')u.pierce++;if(k=='arms'){const rest=WP.map((_,x)=>x).filter(x=>!p.own.includes(x));if(rest.length&&p.own.length<4){const w=rest[R()*rest.length|0];p.own.push(w);p.wp=w}}if(k=='vamp')u.vamp++;if(k=='crit')u.crit+=.12;if(k=='regen')u.regen++;if(k=='shield')u.shield++;
 if(k=='hp'){p.mhp+=25;p.hp=Math.min(p.mhp,p.hp+25)}}
function hurt(p,d,force){if(p.dead||(p.inv>0&&!force))return;st.wl+=Math.min(d,p.hp);p.hp-=d;p.inv=.5+.3*p.u.shield;ev.push(['h',p.x,p.z,p.id]);
 if(p.hp<=0){p.hp=0;p.dead=true;if(!Object.values(P).some(q=>!q.dead))die()}}
function updPlayer(p,dt){if(p.dead)return;const i=p.inp,km=hyp(i.dx,i.dz);p.dash-=dt;p.dcd-=dt;if(i.ds&&p.dcd<=0&&km>.1){p.dash=.18;p.dcd=1.6;p.inv=Math.max(p.inv,.3);ev.push(['d',p.x,p.z])}if(i.sw!==p.lsw){p.lsw=i.sw;if(i.sw>=1&&i.sw<=4){if(p.own[i.sw-1]!==undefined)p.wp=p.own[i.sw-1]}else if(i.sw>=5){const k=p.own.indexOf(p.wp),n=p.own.length;p.wp=p.own[(k+(i.sw==5?1:n-1))%n]}}
 p.x=cl(p.x+i.dx*12*p.u.spd*(p.dash>0?3.2:1)*dt,-ar+.8,ar-.8);p.z=cl(p.z+i.dz*12*p.u.spd*(p.dash>0?3.2:1)*dt,-ar+.8,ar-.8);p.vx=i.dx*12*p.u.spd;p.vz=i.dz*12*p.u.spd;p.inv-=dt;p.cd-=dt;if(p.u.regen)p.hp=Math.min(p.mhp,p.hp+p.u.regen*dt);
 const ax=i.ax-p.x,az=i.az-p.z;if(ax||az)p.ry=Math.atan2(ax,az);
 if(i.f&&p.cd<=0){const WD=WP[p.wp],W=WD.w;p.cd=W.cd/p.u.rate;const a0=Math.atan2(az,ax);
  if(WD.mel){meleeAttack(p,WD,a0);p.nsh=(p.nsh||0)+1}else{const n=W.n+p.u.multi-1;
  for(let k=0;k<n;k++){const a=a0+(n>1?(k/(n-1)-.5)*W.fan:0)+(R()-.5)*W.sp;bl.push({x:p.x,z:p.z,vx:Math.cos(a)*W.v,vz:Math.sin(a)*W.v,l:W.l,own:p.id,w:p.wp,ao:W.aoe||0,dmg:p.u.dmg*W.dmg,pi:p.u.pierce+W.pi,hit:[]})}M.shots+=n;p.nsh=(p.nsh||0)+1}}
 trackStyle(dt,p,km)}
// útok zbraní nablízko: zasáhne všechny v oblouku / kruhu / řadě, odhodí je, odráží nepřátelské střely; ostnatí nepřátelé vracejí zranění
function meleeAttack(p,WD,a0){const m=WD.mel,W=WD.w,r=m.r*(1+.12*(p.u.multi-1)),ca=Math.cos(a0),sa=Math.sin(a0);let hit=0;
 for(const e of en){if(e.hp<=0)continue;const dx=e.x-p.x,dz=e.z-p.z,d=hyp(dx,dz);let ok=false;
  if(m.line){const pr=dx*ca+dz*sa,pe=Math.abs(-dx*sa+dz*ca);ok=pr>-e.r&&pr<r+e.r&&pe<m.line+e.r}
  else if(d<r+e.r){if(m.ang>6||d<e.r+.7)ok=true;else{let df=Math.atan2(dz,dx)-a0;df=Math.atan2(Math.sin(df),Math.cos(df));ok=Math.abs(df)<=m.ang/2}}
  if(!ok)continue;hit++;const dm=W.dmg*p.u.dmg*(R()<p.u.crit?2.5:1)*(e.arm||1);e.hp-=dm;ev.push(['s',e.x,e.z]);
  const kd=d||1,kb=m.kb*(e.k=='tank'||e.boss?.35:1);e.x=cl(e.x+dx/kd*kb,-ar,ar);e.z=cl(e.z+dz/kd*kb,-ar,ar);
  if(m.ls)p.hp=Math.min(p.mhp,p.hp+m.ls);if(e.thorns)hurt(p,Math.max(3,e.d*.4)*DF[opt.dif].d);if(e.hp<=0)killE(e,p)}
 if(m.defl)for(const b of eb){const dx=b.x-p.x,dz=b.z-p.z,d=hyp(dx,dz);if(d>=r+.5)continue;let df=Math.atan2(dz,dx)-a0;df=Math.atan2(Math.sin(df),Math.cos(df));
  if(m.ang>6||Math.abs(df)<=m.ang/2){const bx=b.x,bz=b.z;b.x=999;ev.push(['s',bx,bz])}}
 M.shots++;if(hit)M.hits++}
