/* ================= constants ================= */
const HER='Chloe', HIM='Marc';
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ================= helpers ================= */
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const rnd=(a,b)=>Math.random()*(b-a)+a, pick=a=>a[Math.floor(Math.random()*a.length)];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const store={
  get(k,d){ try{const v=localStorage.getItem('bb_'+k); return v===null?d:JSON.parse(v);}catch(e){return d;} },
  set(k,v){ try{localStorage.setItem('bb_'+k,JSON.stringify(v));}catch(e){}
    if(SYNC_ON && SHARED_KEYS.includes(k) && SYNC._push) SYNC._push(k,v); }
};

/* ================= toast, sound & theme ================= */
let toastT; function toast(m){ const t=$('#toast'); t.textContent=m; t.classList.add('show');
  clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove('show'),2000); }

let AC=null, muted=store.get('muted',false);
function ac(){ if(!AC){ try{AC=new (window.AudioContext||window.webkitAudioContext)();}catch(e){AC=null;} } return AC; }
function blip(f=600,dur=.09,type='sine',vol=.10,glide=null){
  if(muted) return; const c=ac(); if(!c) return;
  try{ const o=c.createOscillator(), g=c.createGain();
    o.type=type; o.frequency.setValueAtTime(f,c.currentTime);
    if(glide) o.frequency.exponentialRampToValueAtTime(Math.max(40,glide),c.currentTime+dur);
    g.gain.setValueAtTime(vol,c.currentTime); g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+dur);
    o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime+dur+.02);
  }catch(e){}
}
const sfx={
  pop:()=>blip(rnd(520,900),.07,'triangle',.12,180),
  boop:()=>blip(rnd(300,420),.12,'sine',.13,760),
  good:()=>{blip(660,.09,'triangle',.11); setTimeout(()=>blip(880,.11,'triangle',.11),80);},
  bad:()=>blip(180,.2,'sawtooth',.08,70),
  click:()=>blip(rnd(700,1100),.05,'square',.05),
  shutter:()=>{blip(1400,.03,'square',.09); setTimeout(()=>blip(700,.06,'square',.07),45);},
  win:()=>{[523,659,784,1046].forEach((f,i)=>setTimeout(()=>blip(f,.12,'triangle',.1),i*95));}
};
$('#soundBtn').textContent=muted?'🔕':'🔔';
$('#soundBtn').onclick=()=>{muted=!muted; store.set('muted',muted); $('#soundBtn').textContent=muted?'🔕':'🔔'; if(!muted) sfx.good();};

const savedTheme=store.get('theme',null);
if(savedTheme) document.documentElement.setAttribute('data-theme',savedTheme);
function isDark(){ const t=document.documentElement.getAttribute('data-theme');
  return t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches); }
function syncTheme(){ $('#themeBtn').textContent=isDark()?'☀️':'🌙'; }
syncTheme();
$('#themeBtn').onclick=()=>{ const n=isDark()?'light':'dark';
  document.documentElement.setAttribute('data-theme',n); store.set('theme',n); syncTheme(); sfx.click(); };

/* ================= bunny art + outfit ================= */
const BOWS={rose:'#F58AB4',mint:'#79BCA8',lilac:'#B3A3D6',butter:'#E9C35F',sky:'#8FC7E8',berry:'#C4497E'};
const ACCS=[
  {id:'bow',label:'Classic bow 🎀'},
  {id:'crown',label:'Flower crown 🌸'},
  {id:'glasses',label:'Round glasses 🤓'},
  {id:'beanie',label:'Beanie 🧶'},
  {id:'phones',label:'Headphones 🎧'},
  {id:'none',label:'Nothing at all'}
];
let LOOK=store.get('look',{bow:'rose',acc:'bow',blush:true});
if(!BOWS[LOOK.bow]) LOOK.bow='rose';

function accSVG(acc,bowCol){
  if(acc==='bow') return `<g transform="translate(150,74) rotate(18)">
    <path d="M0 0 L-16 -10 L-16 10 Z" fill="${bowCol}"/><path d="M0 0 L16 -10 L16 10 Z" fill="${bowCol}"/>
    <circle r="5.5" fill="${bowCol}" stroke="rgba(0,0,0,.18)" stroke-width="2"/></g>`;
  if(acc==='crown') return `<g>${[-40,-22,-4,14,32].map((dx,i)=>`
    <g transform="translate(${100+dx},${70+Math.abs(dx)*0.18}) rotate(${dx*0.5})">
      ${[0,72,144,216,288].map(a=>`<ellipse cx="0" cy="-7" rx="4.4" ry="7" transform="rotate(${a})" fill="${i%2?'#FFFFFF':bowCol}" stroke="rgba(0,0,0,.12)" stroke-width="1"/>`).join('')}
      <circle r="3" fill="#FFE9A8"/></g>`).join('')}</g>`;
  if(acc==='glasses') return `<g stroke="#4A3742" stroke-width="4" fill="rgba(255,255,255,.28)">
    <circle cx="83" cy="97" r="20"/><circle cx="117" cy="97" r="20"/>
    <path d="M103 97 h-6" /><path d="M63 92 l-14 -6" fill="none"/><path d="M137 92 l14 -6" fill="none"/></g>`;
  if(acc==='beanie') return `<g><path d="M48 76 q52 -52 104 0 q-52 -16 -104 0 Z" fill="${bowCol}"/>
    <path d="M44 74 q56 22 112 0 q2 12 0 16 q-56 20 -112 0 q-2 -6 0 -16 Z" fill="${bowCol}" stroke="rgba(0,0,0,.12)" stroke-width="2"/>
    <circle cx="100" cy="36" r="9" fill="#FFFFFF" stroke="rgba(0,0,0,.1)" stroke-width="2"/></g>`;
  if(acc==='phones') return `<g><path d="M44 96 q0 -58 56 -58 q56 0 56 58" fill="none" stroke="#4A3742" stroke-width="8" stroke-linecap="round"/>
    <rect x="30" y="86" width="26" height="36" rx="12" fill="${bowCol}" stroke="#4A3742" stroke-width="4"/>
    <rect x="144" y="86" width="26" height="36" rx="12" fill="${bowCol}" stroke="#4A3742" stroke-width="4"/></g>`;
  return '';
}
function bunny(o={}){
  o=Object.assign({eyes:'open',mouth:'smile',sleepy:false,plain:false},o);
  const acc = o.plain?'none':(o.acc||LOOK.acc);
  const bowCol = BOWS[o.bow||LOOK.bow];
  const blush = o.blush!==undefined?o.blush:LOOK.blush;
  const eyes = o.eyes==='closed'
    ? `<path d="M72 97 q11 9 22 0" stroke="var(--eye)" stroke-width="5" fill="none" stroke-linecap="round"/>
       <path d="M106 97 q11 9 22 0" stroke="var(--eye)" stroke-width="5" fill="none" stroke-linecap="round"/>`
    : `<ellipse cx="83" cy="97" rx="9" ry="11" fill="var(--eye)"/><ellipse cx="117" cy="97" rx="9" ry="11" fill="var(--eye)"/>
       <circle cx="86" cy="93" r="2.8" fill="var(--eye-shine)"/><circle cx="120" cy="93" r="2.8" fill="var(--eye-shine)"/>
       <circle cx="80" cy="102" r="1.6" fill="var(--eye-shine)" opacity=".75"/><circle cx="114" cy="102" r="1.6" fill="var(--eye-shine)" opacity=".75"/>`;
  const mouth = o.mouth==='o'
    ? `<ellipse cx="100" cy="123" rx="6.5" ry="8" fill="none" stroke="var(--eye)" stroke-width="4.5" stroke-linecap="round"/>`
    : `<path d="M100 113 v7" stroke="var(--eye)" stroke-width="4.5" stroke-linecap="round"/>
       <path d="M89 120 q11 11 22 0" stroke="var(--eye)" stroke-width="4.5" fill="none" stroke-linecap="round"/>`;
  return `<svg viewBox="0 0 200 212" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block">
    <ellipse cx="100" cy="201" rx="52" ry="7" fill="var(--fur-line)" opacity=".2"/>
    <ellipse cx="74" cy="42" rx="15.5" ry="38" fill="var(--fur)" stroke="var(--fur-line)" stroke-width="4.5"/>
    <ellipse cx="126" cy="42" rx="15.5" ry="38" fill="var(--fur)" stroke="var(--fur-line)" stroke-width="4.5"/>
    <ellipse cx="74" cy="44" rx="6.5" ry="24" fill="var(--inner-ear)"/><ellipse cx="126" cy="44" rx="6.5" ry="24" fill="var(--inner-ear)"/>
    <ellipse cx="100" cy="106" rx="58" ry="52" fill="var(--fur)" stroke="var(--fur-line)" stroke-width="4.5"/>
    ${blush?`<ellipse cx="64" cy="115" rx="11.5" ry="7" fill="var(--rose)" opacity=".4"/><ellipse cx="136" cy="115" rx="11.5" ry="7" fill="var(--rose)" opacity=".4"/>`:''}
    ${eyes}${mouth}
    ${o.sleepy?`<text x="150" y="52" font-size="26" fill="var(--rose-d)" font-family="Baloo 2,sans-serif">z</text>
      <text x="168" y="34" font-size="18" fill="var(--rose-d)" font-family="Baloo 2,sans-serif">z</text>`:''}
    ${accSVG(acc,bowCol)}
  </svg>`;
}
const REPAINT=[];
function repaintBunnies(){ REPAINT.forEach(f=>{try{f();}catch(e){}}); }

function flowerSVG(){ return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;display:block">
  <g transform="translate(100,100)">${[0,72,144,216,288].map(a=>`<g transform="rotate(${a})">
    <path d="M0 -20 C22 -46 46 -34 40 -12 C36 4 14 8 0 -6 Z" fill="var(--rose-l)" stroke="var(--rose)" stroke-width="3"/></g>`).join('')}
  <circle r="17" fill="var(--butter)" stroke="var(--rose)" stroke-width="3"/>
  <circle r="4" cx="-5" cy="-3" fill="var(--rose-d)" opacity=".55"/><circle r="3" cx="5" cy="5" fill="var(--rose-d)" opacity=".55"/></g></svg>`; }
function treeSVG(){ return `<svg viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block">
  <path d="M96 210 L96 130 q-2 -22 -20 -34" stroke="#A9787F" stroke-width="10" fill="none" stroke-linecap="round"/>
  <path d="M104 210 L104 140 q2 -18 22 -30" stroke="#A9787F" stroke-width="9" fill="none" stroke-linecap="round"/>
  <ellipse cx="100" cy="205" rx="44" ry="8" fill="var(--fur-line)" opacity=".2"/>
  <circle cx="60" cy="72" r="34" fill="var(--rose-l)" stroke="var(--rose)" stroke-width="3"/>
  <circle cx="136" cy="80" r="30" fill="var(--rose-l)" stroke="var(--rose)" stroke-width="3"/>
  <circle cx="100" cy="52" r="38" fill="var(--rose)" opacity=".88"/>
  <circle cx="100" cy="92" r="30" fill="var(--rose-l)" stroke="var(--rose)" stroke-width="3"/>
  <circle cx="82" cy="60" r="5" fill="#fff" opacity=".8"/><circle cx="118" cy="44" r="4" fill="#fff" opacity=".7"/>
  <circle cx="132" cy="70" r="4.5" fill="#fff" opacity=".7"/></svg>`; }

REPAINT.push(()=>{ $('#logo').innerHTML=bunny(); });
REPAINT.push(()=>{ $('#heroBunny').innerHTML=bunny(); });
REPAINT.push(()=>{ $('#boopBunny').innerHTML=bunny(); });
REPAINT.push(()=>{ $('#runner').innerHTML=bunny({blush:false}); });
REPAINT.push(()=>{ $('#hopBun').innerHTML=bunny({plain:true}); });
REPAINT.push(()=>{ $('#dressBunny').innerHTML=bunny(); });
$('#spinner').innerHTML=flowerSVG();
$('#tree').innerHTML=treeSVG();
repaintBunnies();

/* ================= petals background ================= */
(function(){
  const cv=$('#petals'), cx=cv.getContext('2d'); let W,H,ps=[];
  function size(){ W=cv.width=innerWidth; H=cv.height=innerHeight; }
  function make(){ ps=[]; const n=REDUCED?10:Math.round(clamp(innerWidth/26,18,46));
    for(let i=0;i<n;i++) ps.push({x:rnd(0,W),y:rnd(-H,H),s:rnd(5,12),v:rnd(.22,.8),a:rnd(0,6.28),sp:rnd(.01,.03),d:rnd(.25,.9)}); }
  function draw(){ cx.clearRect(0,0,W,H); const dark=isDark();
    for(const p of ps){ p.y+=p.v; p.a+=p.sp; p.x+=Math.sin(p.a)*p.d;
      if(p.y>H+20){p.y=-20;p.x=rnd(0,W);}
      cx.save(); cx.translate(p.x,p.y); cx.rotate(p.a);
      cx.globalAlpha=dark?.32:.55; cx.fillStyle=dark?'#FF9EC4':'#F9A8C8';
      cx.beginPath(); cx.ellipse(0,0,p.s,p.s*.62,0,0,6.283); cx.fill(); cx.restore(); }
    requestAnimationFrame(draw); }
  size(); make(); draw(); addEventListener('resize',()=>{size();make();});
})();

/* ================= tabs ================= */
$$('#tabs .tab').forEach(t=>t.onclick=()=>{
  $$('#tabs .tab').forEach(x=>x.classList.remove('on'));
  $$('section.page').forEach(x=>x.classList.remove('on'));
  t.classList.add('on'); $('#p-'+t.dataset.p).classList.add('on'); sfx.click();
  window.scrollTo({top:0,behavior:REDUCED?'auto':'smooth'});
  t.scrollIntoView({block:'nearest', inline:'center', behavior:REDUCED?'auto':'smooth'});
});
function goTab(p){ const t=$$('#tabs .tab').find(x=>x.dataset.p===p); if(t) t.click(); }

(function(){
  const nav=$('#tabs'), prev=$('#tabPrev'), next=$('#tabNext');
  function update(){
    const max=nav.scrollWidth-nav.clientWidth;
    prev.classList.toggle('hide', nav.scrollLeft<=2);
    next.classList.toggle('hide', max<=2 || nav.scrollLeft>=max-2);
  }
  function stopHint(){ next.classList.remove('pulse'); }
  prev.onclick=()=>{ nav.scrollBy({left:-180,behavior:REDUCED?'auto':'smooth'}); stopHint(); sfx.click(); };
  next.onclick=()=>{ nav.scrollBy({left:180,behavior:REDUCED?'auto':'smooth'}); stopHint(); sfx.click(); };
  nav.addEventListener('scroll',()=>{ update(); stopHint(); });
  addEventListener('resize',update);
  setTimeout(stopHint,6000);
  update();
})();
