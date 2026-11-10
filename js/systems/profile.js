// js/systems/profile.js – PROFIL STYLU: měří, jak hráči hrají, a určuje pravidla adaptace
const RT=['Stojíte na místě → minomety vás zaměří','Držíte odstup → běžci, střelci a fázovači','Bojujete zblízka → tanci a bomboví kamikadze','Tisknete se k okraji → obklíčení','Střílíte nepřesně → roje drobných','Mířite přesně → úhybní nepřátelé a léčitelé','Bojujete chladnou zbraní → ostnatí nepřátelé, střelci mimo dosah, útok a ústup'];
function learn(){if(M.t>1){const n={still:M.still/M.t,near:M.near/M.t,far:M.far/M.t,edge:M.edge/M.t,acc:M.shots>8?Math.min(1,M.hits/M.shots):prof.acc,mel:M.melT/M.t};for(const k in n)prof[k]=prof[k]*.4+n[k]*.6}M=newM()}
const TT=[['flank','Obchvat – útočí z boků'],['pred','Předvídání – míří před vás'],['pack','Hejna – útočí ve skupinách'],['stand','Útok a ústup – po zásahu se stáhnou z dosahu čepele']];
const flags=p=>[p.still>.3,p.far>.35,p.near>.3,p.edge>.3,p.acc<.4,p.acc>.6,p.mel>.5];
function nearEnemy(p){let d=1e9;for(const e of en)d=Math.min(d,hyp(e.x-p.x,e.z-p.z));return d}
function trackStyle(dt,p,km){M.t+=dt;if(WP[p.wp].mel)M.melT+=dt;if(km<.15)M.still+=dt;if(Math.abs(p.x)>ar-5||Math.abs(p.z)>ar-5)M.edge+=dt;
 if(en.length){const nd=nearEnemy(p);if(nd<8)M.near+=dt;else if(nd>20)M.far+=dt}}
