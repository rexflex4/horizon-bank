(function () {
  const {
    load,
    registerCustomer,
    loginCustomer,
    getCurrentUser,
    escapeHtml,
    renderAlertBar,
    showToast
  } = window.HorizonStore;

  const db = load();
  renderAlertBar(db);

  // Footer contact details
  document.getElementById("authFooterDomain").textContent = db.contact.domain;
  document.getElementById("authFooterEmail").textContent = db.contact.email;

  // Check if customer already has an active session
  const existingUser = getCurrentUser();
  if (existingUser) {
    document.getElementById("alreadySignedInBox").style.display = "block";
    document.getElementById("alreadyUserText").innerHTML =
      `Signed in as ${escapeHtml(existingUser.fullName)} (${escapeHtml(existingUser.email)})`;
  }

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

  // Auto-open Sign Up tab if ?mode=signup is in URL
  const params = new URLSearchParams(window.location.search);
  if (params.get("mode") === "signup") {
    switchAuthMode("signup");
  }

  // Fill demo customer credentials
  document.getElementById("fillDemoBtn").addEventListener("click", function () {
    document.getElementById("loginEmail").value = "demo@horizonbank.jp";
    document.getElementById("loginPassword").value = "Demo1234";
    showToast("Demo credentials filled! Click Log In.");
  });

  // Handle Login
  document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const errEl = document.getElementById("loginError");
    errEl.style.display = "none";

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    const res = loginCustomer(email, password);

    if (!res.ok) {
      errEl.textContent = res.error;
      errEl.style.display = "block";
      return;
    }

    showToast(`Welcome back, ${res.user.fullName}!`);
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 550);
  });

  // Handle Sign Up
  document.getElementById("signupForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const errEl = document.getElementById("signupError");
    errEl.style.display = "none";

    const fullName = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const phone = document.getElementById("regPhone").value.trim();
    const password = document.getElementById("regPassword").value;
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

    const res = registerCustomer({ fullName, email, phone, password });
    if (!res.ok) {
      errEl.textContent = res.error;
      errEl.style.display = "block";
      return;
    }

    showToast("Account created! Opening your Crimson Horizon Dashboard...");
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 700);
  });
})();
