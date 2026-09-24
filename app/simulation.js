const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const finite=(v,f)=>Number.isFinite(v)?v:f;
export function waterFloor(x) {
 const points=[[0,.55],[.15,.49],[.3,.43],[.45,.39],[.55,.30],[.65,.17],[.75,.14],[.85,.28],[1,.5]];
 for(let i=1;i<points.length;i++)if(x<=points[i][0]){const [a,b]=points[i-1],[c,d]=points[i];return b+(d-b)*clamp((x-a)/(c-a),0,1);}
 return .5;
}
export function createWorld(){
 const positions=[[.22,.31],[.43,.22],[.27,.46],[.91,.26],[.83,.63],[.90,.68]];
 const fish=positions.map(([x,y],i)=>({id:i,x,y,vx:i%2?.012:-.012,vy:0,heading:i%2?0:Math.PI,phase:i*1.73,kind:i<4?'chromis':'clown',size:i<4?.037+(i%3)*.004:.047+(i%2)*.01}));
 for(const [kind,x,y,size] of [['yellow',.30,.38,.068],['gramma',.61,.70,.044],['butterfly',.53,.52,.063]]){
  const id=fish.length;fish.push({id,kind,x,y,size,vx:.012,vy:0,heading:0,phase:id*1.73});
 }
 for(let n=0;n<12;n++){
  const id=fish.length,a=n*2.39996,r=Math.sqrt((n+.5)/12),ox=Math.cos(a)*r*.068,oy=Math.sin(a)*r*.044;
  fish.push({id,kind:'chromis',school:true,ox,oy,x:.25+ox,y:.25+oy,size:.021+(n%3)*.002,vx:.018,vy:0,heading:0,phase:n*.74});
 }
 return {time:0,food:[],eaten:0,nextFood:0,fish};
}
export function feed(world,x=.30,y=.10){
 x=clamp(finite(x,.3),.08,.92); y=clamp(finite(y,.1),.08,.78);
 // Keep pellets in visible open water so they can actually be reached.
 y=Math.min(y,waterFloor(x)-.05);
 for(let i=0;i<7&&world.food.length<32;i++){const id=world.nextFood++;world.food.push({id,x:clamp(x+Math.sin(id*2.4)*.027,.05,.95),y:y-i*.008,age:0});}
}
export function advance(world,elapsed,pointer=null){
 const dt=clamp(finite(elapsed,0),0,.08);if(!dt)return;world.time+=dt;
 for(const p of world.food){p.age+=dt;p.y=Math.min(p.y+dt*.012,waterFloor(p.x)-.012);p.x+=Math.sin(world.time*.8+p.id)*dt*.0015;}
 world.food=world.food.filter(p=>p.age<26);
 for(const f of world.fish){
  const t=world.time,small=f.kind==='chromis';
  let tx,ty;
  if(f.school){const spread=.88+.15*Math.sin(t*.12);tx=.30+.17*Math.sin(t*.055)+f.ox*spread+Math.sin(t*.31+f.phase)*.006;ty=.265+.06*Math.sin(t*.071)+f.oy*spread+Math.sin(t*.27+f.phase)*.005;ty=Math.min(ty,waterFloor(tx)-.05);}
  else if(small){tx=f.id===3?.85+.085*Math.sin(t*.085+f.phase):.29+.21*Math.sin(t*(.065+f.id*.011)+f.phase);ty=.18+.09*Math.sin(t*.11+f.phase*.8);ty=Math.min(ty,waterFloor(tx)-.06);}
  else if(f.kind==='clown'){tx=.835+.065*Math.sin(t*.10+f.phase);ty=.645+.045*Math.sin(t*.14+f.phase);}
  else if(f.kind==='yellow'){tx=.34+.25*Math.sin(t*.052+f.phase);ty=.43+.11*Math.sin(t*.069+f.phase);}
  else if(f.kind==='butterfly'){tx=.50+.27*Math.sin(t*.046+f.phase);ty=.54+.13*Math.sin(t*.060+f.phase);}
  else{tx=.59+.15*Math.sin(t*.065+f.phase);ty=.71+.035*Math.sin(t*.12+f.phase);}
  let target=null,dist=Infinity;
  for(const p of world.food){const d=Math.hypot((p.x-f.x)*1.77,p.y-f.y);if(d<dist){dist=d;target=p;}}
  if(target){tx=target.x;ty=target.y;if(dist<.017){world.food=world.food.filter(p=>p.id!==target.id);world.eaten++;}}
  let dx=(tx-f.x)*1.77,dy=ty-f.y;
  const length=Math.hypot(dx,dy),speed=target?.10:f.school?.06:small?.045:.036;
  let desiredX=length>.004?dx/length*speed/1.77:0,desiredY=length>.004?dy/length*speed:0;
  if(f.school){
   for(const other of world.fish){if(other===f||!other.school)continue;const sx=(f.x-other.x)*1.77,sy=f.y-other.y,d=Math.hypot(sx,sy);if(d<.035&&d>.0001){desiredX+=sx/d*(.035-d)*.6/1.77;desiredY+=sy/d*(.035-d)*.6;}}
  }
  if(pointer&&Number.isFinite(pointer.x)&&Number.isFinite(pointer.y)){
   const px=(f.x-pointer.x)*1.77,py=f.y-pointer.y,d=Math.hypot(px,py);
   if(d<.15&&d>.0001){desiredX+=px/d*(.15-d)*.6/1.77;desiredY+=py/d*(.15-d)*.6;}
  }
  // Smooth acceleration prevents mechanical stops and instantaneous direction flips.
  const blend=1-Math.exp(-dt*1.4);f.vx+=(desiredX-f.vx)*blend;f.vy+=(desiredY-f.vy)*blend;
  f.x=clamp(f.x+f.vx*dt,.045,.955);f.y=clamp(f.y+f.vy*dt,.09,.84);
  if(small&&!target){const floor=waterFloor(f.x)-.022;if(f.y>floor){f.y=floor;f.vy=Math.min(f.vy,0);}}
  if(Math.hypot(f.vx,f.vy)>.002){const a=Math.atan2(-f.vy,f.vx*1.77);let delta=Math.atan2(Math.sin(a-f.heading),Math.cos(a-f.heading));f.heading+=clamp(delta,-dt*1.1,dt*1.1);}
 }
}
