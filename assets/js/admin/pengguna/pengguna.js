/* =========================================
   TEACHLY - ADMIN PENGGUNA MODULE
   QEDEV FRONTEND STANDARD
========================================= */

const Pengguna = {
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
      <section class="admin-guru-page admin-pengguna-page">

        <!-- PAGE HEADER -->
        <div class="admin-guru-header">
          <div class="admin-guru-header-info">
            <span class="admin-guru-eyebrow">
              MANAJEMEN PENGGUNA
            </span>

            <h1>Pengguna Admin</h1>

            <p>
              Kelola akun dan hak akses administrator.
            </p>
          </div>

          <div class="admin-guru-header-actions">
            <button
              type="button"
              class="admin-guru-btn admin-guru-btn-primary"
              data-pengguna-action="create"
            >
              <i data-lucide="plus"></i>
              Tambah Pengguna
            </button>
          </div>
        </div>

        <!-- STATISTICS -->
        <div class="pengguna-stats">
          <div class="pengguna-stat-card">
            <span>Total Pengguna</span>
            <strong id="penggunaTotal">0</strong>
          </div>

          <div class="pengguna-stat-card">
            <span>Akun Aktif</span>
            <strong id="penggunaAktif">0</strong>
          </div>

          <div class="pengguna-stat-card">
            <span>Akun Nonaktif</span>
            <strong id="penggunaNonaktif">0</strong>
          </div>
        </div>

        <!-- TABLE PANEL -->
        <div class="admin-guru-panel">

          <div class="admin-guru-toolbar">
            <div>
              <h2>Daftar Pengguna</h2>
              <p>
                Informasi seluruh akun administrator.
              </p>
            </div>

            <div class="admin-guru-search">
              <i data-lucide="search"></i>

              <input
                type="search"
                id="penggunaSearch"
                placeholder="Cari nama, username, atau role..."
                autocomplete="off"
              />
            </div>
          </div>

          <div class="admin-guru-table-wrapper">
            <table class="admin-guru-table">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>ID Pengguna</th>
                  <th>Nama Pengguna</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody id="penggunaTableBody">
                <tr>
                  <td
                    colspan="7"
                    class="admin-guru-message"
                  >
                    Memuat data pengguna...
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="admin-guru-table-footer">
            <span id="penggunaTableInfo">
              Memuat data...
            </span>

            <button
              type="button"
              class="admin-guru-btn admin-guru-btn-light"
              data-pengguna-action="refresh"
            >
              <i data-lucide="refresh-cw"></i>
              Refresh
            </button>
          </div>
        </div>

        <!-- CREATE / EDIT MODAL -->
        <div
          class="admin-guru-modal"
          id="penggunaModal"
          aria-hidden="true"
        >
          <div
            class="admin-guru-modal-overlay"
            data-pengguna-action="close-modal"
          ></div>

          <div
            class="admin-guru-modal-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="penggunaModalTitle"
          >
            <div class="admin-guru-modal-header">
              <div>
                <h2 id="penggunaModalTitle">
                  Tambah Pengguna
                </h2>

                <p id="penggunaModalDescription">
                  Masukkan informasi akun administrator.
                </p>
              </div>

              <button
                type="button"
                class="admin-guru-modal-close"
                data-pengguna-action="close-modal"
                aria-label="Tutup modal"
              >
                <i data-lucide="x"></i>
              </button>
            </div>

            <form id="penggunaForm">
              <div class="admin-guru-form-body">

                <div class="admin-guru-form-group">
                  <label for="penggunaNama">
                    Nama Pengguna
                  </label>

                  <input
                    type="text"
                    id="penggunaNama"
                    maxlength="150"
                    placeholder="Nama lengkap pengguna"
                    autocomplete="name"
                    required
                  />
                </div>

                <div class="admin-guru-form-group">
                  <label for="penggunaUsername">
                    Username
                  </label>

                  <input
                    type="text"
                    id="penggunaUsername"
                    maxlength="50"
                    placeholder="Username login"
                    autocomplete="off"
                    required
                  />
                </div>

                <div class="admin-guru-form-group">
                  <label for="penggunaRole">
                    Role
                  </label>

                  <select id="penggunaRole" required>
                    <option value="">Pilih Role</option>
                    <option value="ADMIN">
                      Admin
                    </option>
                    <option value="ADMIN_KURIKULUM">
                      Admin Kurikulum
                    </option>
                    <option value="ADMIN_GURU_NGAJI">
                      Admin Guru Ngaji
                    </option>
                  </select>
                </div>

                <div
                  class="admin-guru-form-group"
                  id="penggunaPasswordGroup"
                >
                  <label for="penggunaPassword">
                    Password
                  </label>

                  <input
                    type="password"
                    id="penggunaPassword"
                    minlength="12"
                    autocomplete="new-password"
                    placeholder="Minimal 12 karakter"
                  />
                </div>

                <div
                  class="admin-guru-form-error"
                  id="penggunaFormError"
                  role="alert"
                  hidden
                ></div>
              </div>

              <div class="admin-guru-modal-footer">
                <button
                  type="button"
                  class="admin-guru-btn admin-guru-btn-light"
                  data-pengguna-action="close-modal"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  class="admin-guru-btn admin-guru-btn-primary"
                  id="penggunaSubmitButton"
                >
                  Simpan Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- RESET PASSWORD MODAL -->
        <div
          class="admin-guru-modal"
          id="penggunaResetModal"
          aria-hidden="true"
        >
          <div
            class="admin-guru-modal-overlay"
            data-pengguna-action="close-reset"
          ></div>

          <div
            class="admin-guru-modal-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="penggunaResetTitle"
          >
            <div class="admin-guru-modal-header">
              <div>
                <h2 id="penggunaResetTitle">
                  Reset Password
                </h2>

                <p id="penggunaResetDescription">
                  Masukkan password baru pengguna.
                </p>
              </div>

              <button
                type="button"
                class="admin-guru-modal-close"
                data-pengguna-action="close-reset"
                aria-label="Tutup modal"
              >
                <i data-lucide="x"></i>
              </button>
            </div>

            <form id="penggunaResetForm">
              <div class="admin-guru-form-body">
                <div class="admin-guru-form-group">
                  <label for="penggunaNewPassword">
                    Password Baru
                  </label>

                  <input
                    type="password"
                    id="penggunaNewPassword"
                    minlength="12"
                    autocomplete="new-password"
                    placeholder="Minimal 12 karakter"
                    required
                  />
                </div>

                <div class="admin-guru-form-group">
                  <label for="penggunaConfirmPassword">
                    Konfirmasi Password
                  </label>

                  <input
                    type="password"
                    id="penggunaConfirmPassword"
                    minlength="12"
                    autocomplete="new-password"
                    placeholder="Ulangi password baru"
                    required
                  />
                </div>

                <div
                  class="admin-guru-form-error"
                  id="penggunaResetError"
                  role="alert"
                  hidden
                ></div>
              </div>

              <div class="admin-guru-modal-footer">
                <button
                  type="button"
                  class="admin-guru-btn admin-guru-btn-light"
                  data-pengguna-action="close-reset"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  class="admin-guru-btn admin-guru-btn-primary"
                  id="penggunaResetButton"
                >
                  Simpan Password
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- TOAST -->
        <div
          class="admin-guru-toast"
          id="penggunaToast"
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
      const button = event.target.closest("[data-pengguna-action]");

      if (!button || !root.contains(button)) {
        return;
      }

      const action = button.dataset.penggunaAction;

      if (action === "create") {
        this.openModal();
      } else if (action === "edit") {
        this.edit(button.dataset.idPengguna);
      } else if (action === "toggle-status") {
        this.toggleStatus(button.dataset.idPengguna, button.dataset.status);
      } else if (action === "reset-password") {
        this.openResetModal(button.dataset.idPengguna);
      } else if (action === "refresh") {
        this.loadData();
      } else if (action === "close-modal" && !this.saving) {
        this.closeModal();
      } else if (action === "close-reset" && !this.saving) {
        this.closeResetModal();
      }
    });

    root.addEventListener("input", (event) => {
      if (event.target.id === "penggunaSearch") {
        this.search(event.target.value);
      }
    });

    root.addEventListener("submit", (event) => {
      if (event.target.id === "penggunaForm") {
        event.preventDefault();
        this.submitForm();
      } else if (event.target.id === "penggunaResetForm") {
        event.preventDefault();
        this.submitResetPassword();
      }
    });

    root.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || this.saving) {
        return;
      }

      if (
        document.getElementById("penggunaModal")?.classList.contains("show")
      ) {
        this.closeModal();
      }

      if (
        document
          .getElementById("penggunaResetModal")
          ?.classList.contains("show")
      ) {
        this.closeResetModal();
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

    const tbody = document.getElementById("penggunaTableBody");

    if (!tbody) {
      return;
    }

    this.loading = true;

    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="admin-guru-message">
          Memuat data pengguna...
        </td>
      </tr>
    `;

    try {
      const rows = await PenggunaService.getAll();

      if (!document.getElementById("penggunaTableBody")) {
        return;
      }

      this.data = rows;

      this.renderStats();

      this.search(document.getElementById("penggunaSearch")?.value || "");
    } catch (error) {
      const currentBody = document.getElementById("penggunaTableBody");

      if (currentBody) {
        currentBody.innerHTML = `
          <tr>
            <td colspan="7" class="admin-guru-message error">
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
     STATISTICS
  ===================================== */

  renderStats() {
    const total = this.data.length;

    const aktif = this.data.filter(
      (item) => this.normalizeStatus(item.STATUS_AKUN) === "AKTIF",
    ).length;

    const nonaktif = total - aktif;

    const totalEl = document.getElementById("penggunaTotal");
    const aktifEl = document.getElementById("penggunaAktif");
    const nonaktifEl = document.getElementById("penggunaNonaktif");

    if (totalEl) totalEl.textContent = total;
    if (aktifEl) aktifEl.textContent = aktif;
    if (nonaktifEl) nonaktifEl.textContent = nonaktif;
  },

  /* =====================================
     SEARCH
  ===================================== */

  search(keyword = "") {
    const query = String(keyword).trim().toLowerCase();

    this.filteredData = this.data.filter((item) => {
      const id = String(item.ID_PENGGUNA ?? "").toLowerCase();
      const nama = String(item.NAMA_PENGGUNA ?? "").toLowerCase();
      const username = String(item.USERNAME ?? "").toLowerCase();
      const role = String(item.ROLE ?? "").toLowerCase();

      return (
        id.includes(query) ||
        nama.includes(query) ||
        username.includes(query) ||
        role.includes(query)
      );
    });

    this.renderTable();
  },

  /* =====================================
     RENDER TABLE
  ===================================== */

  renderTable() {
    const tbody = document.getElementById("penggunaTableBody");
    const info = document.getElementById("penggunaTableInfo");

    if (!tbody) {
      return;
    }

    if (!this.filteredData.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="admin-guru-message">
            Tidak ada pengguna yang ditemukan.
          </td>
        </tr>
      `;

      if (info) {
        info.textContent = "Menampilkan 0 pengguna";
      }

      return;
    }

    tbody.innerHTML = this.filteredData
      .map((item, index) => {
        const id = this.escapeHTML(item.ID_PENGGUNA);
        const nama = this.escapeHTML(item.NAMA_PENGGUNA);
        const username = this.escapeHTML(item.USERNAME);
        const role = this.normalizeStatus(item.ROLE);
        const aktif = this.normalizeStatus(item.STATUS_AKUN) === "AKTIF";

        const roleLabel =
          {
            ADMIN: "Admin",
            ADMIN_KURIKULUM: "Admin Kurikulum",
            ADMIN_GURU_NGAJI: "Admin Guru Ngaji",
          }[role] || role;

        return `
          <tr>
            <td>${index + 1}</td>

            <td>
              <span class="admin-guru-nbm">${id}</span>
            </td>

            <td>
              <strong class="admin-guru-name">${nama}</strong>
            </td>

            <td>${username}</td>

            <td>${this.escapeHTML(roleLabel)}</td>

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
                  data-pengguna-action="edit"
                  data-id-pengguna="${id}"
                  title="Edit pengguna"
                  aria-label="Edit ${nama}"
                >
                  <i data-lucide="pencil"></i>
                </button>

                <button
                  type="button"
                  class="admin-guru-action-btn edit"
                  data-pengguna-action="reset-password"
                  data-id-pengguna="${id}"
                  title="Reset password"
                  aria-label="Reset password ${nama}"
                >
                  <i data-lucide="key-round"></i>
                </button>

                <button
                  type="button"
                  class="admin-guru-action-btn ${
                    aktif ? "deactivate" : "activate"
                  }"
                  data-pengguna-action="toggle-status"
                  data-id-pengguna="${id}"
                  data-status="${aktif ? "NONAKTIF" : "AKTIF"}"
                  title="${aktif ? "Nonaktifkan" : "Aktifkan"} akun"
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
        `dari ${this.data.length} pengguna`;
    }

    this.refreshIcons();
  },

  /* =====================================
     OPEN CREATE / EDIT MODAL
  ===================================== */

  openModal(mode = "create", item = null) {
    const modal = document.getElementById("penggunaModal");
    const form = document.getElementById("penggunaForm");

    if (!modal || !form) {
      return;
    }

    form.reset();

    this.formMode = mode;
    this.editingId = item ? String(item.ID_PENGGUNA) : null;

    const errorElement = document.getElementById("penggunaFormError");

    errorElement.hidden = true;
    errorElement.textContent = "";

    document.getElementById("penggunaModalTitle").textContent =
      mode === "edit" ? "Edit Pengguna" : "Tambah Pengguna";

    document.getElementById("penggunaModalDescription").textContent =
      mode === "edit"
        ? "Perbarui informasi akun administrator."
        : "Masukkan informasi akun administrator baru.";

    document.getElementById("penggunaNama").value = item
      ? String(item.NAMA_PENGGUNA ?? "")
      : "";

    document.getElementById("penggunaUsername").value = item
      ? String(item.USERNAME ?? "")
      : "";

    document.getElementById("penggunaRole").value = item
      ? String(item.ROLE ?? "")
      : "";

    const passwordGroup = document.getElementById("penggunaPasswordGroup");

    const passwordInput = document.getElementById("penggunaPassword");

    passwordGroup.hidden = mode === "edit";
    passwordInput.required = mode === "create";
    passwordInput.value = "";

    document.getElementById("penggunaSubmitButton").textContent =
      mode === "edit" ? "Simpan Perubahan" : "Simpan Pengguna";

    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");

    document.getElementById("penggunaNama")?.focus();
  },

  /* =====================================
     CLOSE MODAL
  ===================================== */

  closeModal() {
    const modal = document.getElementById("penggunaModal");

    if (!modal) {
      return;
    }

    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
  },

  /* =====================================
     EDIT
  ===================================== */

  edit(idPengguna) {
    const item = this.data.find(
      (row) => String(row.ID_PENGGUNA) === String(idPengguna),
    );

    if (!item) {
      this.showToast("Pengguna tidak ditemukan. Silakan refresh.", "error");
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

    const button = document.getElementById("penggunaSubmitButton");
    const errorElement = document.getElementById("penggunaFormError");

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
        NAMA_PENGGUNA: document.getElementById("penggunaNama").value,
        USERNAME: document.getElementById("penggunaUsername").value,
        ROLE: document.getElementById("penggunaRole").value,
      };

      if (this.formMode === "edit") {
        await PenggunaService.update(this.editingId, data);
      } else {
        data.PASSWORD = document.getElementById("penggunaPassword").value;

        data.STATUS_AKUN = "AKTIF";

        await PenggunaService.create(data);
      }

      const message =
        this.formMode === "edit"
          ? "Pengguna berhasil diperbarui."
          : "Pengguna berhasil ditambahkan.";

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

  async toggleStatus(idPengguna, status) {
    if (this.saving) {
      return;
    }

    const item = this.data.find(
      (row) => String(row.ID_PENGGUNA) === String(idPengguna),
    );

    if (!item) {
      this.showToast("Pengguna tidak ditemukan. Silakan refresh.", "error");
      return;
    }

    const action = status === "AKTIF" ? "mengaktifkan" : "menonaktifkan";

    const confirmed = window.confirm(
      `Apakah kamu yakin ingin ${action} akun ${item.NAMA_PENGGUNA}?`,
    );

    if (!confirmed) {
      return;
    }

    this.saving = true;

    try {
      await PenggunaService.updateStatus(idPengguna, status);

      this.showToast(
        status === "AKTIF"
          ? "Akun pengguna berhasil diaktifkan."
          : "Akun pengguna berhasil dinonaktifkan.",
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
     OPEN RESET PASSWORD
  ===================================== */

  openResetModal(idPengguna) {
    const item = this.data.find(
      (row) => String(row.ID_PENGGUNA) === String(idPengguna),
    );

    if (!item) {
      this.showToast("Pengguna tidak ditemukan.", "error");
      return;
    }

    const modal = document.getElementById("penggunaResetModal");
    const form = document.getElementById("penggunaResetForm");

    if (!modal || !form) {
      return;
    }

    form.reset();

    this.editingId = String(item.ID_PENGGUNA);

    document.getElementById("penggunaResetDescription").textContent =
      `Atur password baru untuk ${item.NAMA_PENGGUNA}.`;

    const errorElement = document.getElementById("penggunaResetError");

    errorElement.hidden = true;
    errorElement.textContent = "";

    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");

    document.getElementById("penggunaNewPassword")?.focus();
  },

  /* =====================================
     CLOSE RESET MODAL
  ===================================== */

  closeResetModal() {
    const modal = document.getElementById("penggunaResetModal");

    if (!modal) {
      return;
    }

    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
  },

  /* =====================================
     SUBMIT RESET PASSWORD
  ===================================== */

  async submitResetPassword() {
    if (this.saving) {
      return;
    }

    const button = document.getElementById("penggunaResetButton");
    const errorElement = document.getElementById("penggunaResetError");

    if (!button || !errorElement) {
      return;
    }

    errorElement.hidden = true;

    const password = document.getElementById("penggunaNewPassword").value;

    const confirmation = document.getElementById(
      "penggunaConfirmPassword",
    ).value;

    if (password !== confirmation) {
      errorElement.textContent = "Konfirmasi password tidak sama.";
      errorElement.hidden = false;
      return;
    }

    const originalText = button.textContent;

    this.saving = true;
    button.disabled = true;
    button.textContent = "Menyimpan...";

    try {
      await PenggunaService.resetPassword(this.editingId, password);

      this.closeResetModal();

      this.showToast("Password pengguna berhasil diperbarui.", "success");
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
     TOAST
  ===================================== */

  showToast(message, type = "success") {
    const toast = document.getElementById("penggunaToast");

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
