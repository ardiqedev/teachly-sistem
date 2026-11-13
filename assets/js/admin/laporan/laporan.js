/* =========================================================
   TEACHLY - ADMIN LAPORAN
   QEDEV FRONTEND STANDARD
========================================================= */

const AdminLaporan = {
  // =======================================================
  // STATE
  // =======================================================

  data: {
    all: [],
    guruKelas: [],
    guruMapel: [],
    guruNgaji: [],
    statistics: {
      total: 0,
      guruKelas: 0,
      guruMapel: 0,
      guruNgaji: 0,
    },
  },

  activeTab: "GURU_KELAS",
  keyword: "",
  selectedGuruNBM: "",
  page: 1,
  pageSize: 10,
  initialized: false,
  boundRoot: null,
  loading: false,

  getFilteredData() {
    let source = [...this.getActiveData()];

    // Filter nama guru
    if (this.selectedGuruNBM) {
      source = source.filter(
        (item) => String(item.NBM || "").trim() === this.selectedGuruNBM,
      );
    }

    // Pencarian
    return LaporanService.search(source, this.keyword);
  },

  // =======================================================
  // RENDER HALAMAN
  // =======================================================

  render() {
    return `
      <section class="admin-laporan-page">

        <!-- HEADER -->
        <div class="admin-laporan-header">
          <div>
            <span class="admin-laporan-eyebrow">
              MANAJEMEN SEKOLAH
            </span>

            <h1>Laporan Guru</h1>

            <p>
              Pantau dan tinjau laporan kegiatan guru sekolah.
            </p>
          </div>

          <button
            type="button"
            class="admin-laporan-btn admin-laporan-btn-outline"
            data-laporan-action="refresh"
          >
            <i data-lucide="refresh-cw"></i>
            Refresh
          </button>
        </div>


        <!-- STATISTIK -->
        <div class="admin-laporan-statistics">

          <div class="admin-laporan-stat-card">
            <div class="admin-laporan-stat-icon navy">
              <i data-lucide="files"></i>
            </div>

            <div>
              <span>Total Laporan</span>
              <strong id="laporanStatTotal">0</strong>
            </div>
          </div>


          <div class="admin-laporan-stat-card">
            <div class="admin-laporan-stat-icon blue">
              <i data-lucide="graduation-cap"></i>
            </div>

            <div>
              <span>Guru Kelas</span>
              <strong id="laporanStatKelas">0</strong>
            </div>
          </div>


          <div class="admin-laporan-stat-card">
            <div class="admin-laporan-stat-icon gold">
              <i data-lucide="book-open"></i>
            </div>

            <div>
              <span>Guru Mapel</span>
              <strong id="laporanStatMapel">0</strong>
            </div>
          </div>


          <div class="admin-laporan-stat-card">
            <div class="admin-laporan-stat-icon green">
              <i data-lucide="book-marked"></i>
            </div>

            <div>
              <span>Guru Ngaji</span>
              <strong id="laporanStatNgaji">0</strong>
            </div>
          </div>

        </div>


        <!-- PANEL LAPORAN -->
        <div class="admin-laporan-panel">

          <!-- TAB NAVIGATION -->
          <div class="admin-laporan-tabs" role="tablist">

            <button
              type="button"
              class="admin-laporan-tab active"
              data-laporan-tab="GURU_KELAS"
              role="tab"
              aria-selected="true"
            >
              <i data-lucide="graduation-cap"></i>
              Guru Kelas

              <span id="laporanCountKelas">0</span>
            </button>


            <button
              type="button"
              class="admin-laporan-tab"
              data-laporan-tab="GURU_MAPEL"
              role="tab"
              aria-selected="false"
            >
              <i data-lucide="book-open"></i>
              Guru Mapel

              <span id="laporanCountMapel">0</span>
            </button>


            <button
              type="button"
              class="admin-laporan-tab"
              data-laporan-tab="GURU_NGAJI"
              role="tab"
              aria-selected="false"
            >
              <i data-lucide="book-marked"></i>
              Guru Ngaji

              <span id="laporanCountNgaji">0</span>
            </button>

          </div>


          
        <!-- TOOLBAR -->
        <div class="admin-laporan-toolbar">

        <!-- JUDUL PANEL -->
        <div class="admin-laporan-panel-title">
            <h2 id="laporanTableTitle">
            Laporan Guru Kelas
            </h2>

            <p id="laporanTableDescription">
            Daftar laporan kegiatan Guru Kelas.
            </p>
        </div>

        <!-- FILTER GURU -->
        <div class="admin-laporan-filter">
            <i data-lucide="user-round"></i>

            <select id="laporanFilterGuru">
            <option value="">Semua Guru</option>
            </select>
        </div>

        <!-- SEARCH DAN AKSI -->
        <div class="admin-laporan-toolbar-actions">

            <div class="admin-laporan-search">
            <input
                type="search"
                id="laporanSearch"
                placeholder="Cari NBM, nama guru, kelas..."
                autocomplete="off"
            >
            </div>

            <!-- PREVIEW PDF LAMA -->
            <button
            type="button"
            class="admin-laporan-btn admin-laporan-btn-primary"
            data-laporan-action="preview-pdf"
            >
            <i data-lucide="printer"></i>
            Preview Cetak PDF
            </button>

            <!-- CETAK DATA PDF BARU -->
            <button
            type="button"
            class="admin-laporan-btn admin-laporan-btn-secondary"
            data-laporan-action="print-data-pdf"
            >
            <i data-lucide="file-spreadsheet"></i>
            Cetak Data PDF
            </button>

        </div>

        </div>



          <!-- TABLE -->
          <div class="admin-laporan-table-wrapper">

            <table class="admin-laporan-table">

              <thead id="laporanTableHead">
                ${this.renderTableHead("GURU_KELAS")}
              </thead>

              <tbody id="laporanTableBody">

                <tr>
                  <td colspan="6" class="admin-laporan-empty">
                    Memuat data laporan...
                  </td>
                </tr>

              </tbody>

            </table>

          </div>


          <!-- FOOTER -->
          <div class="admin-laporan-footer">
            <span id="laporanTableInfo">
                Menampilkan 0 laporan
            </span>

            <div
                class="admin-laporan-pagination"
                id="laporanPagination"
            ></div>
         </div>

        </div>


        <!-- DETAIL MODAL -->
        <div
          class="admin-laporan-modal"
          id="adminLaporanModal"
          aria-hidden="true"
        >

          <div class="admin-laporan-modal-backdrop"
               data-laporan-action="close-detail"></div>

          <div class="admin-laporan-modal-content">

            <div class="admin-laporan-modal-header">

              <div>
                <span>DETAIL LAPORAN</span>
                <h2>Informasi Laporan Guru</h2>
              </div>

              <button
                type="button"
                class="admin-laporan-modal-close"
                data-laporan-action="close-detail"
                aria-label="Tutup"
              >
                <i data-lucide="x"></i>
              </button>

            </div>

            <div
              class="admin-laporan-detail"
              id="adminLaporanDetail"
            ></div>

          </div>

        </div>


        <!-- PDF PREVIEW MODAL -->
        <div
        class="admin-laporan-print-modal"
        id="adminLaporanPrintModal"
        aria-hidden="true"
        >
        <div
            class="admin-laporan-print-backdrop"
            data-laporan-action="close-print-preview"
        ></div>

        <div class="admin-laporan-print-content">

            <div class="admin-laporan-print-header">
            <div>
                <span>PREVIEW CETAK</span>
                <h2>Preview Laporan Guru</h2>
            </div>

            <div class="admin-laporan-print-actions">
                <button
                type="button"
                data-laporan-action="print-pdf"
                >
                <i data-lucide="printer"></i>
                Cetak PDF
                </button>

                <button
                type="button"
                data-laporan-action="close-print-preview"
                aria-label="Tutup preview"
                >
                <i data-lucide="x"></i>
                </button>
            </div>
            </div>

            <div
            class="admin-laporan-print-body"
            id="adminLaporanPrintBody"
            ></div>

        </div>
        </div>



        <!-- IMAGE LIGHTBOX -->
        <div
        class="admin-laporan-lightbox"
        id="adminLaporanLightbox"
        aria-hidden="true"
        >
        <div
            class="admin-laporan-lightbox-backdrop"
            data-laporan-action="close-lightbox"
        ></div>

        <div class="admin-laporan-lightbox-content">

            <div class="admin-laporan-lightbox-header">
            <div>
                <span>PREVIEW GAMBAR</span>
                <h3 id="adminLaporanLightboxTitle">
                Dokumen Pendukung
                </h3>
            </div>

            <button
                type="button"
                class="admin-laporan-lightbox-close"
                data-laporan-action="close-lightbox"
                aria-label="Tutup preview"
            >
                <i data-lucide="x"></i>
            </button>
            </div>

            <div class="admin-laporan-lightbox-body">
            <img
                id="adminLaporanLightboxImage"
                src=""
                alt="Preview dokumen"
            >
            </div>

        </div>
        </div>





        <!-- TOAST -->
        <div
          class="admin-laporan-toast"
          id="adminLaporanToast"
          role="status"
        ></div>

      </section>
    `;
  },

  // =======================================================
  // TABLE HEADER
  // =======================================================

  renderTableHead(kategori) {
    let columns = ["No", "Tanggal", "NBM", "Nama Guru"];

    if (kategori === "GURU_KELAS") {
      columns.push("Kelas");
    }

    if (kategori === "GURU_MAPEL") {
      columns.push("Kelas", "Mata Pelajaran");
    }

    if (kategori === "GURU_NGAJI") {
      columns.push("Kelompok Ngaji", "Sesi");
    }

    columns.push("Sakit", "Izin", "Alpa", "Aksi");

    return `
      <tr>
        ${columns
          .map(
            (column) => `
          <th>${column}</th>
        `,
          )
          .join("")}
      </tr>
    `;
  },

  // =======================================================
  // INITIALIZE
  // =======================================================

  async init(requestedTab = null) {
    const root = document.getElementById("adminContent");

    if (!root) return;

    this.bindEvents(root);
    this.initialized = true;

    const allowed = ["GURU_KELAS", "GURU_MAPEL", "GURU_NGAJI"];

    const targetTab = allowed.includes(requestedTab)
      ? requestedTab
      : "GURU_KELAS";

    this.changeTab(targetTab);

    await this.loadData();

    console.log("[Admin Laporan] Initialized:", {
      requestedTab,
      activeTab: this.activeTab,
    });
  },

  // =======================================================
  // EVENT HANDLER
  // =======================================================

  bindEvents(root) {
    if (this.boundRoot === root) return;

    this.boundRoot = root;

    root.addEventListener("click", (event) => {
      // TAB KATEGORI
      const tab = event.target.closest("[data-laporan-tab]");

      if (tab) {
        this.changeTab(tab.dataset.laporanTab);
        return;
      }

      // ZOOM PREVIEW
      const zoomButton = event.target.closest("[data-preview-zoom]");

      if (zoomButton) {
        this.updatePreviewZoom(zoomButton.dataset.previewZoom);
        return;
      }

      // PAGINATION
      const pageButton = event.target.closest("[data-laporan-page]");

      if (pageButton) {
        const nextPage = Number(pageButton.dataset.laporanPage);

        if (
          Number.isInteger(nextPage) &&
          nextPage >= 1 &&
          nextPage !== this.page
        ) {
          this.page = nextPage;
          this.renderTable();
        }

        return;
      }

      if (event.target.closest('[data-laporan-action="preview-pdf"]')) {
        this.openPrintPreview();
        return;
      }

      if (event.target.closest('[data-laporan-action="close-print-preview"]')) {
        this.closePrintPreview();
        return;
      }

      if (event.target.closest('[data-laporan-action="print-pdf"]')) {
        this.printPDF();
        return;
      }

      const dataPrintButton = event.target.closest(
        '[data-laporan-action="print-data-pdf"]',
      );

      if (dataPrintButton) {
        this.openDataPrintPreview();
        return;
      }

      // ACTION
      const action = event.target.closest("[data-laporan-action]");

      if (!action) return;

      const type = action.dataset.laporanAction;

      if (type === "refresh") {
        this.loadData();
      }

      if (type === "detail") {
        this.openDetail(action.dataset.id, action.dataset.kategori);
      }

      if (type === "close-detail") {
        this.closeDetail();
      }

      if (type === "open-lightbox") {
        this.openLightbox(action.dataset.url, action.dataset.label);
        return;
      }

      if (type === "close-lightbox") {
        this.closeLightbox();
        return;
      }
    });

    // SEARCH
    root.addEventListener("input", (event) => {
      if (event.target.id === "laporanSearch") {
        this.keyword = event.target.value;
        this.page = 1;

        this.renderTable();
      }
    });

    // FILTER NAMA GURU
    root.addEventListener("change", (event) => {
      if (event.target.id === "laporanFilterGuru") {
        this.selectedGuruNBM = event.target.value;
        this.page = 1;

        this.renderTable();
      }
    });

    // ESCAPE

    root.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        this.closeLightbox();
        this.closeDetail();
      }
    });
  },

  // =======================================================
  // LOAD DATA
  // =======================================================

  async loadData() {
    if (this.loading) return;

    this.page = 1;

    this.loading = true;

    this.setLoading(true);

    try {
      const [data, statistics] = await Promise.all([
        LaporanService.getAll(),

        LaporanService.getStatistics(),
      ]);

      this.data.all = data;

      this.data.guruKelas = data.filter(
        (item) => item.KATEGORI === "GURU_KELAS",
      );

      this.data.guruMapel = data.filter(
        (item) => item.KATEGORI === "GURU_MAPEL",
      );

      this.data.guruNgaji = data.filter(
        (item) => item.KATEGORI === "GURU_NGAJI",
      );

      this.data.statistics = statistics;

      this.updateStatistics();
      this.updateGuruFilterOptions();

      this.renderTable();
    } catch (error) {
      console.error("[Admin Laporan]", error);

      this.showTableError(error.message || "Gagal mengambil data laporan.");

      this.showToast(error.message || "Gagal mengambil data laporan.", "error");
    } finally {
      this.loading = false;

      this.setLoading(false);
    }
  },

  // =======================================================
  // LOADING
  // =======================================================

  setLoading(loading) {
    const button = document.querySelector(
      '#adminContent [data-laporan-action="refresh"]',
    );

    if (!button) return;

    button.disabled = loading;

    button.classList.toggle("loading", loading);
  },

  // =======================================================
  // STATISTIK
  // =======================================================

  updateStatistics() {
    const stats = this.data.statistics;

    this.setText("laporanStatTotal", stats.total);
    this.setText("laporanStatKelas", stats.guruKelas);
    this.setText("laporanStatMapel", stats.guruMapel);
    this.setText("laporanStatNgaji", stats.guruNgaji);

    this.setText("laporanCountKelas", this.data.guruKelas.length);
    this.setText("laporanCountMapel", this.data.guruMapel.length);
    this.setText("laporanCountNgaji", this.data.guruNgaji.length);
  },

  // =======================================================
  // CHANGE TAB
  // =======================================================

  changeTab(kategori) {
    const allowed = ["GURU_KELAS", "GURU_MAPEL", "GURU_NGAJI"];

    if (!allowed.includes(kategori)) return;

    this.activeTab = kategori;
    this.page = 1;

    this.selectedGuruNBM = "";

    this.keyword = "";

    const search = document.getElementById("laporanSearch");

    if (search) search.value = "";

    document
      .querySelectorAll("#adminContent [data-laporan-tab]")
      .forEach((tab) => {
        const active = tab.dataset.laporanTab === kategori;

        tab.classList.toggle("active", active);

        tab.setAttribute("aria-selected", active ? "true" : "false");
      });

    const title = {
      GURU_KELAS: "Laporan Guru Kelas",
      GURU_MAPEL: "Laporan Guru Mapel",
      GURU_NGAJI: "Laporan Guru Ngaji",
    };

    const description = {
      GURU_KELAS: "Daftar laporan kegiatan Guru Kelas.",
      GURU_MAPEL: "Daftar laporan kegiatan Guru Mapel.",
      GURU_NGAJI: "Daftar laporan kegiatan Guru Ngaji.",
    };

    this.setText("laporanTableTitle", title[kategori]);

    this.setText("laporanTableDescription", description[kategori]);

    const head = document.getElementById("laporanTableHead");

    if (head) {
      head.innerHTML = this.renderTableHead(kategori);
    }

    const searchInput = document.getElementById("laporanSearch");

    if (searchInput) {
      const placeholders = {
        GURU_KELAS: "Cari NBM, nama guru, kelas...",
        GURU_MAPEL: "Cari NBM, nama guru, mapel...",
        GURU_NGAJI: "Cari NBM, nama guru, kelompok...",
      };

      searchInput.placeholder = placeholders[kategori];
    }

    const guruFilter = document.getElementById("laporanFilterGuru");

    if (guruFilter) {
      guruFilter.value = "";
    }

    this.updateGuruFilterOptions();

    this.renderTable();

    this.refreshIcons();
  },

  // =======================================================
  // GET ACTIVE DATA
  // =======================================================

  getActiveData() {
    const source = {
      GURU_KELAS: this.data.guruKelas,
      GURU_MAPEL: this.data.guruMapel,
      GURU_NGAJI: this.data.guruNgaji,
    };

    return source[this.activeTab] || [];
  },

  // =======================================================
  // FILTER NAMA GURU
  // =======================================================

  updateGuruFilterOptions() {
    const select = document.getElementById("laporanFilterGuru");

    if (!select) return;

    const guruMap = new Map();

    this.getActiveData().forEach((item) => {
      const nbm = String(item.NBM || "").trim();
      const nama = String(item.NAMA_GURU || "").trim();

      if (!nbm) return;

      if (!guruMap.has(nbm)) {
        guruMap.set(nbm, nama || nbm);
      }
    });

    const daftarGuru = [...guruMap.entries()].sort((a, b) =>
      a[1].localeCompare(b[1], "id"),
    );

    select.innerHTML = `
    <option value="">Semua Guru</option>

    ${daftarGuru
      .map(
        ([nbm, nama]) => `
      <option value="${this.escapeHTML(nbm)}">
        ${this.escapeHTML(nama)}
      </option>
    `,
      )
      .join("")}
  `;

    // Pertahankan pilihan selama guru masih tersedia
    if (guruMap.has(this.selectedGuruNBM)) {
      select.value = this.selectedGuruNBM;
    } else {
      this.selectedGuruNBM = "";
      select.value = "";
    }
  },

  // =======================================================
  // RENDER TABLE
  // =======================================================

  renderTable() {
    const body = document.getElementById("laporanTableBody");

    if (!body) return;

    // 1. Ambil data kategori aktif
    let source = this.getActiveData();

    // 2. Filter nama guru
    if (this.selectedGuruNBM) {
      source = source.filter(
        (item) => String(item.NBM || "").trim() === this.selectedGuruNBM,
      );
    }

    // 3. Filter pencarian
    const data = LaporanService.search(source, this.keyword);

    // 4. Hitung pagination
    const totalData = data.length;
    const totalPages = Math.max(1, Math.ceil(totalData / this.pageSize));

    // Pastikan halaman tidak melebihi jumlah halaman
    this.page = Math.min(this.page, totalPages);
    this.page = Math.max(1, this.page);

    const startIndex = (this.page - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, totalData);

    const pageData = data.slice(startIndex, endIndex);

    // 5. Kondisi data kosong
    if (!totalData) {
      body.innerHTML = `
      <tr>
        <td
          colspan="${this.getColumnCount()}"
          class="admin-laporan-empty"
        >
          <i data-lucide="file-search"></i>
          <strong>Tidak ada laporan</strong>
          <span>
            Belum ada data laporan atau pencarian tidak ditemukan.
          </span>
        </td>
      </tr>
    `;

      this.setText("laporanTableInfo", "Menampilkan 0 laporan");
      this.renderPagination(0);

      this.refreshIcons();
      return;
    }

    // 6. Render data halaman aktif
    body.innerHTML = pageData
      .map((item, index) => {
        const attendance = LaporanService.formatAttendance(item);

        let extraColumns = "";

        if (this.activeTab === "GURU_KELAS") {
          extraColumns = `
          <td>${this.escapeHTML(item.NAMA_KELAS || "-")}</td>
        `;
        }

        if (this.activeTab === "GURU_MAPEL") {
          extraColumns = `
          <td>${this.escapeHTML(item.NAMA_KELAS || "-")}</td>
          <td>${this.escapeHTML(item.NAMA_MAPEL || "-")}</td>
        `;
        }

        if (this.activeTab === "GURU_NGAJI") {
          extraColumns = `
          <td>${this.escapeHTML(item.NAMA_KELOMPOK || "-")}</td>
          <td>${this.escapeHTML(item.NAMA_SESI || "-")}</td>
        `;
        }

        return `
        <tr>
          <td>${startIndex + index + 1}</td>

          <td>
            ${this.escapeHTML(LaporanService.formatDate(item.TANGGAL_LAPORAN))}
          </td>

          <td>
            <span class="admin-laporan-nbm">
              ${this.escapeHTML(item.NBM || "-")}
            </span>
          </td>

          <td>
            <strong>
              ${this.escapeHTML(item.NAMA_GURU || "-")}
            </strong>
          </td>

          ${extraColumns}

          <td>${attendance.sakit}</td>
          <td>${attendance.izin}</td>
          <td>${attendance.alpa}</td>

          <td>
            <button
              type="button"
              class="admin-laporan-action-btn"
              data-laporan-action="detail"
              data-id="${this.escapeHTML(item.ID_LAPORAN)}"
              data-kategori="${this.activeTab}"
              title="Lihat detail laporan"
            >
              <i data-lucide="eye"></i>
              Detail
            </button>
          </td>
        </tr>
      `;
      })
      .join("");

    // 7. Informasi jumlah data
    this.setText(
      "laporanTableInfo",
      `Menampilkan ${startIndex + 1}–${endIndex} dari ${totalData} laporan`,
    );

    // 8. Render navigasi halaman
    this.renderPagination(totalPages);

    this.refreshIcons();
  },

  renderPagination(totalPages) {
    const container = document.getElementById("laporanPagination");

    if (!container) return;

    if (!totalPages || totalPages <= 1) {
      container.innerHTML = "";
      return;
    }

    const buttons = [];

    // Tombol sebelumnya
    buttons.push(`
    <button
      type="button"
      class="admin-laporan-page-btn"
      data-laporan-page="${this.page - 1}"
      ${this.page === 1 ? "disabled" : ""}
      aria-label="Halaman sebelumnya"
    >
      <i data-lucide="chevron-left"></i>
    </button>
  `);

    // Maksimal 5 nomor halaman yang ditampilkan
    let startPage = Math.max(1, this.page - 2);
    let endPage = Math.min(totalPages, startPage + 4);

    startPage = Math.max(1, endPage - 4);

    if (startPage > 1) {
      buttons.push(`
      <button
        type="button"
        class="admin-laporan-page-btn"
        data-laporan-page="1"
      >1</button>
    `);

      if (startPage > 2) {
        buttons.push(`<span class="admin-laporan-page-dots">...</span>`);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(`
      <button
        type="button"
        class="admin-laporan-page-btn ${i === this.page ? "active" : ""}"
        data-laporan-page="${i}"
        ${i === this.page ? 'aria-current="page"' : ""}
      >${i}</button>
    `);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(`<span class="admin-laporan-page-dots">...</span>`);
      }

      buttons.push(`
      <button
        type="button"
        class="admin-laporan-page-btn"
        data-laporan-page="${totalPages}"
      >${totalPages}</button>
    `);
    }

    // Tombol berikutnya
    buttons.push(`
    <button
      type="button"
      class="admin-laporan-page-btn"
      data-laporan-page="${this.page + 1}"
      ${this.page === totalPages ? "disabled" : ""}
      aria-label="Halaman berikutnya"
    >
      <i data-lucide="chevron-right"></i>
    </button>
  `);

    container.innerHTML = buttons.join("");
  },

  getColumnCount() {
    const counts = {
      GURU_KELAS: 9,
      GURU_MAPEL: 10,
      GURU_NGAJI: 10,
    };

    return counts[this.activeTab] || 9;
  },

  // =======================================================
  // DETAIL LAPORAN
  // =======================================================

  async openDetail(idLaporan, kategori) {
    if (!idLaporan || !kategori) return;

    const modal = document.getElementById("adminLaporanModal");

    const content = document.getElementById("adminLaporanDetail");

    if (!modal || !content) return;

    modal.classList.add("show");

    modal.setAttribute("aria-hidden", "false");

    content.innerHTML = `
      <div class="admin-laporan-detail-loading">
        <i data-lucide="loader-circle"></i>
        Memuat detail laporan...
      </div>
    `;

    this.refreshIcons();

    try {
      const data = await LaporanService.getDetail(idLaporan, kategori);

      content.innerHTML = this.renderDetail(data, kategori);

      this.refreshIcons();
    } catch (error) {
      content.innerHTML = `
        <div class="admin-laporan-detail-error">
          ${this.escapeHTML(error.message || "Gagal mengambil detail laporan.")}
        </div>
      `;
    }
  },

  openLightbox(url, label) {
    if (!url) return;

    const lightbox = document.getElementById("adminLaporanLightbox");

    const image = document.getElementById("adminLaporanLightboxImage");

    const title = document.getElementById("adminLaporanLightboxTitle");

    if (!lightbox || !image || !title) return;

    title.textContent = label || "Dokumen Pendukung";

    image.src = url;
    image.alt = label || "Preview dokumen";

    lightbox.classList.add("show");
    lightbox.setAttribute("aria-hidden", "false");

    document.body.classList.add("admin-laporan-lightbox-open");

    this.refreshIcons();
  },

  closeLightbox() {
    const lightbox = document.getElementById("adminLaporanLightbox");

    const image = document.getElementById("adminLaporanLightboxImage");

    if (!lightbox) return;

    lightbox.classList.remove("show");
    lightbox.setAttribute("aria-hidden", "true");

    document.body.classList.remove("admin-laporan-lightbox-open");

    if (image) {
      image.removeAttribute("src");
    }
  },

  // =======================================================
  // DETAIL CONTENT
  // =======================================================

  renderDetail(data, kategori) {
    const common = [
      ["Nomor NBM", data.NBM],
      ["Nama Guru", data.NAMA_GURU],
      ["Tanggal Laporan", LaporanService.formatDate(data.TANGGAL_LAPORAN)],
    ];

    let specific = [];

    if (kategori === "GURU_KELAS") {
      specific = [
        ["Kelas", data.NAMA_KELAS],
        ["Hadits & Doa", data.HADITS_DOA],
        ["Pendidikan Adab", data.PENDIDIKAN_ADAB],
        ["Ringkasan Pembelajaran", data.RINGKASAN_PEMBELAJARAN],
      ];
    }

    if (kategori === "GURU_MAPEL") {
      specific = [
        ["Kelas", data.NAMA_KELAS],
        ["Mata Pelajaran", data.NAMA_MAPEL],
        ["Ringkasan Pembelajaran", data.RINGKASAN_PEMBELAJARAN],
      ];
    }

    if (kategori === "GURU_NGAJI") {
      specific = [
        ["Kelompok Ngaji", data.NAMA_KELOMPOK],
        ["Sesi", data.NAMA_SESI],
        ["Halaman Surah", data.HALAMAN_SURAH],
        ["Hafalan", data.HAFALAN],
        ["Catatan", data.CATATAN],
      ];
    }

    const attendance = [
      ["Sakit", data.SAKIT],
      ["Izin", data.IZIN],
      ["Alpa", data.ALPA],
    ];

    const notes = [
      ["Kendala", data.KENDALA],
      ["Solusi", data.SOLUSI],
    ];

    const files = [
      ["Modul Ajar", data.MODUL_AJAR],
      ["Asesmen", data.ASESMEN],
      ["Dokumentasi", data.DOKUMENTASI],
    ];

    return `

      <div class="admin-laporan-detail-section">

        <h3>Informasi Guru</h3>

        ${this.renderDetailRows(common)}

      </div>


      <div class="admin-laporan-detail-section">

        <h3>Informasi Laporan</h3>

        ${this.renderDetailRows(specific)}

      </div>


      <div class="admin-laporan-detail-section">

        <h3>Rekap Kehadiran</h3>

        <div class="admin-laporan-attendance">

          ${attendance
            .map(
              ([label, value]) => `
            <div>
              <span>${label}</span>
              <strong>${Number(value) || 0}</strong>
            </div>
          `,
            )
            .join("")}

        </div>

      </div>


      <div class="admin-laporan-detail-section">

        <h3>Kendala dan Solusi</h3>

        ${this.renderDetailRows(notes)}

      </div>


      
        <div class="admin-laporan-detail-section">

        <h3>Dokumen Pendukung</h3>

        <div class="admin-laporan-files">
            ${files
              .map(([label, value]) => this.renderFileLink(label, value))
              .filter(Boolean)
              .join("")}
        </div>

        </div>


    `;
  },

  renderDetailRows(rows) {
    return rows
      .map(([label, value]) => {
        if (value === undefined || value === null || value === "") {
          return "";
        }

        return `
        <div class="admin-laporan-detail-row">

          <span>${this.escapeHTML(label)}</span>

          <p>${this.escapeHTML(value)}</p>

        </div>
      `;
      })
      .join("");
  },

  // =======================================================
  // FILE LINK
  // =======================================================

  renderFileLink(label, value) {
    const url = this.normalizeUrl(value);
    const previewUrl = this.getImageThumbnail(value);

    if (!url || !previewUrl) return "";

    return `
    <div class="admin-laporan-file-preview">

      <div class="admin-laporan-file-preview-header">
        <span>${this.escapeHTML(label)}</span>

        <a
          href="${this.escapeHTML(url)}"
          target="_blank"
          rel="noopener noreferrer"
          class="admin-laporan-file-open"
        >
          <i data-lucide="external-link"></i>
          Buka Asli
        </a>
      </div>

      <button
        type="button"
        class="admin-laporan-file-image-link"
        data-laporan-action="open-lightbox"
        data-url="${this.escapeHTML(previewUrl)}"
        data-label="${this.escapeHTML(label)}"
        aria-label="Perbesar ${this.escapeHTML(label)}"
      >
        <img
          src="${this.escapeHTML(previewUrl)}"
          alt="${this.escapeHTML(label)}"
          loading="lazy"
          onerror="
            this.parentElement.classList.add('image-error');
            this.style.display='none';
          "
        >

        <span class="admin-laporan-file-image-error">
          <i data-lucide="image-off"></i>
          Gambar tidak dapat ditampilkan
        </span>

        <span class="admin-laporan-file-zoom">
          <i data-lucide="zoom-in"></i>
          Perbesar
        </span>
      </button>

    </div>
  `;
  },

  renderPrintPreview(data) {
    const categoryNames = {
      GURU_KELAS: "Guru Kelas",
      GURU_MAPEL: "Guru Mata Pelajaran",
      GURU_NGAJI: "Guru Ngaji",
    };

    const kategori = this.activeTab;
    const namaKategori = categoryNames[kategori] || "Laporan Guru";

    const namaGuru = this.selectedGuruNBM
      ? data[0]?.NAMA_GURU || "Guru"
      : "Semua Guru";

    const tanggalCetak = new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date());

    const laporanHTML = data
      .map((item, index) => {
        let specific = [];

        if (kategori === "GURU_KELAS") {
          specific = [
            ["Kelas", item.NAMA_KELAS],
            ["Hadits & Doa", item.HADITS_DOA],
            ["Pendidikan Adab", item.PENDIDIKAN_ADAB],
            ["Ringkasan Pembelajaran", item.RINGKASAN_PEMBELAJARAN],
          ];
        } else if (kategori === "GURU_MAPEL") {
          specific = [
            ["Kelas", item.NAMA_KELAS],
            ["Mata Pelajaran", item.NAMA_MAPEL],
            ["Ringkasan Pembelajaran", item.RINGKASAN_PEMBELAJARAN],
          ];
        } else if (kategori === "GURU_NGAJI") {
          specific = [
            ["Kelompok Ngaji", item.NAMA_KELOMPOK],
            ["Sesi", item.NAMA_SESI],
            ["Halaman Surah", item.HALAMAN_SURAH],
            ["Hafalan", item.HAFALAN],
            ["Catatan", item.CATATAN],
          ];
        }

        const attendance = [
          ["Sakit", item.SAKIT],
          ["Izin", item.IZIN],
          ["Alpa", item.ALPA],
        ];

        const notes = [
          ["Kendala", item.KENDALA],
          ["Solusi", item.SOLUSI],
        ];

        const files = [
          ["Modul Ajar", item.MODUL_AJAR],
          ["Asesmen", item.ASESMEN],
          ["Dokumentasi", item.DOKUMENTASI],
        ];

        return `
      <article class="print-report-item">

        <div class="print-report-heading">
          <div>
            <span class="print-report-number">
              LAPORAN ${index + 1}
            </span>

            <h2>${this.escapeHTML(namaKategori)}</h2>
          </div>

          <strong>
            ${this.escapeHTML(LaporanService.formatDate(item.TANGGAL_LAPORAN))}
          </strong>
        </div>

        <section class="print-report-section">
          <h3>Informasi Guru</h3>

          ${this.renderPrintRows([
            ["Nomor NBM", item.NBM],
            ["Nama Guru", item.NAMA_GURU],
            [
              "Tanggal Laporan",
              LaporanService.formatDate(item.TANGGAL_LAPORAN),
            ],
          ])}
        </section>

        <section class="print-report-section">
          <h3>Informasi Kegiatan</h3>
          ${this.renderPrintRows(specific)}
        </section>

        <section class="print-report-section">
          <h3>Rekap Kehadiran</h3>

          <div class="print-report-attendance">
            ${attendance
              .map(
                ([label, value]) => `
              <div>
                <span>${this.escapeHTML(label)}</span>
                <strong>${Number(value) || 0}</strong>
              </div>
            `,
              )
              .join("")}
          </div>
        </section>

        <section class="print-report-section">
          <h3>Kendala dan Solusi</h3>
          ${this.renderPrintRows(notes)}
        </section>

        <section class="print-report-section">
          <h3>Dokumen Pendukung</h3>

          <div class="print-report-images">
            ${files
              .map(([label, value]) => {
                if (!value) return "";

                // Menggunakan helper thumbnail yang sudah ada
                const url = this.getImageThumbnail(value);

                if (!url) return "";

                return `
                <div class="print-report-image">
                  <h4>${this.escapeHTML(label)}</h4>

                  <img
                    src="${this.escapeHTML(url)}"
                    alt="${this.escapeHTML(label)}"
                  >
                </div>
              `;
              })
              .join("")}
          </div>
        </section>

      </article>
    `;
      })
      .join("");

    return `
    <div class="print-document">

      <header class="print-document-header">
        <div class="print-document-brand">TEACHLY</div>

        <h1>LAPORAN KEGIATAN GURU</h1>

        <h2>${this.escapeHTML(namaKategori)}</h2>

        <div class="print-document-meta">
          <span>Guru: ${this.escapeHTML(namaGuru)}</span>
          <span>Jumlah laporan: ${data.length}</span>
          <span>Tanggal cetak: ${tanggalCetak}</span>
        </div>
      </header>

      ${laporanHTML}

      <footer class="print-document-footer">
        Teachly - Sistem Manajemen Pembelajaran
      </footer>

    </div>
  `;
  },

  renderDataPrintPreview(data) {
    if (!Array.isArray(data) || !data.length) {
      return `<div class="print-empty">Tidak ada data laporan.</div>`;
    }

    const kategori = this.activeTab;

    const categoryNames = {
      GURU_KELAS: "Guru Kelas",
      GURU_MAPEL: "Guru Mata Pelajaran",
      GURU_NGAJI: "Guru Ngaji",
    };

    // Mengganti ID referensi dengan nama tampilan.
    const referenceMap = {
      ID_KELAS: "NAMA_KELAS",
      ID_MAPEL: "NAMA_MAPEL",
      ID_KELOMPOK: "NAMA_KELOMPOK",
      ID_SESI: "NAMA_SESI",
    };

    // Field internal yang tidak ditampilkan.
    const excludedFields = [
      "KATEGORI",
      "NAMA_KATEGORI",
      "MODUL_AJAR",
      "ASESMEN",
      "DOKUMENTASI",
    ];

    const originalFields = Object.keys(data[0]);
    const columns = [];

    originalFields.forEach((field) => {
      // Lewati seluruh field yang tidak perlu ditampilkan.
      if (excludedFields.includes(field)) return;

      // Ganti ID referensi dengan nama tampilannya.
      if (referenceMap[field]) {
        const displayField = referenceMap[field];

        if (
          data.some((item) => item[displayField] !== undefined) &&
          !columns.some((col) => col.key === displayField)
        ) {
          columns.push({
            key: displayField,
            label: displayField,
          });
        }

        return;
      }

      // Hindari kolom duplikat.
      if (!columns.some((col) => col.key === field)) {
        columns.push({
          key: field,
          label: field,
        });
      }
    });

    // Pastikan nama guru tersedia.
    if (
      data.some((item) => item.NAMA_GURU !== undefined) &&
      !columns.some((col) => col.key === "NAMA_GURU")
    ) {
      const nbmIndex = columns.findIndex((col) => col.key === "NBM");

      columns.splice(nbmIndex >= 0 ? nbmIndex + 1 : columns.length, 0, {
        key: "NAMA_GURU",
        label: "NAMA_GURU",
      });
    }

    // HEADER TABEL
    const headers = columns
      .map(
        (column) => `
        <th>${this.escapeHTML(column.label)}</th>
      `,
      )
      .join("");

    // ISI TABEL
    const rows = data
      .map((item) => {
        const cells = columns
          .map((column) => {
            const value = item[column.key];

            return `
            <td>${this.escapeHTML(
              value === undefined || value === null ? "" : value,
            )}</td>
          `;
          })
          .join("");

        return `<tr>${cells}</tr>`;
      })
      .join("");

    const namaGuru = this.selectedGuruNBM
      ? data[0].NAMA_GURU || "Guru"
      : "Semua Guru";

    const tanggalCetak = new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date());

    return `
    <div class="data-print-document">

      <header class="data-print-heading">
        <h1>DATA LAPORAN GURU</h1>

        <h2>
          ${this.escapeHTML(categoryNames[kategori] || "Laporan Guru")}
        </h2>

        <p>
          Guru: ${this.escapeHTML(namaGuru)}
          &nbsp; | &nbsp;
          Jumlah Data: ${data.length}
          &nbsp; | &nbsp;
          Tanggal Cetak: ${tanggalCetak}
        </p>
      </header>

      <div class="data-print-table-wrap">

        <table class="data-print-table">

          <thead>
            <tr>
              ${headers}
            </tr>
          </thead>

          <tbody>
            ${rows}
          </tbody>

        </table>

      </div>

    </div>
  `;
  },

  openPrintPreview() {
    const modal = document.getElementById("adminLaporanPrintModal");
    const body = document.getElementById("adminLaporanPrintBody");

    if (!modal || !body) return;

    // Ambil SEMUA hasil filter, tidak terpengaruh pagination
    const data = this.getFilteredData();

    if (!data.length) {
      this.showToast("Tidak ada laporan untuk dicetak.", "error");
      return;
    }

    body.innerHTML = this.renderPrintPreview(data);

    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");

    document.body.classList.add("admin-laporan-print-open");

    this.refreshIcons();
  },

  closePrintPreview() {
    const modal = document.getElementById("adminLaporanPrintModal");

    if (!modal) return;

    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");

    document.body.classList.remove("admin-laporan-print-open");
    document.body.classList.remove("admin-laporan-data-print");
  },

  renderPrintRows(rows) {
    return rows
      .map(([label, value]) => {
        if (
          value === undefined ||
          value === null ||
          String(value).trim() === ""
        ) {
          return "";
        }

        return `
      <div class="print-report-row">
        <strong>${this.escapeHTML(label)}</strong>
        <span>${this.escapeHTML(value)}</span>
      </div>
    `;
      })
      .join("");
  },

  openDataPrintPreview() {
    const modal = document.getElementById("adminLaporanPrintModal");
    const body = document.getElementById("adminLaporanPrintBody");

    if (!modal || !body) return;

    const data = this.getFilteredData();

    if (!data.length) {
      this.showToast("Tidak ada data untuk dicetak.", "error");
      return;
    }

    body.innerHTML = this.renderDataPrintPreview(data);

    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");

    document.body.classList.add("admin-laporan-print-open");
    document.body.classList.add("admin-laporan-data-print");

    this.refreshIcons();
  },

  normalizeUrl(value) {
    let url = String(value || "").trim();

    if (!url) return "";

    // Mendukung nilai URL yang tersimpan dalam format Markdown.
    const markdownMatch = url.match(/^\[.*?\]\((https?:\/\/[^)]+)\)$/);

    if (markdownMatch) {
      url = markdownMatch[1];
    }

    try {
      const parsed = new URL(url);

      if (!["https:", "http:"].includes(parsed.protocol)) {
        return "";
      }

      return parsed.href;
    } catch (error) {
      return "";
    }
  },

  async printPDF() {
    const content = document.getElementById("adminLaporanPrintBody");

    if (!content) return;

    const button = document.querySelector('[data-laporan-action="print-pdf"]');

    if (button) button.disabled = true;

    try {
      const images = [...content.querySelectorAll("img")];

      await Promise.all(
        images.map((img) => {
          if (img.complete && img.naturalWidth > 0) {
            return Promise.resolve();
          }

          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        }),
      );

      window.print();
    } catch (error) {
      console.error("Gagal menyiapkan cetak PDF:", error);
      this.showToast("Gagal menyiapkan dokumen cetak.", "error");
    } finally {
      if (button) button.disabled = false;
    }
  },

  async printPDF() {
    const content = document.getElementById("adminLaporanPrintBody");

    if (!content) return;

    const button = document.querySelector('[data-laporan-action="print-pdf"]');

    if (button) button.disabled = true;

    try {
      const images = [...content.querySelectorAll("img")];

      await Promise.all(
        images.map((img) => {
          if (img.complete && img.naturalWidth > 0) {
            return Promise.resolve();
          }

          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        }),
      );

      window.print();
    } catch (error) {
      console.error("Gagal menyiapkan cetak PDF:", error);
      this.showToast("Gagal menyiapkan dokumen cetak.", "error");
    } finally {
      if (button) button.disabled = false;
    }
  },

  // =======================================================
  // CLOSE DETAIL
  // =======================================================

  closeDetail() {
    const modal = document.getElementById("adminLaporanModal");

    if (!modal) return;

    modal.classList.remove("show");

    modal.setAttribute("aria-hidden", "true");
  },

  // =======================================================
  // ERROR TABLE
  // =======================================================

  showTableError(message) {
    const body = document.getElementById("laporanTableBody");

    if (!body) return;

    body.innerHTML = `
      <tr>
        <td
          colspan="${this.getColumnCount()}"
          class="admin-laporan-empty admin-laporan-error"
        >
          <i data-lucide="alert-circle"></i>

          <strong>Gagal memuat laporan</strong>

          <span>${this.escapeHTML(message)}</span>

          <button
            type="button"
            data-laporan-action="refresh"
          >
            Coba Lagi
          </button>
        </td>
      </tr>
    `;

    this.refreshIcons();
  },

  // =======================================================
  // TOAST
  // =======================================================

  showToast(message, type = "success") {
    const toast = document.getElementById("adminLaporanToast");

    if (!toast) return;

    toast.textContent = message;

    toast.className = `admin-laporan-toast ${type} show`;

    clearTimeout(this.toastTimer);

    this.toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  },

  // =======================================================
  // HELPERS
  // =======================================================

  setText(id, value) {
    const element = document.getElementById(id);

    if (element) {
      element.textContent = value ?? "";
    }
  },

  escapeHTML(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  },

  refreshIcons() {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  getImageThumbnail(value) {
    const url = this.normalizeUrl(value);

    if (!url) return "";

    try {
      const parsed = new URL(url);

      if (
        parsed.hostname === "drive.google.com" ||
        parsed.hostname === "www.drive.google.com"
      ) {
        let fileId = parsed.searchParams.get("id");

        if (!fileId) {
          const match = parsed.pathname.match(/\/file\/d\/([^/]+)/);

          if (match) fileId = match[1];
        }

        if (fileId) {
          return `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=w1200`;
        }
      }

      return url;
    } catch (error) {
      return "";
    }
  },
};
