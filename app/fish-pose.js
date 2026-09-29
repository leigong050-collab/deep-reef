export function fishPose(f){
 return {scaleX:f.size*16,scaleY:f.size*16,yaw:f.heading,roll:Math.sin(f.heading*2)*.16,phase:f.tailPhase};
}
