// ════════════════════════════════════════════════
//  Smart Email Sorter – Gmail API + Classification Engine
// ════════════════════════════════════════════════

/* ── Gmail API Configuration ───────────────────────────────── */
const GMAIL_CONFIG = {
  CLIENT_ID: '61953097945-n81mhmtk27ijn516rhmhnt9l9e19h4ll.apps.googleusercontent.com',
  SCOPES: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
  DISCOVERY_DOC: 'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest',
};

let tokenClient = null;
let gapiInited = false;
let gisInited = false;
let isGmailMode = false;
let isDemoMode = false;
let currentAccessToken = null;

/* ── Category Definitions ───────────────────────────────────── */
const CATEGORIES = {
  work: {
    label: 'Work', emoji: '💼', color: '#3b82f6',
    avatarColors: ['#1d4ed8','#2563eb','#3b82f6'],
  },
  personal: {
    label: 'Personal', emoji: '👤', color: '#10b981',
    avatarColors: ['#059669','#10b981','#34d399'],
  },
  promotions: {
    label: 'Promotions', emoji: '🏷️', color: '#f59e0b',
    avatarColors: ['#d97706','#f59e0b','#fbbf24'],
  },
  social: {
    label: 'Social', emoji: '🌐', color: '#ec4899',
    avatarColors: ['#db2777','#ec4899','#f472b6'],
  },
  finance: {
    label: 'Finance', emoji: '💳', color: '#06b6d4',
    avatarColors: ['#0891b2','#06b6d4','#22d3ee'],
  },
  newsletter: {
    label: 'Newsletter', emoji: '📰', color: '#8b5cf6',
    avatarColors: ['#7c3aed','#8b5cf6','#a78bfa'],
  },
  travel: {
    label: 'Travel', emoji: '✈️', color: '#14b8a6',
    avatarColors: ['#0d9488','#14b8a6','#2dd4bf'],
  },
  updates: {
    label: 'Updates', emoji: '🔔', color: '#f97316',
    avatarColors: ['#ea580c','#f97316','#fb923c'],
  },
  spam: {
    label: 'Spam', emoji: '🚫', color: '#f43f5e',
    avatarColors: ['#e11d48','#f43f5e','#fb7185'],
  },
};

/* ── Keyword Rules ──────────────────────────────────────────── */
const RULES = {
  work: {
    keywords: ['meeting','project','deadline','team','report','client','agenda','conference','sprint','review','ticket','jira','slack','pull request','deployment','office','colleague','hr','onboarding','performance','quarterly','kpi','budget','invoice','proposal','presentation','schedule','interview','feedback','deliverable','milestone','manager','employee','task','backlog','standup','workflow'],
    senderPatterns: [/\b(corp|inc|ltd|company|team|hr|noreply|support|office|work|biz)\b/i],
    weight: 1.0,
  },
  personal: {
    keywords: ['hey','hi there','how are you','miss you','family','friend','birthday','party','dinner','weekend','vacation','hope you','just checking','catch up','hang out','love you','kids','mom','dad','brother','sister','wedding','anniversary','personal','home','plan for','let me know','holiday'],
    senderPatterns: [/gmail\.com|yahoo\.com|hotmail\.com|icloud\.com|outlook\.com/i],
    weight: 0.9,
  },
  promotions: {
    keywords: ['sale','discount','off','deal','offer','promo','coupon','shop','buy','order','free shipping','exclusive','limited time','% off','save','clearance','new arrival','best price','cart','checkout','today only','black friday','cyber monday','flash sale','subscribe and save','reward','loyalty','redeem','voucher','gift card','unsubscribe'],
    senderPatterns: [/marketing|promo|deals|offers|newsletter|shop|store|sale|noreply@/i],
    weight: 1.0,
  },
  social: {
    keywords: ['notification','new message','friend request','follow','like','comment','mention','tagged','shared','story','post','tweet','instagram','linkedin','facebook','twitter','tiktok','youtube','connection','network','joined','event','group','community','reaction','follower','dm','video','live','profile'],
    senderPatterns: [/facebook|twitter|instagram|linkedin|tiktok|youtube|reddit|pinterest|snapchat/i],
    weight: 1.1,
  },
  finance: {
    keywords: ['statement','balance','account','transaction','payment','transfer','deposit','withdrawal','invoice','receipt','tax','refund','credit','debit','bank','loan','mortgage','interest','due date','bill','charge','fee','wallet','paypal','stripe','venmo','crypto','bitcoin','investment','portfolio','dividend','insurance','premium'],
    senderPatterns: [/bank|finance|payment|paypal|stripe|billing|invoice|tax|accounting/i],
    weight: 1.0,
  },
  newsletter: {
    keywords: ['newsletter','digest','weekly','monthly','roundup','edition','issue','subscribe','unsubscribe','read more','read online','view in browser','curated','top stories','this week','best of','tips','trends','insights','latest news','brought to you','in case you missed','tldr','summary','update from','our blog','new article','new post'],
    senderPatterns: [/newsletter|digest|weekly|monthly|news@|updates@|blog@|editorial/i],
    weight: 1.0,
  },
  travel: {
    keywords: ['booking','reservation','flight','hotel','check-in','check-out','itinerary','boarding pass','ticket','baggage','airline','airport','destination','trip','journey','travel','vacation','cruise','rental','airbnb','booking.com','expedia','visa','passport','luggage','departure','arrival','gate'],
    senderPatterns: [/airlines?|booking|airbnb|expedia|hotels?|travel|flights?|trip/i],
    weight: 1.1,
  },
  updates: {
    keywords: ['update','version','release','changelog','new feature','patch','security update','maintenance','downtime','upgrade','system','notification','alert','reminder','your account','password','login','verification','confirm','2fa','otp','settings changed','action required','policy update','terms of service','privacy policy'],
    senderPatterns: [/noreply|no-reply|system|security|admin|support|donotreply/i],
    weight: 0.9,
  },
  spam: {
    keywords: ['winner','lottery','prize','million','billion','free money','claim now','act now','guaranteed','no risk','click here to claim','dear beneficiary','prince','inheritance','wire transfer','western union','urgent assistance','100% free','earn from home','work from home','make money fast','lose weight','pharmacy','viagra','pills','dear friend','selected winner'],
    senderPatterns: [/\.xyz$|\.top$|\.click$|\.gq$|\.ml$|\.cf$|\.tk$|lottery|prize|winner/i],
    weight: 1.2,
  },
};

/* ── Sample Emails ──────────────────────────────────────────── */
const SAMPLES = {
  work: {
    from: 'sarah.park@techventures.com', to: 'team@techventures.com',
    subject: 'Sprint Planning Meeting – Friday 3PM',
    body: `Hi Team,\n\nJust a heads-up that our Sprint Planning meeting is scheduled for this Friday at 3:00 PM in Conference Room B.\n\nPlease review the current backlog in Jira before the meeting and add any tickets you think should be included in the next sprint.\n\nAgenda:\n- Review last sprint deliverables\n- Discuss Q3 KPIs\n- Assign new sprint tasks\n\nThe meeting link will be shared 30 minutes before. Remote team members, please use the usual Teams link.\n\nBest,\nSarah Park\nProject Manager | TechVentures`
  },
  personal: {
    from: 'alex.reynolds@gmail.com', to: 'you@gmail.com',
    subject: 'Hey! Weekend plans?',
    body: `Hey,\n\nHow are you doing? It's been a while since we've caught up!\n\nWe're thinking of planning a little dinner party at our place this Saturday evening around 7PM. Nothing fancy — just friends, good food and maybe some board games afterwards 😄\n\nLet me know if you can make it. Would love to have you!\n\nMiss you lots,\nAlex`
  },
  promotions: {
    from: 'deals@shopnow-store.com', to: 'you@gmail.com',
    subject: '⚡ FLASH SALE: 50% OFF Everything – Today Only!',
    body: `Hi Valued Customer,\n\n🎉 Our biggest sale of the year is LIVE!\n\nFor today only, enjoy 50% OFF across our entire store.\n✔ Free shipping on all orders\n✔ Exclusive members-only discounts\n✔ No minimum order required\n\nUse code: FLASH50 at checkout.\n\n👉 Shop Now: www.shopnow-store.com/sale\n\nHurry! Sale ends at midnight. Don't miss out on our best deals of the season!\n\nHappy Shopping,\nThe ShopNow Team\n\nUnsubscribe | Manage Preferences`
  },
  social: {
    from: 'notifications@linkedin.com', to: 'you@gmail.com',
    subject: 'You have 3 new connection requests on LinkedIn',
    body: `Hi there,\n\nYou have 3 new connection requests waiting for you!\n\n• James Wilson – Senior Engineer at Google\n• Priya Sharma – Product Manager at Meta\n• Carlos Mendez – UX Designer at Airbnb\n\nAlso, your recent post received 47 likes and 12 comments this week.\n\n👀 Maria Rodriguez viewed your profile.\n\nSee who's viewed your profile → linkedin.com/in/you\n\nThe LinkedIn Team\nUnsubscribe from notifications`
  },
  finance: {
    from: 'statements@nationalbank.com', to: 'you@gmail.com',
    subject: 'Your July Account Statement is Ready',
    body: `Dear Customer,\n\nYour monthly account statement for July 2026 is now available.\n\nAccount Summary:\n- Account: ****4821\n- Opening Balance: $3,248.50\n- Total Deposits: $4,200.00\n- Total Withdrawals: $2,847.32\n- Closing Balance: $4,601.18\n\nYour next payment of $342.00 is due on July 25, 2026.\n\nView full statement: nationalbank.com/statements\n\nNational Bank Customer Service\nDo not reply to this email.`
  },
  travel: {
    from: 'bookings@skyways-airlines.com', to: 'you@gmail.com',
    subject: 'Your Booking Confirmation – Flight SK4821 Dubai → London',
    body: `Booking Confirmation\n\nDear Passenger,\n\nYour flight booking has been confirmed! Here are your details:\n\nFlight: SK4821\nRoute: Dubai (DXB) → London Heathrow (LHR)\nDate: 14 July 2026\nDeparture: 02:35 AM\nArrival: 07:10 AM (local time)\nSeat: 24A (Window)\nBaggage: 23kg checked + 7kg carry-on\n\nOnline check-in opens 24 hours before departure.\nBording pass: skyways-airlines.com/checkin\n\nHave a wonderful journey!\nSkyways Airlines`
  },
  newsletter: {
    from: 'digest@techweekly.io', to: 'you@gmail.com',
    subject: '📰 TechWeekly Digest – Issue #142 | Top Stories This Week',
    body: `TechWeekly Digest – Issue #142\nWeek of June 9, 2026\n\nHello Reader,\n\nHere's your weekly roundup of the top tech stories:\n\n🔥 TOP STORIES\n\n1. OpenAI Releases GPT-5 with Multimodal Reasoning\n   Read more → techweekly.io/gpt5\n\n2. Apple Unveils iOS 21 with AI-Powered Home Screen\n   Read more → techweekly.io/ios21\n\n3. The Rise of Agentic AI: What It Means for Developers\n   Read more → techweekly.io/agentic-ai\n\n─────────────────\n💡 TIP OF THE WEEK\nUse CSS @layer for better cascade management in large projects.\n\nUnsubscribe | View in browser | Manage preferences`
  },
  spam: {
    from: 'winner@global-lottery-prize.xyz', to: 'you@gmail.com',
    subject: '🎉 CONGRATULATIONS! You WON $2,500,000 — CLAIM NOW!!!',
    body: `Dear Lucky Beneficiary,\n\nCONGRATULATIONS!! You have been randomly selected as the Grand Prize Winner of our International Email Lottery.\n\nYou have WON TWO MILLION FIVE HUNDRED THOUSAND DOLLARS ($2,500,000 USD) — 100% FREE!\n\nTo CLAIM your prize money, ACT NOW!\nClick here to claim: http://lottery-prize-winner.xyz/claim?id=A9K2\n\nYou must respond within 24 HOURS or your prize will be forfeited.\n\nProvide: Full name, bank account, Western Union details.\n\nDr. Victor James\nInternational Lottery Commission\nTel: +44-7952-XXXXX`
  }
};

/* ── Demo Batch ─────────────────────────────────────────────── */
const DEMO_EMAILS = [
  { from:'sarah.park@techventures.com', subject:'Sprint Planning – Friday 3PM', body:'Hi team, sprint meeting this Friday at 3PM. Please review the backlog in Jira. Agenda: Q3 KPIs, deliverables review, assign new tasks. Regards, Sarah.', time: demoTime(5) },
  { from:'notifications@linkedin.com', subject:'3 new connection requests on LinkedIn', body:'You have 3 new connection requests: James Wilson (Google), Priya Sharma (Meta), Carlos Mendez (Airbnb). Also your post got 47 likes. Someone viewed your profile.', time: demoTime(20) },
  { from:'deals@shopnow-store.com', subject:'⚡ FLASH SALE: 50% OFF – Today Only!', body:'Our biggest sale is LIVE! 50% off everything. Free shipping. Use code FLASH50. Shop now at shopnow-store.com. Hurry, ends midnight! Unsubscribe.', time: demoTime(45) },
  { from:'statements@nationalbank.com', subject:'Your July Account Statement is Ready', body:'Your July statement is ready. Balance: $4,601.18. Next payment due July 25. View full statement at nationalbank.com/statements.', time: demoTime(60) },
  { from:'bookings@skyways-airlines.com', subject:'Booking Confirmation – Flight SK4821', body:'Flight SK4821 Dubai to London, July 14. Departs 02:35. Seat 24A. 23kg baggage. Check in online at skyways-airlines.com/checkin.', time: demoTime(90) },
  { from:'alex.reynolds@gmail.com', subject:'Weekend dinner plans?', body:'Hey! How are you? We are planning a dinner party Saturday 7PM at our place. Nothing fancy — just friends and board games. Can you come? Miss you!', time: demoTime(120) },
  { from:'digest@techweekly.io', subject:'TechWeekly Digest – Issue #142', body:'Your weekly tech roundup: GPT-5 released, Apple iOS 21 unveiled, rise of Agentic AI. Tip of the week: CSS @layer. Unsubscribe | View in browser.', time: demoTime(180) },
  { from:'winner@lottery-prize.xyz', subject:'CONGRATULATIONS! You WON $2,500,000!!!', body:'Dear Lucky Beneficiary, you have been selected as Grand Prize Winner! Claim $2.5 million USD free! ACT NOW within 24 hours. Western Union. Click to claim.', time: demoTime(200) },
  { from:'noreply@github.com', subject:'[Action Required] Verify your email', body:'Please verify your email address to activate your GitHub account. Click the verification link. If you did not request this, ignore this email. GitHub Security.', time: demoTime(240) },
  { from:'hr@techventures.com', subject:'Q3 Performance Review – Schedule Your 1:1', body:'Hi, it is time for Q3 performance reviews. Please schedule your 1:1 with your manager via the HR portal. Deadline is end of month. Best, HR Team.', time: demoTime(300) },
];

function demoTime(minAgo) {
  return new Date(Date.now() - minAgo * 60000).getTime();
}

/* ── State ─────────────────────────────────────────────────── */
let emails      = JSON.parse(localStorage.getItem('ses_emails') || '[]');
let currentCat  = 'all';
let currentView = 'list';
let searchQuery = '';
let sortOrder   = 'newest';
let selectedIds = new Set();

/* ══════════════════════════════════════════════════════════════
   GMAIL API INTEGRATION
   ══════════════════════════════════════════════════════════════ */

/* ── Initialize GAPI ──────────────────────────────────────── */
function initGapi() {
  gapi.load('client', async () => {
    try {
      await gapi.client.init({
        discoveryDocs: [GMAIL_CONFIG.DISCOVERY_DOC],
      });
      gapiInited = true;
      maybeEnableButtons();
    } catch (err) {
      console.error('GAPI init error:', err);
    }
  });
}

/* ── Initialize GIS (Google Identity Services) ────────────── */
function initGis() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: GMAIL_CONFIG.CLIENT_ID,
    scope: GMAIL_CONFIG.SCOPES,
    callback: handleTokenResponse,
  });
  gisInited = true;
  maybeEnableButtons();
}

function maybeEnableButtons() {
  if (gapiInited && gisInited) {
    document.getElementById('gmailLoginBtn').disabled = false;
  }
}

/* ── Handle Token Response ────────────────────────────────── */
async function handleTokenResponse(tokenResponse) {
  if (tokenResponse.error) {
    console.error('Token error:', tokenResponse);
    showToast('❌ Login failed. Please try again.');
    return;
  }

  currentAccessToken = tokenResponse.access_token;
  isGmailMode = true;

  // Fetch user profile
  try {
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${currentAccessToken}` }
    });
    const profile = await profileRes.json();
    
    showUserProfile(profile);
  } catch (err) {
    console.error('Profile fetch error:', err);
  }

  // Show the app
  showApp();
  showToast('✅ Connected to Gmail! Click "Fetch Emails" to load your inbox.');
}

/* ── Gmail Login Handler ──────────────────────────────────── */
function handleGmailLogin() {
  if (!gapiInited || !gisInited) {
    showToast('⏳ Google API is still loading. Please wait a moment...');
    return;
  }

  tokenClient.requestAccessToken({ prompt: 'consent' });
}

/* ── Enter Demo Mode ──────────────────────────────────────── */
function enterDemoMode() {
  isDemoMode = true;
  isGmailMode = false;
  showApp();
  showToast('📧 Demo mode – using sample emails. Sign in with Google for real emails!');
}

/* ── Show App / Hide Login ────────────────────────────────── */
function showApp() {
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('appShell').classList.remove('hidden');

  if (isGmailMode) {
    document.getElementById('fetchGmailBtn').style.display = 'flex';
    document.getElementById('emptyFetchBtn').style.display = 'flex';
    document.getElementById('fetchCountWrap').classList.remove('hidden');
    document.getElementById('gmailBadge').classList.remove('hidden');
    document.getElementById('userProfile').classList.remove('hidden');
  }

  renderEmails();
}

/* ── Show User Profile ────────────────────────────────────── */
function showUserProfile(profile) {
  const avatar = document.getElementById('userAvatar');
  const name = document.getElementById('userName');
  const email = document.getElementById('userEmail');

  if (profile.picture) {
    avatar.src = profile.picture;
    avatar.style.display = 'block';
  }
  name.textContent = profile.name || 'User';
  email.textContent = profile.email || '';
  
  document.getElementById('userProfile').classList.remove('hidden');
}

/* ── Logout ───────────────────────────────────────────────── */
function handleLogout() {
  if (currentAccessToken) {
    google.accounts.oauth2.revoke(currentAccessToken, () => {
      console.log('Token revoked');
    });
  }
  currentAccessToken = null;
  isGmailMode = false;
  isDemoMode = false;
  emails = [];
  saveEmails();
  
  document.getElementById('loginScreen').classList.remove('hidden');
  document.getElementById('appShell').classList.add('hidden');
  document.getElementById('userProfile').classList.add('hidden');
  document.getElementById('gmailBadge').classList.add('hidden');
  
  showToast('👋 Signed out successfully.');
}

/* ══════════════════════════════════════════════════════════════
   FETCH GMAIL EMAILS
   ══════════════════════════════════════════════════════════════ */

async function fetchGmailEmails() {
  if (!isGmailMode || !currentAccessToken) {
    showToast('⚠ Please sign in with Google first.');
    return;
  }

  const fetchCount = parseInt(document.getElementById('fetchCount').value) || 25;
  const loadingOverlay = document.getElementById('loadingOverlay');
  const loadingText = document.getElementById('loadingText');
  const loadingSub = document.getElementById('loadingSub');
  const loadingProgress = document.getElementById('loadingProgress');
  const fetchBtn = document.getElementById('fetchGmailBtn');

  // Show loading
  loadingOverlay.classList.remove('hidden');
  fetchBtn.disabled = true;
  document.getElementById('fetchBtnText').textContent = 'Fetching...';
  loadingProgress.style.width = '0%';

  try {
    // Step 1: Get message list
    loadingText.textContent = 'Connecting to Gmail...';
    loadingSub.textContent = 'Fetching message list';
    loadingProgress.style.width = '10%';

    const listRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${fetchCount}`,
      { headers: { Authorization: `Bearer ${currentAccessToken}` } }
    );

    if (!listRes.ok) {
      if (listRes.status === 401) {
        showToast('🔑 Session expired. Please sign in again.');
        handleLogout();
        return;
      }
      throw new Error(`Gmail API error: ${listRes.status}`);
    }

    const listData = await listRes.json();
    const messages = listData.messages || [];

    if (messages.length === 0) {
      loadingOverlay.classList.add('hidden');
      showToast('📭 No emails found in your inbox.');
      fetchBtn.disabled = false;
      document.getElementById('fetchBtnText').textContent = 'Fetch Emails';
      return;
    }

    loadingText.textContent = `Loading ${messages.length} emails...`;
    loadingProgress.style.width = '20%';

    // Step 2: Fetch each message detail (in batches for speed)
    const batchSize = 5;
    const newEmails = [];
    
    for (let i = 0; i < messages.length; i += batchSize) {
      const batch = messages.slice(i, i + batchSize);
      const promises = batch.map(msg =>
        fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`,
          { headers: { Authorization: `Bearer ${currentAccessToken}` } }
        ).then(res => res.json()).catch(() => null)
      );

      const results = await Promise.all(promises);

      results.forEach(msgData => {
        if (!msgData || msgData.error) return;
        
        const emailObj = parseGmailMessage(msgData);
        if (emailObj) newEmails.push(emailObj);
      });

      // Update progress
      const progress = 20 + ((i + batch.length) / messages.length) * 70;
      loadingProgress.style.width = progress + '%';
      loadingText.textContent = `Processing ${Math.min(i + batchSize, messages.length)} of ${messages.length} emails...`;
      loadingSub.textContent = `${newEmails.length} emails classified`;
    }

    // Step 3: Add to state
    loadingText.textContent = 'Classifying emails...';
    loadingProgress.style.width = '95%';

    // Clear existing emails and add new ones
    emails = [];
    newEmails.forEach(emailData => {
      const result = classifyEmail(emailData.from, emailData.subject, emailData.body);
      const avatar = getAvatar(emailData.from, result.category);
      
      emails.push({
        id: emailData.gmailId + Math.random(),
        gmailId: emailData.gmailId,
        from: emailData.from || 'Unknown Sender',
        to: emailData.to || '',
        subject: emailData.subject || '(No Subject)',
        body: emailData.body || '',
        category: result.category,
        confidence: result.confidence,
        signals: result.signals,
        foundKeywords: result.foundKeywords,
        avatar,
        timestamp: emailData.timestamp || Date.now(),
        unread: !emailData.isRead,
        selected: false,
        isGmail: true,
      });
    });

    saveEmails();
    loadingProgress.style.width = '100%';
    
    await delay(300);
    loadingOverlay.classList.add('hidden');
    renderEmails();
    
    showToast(`✅ Loaded & sorted ${newEmails.length} emails from Gmail!`);

  } catch (err) {
    console.error('Gmail fetch error:', err);
    loadingOverlay.classList.add('hidden');
    showToast('❌ Error fetching emails: ' + err.message);
  }

  fetchBtn.disabled = false;
  document.getElementById('fetchBtnText').textContent = 'Fetch Emails';
}

/* ── Parse Gmail Message ──────────────────────────────────── */
function parseGmailMessage(msgData) {
  try {
    const headers = msgData.payload?.headers || [];
    const getHeader = (name) => {
      const h = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
      return h ? h.value : '';
    };

    const from = getHeader('From');
    const to = getHeader('To');
    const subject = getHeader('Subject');
    const date = getHeader('Date');
    const timestamp = date ? new Date(date).getTime() : Date.now();

    // Extract body
    let body = '';
    const payload = msgData.payload;

    if (payload) {
      body = extractBody(payload);
    }

    // Clean the body text
    body = cleanEmailBody(body);

    // Check read status
    const isRead = !(msgData.labelIds || []).includes('UNREAD');

    return {
      gmailId: msgData.id,
      from: cleanSender(from),
      to,
      subject,
      body,
      timestamp: isNaN(timestamp) ? Date.now() : timestamp,
      isRead,
    };
  } catch (err) {
    console.error('Parse error:', err);
    return null;
  }
}

/* ── Extract Email Body (handles multipart) ───────────────── */
function extractBody(payload) {
  // Direct body data
  if (payload.body?.data) {
    return decodeBase64Url(payload.body.data);
  }

  // Multipart - look for text/plain first, then text/html
  if (payload.parts) {
    // First pass: look for text/plain
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        return decodeBase64Url(part.body.data);
      }
    }
    // Second pass: look for text/html
    for (const part of payload.parts) {
      if (part.mimeType === 'text/html' && part.body?.data) {
        return stripHtml(decodeBase64Url(part.body.data));
      }
    }
    // Recursive: check nested parts
    for (const part of payload.parts) {
      if (part.parts) {
        const nested = extractBody(part);
        if (nested) return nested;
      }
    }
  }

  return '';
}

/* ── Decode Base64 URL-safe encoding ──────────────────────── */
function decodeBase64Url(data) {
  try {
    const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
    return decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  } catch (e) {
    try {
      return atob(data.replace(/-/g, '+').replace(/_/g, '/'));
    } catch (e2) {
      return '';
    }
  }
}

/* ── Strip HTML Tags ──────────────────────────────────────── */
function stripHtml(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  // Remove script/style elements
  div.querySelectorAll('script, style').forEach(el => el.remove());
  return div.textContent || div.innerText || '';
}

/* ── Clean Sender ─────────────────────────────────────────── */
function cleanSender(from) {
  // "John Doe <john@example.com>" → "john@example.com"
  const match = from.match(/<([^>]+)>/);
  return match ? match[1] : from;
}

/* ── Clean Email Body ─────────────────────────────────────── */
function cleanEmailBody(body) {
  return body
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+$/gm, '')
    .trim()
    .slice(0, 5000); // Limit length
}

/* ══════════════════════════════════════════════════════════════
   CLASSIFICATION ENGINE
   ══════════════════════════════════════════════════════════════ */

function classifyEmail(from, subject, body) {
  const text   = `${from} ${subject} ${body}`.toLowerCase();
  const scores = {};

  for (const [cat, rule] of Object.entries(RULES)) {
    let score = 0;
    const found = rule.keywords.filter(k => text.includes(k));
    score += (found.length / Math.max(rule.keywords.length * 0.3, 1)) * rule.weight;

    // Sender pattern bonus
    const senderLower = from.toLowerCase();
    if (rule.senderPatterns.some(p => p.test(senderLower))) score += 0.5 * rule.weight;

    scores[cat] = { score, foundKeywords: found.slice(0, 8) };
  }

  // Find best category
  let best = 'personal', bestScore = 0;
  for (const [cat, data] of Object.entries(scores)) {
    if (data.score > bestScore) { bestScore = data.score; best = cat; }
  }

  // Compute normalized confidences for all cats
  const total = Object.values(scores).reduce((s, d) => s + d.score, 0) || 1;
  const signals = Object.entries(scores)
    .map(([cat, d]) => ({ cat, score: d.score, pct: Math.round((d.score / total) * 100) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return {
    category: best,
    confidence: Math.min(Math.round((bestScore / (total)) * 100 * 2.5), 99),
    signals,
    foundKeywords: scores[best]?.foundKeywords || [],
  };
}

/* ── Avatar Helper ─────────────────────────────────────────── */
function getAvatar(from, cat) {
  const letter = (from || '?')[0].toUpperCase();
  const colors = CATEGORIES[cat]?.avatarColors || ['#6366f1'];
  const color  = colors[Math.floor(Math.random() * colors.length)];
  return { letter, color };
}

/* ── Add Email ─────────────────────────────────────────────── */
function addEmail(from, to, subject, body, timestamp) {
  const result  = classifyEmail(from, subject, body);
  const avatar  = getAvatar(from, result.category);
  const email   = {
    id: Date.now() + Math.random(),
    from: from || 'Unknown Sender',
    to: to || '',
    subject: subject || '(No Subject)',
    body: body || '',
    category: result.category,
    confidence: result.confidence,
    signals: result.signals,
    foundKeywords: result.foundKeywords,
    avatar,
    timestamp: timestamp || Date.now(),
    unread: true,
    selected: false,
  };
  emails.unshift(email);
  saveEmails();
  return email;
}

function saveEmails() {
  localStorage.setItem('ses_emails', JSON.stringify(emails.slice(0, 500)));
}

/* ══════════════════════════════════════════════════════════════
   RENDERING
   ══════════════════════════════════════════════════════════════ */

function getFilteredEmails() {
  let list = currentCat === 'all' ? emails : emails.filter(e => e.category === currentCat);
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    list = list.filter(e =>
      e.from.toLowerCase().includes(q) ||
      e.subject.toLowerCase().includes(q) ||
      e.body.toLowerCase().includes(q)
    );
  }
  if (sortOrder === 'newest') list = list.sort((a,b) => b.timestamp - a.timestamp);
  else if (sortOrder === 'oldest') list = list.sort((a,b) => a.timestamp - b.timestamp);
  else if (sortOrder === 'category') list = list.sort((a,b) => a.category.localeCompare(b.category));
  return list;
}

function renderEmails() {
  const container = document.getElementById('emailContainer');
  const empty = document.getElementById('emptyState');
  const list = getFilteredEmails();

  updateBadges();
  updateStats();
  updateCatHeading(list.length);
  updateStorage();

  if (list.length === 0) {
    empty.style.display = 'flex';
    container.innerHTML = '';
    container.appendChild(empty);
    return;
  }

  empty.style.display = 'none';
  container.innerHTML = '';

  list.forEach((email, idx) => {
    const cat = CATEGORIES[email.category] || CATEGORIES.personal;
    const card = document.createElement('div');
    card.className = `email-card${email.unread ? ' unread' : ''}${selectedIds.has(email.id) ? ' selected' : ''}`;
    card.dataset.cat = email.category;
    card.dataset.id  = email.id;
    card.style.animationDelay = (idx * 0.04) + 's';

    const timeStr = formatTime(email.timestamp);
    const preview = email.body.replace(/\n/g, ' ').trim().slice(0, 90) + '…';
    const senderName = email.from.split('@')[0].replace(/[._-]/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    const gmailTag = email.isGmail ? '<span class="ec-gmail-tag">Gmail</span>' : '';

    card.innerHTML = `
      <div class="ec-check" onclick="toggleSelect(event, '${email.id}')">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <div class="ec-avatar" style="background:${email.avatar.color}">${email.avatar.letter}</div>
      <div class="ec-info">
        <div class="ec-sender">${escHtml(senderName)} &lt;${escHtml(email.from)}&gt;</div>
        <div class="ec-subject">${escHtml(email.subject)}</div>
        <div class="ec-preview">${escHtml(preview)}</div>
      </div>
      <div class="ec-meta">
        <span class="ec-cat-badge cat-${email.category}">${cat.emoji} ${cat.label}</span>
        ${gmailTag}
        <span class="ec-time">${timeStr}</span>
        <button class="ec-del-btn" onclick="deleteEmail(event,'${email.id}')" title="Delete">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
        </button>
      </div>`;

    card.addEventListener('click', (e) => {
      if (e.target.closest('.ec-check') || e.target.closest('.ec-del-btn')) return;
      openDetail(email);
    });

    container.appendChild(card);
  });
}

function updateBadges() {
  const counts = {};
  Object.keys(CATEGORIES).forEach(c => counts[c] = 0);
  emails.forEach(e => { if (counts[e.category] !== undefined) counts[e.category]++; });

  document.getElementById('badge-all').textContent = emails.length;
  Object.entries(counts).forEach(([cat, n]) => {
    const el = document.getElementById('badge-' + cat);
    if (el) el.textContent = n;
  });
}

function updateStats() {
  const counts = {};
  Object.keys(CATEGORIES).forEach(c => counts[c] = 0);
  emails.forEach(e => { if (counts[e.category] !== undefined) counts[e.category]++; });
  document.getElementById('stat-total').textContent    = emails.length;
  document.getElementById('stat-work').textContent     = counts.work;
  document.getElementById('stat-personal').textContent = counts.personal;
  document.getElementById('stat-promo').textContent    = counts.promotions;
  document.getElementById('stat-social').textContent   = counts.social;
  document.getElementById('stat-spam').textContent     = counts.spam;
}

function updateCatHeading(count) {
  const info = currentCat === 'all' ? { emoji: '📬', label: 'All Emails' } : { emoji: CATEGORIES[currentCat]?.emoji || '📧', label: CATEGORIES[currentCat]?.label || currentCat };
  document.getElementById('catEmoji').textContent = info.emoji;
  document.getElementById('catTitle').textContent = info.label;
  document.getElementById('catCount').textContent = count + (count === 1 ? ' email' : ' emails');
}

function updateStorage() {
  const pct = Math.min((emails.length / 500) * 100, 100);
  document.getElementById('storageFill').style.width = pct + '%';
  document.getElementById('storageUsed').textContent = emails.length + ' / 500 emails';
}

/* ── Filter & Search ─────────────────────────────────────────── */
function filterCategory(cat) {
  currentCat = cat;
  selectedIds.clear();
  document.querySelectorAll('.sb-item').forEach(b => b.classList.remove('active'));
  const target = document.getElementById('nav-' + cat);
  if (target) target.classList.add('active');
  renderEmails();
}

function searchEmails() {
  searchQuery = document.getElementById('searchInput').value;
  const clearBtn = document.getElementById('searchClear');
  clearBtn.classList.toggle('visible', searchQuery.length > 0);
  renderEmails();
}

function clearSearch() {
  document.getElementById('searchInput').value = '';
  searchQuery = '';
  document.getElementById('searchClear').classList.remove('visible');
  renderEmails();
}

function sortEmails() {
  const orders = ['newest', 'oldest', 'category'];
  const idx = orders.indexOf(sortOrder);
  sortOrder = orders[(idx + 1) % orders.length];
  const labels = { newest: '↓ Newest First', oldest: '↑ Oldest First', category: '⊞ By Category' };
  document.getElementById('sortBtn').querySelector('svg').nextSibling.textContent = ' ' + labels[sortOrder];
  showToast(`Sorted: ${labels[sortOrder]}`);
  renderEmails();
}

/* ── Selection ─────────────────────────────────────────────── */
function toggleSelect(e, id) {
  e.stopPropagation();
  const numId = parseFloat(id);
  if (selectedIds.has(numId)) selectedIds.delete(numId);
  else selectedIds.add(numId);
  renderEmails();
}

function selectAll() {
  const list = getFilteredEmails();
  list.forEach(e => selectedIds.add(e.id));
  renderEmails();
}

function deleteSelected() {
  if (selectedIds.size === 0) { showToast('⚠ No emails selected.'); return; }
  const count = selectedIds.size;
  emails = emails.filter(e => !selectedIds.has(e.id));
  selectedIds.clear();
  saveEmails();
  renderEmails();
  showToast(`🗑 Deleted ${count} email${count > 1 ? 's' : ''}.`);
}

function deleteEmail(e, id) {
  e.stopPropagation();
  const numId = parseFloat(id);
  emails = emails.filter(em => em.id !== numId);
  saveEmails();
  renderEmails();
  showToast('🗑 Email deleted.');
}

function clearAll() {
  if (emails.length === 0) { showToast('Inbox is already empty.'); return; }
  emails = [];
  selectedIds.clear();
  saveEmails();
  renderEmails();
  showToast('🗑 All emails cleared.');
}

/* ── Compose Modal ─────────────────────────────────────────── */
function openCompose() {
  clearCompose();
  document.getElementById('composeOverlay').classList.add('open');
}
function closeCompose() {
  document.getElementById('composeOverlay').classList.remove('open');
}
function overlayClick(e) {
  if (e.target === document.getElementById('composeOverlay')) closeCompose();
}
function clearCompose() {
  ['mFrom','mTo','mSubject','mBody'].forEach(id => document.getElementById(id).value = '');
}

function fillSample(cat) {
  const s = SAMPLES[cat];
  if (!s) return;
  document.getElementById('mFrom').value    = s.from;
  document.getElementById('mTo').value      = s.to;
  document.getElementById('mSubject').value = s.subject;
  document.getElementById('mBody').value    = s.body;
}

async function sortAndAdd() {
  const from    = document.getElementById('mFrom').value.trim();
  const to      = document.getElementById('mTo').value.trim();
  const subject = document.getElementById('mSubject').value.trim();
  const body    = document.getElementById('mBody').value.trim();

  if (!subject && !body) { showToast('⚠ Enter a subject or body.'); return; }

  const btn = document.getElementById('modalSortBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="msb-icon">⏳</span><span>Sorting…</span>';

  await delay(700);

  const email = addEmail(from, to, subject, body);
  const cat = CATEGORIES[email.category];
  closeCompose();
  renderEmails();

  showToast(`${cat.emoji} Sorted into <strong>${cat.label}</strong> (${email.confidence}% confidence)`);

  btn.disabled = false;
  btn.innerHTML = '<span class="msb-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg></span><span>Sort & Add Email</span>';
}

/* ── Detail Modal ─────────────────────────────────────────────── */
function openDetail(email) {
  // Mark as read
  const found = emails.find(e => e.id === email.id);
  if (found) found.unread = false;
  saveEmails();

  const cat = CATEGORIES[email.category] || CATEGORIES.personal;

  document.getElementById('detailSubject').textContent = email.subject;

  const catTag = document.getElementById('detailCatTag');
  catTag.textContent = cat.emoji + ' ' + cat.label;
  catTag.className = `detail-cat-tag cat-${email.category}`;

  const senderName = email.from.split('@')[0].replace(/[._-]/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const sourceTag = email.isGmail ? '<span class="detail-gmail-src">📧 From Gmail</span>' : '<span class="detail-gmail-src">📝 Manual Entry</span>';
  
  document.getElementById('detailMeta').innerHTML = `
    <div class="detail-meta-row"><span class="detail-meta-label">From:</span><span class="detail-meta-val">${escHtml(senderName)} &lt;${escHtml(email.from)}&gt;</span></div>
    ${email.to ? `<div class="detail-meta-row"><span class="detail-meta-label">To:</span><span class="detail-meta-val">${escHtml(email.to)}</span></div>` : ''}
    <div class="detail-meta-row"><span class="detail-meta-label">Date:</span><span class="detail-meta-val">${new Date(email.timestamp).toLocaleString()}</span></div>
    <div class="detail-meta-row"><span class="detail-meta-label">AI:</span><span class="detail-meta-val">${cat.emoji} Sorted as <strong>${cat.label}</strong> — ${email.confidence}% confidence</span></div>
    <div class="detail-meta-row"><span class="detail-meta-label">Source:</span><span class="detail-meta-val">${sourceTag}</span></div>
  `;

  // Signal chips
  const signalsHtml = email.signals.map(s => {
    const c = CATEGORIES[s.cat];
    return `<div class="ds-chip">
      <span>${c?.emoji || '?'} ${c?.label || s.cat}</span>
      <div class="ds-bar"><div class="ds-bar-fill" style="width:${s.pct}%;background:${c?.color || '#6366f1'}"></div></div>
      <span style="font-size:0.7rem;font-weight:700;color:${c?.color || '#6366f1'}">${s.pct}%</span>
    </div>`;
  }).join('');
  document.getElementById('detailSignals').innerHTML = signalsHtml;
  document.getElementById('detailBody').textContent = email.body;

  document.getElementById('detailOverlay').classList.add('open');
  renderEmails(); // update unread state
}

function closeDetail() {
  document.getElementById('detailOverlay').classList.remove('open');
}

function detailOverlayClick(e) {
  if (e.target === document.getElementById('detailOverlay')) closeDetail();
}

/* ── Load Demo Emails ─────────────────────────────────────────── */
function loadDemoEmails() {
  DEMO_EMAILS.forEach(d => addEmail(d.from, '', d.subject, d.body, d.time));
  renderEmails();
  showToast(`✅ Loaded ${DEMO_EMAILS.length} demo emails — all sorted!`);
}

/* ── View & Sidebar Toggle ─────────────────────────────────── */
function setView(view) {
  currentView = view;
  const container = document.getElementById('emailContainer');
  container.className = `email-container ${view}-view`;
  document.getElementById('viewList').classList.toggle('active', view === 'list');
  document.getElementById('viewGrid').classList.toggle('active', view === 'grid');
}

let sidebarCollapsed = false;
function toggleSidebar() {
  const sb = document.getElementById('sidebar');
  if (window.innerWidth <= 768) {
    sb.classList.toggle('mobile-open');
  } else {
    sidebarCollapsed = !sidebarCollapsed;
    sb.classList.toggle('collapsed', sidebarCollapsed);
  }
}

/* ── Utilities ─────────────────────────────────────────────── */
function formatTime(ts) {
  const now  = Date.now();
  const diff = now - ts;
  const min  = Math.floor(diff / 60000);
  if (min < 1)  return 'just now';
  if (min < 60) return min + 'm ago';
  const hrs  = Math.floor(min / 60);
  if (hrs < 24) return hrs + 'h ago';
  const days = Math.floor(hrs / 24);
  if (days < 7) return days + 'd ago';
  return new Date(ts).toLocaleDateString();
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

function showToast(msg) {
  const t = document.getElementById('toast');
  t.innerHTML = msg;
  t.className = 'toast show';
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 3000);
}

/* ── Animated Grid Background ─────────────────────────────── */
(function initGrid() {
  const canvas = document.getElementById('gridCanvas');
  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const cols  = ['#3b82f6','#6366f1','#ec4899','#10b981','#f59e0b'];
  const dots  = Array.from({ length: 80 }, () => ({
    x: Math.random() * 1, y: Math.random() * 1,
    vx: (Math.random() - 0.5) * 0.0003,
    vy: (Math.random() - 0.5) * 0.0003,
    r: Math.random() * 1.5 + 0.3,
    c: cols[Math.floor(Math.random() * cols.length)],
    a: Math.random() * 0.5 + 0.2,
  }));

  function draw() {
    ctx.clearRect(0, 0, W, H);
    dots.forEach(d => {
      d.x += d.vx; d.y += d.vy;
      if (d.x < 0 || d.x > 1) d.vx *= -1;
      if (d.y < 0 || d.y > 1) d.vy *= -1;
      ctx.beginPath();
      ctx.arc(d.x * W, d.y * H, d.r, 0, Math.PI * 2);
      ctx.fillStyle = d.c;
      ctx.globalAlpha = d.a;
      ctx.fill();
    });

    // Draw connections
    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const dx = (dots[i].x - dots[j].x) * W;
        const dy = (dots[i].y - dots[j].y) * H;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(dots[i].x * W, dots[i].y * H);
          ctx.lineTo(dots[j].x * W, dots[j].y * H);
          ctx.strokeStyle = dots[i].c;
          ctx.globalAlpha = (1 - dist / 120) * 0.08;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ── Init ─────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // Wait for Google scripts to load
  const checkGoogleReady = setInterval(() => {
    if (typeof gapi !== 'undefined' && typeof google !== 'undefined' && google.accounts) {
      clearInterval(checkGoogleReady);
      initGapi();
      initGis();
    }
  }, 100);

  // Timeout fallback – if Google scripts don't load in 10s, enable demo mode
  setTimeout(() => {
    clearInterval(checkGoogleReady);
    if (!gapiInited || !gisInited) {
      console.warn('Google API scripts did not load. Demo mode available.');
      document.getElementById('gmailLoginBtn').innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
        <span>Google API unavailable – Use Demo Mode</span>
      `;
    }
  }, 10000);

  // If we have saved emails and no token, show in demo mode
  if (emails.length > 0) {
    isDemoMode = true;
    showApp();
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeCompose(); closeDetail(); }
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') { e.preventDefault(); openCompose(); }
  });
});
