/* ================= stats, streak, greeting ================= */
const stats=store.get('stats',{pets:0,pops:0,boops:0,petals:0});
function paintStats(){ $('#sPets').textContent=stats.pets; $('#sPops').textContent=stats.pops;
  $('#sBoops').textContent=stats.boops; $('#sPetals').textContent=Math.floor(stats.petals); }
function saveStats(){ store.set('stats',stats); paintStats(); }
paintStats();
SYNC.onRemote('stats', v=>{ Object.assign(stats, v||{}); paintStats(); });

let visits=store.get('visits',0)+1; store.set('visits',visits); $('#sVisits').textContent=visits;
(function(){
  const today=new Date().toDateString();
  const st=store.get('streak',{last:null,n:0});
  if(st.last!==today){
    const y=new Date(Date.now()-864e5).toDateString();
    st.n = st.last===y ? st.n+1 : 1;
    st.last=today; store.set('streak',st);
    if(st.n>1) setTimeout(()=>toast(`${st.n} days in a row 🔥 hi again ${HER}`),900);
  }
  $('#sStreak').textContent=st.n||1;
})();

function paintGreet(){
  const hr=new Date().getHours();
  const when=hr<5?'up late':hr<12?'good morning':hr<18?'good afternoon':'good evening';
  $('#greet').textContent=`${when}, ${HER} 🌸`;
}
paintGreet();

const heroLines=[
  'This bunny has been waiting all day for you to show up.',
  'Officially the second cutest thing on this page.',
  'Warning: this site contains an unregulated amount of pink.',
  'The bunny has prepared absolutely nothing but is very excited.',
  `Built by ${HIM}, who thinks about you a concerning amount.`,
  'All petals on this page are locally sourced and free-range.',
  'Nine tabs of nonsense, all of it yours.'
];
$('#heroLine').textContent=pick(heroLines);

function petHero(){
  stats.pets++; saveStats(); sfx.boop();
  const el=$('#heroBunny'); el.style.transform='rotate(-4deg) scale(1.05)';
  setTimeout(()=>el.style.transform='',160);
  if(stats.pets%5===0) toast(pick(['🫧 happy bunny noises','the bunny has logged this pet','*aggressive nuzzling*','heart status: full','again. again. again.']));
}
$('#heroBunny').onclick=petHero; $('#petHeroBtn').onclick=petHero;

function rain(chars){
  const n=REDUCED?10:26;
  for(let i=0;i<n;i++){
    const d=document.createElement('div'); d.className='rain'; d.textContent=pick(chars);
    d.style.left=rnd(0,96)+'vw'; d.style.fontSize=rnd(20,44)+'px';
    d.style.transition=`transform ${rnd(2.4,4.2)}s linear, opacity .6s`;
    document.body.appendChild(d);
    requestAnimationFrame(()=>{ d.style.transform=`translateY(${innerHeight+140}px) rotate(${rnd(-260,260)}deg)`; });
    setTimeout(()=>{ d.style.opacity='0'; setTimeout(()=>d.remove(),600); },rnd(2200,3800));
  }
}
$('#surpriseBtn').onclick=()=>{ sfx.win(); pick([
  ()=>{rain(['🌸','🐰','💖','🌷']); toast('petal storm!');},
  ()=>{$('#heroLine').textContent=pick(heroLines); toast('the bunny has a new thought');},
  ()=>{rain(['🥕','🥕','🐰']); toast('someone dropped the carrots');},
  ()=>{goTab('notes'); setTimeout(()=>$('#noteBtn').click(),450);},
  ()=>{goTab('wheels'); setTimeout(()=>$('#spinFood').click(),450);},
  ()=>{rain(['✨','🫧','💫','🌸']); toast('sparkles, obviously');}
])(); };

/* ================= hug meter ================= */
(function(){
  const btn=$('#hugBtn'), fill=$('#hugFill');
  let raf=null, t0=0, holding=false;
  let n=store.get('hugs',0); $('#hugCount').textContent=n;
  SYNC.onRemote('hugs', v=>{ n=v||0; $('#hugCount').textContent=n; });
  const DUR=2600;
  function frame(t){
    if(!holding) return;
    const p=clamp((t-t0)/DUR,0,1);
    fill.style.width=(p*100)+'%';
    if(p<1){ if(Math.random()<.2) blip(300+p*500,.04,'sine',.04); raf=requestAnimationFrame(frame); }
    else{ holding=false; fill.style.width='100%';
      n++; store.set('hugs',n); $('#hugCount').textContent=n;
      $('#hugSay').textContent=pick(['HUG DELIVERED 🤗','squeezed. tightly.','that one was a good one','one (1) hug, express shipping','consider yourself held']);
      sfx.win(); rain(['🤗','💖','🌸']);
      setTimeout(()=>fill.style.width='0%',1200);
    }
  }
  const start=e=>{ e.preventDefault(); holding=true; t0=performance.now(); $('#hugSay').textContent='hold it…'; cancelAnimationFrame(raf); raf=requestAnimationFrame(frame); };
  const stop=()=>{ if(!holding) return; holding=false; cancelAnimationFrame(raf);
    fill.style.width='0%'; $('#hugSay').textContent=pick(['too early! hug incomplete 😤','the bunny felt cheated','hold it a bit longer 🥺']); sfx.bad(); };
  btn.addEventListener('pointerdown',start);
  btn.addEventListener('pointerup',stop);
  btn.addEventListener('pointerleave',stop);
  btn.addEventListener('pointercancel',stop);
})();
