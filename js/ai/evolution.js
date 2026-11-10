// js/ai/evolution.js – EVOLUČNÍ AI: hodnotí druhy podle toho, jak uspěly, vymírá slabé a vymýšlí zcela nové
function credit(sid,x,str){if(!(x>0))return;const s=st.sp.find(q=>q.id==sid);if(s)s.dmg+=x;const t=str&&st.str.find(q=>q.id==str);if(t)t.dmg+=x}
function died(e){const s=st.sp.find(q=>q.id==e.sid);if(s){s.life+=e.age;s.dead++}}
function addSpecies(g,gen,name,src){const id=++st.sid;g=balance(g,(5+st.wave*.6)*AIB[opt.ai]*st.dir);let nm=name||nameOf(g,gen);const bn=nm;for(let i=0;st.sp.some(q=>q.name==nm);i++)nm=bn+' '+'ΑΒΓΔΕΖΗΘ'[i%8]+(i>7?i:'');
 const s={id,gen,name:nm,g,fit:0,spawned:0,dmg:0,life:0,dead:0,src};st.sp.push(s);regSp(id,s.name,g);return s}
function invent(){const L=st.sp;
 if(R()<.75){let c=null;for(let i=0;i<6;i++){c=nnSpecies();if(L.every(s=>diff(c.g,s.g)>=1))break}const s=addSpecies(c.g,1,null,'NN');s.tr=c.tr;return s}
 let best=null,bs=-1e9;
 for(let i=0;i<14;i++){let g,gen=1;
  if(L.length>=2&&i%2){const a=L[R()*Math.min(3,L.length)|0],b=L[R()*L.length|0];g=mutate(cross(a.g,b.g));gen=Math.max(a.gen,b.gen)+1}else g=randomGenome();
  const nov=L.reduce((m,s)=>Math.min(m,diff(g,s.g)),9),sc=counter(g)*2+nov*.5+R()*.4;if(sc>bs){bs=sc;best={g,gen}}}
 return addSpecies(best.g,best.gen,null,'AI')}
function evolve(){const L=st.sp,out=[];
 const EM_=L.filter(s=>s.spawned).map(s=>s.dmg/s.spawned*2+(s.dead?s.life/s.dead:8)*.3),mu_=EM_.reduce((a,b)=>a+b,0)/(EM_.length||1),sd_=Math.sqrt(EM_.reduce((a,b)=>a+(b-mu_)*(b-mu_),0)/(EM_.length||1));
 for(const s of L){if(s.spawned){const emp=s.dmg/s.spawned*2+(s.dead?s.life/s.dead:8)*.3;if(s.tr)learnNN('sp',s.tr,emp,EM_.length>=3?(emp-mu_)/(sd_+.5):undefined);const f=emp+counter(s.g)*2;s.fit=s.fit?s.fit*.5+f*.5:f}else s.fit=s.fit||counter(s.g)*2;s.spawned=s.dmg=s.life=s.dead=0}
 L.sort((a,b)=>b.fit-a.fit);while(L.length>5)out.push('Vyhynul druh: '+L.pop().name);
 if(st.wave>=2)for(let i=0;i<(st.wave%3==0?2:1);i++){const s=invent();out.push('Nový druh: '+s.name+(s.gen>1?' (potomek)':''))}
 return out}
