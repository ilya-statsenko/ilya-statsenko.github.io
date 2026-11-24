
/* Predictive Space V7 — approved preset. Derived directly from the V7 chat prototype.
 * The pure renderer uses CSS-pixel geometry, then scales for DPR. No time-based animation.
 * Only the input adapter and UI are separated from the original prototype. */
(function(global){
'use strict';
const CONFIG=Object.freeze({theme:'light',background:'#ffffff',core:'hybrid',motion:50,surfaceSymbols:32,contrast:55,angle:'oblique',direction:1});
const TAU=Math.PI*2;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const mix=(a,b,t)=>a+(b-a)*t;
const fract=x=>x-Math.floor(x);
const noise=(i,k=0)=>fract(Math.sin((i+1)*127.1+(k+1)*311.7)*43758.5453);
const tokens=['zₜ','aₜ','sₜ','zₜ₊₁','π(a|s)','∇θ','∂L','Dₖₗ','Δt','ε','fθ','p(z)','xₜ','L(θ)','γ','Σ','E[·]','σ','vₜ','μ','λ','KL','MSE','δ','0.01','0.5','LPIPS','SSIM','ℝᵈ','p(x|z)','‖·‖₂','α','β','rₜ','ψ','V(s)','√t','0.125','τ','η'];
/** All measurements (W,H,left,right) are CSS pixels. p = normalized scroll progress.
 * left/right are the actual reading column boundaries relative to the canvas. */
function draw(ctx,{W,H,dpr=1,p=0,left,right}){
if(!W||!H)return;
ctx.setTransform(dpr,0,0,dpr,0,0);
ctx.globalCompositeOperation='source-over';
ctx.clearRect(0,0,W,H);
p=clamp(p,0,1);
const power=CONFIG.motion/100;
const contrast=CONFIG.contrast/60;
const travel=p*CONFIG.direction*power;
const phase=travel*2.5;
const alpha=a=>`rgba(12,12,12,${clamp(a*contrast,0,.86)})`;
// Fixed oblique orthographic projection, as in V7.
const x0=-W*.15,y0=H*1.03,dx=W*1.34,dy=-H*1.02;
const len=Math.hypot(dx,dy),ux=dx/len,uy=dy/len,nx=-uy,ny=ux;
const tilt=.36;
const R=Math.min(W,H)*.43;
function radius(s){return R*Math.max(.17,1-.73*clamp(s,0,1.15))}
function geom(s,theta,fraction=1){
 const r=radius(s)*fraction,depth=Math.cos(theta);
 return {x:x0+dx*s+nx*Math.sin(theta)*r+ux*depth*r*tilt,
 y:y0+dy*s+ny*Math.sin(theta)*r+uy*depth*r*tilt,depth};
}
function curve(fn,steps,width,opacity){
 ctx.beginPath();
 for(let i=0;i<=steps;i++){const pt=fn(i/steps);if(i===0)ctx.moveTo(pt.x,pt.y);else ctx.lineTo(pt.x,pt.y)}
 ctx.lineWidth=width;ctx.strokeStyle=alpha(opacity);ctx.stroke();
}
function label(text,point,size,opacity){
 if(point.x<-65||point.x>W+65||point.y<-18||point.y>H+18)return;
 ctx.font=`${size}px "Courier New",monospace`;
 ctx.fillStyle=alpha(opacity);ctx.fillText(text,point.x,point.y);
}
function visibility(s){return clamp((s+.22)/.15,0,1)*clamp((1.23-s)/.2,0,1)}
ctx.lineCap='round';ctx.lineJoin='round';
// Stationary tonal field.
const halo=ctx.createLinearGradient(0,H,W,0);
halo.addColorStop(0,alpha(.043));halo.addColorStop(.44,alpha(0));halo.addColorStop(.7,alpha(0));halo.addColorStop(1,alpha(.025));
ctx.fillStyle=halo;ctx.fillRect(0,0,W,H);
// 19 fixed cross sections + 12 surface helices.
for(let i=0;i<19;i++){
 const s=-.07+i*.069;
 curve(t=>geom(s,t*TAU),64,i%4===0?1.05:.6,i%4===0?.23:.115);
}
for(let j=0;j<12;j++){
 const offset=j*TAU/12;
 curve(t=>{const s=-.20+t*1.43;return geom(s,offset+s*5.8+phase)},140,j%4===0?1.35:.7,j%4===0?.40:.17);
}
// Hybrid core: three streamlines + 146 particles + 26 mathematical tokens.
for(let j=0;j<3;j++){
 curve(t=>{const s=-.16+1.36*t;return geom(s,j*TAU/3+s*3.4+phase*.55,.18+j*.035)},100,.6,.10);
}
for(let i=0;i<146;i++){
 const s0=-.23+1.38*noise(i,3),s=s0+travel*.30;
 const theta=TAU*noise(i,4)+s*3.7+phase*.7;
 const fraction=.035+.24*Math.sqrt(noise(i,5)),pt=geom(s,theta,fraction);
 const fade=visibility(s);if(fade<=0)continue;
 const opacity=(.13+.21*noise(i,6))*fade,scale=1-.57*clamp(s,0,1);
 if(i%3===0){
  const length=(2+5*noise(i,7))*scale;
  ctx.beginPath();ctx.moveTo(pt.x-ux*length/2,pt.y-uy*length/2);ctx.lineTo(pt.x+ux*length/2,pt.y+uy*length/2);
  ctx.lineWidth=.65+.35*noise(i,9);ctx.strokeStyle=alpha(opacity);ctx.stroke();
 }else{
  ctx.beginPath();ctx.arc(pt.x,pt.y,(.55+.9*noise(i,8))*scale,0,TAU);ctx.fillStyle=alpha(opacity);ctx.fill();
 }
}
ctx.textAlign='center';ctx.textBaseline='middle';
const n=26;
for(let i=0;i<n;i++){
 const s0=-.16+1.29*((i+.4)/n),s=s0+travel*.27;
 const theta=i*2.399963+s*3.1+phase*.6,pt=geom(s,theta,.08+.19*noise(i,11));
 const size=mix(10.5,7,clamp(s,0,1)),text=tokens[(i*7+5)%tokens.length];
 label(text,pt,size,(.30+.13*noise(i,12))*visibility(s));
}
// Exactly 32 surface symbols; deterministic, depth sorted.
const surface=[];
for(let i=0;i<CONFIG.surfaceSymbols;i++){
 const s0=-.19+1.36*fract((i+1)*.61803398875),s=s0+travel*.18;
 const theta=TAU*fract((i+1)*.754877666)+s*5.8+phase*.65;
 const pt=geom(s,theta,.87+.13*noise(i,17));surface.push({i,s,pt});
}
surface.sort((a,b)=>a.pt.depth-b.pt.depth);
for(const {i,s,pt} of surface){
 const near=(pt.depth+1)/2,size=mix(8,12.5,near)*(1-.29*clamp(s,0,1));
 label(tokens[(i*13+3)%tokens.length],pt,size,(.17+.37*near)*visibility(s));
}
// Fully transparent at the reading column; same feather as V7.
const l=clamp(left/W,0,.5),r=clamp(right/W,.5,1);
const mask=ctx.createLinearGradient(0,0,W,0);
const stops=[[0,1],[l*.48,.98],[l*.78,.55],[l,0],[r,0],[r+(1-r)*.22,.55],[r+(1-r)*.52,.98],[1,1]];
for(const [x,a] of stops)mask.addColorStop(clamp(x,0,1),`rgba(0,0,0,${a})`);
ctx.globalCompositeOperation='destination-in';ctx.fillStyle=mask;ctx.fillRect(0,0,W,H);ctx.globalCompositeOperation='source-over';
}
/** Mount adapter. Pass scroller for the chat-sized lab; omit for real document scroll.
 * Wrapper sizing/DOM layout and safety controls are deliberately outside the drawing math. */
function mount({canvas,stage,content,scroller=null,onState=()=>{}}){
 const ctx=canvas.getContext('2d');
 if(!ctx)return null;
 const media=global.matchMedia('(prefers-reduced-motion: reduce)');
 let paused=media.matches,held=0,queued=false,W=0,H=0,dpr=1,raf=0,disposed=false;
 function progress(){
  const el=scroller||document.scrollingElement||document.documentElement;
  return clamp(el.scrollTop/Math.max(1,el.scrollHeight-el.clientHeight),0,1);
 }
 function render(){
  const actual=progress();
  const cb=content.getBoundingClientRect(),sb=stage.getBoundingClientRect();
  const p=paused?held:actual;
  draw(ctx,{W,H,dpr,p,left:cb.left-sb.left,right:cb.right-sb.left});
  onState({actual,p,paused,reducedMotion:media.matches});
 }
 function queue(){if(queued||disposed)return;queued=true;raf=global.requestAnimationFrame(()=>{queued=false;render()})}
 function resize(){W=stage.clientWidth;H=stage.clientHeight;dpr=Math.min(global.devicePixelRatio||1,2);canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);queue()}
 function setPaused(value){if(media.matches&&!value)return;if(value&&!paused)held=progress();paused=!!value;queue()}
 function onScroll(){if(!paused)queue();else onState({actual:progress(),p:held,paused,reducedMotion:media.matches})}
 function onMedia(e){if(e.matches)setPaused(true);else queue()}
 const scrollTarget=scroller||global;
 scrollTarget.addEventListener('scroll',onScroll,{passive:true});
 global.addEventListener('resize',resize);
 const observer=global.ResizeObserver?new global.ResizeObserver(resize):null;
 if(observer){observer.observe(stage);observer.observe(content)}
 if(media.addEventListener)media.addEventListener('change',onMedia);
 resize();
 return {setPaused,progress,redraw:queue,destroy(){disposed=true;if(queued)global.cancelAnimationFrame(raf);observer?.disconnect();scrollTarget.removeEventListener('scroll',onScroll);global.removeEventListener('resize',resize);media.removeEventListener?.('change',onMedia)}};
}
global.PredictiveSpaceV7=Object.freeze({CONFIG,draw,mount});
})(window);
