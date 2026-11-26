/* =========================================
   TOAST ENGINE
========================================= */

const Toast = {
  container: null,

  /* =====================================
     INIT
  ===================================== */

  init() {
    if (this.container?.isConnected) return;

    const container = document.createElement("div");

    container.id = "toastContainer";

    container.className = "toast-container";

    document.body.appendChild(container);

    this.container = container;
  },

  /* =====================================
     SHOW
  ===================================== */

  show({ type = "info", title = "", message = "", duration = 3000 }) {
    this.init();

    const icons = {
      success: "check-circle-2",

      error: "circle-x",

      warning: "triangle-alert",

      info: "info",
    };

    const toast = document.createElement("div");

    const variant = Object.hasOwn(icons, type) ? type : "info";
    toast.className = `toast toast-${variant}`;
    toast.setAttribute("role", variant === "error" ? "alert" : "status");

    toast.innerHTML = `

        <div class="toast-icon">

            <i data-lucide="${icons[variant]}" aria-hidden="true"></i>

        </div>

        <div class="toast-content">

            <div class="toast-title">


            </div>

            <div class="toast-message">


            </div>

            <div
                class="toast-progress">

            </div>

        </div>

        <button type="button" class="toast-close" aria-label="Tutup notifikasi">

            <i data-lucide="x"></i>

        </button>

    `;

    toast.querySelector(".toast-title").textContent = title;
    toast.querySelector(".toast-message").textContent = message;
    toast.querySelector(".toast-progress").style.animationDuration = `${duration}ms`;
    this.container.appendChild(toast);

    window.lucide?.createIcons();

    toast.querySelector(".toast-close").addEventListener("click", () => {
      this.remove(toast);
    });

    setTimeout(() => {
      this.remove(toast);
    }, duration);
  },

  /* =====================================
     REMOVE
  ===================================== */

  remove(toast) {
    if (!toast?.isConnected || toast.classList.contains("toast-hide")) return;

    toast.classList.add("toast-hide");

    setTimeout(() => toast.remove(), 250);
  },

  /* =====================================
     HELPERS
  ===================================== */

  success(message, duration = 3000) {
    this.show({
      type: "success",

      title: "Berhasil",

      message,

      duration,
    });
  },

  error(message, duration = 3000) {
    this.show({
      type: "error",

      title: "Gagal",

      message,

      duration,
    });
  },

  warning(message, duration = 3000) {
    this.show({
      type: "warning",

      title: "Peringatan",

      message,

      duration,
    });
  },

  info(message, duration = 3000) {
    this.show({
      type: "info",

      title: "Informasi",

      message,

      duration,
    });
  },
};
