/* ================= FIDGET: bubble wrap ================= */
(function(){
  const sheet=$('#wrap-sheet');
  let popped=store.get('pops',0); $('#popCount').textContent=popped; stats.pops=popped; paintStats();
  SYNC.onRemote('pops', v=>{ popped=v||0; $('#popCount').textContent=popped; stats.pops=popped; paintStats(); });
  function build(){
    sheet.innerHTML=''; const n=innerWidth<560?49:70;
    for(let i=0;i<n;i++){
      const b=document.createElement('button'); b.className='bub'; b.setAttribute('aria-label','bubble');
      b.onpointerenter=e=>{ if(e.pointerType==='mouse'&&e.buttons===1) pop(b); };
      b.onpointerdown=()=>pop(b); sheet.appendChild(b);
    }
  }
  function pop(b){
    if(b.classList.contains('pop')) return;
    b.classList.add('pop'); sfx.pop();
    popped++; stats.pops=popped; store.set('pops',popped); $('#popCount').textContent=popped; saveStats();
    if(popped%100===0){ toast(`${popped} bubbles. absolute menace 🫧`); rain(['🫧']); }
    if(!$$('.bub:not(.pop)',sheet).length) setTimeout(()=>{build(); toast('fresh sheet, because you earned it');},520);
  }
  $('#newSheet').onclick=()=>{build(); sfx.click();};
  $('#popAll').onclick=()=>$$('.bub:not(.pop)',sheet).forEach((b,i)=>setTimeout(()=>pop(b),i*18));
  build();
})();

/* ================= FIDGET: boop ================= */
(function(){
  const el=$('#boopBunny');
  let n=store.get('boops',0), combo=0, comboT=null;
  $('#boopCount').textContent=n; stats.boops=n; paintStats();
  SYNC.onRemote('boops', v=>{ n=v||0; $('#boopCount').textContent=n; stats.boops=n; paintStats(); });
  const says=['boop!','bnuuy accepts','*nose wiggle*','that tickles','boop received 💖','hehe','again?','snoot has been booped','the bunny is pleased','ow (affectionate)'];
  const miles={10:'ten boops! certified booper 🏅',50:'fifty. the snoot is famous now.',100:'100 boops. this is your personality now 🐰',250:'250 boops. the bunny named a star after you.',500:'500 BOOPS. genuinely incredible.'};
  el.onpointerdown=()=>{
    n++; combo++; store.set('boops',n); stats.boops=n; saveStats();
    $('#boopCount').textContent=n; $('#boopCombo').textContent=combo; $('#boopSay').textContent=pick(says);
    el.classList.remove('squish'); void el.offsetWidth; el.classList.add('squish'); sfx.boop();
    if(combo===8){ el.innerHTML=bunny({eyes:'closed',mouth:'o'}); setTimeout(()=>el.innerHTML=bunny(),900); }
    if(miles[n]){ toast(miles[n]); rain(['👆','🐰','💖']); }
    clearTimeout(comboT); comboT=setTimeout(()=>{combo=0; $('#boopCombo').textContent=0;},1500);
  };
})();

/* ================= FIDGET: spinner + switches ================= */
(function(){
  const el=$('#spinner'); let ang=0, vel=0, dragging=false, lastA=0, lastT=0, counted=0;
  let n=store.get('spins',0); $('#spinCount').textContent=n;
  SYNC.onRemote('spins', v=>{ n=v||0; $('#spinCount').textContent=n; });
  const angleOf=e=>{ const r=el.getBoundingClientRect();
    return Math.atan2(e.clientY-(r.top+r.height/2),e.clientX-(r.left+r.width/2))*180/Math.PI; };
  el.addEventListener('pointerdown',e=>{dragging=true; el.setPointerCapture(e.pointerId); lastA=angleOf(e); lastT=performance.now(); vel=0;});
  el.addEventListener('pointermove',e=>{
    if(!dragging) return;
    const a=angleOf(e); let d=a-lastA; if(d>180)d-=360; if(d<-180)d+=360;
    ang+=d; const t=performance.now(); vel=d/Math.max(8,t-lastT)*16; lastA=a; lastT=t;
    el.style.transform=`rotate(${ang}deg)`;
  });
  el.addEventListener('pointerup',()=>dragging=false);
  el.addEventListener('pointercancel',()=>dragging=false);
  (function tick(){
    if(!dragging&&Math.abs(vel)>.05){
      ang+=vel; vel*=0.986; el.style.transform=`rotate(${ang}deg)`;
      const s=Math.floor(Math.abs(ang)/360);
      if(s>counted){ counted=s; n++; store.set('spins',n); $('#spinCount').textContent=n; if(Math.abs(vel)>2) blip(rnd(900,1300),.03,'square',.03); }
    } else if(!dragging) counted=Math.floor(Math.abs(ang)/360);
    requestAnimationFrame(tick);
  })();
  const lines=['click.','satisfying.','you flipped it. nothing happened. perfect.','that one does laundry (it does not).','ok that one was the good one.','flip it back. go on.'];
  $$('[data-sw]').forEach(sw=>sw.onclick=()=>{
    sw.classList.toggle('on'); blip(sw.classList.contains('on')?900:520,.05,'square',.07);
    $('#swSay').textContent=pick(lines);
    if($$('[data-sw].on').length===4){ toast('all four! you have unlocked absolutely nothing 🎉'); rain(['🎉','🌸']); }
  });
  const sl=$('#sl'); sl.oninput=()=>{ $('#slSay').textContent=sl.value; blip(300+sl.value*7,.02,'sine',.03); };
})();

/* ================= FIDGET: zen sand ================= */
(function(){
  const cv=$('#zen'), cx=cv.getContext('2d'); let drawing=false, px=0, py=0, deco=[];
  const sandColor=()=>getComputedStyle(document.documentElement).getPropertyValue('--sand').trim()||'#F6E3CE';
  function stamp(x,y,e){ cx.font='30px serif'; cx.textAlign='center'; cx.textBaseline='middle'; cx.fillText(e,x,y); }
  function fresh(){
    const w=cv.clientWidth, h=cv.clientHeight;
    if(!w||!h) return;                          // hidden tab: nothing to size yet
    cv.width=w*devicePixelRatio; cv.height=h*devicePixelRatio;
    cx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
    cv._pw=w; cv._ph=h;
    cx.fillStyle=sandColor(); cx.fillRect(0,0,w,h);
    cx.globalAlpha=.35;
    for(let i=0;i<900;i++){ cx.fillStyle=Math.random()<.5?'#fff':'#00000012'; cx.fillRect(Math.random()*w,Math.random()*h,1.6,1.6); }
    cx.globalAlpha=1; deco.forEach(d=>stamp(d.x,d.y,d.e));
  }
  function ensureSized(force){
    const w=cv.clientWidth, h=cv.clientHeight;
    if(!w||!h) return;                          // still hidden
    if(force || cv._pw!==w || cv._ph!==h) fresh(); // only repaint on a real size change
  }
  function rake(x,y,ox,oy){
    cx.lineCap='round'; cx.lineWidth=3;
    const dx=x-ox,dy=y-oy,len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len;
    [-9,0,9].forEach((off,i)=>{ cx.strokeStyle=i===1?'rgba(255,255,255,.85)':'rgba(150,110,80,.35)';
      cx.beginPath(); cx.moveTo(ox+nx*off,oy+ny*off); cx.lineTo(x+nx*off,y+ny*off); cx.stroke(); });
  }
  const pos=e=>{const r=cv.getBoundingClientRect(); return [e.clientX-r.left,e.clientY-r.top];};
  cv.addEventListener('pointerdown',e=>{drawing=true; cv.setPointerCapture(e.pointerId); [px,py]=pos(e);});
  cv.addEventListener('pointermove',e=>{ if(!drawing) return; const [x,y]=pos(e);
    if(Math.hypot(x-px,y-py)>2){ rake(x,y,px,py); if(Math.random()<.12) blip(rnd(200,300),.04,'sawtooth',.02); px=x; py=y; } });
  cv.addEventListener('pointerup',()=>drawing=false);
  cv.addEventListener('pointercancel',()=>drawing=false);
  $('#zClear').onclick=()=>{ ensureSized(); deco=[]; fresh(); sfx.click(); };
  $('#zStone').onclick=()=>{ ensureSized(); if(!cv._pw) return;
    const d={x:rnd(40,cv.clientWidth-40),y:rnd(40,cv.clientHeight-40),e:pick(['🪨','🗿','🪵'])};
    deco.push(d); stamp(d.x,d.y,d.e); blip(180,.12,'sine',.08); };
  $('#zPetal').onclick=()=>{ ensureSized(); if(!cv._pw) return;
    for(let i=0;i<7;i++){ const d={x:rnd(20,cv.clientWidth-20),y:rnd(20,cv.clientHeight-20),e:pick(['🌸','🌷','🍃'])};
    deco.push(d); stamp(d.x,d.y,d.e);} sfx.pop(); };
  // sizes itself the moment the canvas actually gets laid out (e.g. when the Fidget tab
  // is opened for the first time) instead of guessing with a fixed timeout
  if('ResizeObserver' in window) new ResizeObserver(()=>ensureSized()).observe(cv);
  else { setTimeout(()=>ensureSized(),80); addEventListener('resize',()=>{ clearTimeout(cv._t); cv._t=setTimeout(()=>ensureSized(),200); }); }
  new MutationObserver(()=>setTimeout(()=>ensureSized(true),60)).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
})();

/* ================= FIDGET: Snow Globe ================= */
(function(){
  const wrap=$('#globeWrap'), cv=$('#globeCanvas'), cx=cv.getContext('2d');
  let W,H,particles=[],vx=0,vy=0,dragging=false,lastX=0,lastY=0,lastT=0;
  function size(){ const r=wrap.getBoundingClientRect(); W=cv.width=r.width; H=cv.height=r.height; }
  function make(){ particles=[]; for(let i=0;i<40;i++) particles.push({x:rnd(0,W),y:rnd(0,H),r:rnd(2,4),vx:0,vy:0,e:pick(['🌸','❀'])}); }
  function draw(){
    if(W&&H){
      cx.clearRect(0,0,W,H);
      cx.save(); cx.beginPath(); cx.arc(W/2,H/2,W/2-4,0,7); cx.clip();
      cx.fillStyle='#fff8fb'; cx.fillRect(0,0,W,H);
      particles.forEach(p=>{
        p.vy+=0.05; p.vx*=0.985; p.vy*=0.985; p.x+=p.vx+vx*0.05; p.y+=p.vy+vy*0.05;
        if(p.y>H-6){p.y=H-6;p.vy*=-0.2;} if(p.y<6){p.y=6;p.vy*=-0.2;}
        if(p.x<6){p.x=6;p.vx*=-0.2;} if(p.x>W-6){p.x=W-6;p.vx*=-0.2;}
        cx.font=(p.r*4)+'px serif'; cx.fillText(p.e,p.x-p.r*2,p.y+p.r*2);
      });
      cx.restore(); vx*=0.9; vy*=0.9;
    }
    requestAnimationFrame(draw);
  }
  const posOf=e=>{ const t=e.touches?e.touches[0]:e; const r=cv.getBoundingClientRect(); return [t.clientX-r.left,t.clientY-r.top]; };
  wrap.addEventListener('pointerdown',e=>{ dragging=true; [lastX,lastY]=posOf(e); lastT=performance.now(); });
  addEventListener('pointermove',e=>{
    if(!dragging) return; const [x,y]=posOf(e); const t=performance.now(); const dt=Math.max(8,t-lastT);
    vx=(x-lastX)/dt*16; vy=(y-lastY)/dt*16;
    particles.forEach(p=>{ p.vx+=vx*0.08; p.vy+=vy*0.08-1; });
    lastX=x; lastY=y; lastT=t;
  });
  addEventListener('pointerup',()=>dragging=false);
  size(); make(); draw();
  new ResizeObserver(()=>{ const had=W; size(); if(!had&&W) make(); }).observe(wrap);
})();

/* ================= FIDGET: Bubble Tea Maker ================= */
(function(){
  const svg=$('#cupSVG'); let layers=[], cups=store.get('teaCups',0);
  $('#teaCount').textContent='cups made: '+cups;
  function render(){
    let y=148, parts='';
    layers.forEach(l=>{ parts+=`<rect x="20" y="${y-18}" width="80" height="18" fill="${l==='tea'?'#C88A4A':l==='milk'?'#FFF3DC':'#5B3A2A'}"/>`;
      if(l==='boba') parts+=[0,1,2,3].map(i=>`<circle cx="${30+i*16}" cy="${y-9}" r="5" fill="#3A2418"/>`).join('');
      y-=18; });
    svg.innerHTML=`<clipPath id="cupClip"><path d="M20 42 L100 42 L91 148 Q60 155 29 148 Z"/></clipPath>
      <g clip-path="url(#cupClip)">${parts}</g>
      <path d="M18 40 L102 40 L92 150 Q60 158 28 150 Z" fill="none" stroke="#D98CAF" stroke-width="4"/>
      <rect x="10" y="28" width="100" height="14" rx="4" fill="#fff" stroke="#D98CAF" stroke-width="4"/>
      <rect x="55" y="8" width="10" height="24" fill="#fff" stroke="#D98CAF" stroke-width="3"/>`;
  }
  function add(l){ if(layers.length>=5){ toast('cup is full! 🧋'); return; } layers.push(l); render(); }
  $('#teaBoba').onclick=()=>{ add('boba'); sfx.pop(); };
  $('#teaMilk').onclick=()=>{ add('milk'); sfx.click(); };
  $('#teaTea').onclick=()=>{ add('tea'); sfx.click(); };
  $('#teaShake').onclick=()=>{ svg.style.transform='rotate(-4deg)'; blip(300,.1,'sine',.06);
    setTimeout(()=>svg.style.transform='rotate(4deg)',90); setTimeout(()=>svg.style.transform='',180); sfx.pop(); };
  $('#teaReset').onclick=()=>{ if(layers.length){ cups++; store.set('teaCups',cups); $('#teaCount').textContent='cups made: '+cups; toast('cup finished! 🧋'); }
    layers=[]; render(); };
  render();
})();

/* ================= FIDGET: Paint Splatter ================= */
(function(){
  const cv=$('#paintCanvas'), cx=cv.getContext('2d');
  const cols=['#F58AB4','#FFC6DB','#AEE3D2','#FFF0C9','#DDD1F5','#8FC7E8'];
  function size(){ cv.width=cv.clientWidth*devicePixelRatio; cv.height=cv.clientHeight*devicePixelRatio;
    cx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0); }
  function splat(x,y){
    const col=pick(cols), n=8+Math.floor(Math.random()*6), R=rnd(14,34);
    cx.fillStyle=col; cx.beginPath();
    for(let i=0;i<n;i++){ const a=(i/n)*6.283, r=R*rnd(.4,1); const px=x+Math.cos(a)*r, py=y+Math.sin(a)*r; i===0?cx.moveTo(px,py):cx.lineTo(px,py); }
    cx.closePath(); cx.fill();
    for(let i=0;i<4;i++){ cx.beginPath(); cx.arc(x+rnd(-R,R),y+rnd(-R,R),rnd(2,6),0,7); cx.fillStyle=col; cx.fill(); }
  }
  const pos=e=>{ const r=cv.getBoundingClientRect(); return [e.clientX-r.left,e.clientY-r.top]; };
  let down=false;
  cv.addEventListener('pointerdown',e=>{ down=true; const [x,y]=pos(e); splat(x,y); sfx.pop(); });
  cv.addEventListener('pointermove',e=>{ if(down&&Math.random()<.3){ const [x,y]=pos(e); splat(x,y); } });
  addEventListener('pointerup',()=>down=false);
  $('#paintClear').onclick=()=>{ cx.clearRect(0,0,cv.clientWidth,cv.clientHeight); sfx.click(); };
  $('#paintSave').onclick=()=>{
    cv.toBlob(b=>{ if(!b) return; const fname=`bunny-blossoms-paint-${Date.now().toString().slice(-6)}.png`;
      try{ const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download=fname;
        document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(a.href),4000); toast('saved 💾'); }
      catch(e){ toast('long-press the canvas to save'); } },'image/png');
  };
  new ResizeObserver(size).observe(cv);
  size();
})();

/* ================= FIDGET: Soundboard ================= */
(function(){
  const sounds=[
    {ic:'🫧',name:'Pop',fn:()=>sfx.pop()}, {ic:'👆',name:'Boop',fn:()=>sfx.boop()},
    {ic:'🎉',name:'Ta-da',fn:()=>sfx.win()}, {ic:'🔔',name:'Chime',fn:()=>blip(880,.25,'sine',.1,1400)},
    {ic:'📄',name:'Page',fn:()=>{blip(300,.03,'square',.05); setTimeout(()=>blip(500,.03,'square',.04),40);}},
    {ic:'🌧️',name:'Rain',fn:()=>{for(let i=0;i<6;i++) setTimeout(()=>blip(rnd(500,1200),.03,'sine',.03),i*45);}},
    {ic:'😤',name:'Bonk',fn:()=>sfx.bad()},
    {ic:'✨',name:'Sparkle',fn:()=>{[1200,1500,1800].forEach((f,i)=>setTimeout(()=>blip(f,.06,'triangle',.06),i*40));}}
  ];
  $('#sbGrid').innerHTML=sounds.map((s,i)=>`<button class="sbBtn" data-i="${i}"><span class="ic">${s.ic}</span>${s.name}</button>`).join('');
  $$('.sbBtn',$('#sbGrid')).forEach((b,i)=>b.onclick=()=>sounds[i].fn());
})();
