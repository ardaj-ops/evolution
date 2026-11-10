// js/ai/memory.js – PAMĚŤ AI: nejlepší druhy, strategie a styl hráče se ukládají mezi běhy (jen v tomto prohlížeči)
const HOF=(()=>{let h=null;try{h=JSON.parse(store.get('evo_hof')||'null')}catch(e){}return Object.assign({sp:[],str:[],prof:null,runs:0},h||{})})();
const saveHof=()=>store.set('evo_hof',JSON.stringify(HOF));
function rememberRun(){
 for(const s of st.sp){const f=s.spawned?s.dmg/s.spawned*2+(s.dead?s.life/s.dead:8)*.3+counter(s.g)*2:s.fit,fit=s.fit?s.fit*.5+f*.5:f;
  if(!isFinite(fit))continue;const key=JSON.stringify(s.g),o=HOF.sp.find(x=>JSON.stringify(x.g)==key);if(o)o.fit=Math.max(o.fit,fit);else HOF.sp.push({name:s.name,g:s.g,gen:s.gen,fit})}
 for(const t of st.str){const f=t.use?t.dmg/t.use*3+sCounter(t.s)*2:t.fit,fit=t.fit?t.fit*.5+f*.5:f;
  if(!isFinite(fit))continue;const key=JSON.stringify(t.s),o=HOF.str.find(x=>JSON.stringify(x.s)==key);if(o)o.fit=Math.max(o.fit,fit);else HOF.str.push({name:t.name,s:t.s,gen:t.gen,fit})}
 HOF.sp.sort((a,b)=>b.fit-a.fit);HOF.sp.length=Math.min(HOF.sp.length,6);HOF.str.sort((a,b)=>b.fit-a.fit);HOF.str.length=Math.min(HOF.str.length,4);
 HOF.prof=Object.assign({},prof);HOF.runs++;saveHof()}
function seedFromMemory(){if(HOF.prof)for(const k in prof)if(typeof HOF.prof[k]=='number')prof[k]=prof[k]*.5+HOF.prof[k]*.5;
 HOF.sp.slice(0,3).forEach(h=>{const g=sanitize(h.g);if(g)addSpecies(g,Math.min(9,(h.gen|0)+1),null,'mem')});
 HOF.str.slice(0,2).forEach(h=>{const s=sanitizeS(h.s);if(s)addStrat(s,Math.min(9,(h.gen|0)+1))})}
function forgetAI(){resetNN();HOF.sp=[];HOF.str=[];HOF.prof=null;HOF.runs=0;saveHof();ovKey=''}
