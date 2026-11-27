(function () {
  const { load, save, escapeHtml, formatJPY, renderAlertBar, showToast } = window.HyakugoStore;

  let balancesHidden = false;
  let digitsRevealed = false;

  function renderBankingPage() {
    const cms = load();
    renderAlertBar(cms);

    // Balances
    const mask = "¥••••••••";
    document.getElementById("balOrdinary").textContent = balancesHidden ? mask : formatJPY(cms.banking.ordinary);
    document.getElementById("balTime").textContent = balancesHidden ? mask : formatJPY(cms.banking.time);
    document.getElementById("balNisa").textContent = balancesHidden ? mask : formatJPY(cms.banking.nisa);
    document.getElementById("portalTimeRate").textContent = cms.rates.timeRate;

    // Ledger
    const query = (document.getElementById("ledgerSearch").value || "").toLowerCase();
    const filtered = cms.banking.ledger.filter((tx) => {
      return tx.title.toLowerCase().includes(query) || tx.meta.toLowerCase().includes(query);
    });

    const ledgerEl = document.getElementById("jpyLedgerList");
    if (filtered.length === 0) {
      ledgerEl.innerHTML = `<p style="color:var(--muted); padding:1rem 0;">No matching transactions found.</p>`;
    } else {
      ledgerEl.innerHTML = filtered.map((tx) => {
        const isPos = tx.amount > 0;
        const amtText = balancesHidden ? "¥••••" : (isPos ? "+" : "") + formatJPY(tx.amount);
        return `
          <div class="notice-row" style="justify-content:space-between; align-items:center;">
            <div>
              <strong style="display:block; font-size:0.92rem;">${escapeHtml(tx.title)}</strong>
              <span style="font-size:0.78rem; color:var(--muted);">${escapeHtml(tx.meta)}</span>
            </div>
            <strong style="color:${isPos ? "var(--emerald)" : "var(--navy)"};">
              ${amtText}
            </strong>
          </div>
        `;
      }).join("");
    }
  }

  // Privacy Toggle
  document.getElementById("privacyToggleBtn").addEventListener("click", function () {
    balancesHidden = !balancesHidden;
    this.textContent = balancesHidden ? "👁️ Show Balances" : "👁️ Hide Balances";
    renderBankingPage();
  });

  // Ledger Search
  document.getElementById("ledgerSearch").addEventListener("input", renderBankingPage);

  // 3D Card Mouse Tilt
  const cardTilt = document.getElementById("hCardTilt");
  cardTilt.addEventListener("mousemove", function (e) {
    const r = cardTilt.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    cardTilt.style.transform = `rotateX(${-y * 22}deg) rotateY(${x * 22}deg)`;
  });
  cardTilt.addEventListener("mouseleave", function () {
    cardTilt.style.transform = "rotateX(0deg) rotateY(0deg)";
  });

  // Flip 3D Card
  document.getElementById("hFlipBtn").addEventListener("click", function () {
    document.getElementById("hCardInner").classList.toggle("is-flipped");
  });

  // Reveal Card Digits
  document.getElementById("hRevealBtn").addEventListener("click", function () {
    digitsRevealed = !digitsRevealed;
    document.getElementById("hCardNumber").textContent = digitsRevealed
      ? "0155  001  7390  4821"
      : "0155  001  ••••  4821";
    this.textContent = digitsRevealed ? "🙈 Mask Digits" : "👁️ Reveal Digits";
  });

  // Lock / Freeze Card
  document.getElementById("hFreezeBtn").addEventListener("click", function () {
    const isFrozen = document.getElementById("hCardInner").classList.toggle("is-frozen");
    this.textContent = isFrozen ? "🔥 Unlock Card" : "❄️ Lock / Freeze";
    showToast(isFrozen ? "Hyakugo IC Card locked immediately" : "Hyakugo IC Card unlocked");
  });

  // Instant JPY Transfer
  document.getElementById("jpyTransferForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const cms = load();
    const fee = Number(document.getElementById("jpyDestBank").value);
    const recipient = document.getElementById("jpyRecipient").value.trim();
    const amount = Number(document.getElementById("jpyAmount").value);
    const totalDeduction = amount + fee;

    if (isNaN(amount) || amount < 100) {
      showToast("Minimum transfer amount is ¥100.");
      return;
    }
    if (totalDeduction > cms.banking.ordinary) {
      showToast("Insufficient funds in Ordinary Deposit account.");
      return;
    }

    cms.banking.ordinary -= totalDeduction;
    cms.banking.ledger.unshift({
      title: `Transfer → ${recipient}`,
      meta: `Hyakugo Direct (Fee ¥${fee}) • Just now`,
      amount: -totalDeduction
    });

    save(cms);
    renderBankingPage();
    e.target.reset();
    showToast(`Transferred ${formatJPY(amount)} (Fee: ¥${fee})`);
  });

  // Cross-tab live sync
  window.addEventListener("storage", function (e) {
    if (e.key === "hyakugo_bank_cms_v1") {
      renderBankingPage();
    }
  });

  renderBankingPage();
})();
