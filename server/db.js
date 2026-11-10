// server/db.js – malé trvalé úložiště klíč → text (pro AI: neuronová síť, síň slávy…); sdílené všemi herními místnostmi na serveru
const fs=require('fs'),path=require('path');
module.exports=dir=>{fs.mkdirSync(dir,{recursive:true});const F=path.join(dir,'store.json');let m={};try{m=JSON.parse(fs.readFileSync(F,'utf8'))||{}}catch(e){}let t=null;
 const write=()=>{try{fs.writeFileSync(F+'.tmp',JSON.stringify(m));fs.renameSync(F+'.tmp',F)}catch(e){console.log('db:',e.message)}},save=()=>{clearTimeout(t);t=setTimeout(write,1000)};
 return{get:k=>Object.prototype.hasOwnProperty.call(m,k)?m[k]:null,set:(k,v)=>{if(typeof k=='string'&&typeof v=='string'&&v.length<300000&&k.length<40&&(k in m||Object.keys(m).length<50)){m[k]=v;save()}},flush(){clearTimeout(t);write()}}};
