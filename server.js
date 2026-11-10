// server.js – statický server + LOBBY systém (WebSocket) + SERVEROVÁ SIMULACE her + trvalá moderace
// Server počítá hru (nepřátelé, AI, střely); klienti posílají jen vstupy a vykreslují snímky. Hostitel lobby má jen pravomoci (start, vyhazování, hlášení).
const http=require('http'),fs=require('fs'),path=require('path'),crypto=require('crypto'),{WebSocketServer}=require('ws');
const DATA=process.env.DATA_DIR||path.join(__dirname,'data');fs.mkdirSync(DATA,{recursive:true});
const db=require('./server/db')(DATA),mod=require('./server/mod')(DATA),{createSim}=require('./server/sim');
const MT={'.html':'text/html;charset=utf-8','.css':'text/css','.js':'text/javascript'},rooms=new Map(),failIp=new Map();let nid=0;
let llm=null;try{if(process.env.ANTHROPIC_API_KEY)llm=require('./server/llm')}catch(e){console.log('LLM plugin nelze nacist:',e.message)}
const srv=http.createServer((q,r)=>{if(q.method=='POST'&&q.url=='/api/monster')return llm?llm(q,r):(r.writeHead(501),r.end());
 let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';const f=path.join(__dirname,u);
 if(!f.startsWith(__dirname+path.sep)||/node_modules|server|package|data|\/\./.test(f)){r.writeHead(403);return r.end()}
 fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);return r.end('404')}r.writeHead(200,{'Content-Type':MT[path.extname(f)]||'application/octet-stream'});r.end(d)})});
const clean=(s,n)=>String(s==null?'':s).replace(/[^\p{L}\p{N} .\-_]/gu,'').trim().slice(0,n);
const cleanP=p=>({name:clean(p&&p.name,16)||'Hráč',color:Math.max(0,Math.min(7,Math.floor(+(p&&p.color))||0))});
const send=(w,o)=>w.readyState==1&&w.send(typeof o=='string'?o:JSON.stringify(o)),key=n=>n.toLowerCase();
const pwHash=(pw,salt)=>crypto.scryptSync(pw,salt,32);
// anonymní stálé ID hráče = HMAC(ID prohlížeče, tajná sůl); surové ID prohlížeče se nikomu neposílá
const SALTF=path.join(DATA,'.pid-salt');let SALT=process.env.PID_SALT||'';
if(!SALT){try{SALT=fs.readFileSync(SALTF,'utf8').trim()}catch(e){}if(!SALT){SALT=crypto.randomBytes(16).toString('hex');try{fs.writeFileSync(SALTF,SALT,{mode:0o600})}catch(e){}}}
const pidOf=cid=>cid?crypto.createHmac('sha256',SALT).update(cid).digest('hex').slice(0,12):'',cidOf=m=>/^[a-f0-9]{16}$/.test(m&&m.cid)?m.cid:'';
const members=r=>[...r.all].map(w=>({id:w.id,name:w.p.name,color:w.p.color,host:w===r.host,pid:w.pid}));
const bcast=(r,o)=>{const s=JSON.stringify(o);r.all.forEach(w=>send(w,s))};
const sys=text=>({t:'chat',sys:1,text}),VOTE_MS=+process.env.VOTE_MS||30000;
function sysmsg(r,text){const o=sys(text);r.chat.push(o);if(r.chat.length>50)r.chat.shift();bcast(r,o)}
// ---- trvalá moderace (zákazy a hlášení patří hostiteli podle jeho pid)
const modState=r=>{const o=mod.own(r.host.pid);return{t:'mod',bans:o?Object.entries(o.bans).map(([pid,b])=>({pid,name:b.name})):[],reports:o?o.reports.map(x=>({rid:x.rid,by:x.by,target:x.target,targetPid:x.targetPid,reason:x.reason,ev:x.ev,ts:x.ts})):[]}};
const banned=(r,ws,m)=>{if(r.ban.has(cidOf(m)||'ip:'+ws.ip))return true;const o=mod.own(r.host.pid);return !!(o&&ws.pid&&o.bans[ws.pid])};
// ---- serverová simulace
const simCount=()=>[...rooms.values()].filter(r=>r.sim).length;
function dropPlayer(r,id){if(r.sim)r.sim.remove(id)}
function doKick(r,tw,txt){r.ban.add(tw.cid||'ip:'+tw.ip);const o=mod.own(r.host.pid);if(o&&tw.pid){o.bans[tw.pid]={name:tw.p.name,ts:Date.now()};mod.save()}
 r.all.delete(tw);tw.room=null;dropPlayer(r,tw.id);send(tw,{t:'kicked'});bcast(r,{t:'members',list:members(r)});sysmsg(r,txt);send(r.host,modState(r));
 if(r.vote){if(r.vote.target===tw.id)voteEnd(r,false,null,true);else{r.vote.yes.delete(tw.id);r.vote.no.delete(tw.id);voteCheck(r)}}}
function voteState(r){const v=r.vote,E=[...r.all].filter(w=>w.id!==v.target).length;return{t:'vote',target:v.target,name:v.name,by:v.byName,yes:v.yes.size,no:v.no.size,need:Math.floor(E/2)+1,left:Math.max(0,Math.ceil((v.end-Date.now())/1000))}}
function voteEnd(r,ok,txt,nocool){const v=r.vote;if(!v)return;clearTimeout(v.timer);r.vote=null;if(!ok&&!nocool)r.cool.set(v.ident,Date.now()+60000);bcast(r,{t:'voteend',ok:!!ok});if(txt)sysmsg(r,txt)}
function voteCheck(r){const v=r.vote;if(!v)return;const E=[...r.all].filter(w=>w.id!==v.target).length,need=Math.floor(E/2)+1;
 if(v.yes.size>=need){const tw=[...r.all].find(w=>w.id===v.target);voteEnd(r,true,null);if(tw)doKick(r,tw,tw.p.name+' byl(a) vyhozen(a) hlasováním.')}
 else if(E-v.no.size<need)voteEnd(r,false,'Hlasování o vyhození '+v.name+' neuspělo.');else bcast(r,voteState(r))}
const listRooms=()=>[...rooms.values()].slice(0,100).map(r=>({name:r.name,n:r.all.size,max:4,lock:r.hash?1:0,host:r.host.p.name,st:r.started?1:0})).sort((a,b)=>a.name.localeCompare(b.name));
function enter(ws,r){ws.id=++nid;ws.room=r;ws.clsDone=false;r.all.add(ws)}
function leave(ws){const r=ws.room;if(!r)return;ws.room=null;r.all.delete(ws);
 if(r.host===ws){if(r.vote)clearTimeout(r.vote.timer);if(r.sim)r.sim.stop();r.sim=null;r.all.forEach(c=>{c.room=null;send(c,{t:'end'})});rooms.delete(key(r.name))}
 else{if(r.vote){if(r.vote.target===ws.id)voteEnd(r,false,r.vote.name+' odešel (odešla), hlasování se ruší.',true);else{r.vote.yes.delete(ws.id);r.vote.no.delete(ws.id)}}
  dropPlayer(r,ws.id);bcast(r,{t:'members',list:members(r)});sysmsg(r,ws.p.name+' odešel (odešla).');if(r.vote)voteCheck(r)}}
const wss=new WebSocketServer({server:srv,maxPayload:65536});
wss.on('connection',(ws,req)=>{ws.alive=true;ws.p={name:'Hráč',color:0};ws.t0=0;ws.cnt=0;ws.ip=req.socket.remoteAddress;ws.on('pong',()=>ws.alive=true);
 ws.on('message',d=>{const s=d.toString(),now=Date.now();if(now-ws.t0>1000){ws.t0=now;ws.cnt=0}if(++ws.cnt>400)return ws.close();
  let m;try{m=JSON.parse(s)}catch(e){return}if(!m||typeof m.t!='string')return;
  if(m.t=='list')return send(ws,{t:'lobbies',list:listRooms()});
  if(m.t=='leave'){leave(ws);return send(ws,{t:'left'})}
  if(m.t=='create'){if(ws.room)return send(ws,{t:'err',code:'inroom'});if(rooms.size>=200)return send(ws,{t:'err',code:'busy'});
   ws.p=cleanP(m.p);ws.cid=cidOf(m);ws.pid=pidOf(ws.cid);const name=clean(m.name,20)||clean(ws.p.name+' lobby',20);if(rooms.has(key(name)))return send(ws,{t:'err',code:'exists'});
   const pass=typeof m.pass=='string'?m.pass.slice(0,32):'',salt=crypto.randomBytes(8).toString('hex'),r={name,host:ws,all:new Set(),salt,hash:pass?pwHash(pass,salt):null,started:false,chat:[],ban:new Set(),cool:new Map(),vote:null,sim:null,lastSnap:0};
   rooms.set(key(name),r);enter(ws,r);send(ws,{t:'welcome',id:ws.id,host:true,room:name,lock:r.hash?1:0});bcast(r,{t:'members',list:members(r)});send(ws,modState(r));return}
  if(m.t=='join'){if(ws.room)return send(ws,{t:'err',code:'inroom'});const r=rooms.get(key(clean(m.room,20)));if(!r)return send(ws,{t:'err',code:'nolobby'});
   if(r.all.size>=4)return send(ws,{t:'err',code:'full'});ws.cid=cidOf(m);ws.pid=pidOf(ws.cid);if(banned(r,ws,m))return send(ws,{t:'err',code:'banned'});
   if(r.hash){const fl=failIp.get(ws.ip)||{n:0,t:now};if(now-fl.t>60000){fl.n=0;fl.t=now}if(fl.n>=10)return send(ws,{t:'err',code:'rate'});
    const pw=typeof m.pass=='string'?m.pass.slice(0,32):'';let ok=false;try{ok=crypto.timingSafeEqual(pwHash(pw,r.salt),r.hash)}catch(e){}
    if(!ok){fl.n++;failIp.set(ws.ip,fl);ws.fails=(ws.fails||0)+1;send(ws,{t:'err',code:'pass'});if(ws.fails>=5)ws.close();return}}
   ws.p=cleanP(m.p);enter(ws,r);send(ws,{t:'welcome',id:ws.id,host:false,room:r.name,lock:r.hash?1:0});if(r.sim)r.sim.add(ws.id,ws.p);
   bcast(r,{t:'members',list:members(r)});send(ws,{t:'chathist',list:r.chat});sysmsg(r,ws.p.name+' se připojil(a).');return}
  const r=ws.room;if(!r)return;
  if(m.t=='chat'){if(now-(ws.lastChat||0)<600)return send(ws,sys('Píšeš příliš rychle.'));ws.lastChat=now;
   const text=String(m.text==null?'':m.text).replace(/[\u0000-\u001f\u007f]/g,'').trim().slice(0,120);if(!text)return;
   const o={t:'chat',id:ws.id,pid:ws.pid,name:ws.p.name,color:ws.p.color,text};r.chat.push(o);if(r.chat.length>50)r.chat.shift();bcast(r,o);return}
  if(m.t=='kick'){if(r.host!==ws)return;const id=Math.floor(+m.id),tw=[...r.all].find(w=>w.id===id);if(!tw||tw===ws)return;doKick(r,tw,tw.p.name+' byl(a) vyhozen(a).');return}
  if(m.t=='unban'){if(r.host!==ws)return;const o=mod.own(ws.pid);if(o&&o.bans[String(m.pid)]){delete o.bans[String(m.pid)];mod.save();sysmsg(r,'Zákaz byl zrušen.');send(ws,modState(r))}return}
  if(m.t=='repdismiss'){if(r.host!==ws)return;const o=mod.own(ws.pid);if(o){o.reports=o.reports.filter(x=>x.rid!==(m.rid|0));mod.save();send(ws,modState(r))}return}
  if(m.t=='votekick'){if(r.all.size<3)return send(ws,sys('K hlasování jsou potřeba aspoň 3 hráči (hostitel může vyhazovat přímo).'));if(r.vote)return send(ws,sys('Hlasování už probíhá.'));
   const id=Math.floor(+m.id),tw=[...r.all].find(w=>w.id===id);if(!tw||tw===ws||tw===r.host)return send(ws,sys('Tohoto hráče nelze vyhodit hlasováním.'));
   const idn=tw.cid||'ip:'+tw.ip;if((r.cool.get(idn)||0)>now)return send(ws,sys('O tomto hráči se nedávno hlasovalo, chvíli počkej.'));
   r.vote={target:tw.id,name:tw.p.name,byName:ws.p.name,ident:idn,yes:new Set([ws.id]),no:new Set(),end:now+VOTE_MS,timer:setTimeout(()=>voteEnd(r,false,'Hlasování o vyhození '+tw.p.name+' vypršelo.'),VOTE_MS)};
   sysmsg(r,ws.p.name+' navrhuje vyhodit hráče '+tw.p.name+'. Hlasuj /yes nebo /no (klávesy Y / N), čas '+Math.round(VOTE_MS/1000)+' s.');voteCheck(r);return}
  if(m.t=='ballot'){if(!r.vote||ws.id===r.vote.target)return;const v=r.vote;v.yes.delete(ws.id);v.no.delete(ws.id);(m.v?v.yes:v.no).add(ws.id);voteCheck(r);return}
  if(m.t=='report'){if(r.host===ws)return send(ws,sys('Jsi hostitel – můžeš vyhazovat přímo (/kick jméno).'));
   const id=Math.floor(+m.id),tw=[...r.all].find(w=>w.id===id);if(!tw||tw===ws)return send(ws,sys('Tohoto hráče nelze nahlásit.'));
   ws.rep=ws.rep||{};ws.repN=(ws.repN||[]).filter(t=>now-t<60000);if(now-(ws.rep[tw.id]||0)<60000)return send(ws,sys('Tohoto hráče jsi nedávno nahlásil(a).'));if(ws.repN.length>=5)return send(ws,sys('Příliš mnoho hlášení, chvíli počkej.'));
   ws.rep[tw.id]=now;ws.repN.push(now);const reason=String(m.reason==null?'':m.reason).replace(/[\u0000-\u001f\u007f]/g,'').trim().slice(0,80),ev=r.chat.filter(c=>c.id===tw.id&&!c.sys).slice(-5).map(c=>c.text);
   const rec={rid:mod.nextRid(),by:ws.p.name,byPid:ws.pid,target:tw.p.name,targetPid:tw.pid,reason,ev,ts:now},o=mod.own(r.host.pid);if(o){o.reports.push(rec);mod.save()}
   send(r.host,Object.assign({t:'report',targetId:tw.id},rec));send(ws,sys('Hlášení odesláno hostiteli lobby.'));return}
  // ---- herní zprávy: server je předává simulaci
  if(m.t=='cls'){if(ws.clsDone)return;ws.clsDone=true;ws.cls={c:m.c,m:m.m,w:m.w};if(r.sim)r.sim.cls(ws.id,m.c,m.m,m.w);return}
  if(m.t=='start'){if(r.host!==ws)return;if(!r.sim){if(simCount()>=20)return send(ws,{t:'err',code:'busy'});r.sim=createSim(db);for(const w of r.all){r.sim.add(w.id,w.p);if(w.cls)r.sim.cls(w.id,w.cls.c,w.cls.m,w.cls.w)}}
   r.sim.start(m.opt);r.started=true;r.lastSnap=0;return}
  if(m.t=='in'){if(r.sim)r.sim.input(ws.id,m.i);return}
  if(m.t=='pick'){if(r.sim)r.sim.pick(ws.id,m.i);return}});
 ws.on('close',()=>leave(ws))});
// ---- hlavní smyčka serverové simulace: ~60 Hz výpočet, ~20 Hz snímky (v závěru hry jen 2 Hz)
let lastT=Date.now();
const loop=setInterval(()=>{const now=Date.now(),dt=Math.min(.05,(now-lastT)/1000);lastT=now;
 for(const r of rooms.values()){if(!r.sim||!r.sim.live)continue;
  try{r.sim.tick(dt);const over=r.sim.phase()=='over';if(now-r.lastSnap>=(over?500:50)){r.lastSnap=now;const s=r.sim.snap();r.all.forEach(w=>send(w,s))}}
  catch(e){console.log('Chyba simulace lobby',r.name,e.message);r.sim=null;sysmsg(r,'Chyba simulace – hra byla ukončena, hostitel může spustit novou.')}}},1000/60);
setInterval(()=>wss.clients.forEach(w=>{if(!w.alive)return w.terminate();w.alive=false;w.ping()}),30000).unref();
setInterval(()=>{const n=Date.now();failIp.forEach((v,k)=>{if(n-v.t>60000)failIp.delete(k)})},60000).unref();
const flushAll=()=>{mod.flush();db.flush()};process.on('SIGINT',()=>{flushAll();process.exit(0)});process.on('SIGTERM',()=>{flushAll();process.exit(0)});
if(require.main===module)srv.listen(process.env.PORT||3000,()=>console.log('Evoluce běží na http://localhost:'+(process.env.PORT||3000)));
module.exports={srv,wss,rooms,mod,db,close:()=>{clearInterval(loop);flushAll();wss.clients.forEach(w=>w.terminate());srv.close()}};
