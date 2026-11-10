// js/core/audio.js – syntetizovaný zvuk (WebAudio): zbraně, výbuchy, zásahy, prostorové panorama a adaptivní ambient
let ac=null,mg=null,nbuf=null,amb=null;const lastSnd={};
function actx(){if(!opt.snd)return null;try{if(!ac){ac=new(window.AudioContext||window.webkitAudioContext)();const c=ac.createDynamicsCompressor();mg=ac.createGain();mg.gain.value=.7;mg.connect(c);c.connect(ac.destination);
  nbuf=ac.createBuffer(1,ac.sampleRate,ac.sampleRate);const d=nbuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}
 if(ac.state=='suspended')ac.resume();return ac}catch(e){return null}}
function aout(v,pan){const g=ac.createGain();g.gain.value=v;let n=g;if(ac.createStereoPanner){const p=ac.createStereoPanner();p.pan.value=cl(pan||0,-1,1);g.connect(p);n=p}n.connect(mg);return g}
function tone(f,d,type,v,f2,pan){const a=actx();if(!a)return;const t=a.currentTime,o=a.createOscillator(),g=aout(v,pan);o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);
 g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);o.start(t);o.stop(t+d)}
function noise(d,ft,f1,f2,v,pan){const a=actx();if(!a)return;const t=a.currentTime,s=a.createBufferSource(),f=a.createBiquadFilter(),g=aout(v,pan);s.buffer=nbuf;f.type=ft;f.frequency.setValueAtTime(f1,t);if(f2)f.frequency.exponentialRampToValueAtTime(f2,t+d);
 g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);s.connect(f);f.connect(g);s.start(t,Math.random()*.5,d)}
const beep=(f,d,type,v,f2)=>tone(f,d,type,v,f2,0);
// panorama a hlasitost podle vzdálenosti od mé postavy
function spat(x,z){const m=vs&&vs.p&&vs.p.find(a=>a[0]==me);if(!m)return{p:0,v:1};const dx=x-m[1],d=hyp(dx,z-m[2]);return{p:cl(dx/25,-1,1),v:cl(1.2-d/45,.15,1)}}
const MINT={w9:.05,w2:.045,w4:.07,kill:.03,hurt:.1,boom:.08};
function sfx(k,x,z){if(!opt.snd||TRAIN)return;const now=performance.now()/1000;if(now-(lastSnd[k]||0)<(MINT[k]||.02))return;lastSnd[k]=now;
 const q=spat(x||0,z||0),v=q.v,p=q.p;
 switch(k){
 case 'w0':tone(950,.13,'sawtooth',.07*v,180,p);noise(.04,'highpass',3000,0,.04*v,p);break;
 case 'w1':noise(.28,'lowpass',1400,200,.22*v,p);tone(95,.22,'sine',.25*v,40,p);break;
 case 'w2':noise(.05,'bandpass',2200,0,.07*v,p);tone(160,.05,'square',.03*v,90,p);break;
 case 'w3':tone(260,.35,'square',.07*v,2600,p);noise(.35,'highpass',1800,0,.1*v,p);tone(70,.4,'sine',.28*v,30,p);break;
 case 'w4':noise(.12,'highpass',700,0,.06*v,p);break;
 case 'w5':noise(.45,'lowpass',500,2200,.16*v,p);tone(140,.3,'sawtooth',.08*v,60,p);break;
 case 'w6':noise(.22,'bandpass',800,3200,.12*v,p);tone(1400,.1,'triangle',.04*v,700,p);break;
 case 'w7':noise(.35,'lowpass',700,150,.25*v,p);tone(60,.4,'sine',.35*v,25,p);break;
 case 'w8':noise(.14,'highpass',1200,4000,.1*v,p);break;
 case 'w9':noise(.06,'bandpass',2600,0,.06*v,p);tone(1800,.05,'triangle',.03*v,900,p);break;
 case 'boom':noise(.7,'lowpass',900,120,.35*v,p);tone(70,.6,'sine',.4*v,25,p);break;
 case 'kill':tone(420,.1,'triangle',.06*v,120,p);noise(.08,'bandpass',1500,0,.05*v,p);break;
 case 'hurt':tone(140,.25,'sawtooth',.14*v,50,p);noise(.18,'lowpass',700,0,.12*v,p);break;
 case 'dash':noise(.25,'bandpass',500,2500,.1*v,p);break;
 case 'warp':tone(300,.25,'sine',.06*v,1400,p);break;
 case 'pick':tone(660,.12,'sine',.07,990);break}}
// adaptivní ambient: dvě rozladěné pily přes filtr; s napětím (počet nepřátel, boss) se zvedá výška i hlasitost
function ambient(on,tension){const a=on?actx():null;if(!a){if(amb)amb.g.gain.value=0;return}
 if(!amb){const g=a.createGain();g.gain.value=0;const f=a.createBiquadFilter();f.type='lowpass';f.frequency.value=400;
  const o1=a.createOscillator(),o2=a.createOscillator(),l=a.createOscillator(),lg=a.createGain();o1.type='sawtooth';o2.type='sawtooth';o1.frequency.value=55;o2.frequency.value=55.7;l.frequency.value=.12;lg.gain.value=180;
  l.connect(lg);lg.connect(f.frequency);o1.connect(f);o2.connect(f);f.connect(g);g.connect(mg);o1.start();o2.start();l.start();amb={g,f,o1}}
 const t=a.currentTime;amb.g.gain.setTargetAtTime(.04+.05*tension,t,.5);amb.f.frequency.setTargetAtTime(300+tension*700,t,.8);amb.o1.frequency.setTargetAtTime(55*(1+tension*.12),t,1)}
