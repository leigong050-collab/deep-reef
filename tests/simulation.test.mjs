import test from 'node:test';
import assert from 'node:assert/strict';
const sim = await import('../app/simulation.js').catch(() => ({}));
const settings = await import('../app/settings.js').catch(() => ({}));
test('simulation exposes independent world advancement',()=>assert.equal(typeof sim.createWorld,'function'));
test('zero elapsed time leaves the world unchanged',()=>{
 const w=sim.createWorld(); const before=structuredClone(w); sim.advance(w,0); assert.deepEqual(w,before);
});
test('fish move but stay inside their aquarium over ten minutes',()=>{
 const w=sim.createWorld(); const before=w.fish.map(f=>[f.x,f.y]);
 for(let i=0;i<18000;i++)sim.advance(w,1/30);
 assert.ok(w.fish.some((f,i)=>Math.abs(f.x-before[i][0])>.02));
 for(const f of w.fish){assert.ok(Number.isFinite(f.x)&&f.x>=.04&&f.x<=.96);assert.ok(f.y>=.09&&f.y<=.86);}
});
test('repeated feeding is bounded and uneaten food expires',()=>{
 const w=sim.createWorld(); for(let i=0;i<200;i++)sim.feed(w,.3,.1);
 assert.ok(w.food.length>0&&w.food.length<=32);
 for(let i=0;i<1500;i++)sim.advance(w,1/30);
 assert.equal(w.food.length,0);
});
test('non-finite input cannot poison positions',()=>{
 const w=sim.createWorld();sim.feed(w,NaN,Infinity);sim.advance(w,NaN,{x:Infinity,y:NaN});
 for(const f of w.fish)assert.ok(Number.isFinite(f.x)&&Number.isFinite(f.y));
});
test('pointer nearby changes the swimming path',()=>{
 const a=sim.createWorld(),b=sim.createWorld();const f=b.fish[0];
 const pointer={x:f.x+.018,y:f.y};
 for(let i=0;i<30;i++){sim.advance(a,1/30);sim.advance(b,1/30,pointer);}
 assert.ok(Math.abs(a.fish[0].x-b.fish[0].x)>.001);
});
test('settings reject unsupported values and bound brightness',()=>{
 assert.deepEqual(settings.normalizeSettings({quality:'ultra',light:'pink',brightness:99,paused:'false'}),{quality:'balanced',light:'blue',brightness:1.2,paused:false});
 assert.equal(settings.normalizeSettings(null).light,'blue');
});
test('hidden, paused and host-stopped views do not animate',()=>{
 assert.equal(settings.shouldAnimate({paused:false,hidden:false,hostRate:30}),true);
 for(const change of [{paused:true},{hidden:true},{hostRate:0}])assert.equal(settings.shouldAnimate({paused:false,hidden:false,hostRate:30,...change}),false);
});
test('small fish remain a recognizable moving school rather than dispersing across the tank',()=>{
 const w=sim.createWorld(),school=w.fish.filter(f=>f.school);
 assert.ok(school.length>=10,'a visible school is present');
 const start=school.reduce((sum,f)=>sum+f.x,0)/school.length;
 for(let i=0;i<1800;i++)sim.advance(w,1/30);
 const xs=school.map(f=>f.x),ys=school.map(f=>f.y);
 assert.ok(Math.max(...xs)-Math.min(...xs)<.3,'school keeps cohesion');
 assert.ok(Math.max(...ys)-Math.min(...ys)<.22,'school does not scatter vertically');
 assert.ok(Math.abs(xs.reduce((a,b)=>a+b,0)/xs.length-start)>.025,'the school travels');
});
test('multiple species share a bounded feeding scene and remove consumed food',()=>{
 const w=sim.createWorld();assert.ok(new Set(w.fish.map(f=>f.kind)).size>=5);
 sim.feed(w,.3,.2);for(let i=0;i<450;i++)sim.advance(w,1/30);
 assert.ok(w.eaten>0,'fish actually consume pellets');
 for(const f of w.fish)assert.ok(f.x>=.04&&f.x<=.96&&f.y>=.09&&f.y<=.86);
});
