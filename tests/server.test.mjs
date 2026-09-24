import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,mkdir,symlink,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const server=await import('../scripts/serve.mjs').catch(()=>({}));
test('server implements scoped local preview',()=>assert.equal(typeof server.createPreviewServer,'function'));
test('serves app files but not private paths, traversal, symlinks or writes',async()=>{
 const root=await mkdtemp(join(tmpdir(),'deep-reef-test-'));await mkdir(join(root,'app'));await writeFile(join(root,'app/index.html'),'reef');await writeFile(join(root,'secret.txt'),'private');await symlink(join(root,'secret.txt'),join(root,'app/leak.txt'));
 const s=server.createPreviewServer(root);await new Promise(r=>s.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${s.address().port}`;
 try{
  const entry=await fetch(base+'/');assert.equal(entry.url,base+'/app/index.html');assert.equal(await entry.text(),'reef');
  for(const p of ['/secret.txt','/.git/config','/app/leak.txt','/app/%2e%2e%2fsecret.txt'])assert.notEqual((await fetch(base+p)).status,200);
  assert.equal((await fetch(base+'/',{method:'POST'})).status,405);
  assert.equal((await fetch(base+'/app/missing.png')).status,404);
 }finally{await new Promise(r=>s.close(r));await rm(root,{recursive:true,force:true});}
});
