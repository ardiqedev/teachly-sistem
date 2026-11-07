/* =========================================
   TEACHLY - APP INIT
========================================= */

const App = {
  initialized: false,

  /* =====================================
     INITIALIZE
  ===================================== */

  async init() {
    if (this.initialized) return;

    try {
      if (typeof CONFIG !== "undefined" && CONFIG.DEBUG) {
        console.log(`${CONFIG.APP_NAME} v${CONFIG.VERSION}`);
      }

      // 1. Inisialisasi State terlebih dahulu
      if (typeof State !== "undefined") {
        State.init();
      }

      // 2. Pulihkan session pengguna
      if (typeof Auth !== "undefined") {
        Auth.init();
      }

      // 3. Inisialisasi Modal Engine
      if (typeof Modal !== "undefined") {
        await Modal.init();
        console.log("[Teachly] Modal Engine initialized.");
      }

      // 4. Aktifkan navigasi halaman
      this.bindNavigation();

      // 5. Dengarkan halaman yang selesai dimuat
      document.addEventListener("teachly:page-loaded", (event) => {
        console.log("[Teachly] Halaman aktif:", event.detail?.page);

        if (window.lucide) {
          window.lucide.createIcons();
        }
      });

      // 6. Buka halaman awal
      Router.navigate("login");

      this.initialized = true;

      console.log("[Teachly] Application initialized.");
    } catch (error) {
      console.error("[Teachly] Application initialization failed:", error);
    }
  },

  /* =====================================
     NAVIGATION EVENTS
  ===================================== */

  bindNavigation() {
    document.addEventListener("click", (event) => {
      const target = event.target.closest("[data-page]");

      if (!target) return;

      const page = target.dataset.page;

      if (!page || typeof Router === "undefined") {
        return;
      }

      event.preventDefault();

      Router.navigate(page);
    });
  },
};

/* =========================================
   DOM READY
========================================= */

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => App.init(), {
    once: true,
  });
} else {
  App.init();
}
