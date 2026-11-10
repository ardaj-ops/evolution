// server/sim.js – SERVEROVÁ SIMULACE: pro každé lobby běží vlastní instance herní logiky (stejné soubory jako v klientovi, ve vm kontextu bez prohlížeče).
// Server počítá nepřátele, AI, střely a stav; klienti jen posílají vstupy a vykreslují snímky.
const vm=require('vm'),fs=require('fs'),path=require('path'),ROOT=path.join(__dirname,'..','js');
const FILES=['core/utils','core/state','core/options','entities/enemies','ai/brain','ai/genome','ai/strategy','ai/nn','ai/evolution','ai/behavior','ai/memory','entities/player','entities/projectiles','systems/profile','systems/hazards','systems/waves','systems/update','core/game'];
const SRC=FILES.map(f=>[f,fs.readFileSync(path.join(ROOT,f+'.js'),'utf8')]).concat([['simapi',fs.readFileSync(path.join(__dirname,'simapi.js'),'utf8')]]);
function createSim(db){
 const sb={THREE:{},localStorage:{getItem:k=>db.get(k),setItem:(k,v)=>db.set(k,v)},fx(){},sfx(){},netSend(){},net:{on:true},TR:{on:false},ovKey:'',menuMsg:'',location:{protocol:'http:'},console:{log(){},error(){}}};
 vm.createContext(sb);for(const[n,c]of SRC)new vm.Script(c,{filename:n}).runInContext(sb);
 const S=vm.runInContext('SIM',sb);let live=false;
 return{add:S.add,remove:S.remove,cls:S.cls,input:S.input,pick:S.pick,tick:S.tick,snap:S.snap,phase:S.phase,ids:S.ids,start(o){S.start(o);live=true},get live(){return live},stop(){live=false},eval:code=>vm.runInContext(code,sb)}}
module.exports={createSim};
