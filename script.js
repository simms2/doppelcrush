const STORAGE_KEY = 'doppelcrushAppAssetPackV1';

const starterUsers = [
  {
    id: 'u1',
    name: 'Lola',
    age: 19,
    location: 'London',
    bio: 'Cute. Familiar. Elite taste.',
    modeScore: 'Twin Energy 92%',
    chaosScore: 'Chaos Match',
    image: 'assets/user-lola.png',
    vibe: 'Main character energy',
  },
  {
    id: 'u2',
    name: 'Kai',
    age: 20,
    location: 'Manchester',
    bio: 'A total switch-up. Still a yes.',
    modeScore: 'Twin Energy 78%',
    chaosScore: 'Chaos Match',
    image: 'assets/user-kai.png',
    vibe: 'Plot twist incoming',
  },
  {
    id: 'u3',
    name: 'Ivy',
    age: 18,
    location: 'Brighton',
    bio: 'Same vibe. Same face card energy.',
    modeScore: 'Twin Energy 87%',
    chaosScore: 'Chaos Match',
    image: 'assets/user-ivy.png',
    vibe: 'Soft launch ready',
  },
  {
    id: 'u4',
    name: 'Sophie',
    age: 18,
    location: 'Bristol',
    bio: 'Cute, familiar, iconic.',
    modeScore: 'Twin Energy 89%',
    chaosScore: 'Chaos Match',
    image: 'assets/user-sophie.png',
    vibe: 'Twin energy unlocked',
  },
  {
    id: 'u5',
    name: 'Nina',
    age: 19,
    location: 'Leeds',
    bio: 'Same vibe. Same playlist. Same late-night texts.',
    modeScore: 'Twin Energy 94%',
    chaosScore: 'Chaos Match',
    image: 'assets/user-nina.png',
    vibe: 'Cute, familiar, iconic',
  },
  {
    id: 'u6',
    name: 'Milo',
    age: 21,
    location: 'Birmingham',
    bio: 'Different vibe. Big sparks. Could be iconic.',
    modeScore: 'Twin Energy 73%',
    chaosScore: 'Chaos Match',
    image: 'assets/user-kai2.png',
    vibe: 'Wildcard energy',
  }
];

const initialState = {
  route: 'home',
  auth: { isLoggedIn: false },
  profile: {
    email: '',
    password: '',
    firstName: '',
    age: '',
    gender: '',
    lookingFor: 'Women',
    location: '',
    bio: '',
    selfie: '',
    extraPhotos: [],
    consent: false,
    ageConfirmed: false,
    mode: 'doppel',
    onboardingComplete: false
  },
  likes: [],
  passes: [],
  matches: [],
  chats: {},
  currentChat: null,
  selectedMode: 'doppel',
  notifications: true,
  reports: [],
  blocks: [],
  users: starterUsers,
  nextMatchSeed: 0,
  demoNoticeSeen: false
};

let state = loadState();
const app = document.getElementById('app');

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(initialState);
    const parsed = JSON.parse(raw);
    return mergeState(structuredClone(initialState), parsed);
  } catch {
    return structuredClone(initialState);
  }
}

function mergeState(base, incoming) {
  const out = { ...base, ...incoming };
  out.auth = { ...base.auth, ...(incoming.auth || {}) };
  out.profile = { ...base.profile, ...(incoming.profile || {}) };
  out.users = incoming.users?.length ? incoming.users : base.users;
  out.likes = incoming.likes || [];
  out.passes = incoming.passes || [];
  out.matches = incoming.matches || [];
  out.chats = incoming.chats || {};
  out.reports = incoming.reports || [];
  out.blocks = incoming.blocks || [];
  return out;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function setRoute(route) {
  state.route = route;
  saveState();
  render();
}

function resetApp() {
  if (!confirm('Reset the local demo app and clear your data on this browser?')) return;
  localStorage.removeItem(STORAGE_KEY);
  state = structuredClone(initialState);
  render();
}

function header() {
  const isInApp = state.auth.isLoggedIn && !['home','login','signup','how','faq','safety'].includes(state.route);
  return `
    <div class="browser-bar">
      <button class="brand brand-link" data-route="home" aria-label="Go to homepage">
        <img class="logo" src="assets/logo-badge.svg" alt="DoppelCrush logo" />
        <div>
          <h1>DoppelCrush</h1>
          <p>Because clearly you have good taste.</p>
        </div>
      </button>

      ${!isInApp ? `
        <nav class="top-links">
          <button class="top-link ${state.route === 'home' ? 'active' : ''}" data-route="home">Home</button>
          <button class="top-link ${state.route === 'how' ? 'active' : ''}" data-route="how">How it works</button>
          <button class="top-link ${state.route === 'safety' ? 'active' : ''}" data-route="safety">Safety</button>
          <button class="top-link ${state.route === 'faq' ? 'active' : ''}" data-route="faq">FAQ</button>
        </nav>
      ` : `
        <nav class="top-links app-links">
          <button class="top-link ${state.route === 'discover' ? 'active' : ''}" data-route="discover">Discover</button>
          <button class="top-link ${state.route === 'matches' ? 'active' : ''}" data-route="matches">Matches</button>
          <button class="top-link ${state.route === 'chats' ? 'active' : ''}" data-route="chats">Chats</button>
        </nav>
      `}

      <div class="actions">
        ${!state.auth.isLoggedIn ? `
          <button class="btn btn-ghost" data-route="login">Login</button>
          <button class="btn btn-dark" data-route="signup">Start</button>
        ` : isInApp ? `
          <button class="btn btn-ghost" id="logoutBtn">Log out</button>
        ` : `
          <button class="btn btn-dark" data-route="discover">Open app</button>
        `}
      </div>
    </div>
  `;
}

function homePage() {
  const preview = state.users.slice(0,3).map((u, i) => `
    <div class="match-card">
      <img class="match-photo" src="${u.image}" alt="${u.name}" />
      <div class="match-meta">
        <h3>${u.name}, ${u.age}</h3>
        <div class="badge">${i === 1 ? 'Chaos Mode' : u.modeScore}</div>
        <p class="muted">${u.bio}</p>
      </div>
      <div class="actions">
        <button class="btn btn-ghost">Pass</button>
        <button class="btn btn-primary">Into it</button>
      </div>
    </div>
  `).join('');

  return `
    <div class="app-shell">
      ${header()}
      <div class="hero-grid">
        <section class="card hero-card">
          <img class="deco-heart-char" src="assets/heart-character.svg" alt="" />
          <img class="deco-zap" src="assets/lightning-bolt.svg" alt="" />
          <div class="sticker">📸 Selfie first. Crush later.</div>
          <h2 class="hero-title">Find your <span class="gradient">DoppelCrush</span></h2>
          <p class="hero-copy">Ever wondered why so many couples look alike? Wonder no more and find your DoppelCrush. Upload your selfie and we’ll do the rest.</p>
          <div class="button-row">
            <button class="btn btn-primary" data-route="signup">Upload my selfie</button>
            <button class="btn btn-light" data-route="signup">Chaos Mode</button>
          </div>
          <div class="feature-strip">
            <div class="feature-tile"><strong>Upload selfie</strong><span>Face card only</span></div>
            <div class="feature-tile"><strong>Get matches</strong><span>Cute people, similar vibe</span></div>
            <div class="feature-tile"><strong>Start chatting</strong><span>If it’s a match</span></div>
          </div>
        </section>
        <aside class="card right-preview">
          <img class="deco-winged-heart" src="assets/winged-heart.svg" alt="" />
          <div class="preview-bar">
            <span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span>
            <div class="preview-url">doppelcrush.com</div>
          </div>
          <div class="panel">
            <div class="panel-title-row">
              <div>
                <div class="section-label">Live preview</div>
                <h2>Your matches</h2>
              </div>
              <div class="badge">3 new</div>
            </div>
            <div class="match-list">${preview}</div>
          </div>
        </aside>
      </div>
      <div class="mode-strip">
        <section class="card mode-card twin-card">
          <img class="mode-asset hearts" src="assets/duo-hearts.svg" alt="" />
          <div class="badge">Twin Energy</div>
          <h3>Cute, familiar, iconic.</h3>
          <p>Discover people who look like your mirror — familiar faces, matching energy, and instant twin vibes.</p>
          <div class="polaroid"><img src="assets/couple-polaroid.png" alt="polaroid" /><span>You, but make it us.</span></div>
        </section>
        <section class="card mode-card chaos-card">
          <img class="mode-asset bolt" src="assets/lightning-bolt.svg" alt="" />
          <img class="mode-asset face" src="assets/silly-face.svg" alt="" />
          <div class="badge" style="background: rgba(255,139,56,.14); color: var(--orange);">Chaos Mode</div>
          <h3>Plot twist energy.</h3>
          <p>Go for the total opposite when your usual type needs a little shake-up.</p>
        </section>
      </div>
      <div class="grid-2" style="margin-top:20px;">
        <section class="card form-card">
          <div class="kicker">How it works</div>
          <h3 style="font-size:30px; margin:12px 0;">Cute, quick, and easy to get into.</h3>
          <p class="muted">Upload a selfie, pick your mode, meet your matches, and chat if it clicks.</p>
          <ol class="muted" style="line-height:1.8; font-size:18px; padding-left:22px;">
            <li>Sign up</li>
            <li>Upload your selfie</li>
            <li>Pick Doppel or Chaos</li>
            <li>See your matches</li>
            <li>Like, match, and chat</li>
          </ol>
        </section>
        <section class="card form-card">
          <div class="kicker">Safety</div>
          <h3 style="font-size:30px; margin:12px 0;">18+, opt-in, and your photo only.</h3>
          <p class="muted">Everyone you see joined on purpose. Use your own selfie, stay in control of your account, and use report/block tools if anything feels off.</p>
          <div class="notice">For adults only. Selfies must be your own. You can reset your profile inside settings at any time.</div>
        </section>
      </div>
    </div>
  `;
}

function authPage(type='signup') {
  const isSignup = type === 'signup';
  return `
    <div class="app-shell">
      ${header()}
      <div class="auth-wrap">
        <div class="card auth-card">
          <button class="back-home-link" data-route="home">← Back to homepage</button>
          <div class="kicker">${isSignup ? 'Create account' : 'Welcome back'}</div>
          <h2 style="font-size:42px; margin:10px 0 8px;">${isSignup ? 'Create your DoppelCrush account' : 'Your matches are waiting'}</h2>
          <p class="muted" style="font-size:18px;">${isSignup ? 'One selfie away from the plot twist.' : 'Log in to jump back into your feed.'}</p>
          <form id="${type}Form">
            <div class="form-group"><label>Email</label><input class="input" type="email" name="email" value="${escapeHtml(state.profile.email)}" required /></div>
            <div class="form-group"><label>Password</label><input class="input" type="password" name="password" value="${escapeHtml(state.profile.password)}" required /></div>
            ${isSignup ? `
              <div class="form-group"><label>First name</label><input class="input" type="text" name="firstName" value="${escapeHtml(state.profile.firstName)}" required /></div>
              <div class="checkbox-row"><input id="ageBox" type="checkbox" name="ageConfirmed" ${state.profile.ageConfirmed ? 'checked' : ''} /><label for="ageBox">I confirm I am 18 or over</label></div>
              <div class="checkbox-row"><input id="consentBox" type="checkbox" name="consent" ${state.profile.consent ? 'checked' : ''} /><label for="consentBox">I confirm I will only upload photos of myself</label></div>
            ` : ''}
            <button class="btn btn-primary" style="width:100%; margin-top:8px;">${isSignup ? 'Continue' : 'Log in'}</button>
          </form>
          <p class="center muted" style="margin-top:18px;">
            ${isSignup ? 'Already got an account?' : 'Need an account?'}
            <span class="linkish" data-route="${isSignup ? 'login' : 'signup'}">${isSignup ? 'Log in' : 'Create one'}</span>
          </p>
        </div>
      </div>
    </div>
  `;
}

function onboardingWelcome() {
  gateAuth();
  return shell(`
    <div class="grid-2">
      <section class="card form-card">
        <div class="kicker">Onboarding</div>
        <h2 style="font-size:42px; margin:10px 0;">Let’s set your vibe</h2>
        <p class="muted" style="font-size:18px;">First up: upload a selfie so we can find your DoppelCrush.</p>
        <div class="notice">This version stores everything in your browser so you can test the full flow without a backend.</div>
        <div class="button-row" style="margin-top:18px;">
          <button class="btn btn-primary" data-route="upload">Upload selfie</button>
        </div>
      </section>
      <section class="card form-card">
        <div class="kicker">What happens next</div>
        <ul class="muted" style="font-size:18px; line-height:1.9; padding-left:22px;">
          <li>Upload your photo</li>
          <li>Complete your profile</li>
          <li>Pick Doppel or Chaos</li>
          <li>Start matching and chatting</li>
        </ul>
      </section>
    </div>
  `);
}

function uploadPage() {
  gateAuth();
  return shell(`
    <div class="auth-wrap" style="max-width:820px;">
      <div class="card auth-card">
        <div class="kicker">Step 1</div>
        <h2 style="font-size:42px; margin:10px 0 8px;">Upload your selfie</h2>
        <p class="muted" style="font-size:18px;">Good lighting. Just you. Face card only.</p>
        <form id="uploadForm">
          <div class="upload-box">
            <img class="photo-preview ${state.profile.selfie ? '' : 'hidden'}" id="selfiePreview" src="${state.profile.selfie || ''}" alt="Selfie preview" />
            <div id="uploadPlaceholder" class="${state.profile.selfie ? 'hidden' : ''}">
              <div class="emoji">📸</div>
              <p><strong>Pick your best selfie</strong></p>
              <p class="muted">No sunglasses. No group pics. No heavy filters.</p>
            </div>
            <input class="input" type="file" id="selfieFile" accept="image/*" />
          </div>
          <div class="notice">I confirm this is a photo of me and I agree it can be used to generate match results inside DoppelCrush.</div>
          <div class="button-row" style="margin-top:20px;">
            <button type="button" class="btn btn-ghost" data-route="welcome">Back</button>
            <button class="btn btn-primary">Use this selfie</button>
          </div>
        </form>
      </div>
    </div>
  `);
}

function profilePage() {
  gateAuth();
  return shell(`
    <div class="auth-wrap" style="max-width:900px;">
      <div class="card auth-card">
        <div class="kicker">Step 2</div>
        <h2 style="font-size:42px; margin:10px 0 8px;">Build your profile</h2>
        <p class="muted" style="font-size:18px;">Give your matches something to work with.</p>
        <form id="profileForm">
          <div class="grid-2">
            <div>
              <div class="form-group"><label>First name</label><input class="input" name="firstName" value="${escapeHtml(state.profile.firstName)}" required /></div>
              <div class="form-group"><label>Age</label><input class="input" type="number" min="18" max="99" name="age" value="${escapeHtml(state.profile.age)}" required /></div>
              <div class="form-group"><label>Gender</label>
                <select name="gender"><option ${sel(state.profile.gender,'')}>Select</option><option ${sel(state.profile.gender,'Woman')}>Woman</option><option ${sel(state.profile.gender,'Man')}>Man</option><option ${sel(state.profile.gender,'Non-binary')}>Non-binary</option></select>
              </div>
            </div>
            <div>
              <div class="form-group"><label>Looking for</label>
                <select name="lookingFor"><option ${sel(state.profile.lookingFor,'Women')}>Women</option><option ${sel(state.profile.lookingFor,'Men')}>Men</option><option ${sel(state.profile.lookingFor,'Everyone')}>Everyone</option></select>
              </div>
              <div class="form-group"><label>Location</label><input class="input" name="location" value="${escapeHtml(state.profile.location)}" placeholder="London" /></div>
              <div class="form-group"><label>Bio</label><textarea name="bio" placeholder="Funny, flirty, chaotic, iconic — your call.">${escapeHtml(state.profile.bio)}</textarea></div>
            </div>
          </div>
          <div class="button-row"><button type="button" class="btn btn-ghost" data-route="upload">Back</button><button class="btn btn-primary">Save and continue</button></div>
        </form>
      </div>
    </div>
  `);
}

function modeSetupPage() {
  gateAuth();
  return shell(`
    <div class="auth-wrap" style="max-width:980px;">
      <div class="card auth-card">
        <div class="kicker">Step 3</div>
        <h2 style="font-size:42px; margin:10px 0 8px;">Pick your mode</h2>
        <p class="muted" style="font-size:18px;">You can switch this later anytime.</p>
        <div class="mode-strip">
          <button class="card mode-card mode-option ${state.profile.mode === 'doppel' ? 'selected' : ''}" data-mode="doppel" style="text-align:left; border:none; cursor:pointer;">
            <div class="badge">Doppel Mode</div>
            <h3>A little bit you.</h3>
            <p>Find people who match your twin energy.</p>
          </button>
          <button class="card mode-card mode-option ${state.profile.mode === 'chaos' ? 'selected' : ''}" data-mode="chaos" style="text-align:left; border:none; cursor:pointer;">
            <div class="badge" style="background: rgba(255,139,56,.14); color: var(--orange);">Chaos Mode</div>
            <h3>Plot twist energy.</h3>
            <p>Go for the total opposite when your usual type needs a shake-up.</p>
          </button>
        </div>
        <div class="button-row" style="margin-top:18px;"><button class="btn btn-ghost" data-route="profile">Back</button><button class="btn btn-primary" id="finishOnboarding">Show me my matches</button></div>
      </div>
    </div>
  `);
}

function discoverPage() {
  gateOnboarding();
  const candidates = getVisibleCandidates();
  const cards = candidates.length ? candidates.map(renderMatchFeedCard).join('') : `<div class="notice">No new matches right now. Check back soon for fresh faces.</div>`;
  return shell(`
    <div class="card form-card">
      <div class="match-feed-top">
        <div>
          <div class="kicker">Discover</div>
          <h2 style="font-size:40px; margin:8px 0;">Your matches</h2>
          <p class="muted" style="font-size:18px;">Swipe through people who match your energy.</p>
        </div>
        <div class="pill-toggle">
          <button class="mode-toggle ${state.selectedMode === 'doppel' ? 'active' : ''}" data-mode="doppel">Doppel</button>
          <button class="mode-toggle ${state.selectedMode === 'chaos' ? 'active' : ''}" data-mode="chaos">Chaos</button>
        </div>
      </div>
      <div class="match-list">${cards}</div>
    </div>
  `, 'discover');
}

function renderMatchFeedCard(u) {
  const score = state.selectedMode === 'doppel' ? u.modeScore : u.chaosScore;
  return `
    <div class="match-card">
      <img class="match-photo" src="${u.image}" alt="${u.name}" />
      <div class="match-meta">
        <h3>${u.name}, ${u.age}</h3>
        <div class="badge">${score}</div>
        <p class="muted">${u.bio}</p>
        <p class="small muted">${u.location} • ${u.vibe}</p>
      </div>
      <div class="actions">
        <button class="btn btn-ghost pass-btn" data-id="${u.id}">Pass</button>
        <button class="btn btn-primary like-btn" data-id="${u.id}">Into it</button>
      </div>
    </div>
  `;
}

function matchesPage() {
  gateOnboarding();
  const matches = state.matches.map(id => state.users.find(u => u.id === id)).filter(Boolean);
  return shell(`
    <div class="card form-card">
      <div class="kicker">Matches</div>
      <h2 style="font-size:40px; margin:8px 0;">Your people</h2>
      ${matches.length ? `<div class="match-list">${matches.map(u => `
        <div class="match-card">
          <img class="match-photo" src="${u.image}" alt="${u.name}" />
          <div class="match-meta">
            <h3>${u.name}, ${u.age}</h3>
            <div class="badge">It’s a match</div>
            <p class="muted">${u.bio}</p>
          </div>
          <div class="actions"><button class="btn btn-primary open-chat" data-id="${u.id}">Start chatting</button></div>
        </div>
      `).join('')}</div>` : `<div class="notice">No matches yet. Your face twin might still be getting ready.</div>`}
    </div>
  `, 'matches');
}

function chatsPage() {
  gateOnboarding();
  const matches = state.matches.map(id => state.users.find(u => u.id === id)).filter(Boolean);
  const current = state.currentChat || matches[0]?.id || null;
  if (current && !state.currentChat) state.currentChat = current;
  const thread = current ? (state.chats[current] || []) : [];
  const activeUser = current ? state.users.find(u => u.id === current) : null;

  return shell(`
    <div class="grid-2">
      <section class="card list-card">
        <div class="kicker">Chats</div>
        <h2 style="font-size:34px; margin:10px 0 18px;">Conversations</h2>
        ${matches.length ? matches.map(u => `
          <div class="chat-list-item open-chat" data-id="${u.id}">
            <img class="chat-avatar" src="${u.image}" alt="${u.name}" />
            <div>
              <strong>${u.name}</strong>
              <div class="muted small">${(state.chats[u.id] || []).slice(-1)[0]?.text || 'Say hi first.'}</div>
            </div>
            <div class="small muted">now</div>
          </div>
        `).join('') : `<div class="notice">When it’s a match, your chats show up here.</div>`}
      </section>
      <section class="card list-card">
        ${activeUser ? `
          <div class="panel-title-row">
            <div>
              <div class="kicker">Chatting with</div>
              <h2 style="font-size:34px; margin-top:8px;">${activeUser.name}</h2>
            </div>
            <button class="btn btn-ghost report-btn" data-id="${activeUser.id}">Report / block</button>
          </div>
          <div class="chat-thread">
            ${thread.length ? thread.map(msg => `<div class="msg ${msg.from === 'me' ? 'me' : 'them'}">${escapeHtml(msg.text)}</div>`).join('') : `
              <div class="msg them">Okay be honest… do we actually look alike?</div>
              <div class="msg me">This match is dangerously familiar.</div>
            `}
          </div>
          <form id="chatForm" class="composer">
            <input class="input" name="message" placeholder="Type your message" />
            <button class="btn btn-primary">Send</button>
          </form>
        ` : `<div class="notice">No chats yet.</div>`}
      </section>
    </div>
  `, 'chats');
}

function profileScreen() {
  gateOnboarding();
  const p = state.profile;
  return shell(`
    <div class="grid-2">
      <section class="card form-card">
        <div class="kicker">Profile</div>
        <h2 style="font-size:40px; margin:10px 0;">${escapeHtml(p.firstName || 'Your profile')}</h2>
        ${p.selfie ? `<img class="photo-preview" src="${p.selfie}" alt="Selfie" />` : ''}
        <p class="muted">${escapeHtml(p.bio || 'No bio yet.')}</p>
        <div class="stats-row">
          <div class="stat-card"><strong>${p.age || '—'}</strong><span class="muted">Age</span></div>
          <div class="stat-card"><strong>${escapeHtml(p.location || '—')}</strong><span class="muted">Location</span></div>
          <div class="stat-card"><strong>${escapeHtml(p.lookingFor || '—')}</strong><span class="muted">Looking for</span></div>
          <div class="stat-card"><strong>${p.mode === 'doppel' ? 'Doppel' : 'Chaos'}</strong><span class="muted">Mode</span></div>
        </div>
      </section>
      <section class="card form-card">
        <div class="kicker">Quick actions</div>
        <h2 style="font-size:34px; margin:10px 0 18px;">Manage your account</h2>
        <div class="settings-list">
          <div class="setting-item"><span>Edit your profile</span><button class="btn btn-ghost" data-route="profile-edit">Edit</button></div>
          <div class="setting-item"><span>Switch your mode</span><button class="btn btn-ghost" data-route="mode">Change</button></div>
          <div class="setting-item"><span>Go to chats</span><button class="btn btn-ghost" data-route="chats">Open</button></div>
        </div>
      </section>
    </div>
  `, 'profile');
}

function profileEditScreen() {
  return profilePage();
}

function settingsPage() {
  gateOnboarding();
  return shell(`
    <div class="card form-card">
      <div class="kicker">Settings</div>
      <h2 style="font-size:40px; margin:10px 0 18px;">Account and safety</h2>
      <div class="settings-list">
        <div class="setting-item"><span>Notifications</span><button class="btn btn-ghost" id="toggleNotifications">${state.notifications ? 'On' : 'Off'}</button></div>
        <div class="setting-item"><span>Reset this browser profile</span><button class="btn btn-ghost" id="resetBtn">Reset</button></div>
        <div class="setting-item"><span>Privacy and safety</span><span class="muted">18+, opt-in only</span></div>
        <div class="setting-item"><span>Logged in as</span><span class="muted">${escapeHtml(state.profile.email || 'demo')}</span></div>
      </div>
      <div class="notice" style="margin-top:18px;">Use your own selfie only. If anything feels off inside chats, use the report/block controls.</div>
    </div>
  `, 'settings');
}

function adminPage() {
  gateOnboarding();
  return shell(`
    <div class="card form-card">
      <div class="kicker">Admin demo</div>
      <h2 style="font-size:40px; margin:10px 0 18px;">Moderation snapshot</h2>
      <div class="stats-row">
        <div class="stat-card"><strong>${state.users.length}</strong><span class="muted">Users</span></div>
        <div class="stat-card"><strong>${state.matches.length}</strong><span class="muted">Matches</span></div>
        <div class="stat-card"><strong>${state.reports.length}</strong><span class="muted">Reports</span></div>
        <div class="stat-card"><strong>${state.blocks.length}</strong><span class="muted">Blocks</span></div>
      </div>
      <div class="grid-2" style="margin-top:20px;">
        <section class="list-card card">
          <h3>Reports</h3>
          ${state.reports.length ? state.reports.map(r => `<div class="setting-item"><span>${escapeHtml(r.name)}</span><span class="muted">${escapeHtml(r.reason)}</span></div>`).join('') : '<div class="notice">No reports yet.</div>'}
        </section>
        <section class="list-card card">
          <h3>Blocked users</h3>
          ${state.blocks.length ? state.blocks.map(b => `<div class="setting-item"><span>${escapeHtml(getUser(b.id)?.name || 'User')}</span><span class="muted">Blocked</span></div>`).join('') : '<div class="notice">No blocked users yet.</div>'}
        </section>
      </div>
    </div>
  `, 'admin');
}

function shell(content, activeNav = '') {
  return `
    <div class="app-shell">
      ${header()}
      ${content}
      <div class="bottom-nav">
        ${navBtn('discover', 'Discover', activeNav)}
        ${navBtn('matches', 'Matches', activeNav)}
        ${navBtn('chats', 'Chats', activeNav)}
        ${navBtn('profile', 'Profile', activeNav)}
        ${navBtn('settings', 'Settings', activeNav)}
        ${navBtn('admin', 'Admin', activeNav)}
      </div>
    </div>
  `;
}

function navBtn(route, label, activeNav) {
  return `<button class="nav-btn ${activeNav === route ? 'active' : ''}" data-route="${route}">${label}</button>`;
}

function getVisibleCandidates() {
  const seen = new Set([...state.likes, ...state.passes, ...state.matches, ...state.blocks.map(b => b.id)]);
  let pool = state.users.filter(u => !seen.has(u.id));
  if (!pool.length) {
    state.likes = [];
    state.passes = [];
    pool = state.users.filter(u => !state.blocks.some(b => b.id === u.id));
  }
  return state.selectedMode === 'doppel' ? pool.slice(0, 4) : pool.slice().reverse().slice(0, 4);
}

function likeUser(id) {
  if (!state.likes.includes(id)) state.likes.push(id);
  if (!state.matches.includes(id)) state.matches.push(id);
  if (!state.chats[id]) {
    state.chats[id] = [
      { from: 'them', text: `Hey ${state.profile.firstName || 'you'} — this match is kind of iconic.` },
      { from: 'me', text: 'Okay but do we actually look alike?' }
    ];
  }
  state.currentChat = id;
  saveState();
  render();
}

function passUser(id) {
  if (!state.passes.includes(id)) state.passes.push(id);
  saveState();
  render();
}

function reportOrBlock(id) {
  const user = getUser(id);
  if (!user) return;
  const reason = prompt(`Report ${user.name} or type BLOCK to block them. Example: fake profile`);
  if (!reason) return;
  if (reason.toUpperCase() === 'BLOCK') {
    if (!state.blocks.some(b => b.id === id)) state.blocks.push({ id, at: Date.now() });
    state.matches = state.matches.filter(mid => mid !== id);
    delete state.chats[id];
  } else {
    state.reports.push({ id, name: user.name, reason, at: Date.now() });
  }
  saveState();
  render();
}

function getUser(id) { return state.users.find(u => u.id === id); }

function gateAuth() {
  if (!state.auth.isLoggedIn) setRoute('signup');
}

function gateOnboarding() {
  if (!state.auth.isLoggedIn) setRoute('signup');
  if (!state.profile.onboardingComplete) setRoute('welcome');
}

function sel(val, expected) { return val === expected ? 'selected' : ''; }
function escapeHtml(str='') { return String(str).replace(/[&<>\"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s])); }

function render() {
  const routeMap = {
    home: homePage,
    login: () => authPage('login'),
    signup: () => authPage('signup'),
    welcome: onboardingWelcome,
    upload: uploadPage,
    profile: profileScreen,
    'profile-edit': profileEditScreen,
    mode: modeSetupPage,
    discover: discoverPage,
    matches: matchesPage,
    chats: chatsPage,
    settings: settingsPage,
    admin: adminPage,
    how: () => shell(`<div class="card form-card"><div class="kicker">How it works</div><h2 style="font-size:40px; margin:10px 0 18px;">Cute, quick, and easy to get into.</h2><div class="grid-2"><div><h3>1. Upload your selfie</h3><p class="muted">Just you. No group pics. No sunglasses. No hiding the face card.</p><h3>2. Pick your mode</h3><p class="muted">Go Doppel for the familiar, or Chaos for the plot twist.</p></div><div><h3>3. Meet your matches</h3><p class="muted">Swipe through people who match your energy.</p><h3>4. Chat if it clicks</h3><p class="muted">If it’s a match, jump straight into chat.</p></div></div></div>`),
    faq: () => shell(`<div class="card form-card"><div class="kicker">FAQ</div><h2 style="font-size:40px; margin:10px 0 18px;">The quick answers.</h2><div class="settings-list"><div class="setting-item"><span>Do I need to upload a selfie?</span><span class="muted">Yes — that’s how matching works.</span></div><div class="setting-item"><span>Can I use someone else’s photo?</span><span class="muted">No. Selfies must be your own.</span></div><div class="setting-item"><span>What is Chaos Mode?</span><span class="muted">It flips the vibe and shows your total opposite.</span></div><div class="setting-item"><span>Can I reset my profile?</span><span class="muted">Yes — you can reset this browser version in Settings.</span></div></div></div>`),
    safety: () => shell(`<div class="card form-card"><div class="kicker">Safety</div><h2 style="font-size:40px; margin:10px 0 18px;">18+, opt-in, and your photo only.</h2><div class="settings-list"><div class="setting-item"><span>Adults only</span><span class="muted">DoppelCrush is for 18+ users.</span></div><div class="setting-item"><span>Use your own photo</span><span class="muted">Only upload selfies of yourself.</span></div><div class="setting-item"><span>Opt-in only</span><span class="muted">Everyone you see joined on purpose.</span></div><div class="setting-item"><span>Report and block</span><span class="muted">Use the built-in tools if anything feels off.</span></div></div></div>`),
  };

  const page = routeMap[state.route] || homePage;
  app.innerHTML = page();
  bindEvents();
}

function bindEvents() {
  document.querySelectorAll('[data-route]').forEach(btn => {
    btn.addEventListener('click', () => setRoute(btn.dataset.route));
  });

  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    state.auth.isLoggedIn = false;
    state.route = 'home';
    saveState();
    render();
  });

  document.getElementById('hideNotice')?.addEventListener('click', () => {
    state.demoNoticeSeen = true;
    saveState();
    render();
  });

  document.getElementById('signupForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(e.target);
    if (!data.get('ageConfirmed') || !data.get('consent')) {
      alert('Please confirm you are 18+ and that you will only upload your own photo.');
      return;
    }
    state.profile.email = data.get('email');
    state.profile.password = data.get('password');
    state.profile.firstName = data.get('firstName');
    state.profile.ageConfirmed = true;
    state.profile.consent = true;
    state.auth.isLoggedIn = true;
    state.route = 'welcome';
    saveState();
    render();
  });

  document.getElementById('loginForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(e.target);
    state.profile.email = data.get('email');
    state.profile.password = data.get('password');
    state.auth.isLoggedIn = true;
    state.route = state.profile.onboardingComplete ? 'discover' : 'welcome';
    saveState();
    render();
  });

  document.getElementById('uploadForm')?.addEventListener('submit', e => {
    e.preventDefault();
    if (!state.profile.selfie) {
      alert('Please upload a selfie first.');
      return;
    }
    state.route = 'profile-edit';
    saveState();
    render();
  });

  document.getElementById('selfieFile')?.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      state.profile.selfie = reader.result;
      saveState();
      document.getElementById('selfiePreview')?.classList.remove('hidden');
      document.getElementById('uploadPlaceholder')?.classList.add('hidden');
      document.getElementById('selfiePreview').src = reader.result;
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('profileForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(e.target);
    state.profile.firstName = data.get('firstName');
    state.profile.age = data.get('age');
    state.profile.gender = data.get('gender');
    state.profile.lookingFor = data.get('lookingFor');
    state.profile.location = data.get('location');
    state.profile.bio = data.get('bio');
    state.route = 'mode';
    saveState();
    render();
  });

  document.querySelectorAll('.mode-option, .mode-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;
      if (btn.classList.contains('mode-option')) {
        state.profile.mode = mode;
      } else {
        state.selectedMode = mode;
      }
      saveState();
      render();
    });
  });

  document.getElementById('finishOnboarding')?.addEventListener('click', () => {
    state.profile.onboardingComplete = true;
    state.selectedMode = state.profile.mode || 'doppel';
    state.route = 'discover';
    saveState();
    render();
  });

  document.querySelectorAll('.like-btn').forEach(btn => btn.addEventListener('click', () => likeUser(btn.dataset.id)));
  document.querySelectorAll('.pass-btn').forEach(btn => btn.addEventListener('click', () => passUser(btn.dataset.id)));
  document.querySelectorAll('.open-chat').forEach(btn => btn.addEventListener('click', () => {
    state.currentChat = btn.dataset.id;
    state.route = 'chats';
    saveState();
    render();
  }));
  document.querySelectorAll('.report-btn').forEach(btn => btn.addEventListener('click', () => reportOrBlock(btn.dataset.id)));

  document.getElementById('chatForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const input = e.target.elements.message;
    const text = input.value.trim();
    if (!text || !state.currentChat) return;
    state.chats[state.currentChat] = state.chats[state.currentChat] || [];
    state.chats[state.currentChat].push({ from: 'me', text });
    state.chats[state.currentChat].push({ from: 'them', text: 'Okay wait, that was cute.' });
    input.value = '';
    saveState();
    render();
  });

  document.getElementById('toggleNotifications')?.addEventListener('click', () => {
    state.notifications = !state.notifications;
    saveState();
    render();
  });
  document.getElementById('resetBtn')?.addEventListener('click', resetApp);
}

render();
