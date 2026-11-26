/* =========================================
   TEACHLY - ADMIN DASHBOARD
========================================= */

const AdminDashboard = {
  data: null,
  initialized: false,
  requestId: 0,
  reportCardsBound: false,

  /* =====================================
     INITIALIZE
  ===================================== */

  init() {
    this.initialized = true;

    this.setCurrentYear();
    this.bindReportPeriod();
    const weeklyButton = document.getElementById("adminWeeklyAbsencesButton");
    if (weeklyButton) weeklyButton.onclick = () => this.loadWeeklyAbsences(weeklyButton);

    console.log("[Teachly Admin] Dashboard initialized.");
  },

  async loadWeeklyAbsences(button) {
    if (button.disabled) return;
    button.disabled = true;
    button.setAttribute("aria-busy", "true");
    try {
      const response = await API.post("adminDashboard.weeklyAbsences");
      if (!button.isConnected) return;
      if (response?.success !== true) throw new Error(response?.message || "Rekap pekan ini gagal dimuat.");
      const { startDate, endDate, siswa } = response.data;
      Modal.open({
        title: "Siswa Tidak Hadir Pekan Ini",
        size: "lg",
        body: `<div id="adminWeeklyAbsences">
          <p data-weekly-period></p>
          <div class="admin-guru-table-wrapper" data-weekly-table hidden>
            <table class="admin-guru-table" aria-label="Siswa tidak hadir pekan ini">
              <thead><tr><th scope="col">Nama Siswa</th><th scope="col">Kelas</th>
              <th scope="col">Sakit</th><th scope="col">Izin</th><th scope="col">Alpa</th></tr></thead>
              <tbody></tbody>
            </table>
          </div>
          <p data-weekly-empty hidden>Belum ada ketidakhadiran yang tercatat pekan ini.</p>
        </div>`,
        footer: '<button id="adminWeeklyAbsencesClose" type="button" class="btn btn-outline">Tutup</button>',
      });

      const root = document.getElementById("adminWeeklyAbsences");
      root.querySelector("[data-weekly-period]").textContent =
        `${this.formatReportPeriod({ tanggal: startDate })} – ${this.formatReportPeriod({ tanggal: endDate })}`;
      root.querySelector("[data-weekly-table]").hidden = !siswa.length;
      root.querySelector("[data-weekly-empty]").hidden = Boolean(siswa.length);
      const table = root.querySelector("tbody");
      for (const item of siswa) {
        const tr = table.insertRow();
        for (const value of [item.nama, item.kelas, item.SAKIT, item.IZIN, item.ALPA]) {
          tr.insertCell().textContent = value;
        }
      }
      document.getElementById("adminWeeklyAbsencesClose").onclick = () => Modal.close();
    } catch (error) {
      if (button.isConnected) Toast.error(error.message || "Rekap pekan ini gagal dimuat.");
    } finally {
      button.disabled = false;
      button.removeAttribute("aria-busy");
    }
  },

  bindReportPeriod() {
    const form = document.getElementById("adminReportPeriodForm");
    if (!form) return;

    const mode = form.querySelector("#adminReportPeriodMode");
    const date = form.querySelector("#adminReportDate");
    const month = form.querySelector("#adminReportMonth");
    const dateField = form.querySelector("#adminReportDateField");
    const monthField = form.querySelector("#adminReportMonthField");
    const updateMode = () => {
      const useMonth = mode.value === "bulan";
      dateField.hidden = date.disabled = useMonth;
      monthField.hidden = month.disabled = !useMonth;
    };
    const reset = () => {
      const parts = new Intl.DateTimeFormat("en", {
        timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit",
      }).formatToParts(new Date());
      const { year, month: monthNumber, day } = Object.fromEntries(
        parts.map(({ type, value }) => [type, value]),
      );
      mode.value = "tanggal";
      month.value = `${year}-${monthNumber}`;
      date.value = `${month.value}-${day}`;
      updateMode();
      void this.loadData({ tanggal: date.value }, form);
    };
    mode.onchange = updateMode;
    form.onsubmit = (event) => {
      event.preventDefault();
      const period = mode.value === "bulan" ? { bulan: month.value } : { tanggal: date.value };
      void this.loadData(period, form);
    };
    form.onreset = (event) => {
      event.preventDefault();
      reset();
    };
    reset();
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

  async loadData(period, form) {
    const requestId = ++this.requestId;
    form.setAttribute("aria-busy", "true");
    this.resetStatistics();
    this.setText("adminReportPeriodStatus", "Memuat laporan…");

    try {
      const response = await API.post("adminDashboard.summary", period);
      if (requestId !== this.requestId || !form.isConnected) return;

      if (!response || response.success !== true) {
        throw new Error(
          response?.message || "Gagal mengambil statistik dashboard.",
        );
      }
      const [key, value] = Object.entries(period)[0];
      if (response.data?.periode?.[key] !== value) {
        throw new Error("Deployment Apps Script belum mendukung filter periode.");
      }

      this.data = response.data;

      this.renderStatistics();
      this.renderAcademicYear();
      this.renderTeacherReports();
      this.setText("adminReportPeriodStatus", `Periode aktif: ${this.formatReportPeriod(period)}`);
    } catch (error) {
      if (requestId !== this.requestId || !form.isConnected) return;
      console.error("[AdminDashboard.loadData]", error);

      this.showError();
      this.setText("adminReportPeriodStatus", error.message || "Gagal memuat filter periode.");
    } finally {
      if (requestId === this.requestId && form.isConnected) form.removeAttribute("aria-busy");
    }
  },

  formatReportPeriod({ tanggal, bulan }) {
    const value = tanggal || `${bulan}-01`;
    return new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "long",
      ...(tanggal ? { day: "numeric" } : {}),
    }).format(new Date(`${value}T00:00:00Z`));
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

    const stats = data.statistikGuru;
    this.renderTeacherStatistics(stats, "-");
  },

  renderTeacherStatistics(stats, placeholder) {
    this.setText("statChartTotal", stats?.total ?? placeholder);
    this.setText("statGuruAktif", stats?.aktif ?? placeholder);
    this.setText("statGuruNonaktif", stats?.nonaktif ?? placeholder);
    this.setText("statGuruLainnya", stats?.lainnya ?? placeholder);

    const other = document.getElementById("statGuruLainnya")?.closest(".admin-legend-item");
    if (other) other.hidden = !stats?.lainnya;

    const chart = document.getElementById("adminTeacherChart");
    if (!chart) return;
    if (stats?.total > 0) {
      const activeEnd = stats.aktif / stats.total * 100;
      const inactiveEnd = (stats.aktif + stats.nonaktif) / stats.total * 100;
      chart.style.background = `conic-gradient(
        var(--teacher-active) 0% ${activeEnd}%,
        var(--teacher-inactive) ${activeEnd}% ${inactiveEnd}%,
        var(--teacher-other) ${inactiveEnd}% 100%
      )`;
    } else {
      chart.style.removeProperty("background");
    }
  },

  renderTeacherReports() {
    const list = document.getElementById("adminTeacherReports");
    const search = document.getElementById("adminTeacherReportsSearch");
    if (!list || !search) return;

    const { laporanPerGuru: rows, tahunAjaran, periode } = this.data || {};
    search.disabled = !rows?.length;
    if (!Array.isArray(rows) || !tahunAjaran || !rows.length) {
      list.textContent = !Array.isArray(rows)
        ? "Data laporan per guru belum tersedia."
        : !tahunAjaran ? "Belum ada tahun ajaran aktif." : "Belum ada data guru.";
      return;
    }

    this.setText("adminTeacherReportsPeriod", periode
      ? `${this.formatReportPeriod(periode)} · Tahun ajaran ${tahunAjaran}`
      : `Tahun ajaran ${tahunAjaran}`);
    const max = rows.reduce((highest, row) => Math.max(highest, row.total), 1);
    const categories = [["kelas", "Guru Kelas"], ["mapel", "Guru Mapel"], ["ngaji", "Guru Ngaji"]];
    const render = () => {
      const query = search.value.trim().toLocaleLowerCase("id");
      const matching = rows.filter(({ nama }) => nama.toLocaleLowerCase("id").includes(query));
      const items = document.createDocumentFragment();
      for (const row of matching) {
        const item = document.createElement("div");
        item.className = "admin-teacher-report-row";
        const name = document.createElement("span");
        name.textContent = row.nama;
        const total = document.createElement("strong");
        total.textContent = row.total.toLocaleString("id-ID");
        const track = document.createElement("div");
        track.className = "admin-teacher-report-track";
        track.setAttribute("role", "img");
        const breakdown = categories.map(([key, label]) => `${label}: ${row[key]}`).join(", ");
        track.setAttribute("aria-label", breakdown);
        item.title = breakdown;
        for (const [key] of categories) {
          if (!row[key]) continue;
          const bar = document.createElement("span");
          bar.className = `admin-teacher-report-segment ${key}`;
          bar.style.width = `${row[key] / max * 100}%`;
          track.append(bar);
        }
        item.append(name, track, total);
        items.append(item);
      }
      list.replaceChildren(items);
      if (!matching.length) list.textContent = "Nama guru tidak ditemukan.";
    };

    search.oninput = render;
    render();
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
    ];

    ids.forEach((id) => {
      this.setText(id, "...");
    });
    this.renderTeacherStatistics(null, "...");
    this.setText("adminTeacherReports", "Memuat laporan per guru…");
    const search = document.getElementById("adminTeacherReportsSearch");
    if (search) {
      search.disabled = true;
      search.oninput = null;
    }

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
    ];

    ids.forEach((id) => {
      this.setText(id, "-");
    });
    this.renderTeacherStatistics(null, "-");
    this.setText("adminTeacherReports", "Gagal memuat laporan per guru.");

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
