// Independent educational drawings. No production ordering, contact, fitting,
// robot kinematics, calibrated cell assets or toolpath generation.
export const presets=[
 {id:'canopy',name:'Wave canopy',use:'A roof over a public square',color:156},
 {id:'vault',name:'Market vault',use:'An arched hall made of curved strips',color:34},
 {id:'saddle',name:'Saddle pavilion',use:'A light roof lifted at opposite corners',color:278},
 {id:'facade',name:'Ripple facade',use:'A textured screen for an urban building',color:205},
 {id:'atrium',name:'Atrium bowl',use:'A shallow shell around a central opening',color:15},
 {id:'ribbon',name:'Ribbon arcade',use:'A winding sequence of covered spaces',color:324}
];
export const topics={
 stack:{name:'Stackability',tag:'WP2 / GEOMETRY AND PACKING',title:'One building. Two arrangements.',copy:'The coloured parts form a roof, then gather into an orderly stack. In STACK research, geometry helps determine which parts can share a compact volume. Here each piece follows a preset animation so you can see the idea.',limit:'Preset arrangement only. No ordering, contact, clearance or packing optimisation.'},
 fields:{name:'Fields',tag:'WP6 / INTERACTIVE DESIGN',title:'Give every point a direction.',copy:'A field is a map of values or directions across a surface. Colour can reveal changing shape; flowing lines suggest how parts might be oriented. Blend a swirling pattern with a straight pattern and watch the drawing change.',limit:'Decorative analytical patterns, not structural stress or the research stacking field.'},
 segments:{name:'Segmentation',tag:'WP6 / PARTS AND MESHES',title:'A whole surface becomes many parts.',copy:'See a continuous architectural shell divided into coloured strips. Open the gaps to follow each piece. Research layouts can follow fields; this learning study uses a regular preset grid.',limit:'Regular parametric subdivision; no field-guided production segmentation.'},
 design:{name:'Stack design',tag:'DESIGN LIBRARY / ARCHITECTURAL USE',title:'Change the shape. Keep both views.',copy:'Try a canopy, vault, facade or pavilion. The building and the stack share the same coloured pieces. Curvature changes the synthetic shape; the paired drawings make the relationship easy to read.',limit:'Schematic pieces and preset stack positions; no fabrication or capacity decisions.'},
 elastica:{name:'Elastica',tag:'ELASTIC TOOLS / CURVES AND SURFACES',title:'A moving curve leaves a surface.',copy:'Imagine a flexible cutter held at its two ends. As the ends move together, the curve sweeps through space. The coloured lines record its successive positions and reveal a ribbon-like surface.',limit:'An animated sine curve, not an elastic equilibrium, inverse fit or calibrated cutter.'},
 robots:{name:'Robotics',tag:'WP5 / COLLABORATIVE ROBOTICS',title:'Two arms. One shared cutter.',copy:'Two schematic robots guide the ends of a curved cutter across a blank. Follow the moving line and the coloured layers it reveals. Pause or scrub the motion to explore the choreography.',limit:'Illustrative choreography only. No robot IK, reach checks, cutting simulation or machine commands.'},
 thickness:{name:'Thickness and moulds',tag:'PART ATTRIBUTES / OFFSETS',title:'Make room between neighbouring faces.',copy:'A curved part has an upper and lower face. Explode the sample to see those faces and their edges. A matching mould is another way to make the same geometry. Research uses more precise relationships between neighbours.',limit:'Schematic vertical thickness; no inherited-thickness solver, mould design or material calculation.'}
};
export function point(u,v,id,curvature=1){
 let x=u*3.2,y=v*2.4,z=0;
 if(id==='vault')z=1.7*Math.cos(u*Math.PI/2);
 else if(id==='saddle')z=.8*(u*u-v*v);
 else if(id==='facade'){z=.3*Math.sin(u*8)+.12*Math.cos(v*7);return [x,z*curvature,v*2+1.8];}
 else if(id==='atrium')z=.9*(u*u+v*v);
 else if(id==='ribbon'){y=v*.9+.7*Math.sin(u*3);z=.65*Math.cos(u*3)+.22*v;}
 else z=.6*Math.sin(u*3.5)*Math.cos(v*2);
 return [x,y,z*curvature+1.2];
}
const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
export function draw(canvas,state,mini=false){
 const box=canvas.getBoundingClientRect();if(!box.width||!box.height)return;
 const dpr=Math.min(globalThis.devicePixelRatio||1,2),w=box.width,h=box.height;
 if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}
 const c=canvas.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,w,h);
 const {preset='canopy',topic='stack',curvature=1,amount=.45,blend=.5,phase=.3,turn=.35,view,segmentation='all'}=state;
 const hue=presets.find(p=>p.id===preset)?.color||156,angle=turn,scale=Math.min(w/(mini||view?9:14),h/8.3);
 const project=([x,y,z])=>{const a=x*Math.cos(angle)-y*Math.sin(angle),b=x*Math.sin(angle)+y*Math.cos(angle);return [w*.5+(a-b*.45)*scale,h*.64+(b*.36-a*.08)*scale-z*scale*.74];};
 const line=(points,color,width=1)=>{c.beginPath();points.map(project).forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.strokeStyle=color;c.lineWidth=width;c.stroke();};
 const poly=(points,color,stroke='rgba(28,40,38,.24)')=>{c.beginPath();points.map(project).forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();c.fillStyle=color;c.fill();c.strokeStyle=stroke;c.lineWidth=.6;c.stroke();};
 const label=(text,xyz,color='#59675f')=>{const p=project(xyz);c.font=mini?'9px Arial':'11px Arial';c.fillStyle=color;c.fillText(text,...p);};
 // Floor grid provides scale cues without claiming real units.
 if(!mini)for(let i=-6;i<=6;i++){line([[i,-4,0],[i,4,0]],'#d7ddd4',.55);line([[-6,i*.65,0],[6,i*.65,0]],'#d7ddd4',.55);}
 const shell=(offset=[0,0,0],stack=false)=>{
  const panels=[];const nx=8,ny=4;
  for(let i=0;i<nx;i++)for(let j=0;j<ny;j++){
   if(preset==='atrium'&&(i===3||i===4)&&(j===1||j===2))continue;
   const u=-1+2*i/nx,v=-1+2*j/ny,gap=topic==='segments'?amount*.075:.012;
   const coords=[[u+gap,v+gap],[u+2/nx-gap,v+gap],[u+2/nx-gap,v+2/ny-gap],[u+gap,v+2/ny-gap]];
   const centre=point(u+1/nx,v+1/ny,preset,curvature);
   const ps=coords.map(([a,b])=>{let p=point(a,b,preset,curvature);
    if(stack){const target=[(a-u-1/nx)*3.2,(b-v-1/ny)*2.4,(p[2]-centre[2])*.65+(i*ny+j)*.075+.5];p=mix(p,target,amount);}
    if(topic==='segments')p=[p[0]*(1+amount*.18),p[1]*(1+amount*.18),p[2]+(i%2)*amount*.15];
    return p.map((n,k)=>n+offset[k]);});
   panels.push({ps,i,j,depth:ps.reduce((n,p)=>n+p[0]+p[1],0)});
  }
  panels.sort((a,b)=>a.depth-b.depth);
  for(const {ps,i,j} of panels){const col=`hsl(${(hue+i*18+j*6)%360} 40% ${65-j*3}%)`;
   if(topic==='thickness'||topic==='robots'){const thick=topic==='robots'?.1:.08+amount*.35;const lower=ps.map(p=>[p[0],p[1],p[2]-thick]);for(let k=0;k<4;k++)poly([ps[k],ps[(k+1)%4],lower[(k+1)%4],lower[k]],`hsl(${hue+i*18} 28% 44%)`);}
   poly(ps,col,topic==='segments'&&segmentation==='boundary'?'transparent':'rgba(28,40,38,.24)');
  }
  if(topic==='segments'){
   const edge=(uv)=>uv.map(([u,v])=>{const p=point(u,v,preset,curvature);return [p[0]*(1+amount*.18)+offset[0],p[1]*(1+amount*.18)+offset[1],p[2]+offset[2]+.025];});
   // Trace the complete exterior, independent of the panel animation.
   for(const side of [-1,1]){line(edge(Array.from({length:65},(_,k)=>[-1+k/32,side])),'#253f37',2);line(edge(Array.from({length:65},(_,k)=>[side,-1+k/32])),'#253f37',2);}
   if(preset==='atrium'){for(const side of [-1,1]){line(edge(Array.from({length:33},(_,k)=>[-.25+k/64,side*.5])),'#253f37',2);line(edge(Array.from({length:33},(_,k)=>[side*.25,-.5+k/32])),'#253f37',2);}}
   if(segmentation==='all')for(let i=1;i<8;i++)for(let j=0;j<4;j++){if(preset==='atrium'&&i>=3&&i<=5&&(j===1||j===2))continue;line(edge(Array.from({length:17},(_,k)=>[-1+i/4,-1+j/2+k/32])),'#253f37',1.1);}
   if(segmentation==='all')for(let j=1;j<4;j++)for(let i=0;i<8;i++){if(preset==='atrium'&&(i===3||i===4)&&j>=1&&j<=3)continue;line(edge(Array.from({length:17},(_,k)=>[-1+i/4+k/64,-1+j/2])),'#253f37',1.1);}
  }
 };
 if(topic==='stack'||topic==='design'){
   if(view)shell([0,0,0],view==='stack');else{shell(mini?[0,0,0]:[-2.9,0,0]);if(!mini){shell([3.2,0,0],true);label('ASSEMBLED ARCHITECTURE',[-5,-2,0]);label('SAME PARTS / PRESET STACK',[1.5,-2,0]);}}
 }else if(topic==='fields'){
   shell();
   for(let row=0;row<16;row++){const pts=[];for(let k=0;k<=90;k++){const u=-1+k/45;const v=-.9+row*.12+Math.sin(u*5+row*.32+phase*Math.PI*2)*.10*blend;if(Math.abs(v)>1)continue;const p=point(u,v,preset,curvature);pts.push([p[0],p[1],p[2]+.025]);}line(pts,`hsl(${hue+row*11} 80% 32%)`,1.5);
    const at=Math.floor(((phase+row*.037)%1)*(pts.length-1));if(pts[at]){const p=project(pts[at]);c.beginPath();c.arc(...p,2.6,0,Math.PI*2);c.fillStyle='#fff';c.fill();}
   }
 }else if(topic==='elastica'||topic==='robots'){
   const rod=t=>Array.from({length:51},(_,k)=>{const u=-1+k/25;return [u*3.1,-1.8+t*3.6,(topic==='robots'?.35:1.35)+Math.sin((u+1)*Math.PI/2)*curvature*.8+.13*Math.sin(t*6)];});
   if(topic==='robots'){
    poly([[-2,-1.8,.1],[2,-1.8,.1],[2,1.8,.1],[-2,1.8,.1]],'#dad7c9');
    for(let z=0;z<5;z++)poly([[-2,-1.8,.2+z*.15],[2,-1.8,.2+z*.15],[2,1.8,.2+z*.15],[-2,1.8,.2+z*.15]],`hsl(${hue+z*18} 28% ${77-z*3}%)`);
   }
   for(let i=0;i<18;i++){const t=i/17;if(t<=phase)line(rod(t),`hsla(${hue+i*9} 55% 48% / .5)`,1);}
   const active=rod(phase);line(active,'#df4b87',3);
   const arm=(side,end)=>{const base=[side*4,1.1,.1],shoulder=[side*4,1.1,.85],elbow=[side*4.15,-.4+phase*2,2.5];poly([[base[0]-.35,.75,.12],[base[0]+.35,.75,.12],[base[0]+.35,1.5,.12],[base[0]-.35,1.5,.12]],'#626b69');line([base,shoulder,elbow,end],side<0?'#d68b3d':'#5b839b',mini?4:13);for(const p of [shoulder,elbow,end]){const q=project(p);c.beginPath();c.arc(...q,mini?3:7,0,Math.PI*2);c.fillStyle='#394643';c.fill();c.strokeStyle='#f4f5ed';c.lineWidth=2;c.stroke();}};
   if(topic==='robots'){arm(-1,active[0]);arm(1,active.at(-1));label('SCHEMATIC ARM A',[-5,2,0]);label('SCHEMATIC ARM B',[2.6,2,0]);c.font='10px Arial';c.fillStyle='#59675f';c.fillText('CURVED CUTTER / ILLUSTRATIVE SWEEP',20,56);}
   else{for(const end of [active[0],active.at(-1)]){const p=project(end);c.beginPath();c.arc(...p,6,0,Math.PI*2);c.fillStyle='#354a41';c.fill();}label('SUCCESSIVE POSITIONS / A DRAWN SURFACE',[-3,-2.7,.1]);}
 }else if(topic==='thickness'){
  shell();const a=amount*.9+.15;
  const upper=[];for(let i=0;i<=40;i++){const u=-1+i/20;const p=point(u,0,preset,curvature);upper.push([p[0],p[1],p[2]+a]);}line(upper,'#d34a70',3);line(upper.map(p=>[p[0],p[1],p[2]-.15-a]),'#47788c',3);label('UPPER FACE / LOWER FACE',[-3,-2.7,.1]);
 }else shell();
}
export function initConcepts(){
 const canvas=document.getElementById('concept-scene');if(!canvas)return;
 const state={preset:'canopy',topic:'stack',curvature:1,amount:.85,blend:.7,phase:.35,turn:.35,segmentation:'all'};
 const $=id=>document.getElementById(id);let playing=false,visible=false,last=0;
 function render(){const split=['stack','design'].includes(state.topic);$('scene-panes').classList.toggle('split',split);$('stack-pane').hidden=!split;$('assembled-label').hidden=!split;draw(canvas,{...state,view:split?'assembled':undefined});if(split)draw($('stack-scene'),{...state,view:'stack'});$('concept-phase').value=Math.round(state.phase*100);$('concept-state').textContent=(state.topic==='robots'?'Generic blank':state.topic==='elastica'?'Curve sweep':presets.find(p=>p.id===state.preset).name)+' / '+topics[state.topic].name;}
 function selectTopic(topic){state.topic=topic;const t=topics[topic];$('concept-tag').textContent=t.tag;$('concept-title').textContent=t.title;$('concept-copy').textContent=t.copy;$('concept-limit').textContent=t.limit;document.querySelectorAll('[data-topic]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.topic===topic)));$('scene-notes').textContent=t.limit;$('concept-blend').disabled=topic!=='fields';$('concept-amount').disabled=!['stack','design','segments','thickness'].includes(topic);$('concept-preset').disabled=['robots','elastica'].includes(topic);$('concept-phase').disabled=['segments','thickness'].includes(topic);$('concept-play').disabled=['segments','thickness'].includes(topic);render();}
 document.querySelectorAll('[data-topic]').forEach(b=>b.onclick=()=>{selectTopic(b.dataset.topic);$('segmentation-options').hidden=state.topic!=='segments';});
 document.querySelectorAll('[data-segmentation]').forEach(b=>b.onclick=()=>{state.segmentation=b.dataset.segmentation;document.querySelectorAll('[data-segmentation]').forEach(p=>p.setAttribute('aria-pressed',String(p===b)));render();});
 document.querySelectorAll('[data-preset]').forEach(b=>{b.onclick=()=>{state.preset=b.dataset.preset;$('concept-preset').value=state.preset;document.querySelectorAll('[data-preset]').forEach(p=>p.setAttribute('aria-pressed',String(p===b)));render();};const preview=b.querySelector('canvas');new ResizeObserver(()=>draw(preview,{preset:b.dataset.preset,topic:'segments',curvature:1,amount:.05},true)).observe(preview);});
 $('concept-preset').oninput=()=>{state.preset=$('concept-preset').value;document.querySelectorAll('[data-preset]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.preset===state.preset)));render();};
 for(const [id,key] of [['concept-curvature','curvature'],['concept-amount','amount'],['concept-blend','blend'],['concept-turn','turn']])$(id).oninput=()=>{state[key]=+$(id).value;render();};
 $('concept-phase').oninput=()=>{state.phase=+ $('concept-phase').value/100;if(['stack','design'].includes(state.topic)){state.amount=state.phase;$('concept-amount').value=state.amount;}render();};
 $('concept-play').onclick=()=>{playing=!playing;$('concept-play').textContent=playing?'Pause motion Ⅱ':'Play motion ▷';$('concept-play').setAttribute('aria-pressed',String(playing));};
 $('concept-save').onclick=()=>{const a=document.createElement('a');a.download='STACK-education-'+state.preset+'-'+state.topic+'.png';let saved=canvas;if(['stack','design'].includes(state.topic)){saved=document.createElement('canvas');const other=$('stack-scene');saved.width=canvas.width+other.width;saved.height=Math.max(canvas.height,other.height)+45;const ctx=saved.getContext('2d');ctx.fillStyle='#e9ede4';ctx.fillRect(0,0,saved.width,saved.height);ctx.drawImage(canvas,0,45);ctx.drawImage(other,canvas.width,45);ctx.fillStyle='#253f37';ctx.font='20px Arial';ctx.fillText('ASSEMBLED SURFACE',20,30);ctx.fillText('SAME PARTS / PRESET STACK',canvas.width+20,30);}a.href=saved.toDataURL();a.click();};
 let dragging=false,old=0;canvas.onpointerdown=e=>{dragging=true;old=e.clientX;e.currentTarget.setPointerCapture(e.pointerId);};canvas.onpointermove=e=>{if(dragging){state.turn+=(e.clientX-old)*.006;old=e.clientX;render();}};canvas.onpointerup=canvas.onpointercancel=()=>dragging=false;
 $('stack-scene').onpointerdown=canvas.onpointerdown;$('stack-scene').onpointermove=canvas.onpointermove;$('stack-scene').onpointerup=$('stack-scene').onpointercancel=()=>dragging=false;
 new ResizeObserver(render).observe(canvas);new ResizeObserver(render).observe($('stack-scene'));new IntersectionObserver(([e])=>visible=e.isIntersecting).observe(canvas);
 function tick(now){if(playing&&visible&&!document.hidden&&now-last>33){state.phase=(state.phase+.004)%1;if(state.topic==='stack'||state.topic==='design'){state.amount=(1-Math.cos(state.phase*Math.PI*2))/2;$('concept-amount').value=state.amount;}render();last=now;}requestAnimationFrame(tick);}requestAnimationFrame(tick);
 selectTopic('stack');
}
