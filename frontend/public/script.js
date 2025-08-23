/* ===== Navbar scroll effect ===== */
const navbar = document.getElementById("navbar");
window.addEventListener("scroll", () => {
  if (window.scrollY > 80) navbar.classList.add("scrolled");
  else navbar.classList.remove("scrolled");
});

/* ===== Toast Function ===== */
function showToast(message, duration = 2000) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), duration);
}

/* ===== Tier Modal Logic ===== */
const tierModal = document.getElementById("tierModal");
const closeModalBtn = document.getElementById("closeModal");

function openTierModal() {
  tierModal.style.display = "flex";
  tierModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}
function closeTierModal() {
  tierModal.style.display = "none";
  tierModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

document.querySelectorAll(".tier-locked").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    openTierModal();
  });
});
closeModalBtn.addEventListener("click", closeTierModal);
tierModal.addEventListener("click", (e) => {
  if (e.target === tierModal) closeTierModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (tierModal.style.display === "flex") closeTierModal();
    if (authModal.style.display === "flex") closeAuthModal();
    if (guestModal.style.display === "flex") closeGuest();
  }
});

/* ===== Auth Modal Logic ===== */
const authModal = document.getElementById("authModal");
const loginLink = document.getElementById("loginLink");
const closeAuth = document.getElementById("closeAuth");
const switchAuth = document.getElementById("switchAuth");
const toggleAuthText = document.getElementById("toggleAuthText");
const authTitle = document.getElementById("authTitle");
const authForm = document.getElementById("authForm");
const authSubmit = document.getElementById("authSubmit");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const logoutBtn = document.getElementById("logoutBtn");

let isLogin = true;

function openAuthModal() {
  authModal.style.display = "flex";
  authModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}
function clearAuthErrors() {
  emailError.textContent = "";
  passwordError.textContent = "";
}
function closeAuthModal() {
  authModal.style.display = "none";
  authModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  clearAuthErrors();
}
authModal.addEventListener("click", (e) => {
  if (e.target === authModal) closeAuthModal();
});
closeAuth.addEventListener("click", closeAuthModal);

function updateAuthUI() {
  const user = localStorage.getItem("loggedInUser");
  const trackPaymentsBtn = document.getElementById("trackPaymentsBtn");

  if (user) {
    // Show logout button and track payments link, hide login link
    logoutBtn.style.display = "inline-flex";
    if (trackPaymentsBtn) trackPaymentsBtn.style.display = "inline-flex";
    loginLink.style.display = "none";
  } else {
    // Show login link, hide logout button and track payments link
    logoutBtn.style.display = "none";
    loginLink.style.display = "inline-flex";
    if (trackPaymentsBtn) trackPaymentsBtn.style.display = "none";
  }
}
updateAuthUI();

loginLink.addEventListener("click", (e) => {
  e.preventDefault();
  openAuthModal();
});

logoutBtn.addEventListener("click", (e) => {
  e.preventDefault();
  localStorage.removeItem("loggedInUser");
  localStorage.removeItem("jwtToken");
  updateAuthUI();
  showToast("Logged out");
});

switchAuth.addEventListener("click", (e) => {
  e.preventDefault();
  isLogin = !isLogin;
  authTitle.textContent = isLogin ? "Login" : "Register";
  authSubmit.textContent = isLogin ? "Login" : "Register";
  toggleAuthText.firstChild.textContent = isLogin
    ? "Don't have an account? "
    : "Already have an account? ";
  switchAuth.textContent = isLogin ? "Register" : "Login";
});

// Clear errors on input
emailInput.addEventListener("input", () => (emailError.textContent = ""));
passwordInput.addEventListener("input", () => (passwordError.textContent = ""));

authForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearAuthErrors();

  const email = emailInput.value.trim();
  const password = passwordInput.value;
  if (!email || !password) return;

  try {
    const res = await fetch("https://invoice-generator-backend-jg51.onrender.com/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, isLogin }),
    });

    const data = await res.json();

    if (!res.ok) {
      if (data.field === "email") {
        emailError.textContent = data.message;
      } else if (data.field === "password") {
        passwordError.textContent = data.message;
      } else {
        passwordError.textContent = data.message;
      }
      return;
    }

    localStorage.setItem("jwtToken", data.token);
    localStorage.setItem("loggedInUser", data.user.email);
    updateAuthUI();
    closeAuthModal();
    authForm.reset();
    showToast(isLogin ? "Login successful" : "Registered successfully");
  } catch (err) {
    passwordError.textContent = "Server error. Please try again.";
  }
});

/* ===== Guest Modal Logic ===== */
const guestModal = document.getElementById("guestModal");
const closeGuestModal = document.getElementById("closeGuestModal");
const guestLoginBtn = document.getElementById("guestLoginBtn");
const guestContinueBtn = document.getElementById("guestContinueBtn");

let guestRedirectUrl = null;

function openGuestModal(redirectUrl) {
  guestRedirectUrl = redirectUrl;
  guestModal.style.display = "flex";
  guestModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}
function closeGuest() {
  guestModal.style.display = "none";
  guestModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

closeGuestModal.addEventListener("click", closeGuest);
guestModal.addEventListener("click", (e) => {
  if (e.target === guestModal) closeGuest();
});

guestLoginBtn.addEventListener("click", () => {
  closeGuest();
  openAuthModal();
});

guestContinueBtn.addEventListener("click", () => {
  closeGuest();
  localStorage.removeItem("jwtToken");
  localStorage.removeItem("loggedInUser");
  if (guestRedirectUrl) window.location.href = guestRedirectUrl + "?guest=true";
});

/* ===== Unified Redirect Handler ===== */
function handleRedirect(targetUrl) {
  const user = localStorage.getItem("loggedInUser");
  const token = localStorage.getItem("jwtToken");

  if (user && token) {
    window.location.href = `${targetUrl}?token=${encodeURIComponent(
      token
    )}&email=${encodeURIComponent(user)}`;
  } else {
    openGuestModal(targetUrl);
  }
}

/* ===== Intercept Get Started / Starter buttons ===== */
document
  .querySelectorAll(".cta-btn, .pricing-card:first-child .btn")
  .forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const redirectURL = btn.getAttribute("href") || "https://invoice-generator-akmal-ahmad.netlify.app/";
      handleRedirect(redirectURL);
    });
  });

/* ===== Track Payments Button ===== */
const trackPaymentsBtn = document.getElementById("trackPaymentsBtn");
if (trackPaymentsBtn) {
  trackPaymentsBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const redirectURL =
      trackPaymentsBtn.getAttribute("href") ||
      "https://invoice-generator-akmal-ahmad.netlify.app/payments.html";
    handleRedirect(redirectURL);
  });
}

const hamburgerBtn = document.querySelector(".hamburger-menu");
const navMenu = document.querySelector("nav");

hamburgerBtn.addEventListener("click", () => {
    navMenu.classList.toggle("open");
    const isExpanded = hamburgerBtn.getAttribute('aria-expanded') === 'true';
    hamburgerBtn.setAttribute('aria-expanded', !isExpanded);
});