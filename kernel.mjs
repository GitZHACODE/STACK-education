// Independent educational mathematics. No production imports or solver payloads.
export function height(x,y,kind='wave',amplitude=1){
  if(kind==='saddle')return amplitude*(x*x-y*y)*.15;
  if(kind==='dome')return amplitude*Math.exp(-(x*x+y*y)*.22);
  return amplitude*Math.sin(x)*Math.cos(y*.8)*.55;
}
export function sample(x,y,{kind='wave',amplitude=1,blend=.5,offset=0}={}){
  const h=.001,z=height(x,y,kind,amplitude);
  const dx=(height(x+h,y,kind,amplitude)-height(x-h,y,kind,amplitude))/(2*h);
  const dy=(height(x,y+h,kind,amplitude)-height(x,y-h,kind,amplitude))/(2*h);
  const n=Math.hypot(dx,dy,1),angle=blend*Math.PI/2;
  return {point:[x-offset*dx/n,y-offset*dy/n,z+offset/n],normal:[-dx/n,-dy/n,1/n],slope:Math.hypot(dx,dy),direction:[Math.cos(angle),Math.sin(angle)]};
}
export function grid(options={},resolution=24){
  if(!Number.isInteger(resolution)||resolution<2||resolution>80)throw Error('Resolution must be 2–80');
  return Array.from({length:resolution+1},(_,i)=>Array.from({length:resolution+1},(_,j)=>sample(-3+6*i/resolution,-3+6*j/resolution,options)));
}
