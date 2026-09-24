import {createWorld,advance,feed} from './simulation.js';
import {PROFILES,readSettings,saveSettings,shouldAnimate} from './settings.js';
import {createRenderer} from './renderer.js';
import {createControls} from './control-state.js';
const $=s=>document.querySelector(s),canvas=$('#scene'),world=createWorld();
const native=location.protocol==='deep-reef:';
const wallpaper=native&&!new URLSearchParams(location.search).has('preview');
if(wallpaper)document.body.classList.add('wallpaper');
let storage;try{storage=localStorage;}catch{storage=null;}
const prefs=readSettings(storage,matchMedia('(prefers-reduced-motion: reduce)').matches);
// The native host owns pause persistence and power policy.
if(native)prefs.paused=false;
let scene,frame=0,last=0,hostRate=native?0:60,onBattery=false,pointer=null,toastTimer;
const controls=createControls({settings:prefs,sendNative:native?m=>window.webkit.messageHandlers.reefControl.postMessage(m):null,changed:schedule,persist});
function running(){return shouldAnimate({paused:prefs.paused,hidden:document.hidden&&!wallpaper,hostRate});}
function persist(){saveSettings(storage,prefs);}
function message(text){$('#toast').textContent=text;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),2400);}
function refresh(){
 const active=running();$('#pause').setAttribute('aria-label',prefs.paused?'继续':'暂停');$('#pause').setAttribute('aria-pressed',String(prefs.paused));$('#pause-glyph').setAttribute('d',prefs.paused?'M8 5l11 7-11 7z':'M8 5v14M16 5v14');$('#feed').disabled=!active;
 $('#light').value=prefs.light;$('#quality').value=prefs.quality;$('#status').textContent=prefs.paused?'已暂停':hostRate===0?'休息中':`${Math.min(PROFILES[prefs.quality].fps,hostRate,onBattery?30:60)} 帧 / 秒 · 本地运行`;
}
function schedule(){cancelAnimationFrame(frame);frame=0;last=0;refresh();scene?.render();if(scene&&running())frame=requestAnimationFrame(tick);}
function tick(now){
 if(!running()){frame=0;last=0;return;}frame=requestAnimationFrame(tick);
 const fps=Math.min(PROFILES[prefs.quality].fps,hostRate,onBattery?30:60),step=1000/fps;
 if(!last){last=now;return;}if(now-last<step-.5)return;
 advance(world,Math.min((now-last)/1000,.08),pointer);last=now;scene.render();
}
function pause(value){controls.pause(value);}
function doFeed(x=.3,y=.1){if(!scene||!running())return;feed(world,x,y);message('已投喂 · 鱼群正在靠近');}
window.habitatRate=fps=>{if(Number.isFinite(fps)){hostRate=Math.max(0,Math.min(60,fps));schedule();}};
window.habitatPower=value=>{onBattery=Boolean(value);schedule();};
window.habitatFeed=()=>doFeed();
window.habitatPointer=(x,y)=>{if(scene)pointer=scene.point(x,y);};
window.habitatPointerOut=()=>{pointer=null;};
window.habitatLight=value=>controls.receiveLight(value);
window.habitatPaused=value=>controls.receivePause(value);
window.deepReef=Object.freeze({status:()=>({ready:!!scene,time:world.time,fish:world.fish.length,food:world.food.length,eaten:world.eaten,paused:prefs.paused,hostRate,light:prefs.light,quality:prefs.quality}),feed:()=>doFeed(),pause});
$('#reload').onclick=()=>location.reload();
function fail(error){cancelAnimationFrame(frame);scene?.dispose();scene=null;$('#loading').hidden=true;$('#error-detail').textContent=error.message||String(error);$('#error').hidden=false;console.error(error);}
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();fail(new Error('图形上下文已中断。重新加载即可重新初始化水族箱。'));});
try{
 scene=await createRenderer(canvas,world,prefs);$('#loading').hidden=true;
 document.querySelectorAll('nav button,nav select').forEach(e=>e.disabled=false);
 $('#pause').onclick=()=>pause(!prefs.paused);$('#feed').onclick=()=>doFeed();
 $('#light').onchange=e=>controls.light(e.target.value);
 $('#quality').onchange=e=>{prefs.quality=e.target.value;persist();scene.resize();schedule();};
 $('#light-cycle').onclick=()=>{const list=['blue','moon','day'];controls.light(list[(list.indexOf(prefs.light)+1)%list.length]);};
 $('#quality-cycle').onclick=()=>{const list=['eco','balanced','detail'];prefs.quality=list[(list.indexOf(prefs.quality)+1)%list.length];persist();scene.resize();schedule();};
 async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{message('当前窗口不支持全屏，请使用系统全屏按钮。');}}
 $('#fullscreen').onclick=fullscreen;
 function clean(value){document.querySelectorAll('.chrome').forEach(e=>e.hidden=value);$('#show').hidden=!value;if(!wallpaper)(value?$('#show'):$('#hide')).focus();}
 $('#hide').onclick=()=>clean(true);$('#show').onclick=()=>clean(false);
 canvas.addEventListener('pointermove',e=>{pointer=scene.point(e.clientX,e.clientY);});canvas.addEventListener('pointerleave',()=>{pointer=null;});
 canvas.addEventListener('pointerdown',e=>{const p=scene.point(e.clientX,e.clientY);if(p.x>=0&&p.x<=1&&p.y>=0&&p.y<=1)doFeed(p.x,p.y);});
 document.addEventListener('keydown',e=>{if(e.repeat||e.target.closest('button,select,input,textarea'))return;if(e.code==='Space'){e.preventDefault();pause(!prefs.paused);}if(e.key.toLowerCase()==='h')clean($('#show').hidden);if(e.key.toLowerCase()==='f')fullscreen();});
 addEventListener('resize',()=>{scene?.resize();scene?.render();});document.addEventListener('visibilitychange',schedule);
 if(native)window.webkit.messageHandlers.reefControl.postMessage({type:'ready'});
 schedule();
}catch(error){fail(error);}
