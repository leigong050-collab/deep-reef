// Keep the fractional frame remainder instead of losing it on every callback.
export function createFrameClock(){
 let previous=null,rendered=null,budget=0;
 return {reset(){previous=rendered=null;budget=0;},sample(now,fps){
  if(!Number.isFinite(now)||!Number.isFinite(fps)||fps<=0)return 0;
  if(previous===null){previous=rendered=now;return 0;}
  const elapsed=Math.max(0,Math.min(now-previous,80));previous=now;budget+=elapsed;
  const step=1000/fps;if(budget+.01<step)return 0;
  budget=Math.max(0,budget-step*Math.floor((budget+.01)/step));const dt=Math.min((now-rendered)/1000,.08);rendered=now;return Math.max(0,dt);
 }};
}
