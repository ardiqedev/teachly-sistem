/* =========================================
   TEACHLY - LOGIN MODULE
   Public Page Controller
   Authentication menggunakan NBM dan password
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
    this.passwordInput = document.getElementById("loginPassword");
    this.passwordChange = document.getElementById("loginPasswordChange");
    this.newPassword = document.getElementById("loginNewPassword");
    this.confirmPassword = document.getElementById("loginConfirmPassword");
    this.cancelPasswordChange = document.getElementById("loginCancelPasswordChange");
    this.submitButton = document.getElementById("loginSubmit");
    this.messageElement = document.getElementById("loginMessage");

    if (!this.nbmInput || !this.passwordInput || !this.passwordChange || !this.newPassword ||
        !this.confirmPassword || !this.cancelPasswordChange || !this.submitButton || !this.messageElement) {
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

    this.form.addEventListener("input", () => {
      this.clearMessage();
    });
    this.cancelPasswordChange.addEventListener("click", () => {
      this.setPasswordChange(false);
      this.passwordInput.value = "";
      this.clearMessage();
      this.passwordInput.focus();
    });
  },

  setPasswordChange(required) {
    this.passwordChange.hidden = this.passwordChange.disabled = !required;
    this.nbmInput.readOnly = this.passwordInput.readOnly = required;
    if (!required) {
      this.newPassword.value = "";
      this.confirmPassword.value = "";
    }
    this.setLoading(false);
  },

  /* =====================================
     SUBMIT LOGIN
  ===================================== */

  async handleSubmit(event) {
    event.preventDefault();
    if (this.submitButton.disabled) return;
    const form = this.form;

    const nbm = String(this.nbmInput.value || "").trim();
    const password = this.passwordInput.value;
    const changing = !this.passwordChange.hidden;
    const newPassword = changing ? this.newPassword.value : undefined;

    if (!nbm) {
      this.showMessage("NBM wajib diisi.");
      this.nbmInput.focus();
      return;
    }
    if (!password) {
      this.showMessage("Password wajib diisi.");
      this.passwordInput.focus();
      return;
    }
    if (changing && newPassword !== this.confirmPassword.value) {
      this.showMessage("Ulangi password baru dengan isi yang sama.");
      this.confirmPassword.focus();
      return;
    }

    if (typeof Auth === "undefined" || typeof Auth.login !== "function") {
      this.showMessage("Layanan autentikasi belum tersedia.");
      return;
    }

    this.clearMessage();
    this.setLoading(true);

    try {
      const response = await Auth.login(nbm, password, newPassword);
      if (!form.isConnected) return;

      if (!response || response.success !== true) {
        this.showMessage(
          response?.message || "Login gagal. Periksa NBM dan password Anda.",
        );
        return;
      }

      if (response.data?.mustChangePassword) {
        this.setPasswordChange(true);
        this.newPassword.focus();
        return;
      }
      this.passwordInput.value = "";
      this.setPasswordChange(false);
      if (changing) Toast.success("Password baru berhasil disimpan.");
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
      if (form.isConnected) this.setLoading(false);
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
    this.cancelPasswordChange.disabled = loading;
    this.submitButton.setAttribute("aria-busy", String(loading));

    if (text) {
      text.textContent = loading ? "Memproses…" :
        this.passwordChange.hidden ? "Masuk" : "Simpan Password dan Masuk";
    }

    if (loading) {
      this.submitButton.classList.add("is-loading");
    } else {
      this.submitButton.classList.remove("is-loading");
    }
  },
};
