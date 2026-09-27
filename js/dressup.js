/* ================= dress up ================= */
(function(){
  function paintSwatches(){
    $('#bows').innerHTML=Object.entries(BOWS).map(([k,v])=>
      `<div class="swatch${LOOK.bow===k?' on':''}" data-b="${k}" style="background:${v}" title="${k}"></div>`).join('');
    $$('.swatch').forEach(s=>s.onclick=()=>{ LOOK.bow=s.dataset.b; save(); });
    $('#accs').innerHTML=ACCS.map(a=>`<button class="chip${LOOK.acc===a.id?' on':''}" data-a="${a.id}">${a.label}</button>`).join('');
    $$('#accs .chip').forEach(b=>b.onclick=()=>{ LOOK.acc=b.dataset.a; save(); });
    $('#blushes').innerHTML=[['on','Rosy 🌸'],['off','Plain']].map(([v,l])=>
      `<button class="chip${(LOOK.blush?'on':'off')===v?' on':''}" data-bl="${v}">${l}</button>`).join('');
    $$('#blushes .chip').forEach(b=>b.onclick=()=>{ LOOK.blush=b.dataset.bl==='on'; save(); });
  }
  function save(){
    store.set('look',LOOK); repaintBunnies(); paintSwatches(); sfx.click();
    $('#dressSay').textContent=pick(['looking good 🌸','the bunny feels seen','very chic','it did a little twirl','excellent choice']);
  }
  $('#randomFit').onclick=()=>{ LOOK.bow=pick(Object.keys(BOWS)); LOOK.acc=pick(ACCS).id; LOOK.blush=Math.random()<.8; save(); sfx.win(); };
  $('#resetFit').onclick=()=>{ LOOK={bow:'rose',acc:'bow',blush:true}; save(); };
  REPAINT.push(paintSwatches);
  SYNC.onRemote('look', v=>{ if(v){ LOOK=Object.assign({bow:'rose',acc:'bow',blush:true},v); repaintBunnies(); } });
  paintSwatches(); repaintBunnies();
})();
