/* ================= GARDEN ================= */
(function(){
  const defs=[
    {id:'can',emo:'💧',name:'Watering Can',desc:'+1 petal / sec',base:25,ps:1,cl:0},
    {id:'glove',emo:'🧤',name:'Gardening Glove',desc:'+1 per click',base:60,ps:0,cl:1},
    {id:'bee',emo:'🐝',name:'Busy Bee',desc:'+4 petals / sec',base:220,ps:4,cl:0},
    {id:'bun',emo:'🐰',name:'Bunny Helper',desc:'+12 petals / sec',base:900,ps:12,cl:0},
    {id:'tree',emo:'🌳',name:'Second Tree',desc:'+50 petals / sec',base:4200,ps:50,cl:0},
    {id:'rain',emo:'🌈',name:'Petal Weather',desc:'+220 petals / sec',base:19000,ps:220,cl:0}
  ];
  let g=store.get('garden',{p:0,own:{},total:0});
  defs.forEach(d=>{ if(g.own[d.id]==null) g.own[d.id]=0; });
  const shop=$('#shop');
  const cost=d=>Math.floor(d.base*Math.pow(1.17,g.own[d.id]));
  const perClick=()=>1+defs.reduce((s,d)=>s+d.cl*g.own[d.id],0);
  const perSec=()=>defs.reduce((s,d)=>s+d.ps*g.own[d.id],0);
  function buildShop(){
    shop.innerHTML=defs.map(d=>`<button class="shop-item" data-id="${d.id}"><span class="emo">${d.emo}</span>
      <span><b>${d.name}</b><small>${d.desc} · <span class="c">${cost(d)}</span> 🌸</small></span>
      <span class="owned" data-o>${g.own[d.id]}</span></button>`).join('');
    $$('.shop-item',shop).forEach(b=>b.onclick=()=>buy(b.dataset.id));
  }
  function buy(id){
    const d=defs.find(x=>x.id===id), c=cost(d);
    if(g.p<c){ sfx.bad(); toast('not enough petals yet 🌸'); return; }
    g.p-=c; g.own[id]++; sfx.good(); save(); buildShop(); paint();
    if(g.own[id]===1) toast(`${d.emo} ${d.name} joined the garden!`);
  }
  function paint(){
    $('#gPetals').textContent=Math.floor(g.p).toLocaleString();
    $('#gClick').textContent=perClick(); $('#gPS').textContent=perSec();
    $$('.shop-item',shop).forEach(b=>{ const d=defs.find(x=>x.id===b.dataset.id);
      b.querySelector('.c').textContent=cost(d); b.querySelector('[data-o]').textContent=g.own[d.id]; b.disabled=g.p<cost(d); });
  }
  function save(){ store.set('garden',g); stats.petals=g.total; saveStats(); }
  $('#tree').onpointerdown=e=>{
    const add=perClick(); g.p+=add; g.total+=add; sfx.click(); paint();
    const f=document.createElement('div'); f.className='float'; f.textContent='+'+add+' 🌸';
    f.style.position='fixed'; f.style.left=(e.clientX-14)+'px'; f.style.top=(e.clientY-20)+'px'; f.style.zIndex=6;
    document.body.appendChild(f); setTimeout(()=>f.remove(),900);
    if(Math.floor(g.total)%500===0) $('#gSay').textContent=pick(['the tree is thriving','petals everywhere. no regrets.','a very productive relationship with a tree']);
  };
  $('#gReset').onclick=()=>{ if(!confirm('Start the garden over? All petals and helpers go away.')) return;
    g={p:0,own:{},total:g.total}; defs.forEach(d=>g.own[d.id]=0); save(); buildShop(); paint(); toast('fresh soil 🌱'); };
  SYNC.onRemote('garden', v=>{ if(v){ g=Object.assign({p:0,own:{},total:0}, v);
    defs.forEach(d=>{ if(g.own[d.id]==null) g.own[d.id]=0; }); buildShop(); paint(); } });
  buildShop(); paint();
  setInterval(()=>{ const ps=perSec(); if(ps){ g.p+=ps/10; g.total+=ps/10; paint(); } },100);
  setInterval(save,4000);
})();
