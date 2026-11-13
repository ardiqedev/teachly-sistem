/* =========================================
   TEACHLY - INFORMASI SEKOLAH UI
   QEDEV ADMIN MODULE
========================================= */

const InformasiSekolah = {
  root: null,
  source: "KURIKULUM",
  originalData: null,
  loading: false,
  saving: false,
  requestId: 0,

  /* =====================================
     RENDER PAGE
  ===================================== */

  render() {
    return `
      <div class="admin-guru-page informasi-sekolah-page">

        <div class="admin-guru-header">
          <div>
            <div class="admin-guru-header-label">
              MANAJEMEN SEKOLAH
            </div>
            <h2>Informasi Sekolah</h2>
            <p>
              Kelola informasi Kurikulum dan Guru Ngaji
              yang ditampilkan kepada guru.
            </p>
          </div>
        </div>

        <div class="admin-guru-card informasi-sekolah-card">

          <div class="informasi-sekolah-section-header">
            <div>
              <h3>Formulir Informasi</h3>
              <p>
                Pilih pemberi informasi untuk melihat
                atau memperbarui informasi yang tersimpan.
              </p>
            </div>
          </div>

          <form id="informasiSekolahForm" novalidate>

            <div class="informasi-sekolah-field">
              <label for="informasiSekolahSource">
                Nama Pemberi Informasi
                <span class="informasi-sekolah-required">*</span>
              </label>

              <select
                id="informasiSekolahSource"
                name="SUMBER_INFORMASI"
              >
                <option value="KURIKULUM">
                  Kurikulum
                </option>
                <option value="GURU_NGAJI">
                  Guru Ngaji
                </option>
              </select>
            </div>

            <div class="informasi-sekolah-field">
              <label for="informasiSekolahNama">
                Nama Informasi
                <span class="informasi-sekolah-required">*</span>
              </label>

              <input
                type="text"
                id="informasiSekolahNama"
                name="NAMA_INFORMASI"
                placeholder="Masukkan judul informasi"
                maxlength="150"
                autocomplete="off"
              />
            </div>

            <div class="informasi-sekolah-field">
              <label for="informasiSekolahDetail">
                Detail Informasi
                <span class="informasi-sekolah-required">*</span>
              </label>

              <textarea
                id="informasiSekolahDetail"
                name="DETAIL_INFORMASI"
                rows="10"
                maxlength="45000"
                placeholder="Tuliskan detail informasi di sini..."
              ></textarea>

              <div class="informasi-sekolah-field-help">
                Gunakan Enter untuk membuat paragraf,
                serta tanda - atau angka untuk daftar.
              </div>
            </div>

            <div
              class="informasi-sekolah-meta"
              id="informasiSekolahMeta"
            >
              Belum ada informasi pembaruan.
            </div>

            <div
              class="informasi-sekolah-message"
              id="informasiSekolahMessage"
              role="status"
              aria-live="polite"
              hidden
            ></div>

            <div class="informasi-sekolah-actions">
              <button
                type="button"
                class="informasi-sekolah-btn-clear"
                id="informasiSekolahClear"
              >
                Hapus Semua Teks
              </button>

              <button
                type="submit"
                class="informasi-sekolah-btn-save"
                id="informasiSekolahSave"
              >
                Simpan Informasi
              </button>
            </div>

          </form>
        </div>

        <div class="admin-guru-card informasi-sekolah-preview-card">
          <div class="informasi-sekolah-section-header">
            <div>
              <h3>Pratinjau Informasi</h3>
              <p>
                Tampilan isi informasi sebelum disimpan.
              </p>
            </div>
          </div>

          <div
            class="informasi-sekolah-preview"
            id="informasiSekolahPreview"
          >
            <div class="informasi-sekolah-preview-empty">
              Belum ada informasi untuk ditampilkan.
            </div>
          </div>
        </div>

      </div>
    `;
  },

  /* =====================================
     INITIALIZE
  ===================================== */

  init() {
    this.root = document.querySelector(".informasi-sekolah-page");

    if (!this.root) return;

    this.source = "KURIKULUM";
    this.originalData = null;
    this.loading = false;
    this.saving = false;
    this.requestId += 1;

    const sourceSelect = this.getElement("informasiSekolahSource");

    if (sourceSelect) {
      sourceSelect.value = this.source;
    }

    this.bindEvents();
    this.updatePreview();
    this.loadInformation(this.source);
  },

  /* =====================================
     GET ELEMENT
  ===================================== */

  getElement(id) {
    return this.root ? this.root.querySelector("#" + id) : null;
  },

  /* =====================================
     BIND EVENTS
  ===================================== */

  bindEvents() {
    const form = this.getElement("informasiSekolahForm");

    const sourceSelect = this.getElement("informasiSekolahSource");

    const namaInput = this.getElement("informasiSekolahNama");

    const detailInput = this.getElement("informasiSekolahDetail");

    const clearButton = this.getElement("informasiSekolahClear");

    if (sourceSelect) {
      sourceSelect.addEventListener("change", (event) => {
        this.handleSourceChange(event.target.value);
      });
    }

    if (namaInput) {
      namaInput.addEventListener("input", () => {
        this.clearMessage();
        this.updatePreview();
      });
    }

    if (detailInput) {
      detailInput.addEventListener("input", () => {
        this.clearMessage();
        this.updatePreview();
      });
    }

    if (clearButton) {
      clearButton.addEventListener("click", () => this.clearForm());
    }

    if (form) {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        this.handleSave();
      });
    }
  },

  /* =====================================
     GET FORM DATA
  ===================================== */

  getFormData() {
    return {
      SUMBER_INFORMASI: this.source,

      NAMA_INFORMASI: this.getElement("informasiSekolahNama")?.value ?? "",

      DETAIL_INFORMASI: this.getElement("informasiSekolahDetail")?.value ?? "",
    };
  },

  /* =====================================
     SET FORM DATA
  ===================================== */

  setFormData(data) {
    const namaInput = this.getElement("informasiSekolahNama");

    const detailInput = this.getElement("informasiSekolahDetail");

    if (namaInput) {
      namaInput.value = data?.NAMA_INFORMASI ?? "";
    }

    if (detailInput) {
      detailInput.value = data?.DETAIL_INFORMASI ?? "";
    }

    this.updateMeta(data);
    this.updatePreview();
  },

  /* =====================================
     LOAD INFORMATION
  ===================================== */

  async loadInformation(source) {
    const requestedSource = source;
    const currentRequest = ++this.requestId;
    const currentRoot = this.root;

    this.loading = true;
    this.setBusy(true);
    this.showMessage("Memuat informasi sekolah...", "info");

    try {
      const data =
        await InformasiSekolahAdminService.getBySource(requestedSource);

      // Abaikan respons jika halaman sudah
      // berubah atau request sudah kedaluwarsa.
      if (
        currentRequest !== this.requestId ||
        currentRoot !== this.root ||
        !currentRoot.isConnected
      ) {
        return;
      }

      this.originalData = { ...data };
      this.setFormData(data);
      this.clearMessage();
    } catch (error) {
      if (
        currentRequest !== this.requestId ||
        currentRoot !== this.root ||
        !currentRoot.isConnected
      ) {
        return;
      }

      this.originalData = null;
      this.setFormData(
        InformasiSekolahAdminService.createEmpty(requestedSource),
      );

      this.showMessage(
        error?.message || "Gagal memuat informasi sekolah.",
        "error",
      );
    } finally {
      if (
        currentRequest === this.requestId &&
        currentRoot === this.root &&
        currentRoot.isConnected
      ) {
        this.loading = false;
        this.setBusy(false);
      }
    }
  },

  /* =====================================
     HANDLE SOURCE CHANGE
  ===================================== */

  async handleSourceChange(nextSource) {
    const select = this.getElement("informasiSekolahSource");

    if (this.loading || this.saving) {
      if (select) select.value = this.source;
      return;
    }

    if (nextSource === this.source) return;

    const currentData = this.getFormData();

    const hasChanges =
      this.originalData &&
      InformasiSekolahAdminService.hasChanges(currentData, this.originalData);

    if (hasChanges) {
      const confirmed = window.confirm(
        "Ada perubahan yang belum disimpan.\n\n" +
          "Yakin ingin mengganti pemberi informasi?",
      );

      if (!confirmed) {
        if (select) select.value = this.source;
        return;
      }
    }

    this.source = InformasiSekolahAdminService.validateSource(nextSource);

    if (select) select.value = this.source;

    this.originalData = null;
    this.setFormData(InformasiSekolahAdminService.createEmpty(this.source));

    await this.loadInformation(this.source);
  },

  /* =====================================
     CLEAR FORM TEXT
  ===================================== */

  clearForm() {
    if (this.loading || this.saving) return;

    const namaInput = this.getElement("informasiSekolahNama");

    const detailInput = this.getElement("informasiSekolahDetail");

    if (namaInput) namaInput.value = "";
    if (detailInput) detailInput.value = "";

    this.clearMessage();
    this.updatePreview();

    if (namaInput) namaInput.focus();
  },

  /* =====================================
     HANDLE SAVE
  ===================================== */

  async handleSave() {
    if (this.loading || this.saving) return;

    const currentRoot = this.root;
    const data = this.getFormData();

    this.saving = true;
    this.setBusy(true);
    this.clearMessage();

    try {
      const saved = await InformasiSekolahAdminService.save(data);

      if (currentRoot !== this.root || !currentRoot.isConnected) {
        return;
      }

      this.originalData = { ...saved };
      this.setFormData(saved);

      this.showMessage("Informasi sekolah berhasil disimpan.", "success");
    } catch (error) {
      if (currentRoot !== this.root || !currentRoot.isConnected) {
        return;
      }

      this.showMessage(
        error?.message || "Gagal menyimpan informasi sekolah.",
        "error",
      );
    } finally {
      if (currentRoot === this.root && currentRoot.isConnected) {
        this.saving = false;
        this.setBusy(false);
      }
    }
  },

  /* =====================================
     UPDATE META INFORMATION
  ===================================== */

  updateMeta(data) {
    const meta = this.getElement("informasiSekolahMeta");

    if (!meta) return;

    const tanggal = data?.TANGGAL_INFORMASI;

    const updatedBy = String(data?.UPDATED_BY ?? "").trim();

    if (!tanggal) {
      meta.textContent = "Informasi belum pernah diperbarui.";
      return;
    }

    const formattedDate = InformasiSekolahAdminService.formatDate(tanggal);

    meta.textContent =
      "Terakhir diperbarui: " +
      formattedDate +
      (updatedBy ? " • " + updatedBy : "");
  },

  /* =====================================
     SAFE HTML ESCAPE
  ===================================== */

  escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  },

  /* =====================================
     UPDATE LIVE PREVIEW
  ===================================== */

  updatePreview() {
    const preview = this.getElement("informasiSekolahPreview");

    if (!preview) return;

    const data = this.getFormData();

    const nama = String(data.NAMA_INFORMASI ?? "").trim();

    const detail = String(data.DETAIL_INFORMASI ?? "");

    if (!nama && !detail.trim()) {
      preview.innerHTML = `
        <div class="informasi-sekolah-preview-empty">
          Belum ada informasi untuk ditampilkan.
        </div>
      `;
      return;
    }

    const sourceLabel =
      this.source === "KURIKULUM" ? "Kurikulum" : "Guru Ngaji";

    preview.innerHTML = `
      <div class="informasi-sekolah-preview-source">
        ${this.escapeHtml(sourceLabel)}
      </div>

      <h4 class="informasi-sekolah-preview-title">
        ${this.escapeHtml(nama || "Tanpa Judul")}
      </h4>

      <div class="informasi-sekolah-preview-detail"
           style="white-space: pre-wrap; overflow-wrap: anywhere;">
        ${this.escapeHtml(detail)}
      </div>
    `;
  },

  /* =====================================
     SET BUSY STATE
  ===================================== */

  setBusy(busy) {
    const sourceSelect = this.getElement("informasiSekolahSource");

    const namaInput = this.getElement("informasiSekolahNama");

    const detailInput = this.getElement("informasiSekolahDetail");

    const clearButton = this.getElement("informasiSekolahClear");

    const saveButton = this.getElement("informasiSekolahSave");

    [sourceSelect, namaInput, detailInput, clearButton, saveButton].forEach(
      (element) => {
        if (element) element.disabled = busy;
      },
    );

    if (saveButton) {
      saveButton.textContent = this.saving
        ? "Menyimpan..."
        : "Simpan Informasi";
    }
  },

  /* =====================================
     SHOW MESSAGE
  ===================================== */

  showMessage(message, type = "info") {
    const element = this.getElement("informasiSekolahMessage");

    if (!element) return;

    element.hidden = false;
    element.textContent = message;
    element.dataset.type = type;
  },

  /* =====================================
     CLEAR MESSAGE
  ===================================== */

  clearMessage() {
    const element = this.getElement("informasiSekolahMessage");

    if (!element) return;

    element.hidden = true;
    element.textContent = "";
    delete element.dataset.type;
  },
};
