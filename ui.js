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

/* v166: colourful cards everywhere (like the Play page).
   Link/action cards get a bold gradient (vz0..vz7), plain info cards a soft tint (pz0..pz5).
   Colours rotate per container so neighbours never match. */
(function(){
  var VIV='a.card,button.card,.coursecta,.rowcard,.rungcard,.card.coach,.shero,button.lvl:not(.locked),.notescta';
  var PAS='.card,.qrow,.les,.lnow,.lgrp,.drill,.stagerow,button.lesson,.lvl.locked,.pg-notes .lesson';
  var SKIP='.fixscroll,.fixtop,.tut,.pg-coach #trainPanel,.pmode,.hero2,.prhero,.pghead,.qt,.pct,.pkcard';
  function inCard(e){var p=e.parentElement;while(p&&p!==document.body){if(p.classList&&(p.classList.contains('vz')||p.classList.contains('pz')||p.classList.contains('card')))return true;p=p.parentElement}return false}
  function tint(){try{
    var seen=new Map();
    document.querySelectorAll(VIV+','+PAS).forEach(function(e){
      if(e.classList.contains('vz')||e.classList.contains('pz'))return;
      if(e.closest(SKIP)||e.closest('nav.tabs,header.top')||inCard(e))return;
      var viv=e.matches(VIV),par=e.parentElement,k=(viv?'v':'p'),m=seen.get(par)||{v:0,p:0};
      if(!seen.has(par)){par.querySelectorAll(':scope>.vz').forEach(function(){m.v++});par.querySelectorAll(':scope>.pz').forEach(function(){m.p++});}
      var n=m[k]++;seen.set(par,m);
      e.classList.add(viv?'vz':'pz',viv?'vz'+(n%8):'pz'+(n%6));
    });
  }catch(x){}}
  var q=0;function later(){if(q)return;q=requestAnimationFrame(function(){q=0;tint()})}
  if(document.readyState!=='loading')tint();else document.addEventListener('DOMContentLoaded',tint);
  try{new MutationObserver(later).observe(document.body,{childList:true,subtree:true})}catch(x){}
})();
