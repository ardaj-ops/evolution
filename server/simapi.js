// server/simapi.js – rozhraní k simulaci hry na serveru (běží uvnitř vm kontextu se stejným kódem hry jako klient)
me=-1;
const SIM={
 colFree(c){const u=Object.values(P).map(q=>q.col);for(let k=0;k<8&&u.includes(c);k++)c=(c+1)%8;return c},
 add(id,info){const p=addPlayer(id);p.name=String(info&&info.name||'Hráč').replace(/[^\p{L}\p{N} .\-_]/gu,'').trim().slice(0,16)||'Hráč';p.col=SIM.colFree(cl(Math.floor(+(info&&info.color))||0,0,7));return p},
 remove(id){delete P[id]},
 cls(id,c,m){const o=P[id];if(!o)return;P[id]=newPlayer(id,cl(Math.floor(+c)||0,0,CLS.length-1),sanM(m));P[id].name=o.name;P[id].col=o.col},
 input(id,i){const p=P[id];if(!p||!i||typeof i!='object')return;const n=p.inp;n.dx=cl(+i.dx||0,-1,1);n.dz=cl(+i.dz||0,-1,1);n.ax=cl(+i.ax||0,-300,300);n.az=cl(+i.az||0,-300,300);n.f=i.f?1:0;n.ds=i.ds?1:0;n.sw=cl(Math.floor(+i.sw)||0,0,6)},
 pick(id,k){pickUp(id,cl(Math.floor(+k)||0,0,4))},
 start(o){opt.dif=cl(Math.floor(+(o&&o.dif))||0,0,2);opt.ai=cl(o&&o.ai!=null?Math.floor(+o.ai)||0:1,0,2);startRun()},
 tick(dt){if(st.ph=='play'||st.ph=='pick'){st.t+=dt;upd(dt);flushEv()}},
 snap(){const s=makeSnap();s.ev=evOut.splice(0);return JSON.stringify({t:'snap',s})},
 phase(){return st.ph},ids(){return Object.keys(P).map(Number)}};
