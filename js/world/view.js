// js/world/view.js – převod snímku stavu na 3D objekty (hostitel i klienti kreslí stejně)
const EG={chaser:new G.IcosahedronGeometry(.8),runner:new G.ConeGeometry(.55,1.5,6),tank:new G.BoxGeometry(2.2,2.2,2.2),shooter:new G.OctahedronGeometry(.9),dodger:new G.DodecahedronGeometry(.8),swarm:new G.SphereGeometry(.4,10,10),bomber:new G.SphereGeometry(.7,7,7),splitter:new G.CylinderGeometry(.6,.9,1.4,6),healer:new G.TorusGeometry(.6,.28,8,16),phaser:new G.ConeGeometry(.7,1.3,4)};
const BC=[0xffffff,0xffb84d,0xff6b6b,0x66e0ff,0xff7a2d,0xffe14d],BS=[1,.8,.7,1.7,.9,2],BL=[1.4,.7,1.1,7,.9,1.6];
const EM={};for(const k in T)EM[k]=[new G.MeshPhysicalMaterial({clearcoat:.8,clearcoatRoughness:.2,color:0x1a1f3a,emissive:T[k].c,emissiveIntensity:.7,roughness:.3,metalness:.7}),new G.MeshBasicMaterial({color:T[k].c,wireframe:true})];
const BODY={sphere:s=>new G.SphereGeometry(s,12,12),cube:s=>new G.BoxGeometry(s*1.6,s*1.6,s*1.6),spike:s=>new G.ConeGeometry(s*.8,s*2,6),ring:s=>new G.TorusGeometry(s*.7,s*.3,8,16),crystal:s=>new G.OctahedronGeometry(s),pyramid:s=>new G.TetrahedronGeometry(s*1.1)};
function mkSp(k){if(EG[k]||!T[k].g)return;const g=T[k].g,c=T[k].c;EG[k]=BODY[g.body](T[k].r);EM[k]=[new G.MeshPhysicalMaterial({clearcoat:.8,clearcoatRoughness:.2,color:0x1a1f3a,emissive:c,emissiveIntensity:.8,roughness:.3,metalness:.7}),new G.MeshBasicMaterial({color:c,wireframe:true})]}
function mark(m,k){const g=T[k].g;if(!g)return;const r=T[k].r;
 if(g.pow=='shield'){const o=new G.Mesh(new G.TorusGeometry(r*1.5,.06,6,24),new G.MeshBasicMaterial({color:0xffffff}));o.rotation.x=Math.PI/2;m.add(o)}
 if(g.pow=='aura')m.add(new G.Mesh(new G.SphereGeometry(r*2.2,12,12),new G.MeshBasicMaterial({color:T[k].c,transparent:true,opacity:.12,depthWrite:false})))}
function mkEnemy(k){mkSp(k);const m=new G.Mesh(EG[k],EM[k][0]);m.castShadow=true;const w=new G.Mesh(EG[k],EM[k][1]);w.scale.setScalar(1.18);m.add(w);mark(m,k);sc.add(m);return m}
// model chladné zbraně v ruce postavy + animace seknutí / bodnutí
function setWpn(g,wp){if(g.userData.pv)g.remove(g.userData.pv);g.userData.wp=wp;const mm=WP[wp]&&WP[wp].mel;if(g.userData.br)g.userData.br.visible=!mm;if(!mm){g.userData.pv=null;return}
 const pv=new G.Group(),c=SLC[wp-6]||0xffffff,mk=(geo,z)=>{const m=new G.Mesh(geo,mt(c,.8));m.position.z=z;pv.add(m);return m};
 if(wp==6)mk(new G.BoxGeometry(.12,.12,2.4),1.6);else if(wp==7){mk(new G.BoxGeometry(.14,.14,1.8),1.2);mk(new G.BoxGeometry(.9,.7,.6),2.3)}
 else if(wp==8){mk(new G.BoxGeometry(.1,.1,3.4),1.9);mk(new G.ConeGeometry(.22,.7,6),3.8).rotation.x=Math.PI/2}else mk(new G.BoxGeometry(.1,.1,1.1),1.3);
 g.add(pv);g.userData.pv=pv}
function animWpn(o,dt){const pv=o.userData.pv;if(!pv)return;const mm=WP[o.userData.wp].mel;let k=1;if(o.userData.sw>0){o.userData.sw-=dt;k=1-Math.max(0,o.userData.sw)/.18}
 if(k>=1){pv.rotation.y=0;pv.position.z=0;return}if(mm.line){pv.rotation.y=0;pv.position.z=Math.sin(k*Math.PI)*1.4}else{pv.position.z=0;pv.rotation.y=mm.ang>6?k*6.28:-mm.ang/2+k*mm.ang}}
function nameTex(n){const c=document.createElement('canvas');c.width=256;c.height=64;const x=c.getContext('2d');x.font='bold 34px system-ui,sans-serif';x.textAlign='center';x.fillStyle='rgba(0,0,0,.55)';x.fillRect(8,6,240,52);x.fillStyle='#fff';x.fillText(n,128,46);return new G.CanvasTexture(c)}
function mkPlayer(id,cc,nm,wp){const c=PCOL[cc]!=null?PCOL[cc]:COLS[(id-1)%4],g=new G.Group(),b=new G.Mesh(new G.SphereGeometry(.7,24,24),mt(c,.45));b.castShadow=true;
 const rg=new G.Mesh(new G.TorusGeometry(.95,.05,8,32),new G.MeshBasicMaterial({color:c}));rg.rotation.x=Math.PI/2;
 const br=new G.Mesh(new G.BoxGeometry(.3,.3,1),mt(0x222a55,.3));br.position.z=.8;
 const gl=new G.Mesh(new G.CircleGeometry(2.2,32),new G.MeshBasicMaterial({color:c,transparent:true,opacity:.18,depthWrite:false}));gl.rotation.x=-Math.PI/2;gl.position.y=-.65;
 g.add(b,rg,br,gl);{const sp=new G.Sprite(new G.SpriteMaterial({map:nameTex(cleanPN(nm)),transparent:true,depthTest:false}));sp.scale.set(3.2,.8,1);sp.position.y=2.2;g.add(sp);g.userData.nm=sp}g.userData.br=br;setWpn(g,wp|0);if(id==me){const l=new G.PointLight(c,1.4,28);l.position.y=3;g.add(l)}sc.add(g);return g}
const sgeo=new G.CylinderGeometry(.09,.09,1,6).rotateX(Math.PI/2),bgeo=new G.SphereGeometry(.22,8,8),mkB=()=>{const m=new G.Mesh(sgeo,new G.MeshBasicMaterial({color:0xffffff,transparent:true,blending:G.AdditiveBlending,depthWrite:false}));sc.add(m);return m},
 mkQ=()=>{const m=new G.Mesh(bgeo,new G.MeshBasicMaterial({color:0x66e0ff}));m.scale.setScalar(1.4);sc.add(m);return m},
 mkHz=()=>{const g=new G.Group(),r=new G.Mesh(new G.RingGeometry(3.4,3.55,40),new G.MeshBasicMaterial({color:0xff9d4d,side:2})),
  d=new G.Mesh(new G.CircleGeometry(3.5,40),new G.MeshBasicMaterial({color:0xff9d4d,transparent:true,opacity:.35,side:2}));g.add(r,d);g.rotation.x=-Math.PI/2;g.position.y=.05;g.userData.d=d;sc.add(g);return g};
const shots=new Map(),pm=new Map(),emap=new Map(),bp=[],qp=[],hp_=[];
function pool(a,n,mk){while(a.length<n)a.push(mk());a.forEach((m,i)=>m.visible=i<n)}
function sync(s,dt){const f=Math.min(1,dt*20),seen=new Set(),now=performance.now();
 for(const[id,x,z,ry,hp,mh,dead,off,inv,rd_,wp,own,nsh,nm,cc]of s.p){let o=pm.get(id);if(!o){o=mkPlayer(id,cc,nm,wp);pm.set(id,o);o.position.set(x,.7,z)}
  o.position.x+=(x-o.position.x)*f;o.position.z+=(z-o.position.z)*f;o.position.y=.7;o.rotation.y=ry;o.visible=!dead&&!(inv&&(now/60|0)%2);seen.add(id);if(o.userData.nm)o.userData.nm.visible=s.p.length>1;if(shots.has(id)&&nsh>shots.get(id)&&!dead){muzzle(x,z,ry,wp|0);if(o.userData.pv)o.userData.sw=.18}shots.set(id,nsh|0);if(o.userData.wp!==(wp|0))setWpn(o,wp|0);animWpn(o,dt)}
 for(const[id,o]of pm)if(!seen.has(id)){sc.remove(o);pm.delete(id)}
 seen.clear();
 (s.sp||[]).forEach(([i,n,g])=>regSp(i,n,g));
 for(const[id,k,x,z,fr,fu,bs]of s.e){let o=emap.get(id);if(!o){o=mkEnemy(k);emap.set(id,o);o.position.set(x,T[k].r,z)}
  if(bs&&!o.userData.b){o.userData.b=1;const rg=new G.Mesh(new G.TorusGeometry(T[k].r*1.7,.1,8,32),new G.MeshBasicMaterial({color:0xffd27a}));rg.rotation.x=Math.PI/2;o.add(rg)}
  o.position.x+=(x-o.position.x)*f;o.position.z+=(z-o.position.z)*f;o.position.y=T[k].r*(bs?1.9:1)+Math.sin(now/300+id)*.08;o.rotation.y+=dt*2;o.scale.setScalar((bs?1.9:1)*(fu?1.3+Math.sin(now/40)*.2:1));seen.add(id)}
 for(const[id,o]of emap)if(!seen.has(id)){sc.remove(o);emap.delete(id)}
 pool(bp,s.b.length,mkB);s.b.forEach(([x,z,w,vx,vz],i)=>{const m=bp[i];m.position.set(x,.8,z);m.rotation.y=Math.atan2(vx||0,vz||1);m.scale.set(BS[w]||1,BS[w]||1,BL[w]||1);m.material.color.setHex(BC[w]||0xffffff)});
 pool(qp,s.q.length,mkQ);s.q.forEach(([x,z],i)=>qp[i].position.set(x,.8,z));
 pool(hp_,s.h.length,mkHz);s.h.forEach(([x,z,t,d,rr],i)=>{const g=hp_[i];g.scale.setScalar((rr||3.5)/3.5);g.position.x=x;g.position.z=z;const dc=g.userData.d;dc.scale.setScalar(d?1:Math.max(.01,1-t/1.1));dc.material.opacity=d?.7:.35})}
