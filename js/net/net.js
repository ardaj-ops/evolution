// js/net/net.js – klient sítě a lobby: seznam lobby, vytvoření / připojení / opuštění, hesla; hostitel simuluje, ostatní posílají vstupy a berou snímky
const net={ws:null,on:false,owner:false,room:'',lock:0,pend:null};
const CID=(()=>{let c=store.get('evo_cid');if(!/^[a-f0-9]{16}$/.test(c||'')){c=Array.from({length:16},()=>Math.floor(Math.random()*16).toString(16)).join('');store.set('evo_cid',c)}return c})();
const MUTE=(()=>{const o={};try{const j=JSON.parse(store.get('evo_mute')||'{}');for(const k in j)if(/^[a-f0-9]{12}$/.test(k)&&Object.keys(o).length<50)o[k]=cleanPN(j[k])}catch(e){}return o})(),saveMute=()=>store.set('evo_mute',JSON.stringify(MUTE)),isMuted=x=>!!(x&&((x.pid&&MUTE[x.pid])||LB.muted.has(x.id)));
const CHAT={open:false,draft:'',last:''};
const LB={list:[],view:[],q:'',pass:'',sel:'',members:[],chat:[],muted:new Set(),vote:null,reports:[],bans:[],conn:location.protocol=='file:'?'file':'off'};
const ERRT={nolobby:'Lobby neexistuje (možná už zaniklo).',full:'Lobby je plná.',pass:'Špatné heslo.',exists:'Lobby s tímto názvem už existuje.',inroom:'Už jsi v lobby.',banned:'Hostitel tě z této lobby vyhodil.',busy:'Server je plný, zkus to později.',rate:'Příliš mnoho pokusů, počkej minutu.'};
function netSend(o){if(net.ws&&net.ws.readyState==1)net.ws.send(JSON.stringify(o))}
function netOpen(cb){if(LB.conn=='file')return;if(net.ws&&net.ws.readyState==1){if(cb)cb();return}if(net.ws&&net.ws.readyState==0){if(cb)net.pend=cb;return}
 const ws=new WebSocket((location.protocol=='https:'?'wss://':'ws://')+location.host);net.ws=ws;LB.conn='connecting';net.pend=cb||null;
 ws.onopen=()=>{LB.conn='ok';netSend({t:'list'});if(net.pend){const f=net.pend;net.pend=null;f()}lbStatus()};
 ws.onmessage=e=>{let m=null;try{m=JSON.parse(e.data)}catch(x){}if(m&&m.t)netMsg(m)};
 ws.onclose=()=>{if(net.ws===ws){net.ws=null;LB.conn='off';if(net.on)netDown('Spojení bylo ukončeno.');lbStatus()}};
 ws.onerror=()=>{LB.conn='off';lbStatus()}}
function netMsg(m){if(!net.on&&m.t!='lobbies'&&m.t!='welcome'&&m.t!='err'&&m.t!='left')return;// zpožděné zprávy po odchodu z lobby se ignorují
 switch(m.t){
 case 'lobbies':LB.list=Array.isArray(m.list)?m.list.slice(0,100):[];lbRender();break;
 case 'welcome':LB.chat=[];LB.muted=new Set();LB.vote=null;LB.reports=[];net.on=true;me=m.id;isHost=false;net.owner=!!m.host;LB.bans=[];net.room=String(m.room||'');net.lock=m.lock?1:0;for(const k in P)delete P[k];vs=null;menuMsg='';ovKey='';
  netSend({t:'cls',c:opt.cls,m:META.lv});break;
 case 'chat':chatAdd(m);break;
 case 'chathist':LB.chat=(Array.isArray(m.list)?m.list:[]).slice(-50).map(c=>chatClean(c,0));chatLog();chatOverlay();break;
 case 'vote':LB.vote=Object.assign({},m,{end:Date.now()+(m.left|0)*1000});ovKey='';voteUi();break;
 case 'voteend':LB.vote=null;ovKey='';voteUi();break;
 case 'kicked':netDown('Byl(a) jsi vyhozen(a) z lobby hostitelem.');break;
 case 'members':LB.members=(Array.isArray(m.list)?m.list:[]).slice(0,4).map(x=>({id:x.id|0,name:cleanPN(x.name),color:cl(Math.floor(+x.color)||0,0,7),host:!!x.host,pid:/^[a-f0-9]{12}$/.test(x.pid)?x.pid:''}));ovKey='';break;
 case 'report':reportAdd(m);break;
 case 'mod':LB.bans=(Array.isArray(m.bans)?m.bans:[]).slice(0,100).map(b=>({pid:/^[a-f0-9]{12}$/.test(b.pid)?b.pid:'',name:cleanPN(b.name)})).filter(b=>b.pid);LB.reports=(Array.isArray(m.reports)?m.reports:[]).slice(-50).map(reportClean);ovKey='';break;
 case 'snap':vs=m.s;(m.s.sp||[]).forEach(([i,n,g])=>regSp(i,n,g));m.s.ev.forEach(fx);break;
 case 'end':netDown('Hostitel lobby zavřel.');break;
 case 'err':menuMsg=ERRT[m.code]||'Chyba serveru.';ovKey='';break}}
function netDown(msg){net.on=false;isHost=true;net.owner=false;LB.bans=[];vs=null;st.ph='menu';for(const k in P)delete P[k];[en,bl,eb,hz,ev,evOut].forEach(a=>a.length=0);LB.members=[];LB.chat=[];LB.muted=new Set();LB.vote=null;LB.reports=[];if(CHAT.open)chatClose();voteUi();menuMsg=msg||'';ovKey='';netSend({t:'list'})}
// ---- lobby: tlačítka JOIN / CREATE / LEAVE
function lobbyCreate(){if(LB.conn=='file'||net.on||TR.on)return;netOpen(()=>netSend({t:'create',name:LB.q.trim(),pass:LB.pass,p:ppInfo(),cid:CID}))}
function lobbyJoin(){if(LB.conn=='file'||net.on||TR.on)return;let t=LB.sel;
 if(!t){const q=LB.q.trim().toLowerCase(),ex=LB.list.find(l=>l.name.toLowerCase()==q);t=ex?ex.name:(LB.view.length==1?LB.view[0].name:'')}
 if(!t){menuMsg='Vyber lobby ze seznamu (nebo napiš její přesný název).';ovKey='';return}
 netOpen(()=>netSend({t:'join',room:t,pass:LB.pass,p:ppInfo(),cid:CID}))}
function lobbyLeave(){if(!net.on)return;netSend({t:'leave'});netDown('')}
// ---- seznam lobby (překresluje se bez přestavby menu, aby se nerušilo psaní)
function lbRender(){LB.view=LB.list.filter(l=>!LB.q||l.name.toLowerCase().includes(LB.q.trim().toLowerCase()));const el=$('lblist');if(!el)return lbStatus();
 el.innerHTML=LB.view.length?LB.view.map((l,i)=>`<div class="lbr${l.name==LB.sel?' on':''}" onclick="lbSel(${i})"><span>${l.lock?'🔒 ':''}${esc(l.name)}</span><span>${esc(l.host)} · ${l.n|0}/${l.max|0}${l.st?' · ve hře':''}</span></div>`).join('')
  :'<div class="lbr s">'+(LB.conn=='ok'?(LB.list.length?'Nic nenalezeno.':'Žádné lobby – vytvoř první (CREATE).'):'—')+'</div>';lbStatus()}
function lbSearch(v){LB.q=String(v).slice(0,20);if(LB.sel&&!LB.view.some(l=>l.name==LB.sel))LB.sel='';lbRender()}
function lbSel(i){const l=LB.view[i];LB.sel=l?l.name:'';lbRender()}
function lbRefresh(){netOpen(()=>netSend({t:'list'}))}
function lbStatus(){const e=$('lbst');if(!e)return;e.textContent=LB.conn=='file'?'Online lobby vyžadují server: spusť npm start a otevři http://localhost:3000':LB.conn=='ok'?'Server připojen · lobby: '+LB.list.length:LB.conn=='connecting'?'Připojuji k serveru…':'Server nedostupný – spusť npm start (zkouším znovu).'}
// ---- chat (zprostředkovává server, takže funguje v lobby i ve hře) a vyhazování hráčů (jen hostitel)
const chatClean=(c,now)=>({id:c.id|0,pid:/^[a-f0-9]{12}$/.test(c.pid)?c.pid:'',sys:!!c.sys,name:cleanPN(c.name),color:cl(Math.floor(+c.color)||0,0,7),text:String(c.text==null?'':c.text).slice(0,120),ts:now||0});
const chatLine=c=>c.sys?`<div class="cl sys">${esc(c.text)}</div>`:`<div class="cl"><b style="color:#${hex6(PCOL[c.color|0]||0xffffff)}">${esc(c.name)}</b>: ${esc(c.text)}</div>`;
function chatAdd(m){LB.chat.push(chatClean(m,Date.now()));if(LB.chat.length>50)LB.chat.shift();chatLog();chatOverlay()}
function chatLog(){const lg=$('chlog');if(lg){lg.innerHTML=LB.chat.filter(c=>c.sys||!isMuted(c)).map(chatLine).join('');lg.scrollTop=lg.scrollHeight}}
function chatOverlay(){voteUi();const c=$('chat');if(!c)return;const now=Date.now(),show=net.on&&vs&&vs.ph!='lobby'&&vs.ph!='menu',h=show?LB.chat.filter(x=>(x.sys||!isMuted(x))&&(CHAT.open||now-x.ts<10000)).slice(-6).map(chatLine).join(''):'';if(h!==CHAT.last){CHAT.last=h;c.innerHTML=h}}
function chatSys(text){LB.chat.push(chatClean({sys:1,text},Date.now()));chatLog();chatOverlay()}
function chatSend(inp){if(!inp)return;const t=inp.value.trim();inp.value='';CHAT.draft='';if(!t)return;if(t[0]=='/')chatCmd(t);else netSend({t:'chat',text:t})}
function chatCmd(t){const [c,...r]=t.slice(1).split(/\s+/),a=r.join(' ').toLowerCase();
 if(c=='kick'){if(!net.owner)return chatSys('Vyhazovat může jen hostitel lobby.');if(!a)return chatSys('Použití: /kick jméno');
  const L=LB.members.filter(x=>!x.host),ex=L.filter(x=>x.name.toLowerCase()==a),pf=L.filter(x=>x.name.toLowerCase().startsWith(a)),f=ex.length==1?ex:pf;
  if(f.length!=1)return chatSys(f.length?'Jméno není jednoznačné, napiš ho celé.':'Hráče „'+r.join(' ')+'“ jsem nenašel.');return lobbyKick(f[0].id)}
 const who=(n,self)=>{const L=LB.members.filter(x=>self||x.id!==me),ex=L.filter(x=>x.name.toLowerCase()==n),pf=L.filter(x=>x.name.toLowerCase().startsWith(n)),f=ex.length==1?ex:pf;return f.length==1?f[0]:(chatSys(f.length?'Jméno není jednoznačné, napiš ho celé.':'Hráče „'+n+'“ jsem nenašel.'),null)};
 if(c=='mute'||c=='unmute'){if(!a)return chatSys('Použití: /'+c+' jméno');const p=who(a);if(p)chatMute(p.id,c=='mute');return}
 if(c=='bans')return chatSys(net.owner?'Zákazy: '+(LB.bans.map(b=>b.name).join(', ')||'žádné'):'Zákazy vidí jen hostitel.');
 if(c=='unban'){if(!net.owner)return chatSys('Zákazy může rušit jen hostitel.');const b=LB.bans.filter(x=>x.name.toLowerCase().startsWith(a));return b.length==1?unbanPid(b[0].pid):chatSys(b.length?'Jméno není jednoznačné.':'Takový zákaz nemám.')}
 if(c=='muted')return chatSys('Ztlumení: '+([...new Set([...LB.members.filter(isMuted).map(x=>x.name),...Object.values(MUTE)])].join(', ')||'nikdo'));
 if(c=='report'){if(net.owner)return chatSys('Jsi hostitel – můžeš vyhazovat přímo (/kick jméno).');if(!a)return chatSys('Použití: /report jméno [důvod]');const L=LB.members.filter(x=>x.id!==me&&!x.host).sort((p,q)=>q.name.length-p.name.length),p=L.find(x=>a.startsWith(x.name.toLowerCase()));if(!p)return chatSys('Hráče jsem nenašel; napiš /report jméno důvod.');return reportSend(p.id,r.join(' ').slice(p.name.length).trim())}
 if(c=='votekick'){if(!a)return chatSys('Použití: /votekick jméno');const p=who(a);if(p)voteStart(p.id);return}
 if(c=='yes'||c=='ano')return voteCast(1);if(c=='no'||c=='ne')return voteCast(0);
 chatSys('Příkazy: /mute /unmute /muted jméno (ztlumí chat hráče jen tobě, trvale), /report jméno důvod (nahlásí hostiteli), /bans a /unban jméno (hostitel: trvalé zákazy), /votekick jméno (hlasování o vyhození, od 3 hráčů), /yes /no, /kick jméno (jen hostitel). Enter = psát během hry, Esc = zavřít.')}
function lobbyKick(id){if(net.owner&&net.on)netSend({t:'kick',id:id|0})}
function chatOpen(){CHAT.open=true;for(const k in keys)keys[k]=0;mouse.d=false;const i=$('cin');i.style.display='block';i.value='';i.focus();chatOverlay()}
function chatClose(){CHAT.open=false;const i=$('cin');if(i){i.style.display='none';i.blur()}chatOverlay()}
function chatKey(e){if(e.key=='Enter'){const t=e.target.value.trim();e.target.value='';chatClose();if(t){if(t[0]=='/')chatCmd(t);else netSend({t:'chat',text:t})}}else if(e.key=='Escape')chatClose();e.stopPropagation()}
// ---- ztlumení (jen u tebe) a hlasování o vyhození
function chatMute(id,on){id|=0;if(id==me)return;const p=LB.members.find(x=>x.id==id);if(!p)return;const m=on===undefined?!isMuted(p):on;
 if(p.pid){if(m)MUTE[p.pid]=p.name;else delete MUTE[p.pid];saveMute()}if(m)LB.muted.add(id);else LB.muted.delete(id);
 chatSys((m?'Ztlumil(a) jsi ':'Zrušil(a) jsi ztlumení ')+p.name+(m&&p.pid?' (trvale, i v dalších lobby).':'.'));chatLog();chatOverlay();ovKey=''}
function unmutePid(k){delete MUTE[k];LB.members.forEach(x=>{if(x.pid==k)LB.muted.delete(x.id)});saveMute();chatLog();chatOverlay();ovKey=''}
function voteStart(id){if(net.on&&id!=me)netSend({t:'votekick',id:id|0})}
const voteCan=()=>!!(LB.vote&&net.on&&LB.vote.target!=me);
function voteCast(v){if(voteCan())netSend({t:'ballot',v:v?1:0});else chatSys(LB.vote?'O svém vyhození hlasovat nemůžeš.':'Teď neprobíhá žádné hlasování.')}
function voteHtml(){const v=LB.vote;if(!v)return'';const left=Math.max(0,Math.ceil((v.end-Date.now())/1000));
 return`<div class="vote">Hlasování o vyhození <b>${esc(v.name)}</b> (navrhl(a) ${esc(v.by)}): Ano ${v.yes|0} / Ne ${v.no|0}, potřeba ${v.need|0} · <span id="vleft">${left}</span> s${voteCan()?' <button class="o sm" onclick="voteCast(1)">Ano</button><button class="o sm" onclick="voteCast(0)">Ne</button>':' <span class="s">(o sobě nehlasuješ)</span>'}</div>`}
function voteUi(){const e=$('vote');if(!e)return;const v=LB.vote,show=v&&net.on&&vs&&vs.ph!='lobby'&&vs.ph!='menu';
 if(!show){if(e.style.display!='none')e.style.display='none';}else{const left=Math.max(0,Math.ceil((v.end-Date.now())/1000));e.style.display='block';e.innerHTML=`Hlasování: vyhodit <b>${esc(v.name)}</b>? Ano ${v.yes|0} / Ne ${v.no|0} (potřeba ${v.need|0}) · ${left} s<br><span class="s">${voteCan()?'Y = ano · N = ne (nebo /yes, /no)':'o sobě nehlasuješ'}</span>`}
 const l=$('vleft');if(l&&v)l.textContent=Math.max(0,Math.ceil((v.end-Date.now())/1000))}
// ---- hlášení hráče hostiteli
function reportAsk(id){const t=prompt('Důvod nahlášení (volitelné):','');if(t===null)return;reportSend(id,t)}
function reportSend(id,reason){if(net.on&&!net.owner)netSend({t:'report',id:id|0,reason:String(reason||'').slice(0,80)})}
const reportClean=m=>({rid:m.rid|0,by:cleanPN(m.by),target:cleanPN(m.target),targetPid:/^[a-f0-9]{12}$/.test(m.targetPid)?m.targetPid:'',targetId:m.targetId|0,reason:String(m.reason||'').slice(0,80),ev:(Array.isArray(m.ev)?m.ev:[]).slice(0,5).map(x=>String(x).slice(0,120)),ts:m.ts|0});
function reportAdd(m){if(!net.owner)return;const r=reportClean(m);LB.reports=LB.reports.filter(x=>x.rid!==r.rid);LB.reports.push(r);if(LB.reports.length>50)LB.reports.shift();chatSys('⚠ '+r.by+' nahlásil(a) hráče '+r.target+(r.reason?': '+r.reason:'')+' (/kick '+r.target+')');ovKey=''}
function reportDismiss(i){const r=LB.reports[i];if(r&&r.rid)netSend({t:'repdismiss',rid:r.rid});LB.reports.splice(i,1);ovKey=''}
function reportsH(){if(!LB.reports.length)return'';return`<div class="rep"><b>Hlášení (${LB.reports.length})</b>${LB.reports.map((r,i)=>{const mt=LB.members.find(x=>(x.pid&&x.pid==r.targetPid)||(!r.targetPid&&x.id==r.targetId)),here=!!mt;
 return`<div class="rr"><div>${esc(r.by)} → <b>${esc(r.target)}</b>: ${esc(r.reason||'bez důvodu')}${r.ev.length?`<div class="s">Poslední zprávy: ${r.ev.map(x=>esc(x)).join(' | ')}</div>`:''}</div><span class="btns">${here?`<button class="o sm" onclick="lobbyKick(${mt?mt.id:0});reportDismiss(${i})">Vyhodit</button><button class="o sm" onclick="chatMute(${mt?mt.id:0},true)">Ztlumit</button>`:'<span class="s">(už není v lobby)</span>'}<button class="o sm" onclick="reportDismiss(${i})">✕</button></span></div>`}).join('')}</div>`}
// ---- trvalé zákazy (platí u hostitele i v jeho dalších lobby) a spuštění hry na serveru
function unbanPid(pid){if(net.owner)netSend({t:'unban',pid})}
function bansH(){if(!LB.bans.length)return'';return`<div class="rep"><b>Zákazy (${LB.bans.length}) – platí i v tvých dalších lobby</b>${LB.bans.map(b=>`<div class="rr"><div>${esc(b.name)}</div><span class="btns"><button class="o sm" onclick="unbanPid('${b.pid}')">Odblokovat</button></span></div>`).join('')}</div>`}
function startGame(){if(net.on){if(net.owner)netSend({t:'start',opt:{dif:opt.dif,ai:opt.ai}})}else startRun()}
