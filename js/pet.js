/* ================= BUNNY PET ================= */
(function(){
  const el=$('#petBunny');
  function decay(obj){
    const now=Date.now(), hrs=Math.max(0,(now-(obj.last||now))/36e5);
    obj.hun=clamp((obj.hun??80)-hrs*7,0,100); obj.hap=clamp((obj.hap??80)-hrs*5,0,100); obj.ene=clamp((obj.ene??90)+hrs*4,0,100);
    obj.last=now; if(!obj.born) obj.born=now; return obj;
  }
  let p=decay(store.get('pet',{hun:80,hap:80,ene:90,name:'',born:Date.now(),last:Date.now()}));
  $('#petName').value=p.name||'';
  function save(){ p.last=Date.now(); store.set('pet',p); }
  function mood(){
    if(p.ene<18) return {face:{eyes:'closed',sleepy:true}, say:'…so sleepy. nap time?'};
    if(p.hun<25) return {face:{mouth:'o'}, say:'tummy rumbling. carrot, please 🥕'};
    if(p.hap<30) return {face:{eyes:'open',mouth:'o',blush:false}, say:`it missed you, ${HER}. a lot.`};
    if(p.hap>85&&p.hun>70) return {face:{eyes:'closed'}, say:'blissful. absolutely thriving 💖'};
    return {face:{}, say:'happy little bunny.'};
  }
  function paint(){
    const m=mood(); el.innerHTML=bunny(m.face); $('#petSay').textContent=m.say;
    $('#bHun').style.width=p.hun+'%'; $('#bHap').style.width=p.hap+'%'; $('#bEne').style.width=p.ene+'%';
    $('#vHun').textContent=Math.round(p.hun)+'%'; $('#vHap').textContent=Math.round(p.hap)+'%'; $('#vEne').textContent=Math.round(p.ene)+'%';
    const days=Math.floor((Date.now()-p.born)/864e5), nm=p.name||'your bunny';
    $('#petAge').textContent=`${nm} has been living here for ${days===0?'less than a day':days+' day'+(days===1?'':'s')}.`;
  }
  REPAINT.push(paint);
  SYNC.onRemote('pet', v=>{ if(v && (v.last||0)>(p.last||0)){ p=decay(Object.assign({},v)); $('#petName').value=p.name||''; paint(); } });
  function hop(){ el.classList.remove('hop'); void el.offsetWidth; el.classList.add('hop'); }
  $('#petName').oninput=e=>{ p.name=e.target.value.trim(); save(); paint(); };
  $('#feedBtn').onclick=()=>{ p.hun=clamp(p.hun+22,0,100); p.hap=clamp(p.hap+4,0,100); p.ene=clamp(p.ene+3,0,100);
    save(); paint(); hop(); sfx.pop(); toast(pick(['*crunch*','carrot accepted 🥕','nom nom nom','it ate the whole thing'])); };
  $('#playBtn').onclick=()=>{ if(p.ene<12){ toast('too sleepy to play 😴'); sfx.bad(); return; }
    p.hap=clamp(p.hap+16,0,100); p.ene=clamp(p.ene-12,0,100); p.hun=clamp(p.hun-5,0,100);
    save(); paint(); hop(); sfx.good(); rain(['🎈','🌸']); toast(pick(['zoomies!! 🎈','it did a flip. sort of.','so much joy'])); };
  $('#napBtn').onclick=()=>{ el.innerHTML=bunny({eyes:'closed',sleepy:true}); $('#petSay').textContent='zzz…';
    blip(300,.6,'sine',.05,180);
    setTimeout(()=>{ p.ene=100; p.hun=clamp(p.hun-6,0,100); save(); paint(); toast('fully recharged ⚡'); },2600); };
  $('#cuddleBtn').onclick=()=>{ p.hap=clamp(p.hap+9,0,100); stats.pets++; saveStats(); save(); paint(); hop(); sfx.boop();
    toast(pick(['🫧 tiny happy noises','it melted into your arms',`you are its favourite human, ${HER}`])); };
  el.onclick=()=>{ p.hap=clamp(p.hap+3,0,100); save(); paint(); hop(); sfx.boop(); };
  paint();
  setInterval(()=>{ p.hun=clamp(p.hun-.12,0,100); p.hap=clamp(p.hap-.09,0,100); p.ene=clamp(p.ene+.06,0,100); paint(); },6000);
  setInterval(save,10000);
  addEventListener('beforeunload',save);
})();
