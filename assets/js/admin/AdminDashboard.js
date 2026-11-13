/* =========================================
   TEACHLY - ADMIN DASHBOARD
========================================= */

const AdminDashboard = {
  data: null,
  initialized: false,
  loading: false,
  reportCardsBound: false,

  /* =====================================
     INITIALIZE
  ===================================== */

  init() {
    this.initialized = true;

    this.setCurrentYear();
    this.loadData();

    console.log("[Teachly Admin] Dashboard initialized.");
  },

  /* =====================================
   REPORT CARD NAVIGATION
===================================== */

  bindReportCards() {
    if (this.reportCardsBound) return;

    const selector = ".admin-stat-card[data-report-tab]";

    // Klik mouse
    document.addEventListener("click", (event) => {
      const card = event.target.closest(selector);

      if (!card) return;

      sessionStorage.setItem(
        "teachly_admin_report_tab",
        card.dataset.reportTab,
      );

      // Navigasi halaman laporan tetap ditangani
      // oleh Admin Router melalui data-admin-page.
    });

    // Akses keyboard: Enter dan Space
    document.addEventListener("keydown", (event) => {
      const card = event.target.closest(selector);

      if (!card) return;

      if (event.key !== "Enter" && event.key !== " ") return;

      event.preventDefault();

      sessionStorage.setItem(
        "teachly_admin_report_tab",
        card.dataset.reportTab,
      );

      card.click();
    });

    this.reportCardsBound = true;
  },

  /* =====================================
     LOAD DATA
  ===================================== */

  async loadData() {
    if (this.loading) return;

    this.loading = true;
    this.resetStatistics();

    try {
      const response = await API.post("adminDashboard.summary");

      if (!response || response.success !== true) {
        throw new Error(
          response?.message || "Gagal mengambil statistik dashboard.",
        );
      }

      this.data = response.data || {};

      this.renderStatistics();
      this.renderAcademicYear();
    } catch (error) {
      console.error("[AdminDashboard.loadData]", error);

      this.showError();
    } finally {
      this.loading = false;
    }
  },

  /* =====================================
     RENDER STATISTICS
  ===================================== */

  renderStatistics() {
    const data = this.data || {};

    this.setText("statLaporanGuruKelas", data.laporanGuruKelas);

    this.setText("statLaporanGuruMapel", data.laporanGuruMapel);

    this.setText("statLaporanGuruNgaji", data.laporanGuruNgaji);

    this.setText("statTotalSeluruhLaporan", data.totalSeluruhLaporan);

    // Statistik chart
    this.setText("statChartTotal", data.totalSeluruhLaporan);

    this.setText("statChartLaporanKelas", data.laporanGuruKelas);

    this.setText("statChartLaporanMapel", data.laporanGuruMapel);

    this.setText("statChartLaporanNgaji", data.laporanGuruNgaji);
  },

  /* =====================================
     RENDER ACADEMIC YEAR
  ===================================== */

  renderAcademicYear() {
    const data = this.data || {};

    this.setText(
      "adminActiveAcademicYear",
      data.tahunAjaran || "Belum ada tahun ajaran aktif",
    );
  },

  /* =====================================
     CURRENT YEAR
  ===================================== */

  setCurrentYear() {
    this.setText("adminCurrentYear", new Date().getFullYear());
  },

  /* =====================================
     RESET STATISTICS
  ===================================== */

  resetStatistics() {
    const ids = [
      "statLaporanGuruKelas",
      "statLaporanGuruMapel",
      "statLaporanGuruNgaji",
      "statTotalSeluruhLaporan",
      "statChartTotal",
      "statChartLaporanKelas",
      "statChartLaporanMapel",
      "statChartLaporanNgaji",
    ];

    ids.forEach((id) => {
      this.setText(id, "...");
    });

    this.setText("adminActiveAcademicYear", "Memuat...");
  },

  /* =====================================
     SHOW ERROR
  ===================================== */

  showError() {
    const ids = [
      "statLaporanGuruKelas",
      "statLaporanGuruMapel",
      "statLaporanGuruNgaji",
      "statTotalSeluruhLaporan",
      "statChartTotal",
      "statChartLaporanKelas",
      "statChartLaporanMapel",
      "statChartLaporanNgaji",
    ];

    ids.forEach((id) => {
      this.setText(id, "-");
    });

    this.setText("adminActiveAcademicYear", "Gagal memuat data");
  },

  /* =====================================
     SET TEXT
  ===================================== */

  setText(id, value) {
    const element = document.getElementById(id);

    if (element) {
      element.textContent =
        value === undefined || value === null
          ? "0"
          : Number.isFinite(Number(value))
            ? Number(value).toLocaleString("id-ID")
            : value;
    }
  },
};
