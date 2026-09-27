/* ================= GAME: catch the bunny ================= */
(function(){
  const arena=$('#arena'), run=$('#runner'), msg=$('#cMsg');
  let score=0, time=40, timer=null, live=false, speedy=1, lastMove=0;
  let best=store.get('catchBest',0); $('#cBest').textContent=best;
  SYNC.onRemote('catchBest', v=>{ if((v||0)>best){ best=v; $('#cBest').textContent=best; } });
  function place(cx,cy){
    const r=arena.getBoundingClientRect(), w=run.offsetWidth||82, h=run.offsetHeight||88;
    let x,y,tries=0;
    do{ x=rnd(6,r.width-w-6); y=rnd(6,r.height-h-6); tries++; }
    while(cx!=null&&Math.hypot(x+w/2-cx,y+h/2-cy)<140&&tries<30);
    run.style.left=x+'px'; run.style.top=y+'px';
  }
  function flee(cx,cy){
    const now=performance.now(); if(now-lastMove<230) return;
    const r=arena.getBoundingClientRect(), w=run.offsetWidth, h=run.offsetHeight;
    const bx=run.offsetLeft+w/2, by=run.offsetTop+h/2, dx=bx-cx, dy=by-cy, d=Math.hypot(dx,dy)||1;
    if(d>110) return;
    lastMove=now;
    const step=52+18*speedy, j=rnd(-.35,.35), ca=Math.cos(j), sa=Math.sin(j);
    const ux=(dx/d)*ca-(dy/d)*sa, uy=(dx/d)*sa+(dy/d)*ca;
    let nx=clamp(run.offsetLeft+ux*step,4,r.width-w-4), ny=clamp(run.offsetTop+uy*step,4,r.height-h-4);
    if((nx<8||nx>r.width-w-8)&&(ny<8||ny>r.height-h-8)&&Math.random()<.5) place(cx,cy);
    else { run.style.left=nx+'px'; run.style.top=ny+'px'; }
    run.style.transform=`scaleX(${dx<0?1:-1})`;
    if(Math.random()<.3) blip(rnd(520,640),.04,'sine',.04);
  }
  arena.addEventListener('pointermove',e=>{ if(!live) return;
    const r=arena.getBoundingClientRect(); flee(e.clientX-r.left,e.clientY-r.top); });
  run.addEventListener('pointerdown',e=>{
    e.stopPropagation(); if(!live) return;
    score++; speedy=Math.min(1.9,1+score*0.03); $('#cScore').textContent=score; sfx.good();
    const f=document.createElement('div'); f.className='float'; f.textContent=pick(['+1','gotcha!','🌸','caught!','💖']);
    f.style.left=(run.offsetLeft+10)+'px'; f.style.top=run.offsetTop+'px';
    arena.appendChild(f); setTimeout(()=>f.remove(),900);
    const r=arena.getBoundingClientRect(); place(e.clientX-r.left,e.clientY-r.top);
  });
  $('#cStart').onclick=()=>{
    score=0; time=40; speedy=1; live=true; $('#cScore').textContent=0; $('#cTime').textContent=40;
    msg.classList.add('hide'); run.classList.add('zoom'); place(); clearInterval(timer);
    timer=setInterval(()=>{
      time--; $('#cTime').textContent=time;
      if(time<=0){
        clearInterval(timer); live=false;
        if(score>best){best=score; store.set('catchBest',best); $('#cBest').textContent=best; sfx.win();}
        const v=score===0?'Zero. The bunny is telling everyone.':score<6?'The bunny respects the effort.':
          score<14?'Solid chasing. The bunny is winded.':score<24?'Elite reflexes. The bunny is filing a complaint.':
          'The bunny has surrendered and would like to be your friend.';
        msg.innerHTML=`<div style="font-size:24px" class="display">Caught ${score} 🐰</div><div class="tiny">${v}</div>`;
        msg.classList.remove('hide');
      }
    },1000);
  };
})();

/* ================= GAME: bunny hop ================= */
(function(){
  const field=$('#hopField'), bun=$('#hopBun'), msg=$('#rMsg');
  let live=false, raf=null, y=0, vy=0, obs=[], clouds=[], t=0, score=0, spd=3.1, last=0, spawnAt=0;
  let best=store.get('hopBest',0); $('#rBest').textContent=best;
  SYNC.onRemote('hopBest', v=>{ if((v||0)>best){ best=v; $('#rBest').textContent=best; } });
  const GROUND=66, G=0.62, JUMP=11.4;
  function reset(){
    obs.forEach(o=>o.el.remove()); obs=[]; clouds.forEach(c=>c.el.remove()); clouds=[];
    y=0; vy=0; score=0; spd=3.1; t=0; last=0; spawnAt=40;
    bun.style.transform='translateY(0)'; $('#rScore').textContent=0;
    for(let i=0;i<3;i++){ const c=document.createElement('div'); c.className='cloudy'; c.textContent=pick(['☁️','🌸','☁️']);
      c.style.left=(60+i*120)+'px'; field.appendChild(c); clouds.push({el:c,x:60+i*120,v:.35+i*.1}); }
  }
  function jump(){
    if(!live) return;
    if(y<=0.5){ vy=JUMP; blip(520,.09,'sine',.09,880); }
  }
  field.addEventListener('pointerdown',e=>{ if(!live){ return; } e.preventDefault(); jump(); });
  addEventListener('keydown',e=>{
    if(e.code==='Space'&&$('#p-games').classList.contains('on')&&live){ e.preventDefault(); jump(); }
  });
  function spawn(){
    const el=document.createElement('div'); el.className='obst';
    const kind=Math.random(); el.textContent=kind<.5?'🥕':kind<.8?'🪨':'🌷';
    const W=field.clientWidth;
    el.style.left='0px'; el.style.transform=`translateX(${W+20}px)`;
    field.appendChild(el); obs.push({el,x:W+20,w:26});
  }
  function loop(ts){
    const dt=last?clamp((ts-last)/16.67,.4,2.5):1; last=ts; t+=dt;
    vy-=G*dt; y=Math.max(0,y+vy*dt);
    if(y===0&&vy<0) vy=0;
    bun.style.transform=`translateY(${-y}px) rotate(${clamp(-vy*1.4,-14,14)}deg)`;
    clouds.forEach(c=>{ c.x-=c.v*dt; if(c.x<-40) c.x=field.clientWidth+30; c.el.style.transform=`translateX(${c.x}px)`; });
    spd=Math.min(6.2,3.1+t*0.0016);
    spawnAt-=dt;
    if(spawnAt<=0){ spawn(); spawnAt=rnd(74,124)-Math.min(30,t*0.012); }
    const bl=46, bw=52;
    for(let i=obs.length-1;i>=0;i--){
      const o=obs[i]; o.x-=spd*dt; o.el.style.transform=`translateX(${o.x}px)`;
      if(o.x<-40){ o.el.remove(); obs.splice(i,1); score++; $('#rScore').textContent=score;
        if(score%10===0) blip(900,.08,'triangle',.08); continue; }
      const hit = o.x < bl+bw-12 && o.x+o.w > bl+12 && y < 26;
      if(hit){ return end(); }
    }
    if(live) raf=requestAnimationFrame(loop);
  }
  function end(){
    live=false; cancelAnimationFrame(raf);
    if(score>best){ best=score; store.set('hopBest',best); $('#rBest').textContent=best; sfx.win(); }
    else sfx.bad();
    msg.innerHTML=`<div style="font-size:24px" class="display">Cleared ${score} 🥕</div><div class="tiny">${
      score<5?'The carrots won. Embarrassing for everyone.':score<15?'Good hopping!':score<30?'Genuinely impressive bunny piloting.':'You and that bunny are one being now.'}</div>`;
    msg.classList.remove('hide');
  }
  $('#rStart').onclick=()=>{ if(live) return; reset(); live=true; msg.classList.add('hide'); raf=requestAnimationFrame(loop); };
})();

/* ================= GAME: memory ================= */
(function(){
  const board=$('#memBoard'), faces=['🌸','🐰','🥕','🍓','🌷','🍰'];
  let first=null, lock=false, moves=0, pairs=0;
  function build(){
    moves=0; pairs=0; first=null; lock=false;
    $('#mMoves').textContent=0; $('#mPairs').textContent=0; $('#mSay').textContent='';
    const deck=[...faces,...faces].sort(()=>Math.random()-.5);
    board.innerHTML=deck.map(f=>`<button class="mcard" data-f="${f}"><div class="inner">
      <div class="mface mback">🌸</div><div class="mface mfront">${f}</div></div></button>`).join('');
    $$('.mcard',board).forEach(c=>c.onclick=()=>flip(c));
  }
  function flip(c){
    if(lock||c.classList.contains('flip')) return;
    c.classList.add('flip'); sfx.click();
    if(!first){ first=c; return; }
    moves++; $('#mMoves').textContent=moves;
    if(first.dataset.f===c.dataset.f){
      first.classList.add('done'); c.classList.add('done'); first=null;
      pairs++; $('#mPairs').textContent=pairs; sfx.good();
      if(pairs===6){ sfx.win(); rain(['🌸','💖']);
        $('#mSay').textContent=moves<=8?`Perfect memory in ${moves} moves. Suspicious. 🕵️`:
          moves<=12?`Cleared in ${moves} moves — very sharp 🌸`:`Cleared in ${moves} moves. The bunny is proud regardless 💕`; }
    } else { lock=true; setTimeout(()=>{ first.classList.remove('flip'); c.classList.remove('flip'); first=null; lock=false; sfx.bad(); },760); }
  }
  $('#mNew').onclick=build; build();
})();

/* ================= GAME: rps ================= */
(function(){
  const icons=['🪨','📄','✂️'], names=['rock','paper','scissors']; let w=0,l=0,t=0;
  const taunt={win:['Fine. You won. Barely.','The bunny blames the lighting.','Beginner\u2019s luck, clearly.','The bunny demands a rematch.',`You are good at this and the bunny hates it.`],
    lose:['The bunny wins and will not be humble about it.','Predictable. The bunny read your mind.','The bunny is doing a small victory hop.','Skill. Pure skill. Says the bunny.'],
    tie:['Tie. Awkward.','Great minds, apparently.','The bunny calls this a moral victory.']};
  $$('.rps').forEach(b=>b.onclick=()=>{
    const me=+b.dataset.m, bun=Math.floor(Math.random()*3);
    $('#rpsYou').textContent=icons[me]; $('#rpsBun').textContent=icons[bun];
    let r; if(me===bun){t++;r='tie';sfx.click();} else if((me+1)%3===bun){l++;r='lose';sfx.bad();} else {w++;r='win';sfx.good();}
    $('#rpsW').textContent=w; $('#rpsL').textContent=l; $('#rpsT').textContent=t;
    $('#rpsSay').textContent=`${names[me]} vs ${names[bun]} — ${pick(taunt[r])}`;
    if(r==='win'&&w%5===0) rain(['🏆','🌸']);
  });
})();

/* ================= GAME: falling hearts ================= */
(function(){
  const arena=$('#catchArena'), basket=$('#basket'), msg=$('#hMsg');
  let items=[], score=0, lives=3, live=false, raf=null, spawn=null, bx=.5, last=0;
  let best=store.get('heartBest',0); $('#hBest').textContent=best;
  SYNC.onRemote('heartBest', v=>{ if((v||0)>best){ best=v; $('#hBest').textContent=best; } });
  const good=['💖','💕','🌸','🍓','🌷','🍰'], bad=['🐝','🐝','🌩'];
  function setBasket(p){ bx=clamp(p,.04,.96); basket.style.left=(bx*100)+'%'; }
  setBasket(.5);
  arena.addEventListener('pointermove',e=>{ const r=arena.getBoundingClientRect(); setBasket((e.clientX-r.left)/r.width); });
  function drop(){
    const isBad=Math.random()<.18;
    const d=document.createElement('div'); d.className='fall'; d.textContent=isBad?pick(bad):pick(good);
    const x=rnd(.05,.95); d.style.left=(x*100)+'%'; d.style.top='-34px'; arena.appendChild(d);
    items.push({el:d,x,y:-34,v:rnd(1.0,1.7)+Math.min(1.1,score*0.012),bad:isBad});
  }
  function loop(ts){
    const r=arena.getBoundingClientRect(); const dt=last?clamp((ts-last)/16.67,.4,2.5):1; last=ts;
    for(let i=items.length-1;i>=0;i--){
      const it=items[i]; it.y+=it.v*dt;
      it.el.style.transform=`translateY(${it.y+34}px) rotate(${it.y*.4}deg)`;
      if(it.y>r.height-74&&Math.abs(it.x-bx)*r.width<46){
        it.el.remove(); items.splice(i,1);
        if(it.bad){ lives--; $('#hLives').textContent=lives; sfx.bad();
          basket.style.transform='translateX(-50%) rotate(14deg)'; setTimeout(()=>basket.style.transform='translateX(-50%)',220);
          toast(pick(['ouch! bee!','not the bee 🐝','betrayal'])); if(lives<=0) return end(); }
        else{ score++; $('#hScore').textContent=score; sfx.pop();
          basket.style.transform='translateX(-50%) scale(1.12)'; setTimeout(()=>basket.style.transform='translateX(-50%)',120); }
        continue;
      }
      if(it.y>r.height+20){ it.el.remove(); items.splice(i,1); }
    }
    if(live) raf=requestAnimationFrame(loop);
  }
  function end(){
    live=false; cancelAnimationFrame(raf); clearInterval(spawn);
    items.forEach(i=>i.el.remove()); items=[];
    if(score>best){best=score; store.set('heartBest',best); $('#hBest').textContent=best; sfx.win();}
    msg.innerHTML=`<div style="font-size:24px" class="display">${score} caught 💖</div><div class="tiny">${
      score<8?'The bees won this round.':score<20?'A respectable haul of affection.':'You are dangerously good at catching love.'}</div>`;
    msg.classList.remove('hide');
  }
  $('#hStart').onclick=()=>{
    if(live) return;
    score=0; lives=3; live=true; last=0; $('#hScore').textContent=0; $('#hLives').textContent=3; msg.classList.add('hide');
    clearInterval(spawn); spawn=setInterval(drop,1000); drop();
    cancelAnimationFrame(raf); raf=requestAnimationFrame(loop);
  };
})();

/* ================= GAME: bunny says ================= */
(function(){
  const pads=$$('#simon .pad'), tones=[392,523,659,784];
  let seq=[], step=0, playing=false, accept=false;
  let best=store.get('simonBest',0); $('#siBest').textContent=best;
  SYNC.onRemote('simonBest', v=>{ if((v||0)>best){ best=v; $('#siBest').textContent=best; } });
  function lightUp(i,ms=460){ const p=pads[i]; p.classList.add('lit'); blip(tones[i],ms/1000*.9,'triangle',.11);
    setTimeout(()=>p.classList.remove('lit'),ms-70); }
  function show(){ playing=true; accept=false; $('#siSay').textContent='watch…';
    seq.forEach((k,i)=>setTimeout(()=>{ lightUp(k);
      if(i===seq.length-1) setTimeout(()=>{ playing=false; accept=true; step=0; $('#siSay').textContent='your turn 🎵'; },560); },i*620)); }
  function next(){ seq.push(Math.floor(Math.random()*4)); $('#siLvl').textContent=seq.length; setTimeout(show,520); }
  pads.forEach((p,i)=>p.onclick=()=>{
    if(!accept){ if(!playing) blip(tones[i],.15,'triangle',.08); return; }
    lightUp(i,240);
    if(seq[step]===i){
      step++;
      if(step===seq.length){ accept=false; sfx.good();
        if(seq.length>best){best=seq.length; store.set('simonBest',best); $('#siBest').textContent=best;}
        $('#siSay').textContent=pick(['nice! 🌸','perfect','the bunny nods','keep going!']); next(); }
    } else { accept=false; sfx.bad();
      $('#siSay').textContent=`Oops — it was round ${seq.length}. ${pick(['The bunny will allow a retry.','So close.','Blame the bunny\u2019s tempo.'])}`;
      seq=[]; $('#siLvl').textContent=0; }
  });
  $('#siStart').onclick=()=>{ seq=[]; step=0; $('#siLvl').textContent=0; next(); };
})();

/* ================= GAME: carrot whack ================= */
(function(){
  const grid=$('#holes'); let score=0, time=30, live=false, tmr=null, spawn=null;
  let best=store.get('whackBest',0); $('#wBest').textContent=best;
  SYNC.onRemote('whackBest', v=>{ if((v||0)>best){ best=v; $('#wBest').textContent=best; } });
  for(let i=0;i<9;i++){
    const b=document.createElement('button'); b.className='hole'; b.innerHTML='<span class="veg">🥕</span>';
    b.onpointerdown=()=>{
      if(!live||!b.classList.contains('up')) return;
      const isBun=b.dataset.kind==='bun';
      b.classList.add('bonk'); b.classList.remove('up'); setTimeout(()=>b.classList.remove('bonk'),220);
      if(isBun){ score=Math.max(0,score-1); sfx.bad(); toast(pick(['that was a napping bunny 😳','rude!','the bunny felt that'])); }
      else{ score++; sfx.pop(); }
      $('#wScore').textContent=score;
    };
    grid.appendChild(b);
  }
  const holes=$$('.hole',grid);
  function popOne(){
    const free=holes.filter(h=>!h.classList.contains('up')); if(!free.length) return;
    const h=pick(free), isBun=Math.random()<.22;
    h.dataset.kind=isBun?'bun':'carrot'; h.querySelector('.veg').textContent=isBun?'😴':'🥕';
    h.classList.add('up'); setTimeout(()=>h.classList.remove('up'), isBun?1400:rnd(950,1500));
  }
  $('#wStart').onclick=()=>{
    if(live) return;
    score=0; time=30; live=true; $('#wScore').textContent=0; $('#wTime').textContent=30;
    clearInterval(spawn); spawn=setInterval(popOne,780); popOne(); clearInterval(tmr);
    tmr=setInterval(()=>{ time--; $('#wTime').textContent=time;
      if(time<=0){ clearInterval(tmr); clearInterval(spawn); live=false; holes.forEach(h=>h.classList.remove('up'));
        if(score>best){best=score; store.set('whackBest',best); $('#wBest').textContent=best; sfx.win();}
        toast(`${score} carrots harvested 🥕`); }
    },1000);
  };
})();

/* ================= GAME: Flappy Bunny ================= */
(function(){
  const field=$('#flapField'), bun=$('#flapBun'), msg=$('#flapMsg');
  bun.innerHTML=bunny({blush:false});
  let live=false, raf=null, y=100, vy=0, pipes=[], score=0, last=0, spawnAt=0;
  let best=store.get('flapBest',0); $('#flapBest').textContent=best;
  SYNC.onRemote('flapBest', v=>{ if((v||0)>best){ best=v; $('#flapBest').textContent=best; } });
  const G=0.5, FLAP=-8.6, GAP=112;
  function reset(){
    pipes.forEach(p=>{p.top.remove();p.bot.remove();}); pipes=[];
    y=100; vy=0; score=0; last=0; spawnAt=14; $('#flapScore').textContent=0;
    bun.style.top=y+'px'; bun.style.transform='rotate(0deg)';
  }
  function flap(){ if(!live) return; vy=FLAP; blip(560,.08,'sine',.09,900); }
  field.addEventListener('pointerdown',e=>{ e.preventDefault(); if(live) flap(); });
  addEventListener('keydown',e=>{ if(e.code==='Space'&&$('#p-games').classList.contains('on')&&live){ e.preventDefault(); flap(); } });
  function spawnPipe(){
    const h=field.clientHeight, gapY=rnd(40,Math.max(60,h-40-GAP));
    const top=document.createElement('div'); top.className='pipe';
    const bot=document.createElement('div'); bot.className='pipe';
    top.style.top='0px'; top.style.height=gapY+'px';
    bot.style.top=(gapY+GAP)+'px'; bot.style.height=Math.max(10,h-gapY-GAP)+'px';
    field.appendChild(top); field.appendChild(bot);
    pipes.push({top,bot,x:field.clientWidth+10,gapY,passed:false});
  }
  function loop(ts){
    const dt=last?clamp((ts-last)/16.67,.4,2.5):1; last=ts;
    vy+=G*dt; y+=vy*dt;
    const h=field.clientHeight;
    if(y<0){y=0;vy=0;} if(y>h-30) return end();
    bun.style.top=y+'px'; bun.style.transform=`rotate(${clamp(vy*3,-24,60)}deg)`;
    spawnAt-=dt; if(spawnAt<=0){ spawnPipe(); spawnAt=rnd(88,116); }
    const bl=60, bw=46;
    for(let i=pipes.length-1;i>=0;i--){
      const p=pipes[i]; p.x-=2.5*dt;
      p.top.style.transform=`translateX(${p.x}px)`; p.bot.style.transform=`translateX(${p.x}px)`;
      if(!p.passed&&p.x+52<bl){ p.passed=true; score++; $('#flapScore').textContent=score; blip(900,.06,'triangle',.07); }
      if(p.x<-70){ p.top.remove(); p.bot.remove(); pipes.splice(i,1); continue; }
      if(p.x<bl+bw-10 && p.x+52>bl+10){ if(y<p.gapY+4 || y+30>p.gapY+GAP-4) return end(); }
    }
    if(live) raf=requestAnimationFrame(loop);
  }
  function end(){
    live=false; cancelAnimationFrame(raf);
    if(score>best){ best=score; store.set('flapBest',best); $('#flapBest').textContent=best; sfx.win(); } else sfx.bad();
    msg.innerHTML=`<div style="font-size:24px" class="display">Flew ${score} 🌸</div><div class="tiny">${score<3?'The blossoms won this round.':score<10?'Solid flying!':'Certified sky bunny.'}</div>`;
    msg.classList.remove('hide');
  }
  $('#flapStart').onclick=()=>{ if(live) return; reset(); live=true; msg.classList.add('hide'); raf=requestAnimationFrame(loop); };
})();

/* ================= GAME: Bunny Jigsaw ================= */
(function(){
  const wrap=$('#jigWrap'); const N=3;
  let img=null, order=[], sel=null;
  function builtinSrc(){
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">
      <rect width="300" height="300" fill="#FFE9F1"/><circle cx="230" cy="60" r="34" fill="#FFC6DB"/>
      <circle cx="70" cy="230" r="40" fill="#DDD1F5"/>
      <ellipse cx="112" cy="90" rx="16" ry="42" fill="#fff" stroke="#D98CAF" stroke-width="4"/>
      <ellipse cx="168" cy="90" rx="16" ry="42" fill="#fff" stroke="#D98CAF" stroke-width="4"/>
      <circle cx="140" cy="160" r="58" fill="#fff" stroke="#D98CAF" stroke-width="4"/>
      <circle cx="122" cy="152" r="7" fill="#3B2A33"/><circle cx="158" cy="152" r="7" fill="#3B2A33"/>
      <ellipse cx="105" cy="168" rx="10" ry="6" fill="#F58AB4" opacity=".4"/>
      <ellipse cx="175" cy="168" rx="10" ry="6" fill="#F58AB4" opacity=".4"/>
      <circle cx="40" cy="248" r="10" fill="#F58AB4"/><circle cx="255" cy="255" r="8" fill="#79BCA8"/></svg>`;
    return 'data:image/svg+xml;base64,'+btoa(svg);
  }
  function load(src){ img=new Image(); img.onload=()=>{ order=[...Array(N*N).keys()].sort(()=>Math.random()-.5); sel=null; render(); }; img.src=src; }
  function render(){
    wrap.innerHTML='';
    order.forEach((piece,pos)=>{
      const px=piece%N, py=Math.floor(piece/N);
      const cell=document.createElement('div'); cell.className='jigCell';
      cell.style.backgroundImage=`url(${img.src})`; cell.style.backgroundPosition=`${px*50}% ${py*50}%`;
      cell.onclick=()=>tap(pos,cell);
      wrap.appendChild(cell);
    });
    checkSolved();
  }
  function tap(pos,cell){
    if(sel===null){ sel=pos; cell.classList.add('sel'); return; }
    if(sel===pos){ cell.classList.remove('sel'); sel=null; return; }
    [order[sel],order[pos]]=[order[pos],order[sel]]; sel=null; sfx.click(); render();
  }
  function checkSolved(){
    if(order.every((p,i)=>p===i)){ $('#jigSay').textContent='Solved! 🧩💖'; sfx.win(); rain(['🧩','🌸']); }
    else $('#jigSay').textContent='Tap two pieces to swap them.';
  }
  $('#jigShuffle').onclick=()=>{ order=[...Array(N*N).keys()].sort(()=>Math.random()-.5); sel=null; render(); };
  window.__jigOfferPhoto=dataUrl=>{ const b=$('#jigUsePhoto'); b.style.display='inline-block';
    b.onclick=()=>{ load(dataUrl); toast('using your photobooth shot 📸'); }; };
  load(builtinSrc());
})();

/* ================= GAME: Tic-Tac-Toe vs Bunny ================= */
(function(){
  const grid=$('#tttGrid'); let board=Array(9).fill(null), over=false;
  const LINES=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  function winner(b){ for(const [a,c,d] of LINES) if(b[a]&&b[a]===b[c]&&b[a]===b[d]) return b[a]; return b.includes(null)?null:'tie'; }
  function bunnyMove(){
    const empty=board.map((v,i)=>v?null:i).filter(v=>v!==null);
    for(const i of empty){ const t=[...board]; t[i]='o'; if(winner(t)==='o') return i; }
    for(const i of empty){ const t=[...board]; t[i]='x'; if(winner(t)==='x') return i; }
    if(!board[4]) return 4;
    const corners=[0,2,6,8].filter(i=>!board[i]); if(corners.length) return pick(corners);
    return pick(empty);
  }
  function render(){
    grid.innerHTML=board.map((v,i)=>`<button class="tttCell" data-i="${i}" ${v||over?'disabled':''}>${v==='x'?'❌':v==='o'?'🐰':''}</button>`).join('');
    $$('.tttCell',grid).forEach(b=>b.onclick=()=>play(+b.dataset.i));
  }
  function play(i){
    if(over||board[i]) return;
    board[i]='x'; sfx.click();
    let w=winner(board);
    if(!w){ board[bunnyMove()]='o'; sfx.boop(); w=winner(board); }
    render();
    if(w){ over=true;
      $('#tttSay').textContent = w==='x'?'You win! The bunny is shocked. 🎉' : w==='o'?'The bunny wins. It will not be humble about it.' : "Tie — nobody's ego survives intact.";
      if(w==='x'){ sfx.win(); rain(['🎉','🌸']); } else if(w==='o') sfx.bad();
    } else $('#tttSay').textContent='Your move.';
  }
  $('#tttReset').onclick=()=>{ board=Array(9).fill(null); over=false; $('#tttSay').textContent='Your move.'; render(); };
  render();
})();

/* ================= GAME: Coloring Book ================= */
(function(){
  const svg=$('#colorSVG');
  svg.innerHTML=`<ellipse cx="100" cy="180" rx="60" ry="8" fill="#00000010"/>
    <ellipse class="fillable" data-part="earL" cx="72" cy="55" rx="16" ry="42" fill="#fff"/>
    <ellipse class="fillable" data-part="earR" cx="128" cy="55" rx="16" ry="42" fill="#fff"/>
    <circle class="fillable" data-part="head" cx="100" cy="115" r="55" fill="#fff"/>
    <circle cx="86" cy="108" r="6" fill="#3B2A33"/><circle cx="114" cy="108" r="6" fill="#3B2A33"/>
    <ellipse class="fillable" data-part="f1" cx="30" cy="150" rx="16" ry="10" fill="#fff"/>
    <ellipse class="fillable" data-part="f2" cx="170" cy="150" rx="16" ry="10" fill="#fff"/>
    <circle class="fillable" data-part="f1c" cx="30" cy="150" r="6" fill="#fff"/>
    <circle class="fillable" data-part="f2c" cx="170" cy="150" r="6" fill="#fff"/>`;
  const colors=['#F58AB4','#FFC6DB','#AEE3D2','#FFF0C9','#DDD1F5','#8FC7E8','#FFFFFF','#453039'];
  let cur=colors[0];
  $('#colorPalette').innerHTML=colors.map(c=>`<div class="swat${c===cur?' on':''}" data-c="${c}" style="background:${c}"></div>`).join('');
  $$('.swat',$('#colorPalette')).forEach(s=>s.onclick=()=>{ cur=s.dataset.c;
    $$('.swat',$('#colorPalette')).forEach(x=>x.classList.remove('on')); s.classList.add('on'); });
  $$('.fillable',svg).forEach(el=>el.addEventListener('click',()=>{ el.setAttribute('fill',cur); sfx.click(); }));
  $('#colorReset').onclick=()=>{ $$('.fillable',svg).forEach(el=>el.setAttribute('fill','#fff')); sfx.click(); };
})();

/* ================= GAME: Petal Words (Wordle) ================= */
(function(){
  const WORDS=['BUNNY','SWEET','PETAL','CRUSH','SMILE','FRESH','CANDY','PEACH','HONEY','CHARM',
    'DREAM','HAPPY','LUCKY','DANCE','MUSIC','LIGHT','CLOUD','BLOOM','FLUFF','GRACE','SPARK','QUIET','TULIP','MAGIC','GLEAM','CRISP'];
  const KEYROWS=['QWERTYUIOP','ASDFGHJKL','ZXCVBNM'];
  let answer='', row=0, col=0, guesses=[], over=false;
  function cellClass(ri,ci){
    const g=guesses[ri], ch=g[ci]; if(!ch) return '';
    if(ch===answer[ci]) return 'hit';
    const total=answer.split('').filter(c=>c===ch).length;
    const hits=g.filter((c,i)=>c===ch&&answer[i]===c).length;
    const usedBefore=g.slice(0,ci).filter((c,i)=>c===ch&&answer[i]!==c).length;
    return (answer.includes(ch)&&(hits+usedBefore)<total)?'near':'miss';
  }
  function renderGrid(){
    $('#wdGrid').innerHTML=guesses.map((g,ri)=>`<div class="wdRow">${g.map((ch,ci)=>
      `<div class="wdCell ${ri<row?cellClass(ri,ci):''}">${ch}</div>`).join('')}</div>`).join('');
  }
  function renderKeys(){
    const rank={miss:0,near:1,hit:2}, used={};
    for(let r=0;r<row;r++) for(let c=0;c<5;c++){ const ch=guesses[r][c], cl=cellClass(r,c);
      if(!(ch in used)||rank[cl]>rank[used[ch]]) used[ch]=cl; }
    $('#wdKeys').innerHTML=KEYROWS.map((r,ri)=>r.split('').map(k=>`<button class="wdKey${used[k]?' '+used[k]:''}" data-k="${k}">${k}</button>`).join('')
      +(ri===2?`<button class="wdKey wide" data-k="ENTER">enter</button><button class="wdKey wide" data-k="BACK">⌫</button>`:'')).join('');
    $$('.wdKey',$('#wdKeys')).forEach(b=>b.onclick=()=>handleKey(b.dataset.k));
  }
  function handleKey(k){
    if(over) return;
    if(k==='BACK'){ if(col>0){ col--; guesses[row][col]=''; renderGrid(); } return; }
    if(k==='ENTER'){
      if(col<5){ $('#wdSay').textContent='Five letters first 🌷'; return; }
      const g=guesses[row].join(''); row++; col=0; renderGrid(); renderKeys();
      if(g===answer){ over=true; sfx.win(); rain(['🌷','🎉']); $('#wdSay').textContent='Got it! 🌷'; }
      else if(row>=6){ over=true; sfx.bad(); $('#wdSay').textContent=`So close — it was ${answer}.`; }
      else sfx.click();
      return;
    }
    if(/^[A-Z]$/.test(k)&&col<5&&row<6){ guesses[row][col]=k; col++; renderGrid(); sfx.click(); }
  }
  function newWord(){ answer=pick(WORDS); row=0; col=0; over=false; guesses=Array.from({length:6},()=>Array(5).fill(''));
    renderGrid(); renderKeys(); $('#wdSay').textContent='Guess the word 🌷'; }
  addEventListener('keydown',e=>{
    if(!$('#p-games').classList.contains('on')||e.target.tagName==='INPUT') return;
    const k=e.key.toUpperCase();
    if(k==='ENTER') handleKey('ENTER'); else if(k==='BACKSPACE') handleKey('BACK'); else if(/^[A-Z]$/.test(k)) handleKey(k);
  });
  $('#wdNew').onclick=newWord;
  newWord();
})();
