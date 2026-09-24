import test from 'node:test';import assert from 'node:assert/strict';
const module=await import('../app/control-state.js').catch(()=>({}));
test('native pause changes only when the host acknowledges; menu resume clears it',()=>{
 assert.equal(typeof module.createControls,'function');
 const settings={paused:false,light:'blue'};let delivered;let saved=0;
 const controls=module.createControls({settings,sendNative:m=>{delivered=m;},changed:()=>{},persist:()=>saved++});
 controls.pause(true);assert.equal(settings.paused,false);assert.equal(delivered.type,'pause');
 controls.receivePause(true);assert.equal(settings.paused,true);
 controls.receivePause(false);assert.equal(settings.paused,false);assert.equal(saved,0);
});
test('browser pause is applied and persisted immediately',()=>{
 const settings={paused:false};let saved;
 const controls=module.createControls({settings,changed:()=>{},persist:()=>{saved=settings.paused;}});
 controls.pause(true);assert.equal(settings.paused,true);assert.equal(saved,true);
 controls.pause(false);assert.equal(settings.paused,false);assert.equal(saved,false);
});
test('native lighting uses host acknowledgement and ignores unknown values',()=>{
 const settings={light:'blue'};let messages=0;
 const controls=module.createControls({settings,sendNative:()=>messages++,changed:()=>{},persist:()=>{}});
 controls.light('moon');assert.equal(settings.light,'blue');controls.receiveLight('moon');assert.equal(settings.light,'moon');controls.light('bad');assert.equal(messages,1);
});
