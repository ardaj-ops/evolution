// js/core/state.js – herní stav (simuluje ho hostitel) a sdílená data
const st={ph:'menu',wave:0,score:0,notes:[],t:0,wT:1.5,pickT:0,mortarT:0,mortarRate:0,surround:false,spawnT:0,spawnQ:[],dir:1,wl:0,bosses:0,str:[],strA:{},actS:[],sidS:0,sp:[],sid:0,tl:{flank:0,pred:0,pack:0,stand:0},shake:0};
const P={},en=[],bl=[],eb=[],hz=[],ev=[],evOut=[],keys={},mouse={x:0,y:0,d:false},COLS=[0xffffff,0x66e0ff,0xffd27a,0xff8bd0];
const newM=()=>({melT:0,t:0,still:0,near:0,far:0,edge:0,shots:0,hits:0});
let eid=0,M=newM(),prof={still:.2,near:.2,far:.2,edge:.15,acc:.5,mel:0},me=1,isHost=true,vs=null;
let TRAIN=false;
const HOOKS={wave:[]};// háčky pro volitelné pluginy
