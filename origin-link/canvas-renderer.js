// Reduced-detail renderer for devices where WebGL is unavailable.
// Uses the same 3D scene, camera and gameplay; no remote service or plugin.
import * as T from './vendor/three.module.js';
export class CanvasRenderer {
 constructor({canvas}){this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false});if(!this.ctx)throw Error('Canvas unavailable');this.shadowMap={enabled:false};this.info={render:{calls:0}};this.cache=new WeakMap();this.pixelRatio=1;this.software=true;this.light=new T.Vector3(-.4,.8,.5).normalize();}
 setPixelRatio(r){this.pixelRatio=Math.min(r,1);}
 setSize(w,h){this.width=w;this.height=h;this.canvas.width=w*this.pixelRatio;this.canvas.height=h*this.pixelRatio;}
 data(g){if(this.cache.has(g))return this.cache.get(g);const p=g.attributes.position,idx=g.index;const vs=[];for(let i=0;i<p.count;i++)vs.push(new T.Vector3(p.getX(i),p.getY(i),p.getZ(i)));const tris=[];for(let i=0;i<(idx?idx.count:p.count);i+=3)tris.push(idx?[idx.getX(i),idx.getX(i+1),idx.getX(i+2)]:[i,i+1,i+2]);const d={vs,tris};this.cache.set(g,d);return d;}
 render(scene,camera){const ctx=this.ctx,W=this.canvas.width,H=this.canvas.height;scene.updateMatrixWorld();camera.updateMatrixWorld();camera.matrixWorldInverse.copy(camera.matrixWorld).invert();ctx.fillStyle=scene.background.getStyle();ctx.fillRect(0,0,W,H);const faces=[],vp=new T.Matrix4().multiplyMatrices(camera.matrixWorldInverse,new T.Matrix4());const focal=H/2/Math.tan(camera.fov*Math.PI/360);let calls=0;
 const draw=(o,world)=>{const geom=this.data(o.geometry),view=new T.Matrix4().multiplyMatrices(camera.matrixWorldInverse,world);const ps=geom.vs.map(v=>v.clone().applyMatrix4(view));const nm=new T.Matrix3().getNormalMatrix(world);const material=Array.isArray(o.material)?o.material[0]:o.material;if(!material||material.opacity<.025)return;calls++;const base=material.color||new T.Color('white');const normal=new T.Vector3(),ab=new T.Vector3(),ac=new T.Vector3();
 for(const t of geom.tris){let polygon=t.map(i=>ps[i]);if(polygon.every(v=>v.z>-camera.near)||polygon.every(v=>v.z<-110))continue;
 // Clip against near plane so ground and walls remain stable behind camera.
 const out=[];for(let i=0;i<polygon.length;i++){const a=polygon[i],b=polygon[(i+1)%polygon.length],ina=a.z<=-.15,inb=b.z<=-.15;if(ina)out.push(a);if(ina!==inb){const u=(-.15-a.z)/(b.z-a.z);out.push(a.clone().lerp(b,u));}}polygon=out;if(polygon.length<3)continue;
 const pts=polygon.map(v=>[W/2+v.x*focal/-v.z,H/2-v.y*focal/-v.z]);if(pts.every(p=>p[0]<0)||pts.every(p=>p[0]>W)||pts.every(p=>p[1]<0)||pts.every(p=>p[1]>H))continue;
 const area=(pts[1][0]-pts[0][0])*(pts[2][1]-pts[0][1])-(pts[1][1]-pts[0][1])*(pts[2][0]-pts[0][0]);if(area>=0&&material.side!==T.DoubleSide)continue;
 ab.subVectors(geom.vs[t[1]],geom.vs[t[0]]);ac.subVectors(geom.vs[t[2]],geom.vs[t[0]]);normal.crossVectors(ab,ac).normalize().applyMatrix3(nm).normalize();let light=material.isMeshBasicMaterial?1:.6+Math.max(0,normal.dot(this.light))*.4;const col=base.clone().multiplyScalar(light);const z=polygon.reduce((s,p)=>s-p.z,0)/polygon.length;const fog=clamp((z-35)/75,0,.8);col.lerp(scene.background,fog);faces.push({pts,z,color:col.getStyle(),alpha:material.opacity??1});}
 };
 scene.traverseVisible(o=>{if(!o.isMesh)return;if(o.isInstancedMesh){const m=new T.Matrix4(),w=new T.Matrix4();for(let i=0;i<o.count;i++){o.getMatrixAt(i,m);w.multiplyMatrices(o.matrixWorld,m);draw(o,w);}}else draw(o,o.matrixWorld);});
 faces.sort((a,b)=>b.z-a.z);for(const f of faces){ctx.globalAlpha=f.alpha;ctx.fillStyle=f.color;ctx.beginPath();ctx.moveTo(...f.pts[0]);for(let i=1;i<f.pts.length;i++)ctx.lineTo(...f.pts[i]);ctx.closePath();ctx.fill();}ctx.globalAlpha=1;this.info.render.calls=calls;
 }
}
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
