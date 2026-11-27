(function () {
  const {
    load,
    save,
    registerCustomer,
    loginCustomer,
    getCurrentUser,
    escapeHtml,
    renderAlertBar,
    showToast
  } = window.HorizonStore;

  const db = load();
  renderAlertBar(db);

  document.getElementById("authFooterDomain").textContent = db.contact.domain;
  document.getElementById("authFooterEmail").textContent = db.contact.email;

  const existingUser = getCurrentUser();
  if (existingUser) {
    document.getElementById("alreadySignedInBox").style.display = "block";
    document.getElementById("alreadyUserText").innerHTML =
      `Signed in as ${escapeHtml(existingUser.fullName)} (${escapeHtml(existingUser.email)})`;
  }

  // Tab Switching (Login vs Enroll)
  const tabLoginBtn = document.getElementById("tabLoginBtn");
  const tabSignupBtn = document.getElementById("tabSignupBtn");
  const loginPanel = document.getElementById("loginPanel");
  const signupPanel = document.getElementById("signupPanel");

  function switchAuthMode(mode) {
    const isSignup = mode === "signup";
    tabLoginBtn.classList.toggle("active", !isSignup);
    tabSignupBtn.classList.toggle("active", isSignup);
    loginPanel.style.display = isSignup ? "none" : "block";
    signupPanel.style.display = isSignup ? "block" : "none";
  }

  tabLoginBtn.addEventListener("click", () => switchAuthMode("login"));
  tabSignupBtn.addEventListener("click", () => switchAuthMode("signup"));

  const params = new URLSearchParams(window.location.search);
  if (params.get("mode") === "signup") {
    switchAuthMode("signup");
  }

  // Login Password Show/Hide
  const loginPassInput = document.getElementById("loginPassword");
  document.getElementById("toggleLoginPassBtn").addEventListener("click", function () {
    const hidden = loginPassInput.type === "password";
    loginPassInput.type = hidden ? "text" : "password";
    this.textContent = hidden ? "Hide" : "Show";
  });

  document.getElementById("fillDemoBtn").addEventListener("click", function () {
    document.getElementById("loginEmail").value = "demo@horizonbank.jp";
    document.getElementById("loginPassword").value = "Demo1234";
    showToast("Demo account credentials filled!");
  });

  document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const errEl = document.getElementById("loginError");
    errEl.style.display = "none";

    const res = loginCustomer(
      document.getElementById("loginEmail").value,
      document.getElementById("loginPassword").value
    );
    if (!res.ok) {
      errEl.textContent = res.error;
      errEl.style.display = "block";
      return;
    }

    showToast(`Welcome back, ${res.user.fullName}!`);
    setTimeout(() => { window.location.href = "dashboard.html"; }, 500);
  });

  // =========================================
  // 4-STEP HORIZON ENROLLMENT WIZARD
  // =========================================
  const enrollDraft = {
    accountType: "Personal",
    plan: "Everyday Checking",
    fullName: "",
    phone: "",
    email: "",
    idLast4: "",
    generatedCode: ""
  };

  const PLANS = {
    Personal: [
      "Everyday Checking (¥0 Monthly Fee)",
      "Relationship Checking",
      "Student Checking",
      "Fresh Start Checking"
    ],
    Business: [
      "Free Business Advantage Checking",
      "Business Benefit Checking",
      "Business Analyzed Checking",
      "Public Funds / Nonprofit Checking"
    ]
  };

  function setEnrollStep(stepNum) {
    document.querySelectorAll(".enroll-step").forEach((el) => el.classList.remove("active"));
    for (let i = 1; i <= 4; i++) {
      const pill = document.getElementById("pillStep" + i);
      pill.classList.remove("active", "done");
      if (i < stepNum) pill.classList.add("done");
      if (i === stepNum) pill.classList.add("active");
    }

    if (stepNum === 1) document.getElementById("enrollStep1Form").classList.add("active");
    if (stepNum === 2) document.getElementById("enrollStep2Box").classList.add("active");
    if (stepNum === 3) document.getElementById("enrollStep3Form").classList.add("active");
    if (stepNum === 4) document.getElementById("enrollStep4Box").classList.add("active");
  }

  // Personal vs Business selector
  document.querySelectorAll(".acct-type-card").forEach((card) => {
    card.addEventListener("click", function () {
      document.querySelectorAll(".acct-type-card").forEach((c) => c.classList.remove("selected"));
      this.classList.add("selected");
      enrollDraft.accountType = this.dataset.accttype;

      const planSelect = document.getElementById("regPlan");
      planSelect.innerHTML = PLANS[enrollDraft.accountType]
        .map((p) => `<option value="${escapeHtml(p)}">${escapeHtml(p)}</option>`)
        .join("");
    });
  });

  // Step 1 Submit
  document.getElementById("enrollStep1Form").addEventListener("submit", function (e) {
    e.preventDefault();
    const errEl = document.getElementById("step1Error");
    errEl.style.display = "none";

    const email = document.getElementById("regEmail").value.trim().toLowerCase();
    const currentDb = load();
    if (currentDb.customers.some((c) => c.email.toLowerCase() === email)) {
      errEl.textContent = "This email is already enrolled. Switch to Online Banking Login.";
      errEl.style.display = "block";
      return;
    }

    enrollDraft.plan = document.getElementById("regPlan").value;
    enrollDraft.fullName = document.getElementById("regName").value.trim();
    enrollDraft.phone = document.getElementById("regPhone").value.trim();
    enrollDraft.email = email;
    enrollDraft.idLast4 = document.getElementById("regIdLast4").value.trim();

    setEnrollStep(2);
  });

  // Step 2: Send & Verify Secure Access Code
  document.getElementById("sendAccessCodeBtn").addEventListener("click", function () {
    const method = document.getElementById("codeDeliveryMethod").value;
    const code = String(Math.floor(100000 + Math.random() * 900000));
    enrollDraft.generatedCode = code;

    const target = method === "sms" ? enrollDraft.phone : enrollDraft.email;
    const banner = document.getElementById("codeDemoBanner");
    banner.style.display = "block";
    banner.innerHTML = `Secure Access Code sent to <strong>${escapeHtml(target)}</strong>.<br>Demo Verification Code: <strong style="font-size:1.05rem; letter-spacing:0.12em;">${code}</strong>`;

    document.getElementById("enrollStep2Form").style.display = "block";
    showToast("6-digit Secure Access Code generated!");
  });

  document.getElementById("backToStep1Btn").addEventListener("click", () => setEnrollStep(1));

  document.getElementById("enrollStep2Form").addEventListener("submit", function (e) {
    e.preventDefault();
    const errEl = document.getElementById("step2Error");
    errEl.style.display = "none";

    const entered = document.getElementById("accessCodeInput").value.trim();
    if (!enrollDraft.generatedCode || entered !== enrollDraft.generatedCode) {
      errEl.textContent = "Invalid Secure Access Code. Please enter the 6-digit code shown above.";
      errEl.style.display = "block";
      return;
    }

    document.getElementById("profilePreviewBox").innerHTML = `
      <div><strong>Category:</strong> ${escapeHtml(enrollDraft.accountType)} — ${escapeHtml(enrollDraft.plan)}</div>
      <div><strong>Full Name:</strong> ${escapeHtml(enrollDraft.fullName)}</div>
      <div><strong>Login ID (Email):</strong> ${escapeHtml(enrollDraft.email)}</div>
      <div><strong>Mobile Phone:</strong> ${escapeHtml(enrollDraft.phone)}</div>
    `;
    setEnrollStep(3);
  });

  // Step 3: Password Strength, Show/Hide & Finalize Registration
  const regPassInput = document.getElementById("regPassword");
  document.getElementById("toggleRegPassBtn").addEventListener("click", function () {
    const hidden = regPassInput.type === "password";
    regPassInput.type = hidden ? "text" : "password";
    this.textContent = hidden ? "Hide" : "Show";
  });

  regPassInput.addEventListener("input", function () {
    const len = this.value.length;
    const el = document.getElementById("passStrengthText");
    if (!len) el.textContent = "";
    else if (len < 6) el.textContent = "Strength: Too short (minimum 6 characters)";
    else if (len < 10) el.textContent = "Strength: Good";
    else el.textContent = "Strength: Strong";
  });

  document.getElementById("backToStep2Btn").addEventListener("click", () => setEnrollStep(2));

  document.getElementById("enrollStep3Form").addEventListener("submit", function (e) {
    e.preventDefault();
    const errEl = document.getElementById("step3Error");
    errEl.style.display = "none";

    const password = regPassInput.value;
    const confirm = document.getElementById("regConfirm").value;

    if (password.length < 6) {
      errEl.textContent = "Password must be at least 6 characters.";
      errEl.style.display = "block";
      return;
    }
    if (password !== confirm) {
      errEl.textContent = "Passwords do not match.";
      errEl.style.display = "block";
      return;
    }

    const res = registerCustomer({
      fullName: enrollDraft.fullName,
      email: enrollDraft.email,
      phone: enrollDraft.phone,
      password: password
    });

    if (!res.ok) {
      errEl.textContent = res.error;
      errEl.style.display = "block";
      return;
    }

    // Save Horizon enrollment details onto the new customer record
    const latestDb = load();
    const created = latestDb.customers.find((c) => c.id === res.user.id);
    const eStatements = document.getElementById("chkEstatements").checked;
    const deviceReg = document.getElementById("chkDevice").checked;

    if (created) {
      created.accountType = enrollDraft.accountType;
      created.planName = enrollDraft.plan;
      created.eStatements = eStatements;
      created.deviceRegistered = deviceReg;
      save(latestDb);
    }

    document.getElementById("confirmSummaryBox").innerHTML = `
      <div><strong>Confirmed Login ID:</strong> ${escapeHtml(res.user.email)}</div>
      <div><strong>Account Number:</strong> ${escapeHtml(res.user.accountNumber)}</div>
      <div><strong>Selected Plan:</strong> ${escapeHtml(enrollDraft.plan)}</div>
      <div><strong>eStatements:</strong> ${eStatements ? "Enrolled (Paperless)" : "Paper"}</div>
      <div><strong>Device Security:</strong> ${deviceReg ? "Trusted Device Registered" : "Code Required Per Login"}</div>
    `;

    setEnrollStep(4);
    showToast("Welcome to Crimson Horizon Bank!");
  });
})();
