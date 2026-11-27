(function () {
  const {
    STORAGE_KEY,
    load,
    loginCustomer,
    escapeHtml,
    formatJPY,
    renderAlertBar,
    showToast
  } = window.HorizonStore;

  let activeAdviceFilter = "All";

  const SEGMENT_COPY = {
    personal: { title: null, desc: null },
    business: {
      title: "Business Banking That Supports You Every Step of the Way.",
      desc: "Combine Free Business Advantage Checking, Treasury Management, Remote Deposit Capture, and flexible growth loans."
    },
    wealth: {
      title: "Sensible Wealth Management Built Around Your Life Goals.",
      desc: "Financial Planning, Investment Management, IRAs, and Estate & Trust Services tailored to your timeline."
    }
  };

  function renderPublicPage() {
    const db = load();
    renderAlertBar(db);

    document.getElementById("heroBadgeDisplay").textContent = db.hero.badge;
    document.getElementById("heroTitleDisplay").textContent = db.hero.title;
    document.getElementById("heroDescDisplay").textContent = db.hero.desc;
    document.getElementById("heroCtaBtn").textContent = db.hero.cta;

    document.getElementById("liveRatesStrip").innerHTML = `
      <div class="rate-box"><span>USD / JPY Rate</span><strong>${escapeHtml(db.rates.usdJpy)}</strong><small>Global FX Ready</small></div>
      <div class="rate-box"><span>EUR / JPY Rate</span><strong>${escapeHtml(db.rates.eurJpy)}</strong><small>Zero Hidden Spread</small></div>
      <div class="rate-box"><span>1-Year Time Deposit</span><strong>${escapeHtml(db.rates.timeRate)}</strong><small>Smart Savings Yield</small></div>
      <div class="rate-box"><span>Housing Loan (Variable)</span><strong>${escapeHtml(db.rates.loanRate)}</strong><small>Competitive APR</small></div>
    `;

    // Sensible Advice Filter Pills & Grid
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

    document.getElementById("publicInsightsGrid").innerHTML = filteredInsights.length === 0
      ? `<p style="color:var(--muted);">No advice topics published yet.</p>`
      : filteredInsights.map((item) => `
          <div class="card card-3d-hover">
            <span class="tag tag-green">${escapeHtml(item.tag)}</span>
            <h3 style="margin-bottom:0.45rem;">${escapeHtml(item.title)}</h3>
            <p style="font-size:0.9rem; color:var(--slate);">${escapeHtml(item.body)}</p>
          </div>
        `).join("");

    document.getElementById("publicNoticesList").innerHTML = db.notices.length === 0
      ? `<p style="color:var(--muted);">No notices at this time.</p>`
      : db.notices.map((n) => `
          <div class="notice-row">
            <span class="notice-date">${escapeHtml(n.date)}</span>
            <span class="tag ${escapeHtml(n.tagClass)}" style="margin:0;">${escapeHtml(n.tag)}</span>
            <span style="flex:1; font-size:0.92rem;">${escapeHtml(n.text)}</span>
          </div>
        `).join("");

    document.getElementById("topBarPhone").textContent = "Support: " + db.contact.phone;
    document.getElementById("contactEmailDisplay").innerHTML =
      `<a href="mailto:${escapeHtml(db.contact.email)}" style="color:var(--crimson); text-decoration:none;">${escapeHtml(db.contact.email)}</a>`;
    document.getElementById("contactPhoneDisplay").textContent = db.contact.phone;
    document.getElementById("contactDomainDisplay").textContent = db.contact.domain;
    document.getElementById("contactAddressDisplay").textContent = db.contact.address;
    document.getElementById("footerBrandDomain").textContent = db.contact.domain;
    document.getElementById("footerBrandEmail").textContent = db.contact.email;
  }

  // Personal / Business / Wealth Hero Pills
  document.querySelectorAll(".seg-pill").forEach((btn) => {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".seg-pill").forEach((b) => b.classList.remove("active"));
      this.classList.add("active");
      const db = load();
      const copy = SEGMENT_COPY[this.dataset.segment];
      document.getElementById("heroTitleDisplay").textContent = copy.title || db.hero.title;
      document.getElementById("heroDescDisplay").textContent = copy.desc || db.hero.desc;
    });
  });

  // Advice Filter Pills
  document.getElementById("adviceFilterPills").addEventListener("click", function (e) {
    const btn = e.target.closest("button[data-advtag]");
    if (!btn) return;
    activeAdviceFilter = btn.dataset.advtag;
    renderPublicPage();
  });

  // Show/Hide Password Toggle
  const passInput = document.getElementById("heroLoginPass");
  document.getElementById("toggleHeroPassBtn").addEventListener("click", function () {
    const isHidden = passInput.type === "password";
    passInput.type = isHidden ? "text" : "password";
    this.textContent = isHidden ? "Hide" : "Show";
  });

  document.getElementById("forgotCredsLink").addEventListener("click", function (e) {
    e.preventDefault();
    const db = load();
    showToast(`Support: ${db.contact.email} • Demo: demo@horizonbank.jp / Demo1234`);
  });

  // Hero Login Form -> goes straight to dashboard.html
  document.getElementById("heroLoginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const result = loginCustomer(
      document.getElementById("heroLoginEmail").value,
      document.getElementById("heroLoginPass").value
    );
    if (!result.ok) {
      showToast(result.error);
      return;
    }
    showToast(`Welcome back, ${result.user.fullName}! Opening dashboard...`);
    setTimeout(() => { window.location.href = "dashboard.html"; }, 500);
  });

  // Route Sign Up & Login buttons straight to the 4-Step Enrollment / Login page
  document.querySelectorAll(".js-open-signup").forEach((el) => {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      window.location.href = "auth.html?mode=signup";
    });
  });

  document.querySelectorAll(".js-open-login").forEach((el) => {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      window.location.href = "auth.html";
    });
  });

  // Personal Finance Calculator
  function runCalculator() {
    const P = Math.max(0, Number(document.getElementById("calcAmount").value) || 0);
    const PMT = Math.max(0, Number(document.getElementById("calcMonthly").value) || 0);
    const r = Math.max(0, Number(document.getElementById("calcRate").value) || 0) / 100 / 12;
    const years = Math.max(1, Number(document.getElementById("calcYears").value) || 1);
    const n = years * 12;

    let fv = 0;
    if (r === 0) {
      fv = P + PMT * n;
    } else {
      const f = Math.pow(1 + r, n);
      fv = P * f + PMT * ((f - 1) / r);
    }
    const contributed = P + PMT * n;
    const growth = Math.max(0, fv - contributed);

    document.getElementById("calcResultValue").textContent = formatJPY(Math.round(fv));
    document.getElementById("calcBreakdownText").textContent =
      `Total Contributed: ${formatJPY(Math.round(contributed))} • Estimated Growth: ${formatJPY(Math.round(growth))}`;
  }

  ["calcAmount", "calcMonthly", "calcRate", "calcYears"].forEach((id) => {
    document.getElementById(id).addEventListener("input", runCalculator);
  });

  window.addEventListener("storage", function (e) {
    if (e.key === STORAGE_KEY) renderPublicPage();
  });

  renderPublicPage();
  runCalculator();
})();
