(function () {
  const { STORAGE_KEY, load, loginCustomer, escapeHtml, renderAlertBar, showToast } = window.HorizonStore;

  let activeAdviceFilter = "All";

  const SEGMENT_COPY = {
    personal: {
      title: null, // Uses Admin-controlled hero title
      desc: null
    },
    business: {
      title: "Business Banking That Supports You Every Step of the Way.",
      desc: "Combine modern Treasury Management, ACH & wire tools, and flexible growth loans with dedicated support to keep your company moving forward."
    },
    wealth: {
      title: "Sensible Wealth Management Built Around Your Life Goals.",
      desc: "Customized asset allocation, retirement planning, and estate guidance with transparent fees and real-time digital portfolio visibility."
    }
  };

  function renderPublicPage() {
    const db = load();

    // 1. Alert Banner
    renderAlertBar(db);

    // 2. Hero Content (respects Admin edits for default Personal segment)
    document.getElementById("heroBadgeDisplay").textContent = db.hero.badge;
    document.getElementById("heroTitleDisplay").textContent = db.hero.title;
    document.getElementById("heroDescDisplay").textContent = db.hero.desc;
    document.getElementById("heroCtaBtn").textContent = db.hero.cta;

    // 3. Rates Strip
    document.getElementById("liveRatesStrip").innerHTML = `
      <div class="rate-box">
        <span>USD / JPY Rate</span>
        <strong>${escapeHtml(db.rates.usdJpy)}</strong>
        <small>Global FX Ready</small>
      </div>
      <div class="rate-box">
        <span>EUR / JPY Rate</span>
        <strong>${escapeHtml(db.rates.eurJpy)}</strong>
        <small>Zero Hidden Spread</small>
      </div>
      <div class="rate-box">
        <span>1-Year Time Deposit</span>
        <strong>${escapeHtml(db.rates.timeRate)}</strong>
        <small>Smart Savings Yield</small>
      </div>
      <div class="rate-box">
        <span>Housing Loan (Variable)</span>
        <strong>${escapeHtml(db.rates.loanRate)}</strong>
        <small>Competitive APR</small>
      </div>
    `;

    // 4. Sensible Advice Filters & Cards
    const uniqueTags = ["All", ...new Set(db.insights.map((i) => i.tag))];
    if (!uniqueTags.includes(activeAdviceFilter)) activeAdviceFilter = "All";

    document.getElementById("adviceFilterPills").innerHTML = uniqueTags.map((tag) => `
      <button type="button" class="filter-pill ${tag === activeAdviceFilter ? "active" : ""}" data-advtag="${escapeHtml(tag)}">
        ${escapeHtml(tag)}
      </button>
    `).join("");

    const filteredInsights = activeAdviceFilter === "All"
      ? db.insights
      : db.insights.filter((i) => i.tag === activeAdviceFilter);

    const insightsEl = document.getElementById("publicInsightsGrid");
    insightsEl.innerHTML = filteredInsights.length === 0
      ? `<p style="color:var(--muted);">No advice topics published yet.</p>`
      : filteredInsights.map((item) => `
          <div class="card card-3d-hover">
            <span class="tag tag-blue">${escapeHtml(item.tag)}</span>
            <h3 style="margin-bottom:0.45rem;">${escapeHtml(item.title)}</h3>
            <p style="font-size:0.9rem; color:var(--slate);">${escapeHtml(item.body)}</p>
          </div>
        `).join("");

    // 5. Important Notices
    const noticesEl = document.getElementById("publicNoticesList");
    noticesEl.innerHTML = db.notices.length === 0
      ? `<p style="color:var(--muted);">No notices at this time.</p>`
      : db.notices.map((n) => `
          <div class="notice-row">
            <span class="notice-date">${escapeHtml(n.date)}</span>
            <span class="tag ${escapeHtml(n.tagClass)}" style="margin:0;">${escapeHtml(n.tag)}</span>
            <span style="flex:1; font-size:0.92rem;">${escapeHtml(n.text)}</span>
          </div>
        `).join("");

    // 6. Contact & Utility Info
    document.getElementById("topBarPhone").textContent = "Support: " + db.contact.phone;
    document.getElementById("contactEmailDisplay").innerHTML =
      `<a href="mailto:${escapeHtml(db.contact.email)}" style="color:var(--crimson); text-decoration:none;">${escapeHtml(db.contact.email)}</a>`;
    document.getElementById("contactPhoneDisplay").textContent = db.contact.phone;
    document.getElementById("contactDomainDisplay").textContent = db.contact.domain;
    document.getElementById("contactAddressDisplay").textContent = db.contact.address;
    document.getElementById("footerBrandDomain").textContent = db.contact.domain;
    document.getElementById("footerBrandEmail").textContent = db.contact.email;
  }

  // Personal / Business / Wealth Hero Segment Switcher
  document.querySelectorAll(".seg-pill").forEach((btn) => {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".seg-pill").forEach((b) => b.classList.remove("active"));
      this.classList.add("active");
      const seg = this.dataset.segment;
      const db = load();
      const copy = SEGMENT_COPY[seg];
      document.getElementById("heroTitleDisplay").textContent = copy.title || db.hero.title;
      document.getElementById("heroDescDisplay").textContent = copy.desc || db.hero.desc;
    });
  });

  // Advice Filter Clicks
  document.getElementById("adviceFilterPills").addEventListener("click", function (e) {
    const btn = e.target.closest("button[data-advtag]");
    if (!btn) return;
    activeAdviceFilter = btn.dataset.advtag;
    renderPublicPage();
  });

  // Show / Hide Password Toggle in Login Box
  const passInput = document.getElementById("heroLoginPass");
  const togglePassBtn = document.getElementById("toggleHeroPassBtn");
  togglePassBtn.addEventListener("click", function () {
    const isHidden = passInput.type === "password";
    passInput.type = isHidden ? "text" : "password";
    this.textContent = isHidden ? "Hide" : "Show";
  });

  // Forgot Username / Password Helper
  document.getElementById("forgotCredsLink").addEventListener("click", function (e) {
    e.preventDefault();
    const db = load();
    showToast(`Contact support at ${db.contact.email} or use Demo: demo@horizonbank.jp / Demo1234`);
  });

  // Hero Login Form -> dashboard.html
  document.getElementById("heroLoginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const email = document.getElementById("heroLoginEmail").value;
    const pass = document.getElementById("heroLoginPass").value;
    const result = loginCustomer(email, pass);

    if (!result.ok) {
      showToast(result.error);
      return;
    }

    showToast(`Welcome back, ${result.user.fullName}! Opening dashboard...`);
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 550);
  });

  // Cross-tab live sync with Admin Panel
  window.addEventListener("storage", function (e) {
    if (e.key === STORAGE_KEY) {
      renderPublicPage();
    }
  });

  renderPublicPage();
})();
