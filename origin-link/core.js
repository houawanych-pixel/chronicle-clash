// Engine-independent gameplay rules. Distances are world meters.
export const BUILD='OL-001.20261011';
export const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
export function segmentBlocked(a,b,walls,pad=0){
  return walls.some(w=>{
    let lo=0,hi=1;
    for(const k of ['x','z']){
      const half=(k==='x'?w.w:w.d)/2+pad, mn=w[k]-half,mx=w[k]+half,d=b[k]-a[k];
      if(Math.abs(d)<1e-9){if(a[k]<mn||a[k]>mx)return false;}
      else {let t1=(mn-a[k])/d,t2=(mx-a[k])/d;if(t1>t2)[t1,t2]=[t2,t1];lo=Math.max(lo,t1);hi=Math.min(hi,t2);if(lo>hi)return false;}
    }
    return true;
  });
}
export function moveSafe(p,dx,dz,walls,r=.42){
  let next={x:clamp(p.x+dx,-18,18),z:p.z};
  if(!segmentBlocked(p,next,walls,r))p.x=next.x;
  next={x:p.x,z:clamp(p.z+dz,-48,23)};
  if(!segmentBlocked(p,next,walls,r))p.z=next.z;
  return p;
}
export function canLock(p,e,walls){const d=distance(p,e);return e.hp>0&&d<=23&&!segmentBlocked(p,e,walls,.08);}
export function chargeTick(value,dt,valid){return valid?clamp(value+dt/0.55,0,6):0;}
export function consumeCharge(value){return Math.floor(clamp(value,0,6));}
export function canAuto(p,e,walls,mode){return !['cover','climb','crouch'].includes(mode)&&e.hp>0&&distance(p,e)<=2.65&&!segmentBlocked(p,e,walls,.1);}
export function canSee(e,p,walls,crouch){
  const d=distance(e,p);if(d>(crouch?7:13))return false;
  const a=Math.atan2(p.x-e.x,p.z-e.z),delta=Math.atan2(Math.sin(a-e.heading),Math.cos(a-e.heading));
  return (d<2||Math.abs(delta)<.60)&&!segmentBlocked(e,p,walls,.1);
}
export function climbTick(height,stamina,input,dt,maxHeight){
  const moving=Math.abs(input)>.1;return {height:clamp(height+input*2.3*dt,.7,maxHeight),stamina:clamp(stamina-dt*(moving?8:2),0,100)};
}
