// js/plugins/llm.js – VOLITELNÝ plugin: LLM (přes server/llm.js) občas navrhne druh/strategii navíc.
// Smazáním tohoto souboru (a řádku v index.html) se LLM zcela odpojí; hra běží na vlastní neuronové síti.
// volitelně: LLM (přes server.js a ANTHROPIC_API_KEY) navrhne druh; výsledek se vždy ověří funkcí sanitize
let llmBusy=0,llmOff=0;
async function askLLM(){if(location.protocol=='file:'||llmBusy||llmOff)return;llmBusy=1;
 try{const r=await fetch('/api/monster',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prof,wave:st.wave,known:st.sp.map(s=>s.name)})});
  if(r.status==501)llmOff=1;
  if(r.ok){const j=await r.json(),g=sanitize(j.genome),sg=sanitizeS(j.strategy);if(sg&&st.str.length<6)addStrat(sg,1);if(g&&st.ph!='over'&&st.sp.length<8)addSpecies(g,1,String(j.name||'').replace(/[^\p{L}\p{N} .\-]/gu,'').slice(0,28)||null,'LLM')}}catch(e){}
 llmBusy=0}
HOOKS.wave.push(()=>{if(!TRAIN&&st.wave%2&&st.wave>=3)askLLM()});
