/* ================= ACHIEVEMENTS ================= */
(function(){
  const BADGES=[
    {id:'firstBoop',ic:'👆',name:'First Boop',desc:'Boop the bunny once',check:()=>(store.get('boops',0)||0)>=1},
    {id:'booper100',ic:'🏅',name:'Certified Booper',desc:'100 boops',check:()=>(store.get('boops',0)||0)>=100},
    {id:'bubbleMenace',ic:'🫧',name:'Bubble Menace',desc:'Pop 200 bubbles',check:()=>(store.get('pops',0)||0)>=200},
    {id:'greenThumb',ic:'🌸',name:'Green Thumb',desc:'Grow 1,000 petals',check:()=>((store.get('garden',{})||{}).total||0)>=1000},
    {id:'gardenTycoon',ic:'🌳',name:'Garden Tycoon',desc:'Grow 20,000 petals',check:()=>((store.get('garden',{})||{}).total||0)>=20000},
    {id:'bestFriend',ic:'🐰',name:"Bunny's Best Friend",desc:'25 pets & cuddles',check:()=>((store.get('stats',{})||{}).pets||0)>=25},
    {id:'hugger',ic:'🤗',name:'Hug Enthusiast',desc:'Deliver 10 hugs',check:()=>(store.get('hugs',0)||0)>=10},
    {id:'jackpot',ic:'🎰',name:'Jackpot',desc:'Hit a slots jackpot',check:()=>(store.get('slotWins',0)||0)>=1},
    {id:'fashionista',ic:'🎀',name:'Fashionista',desc:'Change the outfit',check:()=>{const l=store.get('look',{})||{}; return (l.bow&&l.bow!=='rose')||(l.acc&&l.acc!=='bow');}},
    {id:'champion',ic:'🏆',name:'Games Champion',desc:'A strong score in any game',
      check:()=>(store.get('catchBest',0)||0)>=15||(store.get('heartBest',0)||0)>=20||(store.get('simonBest',0)||0)>=8||(store.get('whackBest',0)||0)>=20||(store.get('hopBest',0)||0)>=30||(store.get('flapBest',0)||0)>=10},
    {id:'decisionMaker',ic:'🎡',name:'Decision Maker',desc:'Spin a wheel 5 times',check:()=>(store.get('wheelSpins',0)||0)>=5},
    {id:'collector',ic:'💌',name:'Note Collector',desc:'Pull 15 notes',check:()=>(store.get('notesPulled',0)||0)>=15},
    {id:'devoted',ic:'🔥',name:'Devoted',desc:'A 7-day streak',check:()=>((store.get('streak',{})||{}).n||0)>=7}
  ];
  const grid=$('#badgeGrid');
  let unlocked=store.get('achievements',[]);
  function render(){
    grid.innerHTML=BADGES.map(b=>{ const got=unlocked.includes(b.id);
      return `<div class="badge${got?' got':''}"><div class="ic">${got?b.ic:'❓'}</div><b>${b.name}</b><small>${b.desc}</small></div>`; }).join('');
  }
  function recompute(){
    let changed=false;
    BADGES.forEach(b=>{ if(!unlocked.includes(b.id) && b.check()){ unlocked=[...unlocked,b.id]; changed=true; } });
    render();
    if(changed){ store.set('achievements',unlocked);
      if($('#p-achieve').classList.contains('on')){ sfx.win(); rain(['🏆','✨']); toast('badge unlocked! 🏆'); } }
  }
  SYNC.onRemote('achievements', v=>{ if(Array.isArray(v)){ v.forEach(id=>{ if(!unlocked.includes(id)) unlocked=[...unlocked,id]; }); render(); } });
  ['stats','garden','hugs','look','slotWins','pops','boops','catchBest','heartBest','simonBest','whackBest','hopBest','flapBest','wheelSpins','notesPulled']
    .forEach(k=>SYNC.onRemote(k,()=>recompute()));
  const tab=document.querySelector('[data-p="achieve"]'); if(tab) tab.addEventListener('click',recompute);
  recompute();
})();
