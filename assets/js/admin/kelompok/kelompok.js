/* =========================================
   TEACHLY - ADMIN KELOMPOK NGAJI MODULE
   QEDEV FRONTEND STANDARD
========================================= */

const Kelompok = {
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
     RENDER
  ===================================== */

  render() {
    return `
      <section class="admin-guru-page admin-kelompok-page">

        <!-- PAGE HEADER -->
        <div class="admin-guru-header">
          <div class="admin-guru-header-info">
            <span class="admin-guru-eyebrow">
              MANAJEMEN SEKOLAH
            </span>

            <h1>Data Kelompok Ngaji</h1>

            <p>
              Kelola informasi dan status kelompok ngaji.
            </p>
          </div>

          <div class="admin-guru-header-actions">

            <button
              type="button"
              class="admin-guru-btn admin-guru-btn-export"
              data-kelompok-action="export-pdf"
            >
              <i data-lucide="file-down"></i>
              Export PDF
            </button>

            <button
              type="button"
              class="admin-guru-btn admin-guru-btn-primary"
              data-kelompok-action="create"
            >
              <i data-lucide="plus"></i>
              Tambah Kelompok
            </button>

          </div>
        </div>

        <!-- TABLE PANEL -->
        <div class="admin-guru-panel">

          <div class="admin-guru-toolbar">
            <div>
              <h2>Daftar Kelompok Ngaji</h2>
              <p>
                Informasi seluruh kelompok ngaji yang terdaftar.
              </p>
            </div>

            <div class="admin-guru-search">
              <i data-lucide="search"></i>

              <input
                type="search"
                id="kelompokSearch"
                placeholder="Cari ID atau nama kelompok..."
                autocomplete="off"
              />
            </div>
          </div>

          <div class="admin-guru-table-wrapper">
            <table class="admin-guru-table">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>ID Kelompok</th>
                  <th>Nama Kelompok</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody id="kelompokTableBody">
                <tr>
                  <td
                    colspan="5"
                    class="admin-guru-message"
                  >
                    Memuat data kelompok ngaji...
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="admin-guru-table-footer">
            <span id="kelompokTableInfo">
              Memuat data...
            </span>

            <button
              type="button"
              class="admin-guru-btn admin-guru-btn-light"
              data-kelompok-action="refresh"
            >
              <i data-lucide="refresh-cw"></i>
              Refresh
            </button>
          </div>
        </div>

        <!-- MODAL -->
        <div
          class="admin-guru-modal"
          id="kelompokModal"
          aria-hidden="true"
        >
          <div
            class="admin-guru-modal-overlay"
            data-kelompok-action="close-modal"
          ></div>

          <div
            class="admin-guru-modal-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="kelompokModalTitle"
          >
            <div class="admin-guru-modal-header">
              <div>
                <h2 id="kelompokModalTitle">
                  Tambah Kelompok Ngaji
                </h2>

                <p id="kelompokModalDescription">
                  Masukkan informasi kelompok ngaji baru.
                </p>
              </div>

              <button
                type="button"
                class="admin-guru-modal-close"
                data-kelompok-action="close-modal"
                aria-label="Tutup modal"
              >
                <i data-lucide="x"></i>
              </button>
            </div>

            <form id="kelompokForm">
              <div class="admin-guru-form-body">

                <div class="admin-guru-form-group">
                  <label for="kelompokNama">
                    Nama Kelompok Ngaji
                  </label>

                  <input
                    type="text"
                    id="kelompokNama"
                    name="NAMA_KELOMPOK"
                    placeholder="Contoh: Jilid 7"
                    maxlength="150"
                    required
                  />
                </div>

                <div
                  class="admin-guru-form-error"
                  id="kelompokFormError"
                  role="alert"
                  hidden
                ></div>

              </div>

              <div class="admin-guru-modal-footer">
                <button
                  type="button"
                  class="admin-guru-btn admin-guru-btn-light"
                  data-kelompok-action="close-modal"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  class="admin-guru-btn admin-guru-btn-primary"
                  id="kelompokSubmitButton"
                >
                  Simpan Kelompok
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- TOAST -->
        <div
          class="admin-guru-toast"
          id="kelompokToast"
          role="status"
          aria-live="polite"
        ></div>

      </section>
    `;
  },

  /* =====================================
     INITIALIZE
  ===================================== */

  init() {
    this.initialized = true;
    this.bindEvents();
    this.loadData();
    this.refreshIcons();
  },

  /* =====================================
     EVENTS
  ===================================== */

  bindEvents() {
    const root = document.getElementById("adminContent");

    if (!root || this.boundRoot === root) {
      return;
    }

    this.boundRoot = root;

    root.addEventListener("click", (event) => {
      const button = event.target.closest("[data-kelompok-action]");

      if (!button || !root.contains(button)) {
        return;
      }

      const action = button.dataset.kelompokAction;

      if (action === "create") {
        this.openModal();
      } else if (action === "edit") {
        this.edit(button.dataset.idKelompok);
      } else if (action === "toggle-status") {
        this.toggleStatus(button.dataset.idKelompok, button.dataset.status);
      } else if (action === "refresh") {
        this.loadData();
      } else if (action === "close-modal" && !this.saving) {
        this.closeModal();
      } else if (action === "export-pdf") {
        this.exportPDF();
      }
    });

    root.addEventListener("input", (event) => {
      if (event.target.id === "kelompokSearch") {
        this.search(event.target.value);
      }
    });

    root.addEventListener("submit", (event) => {
      if (event.target.id !== "kelompokForm") {
        return;
      }

      event.preventDefault();
      this.submitForm();
    });

    root.addEventListener("keydown", (event) => {
      if (
        event.key === "Escape" &&
        !this.saving &&
        document.getElementById("kelompokModal")?.classList.contains("show")
      ) {
        this.closeModal();
      }
    });
  },

  /* =====================================
     LOAD DATA
  ===================================== */

  async loadData() {
    if (this.loading) {
      return;
    }

    const tbody = document.getElementById("kelompokTableBody");

    if (!tbody) {
      return;
    }

    this.loading = true;

    tbody.innerHTML = `
      <tr>
        <td
          colspan="5"
          class="admin-guru-message"
        >
          Memuat data kelompok ngaji...
        </td>
      </tr>
    `;

    try {
      const rows = await KelompokService.getAll();

      if (!document.getElementById("kelompokTableBody")) {
        return;
      }

      this.data = rows;

      this.search(document.getElementById("kelompokSearch")?.value || "");
    } catch (error) {
      const currentBody = document.getElementById("kelompokTableBody");

      if (currentBody) {
        currentBody.innerHTML = `
          <tr>
            <td
              colspan="5"
              class="admin-guru-message error"
            >
              ${this.escapeHTML(error.message)}
            </td>
          </tr>
        `;
      }

      this.showToast(error.message, "error");
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
      const id = String(item.ID_KELOMPOK ?? "").toLowerCase();

      const nama = String(item.NAMA_KELOMPOK ?? "").toLowerCase();

      return id.includes(query) || nama.includes(query);
    });

    this.renderTable();
  },

  /* =====================================
     RENDER TABLE
  ===================================== */

  renderTable() {
    const tbody = document.getElementById("kelompokTableBody");

    const info = document.getElementById("kelompokTableInfo");

    if (!tbody) {
      return;
    }

    if (!this.filteredData.length) {
      tbody.innerHTML = `
        <tr>
          <td
            colspan="5"
            class="admin-guru-message"
          >
            Tidak ada kelompok ngaji yang ditemukan.
          </td>
        </tr>
      `;

      if (info) {
        info.textContent = "Menampilkan 0 kelompok ngaji";
      }

      return;
    }

    tbody.innerHTML = this.filteredData
      .map((item, index) => {
        const id = this.escapeHTML(item.ID_KELOMPOK);

        const nama = this.escapeHTML(item.NAMA_KELOMPOK);

        const aktif = this.normalizeStatus(item.STATUS_KELOMPOK) === "AKTIF";

        return `
          <tr>
            <td>${index + 1}</td>

            <td>
              <span class="admin-guru-nbm">
                ${id}
              </span>
            </td>

            <td>
              <strong class="admin-guru-name">
                ${nama}
              </strong>
            </td>

            <td>
              <span class="admin-guru-badge ${aktif ? "active" : "inactive"}">
                ${aktif ? "AKTIF" : "NONAKTIF"}
              </span>
            </td>

            <td>
              <div class="admin-guru-actions">

                <button
                  type="button"
                  class="admin-guru-action-btn edit"
                  data-kelompok-action="edit"
                  data-id-kelompok="${id}"
                  title="Edit kelompok ngaji"
                  aria-label="Edit ${nama}"
                >
                  <i data-lucide="pencil"></i>
                </button>

                <button
                  type="button"
                  class="admin-guru-action-btn ${
                    aktif ? "deactivate" : "activate"
                  }"
                  data-kelompok-action="toggle-status"
                  data-id-kelompok="${id}"
                  data-status="${aktif ? "NONAKTIF" : "AKTIF"}"
                  title="${aktif ? "Nonaktifkan" : "Aktifkan"} kelompok ngaji"
                  aria-label="${aktif ? "Nonaktifkan" : "Aktifkan"} ${nama}"
                >
                  <i data-lucide="${aktif ? "circle-off" : "circle-check"}"></i>
                </button>

              </div>
            </td>
          </tr>
        `;
      })
      .join("");

    if (info) {
      info.textContent =
        `Menampilkan ${this.filteredData.length} ` +
        `dari ${this.data.length} kelompok ngaji`;
    }

    this.refreshIcons();
  },

  /* =====================================
     OPEN MODAL
  ===================================== */

  openModal(mode = "create", item = null) {
    const modal = document.getElementById("kelompokModal");

    const form = document.getElementById("kelompokForm");

    if (!modal || !form) {
      return;
    }

    form.reset();

    this.formMode = mode;

    this.editingId = item ? String(item.ID_KELOMPOK) : null;

    const errorElement = document.getElementById("kelompokFormError");

    errorElement.hidden = true;
    errorElement.textContent = "";

    document.getElementById("kelompokModalTitle").textContent =
      mode === "edit" ? "Edit Kelompok Ngaji" : "Tambah Kelompok Ngaji";

    document.getElementById("kelompokModalDescription").textContent =
      mode === "edit"
        ? "Perbarui nama kelompok ngaji."
        : "Masukkan informasi kelompok ngaji baru.";

    document.getElementById("kelompokNama").value = item
      ? String(item.NAMA_KELOMPOK ?? "")
      : "";

    document.getElementById("kelompokSubmitButton").textContent =
      mode === "edit" ? "Simpan Perubahan" : "Simpan Kelompok";

    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");

    document.getElementById("kelompokNama")?.focus();
  },

  /* =====================================
     CLOSE MODAL
  ===================================== */

  closeModal() {
    const modal = document.getElementById("kelompokModal");

    if (!modal) {
      return;
    }

    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
  },

  /* =====================================
     EDIT KELOMPOK
  ===================================== */

  edit(idKelompok) {
    const item = this.data.find(
      (row) => String(row.ID_KELOMPOK) === String(idKelompok),
    );

    if (!item) {
      this.showToast(
        "Kelompok ngaji tidak ditemukan. Silakan refresh.",
        "error",
      );

      return;
    }

    this.openModal("edit", item);
  },

  /* =====================================
     SUBMIT FORM
  ===================================== */

  async submitForm() {
    if (this.saving) {
      return;
    }

    const button = document.getElementById("kelompokSubmitButton");

    const errorElement = document.getElementById("kelompokFormError");

    if (!button || !errorElement) {
      return;
    }

    errorElement.hidden = true;

    const originalText = button.textContent;

    this.saving = true;
    button.disabled = true;
    button.textContent = "Menyimpan...";

    try {
      const data = {
        NAMA_KELOMPOK: document.getElementById("kelompokNama").value.trim(),
      };

      if (this.formMode === "edit") {
        await KelompokService.update(this.editingId, data);
      } else {
        await KelompokService.create(data);
      }

      const message =
        this.formMode === "edit"
          ? "Kelompok ngaji berhasil diperbarui."
          : "Kelompok ngaji berhasil ditambahkan.";

      this.closeModal();

      this.showToast(message, "success");

      await this.loadData();
    } catch (error) {
      if (errorElement.isConnected) {
        errorElement.textContent = error.message;

        errorElement.hidden = false;
      }
    } finally {
      this.saving = false;

      if (button.isConnected) {
        button.disabled = false;
        button.textContent = originalText;
      }
    }
  },

  /* =====================================
     UPDATE STATUS
  ===================================== */

  async toggleStatus(idKelompok, status) {
    if (this.saving) {
      return;
    }

    const item = this.data.find(
      (row) => String(row.ID_KELOMPOK) === String(idKelompok),
    );

    if (!item) {
      this.showToast(
        "Kelompok ngaji tidak ditemukan. Silakan refresh.",
        "error",
      );

      return;
    }

    const action = status === "AKTIF" ? "mengaktifkan" : "menonaktifkan";

    const confirmed = window.confirm(
      `Apakah kamu yakin ingin ${action} kelompok ${item.NAMA_KELOMPOK}?`,
    );

    if (!confirmed) {
      return;
    }

    this.saving = true;

    try {
      await KelompokService.updateStatus(idKelompok, status);

      this.showToast(
        `Kelompok ngaji berhasil ${
          status === "AKTIF" ? "diaktifkan" : "dinonaktifkan"
        }.`,
        "success",
      );

      await this.loadData();
    } catch (error) {
      this.showToast(error.message, "error");
    } finally {
      this.saving = false;
    }
  },

  /* =====================================
     EXPORT PDF
  ===================================== */

  exportPDF() {
    const data = this.data || [];

    if (!data.length) {
      window.alert("Tidak ada data kelompok ngaji untuk diekspor.");
      return;
    }

    const rows = data
      .map(
        (item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${this.escapeHTML(item.ID_KELOMPOK)}</td>
          <td>${this.escapeHTML(item.NAMA_KELOMPOK)}</td>
          <td>${this.escapeHTML(
            this.normalizeStatus(item.STATUS_KELOMPOK),
          )}</td>
        </tr>
      `,
      )
      .join("");

    const tanggal = new Date().toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      window.alert("Popup diblokir browser. Izinkan popup untuk mencetak PDF.");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title>Daftar Kelompok Ngaji Teachly</title>

        <style>
          * {
            box-sizing: border-box;
          }

          body {
            font-family: Arial, sans-serif;
            color: #17365f;
            padding: 25px;
          }

          .header {
            text-align: center;
            margin-bottom: 25px;
            border-bottom: 2px solid #17365f;
            padding-bottom: 15px;
          }

          .header h2 {
            margin: 0 0 8px;
            font-size: 21px;
          }

          .header p {
            margin: 0;
            font-size: 12px;
            color: #64748b;
          }

          .info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
            font-size: 12px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
          }

          th, td {
            border: 1px solid #d7dfeb;
            padding: 10px;
            text-align: left;
          }

          th {
            background: #17365f;
            color: #ffffff;
          }

          tbody tr:nth-child(even) {
            background: #f3f6fb;
          }

          td:first-child {
            width: 45px;
            text-align: center;
          }

          td:nth-child(2) {
            width: 120px;
          }

          td:last-child {
            width: 110px;
            text-align: center;
          }

          .footer {
            margin-top: 20px;
            font-size: 11px;
            color: #64748b;
            text-align: right;
          }

          @page {
            size: A4 portrait;
            margin: 15mm;
          }

          @media print {
            body {
              padding: 0;
            }
          }
        </style>
      </head>

      <body>
        <div class="header">
          <h2>DAFTAR KELOMPOK NGAJI</h2>
          <p>
            TEACHLY - SISTEM MANAJEMEN PEMBELAJARAN
          </p>
        </div>

        <div class="info">
          <span>Total Kelompok: ${data.length}</span>
          <span>Tanggal Cetak: ${tanggal}</span>
        </div>

        <table>
          <thead>
            <tr>
              <th>No.</th>
              <th>ID Kelompok</th>
              <th>Nama Kelompok</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            ${rows}
          </tbody>
        </table>

        <div class="footer">
          Dicetak melalui aplikasi Teachly
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        <\/script>
      </body>
      </html>
    `);

    printWindow.document.close();
  },

  /* =====================================
     TOAST
  ===================================== */

  showToast(message, type = "success") {
    const toast = document.getElementById("kelompokToast");

    if (!toast) {
      return;
    }

    toast.textContent = message;
    toast.className = `admin-guru-toast show ${type}`;

    clearTimeout(this.toastTimer);

    this.toastTimer = setTimeout(() => {
      if (toast.isConnected) {
        toast.classList.remove("show");
      }
    }, 3500);
  },

  /* =====================================
     HELPERS
  ===================================== */

  normalizeStatus(status) {
    return String(status ?? "")
      .trim()
      .toUpperCase();
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
};
