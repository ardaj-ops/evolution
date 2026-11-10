// js/core/input.js – klávesnice (přemapovatelná podle fyzických kláves) a myš
addEventListener('keydown',e=>{
 if(SET.cap){e.preventDefault();if(e.code!='Escape')rebindTo(e.code);SET.cap=null;SET.ver++;return}
 if(e.target&&/^(INPUT|TEXTAREA)$/.test(e.target.tagName))return;
 if(e.code=='Escape'){SET.open=!SET.open;SET.cap=null;ovKey='';SET.ver++;return}
 if((e.code=='KeyY'||e.code=='KeyN')&&voteCan()&&!CHAT.open&&!SET.open&&!Object.values(BIND).includes(e.code)){voteCast(e.code=='KeyY'?1:0);return}
 if(e.code=='Enter'||e.code=='NumpadEnter'){if(net.on&&!SET.open&&!CHAT.open&&vs&&vs.ph!='lobby'&&vs.ph!='menu'){e.preventDefault();chatOpen()}return}
 keys[e.code]=1;if(e.code=='Space'||e.code.startsWith('Arrow'))e.preventDefault()});
addEventListener('keyup',e=>keys[e.code]=0);
addEventListener('blur',()=>{for(const k in keys)keys[k]=0;mouse.d=false});
addEventListener('mousemove',e=>{mouse.x=e.clientX/innerWidth*2-1;mouse.y=-(e.clientY/innerHeight)*2+1});
addEventListener('mousedown',e=>{if(e.target.tagName=='CANVAS'&&e.button==SET.btn)mouse.d=true});addEventListener('mouseup',e=>{if(e.button==SET.btn)mouse.d=false});
addEventListener('contextmenu',e=>{if(e.target.tagName=='CANVAS')e.preventDefault()});
const rc=new G.Raycaster(),plane=new G.Plane(new G.Vector3(0,1,0),0),ap=new G.Vector3(),kd=a=>BIND[a]&&keys[BIND[a]];
function readInput(){if(SET.open||CHAT.open)return{dx:0,dz:0,ax:0,az:0,f:0,ds:0,sw:0};
 let dx=(kd('right')||keys.ArrowRight?1:0)-(kd('left')||keys.ArrowLeft?1:0),dz=(kd('down')||keys.ArrowDown?1:0)-(kd('up')||keys.ArrowUp?1:0);
 const k=hyp(dx,dz);if(k>1){dx/=k;dz/=k}
 rc.setFromCamera({x:mouse.x,y:mouse.y},cam);
 const o={dx,dz,ax:0,az:0,f:(mouse.d||kd('fire'))&&vs&&vs.ph=='play'?1:0,ds:kd('dash')?1:0,sw:kd('w1')?1:kd('w2')?2:kd('w3')?3:kd('w4')?4:kd('wnext')?5:kd('wprev')?6:0};
 if(rc.ray.intersectPlane(plane,ap)){o.ax=ap.x;o.az=ap.z}return o}
