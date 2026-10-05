import {grid} from './kernel.mjs';
const $=id=>document.getElementById(id);
const options=()=>({kind:$('kind').value,amplitude:+$('amplitude').value,blend:+$('blend').value,offset:+$('offset').value});
function render(canvas,opts,mode='slope'){
  const box=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio,2);canvas.width=Math.round(box.width*dpr);canvas.height=Math.round(box.height*dpr);
  const ctx=canvas.getContext('2d');ctx.scale(dpr,dpr);const w=box.width,h=box.height,scale=Math.min(w/11,h/7.5);
  const project=([x,y,z])=>[w*.5+(x-y)*scale*.82,h*.55+(x+y)*scale*.3-z*scale];
  const g=grid(opts,24);ctx.clearRect(0,0,w,h);
  for(let i=0;i<24;i++)for(let j=0;j<24;j++){
    const cells=[g[i][j],g[i+1][j],g[i+1][j+1],g[i][j+1]],points=cells.map(s=>project(s.point)),s=cells.reduce((n,c)=>n+c.slope,0)/4;
    ctx.beginPath();points.forEach(([x,y],k)=>k?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();
    ctx.fillStyle=mode==='grid'?'#e5edda':`hsl(${Math.max(32,155-s*85)},${25+s*10}%,${75-s*18}%)`;ctx.fill();ctx.strokeStyle='rgba(43,61,47,.32)';ctx.lineWidth=.55;ctx.stroke();
    if(mode==='direction'&&i%3===0&&j%3===0){const c=cells[0],a=project(c.point),b=project([c.point[0]+c.direction[0]*.35,c.point[1]+c.direction[1]*.35,c.point[2]]),angle=Math.atan2(b[1]-a[1],b[0]-a[0]);ctx.strokeStyle='#263c2d';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.lineTo(b[0]-5*Math.cos(angle-.5),b[1]-5*Math.sin(angle-.5));ctx.moveTo(...b);ctx.lineTo(b[0]-5*Math.cos(angle+.5),b[1]-5*Math.sin(angle+.5));ctx.stroke();}
  }
}
function update(){const opts=options();for(const id of ['amplitude','blend','offset'])$(id+'-value').value=(+$ (id).value).toFixed(2);render($('study'),opts,$('display').value);$('status').textContent=`${opts.kind} / 576 cells`}
for(const id of ['kind','amplitude','blend','offset','display'])$(id).addEventListener('input',update);
$('reset').addEventListener('click',()=>{for(const [id,value] of Object.entries({kind:'wave',amplitude:1,blend:.5,offset:0,display:'slope'}))$(id).value=value;update()});
$('save').addEventListener('click',()=>{const a=document.createElement('a');a.download='STACK-educational-approximate-preview.png';a.href=$('study').toDataURL('image/png');a.click()});
new ResizeObserver(()=>{update();render($('hero-canvas'),{kind:'wave',amplitude:1.4,offset:.1})}).observe($('study'));
fetch('comparison.json').then(r=>{if(!r.ok)throw Error('Comparison unavailable');return r.json()}).then(policy=>{
  const table=document.createElement('table');table.innerHTML='<caption class="small">Feature, functionality and access comparison</caption><thead><tr><th scope="col">Capability</th><th scope="col">Production staging</th><th scope="col">Education</th></tr></thead><tbody></tbody>';
  for(const row of policy.features){const tr=document.createElement('tr');row.forEach((value,i)=>{const cell=document.createElement(i?'td':'th');if(!i)cell.scope='row';cell.textContent=value;tr.append(cell)});table.tBodies[0].append(tr)}$('comparison').append(table);
}).catch(()=>{$('comparison').textContent='The comparison could not load. Please reload the page.'});
update();
