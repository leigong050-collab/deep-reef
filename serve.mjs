import http from 'node:http';
import {readFile,realpath,stat} from 'node:fs/promises';
import {resolve,sep,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp'};
export function createPreviewServer(base=root){
 return http.createServer(async(req,res)=>{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{Allow:'GET, HEAD'});res.end();return;}
  try{
   const parsed=new URL(req.url,'http://localhost');let p=decodeURIComponent(parsed.pathname);
   if(p==='/'||p==='/app/'){res.writeHead(302,{Location:'/app/index.html'+parsed.search});res.end();return;}
   if(!/^\/(app|vendor)\//.test(p)||p.split('/').some(v=>v.startsWith('.'))){res.writeHead(403);res.end();return;}
   const allowed=await realpath(resolve(base,p.split('/')[1]));let f=await realpath(resolve(base,'.'+p));
   if(!f.startsWith(allowed+sep)){res.writeHead(403);res.end();return;}
   if(!(await stat(f)).isFile()){res.writeHead(404);res.end();return;}
   const bytes=await readFile(f);res.writeHead(200,{'Content-Type':types[extname(f)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Cross-Origin-Resource-Policy':'same-origin'});res.end(req.method==='HEAD'?undefined:bytes);
  }catch{res.writeHead(404);res.end('Not found');}
 });
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const port=Number(process.env.PORT||4783);const s=createPreviewServer();
 s.on('error',e=>{console.error(`无法启动预览：${e.message}。可用 PORT=4784 npm start 更换端口。`);process.exitCode=1;});
 s.listen(port,'127.0.0.1',()=>console.log(`Deep Reef → http://127.0.0.1:${port}`));
}
