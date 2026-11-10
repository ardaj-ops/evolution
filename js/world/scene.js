// js/world/scene.js – renderer (stíny + bloom), světla, texturovaná podlaha, zdi, prach
const ren=new G.WebGLRenderer({antialias:true});ren.setSize(innerWidth,innerHeight);ren.setPixelRatio(Math.min(2,devicePixelRatio));
ren.shadowMap.enabled=true;ren.shadowMap.type=G.PCFSoftShadowMap;document.body.prepend(ren.domElement);
const sc=new G.Scene();sc.background=new G.Color(0x070a16);sc.fog=new G.FogExp2(0x070a16,.012);
const cam=new G.PerspectiveCamera(55,innerWidth/innerHeight,.1,200);cam.position.set(0,24,17);
let comp=null,bloomPass=null;if(G.EffectComposer&&G.UnrealBloomPass){comp=new G.EffectComposer(ren);comp.addPass(new G.RenderPass(sc,cam));bloomPass=new G.UnrealBloomPass(new G.Vector2(innerWidth,innerHeight),.85,.55,.25);comp.addPass(bloomPass)}
// závěrečné „filmové“ zpracování: chromatická vada na okrajích, vinětace, zrno; při chybě shaderu se samo vypne
let gradePass=null;
try{if(comp&&G.ShaderPass){gradePass=new G.ShaderPass({uniforms:{tDiffuse:{value:null},time:{value:0},amt:{value:1}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:'uniform sampler2D tDiffuse;uniform float time;uniform float amt;varying vec2 vUv;float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233))+time)*43758.5453);}void main(){vec2 c=vUv-.5;float d=dot(c,c);vec2 o=c*d*.012*amt;vec3 col=vec3(texture2D(tDiffuse,vUv+o).r,texture2D(tDiffuse,vUv).g,texture2D(tDiffuse,vUv-o).b);col*=1.0-d*1.15*amt;col+=(h(vUv*vec2(1920.,1080.))-.5)*.035*amt;col=pow(max(col,0.0),vec3(.96));gl_FragColor=vec4(col,1.0);}'});comp.addPass(gradePass);
 const _ce=console.error;console.error=function(){if(gradePass&&String(arguments[0]).indexOf('THREE.WebGLProgram')>=0)gradePass.enabled=false;return _ce.apply(console,arguments)}}}catch(e){console.log('grading:',e.message)}
addEventListener('resize',()=>{ren.setSize(innerWidth,innerHeight);if(comp)comp.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()});
const mt=(c,e=.6)=>new G.MeshPhysicalMaterial({color:c,emissive:c,emissiveIntensity:e,roughness:.3,metalness:.6,clearcoat:.6,clearcoatRoughness:.25});
const hemi=new G.HemisphereLight(0x8fa0ff,0x10142a,.7);sc.add(hemi);const dl=new G.DirectionalLight(0xffffff,.8);dl.position.set(14,40,10);dl.castShadow=true;dl.shadow.mapSize.set(2048,2048);
Object.assign(dl.shadow.camera,{left:-38,right:38,top:38,bottom:-38,far:100});dl.shadow.camera.updateProjectionMatrix();dl.shadow.bias=-.0004;dl.shadow.normalBias=.04;sc.add(dl);
// prostředí pro odlesky kovu: procedurální „halu“ (gradient + světelné panely) převedeme na PMREM
let envTex=null;
try{const es=new G.Scene(),gc=document.createElement('canvas');gc.width=2;gc.height=256;const gx=gc.getContext('2d'),gr=gx.createLinearGradient(0,0,0,256);gr.addColorStop(0,'#0a1030');gr.addColorStop(.5,'#2a3a7a');gr.addColorStop(1,'#05060c');gx.fillStyle=gr;gx.fillRect(0,0,2,256);
 es.add(new G.Mesh(new G.SphereGeometry(50,16,16),new G.MeshBasicMaterial({map:new G.CanvasTexture(gc),side:G.BackSide})));
 [[0,30,0,0xffffff,14],[-30,12,10,0x7c8cff,10],[30,10,-10,0xff7a9c,8]].forEach(([px,py,pz,c,s])=>{const m=new G.Mesh(new G.PlaneGeometry(s,s*.5),new G.MeshBasicMaterial({color:c,side:2}));m.position.set(px,py,pz);m.lookAt(0,0,0);es.add(m)});
 const pm=new G.PMREMGenerator(ren);envTex=sc.environment=pm.fromScene(es,.04).texture;pm.dispose()}catch(e){console.log('env mapa:',e.message)}
// normálová a drsnostní mapa podlahy: spáry panelů a škrábance
function floorMaps(){const N=256,h=document.createElement('canvas');h.width=h.height=N;const x=h.getContext('2d');x.fillStyle='#808080';x.fillRect(0,0,N,N);
 for(let i=0;i<900;i++){x.fillStyle='rgba('+(R()<.5?'255,255,255':'0,0,0')+','+(R()*.12)+')';x.fillRect(R()*N,R()*N,1+R()*14,1)}
 x.strokeStyle='#000';x.lineWidth=4;for(let i=0;i<=N;i+=N/4){x.beginPath();x.moveTo(i,0);x.lineTo(i,N);x.moveTo(0,i);x.lineTo(N,i);x.stroke()}
 const d=x.getImageData(0,0,N,N).data,nc=document.createElement('canvas');nc.width=nc.height=N;const nx=nc.getContext('2d'),im=nx.createImageData(N,N),H=(i,j)=>d[(((j+N)%N)*N+((i+N)%N))*4]/255;
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const dx=(H(i+1,j)-H(i-1,j))*3,dy=(H(i,j+1)-H(i,j-1))*3,l=Math.hypot(dx,dy,1),k=(j*N+i)*4;im.data[k]=(-dx/l*.5+.5)*255;im.data[k+1]=(dy/l*.5+.5)*255;im.data[k+2]=(1/l*.5+.5)*255;im.data[k+3]=255}
 nx.putImageData(im,0,0);const mk=c=>{const t=new G.CanvasTexture(c);t.wrapS=t.wrapT=G.RepeatWrapping;t.repeat.set(10,10);t.anisotropy=8;return t};return{n:mk(nc),r:mk(h)}}
function floorTex(){const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d');x.fillStyle='#0c1124';x.fillRect(0,0,512,512);
 x.strokeStyle='#18214a';x.lineWidth=2;for(let i=0;i<=512;i+=128){x.beginPath();x.moveTo(i,0);x.lineTo(i,512);x.moveTo(0,i);x.lineTo(512,i);x.stroke()}
 x.strokeStyle='#3a4bb0';x.lineWidth=3;x.strokeRect(0,0,512,512);x.fillStyle='#2a3a8a';for(let i=64;i<512;i+=128)for(let j=64;j<512;j+=128){x.beginPath();x.arc(i,j,4,0,7);x.fill()}
 const t=new G.CanvasTexture(c);t.wrapS=t.wrapT=G.RepeatWrapping;t.repeat.set(10,10);t.anisotropy=8;return t}
const fm_=(()=>{try{return floorMaps()}catch(e){console.log('mapy podlahy:',e.message);return null}})(),fl=new G.Mesh(new G.PlaneGeometry(60,60),new G.MeshStandardMaterial(Object.assign({map:floorTex(),roughness:fm_?1:.4,metalness:.6},fm_?{normalMap:fm_.n,roughnessMap:fm_.r,normalScale:new G.Vector2(.9,.9)}:{})));fl.rotation.x=-Math.PI/2;fl.receiveShadow=true;sc.add(fl);
[[0,-30.5,61,1],[0,30.5,61,1],[-30.5,0,1,61],[30.5,0,1,61]].forEach(([x,z,w,d])=>{const b=new G.Mesh(new G.BoxGeometry(w,1.5,d),mt(0x5b6cff,.9));b.position.set(x,.75,z);sc.add(b)});
[[-30,-30],[30,-30],[-30,30],[30,30]].forEach(([x,z])=>{const p=new G.Mesh(new G.CylinderGeometry(1,1,5,12),mt(0x7c8cff,1));p.position.set(x,2.5,z);sc.add(p);
 const l=new G.PointLight(0x5b6cff,.9,40);l.position.set(x*.9,5,z*.9);sc.add(l)});
const dp=new Float32Array(900);for(let i=0;i<900;i++)dp[i]=i%3==1?R()*24:(R()-.5)*90;
const dust=new G.Points(new G.BufferGeometry().setAttribute('position',new G.BufferAttribute(dp,3)),new G.PointsMaterial({color:0x8fa0ff,size:.12,transparent:true,opacity:.5}));sc.add(dust);
