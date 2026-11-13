/* =========================================
   TEACHLY - ADMIN TAHUN AJARAN
   QEDEV FRONTEND STANDARD
========================================= */

const TahunAjaran = {
  data: [],
  filteredData: [],

  initialized: false,
  loading: false,
  saving: false,

  boundRoot: null,
  formMode: "create",
  editingId: null,
  toastTimer: null,

  /* =====================================
     RENDER PAGE
  ===================================== */

  render() {
    return `
      <section class="admin-guru-page">

        <div class="admin-guru-toolbar">

          <div class="admin-guru-toolbar-left">
            <div class="admin-guru-search">
              <i data-lucide="search"></i>
              <input
                type="search"
                id="tahunAjaranSearch"
                placeholder="Cari tahun ajaran..."
                autocomplete="off"
              >
            </div>
          </div>

          <div class="admin-guru-toolbar-right">

            <button
              type="button"
              class="admin-guru-btn admin-guru-btn-secondary"
              data-tahun-action="refresh"
            >
              <i data-lucide="refresh-cw"></i>
              <span>Refresh</span>
            </button>

            <button
              type="button"
              class="admin-guru-btn admin-guru-btn-secondary"
              data-tahun-action="print"
            >
              <i data-lucide="printer"></i>
              <span>Cetak PDF</span>
            </button>

            <button
              type="button"
              class="admin-guru-btn admin-guru-btn-primary"
              data-tahun-action="create"
            >
              <i data-lucide="plus"></i>
              <span>Tambah Tahun Ajaran</span>
            </button>

          </div>
        </div>

        <div class="admin-guru-summary" id="tahunAjaranSummary">
          ${this.renderSummary()}
        </div>

        <div class="admin-guru-table-card">

          <div class="admin-guru-table-header">
            <div>
              <h3>Daftar Tahun Ajaran</h3>
              <p>
                Kelola periode akademik sekolah.
                Hanya satu tahun ajaran yang dapat aktif.
              </p>
            </div>
          </div>

          <div
            class="admin-guru-table-wrapper"
            id="tahunAjaranTable"
          >
            ${this.renderLoading()}
          </div>

        </div>

        <div id="tahunAjaranModal"></div>
        <div id="tahunAjaranToast"></div>

      </section>
    `;
  },

  /* =====================================
     INIT
  ===================================== */

  init() {
    const root = document.getElementById("adminContent");

    if (!root) return;

    if (this.boundRoot !== root) {
      this.bindEvents(root);
      this.boundRoot = root;
    }

    this.initialized = true;
    this.loading = false;
    this.saving = false;
    this.formMode = "create";
    this.editingId = null;

    this.loadData();
  },

  /* =====================================
     BIND EVENTS
  ===================================== */

  bindEvents(root) {
    root.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-tahun-action]");

      if (!button || !root.contains(button)) {
        return;
      }

      // Jangan merespons halaman lain.
      if (
        !button.closest(".admin-guru-page") ||
        !document.getElementById("tahunAjaranTable")
      ) {
        return;
      }

      const action = button.dataset.tahunAction;
      const id = button.dataset.id || "";

      switch (action) {
        case "refresh":
          await this.loadData();
          break;

        case "print":
          this.exportPDF();
          break;

        case "create":
          this.openModal();
          break;

        case "edit":
          this.edit(id);
          break;

        case "activate":
          await this.activate(id);
          break;

        case "close-modal":
          this.closeModal();
          break;

        case "save":
          await this.submitForm();
          break;
      }
    });

    root.addEventListener("input", (event) => {
      if (event.target.id === "tahunAjaranSearch") {
        this.search(event.target.value);
      }
    });

    root.addEventListener("submit", async (event) => {
      if (event.target.id !== "tahunAjaranForm") {
        return;
      }

      event.preventDefault();
      await this.submitForm();
    });

    root.addEventListener("click", (event) => {
      if (event.target.id === "tahunAjaranModalBackdrop") {
        this.closeModal();
      }
    });
  },

  /* =====================================
     LOAD DATA
  ===================================== */

  async loadData() {
    if (this.loading) return;

    this.loading = true;

    const table = document.getElementById("tahunAjaranTable");

    if (table) {
      table.innerHTML = this.renderLoading();
    }

    try {
      const rows = await TahunAjaranAdminService.getAll();

      // Abaikan hasil jika halaman sudah berganti.
      if (!document.getElementById("tahunAjaranTable")) {
        return;
      }

      this.data = rows;

      const searchInput = document.getElementById("tahunAjaranSearch");

      this.search(searchInput?.value || "");
    } catch (error) {
      console.error("[TAHUN AJARAN] Gagal memuat data:", error);

      if (document.getElementById("tahunAjaranTable")) {
        this.renderError(error.message || "Gagal memuat data tahun ajaran.");
      }
    } finally {
      this.loading = false;
    }
  },

  /* =====================================
     SEARCH
  ===================================== */

  search(keyword = "") {
    const query = String(keyword).trim().toLowerCase();

    this.filteredData = this.data.filter((item) => {
      const id = String(item.ID_TAHUN_AJARAN || "").toLowerCase();

      const nama = String(item.NAMA_TAHUN_AJARAN || "").toLowerCase();

      const status = String(item.STATUS_TAHUN_AJARAN || "").toLowerCase();

      return (
        id.includes(query) || nama.includes(query) || status.includes(query)
      );
    });

    this.renderTable();
    this.updateSummary();
  },

  /* =====================================
     RENDER SUMMARY
  ===================================== */

  renderSummary() {
    const total = this.data.length;

    const active = this.data.filter(
      (item) => this.normalizeStatus(item.STATUS_TAHUN_AJARAN) === "AKTIF",
    );

    const nonActive = this.data.filter(
      (item) => this.normalizeStatus(item.STATUS_TAHUN_AJARAN) === "NONAKTIF",
    );

    const activeName =
      active.length === 1
        ? active[0].NAMA_TAHUN_AJARAN
        : active.length === 0
          ? "Belum ada"
          : "Status tidak valid";

    return `
      <div class="admin-guru-stat">
        <span>Total Tahun Ajaran</span>
        <strong>${total}</strong>
      </div>

      <div class="admin-guru-stat">
        <span>Tahun Ajaran Aktif</span>
        <strong>
          ${this.escapeHTML(activeName)}
        </strong>
      </div>

      <div class="admin-guru-stat">
        <span>Nonaktif</span>
        <strong>${nonActive.length}</strong>
      </div>
    `;
  },

  updateSummary() {
    const element = document.getElementById("tahunAjaranSummary");

    if (element) {
      element.innerHTML = this.renderSummary();
    }
  },

  /* =====================================
     RENDER TABLE
  ===================================== */

  renderTable() {
    const container = document.getElementById("tahunAjaranTable");

    if (!container) return;

    if (!this.filteredData.length) {
      container.innerHTML = `
        <div class="admin-guru-empty">
          <i data-lucide="calendar-x"></i>
          <h4>Tidak ada data tahun ajaran</h4>
          <p>
            Data tidak ditemukan atau belum tersedia.
          </p>
        </div>
      `;

      this.refreshIcons();
      return;
    }

    const activeCount = this.data.filter(
      (item) => this.normalizeStatus(item.STATUS_TAHUN_AJARAN) === "AKTIF",
    ).length;

    const rows = this.filteredData
      .map((item, index) => {
        const id = String(item.ID_TAHUN_AJARAN || "");

        const nama = String(item.NAMA_TAHUN_AJARAN || "");

        const status = this.normalizeStatus(item.STATUS_TAHUN_AJARAN);

        const isActive = status === "AKTIF";

        const badgeClass = isActive
          ? "admin-guru-status-active"
          : "admin-guru-status-inactive";

        const actionButton = isActive
          ? `
          <button
            type="button"
            class="admin-guru-btn admin-guru-btn-secondary"
            disabled
            title="Tahun ajaran sedang aktif"
          >
            <i data-lucide="check-circle-2"></i>
            <span>Aktif</span>
          </button>
        `
          : `
          <button
            type="button"
            class="admin-guru-btn admin-guru-btn-primary"
            data-tahun-action="activate"
            data-id="${this.escapeHTML(id)}"
            ${activeCount !== 1 ? "disabled" : ""}
            title="${
              activeCount !== 1
                ? "Status tahun ajaran perlu diperbaiki"
                : "Aktifkan tahun ajaran ini"
            }"
          >
            <i data-lucide="check"></i>
            <span>Aktifkan</span>
          </button>
        `;

        return `
        <tr>
          <td>${index + 1}</td>

          <td>
            ${this.escapeHTML(id)}
          </td>

          <td>
            <strong>
              ${this.escapeHTML(nama)}
            </strong>
          </td>

          <td>
            <span class="${badgeClass}">
              ${this.escapeHTML(status)}
            </span>
          </td>

          <td>
            <div class="admin-guru-actions">

              <button
                type="button"
                class="admin-guru-btn admin-guru-btn-secondary"
                data-tahun-action="edit"
                data-id="${this.escapeHTML(id)}"
                title="Edit tahun ajaran"
              >
                <i data-lucide="pencil"></i>
                <span>Edit</span>
              </button>

              ${actionButton}

            </div>
          </td>
        </tr>
      `;
      })
      .join("");

    container.innerHTML = `
      <table class="admin-guru-table">
        <thead>
          <tr>
            <th>No.</th>
            <th>ID</th>
            <th>Tahun Ajaran</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>

        <tbody>
          ${rows}
        </tbody>
      </table>
    `;

    this.refreshIcons();
  },

  /* =====================================
     OPEN MODAL
  ===================================== */

  openModal(item = null) {
    const container = document.getElementById("tahunAjaranModal");

    if (!container) return;

    this.formMode = item ? "edit" : "create";

    this.editingId = item ? String(item.ID_TAHUN_AJARAN || "") : null;

    const title = item ? "Edit Tahun Ajaran" : "Tambah Tahun Ajaran";

    const nama = item ? String(item.NAMA_TAHUN_AJARAN || "") : "";

    container.innerHTML = `
      <div
        class="admin-guru-modal-backdrop"
        id="tahunAjaranModalBackdrop"
      >
        <div
          class="admin-guru-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tahunAjaranModalTitle"
        >

          <div class="admin-guru-modal-header">
            <h3 id="tahunAjaranModalTitle">
              ${title}
            </h3>

            <button
              type="button"
              class="admin-guru-modal-close"
              data-tahun-action="close-modal"
              aria-label="Tutup"
            >
              <i data-lucide="x"></i>
            </button>
          </div>

          <form id="tahunAjaranForm">

            <div class="admin-guru-modal-body">

              <div class="admin-guru-form-group">
                <label for="tahunAjaranNama">
                  Nama Tahun Ajaran
                </label>

                <input
                  type="text"
                  id="tahunAjaranNama"
                  value="${this.escapeHTML(nama)}"
                  placeholder="Contoh: 2031/2032"
                  maxlength="9"
                  pattern="[0-9]{4}/[0-9]{4}"
                  required
                  autocomplete="off"
                >

                <small>
                  Gunakan format YYYY/YYYY.
                  Contoh: 2026/2027.
                </small>
              </div>

              ${
                !item
                  ? `
                    <p>
                      Tahun ajaran baru akan dibuat
                      dengan status NONAKTIF.
                    </p>
                  `
                  : `
                    <p>
                      Perubahan nama tidak mengubah
                      status tahun ajaran.
                    </p>
                  `
              }

            </div>

            <div class="admin-guru-modal-footer">

              <button
                type="button"
                class="admin-guru-btn admin-guru-btn-secondary"
                data-tahun-action="close-modal"
              >
                Batal
              </button>

              <button
                type="submit"
                class="admin-guru-btn admin-guru-btn-primary"
                id="tahunAjaranSaveButton"
              >
                <i data-lucide="save"></i>
                <span>
                  ${item ? "Simpan Perubahan" : "Tambah"}
                </span>
              </button>

            </div>

          </form>

        </div>
      </div>
    `;

    this.refreshIcons();

    document.getElementById("tahunAjaranNama")?.focus();
  },

  /* =====================================
     CLOSE MODAL
  ===================================== */

  closeModal() {
    if (this.saving) return;

    const container = document.getElementById("tahunAjaranModal");

    if (container) {
      container.innerHTML = "";
    }

    this.formMode = "create";
    this.editingId = null;
  },

  /* =====================================
     EDIT
  ===================================== */

  edit(idTahunAjaran) {
    const item = this.data.find(
      (row) =>
        String(row.ID_TAHUN_AJARAN || "") === String(idTahunAjaran || ""),
    );

    if (!item) {
      this.showToast("Tahun ajaran tidak ditemukan.", true);
      return;
    }

    this.openModal(item);
  },

  /* =====================================
     SUBMIT FORM
  ===================================== */

  async submitForm() {
    if (this.saving) return;

    const input = document.getElementById("tahunAjaranNama");

    const button = document.getElementById("tahunAjaranSaveButton");

    if (!input) return;

    const form = document.getElementById("tahunAjaranForm");

    if (form && !form.reportValidity()) {
      return;
    }

    const nama = input.value.trim();

    const mode = this.formMode;
    const editingId = this.editingId;

    this.saving = true;

    if (button) {
      button.disabled = true;
      button.textContent = "Menyimpan...";
    }

    try {
      const payload = {
        NAMA_TAHUN_AJARAN: nama,
      };

      if (mode === "edit") {
        await TahunAjaranAdminService.update(editingId, payload);
      } else {
        await TahunAjaranAdminService.create(payload);
      }

      this.saving = false;
      this.closeModal();

      this.showToast(
        mode === "edit"
          ? "Tahun ajaran berhasil diperbarui."
          : "Tahun ajaran berhasil ditambahkan.",
      );

      await this.loadData();
    } catch (error) {
      console.error("[TAHUN AJARAN] Gagal menyimpan:", error);

      this.showToast(error.message || "Gagal menyimpan data.", true);
    } finally {
      this.saving = false;

      const currentButton = document.getElementById("tahunAjaranSaveButton");

      if (currentButton) {
        currentButton.disabled = false;
        currentButton.textContent = "Simpan";
      }
    }
  },

  /* =====================================
     ACTIVATE TAHUN AJARAN
  ===================================== */

  async activate(idTahunAjaran) {
    if (this.saving || this.loading) return;

    const target = this.data.find(
      (item) =>
        String(item.ID_TAHUN_AJARAN || "") === String(idTahunAjaran || ""),
    );

    if (!target) {
      this.showToast("Tahun ajaran tidak ditemukan.", true);
      return;
    }

    const activeYears = this.data.filter(
      (item) => this.normalizeStatus(item.STATUS_TAHUN_AJARAN) === "AKTIF",
    );

    if (activeYears.length !== 1) {
      this.showToast(
        "Status tahun ajaran tidak valid. Periksa data Spreadsheet.",
        true,
      );
      return;
    }

    const current = activeYears[0];

    if (String(current.ID_TAHUN_AJARAN) === String(idTahunAjaran)) {
      this.showToast("Tahun ajaran tersebut sudah aktif.");
      return;
    }

    const confirmed = window.confirm(
      `Aktifkan tahun ajaran ${target.NAMA_TAHUN_AJARAN}?\n\n` +
        `Tahun ajaran ${current.NAMA_TAHUN_AJARAN} ` +
        `akan otomatis menjadi NONAKTIF.\n\n` +
        `Pastikan Anda sudah siap melakukan pergantian periode akademik.`,
    );

    if (!confirmed) return;

    this.saving = true;

    try {
      await TahunAjaranAdminService.activate(idTahunAjaran);

      this.showToast(
        `Tahun ajaran ${target.NAMA_TAHUN_AJARAN} berhasil diaktifkan.`,
      );

      await this.loadData();
    } catch (error) {
      console.error("[TAHUN AJARAN] Gagal aktivasi:", error);

      this.showToast(error.message || "Gagal mengaktifkan tahun ajaran.", true);

      // Muat ulang untuk memastikan status terbaru.
      await this.loadData();
    } finally {
      this.saving = false;
    }
  },

  /* =====================================
     EXPORT PDF / PRINT
  ===================================== */

  exportPDF() {
    if (!this.filteredData.length) {
      this.showToast("Tidak ada data untuk dicetak.", true);
      return;
    }

    const rows = this.filteredData
      .map(
        (item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>
            ${this.escapeHTML(item.ID_TAHUN_AJARAN)}
          </td>
          <td>
            ${this.escapeHTML(item.NAMA_TAHUN_AJARAN)}
          </td>
          <td>
            ${this.escapeHTML(item.STATUS_TAHUN_AJARAN)}
          </td>
        </tr>
      `,
      )
      .join("");

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      this.showToast("Browser memblokir jendela cetak.", true);
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title>Data Tahun Ajaran - Teachly</title>

        <style>
          @page {
            size: A4 portrait;
            margin: 15mm;
          }

          body {
            font-family: Arial, sans-serif;
            color: #172033;
            font-size: 12px;
          }

          h2 {
            text-align: center;
            margin: 0 0 6px;
          }

          p {
            text-align: center;
            margin: 0 0 20px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }

          th, td {
            border: 1px solid #cbd5e1;
            padding: 9px;
            text-align: left;
          }

          th {
            background: #eef2f7;
          }

          tr {
            break-inside: avoid;
          }
        </style>
      </head>

      <body>
        <h2>DATA TAHUN AJARAN</h2>
        <p>Teachly - Administrasi Sekolah</p>

        <table>
          <thead>
            <tr>
              <th>No.</th>
              <th>ID</th>
              <th>Tahun Ajaran</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  },

  /* =====================================
     LOADING
  ===================================== */

  renderLoading() {
    return `
      <div class="admin-guru-empty">
        <i data-lucide="loader-circle"></i>
        <p>Memuat data tahun ajaran...</p>
      </div>
    `;
  },

  /* =====================================
     ERROR
  ===================================== */

  renderError(message) {
    const container = document.getElementById("tahunAjaranTable");

    if (!container) return;

    container.innerHTML = `
      <div class="admin-guru-empty">
        <i data-lucide="alert-circle"></i>
        <h4>Gagal Memuat Data</h4>
        <p>${this.escapeHTML(message)}</p>
      </div>
    `;

    this.refreshIcons();
  },

  /* =====================================
     TOAST
  ===================================== */

  showToast(message, isError = false) {
    const container = document.getElementById("tahunAjaranToast");

    if (!container) return;

    clearTimeout(this.toastTimer);

    container.innerHTML = `
      <div class="admin-guru-toast ${isError ? "error" : "success"}">
        ${this.escapeHTML(message)}
      </div>
    `;

    this.toastTimer = setTimeout(() => {
      if (container.isConnected) {
        container.innerHTML = "";
      }
    }, 3500);
  },

  /* =====================================
     NORMALIZE STATUS
  ===================================== */

  normalizeStatus(status) {
    return String(status ?? "")
      .trim()
      .toUpperCase();
  },

  /* =====================================
     ESCAPE HTML
  ===================================== */

  escapeHTML(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  },

  /* =====================================
     REFRESH ICONS
  ===================================== */

  refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  },
};
