const AdminLogin = {
  isSubmitting: false,

  elements: {},

  init() {
    const form = document.getElementById("adminLoginForm");
    if (!form || this.elements.form === form) return;

    this.cacheElements();

    if (typeof AdminAuth !== "undefined") {
      AdminAuth.init();
    }

    this.bindEvents();
    this.setLoading(this.isSubmitting);

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

    const form = event.currentTarget;
    const isCurrent = () => form.isConnected && form === this.elements.form;
    if (this.isSubmitting || !isCurrent()) return;

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
      const response = await AdminAuth.login(username, password, { isCurrent });
      if (!isCurrent()) return;

      if (!response || response.success !== true) {
        throw new Error(response?.message || "Login administrator gagal.");
      }

      Toast.success(response.message || "Login berhasil.");

      this.elements.form.reset();

      await Router.navigate("admin");
    } catch (error) {
      if (!isCurrent()) return;
      this.showMessage(
        error.message || "Terjadi kesalahan saat login.",
        "error",
      );

      this.elements.password.value = "";
      this.elements.password.focus();
    } finally {
      this.isSubmitting = false;
      if (this.elements.form?.isConnected) this.setLoading(false);
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

};
