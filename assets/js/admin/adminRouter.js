/* =========================================
   TEACHLY - ADMIN ROUTER
========================================= */

const AdminRouter = {
  currentPage: "dashboard",
  initialized: false,
  dashboardMarkup: "",

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

    this.navigate("dashboard");

    const year = document.getElementById("adminCurrentYear");
    if (year) year.textContent = new Date().getFullYear();
  },

  /* =====================================
     EVENTS
  ===================================== */

  bindEvents() {
    document.addEventListener("click", (event) => {
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

      if (event.target.closest("[data-admin-sidebar-toggle]")) {
        this.toggleSidebar();
        return;
      }

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
