/* =========================================
   TEACHLY - LOGIN MODULE
   Public Page Controller
========================================= */

const Login = {
  initialized: false,

  /* =====================================
     INITIALIZE
  ===================================== */

  init() {
    const form = document.getElementById("loginForm");

    if (!form) {
      console.warn("[Login] Form login tidak ditemukan.");
      return;
    }

    // Hindari pemasangan event listener berulang.
    if (form.dataset.initialized === "true") return;

    this.form = form;
    this.usernameInput = document.getElementById("loginUsername");
    this.passwordInput = document.getElementById("loginPassword");
    this.submitButton = document.getElementById("loginSubmit");
    this.messageElement = document.getElementById("loginMessage");
    this.toggleButton = document.getElementById("togglePassword");

    this.bindEvents();

    form.dataset.initialized = "true";
    this.initialized = true;

    console.log("[Login] Module initialized.");
  },

  /* =====================================
     EVENTS
  ===================================== */

  bindEvents() {
    this.form.addEventListener("submit", (event) => {
      this.handleSubmit(event);
    });

    if (this.toggleButton) {
      this.toggleButton.addEventListener("click", () => {
        this.togglePassword();
      });
    }
  },

  /* =====================================
     SUBMIT LOGIN
  ===================================== */

  async handleSubmit(event) {
    event.preventDefault();

    const username = String(this.usernameInput?.value || "").trim();
    const password = String(this.passwordInput?.value || "");

    if (!username || !password) {
      this.showMessage("Username dan password wajib diisi.");
      return;
    }

    if (typeof Auth === "undefined" || typeof Auth.login !== "function") {
      this.showMessage("Layanan autentikasi belum tersedia.");
      return;
    }

    this.clearMessage();
    this.setLoading(true);

    try {
      const response = await Auth.login(username, password);

      if (!response || response.success !== true) {
        this.showMessage(
          response?.message || "Login gagal. Periksa kembali akun Anda.",
        );
        return;
      }

      console.log("[Login] Login berhasil.");

      if (typeof Router !== "undefined") {
        await Router.navigate("dashboard");
      } else {
        this.showMessage("Router aplikasi belum tersedia.");
      }
    } catch (error) {
      console.error("[Login] Error:", error);

      this.showMessage(
        error.message || "Terjadi kesalahan. Silakan coba kembali.",
      );
    } finally {
      this.setLoading(false);
    }
  },

  /* =====================================
     TOGGLE PASSWORD
  ===================================== */

  togglePassword() {
    if (!this.passwordInput || !this.toggleButton) return;

    const isPassword = this.passwordInput.type === "password";

    this.passwordInput.type = isPassword ? "text" : "password";

    this.toggleButton.setAttribute(
      "aria-label",
      isPassword ? "Sembunyikan password" : "Tampilkan password",
    );

    this.toggleButton.setAttribute("aria-pressed", String(isPassword));

    const icon = this.toggleButton.querySelector("i");

    if (icon) {
      icon.setAttribute("data-lucide", isPassword ? "eye-off" : "eye");

      if (window.lucide) {
        window.lucide.createIcons();
      }
    }
  },

  /* =====================================
     MESSAGE
  ===================================== */

  showMessage(message) {
    if (!this.messageElement) return;

    this.messageElement.textContent = message;
    this.messageElement.hidden = false;
  },

  clearMessage() {
    if (!this.messageElement) return;

    this.messageElement.textContent = "";
    this.messageElement.hidden = true;
  },

  /* =====================================
     LOADING STATE
  ===================================== */

  setLoading(loading) {
    if (!this.submitButton) return;

    const text = this.submitButton.querySelector("span");

    this.submitButton.disabled = loading;
    this.submitButton.setAttribute("aria-busy", String(loading));

    if (text) {
      text.textContent = loading ? "Memeriksa akun..." : "Masuk";
    }

    if (loading) {
      this.submitButton.classList.add("is-loading");
    } else {
      this.submitButton.classList.remove("is-loading");
    }
  },
};
