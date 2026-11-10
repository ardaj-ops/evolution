// js/core/loop.js – hlavní smyčka: simulace (host), síť, vykreslení, kamera
let chatT=0,lbT=0,rcT=0,last=0,snapT=0,inT=0,ambT=0,fpsN=0,fpsT=0;
function loop(ts){requestAnimationFrame(loop);const dt=Math.min(.05,(ts-last)/1000||0);last=ts;fpsN++;fpsT+=dt;if(fpsT>=.5){if(GX.fps)$('fps').textContent=Math.round(fpsN/fpsT)+' FPS';fpsN=0;fpsT=0}if(!net.on&&st.ph=='menu'){if(net.ws&&net.ws.readyState==1){if((lbT-=dt)<=0){lbT=3;netSend({t:'list'})}}else if(LB.conn=='off'&&(rcT-=dt)<=0){rcT=5;netOpen()}}
 if(chatT-=dt,chatT<=0){chatT=.5;chatOverlay()}const inp=readInput();
 if(TR.on){trainSlice();vs=null}
 else if(isHost&&Object.keys(P).length){if(P[me])P[me].inp=inp;
  if((st.ph=='play'||st.ph=='pick')&&!(SET.open&&!net.on)){st.t+=dt;upd(dt);flushEv()}
  vs=makeSnap();if(net.on&&(snapT-=dt)<=0){snapT=.05;netSend({t:'snap',s:{...vs,ev:evOut.splice(0)}})}}
 else if(!isHost&&net.on&&(inT-=dt)<=0){inT=.033;netSend({t:'in',i:inp})}
 if(vs)sync(vs,dt);updFx(dt);syncOverlay();updHud();
 const mp=vs&&vs.p.find(a=>a[0]==me),tx=mp?mp[1]:0,tz=mp?mp[2]:0;
 const zf=[.75,1,1.3][opt.zoom];cam.position.lerp(new G.Vector3(tx,24*zf,tz+17*zf),.1);const c=cam.position.clone();
 cam.position.x+=(R()-.5)*st.shake;cam.position.z+=(R()-.5)*st.shake;st.shake*=.9;cam.lookAt(tx,0,tz);
 if(gradePass)gradePass.uniforms.time.value=(ts%1000)/1000;if((ambT-=dt)<=0){ambT=.5;const on=!!vs&&(vs.ph=='play'||vs.ph=='pick');ambient(on,on?Math.min(1,vs.e.length/40+(vs.bh>=0?.4:0)):0)}
 dust.rotation.y+=dt*.02;comp&&(GX.bloom||GX.grade)?comp.render():ren.render(sc,cam);cam.position.copy(c)}
