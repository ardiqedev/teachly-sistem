/* =========================================
   TEACHLY - ADMIN GURU MODULE
========================================= */

const Guru = {
  data: [],
  filteredData: [],
  initialized: false,

  /* =====================================
     RENDER
  ===================================== */

  render() {
    return `
      <section class="admin-guru-page">

        <!-- PAGE HEADER -->
        
        <div class="admin-guru-header">
        <div class="admin-guru-header-info">
            <span class="admin-guru-eyebrow">MANAJEMEN SEKOLAH</span>
            <h1>Data Guru</h1>
            <p>Kelola informasi dan akun guru sekolah.</p>
        </div>

        <div class="admin-guru-header-actions">
            <button
            type="button"
            class="admin-guru-btn admin-guru-btn-export"
            data-guru-action="export-pdf"
            >
            <i data-lucide="file-down"></i>
            Export PDF
            </button>

            <button
            type="button"
            class="admin-guru-btn admin-guru-btn-primary"
            data-guru-action="create"
            >
            <i data-lucide="plus"></i>
            Tambah Guru
            </button>
        </div>
        </div>


        <!-- STATISTICS -->
        <div class="admin-guru-statistics">

          <article class="admin-guru-stat-card">
            <div class="admin-guru-stat-icon">
              <i data-lucide="users"></i>
            </div>
            <div>
              <span>Total Guru</span>
              <strong id="guruTotal">0</strong>
            </div>
          </article>

          <article class="admin-guru-stat-card">
            <div class="admin-guru-stat-icon active">
              <i data-lucide="user-check"></i>
            </div>
            <div>
              <span>Akun Aktif</span>
              <strong id="guruAktif">0</strong>
            </div>
          </article>

          <article class="admin-guru-stat-card">
            <div class="admin-guru-stat-icon inactive">
              <i data-lucide="user-x"></i>
            </div>
            <div>
              <span>Akun Nonaktif</span>
              <strong id="guruNonaktif">0</strong>
            </div>
          </article>

        </div>

        <!-- TABLE PANEL -->
        <div class="admin-guru-panel">

          <div class="admin-guru-toolbar">
            <div>
              <h2>Daftar Guru</h2>
              <p>Informasi seluruh akun guru yang terdaftar.</p>
            </div>

            <div class="admin-guru-search">
              <i data-lucide="search"></i>
              <input
                type="search"
                id="guruSearch"
                placeholder="Cari NBM atau nama guru..."
                autocomplete="off"
              />
            </div>
          </div>

          <div class="admin-guru-table-wrapper">
            <table class="admin-guru-table">

              <thead>
                <tr>
                  <th>No.</th>
                  <th>NBM</th>
                  <th>Nama Guru</th>
                  <th>Status Akun</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody id="guruTableBody">
                <tr>
                  <td colspan="5" class="admin-guru-message">
                    Memuat data guru...
                  </td>
                </tr>
              </tbody>

            </table>
          </div>

          <div class="admin-guru-table-footer">
            <span id="guruTableInfo">Memuat data...</span>
            <button
              type="button"
              class="admin-guru-btn admin-guru-btn-light"
              data-guru-action="refresh"
            >
              <i data-lucide="refresh-cw"></i>
              Refresh
            </button>
          </div>

        </div>

        <!-- MODAL -->
        <div
          class="admin-guru-modal"
          id="guruModal"
          aria-hidden="true"
        >
          <div class="admin-guru-modal-overlay"
               data-guru-action="close-modal"></div>

          <div
            class="admin-guru-modal-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="guruModalTitle"
          >
            <div class="admin-guru-modal-header">
              <div>
                <h2 id="guruModalTitle">Tambah Guru</h2>
                <p id="guruModalDescription">
                  Masukkan informasi guru.
                </p>
              </div>

              <button
                type="button"
                class="admin-guru-modal-close"
                data-guru-action="close-modal"
                aria-label="Tutup modal"
              >
                <i data-lucide="x"></i>
              </button>
            </div>

            <form id="guruForm">

              <div class="admin-guru-form-body">

                <div class="admin-guru-form-group">
                  <label for="guruNBM">Nomor Baku Muhammadiyah (NBM)</label>
                  <input
                    type="text"
                    id="guruNBM"
                    name="NBM"
                    placeholder="Masukkan NBM"
                    maxlength="30"
                    required
                  />
                </div>

                <div class="admin-guru-form-group">
                  <label for="guruNama">Nama Lengkap Guru</label>
                  <input
                    type="text"
                    id="guruNama"
                    name="NAMA_GURU"
                    placeholder="Masukkan nama lengkap guru"
                    maxlength="150"
                    required
                  />
                </div>

                <div
                  class="admin-guru-form-error"
                  id="guruFormError"
                  role="alert"
                  hidden
                ></div>

              </div>

              <div class="admin-guru-modal-footer">
                <button
                  type="button"
                  class="admin-guru-btn admin-guru-btn-light"
                  data-guru-action="close-modal"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  class="admin-guru-btn admin-guru-btn-primary"
                  id="guruSubmitButton"
                >
                  Simpan Guru
                </button>
              </div>

            </form>
          </div>
        </div>

        <!-- TOAST -->
        <div
          class="admin-guru-toast"
          id="guruToast"
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

    if (!root) return;

    if (this.boundRoot === root) return;

    this.boundRoot = root;

    root.addEventListener("click", (event) => {
      const button = event.target.closest("[data-guru-action]");

      if (!button || !root.contains(button)) return;

      const action = button.dataset.guruAction;

      if (action === "create") {
        this.openModal();
      }

      if (action === "edit") {
        this.edit(button.dataset.nbm);
      }

      if (action === "toggle-status") {
        this.toggleStatus(button.dataset.nbm, button.dataset.status);
      }

      if (action === "refresh") {
        this.loadData();
      }

      if (action === "close-modal") {
        this.closeModal();
      }

      if (action === "export-pdf") {
        this.exportPDF();
        return;
      }
    });

    root.addEventListener("input", (event) => {
      if (event.target.id === "guruSearch") {
        this.search(event.target.value);
      }
    });

    root.addEventListener("submit", (event) => {
      if (event.target.id === "guruForm") {
        event.preventDefault();
        this.submitForm();
      }
    });

    root.addEventListener("keydown", (event) => {
      if (
        event.key === "Escape" &&
        document.getElementById("guruModal")?.classList.contains("show")
      ) {
        this.closeModal();
      }
    });
  },

  /* =====================================
     LOAD DATA
  ===================================== */

  async loadData() {
    const tbody = document.getElementById("guruTableBody");

    if (!tbody) return;

    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="admin-guru-message">
          Memuat data guru...
        </td>
      </tr>
    `;

    try {
      this.data = await GuruService.getAll();

      this.updateStatistics();
      this.search(document.getElementById("guruSearch")?.value || "");
    } catch (error) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="admin-guru-message error">
            ${this.escapeHTML(error.message)}
          </td>
        </tr>
      `;

      this.showToast(error.message, "error");
    }
  },

  /* =====================================
     STATISTICS
  ===================================== */

  updateStatistics() {
    const total = this.data.length;

    const aktif = this.data.filter(
      (guru) => this.normalizeStatus(guru.STATUS_AKUN) === "AKTIF",
    ).length;

    const nonaktif = this.data.filter(
      (guru) => this.normalizeStatus(guru.STATUS_AKUN) === "NONAKTIF",
    ).length;

    this.setText("guruTotal", total);
    this.setText("guruAktif", aktif);
    this.setText("guruNonaktif", nonaktif);
  },

  /* =====================================
     SEARCH
  ===================================== */

  search(keyword = "") {
    const query = String(keyword).trim().toLowerCase();

    this.filteredData = this.data.filter((guru) => {
      const nbm = String(guru.NBM || "").toLowerCase();
      const nama = String(guru.NAMA_GURU || "").toLowerCase();

      return nbm.includes(query) || nama.includes(query);
    });

    this.renderTable();
  },

  exportPDF() {
    const data = this.data || [];

    if (!data.length) {
      alert("Tidak ada data guru untuk diekspor.");
      return;
    }

    const rows = data
      .map(
        (guru, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${this.escapeHTML(guru.NBM || "")}</td>
      <td>${this.escapeHTML(guru.NAMA_GURU || "")}</td>
      <td>${this.escapeHTML(guru.STATUS_AKUN || "")}</td>
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
      alert("Popup diblokir browser. Izinkan popup untuk mencetak PDF.");
      return;
    }

    printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>Daftar Guru Teachly</title>

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
          letter-spacing: 1px;
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
          font-weight: bold;
        }

        tbody tr:nth-child(even) {
          background: #f3f6fb;
        }

        td:first-child {
          text-align: center;
          width: 45px;
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
        <h2>DAFTAR GURU</h2>
        <p>TEACHLY - SISTEM MANAJEMEN PEMBELAJARAN</p>
      </div>

      <div class="info">
        <span>Total Guru: ${data.length}</span>
        <span>Tanggal Cetak: ${tanggal}</span>
      </div>

      <table>
        <thead>
          <tr>
            <th>No.</th>
            <th>NBM</th>
            <th>Nama Guru</th>
            <th>Status Akun</th>
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
     RENDER TABLE
  ===================================== */

  renderTable() {
    const tbody = document.getElementById("guruTableBody");
    const info = document.getElementById("guruTableInfo");

    if (!tbody) return;

    if (!this.filteredData.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="admin-guru-message">
            Tidak ada data guru yang ditemukan.
          </td>
        </tr>
      `;

      if (info) info.textContent = "Menampilkan 0 guru";

      return;
    }

    tbody.innerHTML = this.filteredData
      .map((guru, index) => {
        const nbm = this.escapeHTML(guru.NBM);
        const nama = this.escapeHTML(guru.NAMA_GURU);
        const status = this.normalizeStatus(guru.STATUS_AKUN);

        const aktif = status === "AKTIF";

        return `
        <tr>
          <td>${index + 1}</td>

          <td>
            <span class="admin-guru-nbm">${nbm}</span>
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
                data-guru-action="edit"
                data-nbm="${nbm}"
                title="Edit guru"
                aria-label="Edit ${nama}"
              >
                <i data-lucide="pencil"></i>
              </button>

              <button
                type="button"
                class="admin-guru-action-btn ${aktif ? "deactivate" : "activate"}"
                data-guru-action="toggle-status"
                data-nbm="${nbm}"
                data-status="${aktif ? "NONAKTIF" : "AKTIF"}"
                title="${aktif ? "Nonaktifkan akun" : "Aktifkan akun"}"
                aria-label="${aktif ? "Nonaktifkan" : "Aktifkan"} ${nama}"
              >
                <i data-lucide="${aktif ? "user-x" : "user-check"}"></i>
              </button>

            </div>
          </td>
        </tr>
      `;
      })
      .join("");

    if (info) {
      info.textContent = `Menampilkan ${this.filteredData.length} dari ${this.data.length} guru`;
    }

    this.refreshIcons();
  },

  /* =====================================
     OPEN MODAL
  ===================================== */

  openModal(mode = "create", guru = null) {
    const modal = document.getElementById("guruModal");
    const form = document.getElementById("guruForm");

    if (!modal || !form) return;

    form.reset();

    document.getElementById("guruFormError").hidden = true;

    this.formMode = mode;
    this.editingNBM = guru ? String(guru.NBM) : null;

    document.getElementById("guruModalTitle").textContent =
      mode === "edit" ? "Edit Data Guru" : "Tambah Guru";

    document.getElementById("guruModalDescription").textContent =
      mode === "edit"
        ? "Perbarui informasi nama guru."
        : "Masukkan informasi guru baru.";

    const nbmInput = document.getElementById("guruNBM");

    nbmInput.value = guru ? guru.NBM : "";
    nbmInput.disabled = mode === "edit";

    document.getElementById("guruNama").value = guru ? guru.NAMA_GURU : "";

    document.getElementById("guruSubmitButton").textContent =
      mode === "edit" ? "Simpan Perubahan" : "Simpan Guru";

    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");

    setTimeout(() => {
      document
        .getElementById(mode === "edit" ? "guruNama" : "guruNBM")
        ?.focus();
    }, 50);
  },

  /* =====================================
     CLOSE MODAL
  ===================================== */

  closeModal() {
    const modal = document.getElementById("guruModal");

    if (!modal) return;

    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
  },

  /* =====================================
     EDIT GURU
  ===================================== */

  async edit(nbm) {
    try {
      const guru = await GuruService.getDetail(nbm);
      this.openModal("edit", guru);
    } catch (error) {
      this.showToast(error.message, "error");
    }
  },

  /* =====================================
     SUBMIT FORM
  ===================================== */

  async submitForm() {
    const nbm = document.getElementById("guruNBM").value.trim();
    const nama = document.getElementById("guruNama").value.trim();

    const button = document.getElementById("guruSubmitButton");
    const errorElement = document.getElementById("guruFormError");

    errorElement.hidden = true;

    try {
      const originalText = button.textContent;

      button.disabled = true;
      button.textContent = "Menyimpan...";

      if (this.formMode === "edit") {
        await GuruService.update(this.editingNBM, {
          NAMA_GURU: nama,
        });

        this.showToast("Data guru berhasil diperbarui.", "success");
      } else {
        await GuruService.create({
          NBM: nbm,
          NAMA_GURU: nama,
        });

        this.showToast("Data guru berhasil ditambahkan.", "success");
      }

      this.closeModal();
      await this.loadData();

      button.disabled = false;
      button.textContent = originalText;
    } catch (error) {
      errorElement.textContent = error.message;
      errorElement.hidden = false;

      button.disabled = false;
      button.textContent =
        this.formMode === "edit" ? "Simpan Perubahan" : "Simpan Guru";
    }
  },

  /* =====================================
     UPDATE STATUS
  ===================================== */

  async toggleStatus(nbm, status) {
    const guru = this.data.find((item) => String(item.NBM) === String(nbm));

    if (!guru) return;

    const nama = guru.NAMA_GURU || nbm;

    const action = status === "AKTIF" ? "mengaktifkan" : "menonaktifkan";

    const confirmed = window.confirm(
      `Apakah kamu yakin ingin ${action} akun guru ${nama}?`,
    );

    if (!confirmed) return;

    try {
      await GuruService.updateStatus(nbm, status);

      this.showToast(
        `Akun guru berhasil ${status === "AKTIF" ? "diaktifkan" : "dinonaktifkan"}.`,
        "success",
      );

      await this.loadData();
    } catch (error) {
      this.showToast(error.message, "error");
    }
  },

  /* =====================================
     TOAST
  ===================================== */

  showToast(message, type = "success") {
    const toast = document.getElementById("guruToast");

    if (!toast) return;

    toast.textContent = message;
    toast.className = `admin-guru-toast show ${type}`;

    clearTimeout(this.toastTimer);

    this.toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 3500);
  },

  /* =====================================
     HELPERS
  ===================================== */

  normalizeStatus(status) {
    return String(status || "")
      .trim()
      .toUpperCase();
  },

  setText(id, value) {
    const element = document.getElementById(id);

    if (element) element.textContent = value;
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
