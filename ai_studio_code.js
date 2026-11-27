(function () {
  const STORAGE_KEY = "hyakugo_bank_cms_v1";

  const DEFAULT_CMS = {
    alert: {
      enabled: true,
      style: "alert-info",
      text: "【Important】 Hyakugo ID (Passkey FIDO2) authentication is now active for Hyakugo Direct Banking."
    },
    hero: {
      badge: "Est. 1878 • Tsu City, Mie • Bank Code 0155",
      title: "Trusted Regional Strength Meets Next-Gen Digital Banking.",
      desc: "Serving Mie, Aichi, Tokyo, and beyond with 24/7 Hyakugo Direct Banking, Passbook-less Smartphone Banking, and NISA wealth support.",
      cta: "Open Hyakugo Direct Portal →"
    },
    rates: {
      usdJpy: "¥151.40",
      eurJpy: "¥160.25",
      timeRate: "0.35%",
      loanRate: "0.475%"
    },
    templates: [
      {
        id: "t1",
        title: "Scheduled System Maintenance (2nd Sunday)",
        type: "warning",
        body: "Hyakugo Direct Banking will undergo scheduled maintenance on the 2nd Sunday of this month from 0:00 to 6:00 JST."
      },
      {
        id: "t2",
        title: "Anti-Phishing & Hyakugo ID Passkey Alert",
        type: "danger",
        body: "Security Alert: Hyakugo Bank never requests your PIN via SMS links. Enable FIDO2 Passkey login via Hyakugo ID."
      },
      {
        id: "t3",
        title: "New Campaign: High-Yield Time Deposit",
        type: "campaign",
        body: "Special Campaign! Open an online Time Deposit via Smartphone Banking and earn preferential interest rates."
      },
      {
        id: "t4",
        title: "Mie & Tokai Regional Weather Advisory",
        type: "info",
        body: "During severe weather alerts in Mie Prefecture, please use 24/7 Hyakugo Smartphone Banking from home."
      }
    ],
    notices: [
      { id: "n1", date: "2026.11.25", tag: "Security", tagClass: "tag-red", text: "Passkey (FIDO2) authentication rollout completed across Hyakugo Direct and Smartphone Banking." },
      { id: "n2", date: "2026.11.18", tag: "Campaign", tagClass: "tag-green", text: "New NISA Automated Investment Plan: Start from ¥5,000/month with reduced digital fees." },
      { id: "n3", date: "2026.11.10", tag: "Maintenance", tagClass: "tag-amber", text: "Regular monthly maintenance occurs every 2nd Sunday from 00:00 to 06:00 JST." }
    ],
    insights: [
      {
        id: "i1",
        tag: "1878 Heritage",
        title: "Why It’s Called 'Hyakugo' (105)",
        body: "Founded in 1878 in Tsu City as the 105th National Bank (第百五国立銀行)—making Hyakugo one of Japan’s proudest historic regional banks."
      },
      {
        id: "i2",
        tag: "Smart Security",
        title: "How Hyakugo ID Passkeys Stop Phishing",
        body: "Unlike SMS OTPs, FIDO2 Passkeys bind your biometrics directly to our verified domain—blocking phishing attacks."
      },
      {
        id: "i3",
        tag: "Mie Economy",
        title: "Supporting Ise-Shima & Tokai Innovation",
        body: "With 145+ branches and desks in Shanghai and Bangkok, Hyakugo Bank connects local Mie businesses to global markets."
      }
    ],
    banking: {
      ordinary: 2485320,
      time: 5000000,
      nisa: 1840000,
      ledger: [
        { title: "TechCorp Japan Salary", meta: "Direct Deposit • Today", amount: 385000 },
        { title: "Matsusaka Local Mart", meta: "105BESTIO Debit • Yesterday", amount: -8420 },
        { title: "Chubu Electric Power", meta: "Auto-Debit • Nov 22", amount: -11300 },
        { title: "eMAXIS Slim NISA Auto-Buy", meta: "Investment • Nov 20", amount: -50000 }
      ]
    }
  };

  function cloneDefaults() {
    return JSON.parse(JSON.stringify(DEFAULT_CMS));
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : cloneDefaults();
    } catch {
      return cloneDefaults();
    }
  }

  function save(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Storage unavailable fallback
    }
  }

  function reset() {
    const fresh = cloneDefaults();
    save(fresh);
    return fresh;
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (m) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m];
    });
  }

  function formatJPY(amount) {
    return new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(amount);
  }

  function renderAlertBar(cms) {
    const bar = document.getElementById("liveAlertBar");
    const txt = document.getElementById("liveAlertText");
    if (!bar || !txt) return;
    bar.className = "live-alert-bar " + cms.alert.style + (cms.alert.enabled ? "" : " hidden");
    txt.textContent = cms.alert.text;
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

  window.HyakugoStore = {
    load,
    save,
    reset,
    escapeHtml,
    formatJPY,
    renderAlertBar,
    showToast
  };
})();