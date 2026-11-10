// js/core/pprofile.js – hráčské profily (jméno, barva, postava, zbraň); používají se v lobby i ve hře
const PCOL=[0xffffff,0x66e0ff,0xffd27a,0xff8bd0,0x7cff9c,0xff7a2d,0xc86bff,0xff5c7a],PCN=['Bílá','Azurová','Zlatá','Růžová','Zelená','Oranžová','Fialová','Červená'];
const cleanPN=n=>String(n==null?'':n).replace(/[^\p{L}\p{N} .\-_]/gu,'').trim().slice(0,16)||'Hráč';
const cleanPP=p=>({name:cleanPN(p&&p.name),color:cl(Math.floor(+(p&&p.color))||0,0,7),cls:cl(Math.floor(+(p&&p.cls))||0,0,9),wp:cl(Math.floor(+(p&&p.wp))||0,0,9)});
const PPJ=(()=>{try{return JSON.parse(store.get('evo_pp')||'{}')||{}}catch(e){return{}}})();
const PP=(Array.isArray(PPJ.list)&&PPJ.list.length?PPJ.list.slice(0,6):[{name:'Hráč',color:0,cls:opt.cls,wp:opt.wp}]).map(cleanPP),PPS={act:cl(PPJ.act|0,0,PP.length-1)};
const savePP=()=>store.set('evo_pp',JSON.stringify({act:PPS.act,list:PP})),hex6=c=>(c>>>0).toString(16).padStart(6,'0');
function ppApply(){const p=PP[PPS.act];opt.cls=p.cls;opt.wp=p.wp;saveOpt()}
function ppSync(){const p=PP[PPS.act];p.cls=opt.cls;p.wp=opt.wp;savePP()}
ppApply();
const ppInfo=()=>({name:PP[PPS.act].name,color:PP[PPS.act].color});
function ppSelf(p){const i=ppInfo();p.name=i.name;p.col=i.color}
function ppOther(p,info){if(!p)return;const i=cleanPP(info);p.name=i.name;const used=Object.values(P).filter(q=>q!==p).map(q=>q.col);let c=i.color;for(let k=0;k<8&&used.includes(c);k++)c=(c+1)%8;p.col=c}
function ppSwitch(i){ppSync();PPS.act=i;ppApply();savePP();ovKey=''}
function ppNew(){if(PP.length>=6)return;const p=cleanPP(PP[PPS.act]);p.name='Hráč '+(PP.length+1);PP.push(p);ppSwitch(PP.length-1)}
function ppRename(){const n=prompt('Jméno hráče:',PP[PPS.act].name);if(n===null)return;PP[PPS.act].name=cleanPN(n);savePP();ovKey=''}
function ppColor(){const p=PP[PPS.act];p.color=(p.color+1)%8;savePP();ovKey=''}
function ppDel(){if(PP.length<2)return;PP.splice(PPS.act,1);PPS.act=Math.min(PPS.act,PP.length-1);ppApply();savePP();ovKey=''}
