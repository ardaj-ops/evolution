// js/ai/strategy.js – STRATEGIE: jak se příšery chovají jako tým (obchvat, čekání na přesilu, návnada). AI je vymýšlí a hodnotí
const SG={flankP:[0,.9],gather:[0,8],hold:[10,20],bait:[0,.4]};
const newStrat=()=>({flankP:R()*.9,gather:R()<.5?0:2+(R()*6|0),hold:10+R()*10,bait:R()<.4?R()*.4:0});
function sanitizeS(s){if(!s||typeof s!='object')return null;const o={};for(const k in SG){const v=+s[k];if(!isFinite(v))return null;o[k]=cl(v,SG[k][0],SG[k][1])}o.gather=Math.round(o.gather);return o}
const crossS=(a,b)=>{const o={};for(const k in SG)o[k]=R()<.5?a[k]:b[k];return o};
const mutS=s=>{const o=Object.assign({},s);for(const k in SG)if(R()<.5){const[a,b]=SG[k];o[k]=cl(o[k]+(R()-.5)*(b-a)*.4,a,b)}o.gather=Math.round(o.gather);return o};
const distS=(a,b)=>Object.keys(SG).reduce((n,k)=>n+Math.abs(a[k]-b[k])/(SG[k][1]-SG[k][0]),0);
function sCounter(s){const p=prof;return p.still*s.flankP*1.2+p.near*s.gather/8+p.far*(s.bait*3+s.gather/16)+p.edge*s.flankP+p.acc*s.bait*3+(1-p.acc)*s.gather/8+p.mel*(s.flankP*.6+s.bait*1.5)}
function strName(s,gen){const a=[];if(s.flankP>.5)a.push('Kleště');if(s.gather>=3)a.push('Příliv');if(s.bait>.15)a.push('Návnada');return(a.join(' + ')||'Frontální útok')+(gen>1?' Mk.'+gen:'')}
function balS(s){const t=s.flankP/.9+s.gather/8+s.bait/.4;if(t<=1.8)return s;const k=1.8/t;return{flankP:s.flankP*k,gather:Math.round(s.gather*k),hold:s.hold,bait:s.bait*k}}
function addStrat(s,gen){s=balS(s);const id=++st.sidS;let nm=strName(s,gen);const bn=nm;for(let i=0;st.str.some(q=>q.name==nm);i++)nm=bn+' '+'ΑΒΓΔΕΖΗΘ'[i%8]+(i>7?i:'');
 const t={id,gen,name:nm,s,fit:0,dmg:0,use:0};st.str.push(t);return t}
function inventStrat(){const L=st.str;if(R()<.75){const c=nnStrat(),t=addStrat(c.s,1);t.tr=c.tr;return t}
 let best=null,bs=-1e9;
 for(let i=0;i<8;i++){let s,gen=1;if(L.length>=2&&i%2){s=mutS(crossS(L[0].s,L[1].s));gen=Math.max(L[0].gen,L[1].gen)+1}else s=newStrat();
  const nov=L.reduce((m,t)=>Math.min(m,distS(s,t.s)),9),sc=sCounter(s)*2+nov+R()*.3;if(sc>bs){bs=sc;best={s,gen}}}
 return addStrat(best.s,best.gen)}
function evolveStrat(){const L=st.str,out=[];
 for(const t of L){if(t.use){const emp=t.dmg/t.use*3;if(t.tr)learnNN('st',t.tr,emp);const f=emp+sCounter(t.s)*2;t.fit=t.fit?t.fit*.5+f*.5:f}else t.fit=t.fit||sCounter(t.s)*2;t.dmg=t.use=0}
 L.sort((a,b)=>b.fit-a.fit);while(L.length>3)out.push('Strategie opuštěna: '+L.pop().name);
 if(!L.length){for(let i=0;i<2;i++){const c=nnStrat(),t=addStrat(c.s,1);t.tr=c.tr}}else if(st.wave>=2)out.push('Nová strategie: '+inventStrat().name);
 const ids=[L[0].id];if(L.length>1)ids.push(L[1+(R()*(L.length-1)|0)].id);st.actS=ids;st.strA={};for(const t of L)st.strA[t.id]=t.s;
 out.push('Strategie vlny: '+ids.map(i=>L.find(t=>t.id==i).name).join(' + '));return out}
// uplatnění strategie na jednu příšeru; vrací [vx,vz,násobek rychlosti] nebo null
function strat(e,p,d,rx,rz,dt){const S=st.strA[e.str];if(!S)return null;const s=e.side;if(e.role=='bait'&&e.age>12)e.role='front';
 if(e.role=='bait')return[-rz*s+rx*(d>16?1:-.3),rx*s+rz*(d>16?1:-.3),1.2];
 if(S.gather&&!e.go){let n=0;for(const o of en)if(o.str==e.str&&hyp(o.x-e.x,o.z-e.z)<9)n++;
  if(n>=S.gather||e.age>7){for(const o of en)if(o.str==e.str&&hyp(o.x-e.x,o.z-e.z)<9){if(!o.go)o.sp*=1.25;o.go=1}}
  else{const f=d>S.hold+1?1:d<S.hold-1?-1:0;return[rx*f-rz*s*.3,rz*f+rx*s*.3,.8]}}
 if(e.role=='flank'&&d>8)return[rx-rz*s*1.1,rz+rx*s*1.1,1];
 return null}
