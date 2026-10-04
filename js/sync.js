/* ================= shared sync (Firebase, optional) =================
   SETUP — Marc, one-time, about 5 minutes:
   1. console.firebase.google.com → Add project → name it anything →
      you can skip Google Analytics, it isn't needed here.
   2. Left sidebar → Build → Realtime Database → Create Database →
      pick any region → start in TEST MODE.
   3. Open that database's "Rules" tab and replace the rules with:
        { "rules": { ".read": true, ".write": true } }
      (test-mode rules expire after 30 days — this makes it permanent.
      Only someone who found your exact databaseURL could read or write
      this. It's not linked anywhere, just not locked behind a login —
      fine for a two-person bunny site.)
   4. Project settings (gear icon, top left) → General tab → scroll to
      "Your apps" → click the </> (web) icon → register an app (any
      nickname, skip Firebase Hosting) → it shows a firebaseConfig
      object → copy its six values into FIREBASE_CONFIG below.
   5. Save this file and re-upload it to GitHub Pages. Done — you and
      Chloe now share one bunny, garden, and score board.
   Leave the placeholders as-is and the site just runs local-only,
   exactly like before — nothing breaks either way.
*/
const FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT-default-rtdb.YOUR_REGION.firebasedatabase.app",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
const SYNC_ON = !!(FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.databaseURL
  && !FIREBASE_CONFIG.apiKey.startsWith('YOUR_') && !FIREBASE_CONFIG.databaseURL.startsWith('https://YOUR_'));
// keys that represent "your shared world" — everything else (sound, theme, which
// tab is open, day streak/visit count) stays local to each device on purpose
const SHARED_KEYS=['pet','garden','stats','pops','boops','spins','hugs','look',
  'catchBest','heartBest','simonBest','whackBest','hopBest','slotWins','slotSpins',
  'timeline','countdowns','songs','trivia','triviaBest','achievements','notesPulled','wheelSpins','flapBest'];
const SYNC={ listeners:{}, onRemote(k,fn){ (SYNC.listeners[k]=SYNC.listeners[k]||[]).push(fn); } };
if(SYNC_ON){
  (async()=>{
    try{
      const [{initializeApp},{getDatabase,ref,onValue,update}]=await Promise.all([
        import('https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js'),
        import('https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js')
      ]);
      const app=initializeApp(FIREBASE_CONFIG), dbRef=ref(getDatabase(app),'couple');
      const sn=$('#syncNote'); if(sn) sn.textContent='🔗 synced across devices';
      SYNC._push=(k,v)=>{ try{ update(dbRef,{[k]:v===undefined?null:v}); }catch(e){} };
      onValue(dbRef, snap=>{
        const data=snap.val()||{};
        Object.keys(data).forEach(k=>{
          if(!SHARED_KEYS.includes(k)) return;
          const v=data[k];
          try{ localStorage.setItem('bb_'+k, JSON.stringify(v)); }catch(e){}
          (SYNC.listeners[k]||[]).forEach(fn=>{ try{ fn(v); }catch(e){} });
        });
      });
    }catch(e){ /* offline, blocked, or config not filled in yet — site stays local-only */ }
  })();
}
