/* =========================================
   TEACHLY - LOGIN MODULE
   Public Page Controller
   Authentication menggunakan NBM
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
    this.nbmInput = document.getElementById("loginNBM");
    this.submitButton = document.getElementById("loginSubmit");
    this.messageElement = document.getElementById("loginMessage");

    if (!this.nbmInput || !this.submitButton || !this.messageElement) {
      console.error("[Login] Elemen form login tidak lengkap.");
      return;
    }

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

    this.nbmInput.addEventListener("input", () => {
      this.clearMessage();
    });
  },

  /* =====================================
     SUBMIT LOGIN
  ===================================== */

  async handleSubmit(event) {
    event.preventDefault();

    const nbm = String(this.nbmInput.value || "").trim();

    if (!nbm) {
      this.showMessage("NBM wajib diisi.");
      this.nbmInput.focus();
      return;
    }

    if (typeof Auth === "undefined" || typeof Auth.login !== "function") {
      this.showMessage("Layanan autentikasi belum tersedia.");
      return;
    }

    this.clearMessage();
    this.setLoading(true);

    try {
      const response = await Auth.login(nbm);

      if (!response || response.success !== true) {
        this.showMessage(
          response?.message || "Login gagal. Periksa kembali NBM Anda.",
        );
        return;
      }

      console.log("[Login] Login berhasil.");

      if (
        typeof Router === "undefined" ||
        typeof Router.navigate !== "function"
      ) {
        this.showMessage("Router aplikasi belum tersedia.");
        return;
      }

      await Router.navigate("dashboard");
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
      text.textContent = loading ? "Memeriksa NBM..." : "Masuk";
    }

    if (loading) {
      this.submitButton.classList.add("is-loading");
    } else {
      this.submitButton.classList.remove("is-loading");
    }
  },
};
