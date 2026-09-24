export const PROFILES = Object.freeze({eco:{fps:20,pixels:1000000,dpr:1},balanced:{fps:30,pixels:2200000,dpr:1.5},detail:{fps:60,pixels:4500000,dpr:2}});
export function normalizeSettings(value) {
 const s=value&&typeof value==='object'?value:{};
 return {quality:Object.hasOwn(PROFILES,s.quality)?s.quality:'balanced',light:['blue','moon','day'].includes(s.light)?s.light:'blue',brightness:Number.isFinite(s.brightness)?Math.max(.5,Math.min(1.2,s.brightness)):1,paused:s.paused===true};
}
export function shouldAnimate({paused,hidden,hostRate}) {return !paused&&!hidden&&Number.isFinite(hostRate)&&hostRate>0;}
export function readSettings(storage,reduceMotion=false) {
 try {const raw=storage.getItem('deep-reef.settings');if(raw)return normalizeSettings(JSON.parse(raw));}catch{}
 return normalizeSettings({paused:reduceMotion});
}
export function saveSettings(storage,value) {try{storage.setItem('deep-reef.settings',JSON.stringify(normalizeSettings(value)));}catch{}}
