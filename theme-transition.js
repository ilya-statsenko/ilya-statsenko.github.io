(()=>{
'use strict';
const body=document.body,canvas=document.getElementById('predictive-field'),ctx=canvas.getContext('2d'),page=document.getElementById('reading-column'),btn=document.getElementById('theme');
const mq=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x)},mix=(a,b,t)=>a+(b-a)*t;
const ns='http://www.w3.org/2000/svg';
const light={'--bg':'#ffffff','--ink':'#111111','--muted':'#555555','--rule':'rgba(0,0,0,.21)','--frame':'rgba(0,0,0,.35)','--art-bg':'#101010','--art-ink':'#ffffff','--button-bg':'#ffffff','--button-ink':'#111111'};
const dark={'--bg':'#0b0b0b','--ink':'#f7f7f7','--muted':'#b4b4b4','--rule':'rgba(255,255,255,.25)','--frame':'rgba(255,255,255,.35)','--art-bg':'#f7f7f7','--art-ink':'#0b0b0b','--button-bg':'#0b0b0b','--button-ink':'#f7f7f7'};
const STORAGE_KEY='predictive-space-theme';
function readSavedTheme(){try{return localStorage.getItem(STORAGE_KEY)==='dark'?1:0}catch{return 0}}
function saveTheme(t){try{localStorage.setItem(STORAGE_KEY,t?'dark':'light')}catch{}}
function setPalette(t){const v=t?dark:light;for(const [key,value] of Object.entries(v))body.style.setProperty(key,value);document.documentElement.style.background=v['--bg'];body.dataset.theme=t?'dark':'light'}
let progress=0,target=0,frame=0,fieldPaused=mq.matches,held=0,dpr=1,W=0,H=0,active=false,queued=false,baseTone=0;
// The dark visual layer is a non-interactive, aligned copy. The real page remains the single accessible/interactive DOM.
const layer=document.createElement('div');layer.id='theme-layer';layer.setAttribute('aria-hidden','true');layer.inert=true;
const darkCanvas=document.createElement('canvas'),darkCtx=darkCanvas.getContext('2d');
const darkPage=page.cloneNode(true); const pageIds=new Map(); [darkPage,...darkPage.querySelectorAll('[id]')].forEach(el=>{if(el.id){pageIds.set(el.id,'theme-copy-'+el.id);el.id='theme-copy-'+el.id}}); darkPage.querySelectorAll('*').forEach(el=>{for(const attr of el.attributes){el.setAttribute(attr.name,attr.value.replace(/url\(#([^)]*)\)/g,(m,id)=>'url(#'+(pageIds.get(id)||id)+')').replace(/^#(.+)$/,(m,id)=>'#'+(pageIds.get(id)||id)))}});
const darkBtn=btn.cloneNode(true);darkBtn.id='dark-theme-visual';darkBtn.tabIndex=-1;
const idMap=new Map();darkBtn.querySelectorAll('[id]').forEach(el=>{const id=el.id;idMap.set(id,'shadow-'+id);el.id='shadow-'+id});darkBtn.querySelectorAll('[mask]').forEach(el=>{el.setAttribute('mask',el.getAttribute('mask').replace(/#([^)]*)/g,(m,id)=>'#'+(idMap.get(id)||id)))});
layer.append(darkCanvas,darkPage,darkBtn);body.appendChild(layer);
function makeIcon(button,prefix=''){
 const el=id=>button.querySelector('#'+prefix+id),rays=el('rays');
 const rayEls=Array.from({length:8},(_,i)=>{const l=document.createElementNS(ns,'line');l.setAttribute('transform',`rotate(${i*45})`);rays.appendChild(l);return l});
 return {spin:el('spin'),disk:el('disk'),bite:el('bite'),rays:rayEls};
}
const icons=[makeIcon(btn),makeIcon(darkBtn,'shadow-')];
function iconPaint(p){
 for(const {spin,disk,bite,rays} of icons){
  spin.setAttribute('transform',`rotate(${360*ease(p)})`);
  const morph=ease((p-.38)/.62);disk.setAttribute('r',mix(5.7,9.7,morph));bite.setAttribute('cx',mix(24,5.8,morph));bite.setAttribute('cy',mix(-5.4,-4.8,morph));bite.setAttribute('r',mix(8.5,9.1,morph));
  rays.forEach((el,i)=>{const q=ease((p-(.07+i*.067))/.23);el.setAttribute('x1',mix(8.3,3.6,q));el.setAttribute('x2',mix(13.1,4.1,q));el.setAttribute('y1',0);el.setAttribute('y2',0);el.setAttribute('opacity',1-ease((q-.76)/.24))});
 }
}
function scrollProgress(){return clamp(scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight))}
function geometry(){const r=page.getBoundingClientRect();return {W,H,dpr,p:fieldPaused?held:scrollProgress(),left:r.left,right:r.right}}
function align(){const r=page.getBoundingClientRect();darkPage.style.width=r.width+'px';darkPage.style.left=r.left+'px';darkPage.style.top=r.top+'px'}
function field(){const g=geometry();PredictiveSpaceV7.draw(ctx,{...g,tone:baseTone});if(active)PredictiveSpaceV7.draw(darkCtx,{...g,tone:1})}
function queue(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;if(active)align();field()})}
function setMask(p){
 const t=ease(p);

  // A soft straight diagonal, not an expanding circle or a spinning layer.
  // Narrow feather compared with the viewport so most text keeps full endpoint contrast.
  const half=9;const c=mix(100+half,-half,t);const mask=`linear-gradient(135deg, transparent ${c-half}%, black ${c+half}%)`;
  layer.style.opacity='1';layer.style.maskImage=mask;layer.style.webkitMaskImage=mask;
}
function begin(){if(active)return;active=true;baseTone=0;setPalette(0);layer.style.display='block';align();setMask(progress);iconPaint(progress);field()}
function commit(p){progress=p;active=false;baseTone=p;setPalette(p);layer.style.display='none';iconPaint(p);field()}
function paint(p){progress=p;iconPaint(p);setMask(p)}
function resize(){W=document.documentElement.clientWidth;H=innerHeight;dpr=Math.min(devicePixelRatio||1,2);for(const c of [canvas,darkCanvas]){c.width=Math.round(W*dpr);c.height=Math.round(H*dpr)}if(active)align();field()}
function toggle(){
 if(!CSS.supports('mask-image','linear-gradient(135deg, transparent, black)')&&!CSS.supports('-webkit-mask-image','linear-gradient(135deg, transparent, black)')){target=1-target;saveTheme(target);btn.setAttribute('aria-pressed',String(!!target));btn.setAttribute('aria-label',target?'Switch to light theme':'Switch to dark theme');commit(target);return}
 target=1-target;saveTheme(target);btn.setAttribute('aria-pressed',String(!!target));btn.setAttribute('aria-label',target?'Switch to light theme':'Switch to dark theme');cancelAnimationFrame(frame);
 if(mq.matches){commit(target);return}
 const from=progress,start=performance.now(),duration=1200*Math.abs(target-from);
 begin();
 function tick(now){const t=clamp((now-start)/Math.max(1,duration));if(t>=1){commit(target);return}paint(mix(from,target,t));frame=requestAnimationFrame(tick)}
 frame=requestAnimationFrame(tick);
}
btn.addEventListener('click',toggle);
window.addEventListener('resize',resize);window.addEventListener('scroll',queue,{passive:true});
function motionPreference(e){if(e.matches){held=scrollProgress();fieldPaused=true;cancelAnimationFrame(frame);commit(target)}else{fieldPaused=false;queue()}}
mq.addEventListener('change',motionPreference);
target=readSavedTheme();progress=baseTone=target;setPalette(target);iconPaint(target);btn.setAttribute('aria-pressed',String(!!target));btn.setAttribute('aria-label',target?'Switch to light theme':'Switch to dark theme');resize();
})();
