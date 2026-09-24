// Catch module/dependency failures too, before main.js can register its handlers.
import('./main.js').catch(error=>{
 document.querySelector('#loading').hidden=true;
 document.querySelector('#error-detail').textContent='程序文件加载失败，请确认 app 与 vendor 文件夹完整，然后重新加载。';
 document.querySelector('#error').hidden=false;
 document.querySelector('#reload').onclick=()=>location.reload();
 console.error(error);
});
