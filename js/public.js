(function () {
  const { load, escapeHtml, renderAlertBar, showToast } = window.HyakugoStore;

  function renderPublicPage() {
    const cms = load();

    // 1. Top Alert Banner
    renderAlertBar(cms);

    // 2. Hero Content
    document.getElementById("heroBadgeDisplay").textContent = cms.hero.badge;
    document.getElementById("heroTitleDisplay").textContent = cms.hero.title;
    document.getElementById("heroDescDisplay").textContent = cms.hero.desc;
    document.getElementById("heroCtaBtn").textContent = cms.hero.cta;

    // 3. Market & Interest Rates Strip
    document.getElementById("liveRatesStrip").innerHTML = `
      <div class="rate-box">
        <span>USD / JPY TTM</span>
        <strong>${escapeHtml(cms.rates.usdJpy)}</strong>
        <small>Live Desk Rate</small>
      </div>
      <div class="rate-box">
        <span>EUR / JPY TTM</span>
        <strong>${escapeHtml(cms.rates.eurJpy)}</strong>
        <small>Foreign Savings Ready</small>
      </div>
      <div class="rate-box">
        <span>1-Year Time Deposit</span>
        <strong>${escapeHtml(cms.rates.timeRate)}</strong>
        <small>Preferential Online</small>
      </div>
      <div class="rate-box">
        <span>Housing Loan (Variable)</span>
        <strong>${escapeHtml(cms.rates.loanRate)}</strong>
        <small>Annual Rate</small>
      </div>
    `;

    // 4. Interesting Information Cards
    const insightsEl = document.getElementById("publicInsightsGrid");
    if (cms.insights.length === 0) {
      insightsEl.innerHTML = `<p style="color:var(--muted);">No articles published yet. Add some from the Admin Panel!</p>`;
    } else {
      insightsEl.innerHTML = cms.insights.map((item) => `
        <div class="card card-3d-hover">
          <span class="tag tag-blue">${escapeHtml(item.tag)}</span>
          <h3 style="margin-bottom:0.45rem;">${escapeHtml(item.title)}</h3>
          <p style="font-size:0.9rem; color:var(--slate);">${escapeHtml(item.body)}</p>
        </div>
      `).join("");
    }

    // 5. Important Notices List
    const noticesEl = document.getElementById("publicNoticesList");
    if (cms.notices.length === 0) {
      noticesEl.innerHTML = `<p style="color:var(--muted);">No notices at this time.</p>`;
    } else {
      noticesEl.innerHTML = cms.notices.map((n) => `
        <div class="notice-row">
          <span class="notice-date">${escapeHtml(n.date)}</span>
          <span class="tag ${escapeHtml(n.tagClass)}" style="margin:0;">${escapeHtml(n.tag)}</span>
          <span style="flex:1; font-size:0.92rem;">${escapeHtml(n.text)}</span>
        </div>
      `).join("");
    }
  }

  // Hero Direct Login Form -> redirect to banking.html
  const loginForm = document.getElementById("heroLoginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      showToast("Hyakugo ID Passkey verified! Opening Hyakugo Direct...");
      setTimeout(() => {
        window.location.href = "banking.html";
      }, 650);
    });
  }

  // Live cross-tab sync when Admin Panel updates localStorage
  window.addEventListener("storage", function (e) {
    if (e.key === "hyakugo_bank_cms_v1") {
      renderPublicPage();
    }
  });

  renderPublicPage();
})();
