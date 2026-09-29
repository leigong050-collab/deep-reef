import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,advance,feed} from '../app/simulation.js';
const motion=await import('../app/fish-pose.js').catch(()=>({}));
const timing=await import('../app/frame-clock.js').catch(()=>({}));
test('tail beats stay continuous after several minutes and during feeding acceleration',()=>{
 const w=createWorld();for(let i=0;i<120*60;i++)advance(w,1/60);
 for(let i=0;i<180;i++){
  if(i%60===0)feed(w,.31,.2);
  const previous=w.fish.map(f=>f.tailPhase);
  advance(w,1/60,{x:.31+.08*Math.sin(i*.03),y:.3});
  w.fish.forEach((f,n)=>{const change=f.tailPhase-previous[n];assert.ok(change>0&&change<.4,`tail phase must advance smoothly, got ${change}`);});
 }
});
test('a turning fish has continuous projected shape through a half turn',()=>{
 assert.equal(typeof motion.fishPose,'function');
 let prev;
 for(let i=0;i<=600;i++){
  const pose=motion.fishPose({heading:Math.PI*i/600,kind:'yellow',size:.068,vx:0,vy:0,tailPhase:0});
  assert.ok(pose.scaleX>0,'scale must not flip sign');
  const noseX=Math.cos(pose.yaw)*pose.scaleX;
  if(prev!==undefined)assert.ok(Math.abs(noseX-prev)<.02,'nose must not teleport when reversing direction');
  prev=noseX;
 }
});
test('a fish changes speed without swimming backward during turns',()=>{
 const w=createWorld();let backwards=0;
 for(let i=0;i<3600;i++){advance(w,1/60);for(const f of w.fish){const speed=Math.hypot(f.vx*1.77,f.vy);if(speed>.006&&f.vx*1.77*Math.cos(f.heading)-f.vy*Math.sin(f.heading)<-.001)backwards++;}}
 assert.equal(backwards,0);
});
test('frame pacing preserves the requested cadence under uneven animation callbacks',()=>{
 assert.equal(typeof timing.createFrameClock,'function');
 const clock=timing.createFrameClock();let t=0,count=0,total=0;clock.sample(0,30);
 for(let i=0;i<1200;i++){t+=[15,18,17,16,19,15][i%6];const dt=clock.sample(t,30);if(dt>0){count++;total+=dt;}}
 const expected=t/1000*30;assert.ok(Math.abs(count-expected)<2,`${count} vs ${expected}`);assert.ok(Math.abs(total-t/1000)<.06);
 clock.reset();assert.equal(clock.sample(t+60000,30),0,'resume never advances the paused interval');
});
