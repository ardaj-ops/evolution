// js/core/options.js – nastavení hry (ukládá se do prohlížeče)
const OPTS={ai:['Síla AI',['Mírná','Střední','Silná']],dif:['Obtížnost',['Lehká','Normální','Těžká']],gfx:['Grafika',['Nízká','Střední','Vysoká']],zoom:['Kamera',['Blízko','Normální','Daleko']],snd:['Zvuk',['Vyp','Zap']]};
const AIB=[.75,1,1.3];
const DF=[{hp:.75,n:.8,d:.7},{hp:1,n:1,d:1},{hp:1.35,n:1.25,d:1.3}];
const opt=Object.assign({dif:1,gfx:2,zoom:1,snd:1,cls:0,wp:0,ai:1},JSON.parse(store.get('evo_opt')||'{}'));
const saveOpt=()=>store.set('evo_opt',JSON.stringify(opt));
const PERKS={hp:['Vitalita','+10 životů',5,l=>20*(l+1)],dmg:['Zbraňmistr','+5 % poškození',5,l=>25*(l+1)],spd:['Lehké nohy','+4 % rychlost',5,l=>20*(l+1)],cards:['Volba','+1 karta při výběru vylepšení',2,l=>80*(l+1)],ess:['Sběratel','+15 % esence',3,l=>40*(l+1)]};
const META=Object.assign({ess:0,lv:{}},JSON.parse(store.get('evo_meta')||'{}'));META.lv=Object.assign({hp:0,dmg:0,spd:0,cards:0,ess:0},META.lv);
const saveMeta=()=>store.set('evo_meta',JSON.stringify(META));
const gainOf=(w,sc,b)=>Math.round((w*8+sc/40+b*30)*(1+.15*META.lv.ess));
const sanM=l=>{const o={};for(const k in PERKS)o[k]=cl(Math.floor(+(l&&l[k])||0),0,PERKS[k][2]);return o};
function buy(k){const[,,mx,cf]=PERKS[k],l=META.lv[k],c=cf(l);if(l<mx&&META.ess>=c){META.ess-=c;META.lv[k]++;saveMeta();ovKey=''}}
function cyc(k){opt[k]=(opt[k]+1)%OPTS[k][1].length;if(k=='gfx'){Object.assign(GX,GPRE[opt.gfx]);saveSet()}saveOpt();applyOpt();ovKey=''}
function setWp(i){opt.wp=i;ppSync();saveOpt();ovKey=''}
function setCls(i){opt.cls=i;opt.wp=CLS[i].wd;ppSync();saveOpt();ovKey=''}
function applyOpt(){applyGX()}
