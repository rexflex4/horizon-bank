(function () {
  const { load, save, reset, escapeHtml, renderAlertBar, showToast } = window.HyakugoStore;

  const TAG_MAP = {
    info: { label: "Notice", cls: "tag-blue", alert: "alert-info" },
    warning: { label: "Maintenance", cls: "tag-amber", alert: "alert-warning" },
    danger: { label: "Security", cls: "tag-red", alert: "alert-danger" },
    campaign: { label: "Campaign", cls: "tag-green", alert: "alert-campaign" }
  };

  const INSIGHT_PRESETS = {
    heritage: {
      tag: "1878 Heritage",
      title: "Kawakita Shirobei & The Spirit of Ise Merchants",
      body: "In the Meiji era, prominent Ise merchants joined Hyakugo Bank’s leadership, blending samurai discipline with practical regional commerce."
    },
    ise: {
      tag: "Regional Economy",
      title: "Supporting Green & Sustainable Local Businesses in Mie",
      body: "Hyakugo Bank Group’s Sustainability Policy channels financing toward clean energy, local agriculture, and regional revitalization across Tokai."
    },
    passkey: {
      tag: "Cybersecurity",
      title: "3 Steps to Enable Passkey Login on Hyakugo Direct",
      body: "Register your Hyakugo ID once, link your smartphone biometrics (Face ID / Touch ID), and enjoy password-free banking with zero SMS risk."
    },
    nisa: {
      tag: "Smart Finance",
      title: "Why Starting NISA Early Multiplies Tax-Free Growth",
      body: "Automating ¥10,000/month in diversified global index funds through Hyakugo Direct lets compound returns grow tax-free over decades."
    }
  };

  function openAdminTab(tabName) {
    const target = document.getElementById("admintab-" + tabName);
    if (!target) return;

    document.querySelectorAll(".admin-panel-tab").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".admin-nav-btn").forEach((b) => b.classList.remove("active"));

    target.classList.add("active");
    const navBtn = document.querySelector(`.admin-nav-btn[data-admintab="${tabName}"]`);
    if (navBtn) navBtn.classList.add("active");
  }

  function renderAdminPage() {
    const cms = load();
    renderAlertBar(cms);

    // Sync Banner & Hero inputs
    document.getElementById("admAlertEnabled").checked = cms.alert.enabled;
    document.getElementById("admAlertStyle").value = cms.alert.style;
    document.getElementById("admAlertText").value = cms.alert.text;

    document.getElementById("admHeroBadge").value = cms.hero.badge;
    document.getElementById("admHeroTitle").value = cms.hero.title;
    document.getElementById("admHeroDesc").value = cms.hero.desc;
    document.getElementById("admHeroCta").value = cms.hero.cta;

    // Sync Rates inputs
    document.getElementById("admUsdJpy").value = cms.rates.usdJpy;
    document.getElementById("admEurJpy").value = cms.rates.eurJpy;
    document.getElementById("admTimeRate").value = cms.rates.timeRate;
    document.getElementById("admLoanRate").value = cms.rates.loanRate;

    // Render Message Templates
    const tplListEl = document.getElementById("templatesLibraryList");
    tplListEl.innerHTML = cms.templates.length === 0
      ? `<p style="color:var(--muted);">No templates saved. Create one below!</p>`
      : cms.templates.map((t, idx) => {
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

    // Render Active Notices
    const noticesEl = document.getElementById("adminNoticesList");
    noticesEl.innerHTML = cms.notices.length === 0
      ? `<p style="color:var(--muted);">No notices currently displayed on the homepage.</p>`
      : cms.notices.map((n, idx) => `
          <div class="template-card" style="display:flex; justify-content:space-between; gap:1rem; align-items:center; flex-wrap:wrap;">
            <div>
              <span style="font-size:0.78rem; color:var(--muted); margin-right:0.5rem;">${escapeHtml(n.date)}</span>
              <span class="tag ${escapeHtml(n.tagClass)}" style="margin:0 0.4rem 0 0;">${escapeHtml(n.tag)}</span>
              <span style="font-size:0.88rem;">${escapeHtml(n.text)}</span>
            </div>
            <button type="button" class="btn-outline" data-action="delete-notice" data-index="${idx}">Remove</button>
          </div>
        `).join("");

    // Render Interesting Information Cards
    const insightsEl = document.getElementById("adminInsightsList");
    insightsEl.innerHTML = cms.insights.length === 0
      ? `<p style="color:var(--muted);">No articles published yet.</p>`
      : cms.insights.map((ins, idx) => `
          <div class="template-card" style="display:flex; justify-content:space-between; gap:1rem; align-items:flex-start;">
            <div>
              <span class="tag tag-blue">${escapeHtml(ins.tag)}</span>
              <strong style="display:block; margin-bottom:0.25rem;">${escapeHtml(ins.title)}</strong>
              <p style="font-size:0.84rem; color:var(--slate);">${escapeHtml(ins.body)}</p>
            </div>
            <button type="button" class="btn-outline" data-action="delete-insight" data-index="${idx}">Delete</button>
          </div>
        `).join("");
  }

  // Sidebar Tab Switching
  document.querySelectorAll(".admin-nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => openAdminTab(btn.dataset.admintab));
  });

  // Template & List Button Actions (Event Delegation)
  document.addEventListener("click", function (e) {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;

    const action = btn.dataset.action;
    const idx = Number(btn.dataset.index);
    const cms = load();

    if (action === "push-alert") {
      const t = cms.templates[idx];
      const meta = TAG_MAP[t.type] || TAG_MAP.info;
      cms.alert.enabled = true;
      cms.alert.style = meta.alert;
      cms.alert.text = `【${t.title}】 ${t.body}`;
      save(cms);
      renderAdminPage();
      showToast("Template pushed to Top Alert Banner!");
    } else if (action === "push-notice") {
      const t = cms.templates[idx];
      const meta = TAG_MAP[t.type] || TAG_MAP.info;
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, ".");
      cms.notices.unshift({
        id: "n" + Date.now(),
        date: today,
        tag: meta.label,
        tagClass: meta.cls,
        text: `${t.title} — ${t.body}`
      });
      save(cms);
      renderAdminPage();
      showToast("Template published to Website Notices!");
    } else if (action === "delete-tpl") {
      cms.templates.splice(idx, 1);
      save(cms);
      renderAdminPage();
      showToast("Template deleted.");
    } else if (action === "delete-notice") {
      cms.notices.splice(idx, 1);
      save(cms);
      renderAdminPage();
      showToast("Notice removed from website.");
    } else if (action === "delete-insight") {
      cms.insights.splice(idx, 1);
      save(cms);
      renderAdminPage();
      showToast("Article deleted from website.");
    }
  });

  // Save Custom Template
  document.getElementById("customTemplateForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const cms = load();
    cms.templates.unshift({
      id: "t" + Date.now(),
      title: document.getElementById("tplTitle").value.trim(),
      type: document.getElementById("tplType").value,
      body: document.getElementById("tplBody").value.trim()
    });
    save(cms);
    renderAdminPage();
    e.target.reset();
    showToast("Custom template saved to library!");
  });

  // Save Top Alert Banner
  document.getElementById("saveAlertBtn").addEventListener("click", function () {
    const cms = load();
    cms.alert.enabled = document.getElementById("admAlertEnabled").checked;
    cms.alert.style = document.getElementById("admAlertStyle").value;
    cms.alert.text = document.getElementById("admAlertText").value.trim();
    save(cms);
    renderAdminPage();
    showToast("Top Alert Banner updated live!");
  });

  // Save Hero Section
  document.getElementById("saveHeroBtn").addEventListener("click", function () {
    const cms = load();
    cms.hero.badge = document.getElementById("admHeroBadge").value.trim();
    cms.hero.title = document.getElementById("admHeroTitle").value.trim();
    cms.hero.desc = document.getElementById("admHeroDesc").value.trim();
    cms.hero.cta = document.getElementById("admHeroCta").value.trim();
    save(cms);
    renderAdminPage();
    showToast("Homepage Hero updated live!");
  });

  // Preset Interesting Info Buttons
  document.querySelectorAll(".preset-insight-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const p = INSIGHT_PRESETS[this.dataset.preset];
      if (!p) return;
      document.getElementById("insTag").value = p.tag;
      document.getElementById("insTitle").value = p.title;
      document.getElementById("insBody").value = p.body;
    });
  });

  // Publish Interesting Information
  document.getElementById("addInsightForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const cms = load();
    cms.insights.unshift({
      id: "i" + Date.now(),
      tag: document.getElementById("insTag").value.trim(),
      title: document.getElementById("insTitle").value.trim(),
      body: document.getElementById("insBody").value.trim()
    });
    save(cms);
    renderAdminPage();
    e.target.reset();
    showToast("New Interesting Info published to website!");
  });

  // Save Rates
  document.getElementById("saveRatesBtn").addEventListener("click", function () {
    const cms = load();
    cms.rates.usdJpy = document.getElementById("admUsdJpy").value.trim();
    cms.rates.eurJpy = document.getElementById("admEurJpy").value.trim();
    cms.rates.timeRate = document.getElementById("admTimeRate").value.trim();
    cms.rates.loanRate = document.getElementById("admLoanRate").value.trim();
    save(cms);
    renderAdminPage();
    showToast("Live rates updated across website!");
  });

  // Reset Defaults
  document.getElementById("resetDefaultsBtn").addEventListener("click", function () {
    reset();
    renderAdminPage();
    showToast("All website content restored to Hyakugo defaults.");
  });

  // Open specific tab if linked via URL hash (e.g. admin.html#insights)
  const hashTab = window.location.hash.replace("#", "");
  if (hashTab) {
    openAdminTab(hashTab);
  }

  renderAdminPage();
})();
