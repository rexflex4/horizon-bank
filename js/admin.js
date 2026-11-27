(function () {
  const {
    load,
    save,
    reset,
    isAdminUnlocked,
    setAdminUnlocked,
    escapeHtml,
    formatJPY,
    renderAlertBar,
    showToast
  } = window.HorizonStore;

  const TAG_MAP = {
    info: { label: "Notice", cls: "tag-blue", alert: "alert-info" },
    warning: { label: "Maintenance", cls: "tag-amber", alert: "alert-warning" },
    danger: { label: "Security", cls: "tag-red", alert: "alert-danger" },
    campaign: { label: "Campaign", cls: "tag-green", alert: "alert-campaign" }
  };

  const INSIGHT_PRESETS = {
    compound: {
      tag: "Wealth Building",
      title: "The Power of Automated Monthly Deposits",
      body: "Setting an automatic monthly transfer into your Time Deposit Vault builds steady compounding reserves without needing daily effort."
    },
    phishing: {
      tag: "Security Guide",
      title: "3 Ways to Spot Fake Banking Messages",
      body: "Always verify the official domain in your address bar, never share one-time codes, and freeze your 3D Horizon Card if you see unknown activity."
    },
    fx: {
      tag: "Global FX",
      title: "Locking Exchange Rates Before You Travel",
      body: "Moving funds into your Global Vault ahead of international trips protects your travel budget from sudden currency swings."
    }
  };

  function checkGate() {
    const unlocked = isAdminUnlocked();
    document.getElementById("adminGate").style.display = unlocked ? "none" : "grid";
    document.getElementById("adminWorkspace").style.display = unlocked ? "block" : "none";
    if (unlocked) renderAdmin();
  }

  document.getElementById("adminLoginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const db = load();
    const u = document.getElementById("admUser").value.trim();
    const p = document.getElementById("admPass").value;
    const errEl = document.getElementById("admGateError");

    if (u === db.adminCredentials.username && p === db.adminCredentials.passcode) {
      errEl.style.display = "none";
      setAdminUnlocked(true);
      checkGate();
      showToast("Admin workspace unlocked.");
    } else {
      errEl.textContent = "Invalid admin username or passcode.";
      errEl.style.display = "block";
    }
  });

  document.getElementById("adminLockBtn").addEventListener("click", function () {
    setAdminUnlocked(false);
    checkGate();
  });

  function openAdminTab(tabName) {
    document.querySelectorAll(".admin-panel-tab").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".admin-nav-btn").forEach((b) => b.classList.remove("active"));
    const target = document.getElementById("admintab-" + tabName);
    const btn = document.querySelector(`.admin-nav-btn[data-admintab="${tabName}"]`);
    if (target) target.classList.add("active");
    if (btn) btn.classList.add("active");
  }

  document.querySelectorAll(".admin-nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => openAdminTab(btn.dataset.admintab));
  });

  function renderAdmin() {
    const db = load();
    renderAlertBar(db);

    // Sync inputs
    document.getElementById("admAlertEnabled").checked = db.alert.enabled;
    document.getElementById("admAlertStyle").value = db.alert.style;
    document.getElementById("admAlertText").value = db.alert.text;

    document.getElementById("admHeroBadge").value = db.hero.badge;
    document.getElementById("admHeroTitle").value = db.hero.title;
    document.getElementById("admHeroDesc").value = db.hero.desc;
    document.getElementById("admHeroCta").value = db.hero.cta;

    document.getElementById("admDomain").value = db.contact.domain;
    document.getElementById("admEmail").value = db.contact.email;
    document.getElementById("admPhone").value = db.contact.phone;
    document.getElementById("admAddress").value = db.contact.address;

    document.getElementById("admUsdJpy").value = db.rates.usdJpy;
    document.getElementById("admEurJpy").value = db.rates.eurJpy;
    document.getElementById("admTimeRate").value = db.rates.timeRate;
    document.getElementById("admLoanRate").value = db.rates.loanRate;

    // Templates
    document.getElementById("templatesLibraryList").innerHTML = db.templates.length === 0
      ? `<p style="color:var(--muted);">No templates yet.</p>`
      : db.templates.map((t, idx) => {
          const meta = TAG_MAP[t.type] || TAG_MAP.info;
          return `
            <div class="template-card">
              <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.45rem;">
                <div>
                  <span class="tag ${meta.cls}" style="margin:0 0.4rem 0 0;">${meta.label}</span>
                  <strong>${escapeHtml(t.title)}</strong>
                </div>
                <div style="display:flex; gap:0.45rem; flex-wrap:wrap;">
                  <button type="button" class="btn-dark" data-action="push-alert" data-index="${idx}">Push to Top Alert</button>
                  <button type="button" class="btn-outline" data-action="push-notice" data-index="${idx}">+ Add to Notices</button>
                  <button type="button" class="btn-outline" data-action="delete-tpl" data-index="${idx}">🗑</button>
                </div>
              </div>
              <p style="font-size:0.86rem; color:var(--slate);">${escapeHtml(t.body)}</p>
            </div>
          `;
        }).join("");

    // Active Notices
    document.getElementById("adminNoticesList").innerHTML = db.notices.length === 0
      ? `<p style="color:var(--muted);">No active notices.</p>`
      : db.notices.map((n, idx) => `
          <div class="template-card" style="display:flex; justify-content:space-between; gap:1rem; align-items:center; flex-wrap:wrap;">
            <div>
              <span style="font-size:0.78rem; color:var(--muted); margin-right:0.5rem;">${escapeHtml(n.date)}</span>
              <span class="tag ${escapeHtml(n.tagClass)}" style="margin:0 0.4rem 0 0;">${escapeHtml(n.tag)}</span>
              <span style="font-size:0.88rem;">${escapeHtml(n.text)}</span>
            </div>
            <button type="button" class="btn-outline" data-action="delete-notice" data-index="${idx}">Remove</button>
          </div>
        `).join("");

    // Insights
    document.getElementById("adminInsightsList").innerHTML = db.insights.length === 0
      ? `<p style="color:var(--muted);">No articles published.</p>`
      : db.insights.map((ins, idx) => `
          <div class="template-card" style="display:flex; justify-content:space-between; gap:1rem; align-items:flex-start;">
            <div>
              <span class="tag tag-blue">${escapeHtml(ins.tag)}</span>
              <strong style="display:block; margin-bottom:0.25rem;">${escapeHtml(ins.title)}</strong>
              <p style="font-size:0.84rem; color:var(--slate);">${escapeHtml(ins.body)}</p>
            </div>
            <button type="button" class="btn-outline" data-action="delete-insight" data-index="${idx}">Delete</button>
          </div>
        `).join("");

    // Customers
    document.getElementById("adminCustomersList").innerHTML = db.customers.map((c, idx) => `
      <div class="template-card" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
        <div>
          <span class="tag ${c.status === "Active" ? "tag-green" : "tag-red"}" style="margin:0 0.4rem 0 0;">${escapeHtml(c.status)}</span>
          <strong>${escapeHtml(c.fullName)}</strong>
          <div style="font-size:0.82rem; color:var(--muted); margin-top:0.2rem;">
            ${escapeHtml(c.email)} • ${escapeHtml(c.phone)} • Acct: ${escapeHtml(c.accountNumber)}
          </div>
          <div style="font-size:0.86rem; font-weight:700; margin-top:0.25rem;">
            Checking: ${formatJPY(c.balances.checking)} | Savings: ${formatJPY(c.balances.savings)}
          </div>
        </div>
        <div style="display:flex; gap:0.45rem; flex-wrap:wrap;">
          <button type="button" class="btn-dark" data-action="credit-user" data-index="${idx}">+ Credit ¥50,000</button>
          <button type="button" class="btn-outline" data-action="toggle-status" data-index="${idx}">
            ${c.status === "Active" ? "Suspend" : "Activate"}
          </button>
        </div>
      </div>
    `).join("");
  }

  // Event Delegation for Dynamic Buttons
  document.addEventListener("click", function (e) {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const action = btn.dataset.action;
    const idx = Number(btn.dataset.index);
    const db = load();

    if (action === "push-alert") {
      const t = db.templates[idx];
      const meta = TAG_MAP[t.type] || TAG_MAP.info;
      db.alert.enabled = true;
      db.alert.style = meta.alert;
      db.alert.text = `【${t.title}】 ${t.body}`;
      showToast("Template pushed to Top Alert Banner!");
    } else if (action === "push-notice") {
      const t = db.templates[idx];
      const meta = TAG_MAP[t.type] || TAG_MAP.info;
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, ".");
      db.notices.unshift({
        id: "n" + Date.now(),
        date: today,
        tag: meta.label,
        tagClass: meta.cls,
        text: `${t.title} — ${t.body}`
      });
      showToast("Template added to homepage notices!");
    } else if (action === "delete-tpl") {
      db.templates.splice(idx, 1);
      showToast("Template deleted.");
    } else if (action === "delete-notice") {
      db.notices.splice(idx, 1);
      showToast("Notice removed.");
    } else if (action === "delete-insight") {
      db.insights.splice(idx, 1);
      showToast("Article deleted.");
    } else if (action === "credit-user") {
      const u = db.customers[idx];
      u.balances.checking += 50000;
      u.ledger.unshift({
        title: "Bank Admin Credit Deposit",
        meta: "Horizon Operations • Just now",
        amount: 50000
      });
      showToast(`Credited ¥50,000 to ${u.fullName}`);
    } else if (action === "toggle-status") {
      const u = db.customers[idx];
      u.status = u.status === "Active" ? "Suspended" : "Active";
      showToast(`${u.fullName} is now ${u.status}`);
    }

    save(db);
    renderAdmin();
  });

  document.getElementById("customTemplateForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const db = load();
    db.templates.unshift({
      id: "t" + Date.now(),
      title: document.getElementById("tplTitle").value.trim(),
      type: document.getElementById("tplType").value,
      body: document.getElementById("tplBody").value.trim()
    });
    save(db);
    renderAdmin();
    e.target.reset();
    showToast("Custom template saved!");
  });

  document.getElementById("saveAlertBtn").addEventListener("click", function () {
    const db = load();
    db.alert.enabled = document.getElementById("admAlertEnabled").checked;
    db.alert.style = document.getElementById("admAlertStyle").value;
    db.alert.text = document.getElementById("admAlertText").value.trim();
    save(db);
    renderAdmin();
    showToast("Alert banner updated!");
  });

  document.getElementById("saveHeroBtn").addEventListener("click", function () {
    const db = load();
    db.hero.badge = document.getElementById("admHeroBadge").value.trim();
    db.hero.title = document.getElementById("admHeroTitle").value.trim();
    db.hero.desc = document.getElementById("admHeroDesc").value.trim();
    db.hero.cta = document.getElementById("admHeroCta").value.trim();
    save(db);
    renderAdmin();
    showToast("Homepage Hero updated!");
  });

  document.getElementById("saveContactBtn").addEventListener("click", function () {
    const db = load();
    db.contact.domain = document.getElementById("admDomain").value.trim();
    db.contact.email = document.getElementById("admEmail").value.trim();
    db.contact.phone = document.getElementById("admPhone").value.trim();
    db.contact.address = document.getElementById("admAddress").value.trim();
    save(db);
    renderAdmin();
    showToast("Contact settings saved!");
  });

  document.querySelectorAll(".preset-insight-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const p = INSIGHT_PRESETS[this.dataset.preset];
      if (!p) return;
      document.getElementById("insTag").value = p.tag;
      document.getElementById("insTitle").value = p.title;
      document.getElementById("insBody").value = p.body;
    });
  });

  document.getElementById("addInsightForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const db = load();
    db.insights.unshift({
      id: "i" + Date.now(),
      tag: document.getElementById("insTag").value.trim(),
      title: document.getElementById("insTitle").value.trim(),
      body: document.getElementById("insBody").value.trim()
    });
    save(db);
    renderAdmin();
    e.target.reset();
    showToast("Insight article published!");
  });

  document.getElementById("saveRatesBtn").addEventListener("click", function () {
    const db = load();
    db.rates.usdJpy = document.getElementById("admUsdJpy").value.trim();
    db.rates.eurJpy = document.getElementById("admEurJpy").value.trim();
    db.rates.timeRate = document.getElementById("admTimeRate").value.trim();
    db.rates.loanRate = document.getElementById("admLoanRate").value.trim();
    save(db);
    renderAdmin();
    showToast("Rates updated live!");
  });

  document.getElementById("resetDefaultsBtn").addEventListener("click", function () {
    reset();
    renderAdmin();
    showToast("Restored to default Crimson Horizon Bank settings.");
  });

  checkGate();
})();
