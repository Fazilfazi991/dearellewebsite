/** Parser-time startup: the poster and video never wait for React hydration. */
export const HERO_BOOTSTRAP = `(()=>{
const v=document.getElementById('campaign-video');
if(!v)return;
const mobile=matchMedia('(max-width: 640px)').matches;
v.poster=mobile?v.dataset.mobilePoster:v.dataset.desktopPoster;
const reveal=()=>{if(v.readyState>=2&&!v.error)v.dataset.ready='true'};
v.addEventListener('playing',()=>{
 if(v.requestVideoFrameCallback)v.requestVideoFrameCallback(reveal);
 else requestAnimationFrame(()=>requestAnimationFrame(reveal));
});
v.addEventListener('error',()=>{v.dataset.ready='false'});
const c=navigator.connection;
if(matchMedia('(prefers-reduced-motion: reduce)').matches||c?.saveData||['slow-2g','2g'].includes(c?.effectiveType))return;
v.muted=true;
v.src=mobile?v.dataset.mobileSrc:v.dataset.desktopSrc;
v.play().catch(()=>{});
})();`;
