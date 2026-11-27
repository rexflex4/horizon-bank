(function () {
  const {
    STORAGE_KEY,
    load,
    save,
    getCurrentUser,
    logoutCustomer,
    escapeHtml,
    formatJPY,
    renderAlertBar,
    showToast
  } = window.HorizonStore;

  const initialUser = getCurrentUser();
  if (!initialUser) {
    window.location.replace("auth.html");
    return;
  }

  let balancesHidden = false;
  let cardDigitsRevealed = false;

  function renderDashboard() {
    const db = load();
    const user = db.customers.find((c) => c.id === initialUser.id);
    if (!user || user.status === "Suspended") {
      logoutCustomer();
      window.location.replace("auth.html");
      return;
    }

    renderAlertBar(db);

    const mask = "¥••••••••";
    const total = user.balances.checking + user.balances.savings + user.balances.vault;

    // Topbar & Account Summary
    document.getElementById("dashGreeting").textContent = `Welcome, ${user.fullName}`;
    document.getElementById("dashAccountNum").textContent = user.accountNumber;
    document.getElementById("totalPortfolioBal").textContent = balancesHidden ? mask : formatJPY(total);
    document.getElementById("balChecking").textContent = balancesHidden ? mask : formatJPY(user.balances.checking);
    document.getElementById("balSavings").textContent = balancesHidden ? mask : formatJPY(user.balances.savings);
    document.getElementById("balVault").textContent = balancesHidden ? mask : formatJPY(user.balances.vault);
    document.getElementById("dashTimeRate").textContent = db.rates.timeRate;

    // 3D Card Personalization
    const last4 = user.accountNumber.slice(-4);
    document.getElementById("dCardHolder").textContent = user.fullName.toUpperCase();
    document.getElementById("dCardNumber").textContent = cardDigitsRevealed
      ? `4892  7310  9042  ${last4}`
      : `4892  ••••  ••••  ${last4}`;

    // Savings Goal
    const goal = user.savingsGoal || { name: "Savings Goal", target: 1000000, current: 0 };
    const pct = goal.target > 0 ? Math.min(100, Math.round((goal.current / goal.target) * 100)) : 0;
    document.getElementById("goalNameOverview").textContent = goal.name;
    document.getElementById("goalProgressText").textContent = `${pct}% (${balancesHidden ? mask : formatJPY(goal.current)})`;
    document.getElementById("goalBarOverview").style.width = pct + "%";

    document.getElementById("goalCardTitle").textContent = goal.name;
    document.getElementById("goalCardNumbers").textContent = balancesHidden
      ? `${mask} / ${mask}`
      : `${formatJPY(goal.current)} saved of ${formatJPY(goal.target)} (${pct}%)`;
    document.getElementById("goalCardBar").style.width = pct + "%";
    document.getElementById("goalEditName").value = goal.name;
    document.getElementById("goalEditTarget").value = goal.target;

    // Ledger Rendering
    function txHtml(tx) {
      const pos = tx.amount > 0;
      const amtText = balancesHidden ? "¥••••" : (pos ? "+" : "") + formatJPY(tx.amount);
      return `
        <div class="notice-row" style="justify-content:space-between; align-items:center;">
          <div>
            <strong style="display:block; font-size:0.92rem;">${escapeHtml(tx.title)}</strong>
            <span style="font-size:0.78rem; color:var(--muted);">${escapeHtml(tx.meta)}</span>
          </div>
          <strong style="color:${pos ? "var(--emerald)" : "var(--navy)"};">${amtText}</strong>
        </div>
      `;
    }

    document.getElementById("recentLedgerList").innerHTML = user.ledger.slice(0, 4).map(txHtml).join("");

    const query = (document.getElementById("txSearchInput").value || "").toLowerCase();
    const filtered = user.ledger.filter(
      (tx) => tx.title.toLowerCase().includes(query) || tx.meta.toLowerCase().includes(query)
    );
    document.getElementById("fullLedgerList").innerHTML = filtered.length
      ? filtered.map(txHtml).join("")
      : `<p style="color:var(--muted);">No matching transactions found.</p>`;

    // Profile & Support Info
    document.getElementById("profAccNum").value = user.accountNumber;
    document.getElementById("profName").value = user.fullName;
    document.getElementById("profEmail").value = user.email;
    document.getElementById("profPhone").value = user.phone;
    document.getElementById("dashSupportEmail").textContent = db.contact.email;
    document.getElementById("dashSupportPhone").textContent = db.contact.phone;
  }

  // Sidebar Tabs
  document.querySelectorAll(".dash-nav-btn[data-dashtab]").forEach((btn) => {
    btn.addEventListener("click", function () {
      const tab = this.dataset.dashtab;
      document.querySelectorAll(".dash-tab").forEach((t) => t.classList.remove("active"));
      document.querySelectorAll(".dash-nav-btn[data-dashtab]").forEach((b) => b.classList.remove("active"));
      document.getElementById("dashtab-" + tab).classList.add("active");
      this.classList.add("active");
    });
  });

  // Logout
  document.getElementById("dashLogoutBtn").addEventListener("click", function () {
    logoutCustomer();
    window.location.href = "index.html";
  });

  // Privacy Toggle
  document.getElementById("dashPrivacyBtn").addEventListener("click", function () {
    balancesHidden = !balancesHidden;
    this.textContent = balancesHidden ? "👁️ Show Balances" : "👁️ Hide Balances";
    renderDashboard();
  });

  // Shared Transfer Handler
  function handleTransfer(fromKey, toKey, note, amount) {
    const db = load();
    const user = db.customers.find((c) => c.id === initialUser.id);
    if (isNaN(amount) || amount < 100) {
      showToast("Minimum transfer amount is ¥100.");
      return false;
    }
    if (user.balances[fromKey] < amount) {
      showToast("Insufficient balance in selected account.");
      return false;
    }

    user.balances[fromKey] -= amount;
    if (toKey && user.balances[toKey] !== undefined) {
      user.balances[toKey] += amount;
      user.ledger.unshift({
        title: `Internal Transfer → ${toKey.toUpperCase()}`,
        meta: `${note} • Just now`,
        amount: -amount
      });
    } else {
      user.ledger.unshift({
        title: `Transfer → ${note}`,
        meta: `From ${fromKey} • Just now`,
        amount: -amount
      });
    }

    save(db);
    renderDashboard();
    showToast(`Transferred ${formatJPY(amount)} successfully!`);
    return true;
  }

  document.getElementById("dashQuickTransferForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const from = document.getElementById("qtFromAcc").value;
    const recipient = document.getElementById("qtRecipient").value.trim();
    const amount = Number(document.getElementById("qtAmount").value);
    if (handleTransfer(from, null, recipient, amount)) e.target.reset();
  });

  document.getElementById("fullTransferForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const from = document.getElementById("ftFrom").value;
    const to = document.getElementById("ftTo").value;
    const note = document.getElementById("ftNote").value.trim();
    const amount = Number(document.getElementById("ftAmount").value);
    if (from === to) {
      showToast("Source and destination accounts must be different.");
      return;
    }
    if (handleTransfer(from, to === "external" ? null : to, note, amount)) e.target.reset();
  });

  document.getElementById("txSearchInput").addEventListener("input", renderDashboard);

  // 3D Card Controls
  const cardTilt = document.getElementById("dCardTilt");
  cardTilt.addEventListener("mousemove", function (e) {
    const r = cardTilt.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    cardTilt.style.transform = `rotateX(${-y * 22}deg) rotateY(${x * 22}deg)`;
  });
  cardTilt.addEventListener("mouseleave", function () {
    cardTilt.style.transform = "rotateX(0deg) rotateY(0deg)";
  });

  document.getElementById("dFlipBtn").addEventListener("click", function () {
    document.getElementById("dCardInner").classList.toggle("is-flipped");
  });

  document.getElementById("dRevealBtn").addEventListener("click", function () {
    cardDigitsRevealed = !cardDigitsRevealed;
    this.textContent = cardDigitsRevealed ? "🙈 Mask Digits" : "👁️ Reveal Digits";
    renderDashboard();
  });

  document.getElementById("dFreezeBtn").addEventListener("click", function () {
    const frozen = document.getElementById("dCardInner").classList.toggle("is-frozen");
    this.textContent = frozen ? "🔥 Unlock Card" : "❄️ Lock / Freeze";
    showToast(frozen ? "3D Horizon Card locked immediately" : "3D Horizon Card unlocked");
  });

  document.getElementById("cardLimitSlider").addEventListener("input", function (e) {
    document.getElementById("cardLimitValue").textContent = formatJPY(Number(e.target.value));
  });

  document.getElementById("genVirtualBtn").addEventListener("click", function () {
    const r4 = () => Math.floor(1000 + Math.random() * 9000);
    const cvv = Math.floor(100 + Math.random() * 900);
    document.getElementById("virtualCardBox").textContent = `4532  ${r4()}  ${r4()}  ${r4()}  •  CVV ${cvv}`;
    showToast("Single-use virtual card generated!");
  });

  // Savings Goals
  document.getElementById("goalTopupForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const amt = Number(document.getElementById("goalTopupAmount").value);
    const db = load();
    const user = db.customers.find((c) => c.id === initialUser.id);
    if (amt <= 0 || user.balances.checking < amt) {
      showToast("Insufficient Checking balance for this top-up.");
      return;
    }
    user.balances.checking -= amt;
    user.balances.savings += amt;
    user.savingsGoal.current += amt;
    user.ledger.unshift({
      title: `Goal Contribution → ${user.savingsGoal.name}`,
      meta: "Automated Savings • Just now",
      amount: -amt
    });
    save(db);
    renderDashboard();
    e.target.reset();
    showToast(`Added ${formatJPY(amt)} to your savings goal!`);
  });

  document.getElementById("goalUpdateForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const db = load();
    const user = db.customers.find((c) => c.id === initialUser.id);
    user.savingsGoal.name = document.getElementById("goalEditName").value.trim();
    user.savingsGoal.target = Number(document.getElementById("goalEditTarget").value);
    save(db);
    renderDashboard();
    showToast("Savings goal updated!");
  });

  // Profile Update
  document.getElementById("profileForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const db = load();
    const user = db.customers.find((c) => c.id === initialUser.id);
    user.fullName = document.getElementById("profName").value.trim();
    user.phone = document.getElementById("profPhone").value.trim();
    save(db);
    renderDashboard();
    showToast("Profile details updated!");
  });

  window.addEventListener("storage", function (e) {
    if (e.key === STORAGE_KEY) renderDashboard();
  });

  renderDashboard();
})();
