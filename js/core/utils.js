// js/core/utils.js – zkratky a pomocné funkce
const G=THREE,$=id=>document.getElementById(id),R=Math.random,hyp=Math.hypot,cl=(v,a,b)=>Math.max(a,Math.min(b,v)),ar=30;
const esc=s=>String(s).replace(/[<>&"']/g,'');
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
function sweep(a,ok){for(let i=a.length-1;i>=0;i--)if(!ok(a[i]))a.splice(i,1)}
