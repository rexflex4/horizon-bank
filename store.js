(function () {
  const STORAGE_KEY = "chb_portal_db_v1";
  const SESSION_KEY = "chb_active_user_id";
  const ADMIN_SESSION_KEY = "chb_admin_unlocked";

  const DEFAULT_DB = {
    contact: {
      domain: "crimsonhorizonbank.jp",
      email: "horizonbank.jp@gmail.com",
      phone: "+81-3-5550-0105",
      address: "Otemachi Financial Tower, Tokyo, Japan"
    },
    adminCredentials: {
      username: "admin",
      passcode: "CHB2026"
    },
    alert: {
      enabled: true,
      style: "alert-info",
      text: "Welcome to Crimson Horizon Bank Online Banking — 24/7 Digital Services & Passkey Protection Active."
    },
    hero: {
      eyebrow: "LET'S GROW IT.",
      badge: "Crimson Horizon Bank • Personal, Business & Wealth",
      title: "Banking That Supports You Every Step of the Way.",
      desc: "Open Everyday Checking, Business Advantage, or Wealth accounts online with instant 3D card controls and zero hidden fees.",
      cta: "Open Free Account →"
    },
    serviceStatus: [
      { name: "Online & Mobile Banking", sub: "24/7 Login & Balance Sync", status: "Operational" },
      { name: "3D Horizon Card & Freeze", sub: "POS, Online & Virtual Cards", status: "Operational" },
      { name: "ACH, Wires & Remote Deposit", sub: "Domestic & Global FX", status: "Operational" },
      { name: "ATMs & Video Banking", sub: "8:00 AM – 8:00 PM Extended", status: "Operational" }
    ],
    rates: {
      usdJpy: "¥151.40",
      eurJpy: "¥160.25",
      timeRate: "0.45%",
      loanRate: "0.475%"
    },
    templates: [
      {
        id: "t1",
        title: "Scheduled System Maintenance (2nd Sunday)",
        type: "warning",
        body: "Horizon Online Banking will undergo scheduled maintenance on the 2nd Sunday from 00:00 to 05:00 JST."
      },
      {
        id: "t2",
        title: "Security Notice: Protect Your Login Credentials",
        type: "danger",
        body: "Crimson Horizon Bank never asks for your password, card PIN, or security codes via SMS or email links."
      },
      {
        id: "t3",
        title: "New Campaign: 0.45% APY 1-Year Time Deposit",
        type: "campaign",
        body: "Open a 1-Year Time Deposit inside your Horizon Dashboard and earn a preferential 0.45% annual yield."
      },
      {
        id: "t4",
        title: "Consumer Loan Applications Notice",
        type: "info",
        body: "Online loan estimates are available 24/7. Contact your local branch or horizonbank.jp@gmail.com for personal assistance."
      }
    ],
    notices: [
      { id: "n1", date: "2026.11.25", tag: "Security", tagClass: "tag-red", text: "Enhanced 3D Card Freeze & Instant Controls are now active for all online banking customers." },
      { id: "n2", date: "2026.11.18", tag: "Campaign", tagClass: "tag-green", text: "New customers receive instant Everyday Checking setup with zero monthly service fee." },
      { id: "n3", date: "2026.11.10", tag: "Maintenance", tagClass: "tag-amber", text: "Scheduled system check occurs every 2nd Sunday from 00:00 to 05:00 JST." }
    ],
    insights: [
      {
        id: "i1",
        tag: "Personal Finance",
        title: "The 50 / 30 / 20 Budgeting Rule",
        body: "Allocate 50% of take-home pay to essentials, 30% to lifestyle, and automate 20% straight into Easy Save or high-yield deposits."
      },
      {
        id: "i2",
        tag: "Security Center",
        title: "Why Card Freeze Stops Online Fraud Instantly",
        body: "With 3D Horizon Card controls, locking your card disables unauthorized online and POS charges in milliseconds."
      },
      {
        id: "i3",
        tag: "Business Management",
        title: "Streamlining Cash Flow with Remote Deposit",
        body: "Businesses save hours every week using Remote Deposit Capture, ACH origination, and multi-user permissions."
      }
    ],
    customers: [
      {
        id: "u_demo",
        fullName: "Alex Morgan",
        email: "demo@horizonbank.jp",
        phone: "+81-90-1234-5678",
        password: "Demo1234",
        accountNumber: "8801-001-4821",
        accountType: "Personal",
        planName: "Everyday Checking (¥0 Monthly Fee)",
        status: "Active",
        balances: {
          checking: 2485320,
          savings: 5000000,
          vault: 1840000
        },
        savingsGoal: { name: "Tokyo Condo Down Payment", target: 8000000, current: 5000000 },
        ledger: [
          { title: "TechCorp Payroll Deposit", meta: "Direct Deposit • Today", amount: 385000 },
          { title: "Shibuya Electronics", meta: "Horizon Card • Yesterday", amount: -14800 },
          { title: "Tokyo Electric Power", meta: "Auto-Debit • Nov 22", amount: -11300 },
          { title: "Monthly Automated Savings", meta: "Internal Vault • Nov 20", amount: -50000 }
        ]
      }
    ]
  };

  function cloneDefaults() {
    return JSON.parse(JSON.stringify(DEFAULT_DB));
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return cloneDefaults();
      const parsed = JSON.parse(raw);
      const def = cloneDefaults();
      // Ensure new fields always exist when upgrading from older stored data
      if (!parsed.serviceStatus) parsed.serviceStatus = def.serviceStatus;
      if (!parsed.hero.eyebrow) parsed.hero.eyebrow = def.hero.eyebrow;
      if (!parsed.adminCredentials) parsed.adminCredentials = def.adminCredentials;
      if (!parsed.contact) parsed.contact = def.contact;
      return parsed;
    } catch {
      return cloneDefaults();
    }
  }

  function save(db) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch { /* ignore */ }
  }

  function reset() {
    const fresh = cloneDefaults();
    save(fresh);
    return fresh;
  }

  function registerCustomer({ fullName, email, phone, password }) {
    const db = load();
    const cleanEmail = email.trim().toLowerCase();
    if (db.customers.some((c) => c.email.toLowerCase() === cleanEmail)) {
      return { ok: false, error: "An account with this email already exists." };
    }

    const rand4 = Math.floor(1000 + Math.random() * 9000);
    const newUser = {
      id: "u_" + Date.now(),
      fullName: fullName.trim(),
      email: cleanEmail,
      phone: phone.trim(),
      password: password,
      accountNumber: `8801-002-${rand4}`,
      accountType: "Personal",
      planName: "Everyday Checking (¥0 Monthly Fee)",
      status: "Active",
      balances: { checking: 100000, savings: 0, vault: 0 },
      savingsGoal: { name: "Emergency Reserve", target: 1000000, current: 0 },
      ledger: [
        { title: "Welcome Starter Deposit", meta: "Crimson Horizon Bonus • Just now", amount: 100000 }
      ]
    };

    db.customers.push(newUser);
    save(db);
    setSession(newUser.id);
    return { ok: true, user: newUser };
  }

  function loginCustomer(email, password) {
    const db = load();
    const cleanEmail = email.trim().toLowerCase();
    const user = db.customers.find((c) => c.email.toLowerCase() === cleanEmail && c.password === password);
    if (!user) return { ok: false, error: "Invalid email or password." };
    if (user.status === "Suspended") {
      return { ok: false, error: "This account is suspended. Contact " + db.contact.email };
    }
    setSession(user.id);
    return { ok: true, user };
  }

  function setSession(userId) {
    try { localStorage.setItem(SESSION_KEY, userId); } catch {}
  }

  function getCurrentUser() {
    try {
      const id = localStorage.getItem(SESSION_KEY);
      if (!id) return null;
      const db = load();
      return db.customers.find((c) => c.id === id) || null;
    } catch {
      return null;
    }
  }

  function logoutCustomer() {
    try { localStorage.removeItem(SESSION_KEY); } catch {}
  }

  function isAdminUnlocked() {
    try { return sessionStorage.getItem(ADMIN_SESSION_KEY) === "1"; } catch { return false; }
  }

  function setAdminUnlocked(val) {
    try {
      if (val) sessionStorage.setItem(ADMIN_SESSION_KEY, "1");
      else sessionStorage.removeItem(ADMIN_SESSION_KEY);
    } catch {}
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (m) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m];
    });
  }

  function formatJPY(amount) {
    return new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(amount);
  }

  function renderAlertBar(db) {
    const bar = document.getElementById("liveAlertBar");
    const txt = document.getElementById("liveAlertText");
    if (!bar || !txt) return;
    bar.className = "live-alert-bar " + db.alert.style + (db.alert.enabled ? "" : " hidden");
    txt.textContent = db.alert.text;
  }

  let toastTimer;
  function showToast(msg) {
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 3000);
  }

  window.HorizonStore = {
    STORAGE_KEY,
    load,
    save,
    reset,
    registerCustomer,
    loginCustomer,
    getCurrentUser,
    logoutCustomer,
    isAdminUnlocked,
    setAdminUnlocked,
    escapeHtml,
    formatJPY,
    renderAlertBar,
    showToast
  };
})();
