// js/ai/brain.js – MOZEK příšery: seznam pravidel [podmínka, akce]. AI je mutuje, kříží a přepisuje; interpret je omezený (žádný eval)
const BCOND=['always','near','mid','far','still','moving','aimed','lowhp','crowd'],BACT=['charge','approach','retreat','strafe','flank','hold','orbit','evade'];
const BT={always:'vždy',near:'hráč je blízko',mid:'střední vzdálenost',far:'hráč je daleko',still:'hráč stojí',moving:'hráč se hýbe',aimed:'hráč na mě míří',lowhp:'mám málo životů',crowd:'jsem v davu',charge:'rozběhni se',approach:'přibližuj se',retreat:'ustup',strafe:'kruž bokem',flank:'obejdi',hold:'stůj',orbit:'obíhej',evade:'uhni'};
const rRule=()=>[rpick(BCOND),rpick(BACT)];
function randBrain(){const n=2+(R()*3|0),b=[];for(let i=0;i<n;i++)b.push(rRule());return b}
function mutBrain(b){b=b.map(r=>r.slice());const o=R();
 if(o<.3&&b.length)b[R()*b.length|0]=rRule();else if(o<.5&&b.length<5)b.splice(R()*(b.length+1)|0,0,rRule());
 else if(o<.65&&b.length>1)b.splice(R()*b.length|0,1);else if(o<.8&&b.length>1){const i=R()*b.length|0,j=R()*b.length|0;const t=b[i];b[i]=b[j];b[j]=t}return b}
function crossBrain(a,b){return a.slice(0,Math.min(a.length,R()*(a.length+1)|0)).concat(b.slice(R()*(b.length+1)|0)).slice(0,5).map(x=>x.slice())}
const hasR=(g,c,a)=>g.brain&&g.brain.some(r=>r[0]==c&&a.includes(r[1]));
function bScore(g){const p=prof;return p.still*(hasR(g,'still',['charge','flank'])?.8:0)+p.far*(hasR(g,'far',['charge','flank'])?.8:0)+p.near*(hasR(g,'near',['evade','strafe','orbit'])?.8:0)+p.acc*(hasR(g,'aimed',['evade','strafe'])?1:0)+p.edge*(hasR(g,'crowd',['flank','charge'])?.5:0)+p.mel*(hasR(g,'near',['retreat','evade'])?.8:0)}
// první pravidlo, jehož podmínka platí, vyhrává; hold/retreat nesmí trvat déle než 3 s (aby příšera nezablokovala vlnu)
function think(e,p,d,rx,rz,s,dt){const br=e.g.brain,sp=hyp(p.vx||0,p.vz||0),aimed=-(Math.sin(p.ry)*rx+Math.cos(p.ry)*rz)>.92;let crowd=false;
 if(br.some(r=>r[0]=='crowd')){let n=0;for(const o of en)if(o!==e&&hyp(o.x-e.x,o.z-e.z)<6)n++;crowd=n>=3}
 const C={always:1,near:d<6,mid:d>=6&&d<14,far:d>=14,still:sp<1,moving:sp>=1,aimed,lowhp:e.hp<e.mhp*.4,crowd};
 let act='approach';for(const r of br)if(C[r[0]]){act=r[1];break}
 if(e.force>0){e.force-=dt;act='approach'}else if(act=='hold'||act=='retreat'){e.hs=(e.hs||0)+dt;if(e.hs>3){e.force=2;e.hs=0}}else e.hs=0;
 const A={charge:[rx,rz,1.5],approach:[rx,rz,1],retreat:[-rx,-rz,1],strafe:[-rz*s+rx*.2,rx*s+rz*.2,1],flank:[rx-rz*s*.9,rz+rx*s*.9,1.1],hold:[0,0,0],orbit:[-rz*s+rx*(d>9?1:-.3),rx*s+rz*(d>9?1:-.3),1],evade:[-rz*s,rx*s,1.7]};
 return A[act]}
