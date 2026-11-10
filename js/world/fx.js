// js/world/fx.js – efekty: jiskry, plameny a kouř (sprity), rázové vlny, záblesky světla, stopy na podlaze, paprsky, nábojnice, otřes kamery
const pa=[],rg=[],sp_=[],dc=[],bm=[],pgm=new G.BoxGeometry(.2,.2,.2),csg=new G.BoxGeometry(.07,.07,.18),rgm=new G.RingGeometry(.85,1,40),beamG=new G.CylinderGeometry(.06,.06,1,6).rotateX(Math.PI/2);
function blobTex(core){const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(core,'rgba(255,255,255,.5)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return new G.CanvasTexture(c)}
const glowT=blobTex(.25),softT=blobTex(.05),decT=blobTex(.3);
const fl_=[];for(let i=0;i<3;i++){const l=new G.PointLight(0xffffff,0,16,2);l.position.y=2;sc.add(l);fl_.push({l,t:0,T:1,I:0})}let fli=0;
function flash(x,z,c,I,t){const o=fl_[fli++%3];o.l.color.setHex(c);o.l.position.set(x,2,z);o.I=I;o.t=o.T=t;o.l.intensity=I}
function spark(x,z,c,n,s,add){if(pa.length>400)return;n=Math.ceil(n*GX.part);for(let i=0;i<n;i++){const m=new G.Mesh(pgm,new G.MeshBasicMaterial({color:c,transparent:true,blending:add?G.AdditiveBlending:G.NormalBlending}));m.position.set(x,.8,z);sc.add(m);pa.push({m,vx:(R()-.5)*s,vy:R()*s*.5,vz:(R()-.5)*s,l:.6})}}
function casing(x,z,ry){if(pa.length>400)return;const m=new G.Mesh(csg,new G.MeshBasicMaterial({color:0xd9b25c,transparent:true}));m.position.set(x,.9,z);m.rotation.y=ry;sc.add(m);const a=ry+1.57;pa.push({m,vx:Math.sin(a)*3+(R()-.5),vy:3+R()*2,vz:Math.cos(a)*3+(R()-.5),l:.9})}
function ring(x,z,c,s){const m=new G.Mesh(rgm,new G.MeshBasicMaterial({color:c,transparent:true,side:2}));m.rotation.x=-Math.PI/2;m.position.set(x,.1,z);sc.add(m);rg.push({m,l:.4,s})}
function puff(x,z,c,size,life,rise,add,tex){if(sp_.length>120||(R()>GX.part&&!add))return;const m=new G.Sprite(new G.SpriteMaterial({map:tex||glowT,color:c,transparent:true,depthWrite:false,blending:add?G.AdditiveBlending:G.NormalBlending}));
 m.position.set(x+(R()-.5)*.6,.9,z+(R()-.5)*.6);m.scale.setScalar(size*.5);sc.add(m);sp_.push({m,l:life,L:life,size,rise,add})}
function decal(x,z,c,r,op){if(!GX.decals)return;let d;if(dc.length<48){const m=new G.Mesh(new G.CircleGeometry(1,20),new G.MeshBasicMaterial({map:decT,color:c,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}));m.rotation.x=-Math.PI/2;sc.add(m);d={m}}else d=dc.shift();
 dc.push(d);d.m.material.color.setHex(c);d.m.scale.setScalar(r);d.m.position.set(x,.03,z);d.op=op;d.l=d.L=22;d.m.visible=true}
function beam(x,z,ry,len,c){const m=new G.Mesh(beamG,new G.MeshBasicMaterial({color:c,transparent:true,blending:G.AdditiveBlending,depthWrite:false}));m.position.set(x+Math.sin(ry)*len/2,.8,z+Math.cos(ry)*len/2);m.rotation.y=ry;m.scale.set(1,1,len);sc.add(m);bm.push({m,l:.14})}
function hitFlash(){const f=$('fl');if(!f)return;f.style.transition='none';f.style.boxShadow='inset 0 0 160px 40px rgba(255,30,60,.55)';requestAnimationFrame(()=>{f.style.transition='box-shadow .6s';f.style.boxShadow='inset 0 0 160px 40px rgba(255,30,60,0)'})}
const SLC=[0xdfe8ff,0xffb070,0x9fe0ff,0xff7a9c];
// seknutí / úder / bodnutí chladnou zbraní: světelný oblouk, kruh nebo paprsek
function slash(x,z,ry,w){const mm=WP[w].mel,c=SLC[w-6]||0xffffff;
 if(mm.line)beam(x,z,ry,mm.r,c);
 else{const full=mm.ang>6,g=new G.Group(),mat=new G.MeshBasicMaterial({color:c,transparent:true,blending:G.AdditiveBlending,side:2,depthWrite:false}),
  m=new G.Mesh(full?new G.RingGeometry(mm.r*.75,mm.r,40):new G.RingGeometry(mm.r*.55,mm.r,28,1,-mm.ang/2,mm.ang),mat);m.rotation.x=-Math.PI/2;g.add(m);g.position.set(x,.5,z);g.rotation.y=full?0:ry-Math.PI/2;sc.add(g);bm.push({m:g,l:.14,mat})}
 if(w==7){const fx0=x+Math.sin(ry)*mm.r*.5,fz0=z+Math.cos(ry)*mm.r*.5;ring(fx0,fz0,c,mm.r*.9);spark(fx0,fz0,0xffb070,10,10,true);decal(fx0,fz0,0x000000,1.6,.4);st.shake=Math.max(st.shake,.5)}
 sfx('w'+w,x,z)}
// záblesk z hlavně podle zbraně (volá se z view.js při každém výstřelu hráče)
function muzzle(x,z,ry,w){if(WP[w]&&WP[w].mel){slash(x,z,ry,w);return}const fx0=x+Math.sin(ry)*1.3,fz0=z+Math.cos(ry)*1.3,C=[0xfff2c8,0xffc070,0xffe9a0,0x9fe0ff,0xff8a3d,0xffc890][w]||0xffffff;
 if(w==4){puff(fx0,fz0,0xff7a2d,2.2,.35,.4,true);puff(fx0+Math.sin(ry)*1.2,fz0+Math.cos(ry)*1.2,0xffd27a,1.6,.3,.3,true)}
 else{puff(fx0,fz0,C,[1.6,2.6,1.2,2.4,0,2.2][w]||1.5,.07,0,true);flash(fx0,fz0,C,[2,3.5,1.6,3,0,3][w]||2,.08)}
 if(w==0||w==2||w==1)casing(x,z,ry);if(w==1)puff(fx0,fz0,0x777777,1.8,.7,.8,false,softT);
 if(w==3){beam(x,z,ry,60,0x9fe0ff);ring(fx0,fz0,0x9fe0ff,1.2)}if(w==5)puff(fx0,fz0,0x888888,2.2,.9,.5,false,softT);
 sfx('w'+w,x,z)}
function boom(x,z,r){ring(x,z,0xff9d4d,r);ring(x,z,0xffe0a0,r*.6);spark(x,z,0xffb070,16,14,true);for(let i=0;i<4;i++)puff(x,z,0xff8a3d,r*.9,.45,1,true);for(let i=0;i<5;i++)puff(x,z,0x555555,r*1.1,1.3,1.4,false,softT);
 flash(x,z,0xffaa55,5,.25);decal(x,z,0x000000,r*.9,.5);st.shake=Math.max(st.shake,Math.min(.9,r*.14));sfx('boom',x,z)}
function fx([t,x,z,a]){if(t=='s')spark(x,z,0xffffff,3,6,true);
 if(t=='k'){const c=T[a]?T[a].c:0xffffff;spark(x,z,c,12,12,true);ring(x,z,c,3);puff(x,z,c,2.2,.35,.5,true);decal(x,z,c,1.4+R()*.6,.4);sfx('kill',x,z)}
 if(t=='x')boom(x,z,3.5);if(t=='e')boom(x,z,a*.9);
 if(t=='p'){ring(x,z,0xc86bff,2.5);spark(x,z,0xc86bff,8,8,true);sfx('warp',x,z)}
 if(t=='d'){ring(x,z,0x66e0ff,1.5);spark(x,z,0x66e0ff,6,6,true);sfx('dash',x,z)}
 if(t=='h'){spark(x,z,0xff5c7a,8,8,true);if(a==me){st.shake=.7;sfx('hurt',x,z);hitFlash()}}}
function updFx(dt){
 for(let i=pa.length-1;i>=0;i--){const p=pa[i],m=p.m;p.l-=dt;p.vy-=16*dt;m.position.x+=p.vx*dt;m.position.z+=p.vz*dt;m.position.y=Math.max(.1,m.position.y+p.vy*dt);
  m.material.opacity=Math.max(0,Math.min(1,p.l*1.6));if(p.l<=0){sc.remove(m);m.material.dispose();pa.splice(i,1)}}
 for(let i=rg.length-1;i>=0;i--){const r=rg[i];r.l-=dt;const k=1-r.l/.4;r.m.scale.setScalar(.5+k*r.s);r.m.material.opacity=Math.max(0,1-k);if(r.l<=0){sc.remove(r.m);r.m.material.dispose();rg.splice(i,1)}}
 for(let i=sp_.length-1;i>=0;i--){const s=sp_[i];s.l-=dt;const k=1-s.l/s.L;s.m.scale.setScalar(s.size*(.5+k));s.m.position.y+=s.rise*dt;s.m.material.opacity=(s.add?1:.55)*(1-k)*(1-k);
  if(s.l<=0){sc.remove(s.m);s.m.material.dispose();sp_.splice(i,1)}}
 for(let i=bm.length-1;i>=0;i--){const b=bm[i];b.l-=dt;const mt_=b.mat||b.m.material;mt_.opacity=Math.max(0,b.l/.14);if(b.l<=0){sc.remove(b.m);mt_.dispose();bm.splice(i,1)}}
 for(const d of dc)if(d.l>0){d.l-=dt;d.m.material.opacity=d.op*Math.min(1,d.l/6);if(d.l<=0)d.m.visible=false}
 for(const o of fl_){if(o.t>0){o.t-=dt;o.l.intensity=o.I*Math.max(0,o.t/o.T)}else o.l.intensity=0}}
