const AdminLogin = {
  initialized: false,
  isSubmitting: false,

  elements: {},

  init() {
    if (this.initialized) return;

    this.cacheElements();

    if (!this.elements.form) {
      console.warn("[AdminLogin] Form login admin tidak ditemukan.");
      return;
    }

    if (typeof AdminAuth !== "undefined") {
      AdminAuth.init();
    }

    this.bindEvents();
    this.initialized = true;

    console.log("[AdminLogin] Module initialized.");
  },

  cacheElements() {
    this.elements = {
      form: document.getElementById("adminLoginForm"),
      username: document.getElementById("adminUsername"),
      password: document.getElementById("adminPassword"),
      message: document.getElementById("adminLoginMessage"),
      submit: document.getElementById("adminLoginSubmit"),
    };
  },

  bindEvents() {
    this.elements.form.addEventListener("submit", this.handleSubmit.bind(this));
  },

  async handleSubmit(event) {
    event.preventDefault();

    if (this.isSubmitting) return;

    const username = this.elements.username.value.trim();
    const password = this.elements.password.value;

    if (!username || !password) {
      this.showMessage("Username dan password wajib diisi.", "error");
      return;
    }

    this.isSubmitting = true;
    this.setLoading(true);
    this.clearMessage();

    try {
      const response = await AdminAuth.login(username, password);

      if (!response || response.success !== true) {
        throw new Error(response?.message || "Login administrator gagal.");
      }

      this.showMessage(response.message || "Login berhasil.", "success");

      this.elements.form.reset();

      await Router.navigate("admin");
    } catch (error) {
      this.showMessage(
        error.message || "Terjadi kesalahan saat login.",
        "error",
      );

      this.elements.password.value = "";
      this.elements.password.focus();
    } finally {
      this.isSubmitting = false;
      this.setLoading(false);
    }
  },

  showMessage(message, type = "error") {
    const element = this.elements.message;

    if (!element) return;

    element.textContent = message;
    element.hidden = false;

    element.classList.remove("is-error", "is-success");

    element.classList.add(type === "success" ? "is-success" : "is-error");
  },

  clearMessage() {
    const element = this.elements.message;

    if (!element) return;

    element.textContent = "";
    element.hidden = true;

    element.classList.remove("is-error", "is-success");
  },

  setLoading(loading) {
    const button = this.elements.submit;

    if (!button) return;

    button.disabled = loading;

    const text = button.querySelector("span");

    if (text) {
      text.textContent = loading ? "Memverifikasi..." : "Masuk sebagai Admin";
    }
  },

  destroy() {
    this.initialized = false;
    this.isSubmitting = false;
    this.elements = {};
  },
};
