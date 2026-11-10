// server/mod.js – trvalá moderace: zákazy (bany) a hlášení patří hostiteli (podle jeho anonymního ID) a přežijí zánik lobby i restart serveru
const fs=require('fs'),path=require('path'),DAY=864e5;
module.exports=dir=>{fs.mkdirSync(dir,{recursive:true});const F=path.join(dir,'mod.json');let db={owners:{}},t=null;
 try{db=JSON.parse(fs.readFileSync(F,'utf8'))}catch(e){}if(!db||typeof db.owners!='object'||Array.isArray(db.owners))db={owners:{}};
 let rid=0;for(const o of Object.values(db.owners))for(const r of o.reports||[])rid=Math.max(rid,r.rid|0);
 const write=()=>{try{for(const k in db.owners){const o=db.owners[k];if(!Object.keys(o.bans||{}).length&&!(o.reports||[]).length)delete db.owners[k]}fs.writeFileSync(F+'.tmp',JSON.stringify(db));fs.renameSync(F+'.tmp',F)}catch(e){console.log('mod:',e.message)}};
 const save=()=>{clearTimeout(t);t=setTimeout(write,500)};
 function own(pid){if(!/^[a-f0-9]{12}$/.test(pid||''))return null;const o=db.owners[pid]||(db.owners[pid]={bans:{},reports:[]}),n=Date.now();o.bans=o.bans||{};o.reports=o.reports||[];
  for(const k in o.bans)if(n-o.bans[k].ts>60*DAY)delete o.bans[k];o.reports=o.reports.filter(r=>n-r.ts<30*DAY).slice(-50);
  const ks=Object.keys(o.bans);if(ks.length>100)ks.sort((a,b)=>o.bans[a].ts-o.bans[b].ts).slice(0,ks.length-100).forEach(k=>delete o.bans[k]);return o}
 return{own,save,flush(){clearTimeout(t);write()},nextRid:()=>++rid}};
