import * as T from './vendor/three.module.js';
import {CanvasRenderer} from './canvas-renderer.js';
import {BUILD,clamp,distance,segmentBlocked,moveSafe,canLock,chargeTick,consumeCharge,canAuto,canSee,climbTick} from './core.js';
const $=id=>document.getElementById(id), canvas=$('world');
let renderer;
try{renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});}catch(e){
 try{renderer=new CanvasRenderer({canvas});}catch(err){$('fatal').hidden=false;$('fatal').textContent='Graphics are unavailable in this browser. Try current Chrome.';throw err;}
}
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;
const scene=new T.Scene();scene.background=new T.Color('#a9c7d7');scene.fog=new T.Fog('#adcad8',38,105);
const camera=new T.PerspectiveCamera(55,innerWidth/innerHeight,.12,180);scene.add(new T.HemisphereLight('#ddf5ff','#65727b',2.3));
const sun=new T.DirectionalLight('#fff0cf',3.1);sun.position.set(-20,38,20);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-34,right:34,top:34,bottom:-55,far:110});sun.shadow.bias=-.00035;scene.add(sun);sun.target.position.set(0,0,-13);scene.add(sun.target);
const colors={stone:'#dad5c3',trim:'#b69c64',navy:'#234560',blue:'#52dcca',dark:'#222e43',red:'#b95162',grass:'#477d70'};
const mat=(c,em=null)=>new T.MeshStandardMaterial({color:c,roughness:.82,metalness:.15,...em?{emissive:em,emissiveIntensity:1.2}:{}});
const mats={};for(const [k,v] of Object.entries(colors))mats[k]=mat(v);mats.glow=mat('#79ffef','#22a994');mats.white=mat('#e9e7dd');mats.skin=mat('#e6bd9d');mats.hair=mat('#e2e0d7');mats.enemy=mat('#58626c');mats.black=mat('#17232d');mats.violet=mat('#d778ab','#762a55');
const boxGeo=new T.BoxGeometry(1,1,1),sphereGeo=new T.SphereGeometry(1,10,8),coneGeo=new T.ConeGeometry(1,1,6),cylGeo=new T.CylinderGeometry(1,1,1,8);
function mesh(g,m,x,y,z,sx=1,sy=1,sz=1,parent=scene){const o=new T.Mesh(g,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
const box=(m,x,y,z,w,h,d,p)=>mesh(boxGeo,m,x,y,z,w,h,d,p);
const cylinder=(m,x,y,z,r,h,p)=>mesh(cylGeo,m,x,y,z,r,h,r,p);
function crystal(x,y,z,size=1,parent=scene,m=mats.glow){const a=mesh(new T.OctahedronGeometry(1,0),m,x,y,z,size*.4,size,size*.4,parent);return a;}
function lineBetween(a,b,color,parent=scene){const g=new T.BufferGeometry().setFromPoints([a,b]);const m=new T.LineBasicMaterial({color,transparent:true,opacity:.75});const l=new T.Line(g,m);parent.add(l);return l;}
const walls=[{x:-7,z:10,w:7,d:1.2,h:4},{x:-10,z:6,w:1.2,d:9,h:4},{x:7,z:1,w:7,d:1.2,h:4},{x:10,z:-3,w:1.2,d:9,h:4},{x:-5,z:-12,w:6,d:1.2,h:3.6}];
// Stylized castle courtyard; all geometry is local and reproducible.
box(mats.stone,0,-.35,-12,40,.7,76);
for(let z=-48;z<25;z+=3){box(mats.trim,0,.014,z,38,.024,.035);for(let x=-18;x<=18;x+=3)box(mats.trim,x,.016,z+1.5,.03,.02,3);}
for(const w of walls){box(mats.stone,w.x,w.h/2,w.z,w.w,w.h,w.d);box(mats.trim,w.x,w.h,w.z,w.w+.3,.25,w.d+.3);for(let y=1;y<w.h;y++)box(mats.trim,w.x,y,w.z,w.w+.01,.025,w.d+.01);}
function tower(x,z,h=12){cylinder(mats.stone,x,h/2,z,1.65,h);cylinder(mats.trim,x,h-.2,z,1.85,.4);mesh(coneGeo,mats.navy,x,h+1.7,z,2,3.5,2);for(let i=0;i<6;i++){const a=i*Math.PI/3;box(mats.stone,x+Math.sin(a)*1.6,h+.3,z+Math.cos(a)*1.6,.65,1,.65);}crystal(x,h+3.8,z,.55);}
for(const x of [-20,20]){box(mats.stone,x,2.7,-12,1.2,5.4,76);box(mats.trim,x,5.5,-12,1.5,.3,76);for(let z=-48;z<25;z+=3)box(mats.stone,x,6,z,1.5,1.2,1.5);for(let z=-43;z<24;z+=16)tower(x,z,12+(z%3));}
for(const x of [-12,12]){box(mats.stone,x,5,-49,16,10,2);tower(x,-48,16);}
box(mats.stone,0,10,-49,9,3,2);box(mats.trim,0,8.7,-49,9,.3,2.4);
for(let x=-3.5;x<=3.5;x+=1)box(mats.navy,x,4,-49,.13,8,.2);
for(const x of [-16,16])for(let z=-39;z<23;z+=10){box(mats.trim,x,.4,z,2.1,.8,2.1);box(mats.grass,x,.85,z,1.8,.2,1.8);cylinder(mats.stone,x,2,z,.25,2.5);crystal(x,3.6,z,.8);}
for(const x of [-19,19])for(let z=-39;z<25;z+=14){const flag=box(mats.navy,x*.965,4,z,.05,2.8,1.4);box(mats.trim,x*.965,5.5,z,.15,.12,1.65);crystal(x*.96,4,z,.18);}
// Distant silhouette architecture gives scale without expensive textures.
for(let i=0;i<22;i++){let a=i*2.4;const x=Math.sin(a)*53,z=-55+Math.cos(a)*25,h=14+(i%5)*4;box(mats.stone,x,h/2,z,3,h,3);mesh(coneGeo,mats.navy,x,h+3,z,2.7,6,2.7);}
// Instance repeated static castle pieces to reduce mobile draw calls.
const batches=new Map();for(const o of [...scene.children])if(o.isMesh){const k=o.geometry.uuid+o.material.uuid;if(!batches.has(k))batches.set(k,[]);batches.get(k).push(o);}
for(const group of batches.values())if(group.length>2){const inst=new T.InstancedMesh(group[0].geometry,group[0].material,group.length);group.forEach((o,i)=>{o.updateMatrix();inst.setMatrixAt(i,o.matrix);scene.remove(o);});inst.castShadow=true;inst.receiveShadow=true;scene.add(inst);}
function human(enemy=false){const g=new T.Group(),body=new T.Group();g.add(body);const armor=enemy?mats.enemy:mats.white;
 box(armor,0,1.25,0,.66,.8,.36,body);box(mats.trim,0,.92,0,.73,.15,.4,body);box(mats.navy,0,.7,0,.57,.25,.34,body);
 const head=new T.Group();head.position.y=1.9;body.add(head);mesh(sphereGeo,enemy?mats.dark:mats.skin,0,0,0,.23,.28,.22,head);
 if(enemy){mesh(coneGeo,mats.trim,0,.36,0,.12,.45,.12,head);box(mats.red,0,.01,-.2,.33,.055,.04,head);}else{mesh(sphereGeo,mats.hair,0,.12,.03,.27,.24,.25,head);for(let i=0;i<5;i++){const h=mesh(coneGeo,mats.hair,(i-2)*.085,.12,-.19,.12,.3,.13,head);h.rotation.z=(i-2)*-.25;h.rotation.x=Math.PI;}}
 const arms=[],legs=[];for(const side of [-1,1]){const arm=new T.Group();arm.position.set(side*.46,1.55,0);body.add(arm);box(mats.trim,0,0,0,.34,.3,.44,arm);box(armor,0,-.31,0,.24,.56,.26,arm);mesh(sphereGeo,mats.dark,0,-.63,0,.14,.15,.14,arm);arms.push(arm);const leg=new T.Group();leg.position.set(side*.2,.8,0);body.add(leg);box(armor,0,-.29,0,.26,.58,.3,leg);box(mats.dark,0,-.67,-.07,.3,.23,.47,leg);legs.push(leg);}
 const sword=new T.Group();arms[0].add(sword);sword.position.set(0,-.62,0);box(mats.trim,0,0,-.16,.46,.08,.12,sword);box(enemy?mats.white:mats.glow,0,0,-.8,.09,.05,1.3,sword);crystal(0,0,-1.46,.11,sword,enemy?mats.trim:mats.glow);
 const cape=box(enemy?mats.red:mats.navy,0,1.1,.29,.72,1.1,.055,body);cape.rotation.x=-.13;g.userData={arms,legs,cape,sword,body};return g;
}
const player={x:0,z:19,y:0,hp:100,stamina:100,mode:'normal',heading:Math.PI,inv:0};const hero=human();scene.add(hero);
const enemies=[];function addGuard(x,z,heading){const g=human(true);g.position.set(x,0,z);scene.add(g);const wedge=new T.Mesh(new T.CircleGeometry(7,24,-.60,1.2),new T.MeshBasicMaterial({color:'#ffce7b',transparent:true,opacity:.11,depthWrite:false,side:T.DoubleSide}));wedge.rotation.x=-Math.PI/2;wedge.position.y=.03;scene.add(wedge);const e={x,z,hp:100,homeX:x,homeZ:z,heading,root:g,wedge,alert:0,attackCd:0,phase:Math.random()*6,hit:0};enemies.push(e);return e;}
addGuard(-7,3,Math.PI);addGuard(4,-6,0);addGuard(-5,-18,Math.PI/2);addGuard(9,-19,-Math.PI/2);
function guardian(x,z,hostile){const g=new T.Group();scene.add(g);g.position.set(x,0,z);const body=new T.Group();g.add(body);const a=mats.stone;for(const s of [-1,1]){box(a,s*1.15,2,0,1.25,4,1.4,body);box(mats.trim,s*1.15,.55,-.55,1.6,1.1,2.3,body);box(a,s*2.6,5.8,0,1.2,3.8,1.5,body);mesh(sphereGeo,a,s*2.5,7.7,0,1.5,1.2,1.45,body);const pa=cylinder(mats.trim,s*2.5,7.75,-.35,1.2,.25,body);pa.rotation.x=Math.PI/2;crystal(s*2.5,7.8,-.6,.65,body,hostile?mats.violet:mats.glow);mesh(coneGeo,mats.trim,s*3.4,8.2,0,.4,1.9,.4,body).rotation.z=-s*1;}
 box(a,0,5.8,0,3.5,4,2.2,body);box(mats.trim,0,4.1,0,3.8,.5,2.35,body);const head=mesh(new T.IcosahedronGeometry(1,0),a,0,9,0,1.2,1.5,1.1,body);for(const s of [-1,1]){mesh(coneGeo,mats.trim,s*.9,10.2,0,.28,2,.35,body).rotation.z=-s*.4;box(hostile?mats.violet:mats.glow,s*.45,9.1,-.87,.35,.12,.2,body);}crystal(0,9.8,-.94,.35,body,hostile?mats.violet:mats.glow);
 // Visible ladder-like armor ridges on the back are the climbing route.
 for(let y=1.5;y<=9;y+=1.15){box(mats.trim,0,y,1.25,1.7,.13,.22,body);box(mats.grass,.6,y+.25,1.28,.12,.8,.12,body);}
 const halo=mesh(new T.TorusGeometry(1.5,.11,6,36),mats.trim,0,9.5,.65,1,1,1,body);
 const core=crystal(0,9.1,1.3,.65,body,hostile?mats.violet:mats.glow);
 const ring=mesh(new T.TorusGeometry(4,.045,4,64),hostile?mats.violet:mats.glow,x,.04,z);ring.rotation.x=Math.PI/2;
 return {x,z,root:g,body,core,halo,ring,hostile,hp:120,active:hostile,emerge:hostile?1:0};}
const ally=guardian(-9,-29,false),boss=guardian(7,-41,true);ally.root.visible=false;ally.ring.visible=false;
const stairs=[];for(let i=0;i<6;i++)box(mats.trim,0,.02,-43-i,6,.035,.7); // navigation markers, nonblocking
let started=false,paused=false,last=performance.now(),elapsed=0,yaw=0,pitch=.23,target=null,charge=0,combo=null,attackCd=0,auto=true,peek=false,climbing=null,climbAngle=0,noticeUntil=0,comboUntil=0,summonTime=0,coverWall=null;
let completed={cover:false,dash:false,summon:false,climb:false,boss:false},kills=0,won=false;
const input={mx:0,my:0,cx:0,cy:0},keys=new Set(),effects=[];
const dots=[];for(let i=0;i<6;i++){const d=document.createElement('span');d.className='dot';const a=(i*60-90)*Math.PI/180;d.style.left=(59+58*Math.cos(a))+'px';d.style.top=(59+58*Math.sin(a))+'px';$('dots').append(d);dots.push(d);}
function notify(msg,t=3){$('notice').textContent=msg;noticeUntil=elapsed+t;}
function puff(pos,color,n=12){for(let i=0;i<n;i++){const o=mesh(sphereGeo,mat(color),pos.x,pos.y,pos.z,.06,.06,.06);effects.push({o,life:.45,max:.45,v:new T.Vector3((Math.random()-.5)*6,Math.random()*5,(Math.random()-.5)*6),dispose:true});}}
function slash(pos,heading,big=false){const o=new T.Mesh(new T.TorusGeometry(big?1.8:1.3,.045,3,20,Math.PI*1.25),new T.MeshBasicMaterial({color:'#a6fff1',transparent:true,opacity:.9,side:T.DoubleSide}));o.position.set(pos.x,pos.y+1.3,pos.z);o.rotation.set(Math.PI/2+.4,heading,0);scene.add(o);effects.push({o,life:.24,max:.24});}
function damageEnemy(e,dmg){if(e.hp<=0)return;e.hp=Math.max(0,e.hp-dmg);e.hit=.2;e.alert=1;puff(new T.Vector3(e.x,1.1,e.z),'#adf9e4',8);if(e.hp<=0){kills++;e.root.visible=false;e.wedge.visible=false;if(target===e&&!combo){target=null;charge=0;}notify('Guard defeated · '+kills+'/4',1.5);}}
function hurt(dmg){if(player.inv>0||player.hp<=0)return;player.hp=Math.max(0,player.hp-dmg);player.inv=.7;puff(new T.Vector3(player.x,player.y+1,player.z),'#ed8585',5);if(player.hp===0){paused=true;$('pauseMenu').hidden=false;$('pauseTitle').textContent='Training interrupted';$('pauseText').textContent='Restart to try a different approach.';$('resume').hidden=true;}}
function getTarget(){const candidates=enemies.filter(e=>canLock(player,e,walls));candidates.sort((a,b)=>distance(player,a)-distance(player,b));if(!candidates.length){notify('No visible target. Move closer or leave cover.');return;}const at=candidates.indexOf(target);target=candidates[(at+1)%candidates.length];charge=0;notify('Keep target visible · each lit dot adds one dash hit',2.3);}
function nearCover(){return walls.map(w=>{const x=clamp(player.x,w.x-w.w/2,w.x+w.w/2),z=clamp(player.z,w.z-w.d/2,w.z+w.d/2);return {w,d:Math.hypot(player.x-x,player.z-z),x,z};}).sort((a,b)=>a.d-b.d)[0];}
function startClimb(){if(climbing){climbing=null;player.mode='normal';player.inv=.8;player.y=0;notify('Dropped to the ground');return;}const g=[ally,boss].filter(g=>g.active&&g.emerge>=1&&distance(player,g)<5.8&&g.hp>0).sort((a,b)=>distance(player,a)-distance(player,b))[0];if(!g){notify('Move to the back of a Guardian, then press Climb.');return;}if(player.stamina<15){notify('Rest to recover grip stamina.');return;}climbing=g;player.mode='climb';player.y=1;climbAngle=0;player.x=g.x;player.z=g.z+2;target=null;charge=0;notify('Push forward to climb · Attack the hostile red core at the top');}
function act(name){if(!started||paused)return;
 if(name==='lock'){if(!climbing)getTarget();}
 if(name==='crouch'&&!climbing&&!combo){player.mode=player.mode==='crouch'?'normal':'crouch';coverWall=null;}
 if(name==='cover'&&!climbing&&!combo){if(player.mode==='cover'){player.mode='normal';coverWall=null;peek=false;return;}const n=nearCover();if(n.d<1.4){player.mode='cover';coverWall=n.w;target=null;charge=0;completed.cover=true;notify('In cover · hold Peek to look around the corner');}else notify('Move next to a low castle wall to hug cover.');}
 if(name==='summon'){if(!ally.active){ally.active=true;ally.root.visible=true;ally.ring.visible=true;summonTime=elapsed;completed.summon=true;notify('Guardian summoned in the west courtyard · follow the cyan marker',4);}else{notify('Your Guardian waits in the west courtyard. Climb its back.');}}
 if(name==='climb'&&!combo)startClimb();
 if(name==='dodge'&&!climbing&&player.stamina>=18&&!combo){player.mode='normal';coverWall=null;player.stamina-=18;player.inv=.65;moveSafe(player,-Math.sin(yaw)*2.2,-Math.cos(yaw)*2.2,walls);}
 if(name==='attack'){
   if(climbing){if(climbing.hostile&&player.y>=8.3&&attackCd<=0){climbing.hp=Math.max(0,climbing.hp-30);attackCd=.6;slash(player,yaw,true);puff(new T.Vector3(climbing.x,9,climbing.z+1.3),'#f19ac7',18);if(climbing.hp===0){completed.boss=true;climbing.core.visible=false;notify('Colossus core disabled · training complete!',5);climbing=null;player.mode='normal';player.y=0;won=true;}}else if(climbing.hostile)notify('Climb higher to reach the glowing red core.');return;}
   if(combo||attackCd>0)return;
   if(target&&canLock(player,target,walls)&&consumeCharge(charge)>0&&player.mode==='normal'){
     combo={enemy:target,left:consumeCharge(charge),total:consumeCharge(charge),timer:0,hits:0};charge=0;return;
   }
   const e=enemies.find(e=>canAuto(player,e,walls,player.mode));if(e){damageEnemy(e,17);slash(player,player.heading);attackCd=.6;}else notify('Lock with T / LOCK. Light at least one dot, then Attack.');
 }
}
function updateMission(){const list=[['cover','Hug a castle corner','Approach a low wall and press COVER.'],['dash','Release a charged dash combo','LOCK a guard. Wait for dots, then ATTACK.'],['summon','Call your Guardian','Press SUMMON. It appears in the west court.'],['climb','Climb to your Guardian’s shoulder','Find the cyan ring · CLIMB · push forward.'],['boss','Climb the hostile colossus','Northeast court · attack its red core from the top.']];const current=list.find(([k])=>!completed[k]);$('objective').textContent=current?current[1]:'Training complete';$('progress').textContent=current?current[2]:'All five mechanics tested. Explore or restart from Pause.';}
function reset(){Object.assign(player,{x:0,z:19,y:0,hp:100,stamina:100,mode:'normal',heading:Math.PI,inv:0});for(const e of enemies){Object.assign(e,{x:e.homeX,z:e.homeZ,hp:100,alert:0,attackCd:0});e.root.visible=true;e.root.rotation.z=0;}ally.active=false;ally.emerge=0;ally.root.visible=false;ally.ring.visible=false;boss.hp=120;boss.core.visible=true;target=null;charge=0;combo=null;climbing=null;coverWall=null;peek=false;yaw=0;pitch=.23;kills=0;won=false;completed={cover:false,dash:false,summon:false,climb:false,boss:false};$('resume').hidden=false;$('pauseTitle').textContent='Take a breath.';$('pauseText').textContent='Your progress stays here while paused.';paused=false;$('pauseMenu').hidden=true;clearInput();updateMission();}
function setPause(value){if(!started||player.hp<=0)return;paused=value;$('pauseMenu').hidden=!value;clearInput();}
$('start').onclick=()=>{started=true;$('menu').hidden=true;$('hud').hidden=false;notify('Welcome to First Light · move with WASD or the left stick',4);};$('pause').onclick=()=>setPause(true);$('resume').onclick=()=>setPause(false);$('restart').onclick=reset;$('auto').onchange=e=>auto=e.target.checked;$('quality').onchange=e=>renderer.shadowMap.enabled=e.target.checked;
for(const b of document.querySelectorAll('[data-action]')){b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();b.setPointerCapture(e.pointerId);if(b.dataset.action==='peek'){if(player.mode==='cover')peek=true;}else act(b.dataset.action);});const end=()=>{if(b.dataset.action==='peek')peek=false;};b.addEventListener('pointerup',end);b.addEventListener('pointercancel',end);b.addEventListener('lostpointercapture',end);}
const keyActions={KeyT:'lock',Space:'attack',KeyC:'crouch',KeyE:'cover',KeyG:'summon',KeyF:'climb',ShiftLeft:'dodge',ShiftRight:'dodge'};
addEventListener('keydown',e=>{if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();if(e.code==='Escape'&&!e.repeat)setPause(!paused);if(!started||paused)return;keys.add(e.code);if(e.code==='KeyQ'&&player.mode==='cover')peek=true;if(!e.repeat&&keyActions[e.code])act(keyActions[e.code]);});addEventListener('keyup',e=>{keys.delete(e.code);if(e.code==='KeyQ')peek=false;});
let drag=null;canvas.addEventListener('pointerdown',e=>{if(started&&!paused){drag={id:e.pointerId,x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);}});canvas.addEventListener('pointermove',e=>{if(drag&&drag.id===e.pointerId){yaw-=(e.clientX-drag.x)*.006;pitch=clamp(pitch+(e.clientY-drag.y)*.004,-.15,.7);drag.x=e.clientX;drag.y=e.clientY;}});for(const evt of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(evt,()=>drag=null);
function stick(id,xkey,ykey){const el=$(id),knob=el.querySelector('.knob');let pointer=null;function update(e){const b=el.getBoundingClientRect(),r=b.width*.34,dx=e.clientX-(b.x+b.width/2),dy=e.clientY-(b.y+b.height/2),len=Math.hypot(dx,dy),s=len>r?r/len:1;input[xkey]=dx*s/r;input[ykey]=dy*s/r;knob.style.transform=`translate(${dx*s}px,${dy*s}px)`;}
 el.addEventListener('pointerdown',e=>{e.preventDefault();if(pointer!==null)return;pointer=e.pointerId;el.setPointerCapture(pointer);update(e);});el.addEventListener('pointermove',e=>{if(e.pointerId===pointer)update(e);});const end=e=>{if(pointer!==e.pointerId)return;pointer=null;input[xkey]=input[ykey]=0;knob.style.transform='';};for(const evt of ['pointerup','pointercancel','lostpointercapture'])el.addEventListener(evt,end);return ()=>{pointer=null;input[xkey]=input[ykey]=0;knob.style.transform='';};}
const clearSticks=[stick('moveStick','mx','my'),stick('cameraStick','cx','cy')];function clearInput(){keys.clear();Object.assign(input,{mx:0,my:0,cx:0,cy:0});peek=false;drag=null;clearSticks.forEach(f=>f());}addEventListener('blur',()=>{if(started)setPause(true);});document.addEventListener('visibilitychange',()=>{if(document.hidden&&started)setPause(true);});
function updateCombo(dt){if(!combo)return;const e=combo.enemy;if(e.hp<=0||segmentBlocked(player,e,walls,.35)){combo=null;target=null;charge=0;return;}combo.timer-=dt;if(combo.timer>0)return;const angle=combo.hits*Math.PI*.85;const dest={x:e.x+Math.sin(angle)*1.7,z:e.z+Math.cos(angle)*1.7};if(segmentBlocked(player,dest,walls,.42)){combo=null;notify('Dash blocked by cover');return;}const from=new T.Vector3(player.x,1.2,player.z);player.x=dest.x;player.z=dest.z;player.heading=Math.atan2(e.x-player.x,e.z-player.z);const trail=lineBetween(from,new T.Vector3(player.x,1.2,player.z),'#7cfff1');effects.push({o:trail,life:.6,max:.6});damageEnemy(e,13);slash(player,player.heading,true);combo.left--;combo.hits++;completed.dash=true;$('combo').textContent=combo.hits+' / '+combo.total+' HITS';comboUntil=elapsed+1.4;combo.timer=.18;player.inv=.25;if(combo.left===0||e.hp===0){combo=null;charge=0;attackCd=.6;}}
function updateGuards(dt){for(const e of enemies){if(e.hp<=0)continue;e.attackCd-=dt;e.hit=Math.max(0,e.hit-dt);const sight=player.y<2.5&&canSee(e,player,walls,player.mode==='crouch');e.alert=clamp(e.alert+(sight?dt*1.6:-dt*.25),0,1);let dx,dz;
 if(e.alert>.55&&player.y<2.5){dx=player.x-e.x;dz=player.z-e.z;e.heading=Math.atan2(dx,dz);const d=Math.hypot(dx,dz);if(d>1.8)moveSafe(e,dx/d*2.0*dt,dz/d*2.0*dt,walls,.45);else if(e.attackCd<=0){hurt(9);e.attackCd=1.4;}}
 else{const tx=e.homeX+Math.sin(elapsed*.4+e.phase)*2.4,tz=e.homeZ+Math.cos(elapsed*.4+e.phase)*2.4;dx=tx-e.x;dz=tz-e.z;e.heading=Math.atan2(dx,dz);const d=Math.hypot(dx,dz);if(d>.2)moveSafe(e,dx/d*.9*dt,dz/d*.9*dt,walls,.45);}
 e.root.position.set(e.x,0,e.z);e.root.rotation.y=e.heading+Math.PI;e.root.rotation.z=e.hit>0?.12:0;const u=e.root.userData;u.legs[0].rotation.x=Math.sin(elapsed*7+e.phase)*.3;u.legs[1].rotation.x=-u.legs[0].rotation.x;
 e.wedge.visible=e.alert<.8;e.wedge.position.set(e.x,.035,e.z);e.wedge.rotation.z=-Math.PI/2+e.heading;
 }}
function updateClimb(dt,mx,my){const g=climbing;climbAngle=clamp(climbAngle+mx*dt*.55,-.65,.65);const c=climbTick(player.y,player.stamina,-my,dt,9);player.y=c.height;player.stamina=c.stamina;player.x=g.x+Math.sin(climbAngle)*1.8;player.z=g.z+Math.cos(climbAngle)*1.65;player.heading=Math.PI+climbAngle;
 if(player.y>=8.7&&!g.hostile){completed.climb=true;player.stamina=clamp(player.stamina+dt*25,0,100);}
 if(player.stamina<=0){climbing=null;player.mode='normal';player.y=0;hurt(15);notify('Grip exhausted · rest before climbing again');}
 }
const desired=new T.Vector3(),look=new T.Vector3(),temp=new T.Vector3();let initializedCamera=false;
function updateCamera(dt){const py=started?player.y:0,px=started?player.x:4,pz=started?player.z:14;const dist=climbing?6.5:6.2;look.set(px,py+1.5,pz);if(player.mode==='cover'&&peek){look.x+=Math.cos(yaw)*1.7;look.z-=Math.sin(yaw)*1.7;}
 desired.set(look.x+Math.sin(yaw)*dist,py+2.9+pitch*5,look.z+Math.cos(yaw)*dist);
 // Keep the camera on the player's side of opaque cover.
 if(!climbing){for(let t=.12;t<=1;t+=.04){const p={x:look.x+(desired.x-look.x)*t,z:look.z+(desired.z-look.z)*t},yy=look.y+(desired.y-look.y)*t;if(walls.some(w=>yy<w.h+.3&&Math.abs(p.x-w.x)<w.w/2+.3&&Math.abs(p.z-w.z)<w.d/2+.3)){const q=Math.max(.14,t-.08);desired.lerpVectors(look,desired,q);break;}}}
 if(!initializedCamera){camera.position.copy(desired);initializedCamera=true;}else camera.position.lerp(desired,1-Math.exp(-dt*11));camera.lookAt(look);}
function updateHud(){const alerted=enemies.some(e=>e.hp>0&&e.alert>.55);$('mode').textContent=climbing?(climbing.hostile?'COLOSSUS CLIMB':'GUARDIAN CLIMB'):player.mode==='cover'?(peek?'PEEKING':'IN COVER'):alerted?'DETECTED':player.mode==='crouch'?'SNEAKING':'CASTLE APPROACH';$('hp').value=player.hp;$('stamina').value=player.stamina;$('climbLabel').textContent=climbing?'DROP':'CLIMB';
 for(const name of ['cover','crouch'])document.querySelector(`[data-action="${name}"]`).classList.toggle('active',player.mode===name);$('peek').classList.toggle('active',peek);document.querySelector('[data-action="lock"]').classList.toggle('active',!!target);
 if(target&&target.hp>0){temp.set(target.x,1.4,target.z).project(camera);const onscreen=temp.z<1&&temp.z>-1&&Math.abs(temp.x)<1.2&&Math.abs(temp.y)<1.2;$('target').hidden=!onscreen;$('target').style.left=((temp.x*.5+.5)*innerWidth)+'px';$('target').style.top=((-temp.y*.5+.5)*innerHeight)+'px';$('targetName').textContent='Royal sentry';$('chargeText').textContent=consumeCharge(charge)+' / 6 · '+(charge>=6?'DASH READY':'CHARGING');$('enemyHp').value=target.hp;dots.forEach((d,i)=>d.classList.toggle('lit',i<consumeCharge(charge)));}else $('target').hidden=true;
 let hint='';if(climbing)hint=climbing.hostile?(player.y>=8.3?'ATTACK · strike the exposed red core':'Push forward to climb · watch GRIP'):(player.y>=8.7?'Shoulder reached · rest here or press DROP':'Push forward to climb the armor ridges');else if(player.mode==='cover')hint='Hold PEEK · move along wall · COVER to leave';else if([ally,boss].some(g=>g.active&&g.hp>0&&distance(player,g)<5.8))hint='CLIMB / F · grip the Guardian’s armor';else if(nearCover().d<1.4)hint='COVER / E · hug this wall';$('context').textContent=hint;updateMission();if(elapsed>noticeUntil)$('notice').textContent='';if(elapsed>comboUntil)$('combo').textContent='';
 const ctx=$('map').getContext('2d');ctx.clearRect(0,0,150,150);ctx.save();ctx.translate(75,75);ctx.scale(1.6,1.6);ctx.fillStyle='#a5baaf55';for(const w of walls)ctx.fillRect(w.x-w.w/2,(w.z-player.z)*.65-w.d/2,w.w,w.d);const dot=(x,z,color,r)=>{ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,(z-player.z)*.65,r,0,Math.PI*2);ctx.fill();};enemies.filter(e=>e.hp>0).forEach(e=>dot(e.x,e.z,e.alert>.55?'#ff7b70':'#e7b292',1.8));if(ally.active)dot(ally.x,ally.z,'#7df5d8',3);if(boss.hp>0)dot(boss.x,boss.z,'#ed8ed2',3);ctx.translate(player.x,0);ctx.rotate(-yaw);ctx.fillStyle='#a4fff6';ctx.beginPath();ctx.moveTo(0,-4);ctx.lineTo(-3,3);ctx.lineTo(3,3);ctx.fill();ctx.restore();}
function frame(now){requestAnimationFrame(frame);const dt=Math.min((now-last)/1000,.04);last=now;if(!paused){elapsed+=dt;if(started){
 let mx=input.mx+(keys.has('KeyD')?1:0)-(keys.has('KeyA')?1:0),my=input.my+(keys.has('KeyS')?1:0)-(keys.has('KeyW')?1:0);const len=Math.hypot(mx,my);if(len>1){mx/=len;my/=len;}
 yaw-=input.cx*dt*2.1+(keys.has('ArrowRight')?dt*1.7:0)-(keys.has('ArrowLeft')?dt*1.7:0);pitch=clamp(pitch+input.cy*dt*.8+(keys.has('ArrowDown')?dt*.7:0)-(keys.has('ArrowUp')?dt*.7:0),-.15,.7);
 player.inv=Math.max(0,player.inv-dt);attackCd-=dt;
 if(climbing)updateClimb(dt,mx,my);else if(!combo){let dx=mx*Math.cos(yaw)+my*Math.sin(yaw),dz=-mx*Math.sin(yaw)+my*Math.cos(yaw);let speed=player.mode==='crouch'?2.2:player.mode==='cover'?1.5:4.6;
 if(player.mode==='cover'&&coverWall){if(coverWall.w>coverWall.d)dz=0;else dx=0;if(nearCover().d>1.5){player.mode='normal';coverWall=null;peek=false;}}
 moveSafe(player,dx*speed*dt,dz*speed*dt,walls);if(Math.hypot(dx,dz)>.05)player.heading=Math.atan2(dx,dz);player.stamina=clamp(player.stamina+dt*10,0,100);
 // Guardian feet are solid outside climbing mode.
 for(const g of [ally,boss])if(g.active&&g.emerge>=1){let d=distance(player,g);if(d<1.5){player.x=g.x+(player.x-g.x)/(d||1)*1.5;player.z=g.z+(player.z-g.z)/(d||1)*1.5;}}
 }
 if(target&&!combo){if(canLock(player,target,walls)&&player.mode==='normal')charge=chargeTick(charge,dt,true);else{charge=0;if(!canLock(player,target,walls))target=null;}}
 updateCombo(dt);
 if(auto&&!combo&&attackCd<=0&&!climbing){const e=enemies.find(e=>canAuto(player,e,walls,player.mode));if(e){damageEnemy(e,17);slash(player,player.heading);attackCd=.65;}}
 updateGuards(dt);
 if(ally.active){ally.emerge=clamp((elapsed-summonTime)/2.5,0,1);ally.root.position.y=-11*(1-ally.emerge);ally.ring.rotation.z+=dt*.4;}
 if(boss.hp>0){boss.body.rotation.z=Math.sin(elapsed*.55)*.025;if(climbing===boss&&Math.sin(elapsed*1.5)>.96)player.stamina=Math.max(0,player.stamina-dt*12);}
 hero.position.set(player.x,player.y,player.z);hero.rotation.y=player.heading+Math.PI;const u=hero.userData;const moving=len>.08&&!combo;
 if(climbing){u.arms[0].rotation.x=-2.4+Math.sin(elapsed*6)*.15;u.arms[1].rotation.x=-2.7-Math.sin(elapsed*6)*.15;u.legs[0].rotation.x=.7+Math.sin(elapsed*6)*.2;u.legs[1].rotation.x=.7-Math.sin(elapsed*6)*.2;u.sword.visible=false;}
 else{u.sword.visible=player.mode==='normal';u.arms[0].rotation.x=attackCd>.25?-1.5:Math.sin(elapsed*10)*.4*(moving?1:0);u.arms[1].rotation.x=-Math.sin(elapsed*10)*.4*(moving?1:0);u.legs[0].rotation.x=Math.sin(elapsed*10)*.65*(moving?1:0);u.legs[1].rotation.x=-u.legs[0].rotation.x;}
 u.body.position.y=player.mode==='crouch'?-.35:0;u.cape.rotation.x=-.15-(moving?.3:0)+Math.sin(elapsed*3)*.05;hero.visible=player.inv<=0||Math.floor(elapsed*14)%2===0;
 }
 for(let i=effects.length-1;i>=0;i--){const f=effects[i];f.life-=dt;if(f.v){f.o.position.addScaledVector(f.v,dt);f.v.y-=dt*9;}if(f.o.material.opacity!==undefined){f.o.material.transparent=true;f.o.material.opacity=f.life/f.max;}if(f.life<=0){scene.remove(f.o);if(!f.dispose)f.o.geometry.dispose();f.o.material.dispose();effects.splice(i,1);}}
 }
 updateCamera(dt);if(started)updateHud();renderer.render(scene,camera);}
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);clearInput();});
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();setPause(true);$('fatal').hidden=false;$('fatal').textContent='Graphics context was interrupted. Reload this page to restart the playtest.';});
if(renderer.software){$('quality').checked=false;$('quality').disabled=true;document.querySelector('.buildnote').innerHTML+=' <br>Reduced-detail compatibility renderer active.';}
$('start').disabled=false;$('start').textContent='Enter the courtyard →';updateMission();requestAnimationFrame(frame);
// Read-only state enables reproducible browser QA; mutation hooks exist only with ?test=1.
window.originLink={build:BUILD,renderer:renderer.software?'canvas':'webgl',state:()=>({player:{...player},target:target?enemies.indexOf(target):null,charge,combo:combo?{left:combo.left,total:combo.total}:null,kills,completed:{...completed},climbing:climbing?(climbing.hostile?'hostile':'ally'):null,bossHp:boss.hp,paused,started,allyActive:ally.active,enemies:enemies.map(e=>({x:e.x,z:e.z,hp:e.hp,alert:e.alert})),drawCalls:renderer.info.render.calls})};
if(new URLSearchParams(location.search).get('test')==='1')window.originLink.test={act,reset,place:(x,z,y=0)=>Object.assign(player,{x,z,y}),health:n=>player.hp=n,charge:n=>charge=n,freezeGuards:()=>{for(const e of enemies){e.homeX=e.x;e.homeZ=e.z;}},setEnemy:(i,props)=>Object.assign(enemies[i],props),setPlayer:p=>Object.assign(player,p),setClimbHeight:h=>player.y=h,setTime:t=>elapsed=t};
