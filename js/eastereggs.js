/* ================= easter eggs ================= */
(function(){
  let buf='';
  addEventListener('keydown',e=>{
    if(e.target.tagName==='INPUT') return;
    buf=(buf+e.key.toLowerCase()).slice(-12);
    if(buf.endsWith('bunny')){ rain(['🐰','🐰','🐰','🌸','💖']); sfx.win(); toast('🐰 BUNNY RAIN — you found it'); buf=''; }
    if(buf.endsWith('love')){ rain(['💖','💕','💗']); toast('same 💖'); buf=''; }
    if(buf.endsWith('cake')){ rain(['🍰','🧁','🍓']); toast('dessert protocol engaged 🍰'); buf=''; }
    if(buf.endsWith('marc')){ rain(['💌','🌸','💖']); toast(`${HIM} says hi, ${HER} 💌`); buf=''; }
    if(buf.endsWith('chloe')){ rain(['🌸','✨','👑']); toast('the site knows who you are 👑'); buf=''; }
  });
})();
