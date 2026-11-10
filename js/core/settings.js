// js/core/settings.js – nastavení grafiky a ovládání (ukládá se v prohlížeči)
const KEYDEF={up:'KeyW',down:'KeyS',left:'KeyA',right:'KeyD',dash:'Space',w1:'Digit1',w2:'Digit2',w3:'Digit3',w4:'Digit4',wnext:'KeyE',wprev:'KeyQ',fire:''};
const KEYLBL={up:'Nahoru',down:'Dolů',left:'Doleva',right:'Doprava',dash:'Dash',w1:'Zbraň 1',w2:'Zbraň 2',w3:'Zbraň 3',w4:'Zbraň 4',wnext:'Další zbraň',wprev:'Předchozí zbraň',fire:'Střelba (klávesa navíc)'};
const GPRE=[{bloom:0,shadow:0,grade:0,env:0,decals:0,res:.75,part:.5},{bloom:0,shadow:1,grade:0,env:1,decals:1,res:1,part:1},{bloom:1,shadow:1,grade:1,env:1,decals:1,res:1,part:1}],PNAME=['Nízká','Střední','Vysoká'],GXDEF={fov:55,bright:1,fps:0};
const cleanGX=g=>{const o=Object.assign({},GPRE[2],GXDEF,g||{});for(const k of['bloom','shadow','grade','env','decals','fps'])o[k]=o[k]?1:0;o.res=[.5,.75,1,1.5].includes(o.res)?o.res:1;o.part=[.25,.5,1].includes(o.part)?o.part:1;o.fov=cl(+o.fov||55,40,85);o.bright=cl(+o.bright||1,.6,1.5);
 return{bloom:o.bloom,shadow:o.shadow,grade:o.grade,env:o.env,decals:o.decals,fps:o.fps,res:o.res,part:o.part,fov:o.fov,bright:o.bright}};
const cleanKeys=k=>{const o={};for(const a in KEYDEF){const v=k&&k[a];o[a]=typeof v=='string'&&v.length<=20&&/^[A-Za-z0-9]*$/.test(v)?v:KEYDEF[a]}return o};
const cleanName=n=>String(n==null?'':n).replace(/[^\p{L}\p{N} .\-_]/gu,'').trim().slice(0,20)||'Profil';
const cleanProf=p=>({name:cleanName(p&&p.name),gx:cleanGX(p&&p.gx),keys:cleanKeys(p&&p.keys),btn:p&&p.btn==2?2:0});
const SETJ=(()=>{try{return JSON.parse(store.get('evo_set')||'{}')||{}}catch(e){return{}}})();
// profily nastavení (max. 6); starý jednoprofilový formát se převede na profil „Výchozí“
const PROF=(()=>{let L=Array.isArray(SETJ.profiles)?SETJ.profiles:(SETJ.gx||SETJ.keys?[{name:'Výchozí',gx:SETJ.gx,keys:SETJ.keys,btn:SETJ.btn}]:[{name:'Výchozí',gx:GPRE[opt.gfx]||GPRE[2]}]);L=L.slice(0,6).map(cleanProf);return L.length?L:[cleanProf({name:'Výchozí'})]})();
const SET={open:false,cap:null,ver:0,msg:'',code:'',act:cl(SETJ.act|0,0,PROF.length-1),btn:0},GX={},BIND={};
{const p=PROF[SET.act];Object.assign(GX,p.gx);Object.assign(BIND,p.keys);SET.btn=p.btn}
const saveSet=()=>{PROF[SET.act]=Object.assign({},PROF[SET.act],{gx:Object.assign({},GX),keys:Object.assign({},BIND),btn:SET.btn});store.set('evo_set',JSON.stringify({act:SET.act,profiles:PROF}))};
function presetName(){const i=GPRE.findIndex(p=>['bloom','shadow','grade','env','decals','res','part'].every(k=>p[k]==GX[k]));return i<0?'Vlastní':PNAME[i]}
function applyGX(){try{ren.setPixelRatio(cl(devicePixelRatio*GX.res,.5,2));ren.setSize(innerWidth,innerHeight);if(comp)comp.setSize(innerWidth,innerHeight);
 ren.shadowMap.enabled=!!GX.shadow;dl.castShadow=!!GX.shadow;sc.environment=GX.env?envTex:null;hemi.intensity=.7*GX.bright;dl.intensity=.8*GX.bright;
 cam.fov=GX.fov;cam.updateProjectionMatrix();if(bloomPass)bloomPass.enabled=!!GX.bloom;if(gradePass)gradePass.enabled=!!GX.grade;
 const sig=GX.shadow+'/'+GX.env;if(applyGX.last!==sig){applyGX.last=sig;sc.traverse(o=>{if(o.material)[].concat(o.material).forEach(m=>{m.needsUpdate=true})})}
 const f=$('fps');if(f)f.style.display=GX.fps?'block':'none'}catch(e){console.log('applyGX:',e.message)}}
function setPreset(i){Object.assign(GX,GPRE[i]);opt.gfx=i;saveOpt();saveSet();applyGX();SET.ver++}
function gxToggle(k){GX[k]=GX[k]?0:1;saveSet();applyGX();SET.ver++}
function gxCycle(k,vals){GX[k]=vals[(vals.indexOf(GX[k])+1)%vals.length];saveSet();applyGX();SET.ver++}
function gxSet(k,v){GX[k]=v;saveSet();applyGX();const s=$('v_'+k);if(s)s.textContent=k=='fov'?v+'°':Math.round(v*100)+' %'}
function rebind(a){SET.cap=a;SET.ver++}
function rebindTo(code){const a=SET.cap,old=BIND[a];for(const k in BIND)if(k!=a&&BIND[k]===code)BIND[k]=old;BIND[a]=code;saveSet()}
function clearKey(a){BIND[a]='';saveSet();SET.ver++}
function btnCycle(){SET.btn=SET.btn?0:2;saveSet();SET.ver++}
function resetSet(){Object.assign(BIND,KEYDEF);Object.assign(GX,GPRE[2],GXDEF);opt.gfx=2;SET.btn=0;SET.cap=null;saveOpt();saveSet();applyGX();SET.ver++}
function openSettings(){SET.open=true;SET.ver++}
function closeSettings(){SET.open=false;SET.cap=null;SET.msg='';ovKey='';SET.ver++}
// ---- profily
function loadProf(i){SET.code='';const p=PROF[i];Object.assign(GX,p.gx);Object.assign(BIND,p.keys);SET.btn=p.btn;SET.cap=null}
function profSwitch(i){saveSet();SET.act=i;loadProf(i);saveSet();applyGX();SET.ver++}
function profNew(){if(PROF.length>=6)return setMsg('Maximum je 6 profilů.');PROF.push({name:'Profil '+(PROF.length+1),gx:Object.assign({},GX),keys:Object.assign({},BIND),btn:SET.btn});profSwitch(PROF.length-1)}
function profRename(){const n=prompt('Název profilu:',PROF[SET.act].name);if(n===null)return;PROF[SET.act].name=cleanName(n);saveSet();SET.ver++}
function profDel(){if(PROF.length<2)return;PROF.splice(SET.act,1);SET.act=Math.min(SET.act,PROF.length-1);loadProf(SET.act);saveSet();applyGX();SET.ver++}
function setMsg(t){SET.msg=t;SET.ver++}
// ---- export / import (soubor JSON; vše se při importu znovu ověří a ořeže)
function saveFile(name,text){saveFile.last={name,text};const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:'application/json'}));a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)}
function setExport(all){saveSet();const ps=(all?PROF:[PROF[SET.act]]).map(cleanProf);saveFile(all?'evoluce-nastaveni.json':'evoluce-profil-'+cleanName(PROF[SET.act].name).replace(/ /g,'_')+'.json',JSON.stringify({evoluce:'settings',v:1,profiles:ps},null,1));setMsg('Exportováno profilů: '+ps.length)}
function setImportData(j){const L=Array.isArray(j&&j.profiles)?j.profiles:(j&&typeof j=='object'&&!Array.isArray(j)&&(Object.prototype.hasOwnProperty.call(j,'gx')||Object.prototype.hasOwnProperty.call(j,'keys'))?[j]:null);if(!L||!L.length)return setMsg('Neplatný soubor nastavení.');
 const room=6-PROF.length;if(room<=0)return setMsg('Máš maximum 6 profilů – jeden nejdřív smaž.');
 const add=L.slice(0,room).map(cleanProf);add.forEach(p=>{let n=p.name,i=2;while(PROF.some(q=>q.name==n))n=p.name.slice(0,16)+' '+i++;p.name=n;PROF.push(p)});
 profSwitch(PROF.length-add.length);setMsg('Importováno profilů: '+add.length+(L.length>room?' (zbytek se nevešel)':''))}
function readImportFile(f){if(!f)return;if(f.size>100000)return setMsg('Soubor je příliš velký.');const r=new FileReader();r.onload=()=>{let j=null;try{j=JSON.parse(r.result)}catch(e){}if(j===null)setMsg('Soubor se nepodařilo přečíst.');else setImportData(j)};r.readAsText(f)}
function setImport(inp){readImportFile(inp.files&&inp.files[0]);inp.value=''}
// ---- sdílení kódem: EVO1-<base64url(JSON)>-<kontrolní součet>; při načtení se vše znovu ověří (cleanProf)
const GXORD=['bloom','shadow','grade','env','decals','fps','res','part','fov','bright'],KORD=Object.keys(KEYDEF);
function b64e(s){const b=new TextEncoder().encode(s);let t='';b.forEach(x=>t+=String.fromCharCode(x));return btoa(t).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
function b64d(s){s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';const t=atob(s),b=new Uint8Array(t.length);for(let i=0;i<t.length;i++)b[i]=t.charCodeAt(i);return new TextDecoder().decode(b)}
const chk=s=>{let h=0;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))&0xffff;return h.toString(16).padStart(4,'0')};
function profCode(p){p=cleanProf(p);const b=b64e(JSON.stringify([p.name,GXORD.map(k=>p.gx[k]),KORD.map(k=>p.keys[k]),p.btn]));return'EVO1-'+b+'-'+chk(b)}
function codeToProf(code){const m=/^EVO1-([A-Za-z0-9_-]+)-([0-9a-f]{4})$/.exec(String(code).replace(/\s+/g,''));if(!m||m[1].length>1500||chk(m[1])!=m[2])return null;
 try{const a=JSON.parse(b64d(m[1]));if(!Array.isArray(a)||!Array.isArray(a[1])||!Array.isArray(a[2]))return null;const gx={},keys={};GXORD.forEach((k,i)=>gx[k]=a[1][i]);KORD.forEach((k,i)=>keys[k]=a[2][i]);return cleanProf({name:a[0],gx,keys,btn:a[3]})}catch(e){return null}}
function codeMake(){saveSet();SET.code=profCode(PROF[SET.act]);SET.ver++}
function codeCopy(){const t=$('codeout');if(!t)return;const done=()=>setMsg('Kód zkopírován do schránky.'),old=()=>{t.select();try{if(document.execCommand('copy'))done()}catch(e){}};
 if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t.value).then(done,old);else old()}
function codeImport(v){const p=codeToProf(v);if(!p)return setMsg('Neplatný kód – zkontroluj, jestli je celý a bez překlepu.');if(PROF.length>=6)return setMsg('Máš maximum 6 profilů – jeden nejdřív smaž.');
 let n=p.name,i=2;while(PROF.some(q=>q.name==n))n=p.name.slice(0,16)+' '+i++;p.name=n;PROF.push(p);profSwitch(PROF.length-1);setMsg('Načten profil „'+n+'“.')}
