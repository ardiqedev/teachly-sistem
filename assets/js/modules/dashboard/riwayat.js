/* =========================================
   TEACHLY - RIWAYAT LAPORAN
========================================= */

const Riwayat = {
  initialized: false,
  loading: false,

  kategoriAktif: "GURU_KELAS",
  laporan: [],

  currentPage: 1,
  pageSize: 10,

  endpoints: {
    GURU_KELAS: "laporan.getHistoryGuruKelas",
    GURU_MAPEL: "laporan.getHistoryGuruMapel",
    GURU_NGAJI: "laporan.getHistoryGuruNgaji",
  },

  detailEndpoints: {
    GURU_KELAS: "laporan.getDetailGuruKelas",
    GURU_MAPEL: "laporan.getDetailGuruMapel",
    GURU_NGAJI: "laporan.getDetailGuruNgaji",
  },

  /* =====================================
     INITIALIZE
  ===================================== */

  async init() {
    if (this.loading) return;

    this.loading = true;

    this.bindEvents();
    this.renderLoading();

    try {
      const guru = Auth.getGuru() || Auth.getUser() || {};

      this.nbm = guru.NBM || guru.nbm || "";

      const namaGuru =
        guru.NAMA_GURU || guru.namaGuru || guru.NAMA || guru.nama || "Guru";

      if (!this.nbm) {
        throw new Error("NBM guru tidak ditemukan.");
      }

      this.setText("[data-guru-nama]", namaGuru);

      await this.loadHistory();

      this.initialized = true;

      console.log("[Riwayat] Berhasil dimuat.");
    } catch (error) {
      console.error("[Riwayat] Gagal memuat:", error);
      this.renderError(error.message);
    } finally {
      this.loading = false;
    }
  },

  /* =====================================
     BIND EVENTS
  ===================================== */

  bindEvents() {
    const root = document.querySelector(".riwayat-page");

    if (!root || root.dataset.bound === "true") return;

    root.dataset.bound = "true";

    root.addEventListener("click", (event) => {
      const tab = event.target.closest("[data-riwayat-tab]");

      if (tab) {
        this.changeCategory(tab.dataset.riwayatTab);
        return;
      }

      const pageButton = event.target.closest("[data-riwayat-page]");

      if (pageButton) {
        const page = Number(pageButton.dataset.riwayatPage);

        this.changePage(page);
        return;
      }

      if (event.target.closest("#btnFilterRiwayat")) {
        this.loadHistory();
        return;
      }

      if (event.target.closest("#btnResetRiwayat")) {
        this.resetFilter();
      }

      const detailButton = event.target.closest('[data-action="detail"]');

      if (detailButton) {
        const idLaporan = detailButton.dataset.id;

        this.showDetail(idLaporan);
        return;
      }

      const editButton = event.target.closest('[data-action="edit"]');

      if (editButton) {
        this.showEditComingSoon();
        return;
      }
    });

    const logoutButton = root.querySelector('[data-action="logout"]');

    if (logoutButton) {
      logoutButton.addEventListener("click", () => {
        if (typeof Auth !== "undefined" && Auth.logout) {
          Auth.logout();
        }
      });
    }
  },

  /* =====================================
     CHANGE CATEGORY
  ===================================== */

  async changeCategory(kategori) {
    if (!this.endpoints[kategori]) return;
    if (this.kategoriAktif === kategori) return;

    this.kategoriAktif = kategori;

    document.querySelectorAll("[data-riwayat-tab]").forEach((button) => {
      const active = button.dataset.riwayatTab === kategori;

      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
    });

    this.setText("#riwayatKategoriLabel", this.getCategoryLabel(kategori));

    await this.loadHistory();
  },

  /* =====================================
     LOAD HISTORY
  ===================================== */

  async loadHistory() {
    if (!this.nbm) return;
    this.currentPage = 1;

    const mulai = document.getElementById("riwayatTanggalMulai")?.value || "";

    const akhir = document.getElementById("riwayatTanggalAkhir")?.value || "";

    if (mulai && akhir && mulai > akhir) {
      alert("Tanggal mulai tidak boleh melebihi tanggal akhir.");
      return;
    }

    this.renderLoading();

    try {
      const endpoint = this.endpoints[this.kategoriAktif];

      const response = await API.post(endpoint, {
        nbm: this.nbm,
        filters: {
          tanggalMulai: mulai,
          tanggalAkhir: akhir,
        },
      });

      if (!response || response.success !== true) {
        throw new Error(
          response?.message || "Gagal mengambil riwayat laporan.",
        );
      }

      const data = response.data;

      this.laporan = Array.isArray(data) ? data : [];

      this.renderList();
    } catch (error) {
      console.error("[Riwayat] Load error:", error);
      this.renderError(error.message);
    }
  },

  /* =====================================
   DETAIL LAPORAN
===================================== */

  async showDetail(idLaporan) {
    if (!idLaporan || !this.nbm) return;

    try {
      if (typeof Modal === "undefined") {
        throw new Error("Modal Engine tidak tersedia.");
      }

      const endpoint = this.detailEndpoints[this.kategoriAktif];

      const response = await API.post(endpoint, {
        idLaporan,
        nbm: this.nbm,
      });

      if (!response || response.success !== true) {
        throw new Error(response?.message || "Gagal mengambil detail laporan.");
      }

      const data = response.data;

      if (!data) {
        throw new Error("Data laporan tidak ditemukan.");
      }

      console.log("[Riwayat] Detail laporan:", data);

      this.renderDetail(data);
    } catch (error) {
      console.error("[Riwayat] Detail error:", error);
      alert(error.message);
    }
  },

  renderDetail(data) {
    const escapeHtml = (value) => {
      return String(value ?? "-").replace(
        /[&<>"']/g,
        (char) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          })[char],
      );
    };

    const field = (label, value) => `
    <div class="riwayat-detail-field">
      <span>${label}</span>
      <p>${escapeHtml(value || "-")}</p>
    </div>
  `;

    const photo = (label, value) => {
      if (!value) {
        return `
      <div class="riwayat-detail-photo">
        <span>${label}</span>
        <p>Belum ada dokumentasi</p>
      </div>
    `;
      }

      let originalUrl = String(value).trim();

      // Validasi URL
      let parsedUrl;

      try {
        parsedUrl = new URL(originalUrl);

        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
          throw new Error("URL tidak valid");
        }
      } catch (error) {
        return `
      <div class="riwayat-detail-photo">
        <span>${label}</span>
        <p>URL dokumentasi tidak valid</p>
      </div>
    `;
      }

      // Deteksi ID file Google Drive
      let fileId = null;

      if (parsedUrl.hostname === "drive.google.com") {
        const match = originalUrl.match(/\/file\/d\/([^/]+)|[?&]id=([^&]+)/);

        fileId = match ? match[1] || match[2] : null;
      }

      // URL untuk preview
      const previewUrl = fileId
        ? `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=w1200`
        : originalUrl;

      return `
    <div class="riwayat-detail-photo">
      <span>${label}</span>

      <div class="riwayat-photo-preview">
        <img
          src="${escapeHtml(previewUrl)}"
          alt="${escapeHtml(label)}"
          loading="lazy"
          referrerpolicy="no-referrer"
        >

        <div class="riwayat-photo-error" hidden>
          <i data-lucide="image-off"></i>
          <span>Preview tidak tersedia</span>
        </div>
      </div>

      <a
        href="${escapeHtml(originalUrl)}"
        target="_blank"
        rel="noopener noreferrer"
      >
        Buka foto
        <i data-lucide="external-link"></i>
      </a>
    </div>
  `;
    };

    const content = `
    <div class="riwayat-detail">

      <div class="riwayat-detail-section">
        <h3>Informasi Laporan</h3>

        ${field("ID Laporan", data.ID_LAPORAN)}
        ${field("Tanggal Laporan", this.formatDate(data.TANGGAL_LAPORAN))}
        ${field("Kelas", data.NAMA_KELAS || data.ID_KELAS || "-")}
        ${field("NBM", data.NBM)}
      </div>

      <div class="riwayat-detail-section">
        <h3>Rekap Kehadiran</h3>

        <div class="riwayat-detail-attendance">
          <div>
            <strong>${escapeHtml(data.SAKIT ?? 0)}</strong>
            <span>Sakit</span>
          </div>
          <div>
            <strong>${escapeHtml(data.IZIN ?? 0)}</strong>
            <span>Izin</span>
          </div>
          <div>
            <strong>${escapeHtml(data.ALPA ?? 0)}</strong>
            <span>Alpa</span>
          </div>
        </div>
      </div>

      <div class="riwayat-detail-section">
        <h3>Informasi Pembelajaran</h3>

        ${field("Ringkasan Pembelajaran", data.RINGKASAN_PEMBELAJARAN)}
        ${field("Hadits & Doa", data.HADITS_DOA)}
        ${field("Pendidikan Adab", data.PENDIDIKAN_ADAB)}
        ${field("Kendala", data.KENDALA)}
        ${field("Solusi", data.SOLUSI)}
      </div>

      <div class="riwayat-detail-section">
        <h3>Dokumentasi</h3>

        ${photo("Modul Ajar", data.MODUL_AJAR)}
        ${photo("Asesmen", data.ASESMEN)}
        ${photo("Dokumentasi", data.DOKUMENTASI)}
      </div>

    </div>
  `;

    Modal.open({
      title: "Detail Laporan Guru Kelas",
      body: content,
      footer: `
      <button type="button"
        class="btn btn-secondary"
        onclick="Modal.close()">
        Tutup
      </button>
    `,
      size: "lg",
    });
  },

  /* =====================================
     RESET FILTER
  ===================================== */

  resetFilter() {
    const mulai = document.getElementById("riwayatTanggalMulai");

    const akhir = document.getElementById("riwayatTanggalAkhir");

    if (mulai) mulai.value = "";
    if (akhir) akhir.value = "";

    this.loadHistory();
  },

  /* =====================================
     RENDER LIST
  ===================================== */

  renderList() {
    const container = document.getElementById("riwayatList");

    if (!container) return;

    const total = this.laporan.length;
    const totalPages = Math.ceil(total / this.pageSize);

    // Pastikan halaman tetap valid
    if (totalPages > 0 && this.currentPage > totalPages) {
      this.currentPage = totalPages;
    }

    this.setText("#riwayatTotal", total);

    this.setText(
      "#riwayatKategoriLabel",
      this.getCategoryLabel(this.kategoriAktif),
    );

    if (!total) {
      container.innerHTML = `
      <div class="riwayat-empty">
        <i data-lucide="file-search"></i>
        <h3>Belum Ada Laporan</h3>
        <p>
          Tidak ditemukan laporan pada kategori
          dan periode yang dipilih.
        </p>
      </div>
    `;

      this.refreshIcons();
      return;
    }

    // Ambil data sesuai halaman aktif
    const startIndex = (this.currentPage - 1) * this.pageSize;

    const endIndex = startIndex + this.pageSize;

    const pageData = this.laporan.slice(startIndex, endIndex);

    // Render kartu laporan
    container.innerHTML = `
    ${pageData.map((item) => this.renderCard(item)).join("")}

    ${this.renderPagination(total, totalPages)}
  `;

    this.refreshIcons();
  },

  /* =====================================
   PAGINATION
===================================== */

  renderPagination(total, totalPages) {
    if (totalPages <= 1) return "";

    const start = (this.currentPage - 1) * this.pageSize + 1;

    const end = Math.min(this.currentPage * this.pageSize, total);

    // Maksimal 5 nomor halaman
    const maxVisible = 5;

    let firstPage = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));

    let lastPage = Math.min(totalPages, firstPage + maxVisible - 1);

    // Geser jendela agar tetap menampilkan 5 nomor
    firstPage = Math.max(1, lastPage - maxVisible + 1);

    let pages = "";

    for (let i = firstPage; i <= lastPage; i++) {
      pages += `
      <button
        type="button"
        class="riwayat-page-number ${i === this.currentPage ? "active" : ""}"
        data-riwayat-page="${i}"
        ${i === this.currentPage ? 'aria-current="page"' : ""}
      >
        ${i}
      </button>
    `;
    }

    return `
    <div class="riwayat-pagination">

      <div class="riwayat-pagination__info">
        Menampilkan ${start}–${end} dari ${total} laporan
      </div>

      <div class="riwayat-pagination__controls">

        <button
          type="button"
          class="riwayat-page-arrow"
          data-riwayat-page="${this.currentPage - 1}"
          ${this.currentPage === 1 ? "disabled" : ""}
          aria-label="Halaman sebelumnya"
        >
          <i data-lucide="chevron-left"></i>
        </button>

        ${pages}

        <button
          type="button"
          class="riwayat-page-arrow"
          data-riwayat-page="${this.currentPage + 1}"
          ${this.currentPage === totalPages ? "disabled" : ""}
          aria-label="Halaman berikutnya"
        >
          <i data-lucide="chevron-right"></i>
        </button>

      </div>
    </div>
  `;
  },

  /* =====================================
   CHANGE PAGE
===================================== */

  changePage(page) {
    const totalPages = Math.ceil(this.laporan.length / this.pageSize);

    if (
      !Number.isInteger(page) ||
      page < 1 ||
      page > totalPages ||
      page === this.currentPage
    ) {
      return;
    }

    this.currentPage = page;
    this.renderList();

    // Kembalikan tampilan ke daftar laporan
    document.getElementById("riwayatList")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  },

  /* =====================================
     REPORT CARD
  ===================================== */

  renderCard(item) {
    const id = this.escapeHTML(item.ID_LAPORAN || "");

    const tanggal = this.escapeHTML(this.formatDate(item.TANGGAL_LAPORAN));

    const judul = this.escapeHTML(this.getReportTitle(item));

    const ringkasan = this.escapeHTML(this.getReportSummary(item));

    return `
      <article class="riwayat-card">
        <div class="riwayat-card__top">
          <div>
            <span class="riwayat-card__category">
              ${this.getCategoryLabel(this.kategoriAktif)}
            </span>

            <h3>${judul}</h3>
          </div>

          <span class="riwayat-card__icon">
            <i data-lucide="file-text"></i>
          </span>
        </div>

        <div class="riwayat-card__date">
          <i data-lucide="calendar-days"></i>
          <span>${tanggal}</span>
        </div>

        <p class="riwayat-card__summary">
          ${ringkasan || "Tidak ada ringkasan."}
        </p>

        <div class="riwayat-card__actions">
          <button
            type="button"
            class="btn-riwayat-detail"
            data-action="detail"
            data-id="${id}"
          >
            Detail
          </button>

          <button
            type="button"
            class="btn-riwayat-edit"
            data-action="edit"
            data-id="${id}"
          >
            Edit
          </button>
        </div>
      </article>
    `;
  },

  /* =====================================
     REPORT INFORMATION
  ===================================== */

  getReportTitle(item) {
    if (this.kategoriAktif === "GURU_KELAS") {
      return item.NAMA_KELAS || item.ID_KELAS || "Laporan Guru Kelas";
    }

    if (this.kategoriAktif === "GURU_MAPEL") {
      return item.NAMA_MAPEL || item.ID_MAPEL || "Laporan Guru Mapel";
    }

    return item.KELOMPOK_NGAJI || "Laporan Guru Ngaji";
  },

  getReportSummary(item) {
    return (
      item.RINGKASAN_PEMBELAJARAN ||
      item.CATATAN_PEMBELAJARAN ||
      item.HADITS_DOA ||
      item.PENDIDIKAN_ADAB ||
      item.HALAMAN_SURAT_AYAT ||
      ""
    );
  },

  getCategoryLabel(kategori) {
    const labels = {
      GURU_KELAS: "Guru Kelas",
      GURU_MAPEL: "Guru Mapel",
      GURU_NGAJI: "Guru Ngaji",
    };

    return labels[kategori] || "Riwayat Laporan";
  },

  /* =====================================
     LOADING & ERROR
  ===================================== */

  renderLoading() {
    this.setText("#riwayatTotal", "...");

    const container = document.getElementById("riwayatList");

    if (container) {
      container.innerHTML = `
        <div class="riwayat-loading">
          <i data-lucide="loader-circle"></i>
          <p>Memuat riwayat laporan...</p>
        </div>
      `;
    }

    this.refreshIcons();
  },

  renderError(message) {
    const container = document.getElementById("riwayatList");

    if (container) {
      container.innerHTML = `
        <div class="riwayat-empty">
          <i data-lucide="alert-circle"></i>
          <h3>Gagal Memuat Data</h3>
          <p>${this.escapeHTML(message)}</p>
          <button
            type="button"
            onclick="Riwayat.loadHistory()"
          >
            Coba Lagi
          </button>
        </div>
      `;
    }

    this.refreshIcons();
  },

  /* =====================================
     HELPERS
  ===================================== */

  setText(selector, value) {
    const element = document.querySelector(selector);

    if (element) {
      element.textContent = value ?? "";
    }
  },

  formatDate(value) {
    if (!value) return "-";

    let date;

    // Jika backend mengirim objek Date atau timestamp
    if (value instanceof Date) {
      date = value;
    } else if (typeof value === "number") {
      date = new Date(value);
    } else {
      const text = String(value).trim();

      // Format dd/MM/yyyy
      const localFormat = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

      if (localFormat) {
        date = new Date(
          Number(localFormat[3]),
          Number(localFormat[2]) - 1,
          Number(localFormat[1]),
        );
      } else {
        // Format ISO atau format tanggal lainnya
        date = new Date(text);
      }
    }

    // Validasi sebelum diformat
    if (!date || Number.isNaN(date.getTime())) {
      console.warn("[Riwayat] Format tanggal tidak valid:", value);

      return String(value);
    }

    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  },

  escapeHTML(value) {
    return String(value ?? "").replace(
      /[&<>"']/g,
      (char) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;",
        })[char],
    );
  },

  refreshIcons() {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  showEditComingSoon() {
    Toast.info("Fitur edit laporan belum dikembangkan.");
  },
};
