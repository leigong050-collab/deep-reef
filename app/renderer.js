import * as THREE from '../vendor/three.module.js';
import {PROFILES} from './settings.js';
import {fishPose} from './fish-pose.js';

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


const fishVertex=`
 uniform float phase;uniform float effort;varying vec2 vUv;varying vec3 vNormal;
 void main(){
  vUv=uv;vec3 p=position;
  float tail=pow(clamp((.27-p.x)/.72,0.,1.),1.7);
  float wave=sin(phase+p.x*8.);
  p.z+=wave*tail*(.025+effort*.027);
  p.y+=cos(phase+p.x*8.)*tail*.005;
  // Fine edge motion belongs to fins; the head remains stable.
  float fin=smoothstep(.085,.22,abs(p.y))*(1.-smoothstep(.24,.44,p.x));
  p.z+=sin(phase*1.35+p.x*20.)*fin*.005;
  vNormal=normalize(normalMatrix*normal);
  gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
 }`;
const fishFragment=`
 uniform sampler2D image;uniform float brightness;uniform vec3 tint;uniform float time;uniform float depth;
 varying vec2 vUv;varying vec3 vNormal;
 void main(){
  vec4 texel=texture2D(image,vUv);if(texel.a<.06)discard;
  vec3 n=normalize(vNormal);if(!gl_FrontFacing)n=-n;
  float form=.83+.17*abs(n.z)+.035*n.y;
  float shimmer=pow(max(0.,sin(vUv.x*18.+vUv.y*26.+time*.8)),12.)*.045;
  vec3 color=texel.rgb*(form+shimmer)*brightness*tint;
  color=mix(color,vec3(.011,.035,.070),depth);
  gl_FragColor=vec4(color,texel.a);
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
  const shape={clown:[.045,.34,.15,.065],chromis:[.06,.30,.12,.05],yellow:[.04,.28,.23,.065],butterfly:[.06,.25,.21,.06],gramma:[.04,.31,.12,.05]}[f.kind];
  const group=new THREE.Group();group.position.z=1+f.id*.015;scene.add(group);
  const fishUniforms={image:{value:maps[f.kind]},phase:{value:f.tailPhase},effort:{value:0},brightness:{value:1},tint:{value:new THREE.Vector3(1,1,1)},time:{value:0},depth:{value:f.school?.14:.045}};
  // Two bowed surfaces give the photographic skin a continuous silhouette in a turn.
  // Transparent fins remain thin; the body occupies depth between the two sides.
  for(const side of [1,-1]){
   const geometry=new THREE.PlaneGeometry(1,2/3,48,24),a=geometry.attributes.position;
   for(let j=0;j<a.count;j++){
    const x=a.getX(j),y=a.getY(j),q=Math.pow((x-shape[0])/shape[1],2)+Math.pow(y/shape[2],2);
    a.setZ(j,side*(.001+Math.sqrt(Math.max(0,1-q))*shape[3]));
   }
   geometry.computeVertexNormals();
   const material=new THREE.ShaderMaterial({uniforms:fishUniforms,vertexShader:fishVertex,fragmentShader:fishFragment,transparent:true,depthWrite:true,side:THREE.DoubleSide});
   group.add(new THREE.Mesh(geometry,material));
  }
  return {group,fishUniforms};
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
   const f=world.fish[i],{group,fishUniforms}=fishMeshes[i],pose=fishPose(f);
   group.scale.set(pose.scaleX,pose.scaleY,pose.scaleX);
   group.rotation.set(0,pose.yaw,pose.roll,'ZYX');
   group.position.x=f.x*16-8;group.position.y=4.5-f.y*9;
   fishUniforms.phase.value=pose.phase;fishUniforms.effort.value=Math.min(1,f.swimSpeed/.06);
   fishUniforms.time.value=world.time;
   fishUniforms.brightness.value=uniforms.brightness.value*.93;
   fishUniforms.tint.value.set(uniforms.tint.value.x*.91,uniforms.tint.value.y*.98,uniforms.tint.value.z);
  }
  world.food.forEach((p,i)=>{foodPositions[i*3]=p.x*16-8;foodPositions[i*3+1]=4.5-p.y*9;foodPositions[i*3+2]=2;});foodGeometry.setDrawRange(0,world.food.length);foodGeometry.attributes.position.needsUpdate=true;
  for(let i=0;i<34;i++){motesPositions[i*3]=((i*.6180339+world.time*.0007)%1)*16-8;motesPositions[i*3+1]=((i*.41421+world.time*.0004)%1)*9-4.5;motesPositions[i*3+2]=2.5;}motesGeometry.attributes.position.needsUpdate=true;
  renderer.render(scene,camera);
 }
 resize();return {resize,render,point,renderer,dispose(){scene.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});[plate,...Object.values(maps)].forEach(t=>t.dispose());renderer.dispose();}};
}
