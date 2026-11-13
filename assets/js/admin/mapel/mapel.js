/* =========================================
   TEACHLY - ADMIN MAPEL MODULE
========================================= */

const Mapel = {
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
      <section class="admin-guru-page admin-mapel-page">

        <!-- PAGE HEADER -->
        <div class="admin-guru-header">
          <div class="admin-guru-header-info">
            <span class="admin-guru-eyebrow">
              MANAJEMEN SEKOLAH
            </span>
            <h1>Data Mata Pelajaran</h1>
            <p>Kelola informasi dan status mata pelajaran sekolah.</p>
          </div>

          <div class="admin-guru-header-actions">
            <button
              type="button"
              class="admin-guru-btn admin-guru-btn-export"
              data-mapel-action="export-pdf"
            >
              <i data-lucide="file-down"></i>
              Export PDF
            </button>

            <button
              type="button"
              class="admin-guru-btn admin-guru-btn-primary"
              data-mapel-action="create"
            >
              <i data-lucide="plus"></i>
              Tambah Mapel
            </button>
          </div>
        </div>

        <!-- TABLE PANEL -->
        <div class="admin-guru-panel">

          <div class="admin-guru-toolbar">
            <div>
              <h2>Daftar Mata Pelajaran</h2>
              <p>Informasi seluruh mata pelajaran yang terdaftar.</p>
            </div>

            <div class="admin-guru-search">
              <i data-lucide="search"></i>
              <input
                type="search"
                id="mapelSearch"
                placeholder="Cari ID atau nama mata pelajaran..."
                autocomplete="off"
              />
            </div>
          </div>

          <div class="admin-guru-table-wrapper">
            <table class="admin-guru-table">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>ID Mapel</th>
                  <th>Nama Mata Pelajaran</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody id="mapelTableBody">
                <tr>
                  <td colspan="5" class="admin-guru-message">
                    Memuat data mata pelajaran...
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="admin-guru-table-footer">
            <span id="mapelTableInfo">Memuat data...</span>

            <button
              type="button"
              class="admin-guru-btn admin-guru-btn-light"
              data-mapel-action="refresh"
            >
              <i data-lucide="refresh-cw"></i>
              Refresh
            </button>
          </div>
        </div>

        <!-- MODAL -->
        <div
          class="admin-guru-modal"
          id="mapelModal"
          aria-hidden="true"
        >
          <div
            class="admin-guru-modal-overlay"
            data-mapel-action="close-modal"
          ></div>

          <div
            class="admin-guru-modal-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mapelModalTitle"
          >
            <div class="admin-guru-modal-header">
              <div>
                <h2 id="mapelModalTitle">Tambah Mata Pelajaran</h2>
                <p id="mapelModalDescription">
                  Masukkan informasi mata pelajaran baru.
                </p>
              </div>

              <button
                type="button"
                class="admin-guru-modal-close"
                data-mapel-action="close-modal"
                aria-label="Tutup modal"
              >
                <i data-lucide="x"></i>
              </button>
            </div>

            <form id="mapelForm">
              <div class="admin-guru-form-body">

                <div class="admin-guru-form-group">
                  <label for="mapelNama">
                    Nama Mata Pelajaran
                  </label>

                  <input
                    type="text"
                    id="mapelNama"
                    name="NAMA_MAPEL"
                    placeholder="Masukkan nama mata pelajaran"
                    maxlength="150"
                    required
                  />
                </div>

                <div
                  class="admin-guru-form-error"
                  id="mapelFormError"
                  role="alert"
                  hidden
                ></div>

              </div>

              <div class="admin-guru-modal-footer">
                <button
                  type="button"
                  class="admin-guru-btn admin-guru-btn-light"
                  data-mapel-action="close-modal"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  class="admin-guru-btn admin-guru-btn-primary"
                  id="mapelSubmitButton"
                >
                  Simpan Mata Pelajaran
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- TOAST -->
        <div
          class="admin-guru-toast"
          id="mapelToast"
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

    if (!root || this.boundRoot === root) return;

    this.boundRoot = root;

    root.addEventListener("click", (event) => {
      const button = event.target.closest("[data-mapel-action]");

      if (!button || !root.contains(button)) return;

      const action = button.dataset.mapelAction;

      if (action === "create") {
        this.openModal();
      } else if (action === "edit") {
        this.edit(button.dataset.idMapel);
      } else if (action === "toggle-status") {
        this.toggleStatus(button.dataset.idMapel, button.dataset.status);
      } else if (action === "refresh") {
        this.loadData();
      } else if (action === "close-modal" && !this.saving) {
        this.closeModal();
      } else if (action === "export-pdf") {
        this.exportPDF();
      }
    });

    root.addEventListener("input", (event) => {
      if (event.target.id === "mapelSearch") {
        this.search(event.target.value);
      }
    });

    root.addEventListener("submit", (event) => {
      if (event.target.id !== "mapelForm") return;

      event.preventDefault();
      this.submitForm();
    });

    root.addEventListener("keydown", (event) => {
      if (
        event.key === "Escape" &&
        !this.saving &&
        document.getElementById("mapelModal")?.classList.contains("show")
      ) {
        this.closeModal();
      }
    });
  },

  /* =====================================
     LOAD DATA
  ===================================== */

  async loadData() {
    if (this.loading) return;

    const tbody = document.getElementById("mapelTableBody");

    if (!tbody) return;

    this.loading = true;

    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="admin-guru-message">
          Memuat data mata pelajaran...
        </td>
      </tr>
    `;

    try {
      const rows = await MapelService.getAll();

      if (!document.getElementById("mapelTableBody")) {
        return;
      }

      this.data = rows;

      this.search(document.getElementById("mapelSearch")?.value || "");
    } catch (error) {
      const currentBody = document.getElementById("mapelTableBody");

      if (currentBody) {
        currentBody.innerHTML = `
          <tr>
            <td colspan="5" class="admin-guru-message error">
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
      const id = String(item.ID_MAPEL ?? "").toLowerCase();
      const nama = String(item.NAMA_MAPEL ?? "").toLowerCase();

      return id.includes(query) || nama.includes(query);
    });

    this.renderTable();
  },

  /* =====================================
     RENDER TABLE
  ===================================== */

  renderTable() {
    const tbody = document.getElementById("mapelTableBody");
    const info = document.getElementById("mapelTableInfo");

    if (!tbody) return;

    if (!this.filteredData.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="admin-guru-message">
            Tidak ada mata pelajaran yang ditemukan.
          </td>
        </tr>
      `;

      if (info) {
        info.textContent = "Menampilkan 0 mata pelajaran";
      }

      return;
    }

    tbody.innerHTML = this.filteredData
      .map((item, index) => {
        const id = this.escapeHTML(item.ID_MAPEL);
        const nama = this.escapeHTML(item.NAMA_MAPEL);

        const aktif = this.normalizeStatus(item.STATUS_MAPEL) === "AKTIF";

        return `
          <tr>
            <td>${index + 1}</td>

            <td>
              <span class="admin-guru-nbm">${id}</span>
            </td>

            <td>
              <strong class="admin-guru-name">${nama}</strong>
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
                  data-mapel-action="edit"
                  data-id-mapel="${id}"
                  title="Edit mata pelajaran"
                  aria-label="Edit ${nama}"
                >
                  <i data-lucide="pencil"></i>
                </button>

                <button
                  type="button"
                  class="admin-guru-action-btn ${
                    aktif ? "deactivate" : "activate"
                  }"
                  data-mapel-action="toggle-status"
                  data-id-mapel="${id}"
                  data-status="${aktif ? "NONAKTIF" : "AKTIF"}"
                  title="${aktif ? "Nonaktifkan" : "Aktifkan"} mata pelajaran"
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
        `dari ${this.data.length} mata pelajaran`;
    }

    this.refreshIcons();
  },

  /* =====================================
     OPEN MODAL
  ===================================== */

  openModal(mode = "create", item = null) {
    const modal = document.getElementById("mapelModal");
    const form = document.getElementById("mapelForm");

    if (!modal || !form) return;

    form.reset();

    this.formMode = mode;
    this.editingId = item ? String(item.ID_MAPEL) : null;

    const errorElement = document.getElementById("mapelFormError");

    errorElement.hidden = true;
    errorElement.textContent = "";

    document.getElementById("mapelModalTitle").textContent =
      mode === "edit" ? "Edit Mata Pelajaran" : "Tambah Mata Pelajaran";

    document.getElementById("mapelModalDescription").textContent =
      mode === "edit"
        ? "Perbarui nama mata pelajaran."
        : "Masukkan informasi mata pelajaran baru.";

    document.getElementById("mapelNama").value = item
      ? String(item.NAMA_MAPEL ?? "")
      : "";

    document.getElementById("mapelSubmitButton").textContent =
      mode === "edit" ? "Simpan Perubahan" : "Simpan Mata Pelajaran";

    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");

    document.getElementById("mapelNama")?.focus();
  },

  /* =====================================
     CLOSE MODAL
  ===================================== */

  closeModal() {
    const modal = document.getElementById("mapelModal");

    if (!modal) return;

    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
  },

  /* =====================================
     EDIT MATA PELAJARAN
  ===================================== */

  edit(idMapel) {
    const item = this.data.find(
      (row) => String(row.ID_MAPEL) === String(idMapel),
    );

    if (!item) {
      this.showToast(
        "Mata pelajaran tidak ditemukan. Silakan refresh.",
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
    if (this.saving) return;

    const button = document.getElementById("mapelSubmitButton");
    const errorElement = document.getElementById("mapelFormError");

    if (!button || !errorElement) return;

    errorElement.hidden = true;

    const originalText = button.textContent;

    this.saving = true;
    button.disabled = true;
    button.textContent = "Menyimpan...";

    try {
      const data = {
        NAMA_MAPEL: document.getElementById("mapelNama").value.trim(),
      };

      if (this.formMode === "edit") {
        await MapelService.update(this.editingId, data);
      } else {
        await MapelService.create(data);
      }

      const message =
        this.formMode === "edit"
          ? "Mata pelajaran berhasil diperbarui."
          : "Mata pelajaran berhasil ditambahkan.";

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

  async toggleStatus(idMapel, status) {
    if (this.saving) return;

    const item = this.data.find(
      (row) => String(row.ID_MAPEL) === String(idMapel),
    );

    if (!item) {
      this.showToast(
        "Mata pelajaran tidak ditemukan. Silakan refresh.",
        "error",
      );
      return;
    }

    const action = status === "AKTIF" ? "mengaktifkan" : "menonaktifkan";

    const confirmed = window.confirm(
      `Apakah kamu yakin ingin ${action} mata pelajaran ${item.NAMA_MAPEL}?`,
    );

    if (!confirmed) return;

    this.saving = true;

    try {
      await MapelService.updateStatus(idMapel, status);

      this.showToast(
        `Mata pelajaran berhasil ${
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
      window.alert("Tidak ada data mata pelajaran untuk diekspor.");
      return;
    }

    const rows = data
      .map(
        (item, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${this.escapeHTML(item.ID_MAPEL)}</td>
            <td>${this.escapeHTML(item.NAMA_MAPEL)}</td>
            <td>${this.escapeHTML(this.normalizeStatus(item.STATUS_MAPEL))}</td>
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
        <title>Daftar Mata Pelajaran Teachly</title>

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
            font-weight: bold;
          }

          tbody tr:nth-child(even) {
            background: #f3f6fb;
          }

          td:first-child {
            width: 45px;
            text-align: center;
          }

          td:nth-child(2) {
            width: 100px;
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
          <h2>DAFTAR MATA PELAJARAN</h2>
          <p>TEACHLY - SISTEM MANAJEMEN PEMBELAJARAN</p>
        </div>

        <div class="info">
          <span>Total Mata Pelajaran: ${data.length}</span>
          <span>Tanggal Cetak: ${tanggal}</span>
        </div>

        <table>
          <thead>
            <tr>
              <th>No.</th>
              <th>ID Mapel</th>
              <th>Nama Mata Pelajaran</th>
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
    const toast = document.getElementById("mapelToast");

    if (!toast) return;

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
