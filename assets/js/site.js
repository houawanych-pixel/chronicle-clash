/* Chronicle Clash site script: mobile menu + lazy lightbox. No trackers, no external requests. */
(function(){
  var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  var menu=$('.menu'),links=$('#navlinks');
  function setMenu(open){if(!menu||!links)return;links.classList.toggle('open',open);menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close menu':'Open menu')}
  if(menu){menu.addEventListener('click',function(){setMenu(!links.classList.contains('open'))});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&links.classList.contains('open')){setMenu(false);menu.focus()}});
    $$('a',links).forEach(function(a){a.addEventListener('click',function(){setMenu(false)})});}
  var dlg=$('#art-dialog');if(!dlg||typeof dlg.showModal!=='function')return; // no-JS / old browsers: links open the full image directly
  var items=$$('.gopen'),idx=0,img=$('img',dlg),cap=$('#image-caption');
  function show(i){idx=(i+items.length)%items.length;var a=items[idx];img.src=a.getAttribute('data-full');var c=a.getAttribute('data-caption')||'';img.alt=c;cap.textContent=c+(items.length>1?'  ('+(idx+1)+' / '+items.length+')':'')}
  items.forEach(function(a,i){a.addEventListener('click',function(e){e.preventDefault();show(i);dlg.showModal()})});
  $('.close',dlg).addEventListener('click',function(){dlg.close()});
  $('.dlg-prev',dlg).addEventListener('click',function(){show(idx-1)});
  $('.dlg-next',dlg).addEventListener('click',function(){show(idx+1)});
  dlg.addEventListener('keydown',function(e){if(e.key==='ArrowLeft')show(idx-1);if(e.key==='ArrowRight')show(idx+1)});
  dlg.addEventListener('click',function(e){if(e.target===dlg)dlg.close()});
  dlg.addEventListener('close',function(){img.removeAttribute('src')});
  if(items.length<2){$('.dlg-prev',dlg).hidden=true;$('.dlg-next',dlg).hidden=true}
})();
