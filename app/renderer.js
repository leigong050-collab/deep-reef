import * as THREE from '../vendor/three.module.js';
import {PROFILES} from './settings.js';

const vertex=`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const backgroundFragment=`
 uniform sampler2D image;uniform float time;uniform float brightness;uniform vec3 tint;varying vec2 vUv;
 float ellipse(vec2 p,vec2 c,vec2 r){vec2 q=(p-c)/r;return 1.-smoothstep(.5,1.,dot(q,q));}
 void main(){
  vec2 uv=vUv;float t=time;
  float torch=ellipse(uv,vec2(.414,.464),vec2(.097,.092));
  float anemone=ellipse(uv,vec2(.839,.343),vec2(.10,.093));
  float soft=clamp(torch+anemone,0.,1.);
  // Only soft tissue moves; the rock skeleton and sand remain anchored.
  uv.x+=soft*.0018*sin(t*1.15+uv.y*53.);uv.y+=soft*.0012*sin(t*.81+uv.x*61.);
  float surface=smoothstep(.91,1.,uv.y);
  uv.x+=surface*.0016*sin(uv.y*85.+t*.7);uv.y+=surface*.0006*sin(uv.x*74.+t);
  vec3 color=texture2D(image,uv).rgb;
  float ripple=sin(uv.x*60.+sin(uv.y*42.+t*.45)*2.+t*.36)*sin(uv.y*46.-t*.55+sin(uv.x*29.));
  float sand=1.-smoothstep(.08,.24,uv.y);
  color*=1.+sand*ripple*.035+soft*sin(t*.8+uv.x*26.)*.012;
  color*=brightness*tint;
  gl_FragColor=vec4(color,1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
 }`;

export async function createRenderer(canvas,world,settings){
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'low-power'});
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setClearColor('#020a1b');
 const scene=new THREE.Scene();const camera=new THREE.OrthographicCamera(-8,8,4.5,-4.5,.1,50);camera.position.z=10;
 const loader=new THREE.TextureLoader();
 const texture=async name=>{const map=await loader.loadAsync(new URL('./assets/'+name,import.meta.url).href);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());return map;};
 let plate,maps;
 try{const loaded=await Promise.all(['reef','clownfish','chromis','yellow','gramma','butterfly'].map(name=>texture(name+'.png')));plate=loaded[0];maps={clown:loaded[1],chromis:loaded[2],yellow:loaded[3],gramma:loaded[4],butterfly:loaded[5]};}catch(e){renderer.dispose();throw new Error('场景素材加载失败，请检查 app/assets 中的背景和鱼类图片是否完整。',{cause:e});}
 const uniforms={image:{value:plate},time:{value:0},brightness:{value:1},tint:{value:new THREE.Vector3(1,1,1)}};
 const bg=new THREE.Mesh(new THREE.PlaneGeometry(16,9),new THREE.ShaderMaterial({uniforms,vertexShader:vertex,fragmentShader:backgroundFragment}));scene.add(bg);
 const fishMeshes=world.fish.map(f=>{
  const geometry=new THREE.PlaneGeometry(1,2/3,24,8);const original=geometry.attributes.position.array.slice();
  const material=new THREE.MeshBasicMaterial({map:maps[f.kind],transparent:true,alphaTest:.1,depthWrite:false,side:THREE.DoubleSide,color:f.kind==='chromis'?(f.school?'#a7cadf':'#a9b9d1'):'#c0ceeb'});
  const mesh=new THREE.Mesh(geometry,material);mesh.position.z=1+f.id*.01;scene.add(mesh);return {mesh,original};
 });
 const foodGeometry=new THREE.BufferGeometry();const foodPositions=new Float32Array(32*3);foodGeometry.setAttribute('position',new THREE.BufferAttribute(foodPositions,3));foodGeometry.setDrawRange(0,0);
 const foodMaterial=new THREE.PointsMaterial({color:'#c9a97b',size:.028,sizeAttenuation:true,transparent:true,opacity:.85,depthWrite:false});const foods=new THREE.Points(foodGeometry,foodMaterial);foods.frustumCulled=false;scene.add(foods);
 const motesGeometry=new THREE.BufferGeometry();const motesPositions=new Float32Array(34*3);motesGeometry.setAttribute('position',new THREE.BufferAttribute(motesPositions,3));
 const motes=new THREE.Points(motesGeometry,new THREE.PointsMaterial({color:'#a9d0e4',size:.008,transparent:true,opacity:.13,depthWrite:false}));motes.frustumCulled=false;scene.add(motes);
 let width=1,height=1,spanX=16,spanY=9;
 function resize(){
  width=canvas.clientWidth||innerWidth;height=canvas.clientHeight||innerHeight;const profile=PROFILES[settings.quality];
  const scale=Math.min(devicePixelRatio||1,profile.dpr,Math.sqrt(profile.pixels/(width*height)));renderer.setPixelRatio(scale);renderer.setSize(width,height,false);
  // Contain the entire approved composition on unusual aspect ratios.
  const aspect=width/height;if(aspect>=16/9){spanY=9;spanX=9*aspect;}else{spanX=16;spanY=16/aspect;}
  camera.left=-spanX/2;camera.right=spanX/2;camera.top=spanY/2;camera.bottom=-spanY/2;camera.updateProjectionMatrix();
 }
 function point(x,y){return {x:((x/width-.5)*spanX+8)/16,y:(4.5-(.5-y/height)*spanY)/9};}
 function render(){
  uniforms.time.value=world.time;uniforms.brightness.value=settings.brightness*(settings.light==='moon'?.60:settings.light==='day'?1.10:1);
  uniforms.tint.value.set(...(settings.light==='moon'?[.74,.86,1]:settings.light==='day'?[1.15,1.06,.97]:[1,1,1]));
  for(let i=0;i<world.fish.length;i++){
   const f=world.fish[i],{mesh,original}=fishMeshes[i],a=mesh.geometry.attributes.position;
   const speed=Math.hypot(f.vx*1.77,f.vy);const phase=world.time*(3.4+speed*24)+f.phase;
   for(let j=0;j<a.count;j++){
    const x=original[j*3],y=original[j*3+1],tail=Math.pow(Math.max(0,.48-x),2);
    a.array[j*3+1]=y+Math.sin(phase+x*6)*tail*.040;
    a.array[j*3+2]=Math.sin(phase+x*6)*tail*.105;
   }a.needsUpdate=true;
   const facing=Math.cos(f.heading);mesh.scale.set(f.size*16*(Math.sign(facing)||1)*Math.max(.35,Math.abs(facing)),f.size*16,1);
   mesh.rotation.z=Math.sin(f.heading)*.22*(facing<0?-1:1);
   mesh.position.x=f.x*16-8;mesh.position.y=4.5-f.y*9+Math.sin(phase*.53)*.007;
   mesh.material.opacity=settings.light==='moon'?.68:.96;
  }
  world.food.forEach((p,i)=>{foodPositions[i*3]=p.x*16-8;foodPositions[i*3+1]=4.5-p.y*9;foodPositions[i*3+2]=2;});foodGeometry.setDrawRange(0,world.food.length);foodGeometry.attributes.position.needsUpdate=true;
  for(let i=0;i<34;i++){motesPositions[i*3]=((i*.6180339+world.time*.0007)%1)*16-8;motesPositions[i*3+1]=((i*.41421+world.time*.0004)%1)*9-4.5;motesPositions[i*3+2]=2.5;}motesGeometry.attributes.position.needsUpdate=true;
  renderer.render(scene,camera);
 }
 resize();return {resize,render,point,renderer,dispose(){scene.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});[plate,...Object.values(maps)].forEach(t=>t.dispose());renderer.dispose();}};
}
