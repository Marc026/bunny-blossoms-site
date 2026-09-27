/* ================= SETTINGS: theme skins, calm mode, backup/restore ================= */
(function(){
  const modal=$('#settModal');
  $('#settBtn').onclick=()=>modal.classList.add('on');
  $('#settClose').onclick=()=>modal.classList.remove('on');
  modal.addEventListener('click',e=>{ if(e.target===modal) modal.classList.remove('on'); });

  const SKINS=[{id:'blossom',label:'Blossom',col:'#F58AB4'},{id:'lavender',label:'Lavender',col:'#B79CE8'},
    {id:'mint',label:'Mint',col:'#5FB79C'},{id:'sunset',label:'Sunset',col:'#F5875B'}];
  let skin=store.get('skin','blossom');
  if(skin!=='blossom') document.documentElement.setAttribute('data-skin',skin);
  function paintSkins(){
    $('#skinRow').innerHTML=SKINS.map(s=>`<div class="skinSwatch${skin===s.id?' on':''}" data-s="${s.id}" style="background:${s.col}" title="${s.label}"></div>`).join('');
    $$('.skinSwatch',$('#skinRow')).forEach(el=>el.onclick=()=>{
      skin=el.dataset.s; store.set('skin',skin);
      if(skin==='blossom') document.documentElement.removeAttribute('data-skin'); else document.documentElement.setAttribute('data-skin',skin);
      paintSkins(); sfx.click();
    });
  }
  paintSkins();

  let calm=store.get('calm',false);
  if(calm) document.documentElement.setAttribute('data-calm','1');
  const calmSw=$('#calmSw'); calmSw.classList.toggle('on',calm);
  calmSw.onclick=()=>{
    calm=!calm; store.set('calm',calm);
    if(calm) document.documentElement.setAttribute('data-calm','1'); else document.documentElement.removeAttribute('data-calm');
    calmSw.classList.toggle('on',calm); sfx.click();
  };

  $('#backupBtn').onclick=()=>{
    const data={}; for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); if(k&&k.startsWith('bb_')) data[k]=localStorage.getItem(k); }
    const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob);
    a.download=`bunny-blossoms-backup-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(a.href),4000);
    toast('backup downloaded 💾');
  };
  $('#restoreIn').onchange=e=>{
    const f=e.target.files[0]; if(!f) return;
    const fr=new FileReader();
    fr.onload=()=>{
      try{
        const data=JSON.parse(fr.result);
        Object.keys(data).forEach(k=>{ if(k.startsWith('bb_')){ try{ store.set(k.slice(3), JSON.parse(data[k])); }catch(e){} } });
        toast('restored — reloading…'); setTimeout(()=>location.reload(),900);
      }catch(err){ toast('that file didn\u2019t look right 🌸'); }
    };
    fr.readAsText(f); e.target.value='';
  };
})();
