/* ================= notes / fortunes / compliments ================= */
const noteTpl=[
  n=>`${n}, you are the best part of most of my days — including this one.`,
  n=>`If I had to build a person from scratch I'd just make ${n} again, exactly the same.`,
  n=>`Reminder for ${n}: you're doing better than you think you are.`,
  n=>`I hope something small and unreasonably good happens to ${n} today.`,
  n=>`${n} has a laugh that fixes things. Scientifically load-bearing.`,
  n=>`Thinking about ${n} is my most frequent hobby. I'm very good at it now.`,
  n=>`Being around ${n} feels like the first warm day of spring.`,
  n=>`Whatever ${n} is worrying about right now — it's smaller than it feels.`,
  n=>`I would pick ${n} in every single version of this.`,
  n=>`${n} is allowed to rest. Even now. Especially now.`,
  n=>`${n}, you are my favourite notification.`,
  n=>`Somewhere out there a bunny is very proud of ${n}. It's me. I'm the bunny.`,
  n=>`${n}'s ideas are good and ${n} should say them louder.`,
  n=>`I built an entire website instead of saying it out loud, so: I adore you, ${n}.`,
  n=>`${n} is so easy to love it's almost inconvenient.`,
  n=>`If ${n} is reading this at 2am: go to sleep. I love you.`,
  n=>`${n} has excellent taste. Primary evidence: me.`,
  n=>`I hope ${n} knows how much space she takes up in the good part of my brain.`,
  n=>`Petals fall, seasons change, and I still want to sit next to ${n}.`,
  n=>`${n} deserves slow mornings and things going right.`,
  n=>`Nothing about ${n} needs fixing today.`,
  n=>`${n} is the reason this website is pink.`,
  n=>`On a scale of one to ten, ${n} is the whole scale.`,
  n=>`Fun fact: ${n} makes ordinary days feel like a soft place to land.`,
  n=>`Everyone should get to meet ${n} once. Only I get to keep her though.`,
  n=>`${n}, if today was heavy, you carried it well.`,
  n=>`The bunny took a vote. ${n} won. It was unanimous. There was one voter.`,
  n=>`${n} is proof that good things happen to me sometimes.`,
  n=>`Whatever ${n} is overthinking — she handled worse last month without noticing.`,
  n=>`I'd survive a boring day with ${n} over an exciting one with anyone else.`,
  n=>`Every tab on this site exists because I wanted ${n} to have somewhere soft to land.`,
  n=>`${n} + me is my favourite equation. The maths checks out.`
];
let bag=[];
function nextNote(){ if(!bag.length) bag=[...noteTpl].sort(()=>Math.random()-.5); return bag.pop()(HER); }
(function daily(){
  const d=new Date(), seed=d.getFullYear()*1000+d.getMonth()*40+d.getDate();
  $('[data-daily]').textContent=noteTpl[seed%noteTpl.length](HER);
})();
$('#noteBtn').onclick=()=>{ const c=$('[data-jar]'); c.classList.remove('pop-in'); void c.offsetWidth;
  c.textContent=nextNote(); c.classList.add('pop-in'); sfx.good();
  const np=store.get('notesPulled',0)+1; store.set('notesPulled',np); };

const fortunes=[
  n=>`A snack will find ${n} within the hour. 🥨`,
  n=>`Great things are coming for ${n}. Slightly behind schedule, but coming. 🌸`,
  n=>`Today ${n} will be right about something and someone will admit it. 📣`,
  n=>`Lucky item: a hoodie that is technically ${HIM}'s. 🧥`,
  n=>`${n} will win an argument with a bunny. It will sulk. 🐰`,
  n=>`The next song that plays is about ${n}. 🎧`,
  n=>`${n}'s nap will be legendary. Historians will speak of it. 😴`,
  n=>`Something ${n} has been dreading will take 11 minutes. ⏳`,
  n=>`${n} will be complimented by someone with excellent judgement (${HIM}). 💖`,
  n=>`Outlook for ${n}: adorable. Forecast: petals. 🌷`,
  n=>`${HIM} owes ${n} one snack run. This carrot is legally binding. 🥕`
];
$('#fortuneBtn').onclick=()=>{ const c=$('[data-jar]'); c.classList.remove('pop-in'); void c.offsetWidth;
  c.innerHTML=`🥕 <b>Fortune Carrot says:</b><br>${pick(fortunes)(HER)}`; c.classList.add('pop-in'); sfx.pop(); };

(function(){
  const a=['Objectively','Scientifically','Unreasonably','Devastatingly','Historically','Genuinely','Alarmingly','Internationally'];
  const b=['the cutest','the funniest','the smartest','the kindest','the most charming','the best-dressed','the most delightful','the softest-hearted'];
  const c=['person in this room','person on this website','human in a 40-mile radius','individual in recorded history','girlfriend in the known universe','person the bunny has ever met'];
  const d=['and it is a problem for everyone else.','and I have receipts.','confirmed by peer review.','and no, I will not be taking questions.','so please act accordingly.','and the bunny agrees.'];
  $('#compBtn').onclick=()=>{ $('#compOut').textContent=`${HER} is ${pick(a).toLowerCase()} ${pick(b)} ${pick(c)}, ${pick(d)}`; sfx.win(); };
})();

/* ================= sweet slots ================= */
(function(){
  const syms=['🌸','🐰','🥕','💖','🍓','🍰'];
  let wins=store.get('slotWins',0), spins=store.get('slotSpins',0), busy=false;
  $('#slotWins').textContent=wins; $('#slotSpins').textContent=spins;
  SYNC.onRemote('slotWins', v=>{ wins=v||0; $('#slotWins').textContent=wins; });
  SYNC.onRemote('slotSpins', v=>{ spins=v||0; $('#slotSpins').textContent=spins; });
  $('#slotBtn').onclick=()=>{
    if(busy) return; busy=true; spins++; store.set('slotSpins',spins); $('#slotSpins').textContent=spins;
    $('#slotSay').textContent='…';
    const reels=[0,1,2].map(i=>$('#r'+i));
    reels.forEach(r=>r.classList.add('spin'));
    // rigged: ~1 in 4 chance of a jackpot
    const jack=Math.random()<.25, target=jack?[0,0,0].map(()=>syms[Math.floor(Math.random()*syms.length)])[0]:null;
    const finals=jack?[target,target,target]:[0,1,2].map(()=>pick(syms));
    reels.forEach((r,i)=>{
      let t=0; const iv=setInterval(()=>{ r.textContent=pick(syms); blip(rnd(600,1000),.02,'square',.03); t++; },70);
      setTimeout(()=>{ clearInterval(iv); r.classList.remove('spin'); r.textContent=finals[i];
        blip(500,.08,'triangle',.08);
        if(i===2){
          const win=finals[0]===finals[1]&&finals[1]===finals[2];
          if(win){ wins++; store.set('slotWins',wins); $('#slotWins').textContent=wins;
            $('#slotSay').textContent='JACKPOT 🎉 ' + nextNote(); sfx.win(); rain([finals[0],'✨','💖']); }
          else{ $('#slotSay').textContent=pick(['so close.','the bunny rigged it. allegedly.','again! again!','one more pull?']); sfx.bad(); }
          busy=false;
        }
      },900+i*420);
    });
  };
})();
