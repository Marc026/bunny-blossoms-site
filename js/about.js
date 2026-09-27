/* ================= ABOUT US: timeline ================= */
(function(){
  let tl=store.get('timeline',[]);
  function render(){
    const list=$('#tlList');
    if(!tl.length){ list.innerHTML='<p class="tiny">No memories yet — add your first below 🌸</p>'; return; }
    const sorted=[...tl].sort((a,b)=>a.date.localeCompare(b.date));
    list.innerHTML=sorted.map(e=>{
      const d=new Date(e.date+'T00:00:00');
      const ds=isNaN(d)?e.date:d.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'});
      return `<div class="tlEntry"><div class="tlDate">${ds}</div><div class="tlBody"><b>${e.title}</b>${e.note?`<p>${e.note}</p>`:''}</div><button class="tlDel" data-id="${e.id}">✕</button></div>`;
    }).join('');
    $$('.tlDel',list).forEach(b=>b.onclick=()=>{ tl=tl.filter(e=>e.id!==b.dataset.id); save(); render(); });
  }
  function save(){ store.set('timeline',tl); }
  $('#tlAdd').onclick=()=>{
    const d=$('#tlDateIn').value, t=$('#tlTitleIn').value.trim(), n=$('#tlNoteIn').value.trim();
    if(!d||!t){ toast('add a date and a title 🌸'); return; }
    tl.push({id:'t'+Date.now(),date:d,title:t,note:n}); save(); render(); sfx.good();
    $('#tlTitleIn').value=''; $('#tlNoteIn').value='';
  };
  SYNC.onRemote('timeline', v=>{ if(Array.isArray(v)){ tl=v; render(); } });
  render();
})();

/* ================= ABOUT US: countdown ================= */
(function(){
  let cds=store.get('countdowns',[]);
  function render(){
    const list=$('#cdList');
    if(!cds.length){ list.innerHTML='<p class="tiny">No countdowns yet — add one below ⏳</p>'; return; }
    list.innerHTML=cds.map(c=>{
      const days=Math.ceil((new Date(c.date+'T00:00:00')-Date.now())/864e5);
      const txt=days>0?`${days} day${days===1?'':'s'}`:days===0?'today! 🎉':`${Math.abs(days)}d ago`;
      return `<div class="cdCard"><b>${txt}</b><small>${c.label}</small><div class="del"><button class="btn ghost" data-id="${c.id}" style="padding:6px 12px; font-size:12px">remove</button></div></div>`;
    }).join('');
    $$('.del button',list).forEach(b=>b.onclick=()=>{ cds=cds.filter(c=>c.id!==b.dataset.id); save(); render(); });
  }
  function save(){ store.set('countdowns',cds); }
  $('#cdAdd').onclick=()=>{
    const l=$('#cdLabelIn').value.trim(), d=$('#cdDateIn').value;
    if(!l||!d){ toast('add a label and a date ⏳'); return; }
    cds.push({id:'c'+Date.now(),label:l,date:d}); save(); render(); sfx.good();
    $('#cdLabelIn').value='';
  };
  SYNC.onRemote('countdowns', v=>{ if(Array.isArray(v)){ cds=v; render(); } });
  render();
  setInterval(render,3600000);
})();

/* ================= ABOUT US: songs ================= */
(function(){
  let songs=store.get('songs',[]);
  function render(){
    const list=$('#songList');
    if(!songs.length){ list.innerHTML='<p class="tiny">No songs yet — add your first below 🎵</p>'; return; }
    list.innerHTML=songs.map(s=>`<div class="songCard"><div><b>${s.title}</b><small>${s.artist||''}${s.why?' — '+s.why:''}</small></div>
      ${s.url?`<a class="btn ghost" href="${s.url}" target="_blank" rel="noopener">▶ open</a>`:''}
      <button class="tlDel" data-id="${s.id}">✕</button></div>`).join('');
    $$('.tlDel',list).forEach(b=>b.onclick=()=>{ songs=songs.filter(s=>s.id!==b.dataset.id); save(); render(); });
  }
  function save(){ store.set('songs',songs); }
  $('#sgAdd').onclick=()=>{
    const t=$('#sgTitleIn').value.trim(), a=$('#sgArtistIn').value.trim(), u=$('#sgUrlIn').value.trim(), w=$('#sgWhyIn').value.trim();
    if(!t){ toast('needs at least a title 🎵'); return; }
    songs.push({id:'s'+Date.now(),title:t,artist:a,url:u,why:w}); save(); render(); sfx.good();
    $('#sgTitleIn').value=''; $('#sgArtistIn').value=''; $('#sgUrlIn').value=''; $('#sgWhyIn').value='';
  };
  SYNC.onRemote('songs', v=>{ if(Array.isArray(v)){ songs=v; render(); } });
  render();
})();
