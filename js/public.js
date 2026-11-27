(function () {
  const { STORAGE_KEY, load, loginCustomer, escapeHtml, renderAlertBar, showToast } = window.HorizonStore;

  function renderPublicPage() {
    const db = load();

    // 1. Alert Banner
    renderAlertBar(db);

    // 2. Hero Content
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
        <small>High-Yield Savings</small>
      </div>
      <div class="rate-box">
        <span>Housing Loan (Variable)</span>
        <strong>${escapeHtml(db.rates.loanRate)}</strong>
        <small>Annual Rate</small>
      </div>
    `;

    // 4. Interesting Information Cards
    const insightsEl = document.getElementById("publicInsightsGrid");
    if (db.insights.length === 0) {
      insightsEl.innerHTML = `<p style="color:var(--muted);">No insights published yet.</p>`;
    } else {
      insightsEl.innerHTML = db.insights.map((item) => `
        <div class="card card-3d-hover">
          <span class="tag tag-blue">${escapeHtml(item.tag)}</span>
          <h3 style="margin-bottom:0.45rem;">${escapeHtml(item.title)}</h3>
          <p style="font-size:0.9rem; color:var(--slate);">${escapeHtml(item.body)}</p>
        </div>
      `).join("");
    }

    // 5. Important Notices
    const noticesEl = document.getElementById("publicNoticesList");
    if (db.notices.length === 0) {
      noticesEl.innerHTML = `<p style="color:var(--muted);">No notices at this time.</p>`;
    } else {
      noticesEl.innerHTML = db.notices.map((n) => `
        <div class="notice-row">
          <span class="notice-date">${escapeHtml(n.date)}</span>
          <span class="tag ${escapeHtml(n.tagClass)}" style="margin:0;">${escapeHtml(n.tag)}</span>
          <span style="flex:1; font-size:0.92rem;">${escapeHtml(n.text)}</span>
        </div>
      `).join("");
    }

    // 6. Contact Info & Footer
    document.getElementById("contactEmailDisplay").innerHTML =
      `<a href="mailto:${escapeHtml(db.contact.email)}" style="color:var(--crimson); text-decoration:none;">${escapeHtml(db.contact.email)}</a>`;
    document.getElementById("contactPhoneDisplay").textContent = db.contact.phone;
    document.getElementById("contactDomainDisplay").textContent = db.contact.domain;
    document.getElementById("contactAddressDisplay").textContent = db.contact.address;
    document.getElementById("footerBrandDomain").textContent = db.contact.domain;
    document.getElementById("footerBrandEmail").textContent = db.contact.email;
  }

  // Hero Login Form -> authenticates customer and sends to dashboard.html
  const heroLoginForm = document.getElementById("heroLoginForm");
  if (heroLoginForm) {
    heroLoginForm.addEventListener("submit", function (e) {
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
  }

  // Live sync if Admin edits site in another browser tab
  window.addEventListener("storage", function (e) {
    if (e.key === STORAGE_KEY) {
      renderPublicPage();
    }
  });

  renderPublicPage();
})();
