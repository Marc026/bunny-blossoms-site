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
  apiKey: "AIzaSyA4NWmhQgNdU3BedUMC3YdlExOeddnNSnk",
  authDomain: "chlo-8ba74.firebaseapp.com",
  databaseURL: "https://chlo-8ba74-default-rtdb.firebaseio.com",
  projectId: "chlo-8ba74",
  storageBucket: "chlo-8ba74.firebasestorage.app",
  messagingSenderId: "848490841328",
  appId: "1:848490841328:web:ac5eb3e12a6fafa6baae35",
  measurementId: "G-DSLKRVVVMH"
};

const store = window.store || { get: (k, d) => d, set: () => {} };

const SYNC_ON = !!(
  FIREBASE_CONFIG.apiKey &&
  FIREBASE_CONFIG.databaseURL &&
  !FIREBASE_CONFIG.apiKey.startsWith('YOUR_') &&
  !FIREBASE_CONFIG.databaseURL.startsWith('https://YOUR_')
);

// keys that represent "your shared world" — everything else (sound, theme, which
// tab is open, day streak/visit count) stays local to each device on purpose
const SHARED_KEYS = [
  'pet',
  'garden',
  'stats',
  'pops',
  'boops',
  'spins',
  'hugs',
  'look',
  'catchBest',
  'heartBest',
  'simonBest',
  'whackBest',
  'hopBest',
  'slotWins',
  'slotSpins',
  'timeline',
  'countdowns',
  'songs',
  'trivia',
  'triviaBest',
  'achievements',
  'notesPulled',
  'wheelSpins',
  'flapBest'
];

const SYNC = {
  listeners: {},
  onRemote(k, fn) {
    (SYNC.listeners[k] = SYNC.listeners[k] || []).push(fn);
  }
};

if (SYNC_ON) {
  (async () => {
    try {
      const [{ initializeApp }, { getDatabase, ref, onValue, update }] =
        await Promise.all([
          import('https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js'),
          import('https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js')
        ]);

      const app = initializeApp(FIREBASE_CONFIG);
      const dbRef = ref(getDatabase(app), 'couple');

      const sn = $('#syncNote');
      if (sn) sn.textContent = '🔗 synced across devices';

      SYNC._push = (k, v) => {
        try {
          update(dbRef, { [k]: v === undefined ? null : v });
        } catch (e) {}
      };

      onValue(dbRef, snap => {
        const data = snap.val() || {};

        Object.keys(data).forEach(k => {
          if (!SHARED_KEYS.includes(k)) return;

          const v = data[k];

          try {
            localStorage.setItem('bb_' + k, JSON.stringify(v));
          } catch (e) {}

          (SYNC.listeners[k] || []).forEach(fn => {
            try {
              fn(v);
            } catch (e) {}
          });
        });
      });
    } catch (e) {
      /* offline, blocked, or config not filled in yet — site stays local-only */
    }
  })();
}

let toastT;

function toast(m) {
  const t = $('#toast');
  t.textContent = m;
  t.classList.add('show');

  clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove('show'), 2000);
}

let AC = null;
let muted = store.get('muted', false);

function ac() {
  if (!AC) {
    try {
      AC = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      AC = null;
    }
  }

  return AC;
}

function blip(f = 600, dur = 0.09, type = 'sine', vol = 0.10, glide = null) {
  if (muted) return;

  const c = ac();
  if (!c) return;

  try {
    const o = c.createOscillator();
    const g = c.createGain();

    o.type = type;
    o.frequency.setValueAtTime(f, c.currentTime);

    if (glide) {
      o.frequency.exponentialRampToValueAtTime(
        Math.max(40, glide),
        c.currentTime + dur
      );
    }

    g.gain.setValueAtTime(vol, c.currentTime);
    g.gain.exponentialRampToValueAtTime(
      0.0001,
      c.currentTime + dur
    );

    o.connect(g);
    g.connect(c.destination);

    o.start();
    o.stop(c.currentTime + dur + 0.02);
  } catch (e) {}
}

const sfx = {
  pop: () => blip(rnd(520, 900), 0.07, 'triangle', 0.12, 180),

  boop: () => blip(rnd(300, 420), 0.12, 'sine', 0.13, 760),

  good: () => {
    blip(660, 0.09, 'triangle', 0.11);
    setTimeout(() => blip(880, 0.11, 'triangle', 0.11), 80);
  },

  bad: () => blip(180, 0.2, 'sawtooth', 0.08, 70),

  click: () => blip(rnd(700, 1100), 0.05, 'square', 0.05),

  shutter: () => {
    blip(1400, 0.03, 'square', 0.09);
    setTimeout(() => blip(700, 0.06, 'square', 0.07), 45);
  },

  win: () => {
    [523, 659, 784, 1046].forEach((f, i) =>
      setTimeout(() => blip(f, 0.12, 'triangle', 0.1), i * 95)
    );
  }
};

$('#soundBtn').textContent = muted ? '🔕' : '🔔';

$('#soundBtn').onclick = () => {
  muted = !muted;
  store.set('muted', muted);
  $('#soundBtn').textContent = muted ? '🔕' : '🔔';

  if (!muted) sfx.good();
};

const savedTheme = store.get('theme', null);

if (savedTheme) {
  document.documentElement.setAttribute('data-theme', savedTheme);
}

function isDark() {
  const t = document.documentElement.getAttribute('data-theme');

  return (
    t === 'dark' ||
    (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );
}

function syncTheme() {
  $('#themeBtn').textContent = isDark() ? '☀️' : '🌙';
}

syncTheme();

$('#themeBtn').onclick = () => {
  const n = isDark() ? 'light' : 'dark';

  document.documentElement.setAttribute('data-theme', n);
  store.set('theme', n);
  syncTheme();
  sfx.click();
};