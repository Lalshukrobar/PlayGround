import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js';

const canvas=document.querySelector('#world');
const scene=new THREE.Scene();
scene.background=new THREE.Color('#a9b5a4');
scene.fog=new THREE.FogExp2('#a9b5a4',0.0065);
const camera=new THREE.PerspectiveCamera(54,innerWidth/innerHeight,.1,420);
camera.position.set(0,7,10);camera.lookAt(0,1,-1.8);
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.16;
scene.add(new THREE.HemisphereLight('#dce5d2','#344237',2.0));
const sun=new THREE.DirectionalLight('#ffe3b2',2.3);sun.position.set(-42,65,35);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-90;sun.shadow.camera.right=90;sun.shadow.camera.top=90;sun.shadow.camera.bottom=-90;scene.add(sun);
const mat=(color,roughness=1)=>new THREE.MeshStandardMaterial({color,roughness});
const mats={grass:mat('#536b49'),grass2:mat('#667c54'),darkGrass:mat('#405b43'),path:mat('#aa946b'),stone:mat('#79776a'),stoneLight:mat('#aaa18a'),wood:mat('#594334'),wood2:mat('#806047'),roof:mat('#65463a'),roof2:mat('#7e5140'),leaf:mat('#3f6043'),leaf2:mat('#526c47'),leaf3:mat('#68734a'),gold:mat('#c7a86c'),water: new THREE.MeshStandardMaterial({color:'#677d78',roughness:.3,transparent:true,opacity:.8}),flower:mat('#aeb574')};
const groundGeo=new THREE.PlaneGeometry(260,260,150,150);groundGeo.rotateX(-Math.PI/2);
const pos=groundGeo.attributes.position;
function terrainHeight(x,z){return Math.sin(x*.045+z*.024)*1.8+Math.cos(z*.052-x*.017)*1.4+Math.sin(x*.13)*Math.cos(z*.105)*.55+Math.max(0,Math.sin((x+z)*.025))*1.4;}
for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i);pos.setY(i,terrainHeight(x,z));}groundGeo.computeVertexNormals();
const ground=new THREE.Mesh(groundGeo,mats.grass);ground.receiveShadow=true;scene.add(ground);
const group=new THREE.Group();scene.add(group);
const boxGeo=new THREE.BoxGeometry(1,1,1), coneGeo=new THREE.ConeGeometry(1,1,6), cylGeo=new THREE.CylinderGeometry(1,1,1,8), sphereGeo=new THREE.IcosahedronGeometry(1,1);
function addMesh(geo,material,x,y,z,sx=1,sy=1,sz=1,cast=true){const m=new THREE.Mesh(geo,material);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=cast;m.receiveShadow=true;group.add(m);return m;}
function block(x,y,z,sx,sy,sz,material){return addMesh(boxGeo,material,x,y,z,sx,sy,sz)}
function path(x1,z1,x2,z2,width){const dx=x2-x1,dz=z2-z1,len=Math.hypot(dx,dz),mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,len),mats.path);mesh.rotation.x=-Math.PI/2;mesh.rotation.y=Math.atan2(dx,dz);mesh.position.set((x1+x2)/2,terrainHeight((x1+x2)/2,(z1+z2)/2)+.055,(z1+z2)/2);mesh.receiveShadow=true;group.add(mesh);}
// winding trail through the valley's five landmarks
path(0,0,-18,-20,3.8);path(-18,-20,-34,3,3.3);path(-34,3,-42,15,3);path(-42,19,-64,-33,3.2);path(-64,-33,12,25,3.2);path(12,25,34,-59,3.5);path(34,-59,43,-67,4);
// gentle river and crossing
const river=new THREE.Mesh(new THREE.PlaneGeometry(8,78),mats.water);river.rotation.x=-Math.PI/2;river.rotation.z=-.42;river.position.set(13,1.05,-5);group.add(river);
// hills as distant ridges
for(let i=0;i<17;i++){const x=-115+i*14,z=-111-(i%3)*8,h=22+(i*17%20),m=addMesh(coneGeo,i%2?mats.darkGrass:mats.grass2,x,h/2+terrainHeight(x,z),z,17,h,23,false);m.rotation.z=((i%4)-1.5)*.045;}
for(let i=0;i<13;i++){const x=-114+i*19,z=107+(i%4)*4,h=18+(i*13%19);addMesh(coneGeo,i%2?mats.darkGrass:mats.grass2,x,h/2+terrainHeight(x,z),z,22,h,21,false);}
// forest, with a clearing near the herb glade
let seed=1340;function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
function tree(x,z,scale=1){const y=terrainHeight(x,z);addMesh(cylGeo,mats.wood,x,y+1.15*scale,z,.28*scale,2.4*scale,.28*scale);const crown=addMesh(coneGeo,rand()>.5?mats.leaf:mats.leaf2,x,y+3.1*scale,z,1.55*scale,3.4*scale,1.5*scale);crown.rotation.y=rand()*2;addMesh(coneGeo,mats.leaf3,x,y+4.25*scale,z,1.12*scale,2.7*scale,1.1*scale);}
for(let i=0;i<150;i++){let x,z;let tries=0;do{x=(rand()-.5)*178;z=(rand()-.5)*165;tries++;}while(tries<30&&((Math.hypot(x+18,z+20)<20)||(Math.hypot(x-43,z+67)<24)||(Math.hypot(x+42,z-20)<15)||(Math.hypot(x+64,z+33)<13)||(Math.hypot(x-12,z-25)<13)||Math.hypot(x,z)<13));tree(x,z,.72+rand()*.65);}
// cabins and village
function house(x,z,scale=1){const y=terrainHeight(x,z);block(x,y+1.25*scale,z,5*scale,2.5*scale,4*scale,mats.wood2);const roof=addMesh(coneGeo,mats.roof,x,y+3.4*scale,z,3.9*scale,2.5*scale,3.2*scale);roof.rotation.y=Math.PI/4;block(x,y+.75*scale,z+2.03*scale,.85*scale,1.5*scale,.12*scale,mats.wood);for(const wx of [-1.6,1.6]){block(x+wx*scale,y+1.45*scale,z+2.09*scale,.65*scale,.62*scale,.1*scale,mats.gold);}}
function village(){house(-20,-20,1.05);house(-28,-17,.78);house(-13,-28,.82);house(-12,-14,.72);house(-27,-29,.72);const y=terrainHeight(-19,-18);addMesh(cylGeo,mats.stone,-19,y+.6,-16,1.1,1.2,1.1);addMesh(cylGeo,mats.water,-19,y+1.23,-16,.84,.13,.84,false);block(-19,y+1.9,-16,.25,1.6,.25,mats.wood);block(-19,y+2.65,-16,1.1,.18,.18,mats.wood);}
village();
// charcoal-burner's abandoned camp and the old mountain spring
function charcoalCamp(){const x=-64,z=-33,y=terrainHeight(x,z);addMesh(sphereGeo,mats.stone,x,y+.55,z,.9,.42,.9);addMesh(sphereGeo,mat('#332d27'),x,y+.8,z,.62,.32,.62);for(let i=0;i<5;i++){const a=i*Math.PI*2/5;const log=block(x+Math.cos(a)*1.5,y+.35,z+Math.sin(a)*1.5,2.1,.22,.25,mats.wood);log.rotation.y=-a;}block(x-2,y+1.35,z-1.6,3,.18,.18,mats.wood);block(x-3.3,y+.75,z-1.6,.18,1.35,.18,mats.wood);block(x-.7,y+.75,z-1.6,.18,1.35,.18,mats.wood);}
function spring(){const x=12,z=25,y=terrainHeight(x,z);const pool=new THREE.Mesh(new THREE.CylinderGeometry(2.5,2.7,.32,20),mats.stone);pool.position.set(x,y+.13,z);group.add(pool);const water=new THREE.Mesh(new THREE.CircleGeometry(2.15,24),mats.water);water.rotation.x=-Math.PI/2;water.position.set(x,y+.31,z);group.add(water);for(let i=0;i<8;i++){const a=i*Math.PI/4;addMesh(coneGeo,mats.leaf3,x+Math.cos(a)*3.1,y+.75,z+Math.sin(a)*3.1,.17,1.2,.17,false);}}
charcoalCamp();spring();
// castle keep and curtain walls
function castle(){const x=43,z=-67,y=terrainHeight(x,z);block(x,y+5,z,15,10,13,mats.stone);const roof=addMesh(coneGeo,mats.roof2,x,y+12,z,9,5,8);roof.rotation.y=Math.PI/4;for(const dx of [-11,11])for(const dz of [-9,9]){block(x+dx,y+4,z+dz,4,8,4,mats.stoneLight);const t=addMesh(coneGeo,mats.roof2,x+dx,y+9.3,z+dz,2.7,3.1,2.7);t.rotation.y=Math.PI/4;}
block(x,y+2,-79,28,4,2,mats.stone);block(x-15,y+2,z,2,4,18,mats.stone);block(x+15,y+2,z,2,4,18,mats.stone);block(x,y+2,z+9,28,4,2,mats.stone);block(x,y+1,z+9,.8,2,2.15,mats.wood);for(let i=-1;i<=1;i++){block(x+i*4,y+2.1,z+6.48,1.3,1.8,.12,mats.gold);}}
castle();
// glade clearing, rocks and silverleaf pickups
for(let i=0;i<22;i++){let a=rand()*Math.PI*2,r=7+rand()*12,x=-42+Math.cos(a)*r,z=19+Math.sin(a)*r;addMesh(sphereGeo,mats.stone,x,terrainHeight(x,z)+.3,z,.35+rand()*.7,.28+rand()*.4,.45+rand()*.55,false);}
// landmark glow markers
function marker(x,z,color){const y=terrainHeight(x,z);const halo=new THREE.Mesh(new THREE.RingGeometry(1.3,1.55,32),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.62,side:THREE.DoubleSide}));halo.rotation.x=-Math.PI/2;halo.position.set(x,y+.12,z);group.add(halo);const beam=new THREE.Mesh(new THREE.CylinderGeometry(.035,.22,4,8,1,true),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.2}));beam.position.set(x,y+2,z);group.add(beam);return {halo,beam,x,z};}
const markers={village:marker(-19,-19,0xe7ca86),glade:marker(-42,19,0x9fca7c),camp:marker(-64,-33,0xc39b70),spring:marker(12,25,0x83b7b2),castle:marker(43,-67,0xd99076)};
// player in handcrafted traveler silhouette
const player=new THREE.Group();scene.add(player);const pbody=mat('#657760'),cloak=mat('#455a4c'),skin=mat('#d2b08b'),leather=mat('#6a4936');
function playerPart(geo,material,x,y,z,sx,sy,sz){const m=new THREE.Mesh(geo,material);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;player.add(m);return m;}
playerPart(cylGeo,cloak,0,.92,0,.43,1.2,.36);playerPart(sphereGeo,pbody,0,1.65,0,.47,.52,.4);playerPart(sphereGeo,skin,0,2.35,0,.32,.38,.31);playerPart(coneGeo,mat('#463d31'),0,2.62,0,.57,.27,.54);playerPart(boxGeo,leather,.3,1.1,-.28,.13,.68,.12);player.position.set(0,terrainHeight(0,0),0);
// herb objects are luminous, clickable, and anchored to the glade
const herbs=[];const herbPositions=[[-37,15],[-47,18],[-40,25],[-49,26],[-34,24]];
for(const [x,z] of herbPositions){const y=terrainHeight(x,z);const g=new THREE.Group();g.position.set(x,y+.15,z);group.add(g);const stem=new THREE.Mesh(cylGeo,mats.flower);stem.scale.set(.035,.52,.035);stem.position.y=.26;g.add(stem);for(let j=0;j<4;j++){const leaf=new THREE.Mesh(sphereGeo,new THREE.MeshStandardMaterial({color:j%2?'#a4bd76':'#789b5f',emissive:'#30452a',emissiveIntensity:.28,roughness:.7}));leaf.scale.set(.13,.25,.07);leaf.position.set(Math.sin(j*1.6)*.16,.24+j*.075,Math.cos(j*1.6)*.14);leaf.rotation.z=(j-1.5)*.45;g.add(leaf);}const glow=new THREE.Mesh(new THREE.SphereGeometry(.54,12,8),new THREE.MeshBasicMaterial({color:'#b8d687',transparent:true,opacity:.14,depthWrite:false}));glow.position.y=.35;g.add(glow);herbs.push({x,z,group:g,active:true});}
// interactable stations span the full valley
const stations=[{id:'healer',x:-19,z:-16,label:'SPEAK WITH THE HEALER'},{id:'charcoal',x:-64,z:-33,label:'GATHER CHARCOAL'},{id:'spring',x:12,z:25,label:'FILL THE WATER SKIN'},{id:'still',x:43,z:-54,label:'BREW THE REMEDY'}];
// UI and state
const $=s=>document.querySelector(s);const title=$('#title-screen'),topbar=$('#topbar'),questPanel=$('#quest-panel'),bottomHud=$('#bottom-hud'),mapCard=$('#map-card'),compass=$('#compass');
let started=false,herbCount=0,barkCollected=false,waterCollected=false,phase='gather',discovered=new Set(),toastTimer,noticeTimer,clock=new THREE.Clock(),cameraAngle=0, cameraDistance=10.5, soundOn=true,playing=false;
const keys={};const minimap=$('#minimap'),ctx=minimap.getContext('2d');
const objectivePoint=()=>({gather:{x:-42,z:19},bark:{x:-64,z:-33},water:{x:12,z:25},healer:{x:-19,z:-16},castle:{x:43,z:-54},deliver:{x:-19,z:-16}}[phase]);
function revealHUD(){[topbar,questPanel,bottomHud,mapCard,compass].forEach(e=>e.classList.remove('hidden'));if(innerWidth<760)$('#touch-controls').classList.remove('hidden');}
function updateQuest(){
 const title=$('#quest-title'),text=$('#quest-text'),label=$('#progress-label'),dest=$('#destination-label'),prog=$('#progress-count'),fill=$('#progress-fill');
 const quests={
  gather:{title:'A cure for the<br>black fever',text:'The healer needs four silverleaf sprigs to begin. Search the glade, then follow the old trail to the charcoal-burner’s camp.',label:'SILVERLEAF',count:`${herbCount} / 4`,percent:herbCount/4*100,destination:'Silverleaf Glade'},
  bark:{title:'The old<br>charcoal road',text:'Silverleaf alone will not draw out the fever. Gather a sack of clean charcoal from the abandoned burner’s camp.',label:'CHARCOAL',count:barkCollected?'FOUND':'0 / 1',percent:barkCollected?100:0,destination:'Charcoal-burner’s Camp'},
  water:{title:'Water from<br>the high spring',text:'The remedy must be steeped in pure water. Find the spring beyond the river and fill the healer’s water skin.',label:'SPRING WATER',count:waterCollected?'FOUND':'0 / 1',percent:waterCollected?100:0,destination:'Pilgrim’s Spring'},
  healer:{title:'Back to<br>Hollowmere',text:'You have silverleaf, charcoal, and spring water. Return to the healer to learn the final preparation.',label:'INGREDIENTS',count:'3 / 3',percent:100,destination:'Hollowmere Healer'},
  castle:{title:'The last<br>remedy',text:'The healer has given you the recipe. Carry the gathered ingredients to Greywatch Castle and use the apothecary’s still.',label:'REMEDY',count:'READY',percent:100,destination:'Greywatch Castle'},
  deliver:{title:'A remedy<br>for the valley',text:'The cure is brewed. Take the first dose back to Hollowmere before the fever claims another life.',label:'REMEDY',count:'BREWED',percent:100,destination:'Hollowmere Healer'}
 }[phase];
 title.innerHTML=quests.title;text.textContent=quests.text;label.textContent=quests.label;prog.textContent=quests.count;fill.style.width=`${quests.percent}%`;dest.textContent=quests.destination;
 $('#inventory-count').innerHTML=`${herbCount} <span>LEAF · ${barkCollected?'CHARCOAL':'—'} · ${waterCollected?'WATER':'—'}</span>`;
}
function popup(message,location=false){const el=location?$('#location-toast'):$('#item-toast');if(location){$('#toast-name').textContent=message;}else $('#item-toast-text').textContent=message;el.classList.remove('hidden');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.add('hidden'),2400);}
function notify(message){const n=$('#notification');n.textContent=message;n.classList.remove('hidden');clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>n.classList.add('hidden'),2400);}
function interact(){if(!started)return;let nearest=null,dist=2.7;for(const h of herbs)if(phase==='gather'&&h.active){const d=Math.hypot(player.position.x-h.x,player.position.z-h.z);if(d<dist){dist=d;nearest={type:'herb',item:h};}}for(const s of stations){const d=Math.hypot(player.position.x-s.x,player.position.z-s.z);if(d<3.8&&d<dist){dist=d;nearest={type:s.id};}}
 if(!nearest)return;
 if(nearest.type==='herb'){
  if(phase!=='gather'){notify('The remaining silverleaf is not needed. Follow your current journal objective.');return;}
  nearest.item.active=false;nearest.item.group.visible=false;herbCount++;popup('Silverleaf gathered');
  if(herbCount>=4){phase='bark';$('#day-count').textContent='02';notify('Four sprigs secured. The healer also needs clean charcoal.');}
  updateQuest();return;
 }
 if(nearest.type==='charcoal'){
  if(phase==='bark'&&!barkCollected){barkCollected=true;phase='water';popup('Charcoal collected');notify('Now find Pilgrim’s Spring and fill the water skin.');updateQuest();}
  else if(!barkCollected)notify('The charcoal is too damp to gather until you have the silverleaf.');
  else notify('You have enough charcoal. Follow the trail to Pilgrim’s Spring.');return;
 }
 if(nearest.type==='spring'){
  if(phase==='water'&&!waterCollected){waterCollected=true;phase='healer';$('#day-count').textContent='03';popup('Spring water collected');notify('Ingredients ready. Return to the Hollowmere healer.');updateQuest();}
  else if(!waterCollected)notify('The healer’s water skin is not needed yet.');
  else notify('The water skin is full. Return to Hollowmere.');return;
 }
 if(nearest.type==='healer'){
  if(phase==='gather')notify('The healer needs four sprigs of silverleaf.');
  else if(phase==='bark')notify('The healer needs silverleaf and charcoal. Visit the old burner’s camp.');
  else if(phase==='water')notify('One final ingredient: pure water from Pilgrim’s Spring.');
  else if(phase==='healer'){phase='castle';updateQuest();popup('The healer shared her recipe');notify('Take the ingredients to Greywatch Castle.');}
  else if(phase==='deliver'){document.querySelector('#lands-count').textContent=String(Math.max(5,discovered.size));document.querySelector('#ending-stats span:last-child b').textContent=$('#day-count').textContent;$('#ending').classList.remove('hidden');}
  else notify('The healer is waiting for the remedy.');return;
 }
 if(nearest.type==='still'){
  if(phase==='castle'){phase='deliver';$('#day-count').textContent='04';updateQuest();popup('The remedy is brewed');notify('Carry the first dose back to Hollowmere.');}
  else notify('The still is cold. Ask the village healer for the recipe first.');
 }
}
function findNearby(){let best=null,dmin=3.1;for(const h of herbs)if(phase==='gather'&&h.active){const d=Math.hypot(player.position.x-h.x,player.position.z-h.z);if(d<dmin){dmin=d;best={text:'GATHER SILVERLEAF',d};}}for(const s of stations){const d=Math.hypot(player.position.x-s.x,player.position.z-s.z);if(d<4.2&&d<dmin){dmin=d;best={text:s.label};}}const inter=$('#interaction');if(started&&best){inter.classList.remove('hidden');$('#interaction-text').textContent=best.text;}else inter.classList.add('hidden');}
function discover(){const places=[['village',-19,-20,'Hollowmere Village'],['glade',-42,19,'Silverleaf Glade'],['camp',-64,-33,'Charcoal-burner’s Camp'],['spring',12,25,'Pilgrim’s Spring'],['castle',43,-67,'Greywatch Castle']];for(const [id,x,z,name] of places){if(!discovered.has(id)&&Math.hypot(player.position.x-x,player.position.z-z)<12){discovered.add(id);popup(name,true);}}}
function drawMap(){const w=minimap.width,h=minimap.height;ctx.clearRect(0,0,w,h);ctx.fillStyle='#28382b';ctx.fillRect(0,0,w,h);ctx.strokeStyle='rgba(200,191,157,.22)';ctx.lineWidth=1;for(let i=0;i<6;i++){ctx.beginPath();ctx.moveTo(i*w/5,0);ctx.lineTo(i*w/5,h);ctx.stroke();ctx.beginPath();ctx.moveTo(0,i*h/5);ctx.lineTo(w,i*h/5);ctx.stroke();}ctx.strokeStyle='#a9956c';ctx.lineWidth=2;ctx.setLineDash([4,3]);ctx.beginPath();ctx.moveTo(mapX(0),mapZ(0));for(const [x,z] of [[-19,-20],[-42,19],[-64,-33],[12,25],[43,-67]])ctx.lineTo(mapX(x),mapZ(z));ctx.stroke();ctx.setLineDash([]);for(const [x,z,c] of [[-19,-20,'#d7bd7f'],[-42,19,'#9cc17d'],[-64,-33,'#c39b70'],[12,25,'#83b7b2'],[43,-67,'#d58f78']]){ctx.beginPath();ctx.fillStyle=c;ctx.arc(mapX(x),mapZ(z),3.7,0,Math.PI*2);ctx.fill();}const target=objectivePoint();ctx.beginPath();ctx.strokeStyle='#f0dfae';ctx.lineWidth=1.5;ctx.arc(mapX(target.x),mapZ(target.z),6,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.fillStyle='#f0e2ba';ctx.shadowColor='#eed28b';ctx.shadowBlur=9;ctx.arc(mapX(player.position.x),mapZ(player.position.z),4,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#eee3c5';ctx.font='9px serif';ctx.fillText('N',w-13,12);}
function mapX(x){return (x+95)/190*minimap.width;}function mapZ(z){return (z+84)/168*minimap.height;}
// camera and player movement
function frame(){requestAnimationFrame(frame);const dt=Math.min(clock.getDelta(),.04),t=clock.elapsedTime;if(started){const forward=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0),side=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0);let mx=side,mz=-forward;const len=Math.hypot(mx,mz);if(len){mx/=len;mz/=len;const speed=(keys.ShiftLeft||keys.ShiftRight?9.5:5.7);const ca=Math.cos(cameraAngle),sa=Math.sin(cameraAngle);const wx=mx*ca+mz*sa,wz=-mx*sa+mz*ca;let nx=player.position.x+wx*speed*dt,nz=player.position.z+wz*speed*dt;if(Math.abs(nx)<119&&Math.abs(nz)<117){player.position.x=nx;player.position.z=nz;player.rotation.y=Math.atan2(wx,wz);}}
player.position.y=terrainHeight(player.position.x,player.position.z);player.position.y+=Math.sin(t*7)*.035*(len?1:0);camera.position.set(player.position.x+Math.sin(cameraAngle)*cameraDistance,player.position.y+6.3,player.position.z+Math.cos(cameraAngle)*cameraDistance);camera.lookAt(player.position.x,player.position.y+1.2,player.position.z-1.8);findNearby();discover();drawMap();}
for(const h of herbs)if(h.active){h.group.rotation.y=t*.35;h.group.position.y=terrainHeight(h.x,h.z)+.15+Math.sin(t*2+h.x)*.06;}for(const m of Object.values(markers)){m.beam.material.opacity=.13+Math.sin(t*2)*.07;m.halo.material.opacity=.42+Math.sin(t*2)*.2;}renderer.render(scene,camera);}
frame();
$('#begin-btn').addEventListener('click',()=>{started=true;title.classList.add('dismiss');revealHUD();updateQuest();camera.position.set(0,7,11);camera.lookAt(0,1,0);});
$('#restart-btn').addEventListener('click',()=>location.reload());$('#journal-toggle').addEventListener('click',()=>$('#notes-modal').classList.remove('hidden'));$('#close-notes').addEventListener('click',()=>$('#notes-modal').classList.add('hidden'));$('#notes-modal').addEventListener('click',e=>{if(e.target.id==='notes-modal')e.currentTarget.classList.add('hidden');});
$('#sound-btn').addEventListener('click',()=>{soundOn=!soundOn;$('#sound-label').textContent=soundOn?'SOUND ON':'SOUND OFF';});
addEventListener('keydown',e=>{keys[e.code]=true;if(e.code==='KeyE'){interact();}if(e.code==='Escape'){$('#notes-modal').classList.add('hidden');}});addEventListener('keyup',e=>keys[e.code]=false);addEventListener('blur',()=>Object.keys(keys).forEach(k=>keys[k]=false));
let pointerDown=false,lastX=0;canvas.addEventListener('pointerdown',e=>{pointerDown=true;lastX=e.clientX;canvas.setPointerCapture(e.pointerId);});canvas.addEventListener('pointermove',e=>{if(pointerDown&&started){cameraAngle-=(e.clientX-lastX)*.006;lastX=e.clientX;}});canvas.addEventListener('pointerup',()=>pointerDown=false);canvas.addEventListener('wheel',e=>{cameraDistance=THREE.MathUtils.clamp(cameraDistance+e.deltaY*.008,7,15);},{passive:true});
$('#touch-interact').addEventListener('click',interact);document.querySelectorAll('[data-move]').forEach(btn=>{const code={forward:'KeyW',back:'KeyS',left:'KeyA',right:'KeyD'}[btn.dataset.move];btn.addEventListener('pointerdown',e=>{e.preventDefault();keys[code]=true;btn.setPointerCapture(e.pointerId);});const stop=()=>keys[code]=false;btn.addEventListener('pointerup',stop);btn.addEventListener('pointercancel',stop);btn.addEventListener('lostpointercapture',stop);});
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);if(started&&innerWidth<760)$('#touch-controls').classList.remove('hidden');});
