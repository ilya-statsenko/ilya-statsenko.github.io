const toggle = document.querySelector('#motion-toggle');
let paused = false;
try {
 const field = window.PredictiveSpaceV7?.mount({canvas:document.querySelector('#predictive-field'),stage:document.querySelector('#predictive-stage'),content:document.querySelector('#reading-column'),onState(state){paused=state.paused;toggle.textContent=state.paused?'Motion on':'Motion off';toggle.disabled=state.reducedMotion;toggle.setAttribute('aria-pressed',String(state.paused));toggle.title=state.reducedMotion?'Motion disabled by your system preference':'';}});
 if(field) toggle.addEventListener('click',()=>field.setPaused(!paused));
 else toggle.hidden=true;
} catch { toggle.hidden=true; }
