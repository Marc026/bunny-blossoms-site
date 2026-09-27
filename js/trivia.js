/* ================= TRIVIA ================= */
(function(){
  const DEFAULT_Q=[
    {q:'What color is basically this entire website?',opts:['Blue','Pink','Green','Purple'],correct:1},
    {q:"What's the bunny's favorite snack, per this site?",opts:['Pizza','Carrots','Tacos','Ice cream'],correct:1}
  ];
  let qs=store.get('trivia',DEFAULT_Q);
  let best=store.get('triviaBest',0);
  $('#triBest').textContent=best; $('#triTotal').textContent=qs.length;
  let idx=0, score=0, playing=false;

  function renderEditor(){
    const ed=$('#triEditor');
    ed.innerHTML=qs.map((q,i)=>`<div class="triEdit" data-i="${i}">
        <input data-f="q" placeholder="Question" value="${(q.q||'').replace(/"/g,'&quot;')}">
        ${q.opts.map((o,j)=>`<input data-f="opt${j}" placeholder="Option ${j+1}" value="${(o||'').replace(/"/g,'&quot;')}">`).join('')}
        <div class="row"><label class="tiny">Correct:
          <select data-f="correct">${q.opts.map((_,j)=>`<option value="${j}" ${j===q.correct?'selected':''}>${j+1}</option>`).join('')}</select>
        </label><button class="btn ghost" data-del="${i}">Delete</button></div></div>`).join('')
      + `<button class="btn" id="triAddQ">Add question ➕</button>`;
    $$('.triEdit',ed).forEach(card=>{
      const i=+card.dataset.i;
      $$('input,select',card).forEach(inp=>inp.onchange=()=>{
        const f=inp.dataset.f;
        if(f==='q') qs[i].q=inp.value; else if(f==='correct') qs[i].correct=+inp.value;
        else qs[i].opts[+f.replace('opt','')]=inp.value;
        save();
      });
      card.querySelector('[data-del]').onclick=()=>{ qs.splice(i,1); save(); renderEditor(); };
    });
    $('#triAddQ').onclick=()=>{ qs.push({q:'New question',opts:['A','B','C','D'],correct:0}); save(); renderEditor(); };
  }
  function save(){ store.set('trivia',qs); $('#triTotal').textContent=qs.length; }
  $('#triEditToggle').onclick=()=>{ const ed=$('#triEditor'); const on=ed.style.display==='none';
    ed.style.display=on?'block':'none'; if(on) renderEditor(); };
  function playQ(){
    if(idx>=qs.length){ playing=false;
      if(score>best){ best=score; store.set('triviaBest',best); $('#triBest').textContent=best; }
      $('#triPlay').innerHTML=`<div class="triQ">You got ${score} / ${qs.length} 🎉</div>`;
      score===qs.length ? (sfx.win(),rain(['🏆','💖'])) : sfx.good();
      return;
    }
    const q=qs[idx];
    $('#triPlay').innerHTML=`<div class="triQ">${q.q}</div>`+q.opts.map((o,i)=>`<button class="triOpt" data-i="${i}">${o}</button>`).join('');
    $$('.triOpt',$('#triPlay')).forEach(b=>b.onclick=()=>{
      if(!playing) return; playing=false; const i=+b.dataset.i;
      $$('.triOpt',$('#triPlay')).forEach((x,xi)=>{ if(xi===q.correct) x.classList.add('right'); else if(xi===i) x.classList.add('wrong'); });
      if(i===q.correct){ score++; sfx.good(); } else sfx.bad();
      setTimeout(()=>{ idx++; playing=true; playQ(); },900);
    });
  }
  $('#triStart').onclick=()=>{ if(!qs.length){ toast('add a question first ✏️'); return; }
    idx=0; score=0; playing=true; $('#triEditor').style.display='none'; playQ(); };
  SYNC.onRemote('trivia', v=>{ if(Array.isArray(v)&&v.length){ qs=v; $('#triTotal').textContent=qs.length; if($('#triEditor').style.display!=='none') renderEditor(); } });
  SYNC.onRemote('triviaBest', v=>{ if((v||0)>best){ best=v; $('#triBest').textContent=best; } });
})();
