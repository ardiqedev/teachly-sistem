/* =========================================
   TEACHLY - ADMIN KELAS MODULE
========================================= */

const Kelas = {
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
      <section class="admin-guru-page admin-kelas-page">

        <div class="admin-guru-header">
          <div class="admin-guru-header-info">
            <span class="admin-guru-eyebrow">
              MANAJEMEN SEKOLAH
            </span>
            <h1>Data Kelas</h1>
            <p>Kelola informasi dan status kelas sekolah.</p>
          </div>

          <div class="admin-guru-header-actions">
            <button
              type="button"
              class="admin-guru-btn admin-guru-btn-export"
              data-kelas-action="export-pdf"
            >
              <i data-lucide="file-down"></i>
              Export PDF
            </button>

            <button
              type="button"
              class="admin-guru-btn admin-guru-btn-primary"
              data-kelas-action="create"
            >
              <i data-lucide="plus"></i>
              Tambah Kelas
            </button>
          </div>
        </div>

        <div class="admin-guru-panel">

          <div class="admin-guru-toolbar">
            <div>
              <h2>Daftar Kelas</h2>
              <p>Informasi seluruh kelas yang terdaftar.</p>
            </div>

            <div class="admin-guru-search">
              <i data-lucide="search"></i>
              <input
                type="search"
                id="kelasSearch"
                placeholder="Cari ID, nama, atau tingkat..."
                autocomplete="off"
              />
            </div>
          </div>

          <div class="admin-guru-table-wrapper">
            <table class="admin-guru-table">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>ID Kelas</th>
                  <th>Nama Kelas</th>
                  <th>Tingkat</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody id="kelasTableBody">
                <tr>
                  <td colspan="6" class="admin-guru-message">
                    Memuat data kelas...
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="admin-guru-table-footer">
            <span id="kelasTableInfo">Memuat data...</span>

            <button
              type="button"
              class="admin-guru-btn admin-guru-btn-light"
              data-kelas-action="refresh"
            >
              <i data-lucide="refresh-cw"></i>
              Refresh
            </button>
          </div>
        </div>

        <!-- MODAL -->
        <div
          class="admin-guru-modal"
          id="kelasModal"
          aria-hidden="true"
        >
          <div
            class="admin-guru-modal-overlay"
            data-kelas-action="close-modal"
          ></div>

          <div
            class="admin-guru-modal-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="kelasModalTitle"
          >
            <div class="admin-guru-modal-header">
              <div>
                <h2 id="kelasModalTitle">Tambah Kelas</h2>
                <p id="kelasModalDescription">
                  Masukkan informasi kelas baru.
                </p>
              </div>

              <button
                type="button"
                class="admin-guru-modal-close"
                data-kelas-action="close-modal"
                aria-label="Tutup modal"
              >
                <i data-lucide="x"></i>
              </button>
            </div>

            <form id="kelasForm">
              <div class="admin-guru-form-body">

                <div class="admin-guru-form-group">
                  <label for="kelasNama">Nama Kelas</label>
                  <input
                    type="text"
                    id="kelasNama"
                    name="NAMA_KELAS"
                    placeholder="Contoh: I Ar Razi"
                    maxlength="150"
                    required
                  />
                </div>

                <div class="admin-guru-form-group">
                  <label for="kelasTingkat">Tingkat</label>
                  <select
                    id="kelasTingkat"
                    name="TINGKAT"
                    required
                  >
                    <option value="">Pilih Tingkat</option>
                    ${[1, 2, 3, 4, 5, 6]
                      .map((n) => `<option value="${n}">${n}</option>`)
                      .join("")}
                  </select>
                </div>

                <div
                  class="admin-guru-form-error"
                  id="kelasFormError"
                  role="alert"
                  hidden
                ></div>
              </div>

              <div class="admin-guru-modal-footer">
                <button
                  type="button"
                  class="admin-guru-btn admin-guru-btn-light"
                  data-kelas-action="close-modal"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  class="admin-guru-btn admin-guru-btn-primary"
                  id="kelasSubmitButton"
                >
                  Simpan Kelas
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- TOAST -->
        <div
          class="admin-guru-toast"
          id="kelasToast"
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
  },

  /* =====================================
     EVENTS
  ===================================== */

  bindEvents() {
    const root = document.getElementById("adminContent");

    if (!root || this.boundRoot === root) return;

    this.boundRoot = root;

    root.addEventListener("click", (event) => {
      const button = event.target.closest("[data-kelas-action]");

      if (!button || !root.contains(button)) return;

      const action = button.dataset.kelasAction;

      if (action === "create") {
        this.openModal();
      } else if (action === "edit") {
        this.edit(button.dataset.idKelas);
      } else if (action === "toggle-status") {
        this.toggleStatus(button.dataset.idKelas, button.dataset.status);
      } else if (action === "refresh") {
        this.loadData();
      } else if (action === "close-modal" && !this.saving) {
        this.closeModal();
      } else if (action === "export-pdf") {
        this.exportPDF();
      }
    });

    root.addEventListener("input", (event) => {
      if (event.target.id === "kelasSearch") {
        this.search(event.target.value);
      }
    });

    root.addEventListener("submit", (event) => {
      if (event.target.id !== "kelasForm") return;

      event.preventDefault();
      this.submitForm();
    });

    root.addEventListener("keydown", (event) => {
      if (
        event.key === "Escape" &&
        !this.saving &&
        document.getElementById("kelasModal")?.classList.contains("show")
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

    const tbody = document.getElementById("kelasTableBody");

    if (!tbody) return;

    this.loading = true;

    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="admin-guru-message">
          Memuat data kelas...
        </td>
      </tr>
    `;

    try {
      const rows = await KelasService.getAll();

      if (!document.getElementById("kelasTableBody")) return;

      this.data = rows;

      this.search(document.getElementById("kelasSearch")?.value || "");
    } catch (error) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="admin-guru-message error">
            ${this.escapeHTML(error.message)}
          </td>
        </tr>
      `;

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

    this.filteredData = this.data.filter((item) =>
      [item.ID_KELAS, item.NAMA_KELAS, item.TINGKAT].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(query),
      ),
    );

    this.renderTable();
  },

  /* =====================================
     RENDER TABLE
  ===================================== */

  renderTable() {
    const tbody = document.getElementById("kelasTableBody");
    const info = document.getElementById("kelasTableInfo");

    if (!tbody) return;

    if (!this.filteredData.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="admin-guru-message">
            Tidak ada data kelas yang ditemukan.
          </td>
        </tr>
      `;

      if (info) info.textContent = "Menampilkan 0 kelas";

      return;
    }

    tbody.innerHTML = this.filteredData
      .map((item, index) => {
        const id = this.escapeHTML(item.ID_KELAS);
        const nama = this.escapeHTML(item.NAMA_KELAS);
        const tingkat = this.escapeHTML(item.TINGKAT);

        const aktif = this.normalizeStatus(item.STATUS_KELAS) === "AKTIF";

        return `
          <tr>
            <td>${index + 1}</td>

            <td>
              <span class="admin-guru-nbm">${id}</span>
            </td>

            <td>
              <strong class="admin-guru-name">${nama}</strong>
            </td>

            <td>${tingkat}</td>

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
                  data-kelas-action="edit"
                  data-id-kelas="${id}"
                  title="Edit kelas"
                  aria-label="Edit ${nama}"
                >
                  <i data-lucide="pencil"></i>
                </button>

                <button
                  type="button"
                  class="admin-guru-action-btn ${
                    aktif ? "deactivate" : "activate"
                  }"
                  data-kelas-action="toggle-status"
                  data-id-kelas="${id}"
                  data-status="${aktif ? "NONAKTIF" : "AKTIF"}"
                  title="${aktif ? "Nonaktifkan" : "Aktifkan"} kelas"
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
        `dari ${this.data.length} kelas`;
    }

    this.refreshIcons();
  },

  /* =====================================
     OPEN MODAL
  ===================================== */

  openModal(mode = "create", item = null) {
    const modal = document.getElementById("kelasModal");
    const form = document.getElementById("kelasForm");

    if (!modal || !form) return;

    form.reset();

    this.formMode = mode;
    this.editingId = item ? String(item.ID_KELAS) : null;

    const error = document.getElementById("kelasFormError");

    error.hidden = true;
    error.textContent = "";

    document.getElementById("kelasModalTitle").textContent =
      mode === "edit" ? "Edit Data Kelas" : "Tambah Kelas";

    document.getElementById("kelasModalDescription").textContent =
      mode === "edit"
        ? "Perbarui nama dan tingkat kelas."
        : "Masukkan informasi kelas baru.";

    document.getElementById("kelasNama").value = item
      ? String(item.NAMA_KELAS ?? "")
      : "";

    document.getElementById("kelasTingkat").value = item
      ? String(item.TINGKAT ?? "")
      : "";

    document.getElementById("kelasSubmitButton").textContent =
      mode === "edit" ? "Simpan Perubahan" : "Simpan Kelas";

    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");

    document.getElementById("kelasNama")?.focus();
  },

  /* =====================================
     CLOSE MODAL
  ===================================== */

  closeModal() {
    const modal = document.getElementById("kelasModal");

    if (!modal) return;

    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
  },

  /* =====================================
     EDIT KELAS
  ===================================== */

  edit(idKelas) {
    const item = this.data.find(
      (row) => String(row.ID_KELAS) === String(idKelas),
    );

    if (!item) {
      this.showToast("Data kelas tidak ditemukan. Silakan refresh.", "error");
      return;
    }

    this.openModal("edit", item);
  },

  /* =====================================
     SUBMIT FORM
  ===================================== */

  async submitForm() {
    if (this.saving) return;

    const button = document.getElementById("kelasSubmitButton");
    const errorElement = document.getElementById("kelasFormError");

    if (!button || !errorElement) return;

    errorElement.hidden = true;

    const originalText = button.textContent;

    this.saving = true;
    button.disabled = true;
    button.textContent = "Menyimpan...";

    try {
      const data = {
        NAMA_KELAS: document.getElementById("kelasNama").value.trim(),

        TINGKAT: document.getElementById("kelasTingkat").value,
      };

      if (this.formMode === "edit") {
        await KelasService.update(this.editingId, data);
      } else {
        await KelasService.create(data);
      }

      this.closeModal();

      this.showToast(
        this.formMode === "edit"
          ? "Data kelas berhasil diperbarui."
          : "Kelas berhasil ditambahkan.",
      );

      await this.loadData();
    } catch (error) {
      errorElement.textContent = error.message;
      errorElement.hidden = false;
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

  async toggleStatus(idKelas, status) {
    if (this.saving) return;

    const item = this.data.find(
      (row) => String(row.ID_KELAS) === String(idKelas),
    );

    if (!item) {
      this.showToast("Data kelas tidak ditemukan. Silakan refresh.", "error");
      return;
    }

    const verb = status === "AKTIF" ? "mengaktifkan" : "menonaktifkan";

    const confirmed = window.confirm(
      `Apakah kamu yakin ingin ${verb} kelas ${item.NAMA_KELAS}?`,
    );

    if (!confirmed) return;

    this.saving = true;

    try {
      await KelasService.updateStatus(idKelas, status);

      this.showToast(
        `Kelas berhasil ${
          status === "AKTIF" ? "diaktifkan" : "dinonaktifkan"
        }.`,
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
    if (!this.data.length) {
      window.alert("Tidak ada data kelas untuk diekspor.");
      return;
    }

    const rows = this.data
      .map(
        (item, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${this.escapeHTML(item.ID_KELAS)}</td>
            <td>${this.escapeHTML(item.NAMA_KELAS)}</td>
            <td>${this.escapeHTML(item.TINGKAT)}</td>
            <td>${this.escapeHTML(this.normalizeStatus(item.STATUS_KELAS))}</td>
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
        <title>Daftar Kelas Teachly</title>

        <style>
          * { box-sizing: border-box; }

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
            color: white;
          }

          tbody tr:nth-child(even) {
            background: #f3f6fb;
          }

          @page {
            size: A4 portrait;
            margin: 15mm;
          }

          @media print {
            body { padding: 0; }
          }
        </style>
      </head>

      <body>
        <div class="header">
          <h2>DAFTAR KELAS</h2>
          <p>TEACHLY - SISTEM MANAJEMEN PEMBELAJARAN</p>
        </div>

        <div class="info">
          <span>Total Kelas: ${this.data.length}</span>
          <span>Tanggal Cetak: ${tanggal}</span>
        </div>

        <table>
          <thead>
            <tr>
              <th>No.</th>
              <th>ID Kelas</th>
              <th>Nama Kelas</th>
              <th>Tingkat</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>

        <p style="text-align:right;font-size:11px;color:#64748b">
          Dicetak melalui aplikasi Teachly
        </p>

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
    const toast = document.getElementById("kelasToast");

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

  normalizeStatus(value) {
    return String(value ?? "")
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
