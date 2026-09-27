/* ================= wheels (shared) ================= */
function makeWheel(canvasId, items, sayId, btnId, onResult){
  const cv=$('#'+canvasId), cx=cv.getContext('2d'); let rot=0, spinning=false;
  const cols=['#FFC6DB','#FFE1EC','#FFD3E2','#FFEAF2'];
  const R=278, C=290, seg=Math.PI*2/items.length;
  const fs = items.length>12?19:items.length>9?21:24;
  function draw(){
    cx.clearRect(0,0,580,580);
    cx.save(); cx.translate(C,C); cx.rotate(rot);
    items.forEach((t,i)=>{
      cx.beginPath(); cx.moveTo(0,0); cx.arc(0,0,R,i*seg,(i+1)*seg); cx.closePath();
      cx.fillStyle=cols[i%cols.length]; cx.fill(); cx.strokeStyle='#F58AB4'; cx.lineWidth=3; cx.stroke();
      cx.save(); cx.rotate(i*seg+seg/2); cx.fillStyle='#4A2F3C';
      cx.font=`700 ${fs}px Quicksand, sans-serif`; cx.textAlign='right'; cx.textBaseline='middle';
      cx.fillText(t,R-20,0); cx.restore();
    });
    cx.beginPath(); cx.arc(0,0,42,0,7); cx.fillStyle='#FFF0C9'; cx.fill();
    cx.strokeStyle='#DE5390'; cx.lineWidth=4; cx.stroke();
    cx.font='30px serif'; cx.textAlign='center'; cx.textBaseline='middle'; cx.fillText('🌸',0,2);
    cx.restore();
  }
  draw();
  $('#'+btnId).onclick=()=>{
    if(spinning) return; spinning=true; $('#'+sayId).textContent='spinning…';
    const start=rot, turns=rnd(4,6)*Math.PI*2+rnd(0,Math.PI*2), t0=performance.now(), dur=3900;
    (function step(t){
      const p=clamp((t-t0)/dur,0,1), e=1-Math.pow(1-p,3.2);
      rot=start+turns*e; draw();
      if(p<1){ if(Math.random()<.22) blip(rnd(700,1000),.02,'square',.03); requestAnimationFrame(step); }
      else{
        spinning=false;
        let ang=(-Math.PI/2-rot)%(Math.PI*2); if(ang<0) ang+=Math.PI*2;
        const idx=Math.floor(ang/seg)%items.length;
        const ws=store.get('wheelSpins',0)+1; store.set('wheelSpins',ws);
        onResult(items[idx]); sfx.win();
      }
    })(t0);
  };
}
const FOODS=['Din Tai Fung 🥟','In-N-Out 🍔','Domino\u2019s 🍕','McDonald\u2019s 🍟','Chick-fil-A 🐔',
  'Panda Express 🥡','Chipotle 🌯','Raising Cane\u2019s 🍗','Sushi 🍣','Ramen 🍜','Boba run 🧋',
  'Taco Bell 🌮','Korean BBQ 🥩','Ice cream 🍦'];
const foodQuips=['no takebacks.','the wheel is never wrong.','get your shoes on.','I\u2019m already in the car.','this is destiny now.','the bunny approves.'];
let foodHist=[];
makeWheel('wheelFood',FOODS,'foodSay','spinFood',r=>{
  $('#foodSay').textContent=`Tonight: ${r} — ${pick(foodQuips)}`;
  foodHist.unshift(r); foodHist=foodHist.slice(0,5);
  $('#foodHist').textContent='recent spins: '+foodHist.join(' · ');
});
const DATES=['Pastry run 🥐','Movie + blanket 🎬','Aimless drive 🚗','Cook something new 🍳','Bookshop crawl 📚',
  'Nap together 😴','Picnic 🧺','Arcade night 🕹️','Long walk 🌸','Dessert for dinner 🍰','Museum wander 🖼️','Do nothing, loudly 🫶'];
makeWheel('wheelDate',DATES,'dateSay','spinDate',r=>{ $('#dateSay').textContent=`The wheel has spoken: ${r}`; });
