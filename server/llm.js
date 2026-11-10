// server/llm.js – VOLITELNÝ LLM plugin serveru (načte se jen když je nastaven ANTHROPIC_API_KEY). Hra funguje i bez něj.
let lastLLM=0;
const PROMPT='You design ONE new monster for a co-op roguelike whose enemies adapt to the players. Input: player play-style profile (0..1: still, near, far, edge, acc), wave, names of known monsters. Return ONLY JSON: {"name":"Czech name, max 3 words","genome":{"body":one of sphere|cube|spike|ring|crystal|pyramid,"move":one of direct|flank|orbit|zigzag|stalk,"atk":one of melee|shoot|burst|bomb|trail,"pow":one of none|dash|blink|split|shield|aura|regen|summon,"brain":[up to 5 rules [cond,act]; cond one of always|near|mid|far|still|moving|aimed|lowhp|crowd; act one of charge|approach|retreat|strafe|flank|hold|orbit|evade; first matching rule wins],"size":0.5-1.6,"speed":3-12,"hp":1-8,"dmg":5-20,"hue":0-360},"strategy":{"flankP":0-0.9,"gather":0-8,"hold":10-20,"bait":0-0.4}}. The monster must counter the profile and differ from known ones. Input: ';
async function monster(q,r){const key=process.env.ANTHROPIC_API_KEY,end=(c,o)=>{r.writeHead(c,{'Content-Type':'application/json'});r.end(JSON.stringify(o||{}))};
 if(!key)return end(501);if(Date.now()-lastLLM<10000)return end(429);lastLLM=Date.now();
 let b='';for await(const c of q){b+=c;if(b.length>4000)return end(413)}
 try{const i=JSON.parse(b),res=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'x-api-key':key,'anthropic-version':'2023-06-01','content-type':'application/json'},
  body:JSON.stringify({model:process.env.CLAUDE_MODEL||'claude-sonnet-5-5',max_tokens:700,messages:[{role:'user',content:PROMPT+JSON.stringify({prof:i.prof,wave:i.wave,known:i.known})}]})});
  const j=await res.json(),t=(j.content&&j.content[0]&&j.content[0].text)||'',m=t.match(/\{[\s\S]*\}/);end(200,m?JSON.parse(m[0]):{})}catch(e){end(502)}}
module.exports=monster;
