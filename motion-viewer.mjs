// Playback of sampled display states. No fitting or robot kinematics run here.
export function motionViewerClass(Display) {
 return class MotionDisplay extends Display {
  constructor(host,data,buffer) {
   const types={Float32Array,Uint32Array,Uint16Array,Uint8Array,Int32Array,Int16Array,Int8Array,Float64Array};
   for(const g of data.scene.geometries||[])for(const a of [...Object.values(g.data?.attributes||{}),g.data?.index].filter(Boolean))if(a.bakedBuffer){
    a.array=new types[a.type](buffer,a.bakedBuffer.byteOffset,a.bakedBuffer.length);
   }
   super(host,data);
   const T=window.THREE;
   this.duration=data.duration;this.frameCount=data.frameCount;this.time=0;this.playing=false;this.spinning=false;this.last=0;this.dead=false;
   const objects=new Map(),geometries=new Map();
   this.scene.traverse(o=>{objects.set(o.uuid,o);if(o.geometry)geometries.set(o.geometry.uuid,o.geometry);});
   const floats=new Float32Array(buffer);
   this.tracks=data.tracks.map(t=>({...t,object:(t.kind==='matrix'||t.kind==='visible'?objects:geometries).get(t.id),values:floats.subarray(t.offset,t.offset+t.size*data.frameCount)}));
   for(const t of this.tracks)if(t.kind==='matrix') {
    t.poses=[];
    for(let f=0;f<data.frameCount;f++){const p=new T.Vector3(),q=new T.Quaternion(),s=new T.Vector3();new T.Matrix4().fromArray(t.values,f*16).decompose(p,q,s);t.poses.push({p,q,s});}
    t.object.matrixAutoUpdate=true;
   }
   this.section=host.closest('[data-page]');this.output=this.section.querySelector('[data-motion-time]');this.slider=this.section.querySelector('[data-motion-scrub]');this.playButton=this.section.querySelector('[data-motion-play]');this.spinButton=this.section.querySelector('[data-motion-spin]');
   this.playButton.onclick=()=>this.play(!this.playing);
   this.spinButton.onclick=()=>{this.spinning=!this.spinning;this.controls.autoRotate=this.spinning;this.spinButton.setAttribute('aria-pressed',String(this.spinning));this.spinButton.textContent=this.spinning?'Stop spin':'Spin view';};
   this.section.querySelector('[data-motion-restart]').onclick=()=>{this.play(false);this.time=0;this.pose();};
   this.slider.oninput=()=>{this.play(false);this.time=Number(this.slider.value)/1000*this.duration;this.pose();};
   this.renderer.domElement.addEventListener('keydown',e=>{
    if(e.code==='Space'){e.preventDefault();this.play(!this.playing);}
    if(e.key.startsWith('Arrow')){e.preventDefault();const offset=this.camera.position.clone().sub(this.controls.target),sp=new T.Spherical().setFromVector3(offset);sp.theta+=e.key==='ArrowLeft'?.12:e.key==='ArrowRight'?-.12:0;sp.phi=Math.max(.08,Math.min(Math.PI-.08,sp.phi+(e.key==='ArrowUp'?-.1:e.key==='ArrowDown'?.1:0)));this.camera.position.copy(this.controls.target).add(new T.Vector3().setFromSpherical(sp));this.controls.update();}
   });
   this.pose();this.loop=requestAnimationFrame(t=>this.tick(t));
  }
  play(value){if(value&&this.time>=this.duration)this.time=0;this.playing=value;this.playButton.textContent=value?'Stop animation':'Start animation';this.playButton.setAttribute('aria-pressed',String(value));}
  pose(){
   const x=this.time/this.duration*(this.frameCount-1),a=Math.floor(x),b=Math.min(a+1,this.frameCount-1),mix=x-a;
   for(const t of this.tracks){const o=t.object;if(!o)continue;const i=a*t.size,j=b*t.size;
    if(t.kind==='matrix'){o.position.copy(t.poses[a].p).lerp(t.poses[b].p,mix);o.quaternion.copy(t.poses[a].q).slerp(t.poses[b].q,mix);o.scale.copy(t.poses[a].s).lerp(t.poses[b].s,mix);}
    else if(t.kind==='visible')o.visible=!!t.values[i];
    else if(t.kind==='range')o.setDrawRange(t.values[i],t.values[i+1]<0?Infinity:t.values[i+1]);
    else{const attr=o.attributes[t.attribute];for(let k=0;k<t.size;k++)attr.array[k]=t.values[i+k]+(t.values[j+k]-t.values[i+k])*mix;attr.needsUpdate=true;}
   }
   this.slider.value=Math.round(this.time/this.duration*1000);this.output.textContent=`${this.time.toFixed(1)} / ${this.duration} s`;this.draw();
  }
  tick(now){
   if(this.dead)return;const dt=this.last?Math.min((now-this.last)/1000,.1):0;this.last=now;
   if(this.playing){this.time=Math.min(this.duration,this.time+dt);this.pose();if(this.time>=this.duration)this.play(false);}
   if(this.spinning){this.controls.update();this.draw();}
   this.loop=requestAnimationFrame(t=>this.tick(t));
  }
  dispose(){
   this.dead=true;cancelAnimationFrame(this.loop);this.play(false);this.spinning=false;this.spinButton.setAttribute('aria-pressed','false');this.spinButton.textContent='Spin view';
   for(const b of [this.playButton,this.spinButton,this.slider,this.section.querySelector('[data-motion-restart]')])b.onclick=b.oninput=null;
   super.dispose();
  }
 };
}
