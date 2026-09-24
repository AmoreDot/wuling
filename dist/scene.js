import * as THREE from './vendor/three.module.js';

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-8,8,8,-8,.1,100);
const renderer = new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.7;
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const mat=(color,roughness=.77,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
const basalt=mat('#17272a'), charcoal=mat('#263438'), steel=mat('#3c4b4d',.48,.42);
const edge=mat('#677976',.48,.38), pale=mat('#c1c4b9'), concrete=mat('#9da7a2');
const concreteDark=mat('#687675'), jade=mat('#416a6b',.38,.18), glass=new THREE.MeshPhysicalMaterial({color:'#76a8a4',metalness:.2,roughness:.19,transparent:true,opacity:.78,clearcoat:.8});
const green=mat('#60be9d',.45,.14), signal=mat('#a5d771',.45,.1), orange=mat('#d88b59');
const leaf=[mat('#668e6d'),mat('#80a179'),mat('#477868'),mat('#a1b586')];
const water=new THREE.MeshPhysicalMaterial({color:'#45999a',metalness:.15,roughness:.16,transparent:true,opacity:.89,clearcoat:1});
const waterDrop=new THREE.MeshBasicMaterial({color:'#c3e5dc',transparent:true,opacity:.38,depthWrite:false,side:THREE.DoubleSide});
const light=new THREE.MeshBasicMaterial({color:'#b9eac1'});
const root=new THREE.Group();scene.add(root);
function box(parent,w,h,d,x,y,z,m,shadow=true){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=shadow;o.receiveShadow=true;parent.add(o);return o;}
function cylinder(parent,rt,rb,h,x,y,z,m,n=8){const o=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,n),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
function sphere(parent,r,x,y,z,m,sx=1,sy=1,sz=1){const o=new THREE.Mesh(new THREE.IcosahedronGeometry(r,1),m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
function bar(parent,a,b,r,m){const v1=new THREE.Vector3(...a),v2=new THREE.Vector3(...b),dir=v2.clone().sub(v1);const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,dir.length(),6),m);o.position.copy(v1).add(v2).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.normalize());o.castShadow=true;parent.add(o);}
function rail(parent,x1,x2,z,y){for(let x=x1;x<=x2+.01;x+=.43)box(parent,.027,.31,.034,x,y-.15,z,edge);box(parent,x2-x1+.06,.04,.05,(x1+x2)/2,y,z,edge);}
function canopy(parent,w,d,x,y,z){
  const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);
  // Long horizontal dark eaves: stacked black plates, metallic rims and exposed joists.
  box(g,w,.12,d,0,-.11,0,basalt);
  box(g,w+.26,.12,d+.19,0,-.005,0,charcoal);
  box(g,w+.13,.035,d+.13,0,.072,0,edge);
  box(g,w-.16,.05,d-.1,0,.116,0,basalt);
  for(let xx=-w/2+.16;xx<w/2;xx+=.19)box(g,.038,.065,d-.08,xx,-.205,0,steel);
  for(let zz of [-d/2-.045,d/2+.045]){
    box(g,w+.25,.028,.026,0,.027,zz,edge,false);
    for(let xx=-w/2+.15;xx<w/2;xx+=.52)box(g,.053,.045,.055,xx,-.02,zz,light,false);
  }
  for(let xx of [-w/2+.2,w/2-.2])for(let zz of [-d/2+.15,d/2-.15])box(g,.11,.14,.11,xx,.18,zz,steel);
  return g;
}
function glassFacade(parent,w,h,d,x,y,z){
  box(parent,w,h,d,x,y,z,glass,false);
  for(let xx=x-w/2;xx<=x+w/2+.01;xx+=.33)box(parent,.042,h+.04,d+.026,xx,y,z,steel);
  for(let yy of [y-h/2+.16,y+h/2-.15])box(parent,w+.02,.043,d+.03,x,yy,z,edge);
}
function sideBuilding(x){
  const g=new THREE.Group();g.position.x=x;root.add(g);
  box(g,3.35,.66,3.27,0,.45,-2.43,concreteDark);
  box(g,3.38,.1,3.3,0,.83,-2.43,pale);
  for(const sx of [-1,1])for(const z of [-3.47,-1.35]){
    box(g,.2,1.46,.23,sx*1.43,1.61,z,concrete);
    box(g,.31,.16,.3,sx*1.43,2.35,z,steel);
  }
  box(g,3.05,1.28,2.84,0,1.55,-2.43,jade);
  glassFacade(g,2.94,1.17,.06,0,1.55,-.975);
  canopy(g,3.75,3.67,0,2.53,-2.38);
  // An upper volume held under a second, oversized roof.
  box(g,2.85,1.08,2.1,0,3.16,-2.69,concrete);
  glassFacade(g,2.62,.89,.065,0,3.19,-1.58);
  for(let zz of [-3.55,-1.68])for(let xx of [-1.26,1.26])box(g,.12,1.03,.12,xx,3.18,zz,steel);
  canopy(g,4.05,2.87,0,3.84,-2.72);
  for(let zz of [-1.06,-3.77])rail(g,-1.55,1.55,zz,2.88);
  // Small awning and angular side screen.
  canopy(g,2.82,.94,0,1.26,.05);
  for(let i=0;i<7;i++)box(g,.025,.6,.035,-1.2+i*.4,1.3,.34,edge);
  return g;
}

// A waterside reading pavilion: a light glazed room between heavy horizontal eaves.
function watersidePavilion(){
  const g=new THREE.Group();g.position.set(-7.4,0,1.45);root.add(g);
  box(g,2.92,.32,3.48,0,.42,0,concreteDark);
  box(g,2.81,.09,3.36,0,.62,0,pale);
  for(const x of [-1.17,1.17])for(const z of [-1.42,1.42]){
    box(g,.13,1.39,.13,x,1.4,z,concrete);
    box(g,.24,.11,.24,x,2.12,z,steel);
  }
  box(g,2.47,1.33,2.88,0,1.36,0,jade);
  glassFacade(g,2.38,1.2,.06,0,1.38,1.47);
  for(let x=-1.05;x<1.15;x+=.34)box(g,.035,1.14,.09,x,1.38,-1.48,steel);
  canopy(g,3.18,3.75,0,2.22,0);
  box(g,1.75,.2,1.58,-.25,2.6,-.34,concrete);
  glassFacade(g,1.52,.43,.05,-.25,2.71,.47);
  canopy(g,2.12,2.16,-.25,3.03,-.33);
  rail(g,-1.3,1.3,1.71,.94);
  box(g,1.66,.14,.42,0,.35,1.98,pale);
  box(g,.14,.08,2.91,1.43,.77,0,green,false);
}

// An asymmetric workshop and market, with staggered modern shop awnings.
function marketHouse(){
  const g=new THREE.Group();g.position.set(7.35,0,1.52);root.add(g);
  box(g,2.92,.36,3.68,0,.43,0,concreteDark);
  box(g,2.8,.08,3.55,0,.65,0,pale);
  box(g,2.57,1.3,3.14,0,1.34,-.12,concrete);
  glassFacade(g,2.41,1.16,.07,0,1.35,1.49);
  for(const x of [-1.2,1.2])box(g,.14,1.36,.17,x,1.38,1.47,steel);
  box(g,2.62,.25,1.14,0,.78,1.06,basalt);
  canopy(g,3.13,3.58,0,2.2,-.04);
  // The upper glass room sits slightly off-centre under a shorter roof.
  box(g,1.99,.93,2.06,.31,2.7,-.58,jade);
  glassFacade(g,1.8,.79,.06,.31,2.71,.49);
  canopy(g,2.46,2.65,.31,3.3,-.58);
  for(let x=-1.2;x<1.3;x+=.3)box(g,.04,.44,.035,x,2.48,1.44,edge);
  rail(g,-1.27,1.27,1.65,2.42);
  box(g,1.17,.33,.06,-.49,1.54,1.58,charcoal);
  for(let i=0;i<3;i++)box(g,.12,.12,.025,-.86+i*.31,1.55,1.62,signal,false);
  for(const x of [-1.05,.9]){
    box(g,.47,.08,.46,x,.71,2.25,concreteDark);
    sphere(g,.24,x,.89,2.25,leaf[x<0?0:2],1.1,.7,1);
  }
}

// A compact archive tower: the same concrete, dark cap and jade glazing in a vertical rhythm.
function archiveTower(){
  const g=new THREE.Group();g.position.set(0,0,-7.1);root.add(g);
  box(g,3.79,.47,2.85,0,.47,0,concreteDark);
  box(g,3.67,.1,2.74,0,.75,0,pale);
  for(const x of [-1.52,1.52])for(const z of [-1.06,1.06])box(g,.19,2.91,.2,x,2.22,z,concrete);
  box(g,3.28,2.52,2.3,0,2.13,0,jade);
  glassFacade(g,3.13,2.36,.06,0,2.15,1.17);
  for(let x=-1.42;x<=1.43;x+=.27)box(g,.065,2.56,.15,x,2.13,1.25,steel);
  for(let y of [1.47,2.3,3.13])box(g,3.24,.044,.07,0,y,1.27,edge);
  canopy(g,4.07,3.16,0,3.69,0);
  box(g,2.66,.48,1.42,0,4.03,-.18,concrete);
  glassFacade(g,2.44,.34,.055,0,4.07,.56);
  canopy(g,3.11,2.08,0,4.42,-.18);
  box(g,.68,.58,.06,0,1.08,1.22,basalt);
  for(let i=0;i<4;i++)box(g,.08,.08,.025,-.23+i*.15,1.12,1.26,light,false);
}

// One complete square specimen slab, with stratified cut edges.
box(root,18.4,.67,18.4,0,-.36,0,basalt);
box(root,18.32,.1,18.32,0,.025,0,steel);
box(root,18.17,.13,18.17,0,.14,0,concrete);
for(const s of [-1,1]){
  box(root,18.35,.025,.026,0,-.22,s*9.19,green,false);
  box(root,.026,.025,18.35,s*9.19,-.22,0,green,false);
}
// Quiet circulation bands frame the older gate precinct and connect the three new buildings.
for(const s of [-1,1]){
  box(root,2.02,.048,11.2,s*7.1,.225,.82,pale);
  for(let z=-4.5;z<6.1;z+=.71)box(root,1.98,.008,.014,s*7.1,.254,z,concreteDark,false);
  box(root,2.22,.055,2.3,s*7.05,.23,-6.6,pale);
  box(root,2.3,.12,.19,s*6.06,.35,-5.9,concrete);
}
box(root,3.62,.06,1.04,0,.235,-5.16,pale);
box(root,3.59,.05,1.05,0,.235,5.96,pale);
for(let x=-1.65;x<1.8;x+=.55)box(root,.014,.008,1.03,x,.269,5.96,concreteDark,false);
box(root,7.72,.045,3.16,0,.235,7.24,pale);
for(let x=-3.65;x<3.8;x+=.68)box(root,.012,.008,3.15,x,.263,7.24,concreteDark,false);
for(let z=5.7;z<8.85;z+=.62)box(root,7.7,.008,.012,0,.263,z,concreteDark,false);
for(const s of [-1,1]){
  box(root,2.2,.22,2.62,s*6.92,.33,6.86,concreteDark);
  box(root,2.03,.055,2.44,s*6.92,.47,6.86,jade);
  for(let i=0;i<9;i++)sphere(root,.12+(i%3)*.03,s*(6.1+(i*1.37%1.62)),.54,5.84+(i*.43%2),leaf[i%4],1.18,.53,1);
  box(root,.12,.16,3.1,s*4.02,.3,7.2,concrete);
}
watersidePavilion();marketHouse();archiveTower();
// Rectilinear forecourt, small reflecting pools and gridded paving.
box(root,8.4,.055,3.12,0,.24,3.35,pale);
for(let x=-3.95;x<4;x+=.74)box(root,.012,.008,3.1,x,.276,3.35,concreteDark,false);
for(let z=1.82;z<4.9;z+=.68)box(root,8.4,.008,.012,0,.276,z,concreteDark,false);
for(const s of [-1,1]){
  box(root,1.6,.035,4.98,s*5.17,.26,2.34,concreteDark);
  box(root,1.22,.035,4.63,s*5.17,.29,2.34,water,false);
  for(let i=0;i<17;i++)box(root,.35,.007,.013,s*5.17,.318,.15+i*.23,light,false);
  box(root,.18,.12,5.0,s*4.44,.35,2.34,pale);
  box(root,.18,.12,5.0,s*5.88,.35,2.34,pale);
}
// Deep raised stair plaza, a broad flight beneath the bell.
box(root,8.7,.68,4.35,0,.61,-.23,concreteDark);
box(root,8.62,.1,4.25,0,.98,-.23,pale);
for(let i=0;i<8;i++)box(root,6.45,.11,.38,0,.37+i*.08,2.63-i*.27,pale);
for(const s of [-1,1]){
  box(root,.68,.2,2.68,s*3.53,.61,1.54,concrete);
  for(let i=0;i<7;i++)box(root,.64,.022,.05,s*3.53,.73+i*.006,2.63-i*.31,edge,false);
}
sideBuilding(-3.63);sideBuilding(3.63);
// Upper bridge between the wings and four monumental concrete pylons.
for(const x of [-1.78,1.78])for(const z of [-3.46,-1.2]){
  box(root,.31,3.18,.34,x,2.5,z,concrete);
  box(root,.49,.2,.5,x,4.15,z,charcoal);
  for(let i=0;i<5;i++)box(root,.035,.14,.04,x+.18,1.25+i*.5,z+.12,edge,false);
}
box(root,4.55,.23,3.25,0,3.91,-2.3,basalt);
for(let i=-9;i<=9;i++)box(root,.045,.14,3.2,i*.23,3.73,-2.3,steel);
canopy(root,5.06,3.65,0,4.24,-2.31);
rail(root,-2.24,2.24,-.46,4.48);
// Rear skyline tier bridges and giant flat caps.
for(const s of [-1,1]){
  box(root,1.65,.16,1.65,s*2.7,3.92,-2.51,steel);
  canopy(root,2.07,1.95,s*2.7,4.38,-2.59);
}

// Suspended carved dark bronze bell, the focal landmark of the references.
const bell=new THREE.Group();bell.position.set(0,0,-2.22);root.add(bell);
box(bell,.5,.38,.5,0,3.72,0,basalt);
for(const x of [-.47,.47])box(bell,.24,.34,.24,x,3.47,0,steel);
cylinder(bell,.92,.78,2.28,0,2.42,0,basalt,12);
cylinder(bell,.83,.94,.18,0,1.23,0,charcoal,12);
for(let y of [1.6,2.25,2.91]){
  for(let i=0;i<8;i++){
    const a=i*Math.PI/4;
    const stoneMark=box(bell,.41,.41,.12,Math.sin(a)*.82,y,Math.cos(a)*.82,steel);
    stoneMark.rotation.y=a;
    const inset=box(bell,.2,.2,.027,Math.sin(a)*.892,y,Math.cos(a)*.892,concreteDark,false);
    inset.rotation.y=a;
  }
}
for(const x of [-.31,0,.31]){
  box(bell,.07,.11,.038,x,1.9,.945,orange,false);
  box(bell,.08,.08,.038,x,1.77,.945,orange,false);
}
// Broad stair landing with retaining parapets.
box(root,4.15,.1,1.06,0,1.08,-.65,pale);
for(const s of [-1,1]){
  box(root,.33,.64,1.84,s*2.16,1.3,-.93,concrete);
  box(root,.36,.07,1.85,s*2.16,1.66,-.93,edge);
}

// Hanging fabric graphics and luminous balcony strips.
function banner(x,z,hue){
  const g=new THREE.Group();g.position.set(x,0,z);root.add(g);
  box(g,.72,1.45,.018,0,2.84,0,hue,false);
  box(g,.75,.027,.055,0,3.58,0,steel);
  box(g,.75,.027,.055,0,2.11,0,steel);
  for(let row=0;row<3;row++)for(let col=0;col<3;col++){
    if((row+col)%3===0)box(g,.105,.105,.008,-.19+col*.19,2.48+row*.2,.016,pale,false);
  }
  box(g,.36,.025,.01,0,3.31,.017,pale,false);
  box(g,.22,.025,.01,-.07,3.21,.017,pale,false);
}
for(const x of [-4.47,-3.61,3.58,4.44])banner(x,-.44,(x<0||x>4)?green:pale);
for(const x of [-5.52,-4.78,4.78,5.52]){
  box(root,.5,.025,.055,x,2.59,-.68,light,false);
}
// Falling water in fine, separated translucent ribbons under the upper decks.
function cascade(x,z,top,bottom,width){
  for(let i=0;i<22;i++){
    const xx=x-width/2+width*i/21;
    const length=(top-bottom)-((i*7)%5)*.08;
    const strip=new THREE.Mesh(new THREE.PlaneGeometry(.016+(i%3)*.013,length),waterDrop);
    strip.position.set(xx,top-length/2,z+Math.sin(i*13)*.04);
    strip.rotation.y=(i%5-2)*.09;root.add(strip);
    if(i%3===0)sphere(root,.025,xx,bottom+.07,z,waterDrop,1,.35,1);
  }
}
for(const x of [-4.72,-2.6,2.6,4.72])cascade(x,-.61,2.38,.39,.72);
cascade(0,-.48,3.8,3.1,2.55);

// Blocky railings, neon locator lights and planted margins.
for(const s of [-1,1]){
  for(let i=0;i<9;i++){
    const z=.08+i*.58;
    box(root,.09,.38,.09,s*6.05,.52,z,steel);
    box(root,.12,.045,.12,s*6.05,.75,z,light,false);
  }
  box(root,2.1,.24,.96,s*5.2,.35,-4.82,concreteDark);
}
function tree(x,z,h=1.25,k=0){
  const g=new THREE.Group();g.position.set(x,.23,z);root.add(g);
  cylinder(g,.055,.11,h*.72,0,h*.36,0,concreteDark,7);
  for(const [dx,dy,dz,r] of [[0,.75,0,.39],[-.23,.63,.11,.33],[.24,.68,-.1,.31],[.03,.98,.02,.27]])sphere(g,r*h/1.3,dx*h/1.3,dy*h/1.3,dz*h/1.3,leaf[(k+Math.round((dx+1)*4))%4],1.12,.8,1.02);
}
for(const [x,z,h,k] of [[-5.67,-4.8,1.28,0],[-5.69,-2.85,1.17,1],[-5.77,5.25,1.1,2],[5.7,-4.9,1.31,1],[5.74,-2.65,1.16,3],[5.84,5.35,.99,2],[-4.2,5.5,.84,0],[4.2,5.47,.88,1]])tree(x,z,h,k);
for(let i=0;i<44;i++){
  const s=i%2?1:-1,x=s*(4.64+(i*1.71%1.45)),z=-5.9+(i*2.41%11.6);
  if(z>-.2&&z<4.95)continue;
  sphere(root,.12+(i%4)*.025,x,.3,z,leaf[i%4],1.15,.47,1);
}
// Scale figure on the landing.
cylinder(root,.105,.14,.4,2.54,1.25,.27,charcoal,9);
sphere(root,.115,2.54,1.55,.27,pale);
box(root,.21,.035,.2,2.54,1.03,.27,basalt);

scene.add(new THREE.AmbientLight('#cfddd4',1.8));
const sun=new THREE.DirectionalLight('#fff5df',3.2);sun.position.set(-7,12,10);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-12;sun.shadow.camera.right=12;sun.shadow.camera.top=12;sun.shadow.camera.bottom=-12;sun.shadow.bias=-.0005;sun.shadow.normalBias=.025;scene.add(sun);
const fill=new THREE.DirectionalLight('#80c4bb',1.6);fill.position.set(7,7,-7);scene.add(fill);
let azimuth=.21,elevation=.51,zoom=1;
const target=new THREE.Vector3(0,1.65,0);
function updateCamera(){const d=24;camera.position.set(Math.sin(azimuth)*Math.cos(elevation)*d,Math.sin(elevation)*d,Math.cos(azimuth)*Math.cos(elevation)*d);camera.lookAt(target);camera.updateProjectionMatrix();}
function resize(){const w=innerWidth,h=innerHeight,aspect=w/h;const size=Math.max(9.3,10.9/aspect)/zoom;camera.left=-size*aspect;camera.right=size*aspect;camera.top=size;camera.bottom=-size;renderer.setSize(w,h);updateCamera();}
window.addEventListener('resize',resize);resize();
const pointers=new Map();let lastPinch=0;
renderer.domElement.addEventListener('pointerdown',e=>{renderer.domElement.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});});
renderer.domElement.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;const old=pointers.get(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===1){azimuth-=(e.clientX-old.x)*.006;elevation=THREE.MathUtils.clamp(elevation+(e.clientY-old.y)*.004,.16,1.35);updateCamera();}else if(pointers.size===2){const p=[...pointers.values()],dist=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);if(lastPinch)zoom=THREE.MathUtils.clamp(zoom*dist/lastPinch,.68,2.65);lastPinch=dist;resize();}});
function endPointer(e){pointers.delete(e.pointerId);lastPinch=0;}
renderer.domElement.addEventListener('pointerup',endPointer);renderer.domElement.addEventListener('pointercancel',endPointer);
renderer.domElement.addEventListener('wheel',e=>{e.preventDefault();zoom=THREE.MathUtils.clamp(zoom*Math.exp(-e.deltaY*.001),.68,2.65);resize();},{passive:false});
function frame(){requestAnimationFrame(frame);renderer.render(scene,camera);}frame();
