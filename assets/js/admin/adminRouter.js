/* =========================================
   TEACHLY - ADMIN ROUTER
========================================= */

const AdminRouter = {
  currentPage: "dashboard",
  initialized: false,
  dashboardMarkup: "",

  /* =====================================
   ROLE BASED PAGE ACCESS
===================================== */

  rolePages: {
    ADMIN: [
      "dashboard",
      "guru",
      "kelas",
      "mata-pelajaran",
      "kelompok-ngaji",
      "sesi-ngaji",
      "tahun-ajaran",
      "laporan",
      "pengguna",
      "informasi-sekolah",
    ],

    ADMIN_KURIKULUM: [
      "guru",
      "kelas",
      "mata-pelajaran",
      "tahun-ajaran",
      "laporan",
      "informasi-sekolah",
    ],

    ADMIN_GURU_NGAJI: [
      "kelompok-ngaji",
      "sesi-ngaji",
      "laporan",
      "informasi-sekolah",
    ],
  },

  getRole() {
    return AdminAuth.getRole();
  },

  canAccess(page) {
    const role = this.getRole();
    const allowed = this.rolePages[role] || [];

    return allowed.includes(page);
  },

  getDefaultPage() {
    const role = this.getRole();

    switch (role) {
      case "ADMIN":
        return "dashboard";

      case "ADMIN_KURIKULUM":
        return "guru";

      case "ADMIN_GURU_NGAJI":
        return "kelompok-ngaji";

      default:
        return null;
    }
  },

  applySidebarPermissions() {
    const sidebar = document.getElementById("adminSidebar");

    if (!sidebar) return;

    // Filter hanya menu di sidebar.
    sidebar.querySelectorAll("[data-admin-page]").forEach((item) => {
      const page = item.dataset.adminPage;

      item.hidden = !this.canAccess(page);
    });

    // Sembunyikan grup jika seluruh
    // menu di dalamnya tidak diizinkan.
    sidebar.querySelectorAll(".admin-nav-group").forEach((group) => {
      const items = Array.from(group.querySelectorAll("[data-admin-page]"));

      group.hidden = !items.some((item) =>
        this.canAccess(item.dataset.adminPage),
      );
    });
  },

  pages: {
    dashboard: {
      title: "Dashboard",
      description: "Ringkasan sistem manajemen sekolah.",
    },
    guru: {
      title: "Data Guru",
      description: "Kelola data dan informasi guru.",
    },
    kelas: {
      title: "Data Kelas",
      description: "Kelola data kelas sekolah.",
    },
    "mata-pelajaran": {
      title: "Mata Pelajaran",
      description: "Kelola daftar mata pelajaran.",
    },
    "kelompok-ngaji": {
      title: "Kelompok Ngaji",
      description: "Kelola kelompok kegiatan ngaji.",
    },
    "sesi-ngaji": {
      title: "Sesi Ngaji",
      description: "Kelola sesi kegiatan ngaji.",
    },
    "tahun-ajaran": {
      title: "Tahun Ajaran",
      description: "Kelola periode tahun ajaran sekolah.",
    },
    laporan: {
      title: "Laporan Guru",
      description: "Kelola dan pantau laporan harian guru.",
    },
    pengguna: {
      title: "Pengguna Admin",
      description: "Kelola akun dan hak akses administrator.",
    },

    "informasi-sekolah": {
      title: "Informasi Sekolah",
      description: "Kelola informasi Kurikulum dan Guru Ngaji.",
    },
  },

  /* =====================================
     INITIALIZE
  ===================================== */

  init() {
    const content = document.getElementById("adminContent");

    if (!content) return;

    if (!this.initialized) {
      this.dashboardMarkup = content.innerHTML;
      this.bindEvents();
      this.initialized = true;
    }

    this.applySidebarPermissions();

    const defaultPage = this.getDefaultPage();

    if (!defaultPage) {
      console.error("[AdminRouter] Role administrator tidak valid.");
      return;
    }

    this.navigate(defaultPage);

    const year = document.getElementById("adminCurrentYear");
    if (year) year.textContent = new Date().getFullYear();
  },

  /* =====================================
     EVENTS
  ===================================== */

  bindEvents() {
    document.addEventListener("click", async (event) => {
      /* =====================================
       ADMIN LOGOUT
    ===================================== */

      const logoutButton = event.target.closest("[data-admin-logout]");

      if (logoutButton) {
        event.preventDefault();

        if (logoutButton.disabled) return;

        const confirmed = window.confirm(
          "Yakin ingin keluar dari administrator?",
        );

        if (!confirmed) return;

        logoutButton.disabled = true;

        try {
          await AdminAuth.logout();

          this.closeSidebar();

          // Muat ulang untuk menampilkan login Admin.
          window.location.reload();
        } catch (error) {
          console.error("[AdminRouter] Logout failed:", error);

          logoutButton.disabled = false;
        }

        return;
      }

      /* =====================================
       ADMIN PAGE NAVIGATION
    ===================================== */

      const pageButton = event.target.closest("[data-admin-page]");

      if (pageButton) {
        event.preventDefault();

        const page = pageButton.dataset.adminPage;

        // Kategori laporan langsung dari kartu Dashboard
        const reportTab =
          page === "laporan" ? pageButton.dataset.reportTab || null : null;

        this.navigate(page, reportTab);

        this.closeSidebar();
        return;
      }

      /* =====================================
       SIDEBAR TOGGLE
    ===================================== */

      if (event.target.closest("[data-admin-sidebar-toggle]")) {
        this.toggleSidebar();
        return;
      }

      /* =====================================
       SIDEBAR CLOSE
    ===================================== */

      if (event.target.closest("[data-admin-sidebar-close]")) {
        this.closeSidebar();
      }
    });
  },

  /* =====================================
     NAVIGATE
  ===================================== */

  navigate(page, reportTab = null) {
    if (!this.pages[page]) return;

    // Tolak navigasi yang tidak diizinkan.
    if (!this.canAccess(page)) {
      console.warn("[AdminRouter] Akses halaman ditolak:", page);
      return;
    }

    const content = document.getElementById("adminContent");
    const title = document.getElementById("adminPageTitle");

    if (!content) return;

    this.currentPage = page;
    if (page === "dashboard") {
      content.innerHTML = this.dashboardMarkup;

      if (typeof AdminDashboard !== "undefined") {
        AdminDashboard.init();
      }
    } else if (page === "guru" && typeof Guru !== "undefined") {
      content.innerHTML = Guru.render();
      Guru.init();
    } else if (page === "kelas" && typeof Kelas !== "undefined") {
      content.innerHTML = Kelas.render();
      Kelas.init();
    } else if (page === "mata-pelajaran" && typeof Mapel !== "undefined") {
      content.innerHTML = Mapel.render();
      Mapel.init();
    } else if (page === "sesi-ngaji" && typeof Sesi !== "undefined") {
      content.innerHTML = Sesi.render();
      Sesi.init();
    } else if (page === "kelompok-ngaji" && typeof Kelompok !== "undefined") {
      content.innerHTML = Kelompok.render();
      Kelompok.init();
    } else if (page === "tahun-ajaran" && typeof TahunAjaran !== "undefined") {
      content.innerHTML = TahunAjaran.render();
      TahunAjaran.init();
    } else if (
      page === "informasi-sekolah" &&
      typeof InformasiSekolah !== "undefined"
    ) {
      content.innerHTML = InformasiSekolah.render();
      InformasiSekolah.init();
    } else if (page === "pengguna" && typeof Pengguna !== "undefined") {
      content.innerHTML = Pengguna.render();
      Pengguna.init();
    } else if (page === "laporan" && typeof AdminLaporan !== "undefined") {
      content.innerHTML = AdminLaporan.render();
      AdminLaporan.init(reportTab);
    } else {
      content.innerHTML = this.renderPlaceholder(page);
    }

    if (title) {
      title.textContent = this.pages[page].title;
    }

    document.querySelectorAll("[data-admin-page]").forEach((item) => {
      const active = item.dataset.adminPage === page;

      item.classList.toggle("active", active);

      if (active) {
        item.setAttribute("aria-current", "page");
      } else {
        item.removeAttribute("aria-current");
      }
    });

    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  /* =====================================
     PLACEHOLDER
  ===================================== */

  renderPlaceholder(page) {
    const data = this.pages[page];

    return `
      <section class="admin-placeholder">
        <div class="admin-placeholder-icon">
          <i data-lucide="construction"></i>
        </div>

        <span class="admin-placeholder-label">
          MODUL ADMIN
        </span>

        <h1>${data.title}</h1>

        <p>${data.description}</p>

        <div class="admin-placeholder-status">
          <i data-lucide="clock-3"></i>
          <span>Fitur sedang dalam tahap pengembangan.</span>
        </div>
      </section>
    `;
  },

  /* =====================================
     SIDEBAR
  ===================================== */

  toggleSidebar() {
    document.getElementById("adminLayout")?.classList.toggle("sidebar-open");
  },

  closeSidebar() {
    document.getElementById("adminLayout")?.classList.remove("sidebar-open");
  },
};
