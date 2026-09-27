/* ================= PHOTOBOOTH ================= */
(function(){
  const video=$('#cam'), camOff=$('#camOff'), cd=$('#countdown'), flash=$('#flash');
  const FILTERS=[
    {id:'none',label:'None 🌿',css:'none'},
    {id:'blossom',label:'Blossom 🌸',css:'saturate(1.25) contrast(1.05) sepia(.22) hue-rotate(295deg) brightness(1.06)'},
    {id:'soft',label:'Soft 🍑',css:'saturate(1.1) brightness(1.12) contrast(.94) blur(.4px)'},
    {id:'dreamy',label:'Dreamy ☁️',css:'brightness(1.15) saturate(.85) contrast(.9) blur(.9px)'},
    {id:'mono',label:'Mono 🖤',css:'grayscale(1) contrast(1.12)'},
    {id:'vintage',label:'Vintage 📻',css:'sepia(.55) saturate(1.3) contrast(1.05)'},
    {id:'cherry',label:'Cherry 🍒',css:'saturate(1.6) hue-rotate(-12deg) contrast(1.1)'},
    {id:'cool',label:'Cool 🫐',css:'saturate(1.15) hue-rotate(18deg) brightness(1.04)'}
  ];
  const STICKERS=[{id:'none',label:'None'},{id:'ears',label:'Bunny ears 🐰'},{id:'petals',label:'Petal corners 🌸'},
    {id:'hearts',label:'Hearts 💖'},{id:'stars',label:'Sparkles ✨'},{id:'names',label:'C + M 💞'}];
  const SLIPS=[
    {id:'pink',label:'Blossom pink',bg:'#FFD9E7',ink:'#B8376F',accent:'#F58AB4'},
    {id:'cream',label:'Cream',bg:'#FFF3DC',ink:'#A9603B',accent:'#E9A46B'},
    {id:'mint',label:'Mint',bg:'#D9F0E6',ink:'#2F6B57',accent:'#79BCA8'},
    {id:'ink',label:'Midnight',bg:'#2A1C24',ink:'#FFD9E7',accent:'#FF9EC4'}
  ];
  let filter=FILTERS[1], sticker=STICKERS[1], slip=SLIPS[0];
  let stream=null, shots=[], sel=[], stripBlob=null, busy=false;
  function chipRow(el,list,cur,on){
    el.innerHTML=list.map(f=>`<button class="chip${f.id===cur.id?' on':''}" data-id="${f.id}">${f.label}</button>`).join('');
    $$('.chip',el).forEach(b=>b.onclick=()=>{ on(list.find(x=>x.id===b.dataset.id));
      $$('.chip',el).forEach(x=>x.classList.remove('on')); b.classList.add('on'); sfx.click(); });
  }
  chipRow($('#filters'),FILTERS,filter,f=>{filter=f; video.style.filter=f.css;});
  chipRow($('#stickers'),STICKERS,sticker,s=>{sticker=s;});
  chipRow($('#slipStyles'),SLIPS,slip,s=>{slip=s;});
  video.style.filter=filter.css;

  async function startCam(){
    try{
      stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:1280},height:{ideal:960}},audio:false});
      video.srcObject=stream; camOff.classList.add('hide'); sfx.good();
    }catch(err){
      $('#camNote').innerHTML='Couldn\u2019t open the camera here (permission or browser block). You can still use <b>“Use photos instead”</b> to pick pictures from your device 🌸';
      sfx.bad();
    }
  }
  $('#camBtn').onclick=startCam;
  $('#camStop').onclick=()=>{ if(stream){stream.getTracks().forEach(t=>t.stop()); stream=null; video.srcObject=null;}
    camOff.classList.remove('hide'); sfx.click(); };

  function drawStickers(cx,w,h){
    cx.save(); cx.textAlign='center'; cx.textBaseline='middle'; const s=Math.min(w,h);
    if(sticker.id==='ears'){ cx.font=`${s*0.34}px serif`; cx.fillText('🐰',w*0.5,h*0.16);
      cx.font=`${s*0.10}px serif`; cx.fillText('🌸',w*0.24,h*0.2); }
    else if(sticker.id==='petals'){ cx.font=`${s*0.12}px serif`;
      cx.fillText('🌸',w*0.09,h*0.12); cx.fillText('🌸',w*0.91,h*0.12); cx.fillText('🌷',w*0.09,h*0.88); cx.fillText('🌸',w*0.91,h*0.88); }
    else if(sticker.id==='hearts'){ cx.font=`${s*0.11}px serif`;
      cx.fillText('💖',w*0.12,h*0.18); cx.fillText('💕',w*0.87,h*0.3); cx.fillText('💗',w*0.2,h*0.82); }
    else if(sticker.id==='stars'){ cx.font=`${s*0.1}px serif`;
      cx.fillText('✨',w*0.14,h*0.2); cx.fillText('✨',w*0.86,h*0.22); cx.fillText('💫',w*0.5,h*0.9); cx.fillText('✨',w*0.78,h*0.72); }
    else if(sticker.id==='names'){ cx.font=`800 ${s*0.09}px "Baloo 2", sans-serif`; cx.fillStyle='rgba(255,255,255,.92)';
      cx.strokeStyle='rgba(184,55,111,.65)'; cx.lineWidth=s*0.008;
      const txt=`${HER[0]} + ${HIM[0]}`; cx.strokeText(txt,w*0.5,h*0.9); cx.fillText(txt,w*0.5,h*0.9);
      cx.font=`${s*0.1}px serif`; cx.fillText('💞',w*0.86,h*0.2); }
    cx.restore();
  }
  function grab(){
    const vw=video.videoWidth, vh=video.videoHeight; if(!vw) return null;
    const W=800,H=600, cv=document.createElement('canvas'); cv.width=W; cv.height=H;
    const cx=cv.getContext('2d');
    const sw=Math.min(vw,vh*4/3), sh=sw*3/4, sx=(vw-sw)/2, sy=(vh-sh)/2;
    if('filter' in cx) cx.filter=filter.css;
    cx.translate(W,0); cx.scale(-1,1);
    cx.drawImage(video,sx,sy,sw,sh,0,0,W,H);
    cx.setTransform(1,0,0,1,0,0);
    if('filter' in cx) cx.filter='none';
    drawStickers(cx,W,H);
    return cv.toDataURL('image/jpeg',.92);
  }
  function addShot(url){ if(!url) return; shots.push(url); if(shots.length>8) shots.shift();
    if(sel.length<4) sel.push(shots.length-1); paintShots();
    if(window.__jigOfferPhoto) window.__jigOfferPhoto(url); }
  function paintShots(){
    const box=$('#shots');
    box.innerHTML=shots.map((u,i)=>{ const k=sel.indexOf(i);
      return `<div class="shot${k>=0?' sel':''}" data-i="${i}"><img src="${u}" alt="shot ${i+1}">
        ${k>=0?`<span class="no">${k+1}</span>`:''}<span class="x">${k>=0?'✓':'+'}</span></div>`; }).join('');
    $$('.shot',box).forEach(s=>s.onclick=()=>{
      const i=+s.dataset.i, k=sel.indexOf(i);
      if(k>=0) sel.splice(k,1);
      else if(sel.length>=4){ toast('four is the max for a slip 🎞️'); return; }
      else sel.push(i);
      sfx.click(); paintShots();
    });
    $('#shotNote').textContent=shots.length?`${sel.length} of ${shots.length} picked for the slip`:'No shots yet 🌸';
  }
  async function countdown(n){
    cd.classList.add('on');
    for(let i=n;i>0;i--){ cd.textContent=i; blip(700,.1,'triangle',.09); await new Promise(r=>setTimeout(r,850)); }
    cd.classList.remove('on');
  }
  function doFlash(){ flash.classList.add('on'); setTimeout(()=>flash.classList.remove('on'),70); }
  $('#snapOne').onclick=async()=>{
    if(busy) return; if(!stream){ toast('turn the camera on first 📷'); return; }
    busy=true; await countdown(3); doFlash(); sfx.shutter(); addShot(grab()); busy=false;
  };
  $('#snapStrip').onclick=async()=>{
    if(busy) return; if(!stream){ toast('turn the camera on first 📷'); return; }
    busy=true; sel=[];
    for(let i=0;i<4;i++){
      toast(`shot ${i+1} of 4 — ${pick(['smile!','silly one!','look at me 🌸','freeze!'])}`);
      await countdown(3); doFlash(); sfx.shutter(); addShot(grab());
      await new Promise(r=>setTimeout(r,700));
    }
    busy=false; toast('four shots! now build the slip 🎞️'); sfx.win();
  };
  $('#fileIn').onchange=e=>{
    [...e.target.files].slice(0,4).forEach(f=>{
      const fr=new FileReader();
      fr.onload=()=>{ const img=new Image();
        img.onload=()=>{
          const W=800,H=600, cv=document.createElement('canvas'); cv.width=W; cv.height=H;
          const cx=cv.getContext('2d'); const sw=Math.min(img.width,img.height*4/3), sh=sw*3/4;
          if('filter' in cx) cx.filter=filter.css;
          cx.drawImage(img,(img.width-sw)/2,(img.height-sh)/2,sw,sh,0,0,W,H);
          if('filter' in cx) cx.filter='none';
          drawStickers(cx,W,H); addShot(cv.toDataURL('image/jpeg',.92)); sfx.pop();
        };
        img.src=fr.result; };
      fr.readAsDataURL(f);
    });
    e.target.value='';
  };
  function roundRect(cx,x,y,w,h,r){ cx.beginPath(); cx.moveTo(x+r,y); cx.arcTo(x+w,y,x+w,y+h,r);
    cx.arcTo(x+w,y+h,x,y+h,r); cx.arcTo(x,y+h,x,y,r); cx.arcTo(x,y,x+w,y,r); cx.closePath(); }
  $('#buildStrip').onclick=async()=>{
    if(!sel.length){ toast('pick at least one shot first 🌸'); sfx.bad(); return; }
    const imgs=await Promise.all(sel.map(i=>new Promise(res=>{const im=new Image(); im.onload=()=>res(im); im.src=shots[i];})));
    const n=imgs.length, PW=400, PH=300, pad=40, gap=16, top=100, foot=140;
    const W=PW+pad*2, H=top+n*PH+(n-1)*gap+foot;
    const cv=document.createElement('canvas'); cv.width=W*2; cv.height=H*2;
    const cx=cv.getContext('2d'); cx.scale(2,2);
    cx.fillStyle=slip.bg; cx.fillRect(0,0,W,H);
    cx.globalAlpha=.10; for(let i=0;i<260;i++){ cx.fillStyle=slip.ink;
      cx.beginPath(); cx.arc(Math.random()*W,Math.random()*H,Math.random()*1.6,0,7); cx.fill(); } cx.globalAlpha=1;
    cx.fillStyle=slip.ink; cx.textAlign='center';
    cx.font='800 32px "Baloo 2", Quicksand, sans-serif'; cx.fillText('BUNNY & BLOSSOMS',W/2,44);
    cx.font='700 18px Quicksand, sans-serif'; cx.fillText(`· ${HER} & ${HIM} ·`,W/2,72);
    imgs.forEach((im,i)=>{
      const y=top+i*(PH+gap);
      cx.save(); cx.shadowColor='rgba(0,0,0,.18)'; cx.shadowBlur=10; cx.shadowOffsetY=3;
      cx.fillStyle='#fff'; roundRect(cx,pad-8,y-8,PW+16,PH+16,10); cx.fill(); cx.restore();
      cx.save(); roundRect(cx,pad,y,PW,PH,6); cx.clip(); cx.drawImage(im,pad,y,PW,PH); cx.restore();
      cx.strokeStyle=slip.accent; cx.lineWidth=2; roundRect(cx,pad,y,PW,PH,6); cx.stroke();
    });
    const fy=top+n*PH+(n-1)*gap+36;
    const d=new Date().toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'});
    cx.fillStyle=slip.ink; cx.textAlign='center';
    cx.font='800 27px "Baloo 2", Quicksand, sans-serif'; cx.fillText(`${HER} 🌸`,W/2,fy);
    cx.font='700 16px Quicksand, sans-serif';
    cx.fillText(d+'  ·  '+pick(['made with too much affection','four shots, one favourite person','keep this one','certified cute']),W/2,fy+26);
    cx.font='700 15px Quicksand, sans-serif'; cx.fillText(`from ${HIM} 💕`,W/2,fy+50);
    cx.font='22px serif'; cx.fillText('🐰   🌸   💖',W/2,fy+78);
    $('#stripImg').src=cv.toDataURL('image/png'); $('#stripImg').style.display='block';
    $('#stripNote').textContent='Slip ready — hit Download (or long-press the image to save).';
    cv.toBlob(b=>{ stripBlob=b; $('#dlStrip').disabled=false; },'image/png');
    sfx.win(); toast('slip printed 🎞️');
  };
  $('#dlStrip').onclick=async()=>{
    if(!stripBlob) return;
    const fname=`photobooth-chloe-${Date.now().toString().slice(-6)}.png`;
    let saved=false;
    try{
      const dl=await window.claude?.use?.('downloads');
      if(dl){ await dl.save({filename:fname,data:stripBlob}); saved=true; toast('saved! 💾'); }
    }catch(err){ if(err&&err.code==='declined'){ toast('no worries — it\u2019s still here'); return; } }
    if(!saved){
      try{ const a=document.createElement('a'); a.href=URL.createObjectURL(stripBlob); a.download=fname;
        document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(a.href),4000); toast('downloading 💾');
      }catch(e){ $('#stripNote').textContent='Saving is blocked here — long-press (or right-click) the slip above and choose “Save image”.'; }
    }
  };
  paintShots();
})();
