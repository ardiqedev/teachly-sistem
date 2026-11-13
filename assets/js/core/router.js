/* =========================================
   TEACHLY - ROUTER MODULE
========================================= */

const Router = {
  /* =====================================
     ROUTES GURU
  ===================================== */
  globalActionsInitialized: false,
  routes: {
    login: "pages/login.html",
    dashboard: "pages/dashboard.html",
    riwayat: "pages/riwayat.html",
    jadwal: "pages/jadwal.html",
    admin: "pages/admin/index.html",
    "admin-login": "pages/admin/login.html",
  },

  currentPage: null,

  /* =====================================
     LOAD PAGE
  ===================================== */

  async loadPage(file) {
    try {
      const response = await fetch(file, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Halaman tidak ditemukan: ${file}`);
      }

      const markup = await response.text();

      if (!markup.trim()) {
        throw new Error(`Halaman kosong: ${file}`);
      }

      const app = document.getElementById("app");

      if (!app) {
        throw new Error("Elemen #app tidak ditemukan.");
      }

      app.innerHTML = markup;

      if (window.lucide) {
        window.lucide.createIcons();
      }

      document.dispatchEvent(
        new CustomEvent("teachly:page-loaded", {
          detail: { page: this.currentPage },
        }),
      );

      return true;
    } catch (error) {
      console.error("[Router]", error);
      this.show404();
      return false;
    }
  },

  /* =====================================
     LOAD COMPONENT
  ===================================== */

  async loadComponent(file, targetId) {
    try {
      const response = await fetch(file, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Komponen tidak ditemukan: ${file}`);
      }

      const markup = await response.text();

      if (!markup.trim()) {
        throw new Error(`Komponen kosong: ${file}`);
      }

      const target = document.getElementById(targetId);

      if (!target) {
        throw new Error(`Container #${targetId} tidak ditemukan.`);
      }

      target.innerHTML = markup;

      if (window.lucide) {
        window.lucide.createIcons();
      }

      console.log(`[Router] Komponen berhasil dimuat: ${file}`);

      return true;
    } catch (error) {
      console.error("[Router] Gagal memuat komponen:", error);
      throw error;
    }
  },

  /* =====================================
     NAVIGATE
  ===================================== */

  async navigate(page) {
    if (!this.routes[page]) {
      console.error(`[Router] Route "${page}" tidak ditemukan.`);
      return;
    }

    this.currentPage = page;

    const loaded = await this.loadPage(this.routes[page]);

    if (!loaded) return;

    this.saveCurrentPage(page);
    this.updateNavigation(page);
    this.initModule(page);
  },

  /* =====================================
   INIT PAGE MODULE
===================================== */

  initModule(page) {
    const modules = {
      login: typeof Login !== "undefined" ? Login : null,

      dashboard: typeof Dashboard !== "undefined" ? Dashboard : null,
      riwayat: typeof Riwayat !== "undefined" ? Riwayat : null,
      jadwal: typeof Jadwal !== "undefined" ? Jadwal : null,

      admin: typeof Admin !== "undefined" ? Admin : null,

      "admin-login": typeof AdminLogin !== "undefined" ? AdminLogin : null,
    };

    const module = modules[page];

    if (module && typeof module.init === "function") {
      module.init();
    } else {
      console.warn(`[Router] Module untuk halaman "${page}" tidak ditemukan.`);
    }
  },

  /* =====================================
     UPDATE NAVIGATION
  ===================================== */

  updateNavigation(page) {
    document.querySelectorAll("[data-page]").forEach((item) => {
      const active = item.dataset.page === page;

      item.classList.toggle("active", active);

      if (active) {
        item.setAttribute("aria-current", "page");
      } else {
        item.removeAttribute("aria-current");
      }
    });
  },

  /* =====================================
     SAVE CURRENT PAGE
  ===================================== */

  saveCurrentPage(page) {
    localStorage.setItem("lastPage", page);
  },

  /* =====================================
     GET LAST PAGE
  ===================================== */

  getLastPage() {
    const page = localStorage.getItem("lastPage");

    return this.routes[page] ? page : "dashboard";
  },

  /* =====================================
   GLOBAL ACTIONS
===================================== */

  initGlobalActions() {
    if (this.globalActionsInitialized) return;

    document.addEventListener("click", async (event) => {
      const logoutButton = event.target.closest('[data-action="logout"]');

      if (!logoutButton) return;

      event.preventDefault();

      if (logoutButton.disabled) return;

      const confirmed = window.confirm(
        "Apakah Anda yakin ingin keluar dari Teachly?",
      );

      if (!confirmed) return;

      logoutButton.disabled = true;

      try {
        // Hapus session autentikasi guru
        Auth.logout();

        // Kembali ke halaman login
        await this.navigate("login");

        console.log("[Router] Guru berhasil logout.");
      } catch (error) {
        console.error("[Router] Logout gagal:", error);

        alert("Terjadi kesalahan saat logout.");
      } finally {
        if (logoutButton.isConnected) {
          logoutButton.disabled = false;
        }
      }
    });

    this.globalActionsInitialized = true;

    console.log("[Router] Global actions initialized.");
  },

  /* =====================================
     SHOW 404
  ===================================== */

  show404() {
    const app = document.getElementById("app");

    if (!app) return;

    app.innerHTML = `
      <section class="app-startup app-startup--error">
        <h2>Halaman tidak ditemukan</h2>
        <p>Halaman yang diminta belum tersedia.</p>
        <button type="button" onclick="Router.navigate('dashboard')">
          Kembali ke Beranda
        </button>
      </section>
    `;
  },
};

/* =====================================
   INITIALIZE GLOBAL ACTIONS
===================================== */

Router.initGlobalActions();
