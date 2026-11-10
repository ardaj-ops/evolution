// js/ai/genome.js – GENOM příšery: geny, vyvážení, výběr protilátky proti stylu hráče, jména
const GN={body:['sphere','cube','spike','ring','crystal','pyramid'],move:['direct','flank','orbit','zigzag','stalk'],atk:['melee','shoot','burst','bomb','trail'],pow:['none','dash','blink','split','shield','aura','regen','summon','thorns']};
const NG={size:[.5,1.6],speed:[3,12],hp:[1,8],dmg:[5,20],hue:[0,360]};
const PC={none:0,dash:1,blink:1.2,split:1,shield:1.5,aura:1.5,regen:1,summon:2,thorns:1.5},AC={melee:0,shoot:1,burst:1.5,bomb:.8,trail:1};
const AJ={dash:'Bleskový',blink:'Fázový',split:'Dělivý',shield:'Pancéřovaný',aura:'Léčivý',regen:'Neumírající',summon:'Rodící',thorns:'Ostnatý'},MJ={flank:'Obchvatný',orbit:'Krouživý',zigzag:'Klikatý',stalk:'Číhavý',direct:'Divoký'},NN={melee:'Drtič',shoot:'Střelec',burst:'Salvovník',bomb:'Výbušník',trail:'Žhář'};
const rpick=a=>a[R()*a.length|0];
const randomGenome=()=>{const g={};for(const k in GN)g[k]=rpick(GN[k]);for(const k in NG)g[k]=NG[k][0]+R()*(NG[k][1]-NG[k][0]);g.brain=randBrain();return g};
const cross=(a,b)=>{const g={};for(const k in a)g[k]=R()<.5?a[k]:b[k];g.brain=crossBrain(a.brain||[],b.brain||[]);return g};
const mutate=g=>{g=Object.assign({},g);g.brain=mutBrain(g.brain||[]);for(const k in GN)if(R()<.25)g[k]=rpick(GN[k]);for(const k in NG)if(R()<.5){const[a,b]=NG[k];g[k]=cl(g[k]*(.8+R()*.4)+(k=='hue'?R()*40-20:0),a,b)}return g};
const diff=(a,b)=>Object.keys(GN).reduce((n,k)=>n+(a[k]!=b[k]),0)+(JSON.stringify(a.brain)!=JSON.stringify(b.brain)?1:0);
const cost=g=>g.hp*.5+g.speed*.25+g.dmg*.15+PC[g.pow]+AC[g.atk];
function balance(g,b){g=Object.assign({},g);for(let i=0;i<20&&cost(g)>b;i++){g.hp=Math.max(1,g.hp*.9);g.speed=Math.max(3,g.speed*.95);g.dmg=Math.max(5,g.dmg*.9)}return g}
function sanitize(g){if(!g||typeof g!='object')return null;const o={};for(const k in GN){if(!GN[k].includes(g[k]))return null;o[k]=g[k]}for(const k in NG){const v=+g[k];if(!isFinite(v))return null;o[k]=cl(v,NG[k][0],NG[k][1])}const b=Array.isArray(g.brain)?g.brain.slice(0,5):[];if(!b.every(r=>Array.isArray(r)&&BCOND.includes(r[0])&&BACT.includes(r[1])))return null;o.brain=b.map(r=>[r[0],r[1]]);return o}
function hex(h){const f=n=>{const k=(n+h/30)%12;return .55-.36*Math.max(-1,Math.min(k-3,9-k,1))};return(Math.round(f(0)*255)<<16)|(Math.round(f(8)*255)<<8)|Math.round(f(4)*255)}
const nameOf=(g,gen)=>(AJ[g.pow]||MJ[g.move])+' '+NN[g.atk]+(gen>1?' Mk.'+gen:'');
// jak dobře genom „kontruje“ aktuální profil hráčů (0..~3)
function counter(g){const p=prof,a=g.atk,w=g.pow;
 return p.still*((a=='shoot'||a=='burst'?1:0)+(w=='summon'||w=='blink'?.5:0))+p.far*((w=='dash'||w=='blink'?1:0)+g.speed/12*.6)
 +p.near*((a=='bomb'||a=='trail'?1:0)+(w=='shield'?.8:0)+(g.size>1.2?.4:0))+p.edge*(g.move=='flank'||g.move=='orbit'?1:0)
 +p.acc*((g.move=='zigzag'?1:0)+(w=='shield'||w=='aura'?.6:0))+(1-p.acc)*(w=='split'||w=='summon'?1:0)+p.mel*((w=='thorns'?1.2:0)+(a=='shoot'||a=='burst'?.8:0)+(g.move=='orbit'?.4:0))+bScore(g)}
// zaregistruje druh do tabulky typů (hostitel i klienti)
function regSp(id,name,g){g=sanitize(g);const k='x'+id;if(!g||T[k])return;T[k]={r:g.size*.8,hp:g.hp,sp:g.speed,d:g.dmg,pts:Math.round(10+cost(g)*5),c:hex(g.hue),g,sid:id}}
