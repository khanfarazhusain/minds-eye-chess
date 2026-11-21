/* 64 Squares design system v2: small shared helpers (loaded on every page, after the page script) */
(function(){
  var rm=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)');
  /* light fade-up of a new screen; only on navigation, never on in-screen re-renders */
  window.uiEnter=function(el){try{
    if(!el||(rm&&rm.matches)||document.body.classList.contains('lowfx')||document.body.classList.contains('fixb'))return;
    el.classList.remove('ui-enter');void el.offsetWidth;el.classList.add('ui-enter');
    clearTimeout(el.__uiT);el.__uiT=setTimeout(function(){el.classList.remove('ui-enter')},520);
  }catch(e){}};
  /* hash-routed pages (course, road, lichess): animate when the route changes */
  var app=document.getElementById('app');
  if(app)window.addEventListener('hashchange',function(){setTimeout(function(){window.uiEnter(app)},0)});
})();
