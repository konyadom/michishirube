import {normalizePet,carePet} from './life-core.js';
const HOUR=3600000;
export function mousePet(value,now=Date.now()){
 const p=normalizePet(value,now);p.name='ねずみくん';p.species='mouse';
 const t=value?.travel;
 p.travel={state:['home','away','missing'].includes(t?.state)?t.state:'home',departed:Number.isFinite(t?.departed)?t.departed:0,returnAt:Number.isFinite(t?.returnAt)?t.returnAt:null,nextAt:Number.isFinite(t?.nextAt)?t.nextAt:now+12*HOUR,lastSearch:Number.isFinite(t?.lastSearch)?t.lastSearch:0,trips:Number.isSafeInteger(t?.trips)&&t.trips>=0?t.trips:0};
 return p;
}
export function sendMouse(value,now=Date.now(),random=Math.random){
 const p=mousePet(value,now);if(p.travel.state!=='home')return p;
 const chance=random();p.travel={...p.travel,state:chance<.12?'missing':'away',departed:now,returnAt:chance<.12?null:now+(chance<.35?24+random()*24:.5+random()*3.5)*HOUR,trips:p.travel.trips+1};return p;
}
export function advanceMouse(value,now=Date.now(),random=Math.random){
 let p=mousePet(value,now),event='';
 if(p.travel.state==='away'&&p.travel.returnAt<=now){p.travel={...p.travel,state:'home',returnAt:null,nextAt:now+(8+random()*16)*HOUR};p.joy=Math.min(100,p.joy+10);p.updated=now;event='return';}
 else if(p.travel.state==='home'&&p.travel.nextAt<=now){p=sendMouse(p,now,random);event='leave';}
 return {pet:p,event};
}
export function findMouse(value,now=Date.now(),random=Math.random){
 const p=mousePet(value,now);if(p.travel.state==='home')return {pet:p,result:'home'};
 if(p.travel.lastSearch&&now-p.travel.lastSearch<30*60000)return {pet:p,result:'cooldown'};
 p.travel.lastSearch=now;if(random()<.6){p.travel={...p.travel,state:'home',returnAt:null,nextAt:now+12*HOUR};return {pet:p,result:'found'};}
 return {pet:p,result:'absent'};
}
export function careMouse(value,kind,candidates,now=Date.now()){
 const p=mousePet(value,now);if(p.travel.state!=='home'||!['feed','water','brush'].includes(kind))return {pet:p,credited:false,unlocked:null};
 const r=carePet(p,kind,candidates,now);return {...r,pet:{...mousePet(r.pet,now),travel:p.travel}};
}
export function validMouse(p){const t=p?.travel;return !t||(typeof t==='object'&&['home','away','missing'].includes(t.state)&&['departed','nextAt','lastSearch','trips'].every(k=>Number.isFinite(t[k])&&t[k]>=0)&&(t.returnAt===null||Number.isFinite(t.returnAt)&&t.returnAt>=0));}
