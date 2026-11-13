/* =========================================
   TEACHLY - DASHBOARD MODULE
========================================= */

const Dashboard = {
  initialized: false,
  loading: false,

  /* =====================================
     INITIALIZE
  ===================================== */

  async init() {
    if (this.loading) return;

    this.loading = true;
    this.bindEvents();
    this.renderLoading();

    try {
      // Identitas guru hanya digunakan secara internal.
      const guru = Auth.getGuru() || Auth.getUser() || {};

      const nbm = guru.NBM || guru.nbm || "";
      const namaGuru =
        guru.NAMA_GURU || guru.namaGuru || guru.NAMA || guru.nama || "Guru";

      if (!nbm) {
        throw new Error("NBM guru tidak ditemukan. Silakan login kembali.");
      }

      // Tampilkan nama guru pada sapaan.
      this.setText("[data-guru-nama]", namaGuru);

      // Ambil ringkasan laporan berdasarkan NBM.
      const result = await DashboardService.getSummary(nbm);

      if (!result || result.success !== true) {
        throw new Error(
          result?.message || "Gagal mengambil ringkasan Dashboard.",
        );
      }

      this.render(result.data || {});

      // Tahun ajaran aktif dimuat secara independen.
      await this.loadActiveAcademicYear();

      // =====================================
      // LOAD INFORMASI SEKOLAH
      // =====================================

      if (typeof DashboardInformasi !== "undefined") {
        console.log("[Dashboard] Memuat informasi sekolah...");

        DashboardInformasi.init();
      } else {
        console.warn("[Dashboard] Modul DashboardInformasi belum dimuat.");
      }

      this.initialized = true;

      console.log("[Dashboard] Berhasil dimuat.");
    } catch (error) {
      console.error("[Dashboard] Gagal memuat:", error);
      this.renderError(error.message);
    } finally {
      this.loading = false;
    }
  },

  /* =====================================
     BIND EVENTS
  ===================================== */

  bindEvents() {
    const logoutButton = document.querySelector('[data-action="logout"]');

    if (logoutButton && !logoutButton.dataset.bound) {
      logoutButton.dataset.bound = "true";

      logoutButton.addEventListener("click", () => {
        if (typeof Auth !== "undefined" && Auth.logout) {
          Auth.logout();
        }
      });
    }

    const createButton = document.querySelector(
      '[data-action="create-report"]',
    );

    if (createButton && !createButton.dataset.bound) {
      createButton.dataset.bound = "true";

      createButton.addEventListener("click", () => {
        this.openCreateReport();
      });
    }
  },

  /* =====================================
     LOADING
  ===================================== */

  renderLoading() {
    this.setText("[data-guru-nama]", "Memuat...");
    this.setText("[data-stat-total]", "...");
    this.setText("[data-stat-bulan]", "...");
    this.setText("[data-dashboard-date]", "Memuat...");
    this.setText("[data-tahun-ajaran]", "Memuat...");
  },

  updateReportSubmitState() {
    const form = document.getElementById("formLaporanHarian");
    const button = document.getElementById("btnKirimLaporan");

    if (!form || !button) return;

    const kategori = this.selectedReportCategory;

    let valid = form.checkValidity();

    const getValue = (id) => document.getElementById(id)?.value.trim() || "";

    if (kategori === "GURU_KELAS") {
      const adaDetail = [
        "haditsDoaKelas",
        "pendidikanAdabKelas",
        "ringkasanPembelajaranKelas",
        "kendalaKelas",
        "solusiKelas",
      ].some((id) => getValue(id));

      valid = valid && !!getValue("idKelasLaporan") && adaDetail;
    }

    if (kategori === "GURU_MAPEL") {
      valid =
        valid &&
        !!getValue("idKelasMapelLaporan") &&
        !!getValue("idMapelLaporan") &&
        !!getValue("ringkasanPembelajaranMapel");
    }

    if (kategori === "GURU_NGAJI") {
      valid =
        valid &&
        !!getValue("idSesiNgajiLaporan") &&
        this.selectedReportGroups.length > 0 &&
        !!getValue("halamanSuratAyat");
    }

    button.disabled = !valid || this.reportSubmitting;
  },

  /* =====================================
     RENDER DATA
  ===================================== */

  render(data) {
    const tanggalHariIni = new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Jakarta",
    });

    this.setText("[data-dashboard-date]", this.formatDate(tanggalHariIni));

    this.setText(
      "[data-stat-total]",
      this.formatNumber(data.totalLaporan || 0),
    );

    this.setText(
      "[data-stat-bulan]",
      this.formatNumber(data.laporanBulanIni || 0),
    );

    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  /* =====================================
   ACTIVE ACADEMIC YEAR
===================================== */

  async loadActiveAcademicYear() {
    const element = document.querySelector("[data-tahun-ajaran]");

    if (!element) return;

    element.textContent = "Memuat...";

    try {
      const response = await API.post("tahunAjaran.aktif");

      if (!response || response.success !== true || !response.data) {
        throw new Error(
          response?.message || "Gagal memuat tahun ajaran aktif.",
        );
      }

      const tahunAjaran = response.data;

      element.textContent = tahunAjaran.NAMA_TAHUN_AJARAN || "-";

      console.log(
        "[Dashboard] Tahun ajaran aktif berhasil dimuat.",
        tahunAjaran,
      );
    } catch (error) {
      console.error("[Dashboard] Gagal memuat tahun ajaran aktif:", error);

      element.textContent = "-";
    }
  },

  /* =====================================
     FORMAT DATE
  ===================================== */

  formatDate(value) {
    if (!value) return "-";

    const parts = String(value).split("-");

    if (parts.length !== 3) return value;

    const date = new Date(
      Number(parts[0]),
      Number(parts[1]) - 1,
      Number(parts[2]),
    );

    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  },

  /* =====================================
     FORMAT NUMBER
  ===================================== */

  formatNumber(value) {
    return new Intl.NumberFormat("id-ID").format(value);
  },

  /* =====================================
     SET TEXT
  ===================================== */

  setText(selector, value) {
    const element = document.querySelector(selector);

    if (element) {
      element.textContent = value;
    }
  },

  /* =====================================
     ERROR
  ===================================== */

  renderError(message) {
    this.setText("[data-stat-total]", "-");
    this.setText("[data-stat-bulan]", "-");
    this.setText("[data-dashboard-date]", "-");
    this.setText("[data-tahun-ajaran]", "-");

    const content = document.querySelector(".dashboard-content");

    if (!content) return;

    let errorElement = content.querySelector(".dashboard-error");

    if (!errorElement) {
      errorElement = document.createElement("div");
      errorElement.className = "dashboard-error";
      content.prepend(errorElement);
    }

    errorElement.textContent =
      message || "Dashboard gagal dimuat. Silakan coba kembali.";
  },

  /* =====================================
   OPEN FORM LAPORAN
===================================== */

  async openCreateReport() {
    const tanggalHariIni = new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Jakarta",
    });

    this.reportFormOptions = null;
    this.reportSubmitting = false;
    this.selectedReportCategory = "";
    this.reportUploads = {};

    Modal.open({
      title: `
      <div class="report-modal-heading">
        <span>Buat Laporan Harian</span>
        <small>Catat kegiatan pembelajaran Anda.</small>
      </div>      
    `,
      size: "lg",

      body: `
      <form id="formLaporanHarian" class="report-form">

        <!-- IDENTITAS LAPORAN -->
        <div class="report-section">
          <h3>Identitas Laporan</h3>

          <div class="report-form-group">
            <label for="kategoriLaporan">Kategori Laporan</label>
            <select id="kategoriLaporan" required>
              <option value="">Pilih kategori laporan</option>
              <option value="GURU_KELAS">Guru Kelas</option>
              <option value="GURU_MAPEL">Guru Mapel</option>
              <option value="GURU_NGAJI">Guru Ngaji</option>
            </select>
          </div>

          <div class="report-form-group">
            <label for="tanggalLaporan">Tanggal Laporan</label>
            <input
              type="date"
              id="tanggalLaporan"
              value="${tanggalHariIni}"
              required
            >
          </div>
        </div>

        <!-- PILIHAN MASTER -->
        <div id="sectionPilihanLaporan" class="report-section" hidden>
          <h3>Informasi Pembelajaran</h3>

          <div id="pilihanGuruKelas" hidden>
            <div class="report-form-group">
              <label for="idKelasLaporan">Kelas</label>
              <select id="idKelasLaporan">
                <option value="">Pilih kelas</option>
              </select>
            </div>
          </div>

          <div id="pilihanGuruMapel" hidden>
            <div class="report-form-group">
              <label for="idKelasMapelLaporan">Kelas</label>
              <select id="idKelasMapelLaporan">
                <option value="">Pilih kelas</option>
              </select>
            </div>

            <div class="report-form-group">
              <label for="idMapelLaporan">Mata Pelajaran</label>
              <select id="idMapelLaporan">
                <option value="">Pilih mata pelajaran</option>
              </select>
            </div>
          </div>

          <div id="pilihanGuruNgaji" hidden>

          <div class="report-form-group">
              <label for="idSesiNgajiLaporan">Sesi Ngaji</label>
              <select id="idSesiNgajiLaporan">
                <option value="">Pilih sesi ngaji</option>
              </select>
            </div>

            <div class="report-form-group">
              <label for="idKelompokLaporan">Kelompok Ngaji / Tingkat</label>
              <select id="idKelompokLaporan">
                <option value="">Pilih Tingkat</option>
              </select>
            </div>

            <div
              id="daftarKelompokNgaji"
              class="report-selected-groups"
            ></div>
            
          </div>
        </div>

        <!-- REKAP KEHADIRAN -->
        <div id="sectionKehadiranLaporan" class="report-section" hidden>
          <h3>Rekap Ketidakhadiran</h3>

          <p class="report-section-info">
            Masukkan jumlah murid yang tidak hadir.
          </p>

          <div class="report-form-row">
            <div class="report-form-group">
              <label for="sakitLaporan">Sakit</label>
              <input
                type="number"
                id="sakitLaporan"
                min="0"
                step="1"
                value="0"
                required
              >
            </div>

            <div class="report-form-group">
              <label for="izinLaporan">Izin</label>
              <input
                type="number"
                id="izinLaporan"
                min="0"
                step="1"
                value="0"
                required
              >
            </div>

            <div class="report-form-group">
              <label for="alpaLaporan">Alpa</label>
              <input
                type="number"
                id="alpaLaporan"
                min="0"
                step="1"
                value="0"
                required
              >
            </div>
          </div>
        </div>

        <!-- FORM GURU KELAS -->
        <div id="sectionGuruKelas" hidden>
          <div class="report-section">
            <h3>Detail Pembelajaran Guru Kelas</h3>

            <div class="report-form-group">
              <label for="haditsDoaKelas">Hadits dan Doa</label>
              <textarea id="haditsDoaKelas" rows="3"></textarea>
            </div>

            <div class="report-form-group">
              <label for="pendidikanAdabKelas">Pendidikan Adab</label>
              <textarea id="pendidikanAdabKelas" rows="3"></textarea>
            </div>

            <div class="report-form-group">
              <label for="ringkasanPembelajaranKelas">
                Ringkasan Pembelajaran
              </label>
              <textarea
                id="ringkasanPembelajaranKelas"
                rows="4"
              ></textarea>
            </div>

            <div class="report-form-group">
              <label for="kendalaKelas">Kendala</label>
              <textarea id="kendalaKelas" rows="3"></textarea>
            </div>

            <div class="report-form-group">
              <label for="solusiKelas">Solusi</label>
              <textarea id="solusiKelas" rows="3"></textarea>
            </div>
          </div>
        </div>

        <!-- FORM GURU MAPEL -->
        <div id="sectionGuruMapel" hidden>
          <div class="report-section">
            <h3>Detail Pembelajaran Guru Mapel</h3>

            <div class="report-form-group">
              <label for="ringkasanPembelajaranMapel">
                Ringkasan Pembelajaran
              </label>
              <textarea
                id="ringkasanPembelajaranMapel"
                rows="4"
              ></textarea>
            </div>

            <div class="report-form-group">
              <label for="kendalaMapel">Kendala</label>
              <textarea id="kendalaMapel" rows="3"></textarea>
            </div>

            <div class="report-form-group">
              <label for="solusiMapel">Solusi</label>
              <textarea id="solusiMapel" rows="3"></textarea>
            </div>
          </div>
        </div>

        <!-- LAMPIRAN GAMBAR GURU KELAS / MAPEL -->
        <div id="sectionReportUploads" hidden>
          <div class="report-section">
            ${this.renderReportImageUploadFields()}
          </div>
        </div>

        <!-- FORM GURU NGAJI -->
        <div id="sectionGuruNgaji" hidden>
          <div class="report-section">
            <h3>Detail Pembelajaran Ngaji</h3>          

            <div class="report-form-group">
              <label for="halamanSuratAyat">
                Halaman / Surat / Ayat
              </label>
              <input type="text" id="halamanSuratAyat">
            </div>

            <div class="report-form-group">
              <label for="hafalanQuran">Hafalan Al-Qur'an</label>
              <textarea id="hafalanQuran" rows="3"></textarea>
            </div>

            <div class="report-form-group">
              <label for="catatanPembelajaranNgaji">
                Catatan Pembelajaran
              </label>
              <textarea id="catatanPembelajaranNgaji" rows="3"></textarea>
            </div>

            <div class="report-form-group">
              <label for="kendalaNgaji">Kendala</label>
              <textarea id="kendalaNgaji" rows="3"></textarea>
            </div>

            <div class="report-form-group">
              <label for="solusiNgaji">Solusi</label>
              <textarea id="solusiNgaji" rows="3"></textarea>
            </div>
          </div>
        </div>

      </form>
    `,

      footer: `
      <button
        type="button"
        class="btn btn-outline"
        id="btnBatalLaporan"
      >
        Batal
      </button>

      <button
        type="button"
        class="btn btn-primary"
        id="btnKirimLaporan"
        disabled
      >
        <i data-lucide="send"></i>
        Kirim Laporan
      </button>
    `,
    });

    // EVENT KATEGORI
    document
      .getElementById("kategoriLaporan")
      ?.addEventListener("change", (event) => {
        const kategori = event.target.value;

        this.selectedReportCategory = kategori;

        this.renderReportCategory(kategori);
        this.updateReportSubmitState();
      });

    // VALIDASI FORM DAN STATUS TOMBOL KIRIM
    const reportForm = document.getElementById("formLaporanHarian");

    reportForm?.addEventListener("input", () => {
      this.updateReportSubmitState();
    });

    reportForm?.addEventListener("change", () => {
      this.updateReportSubmitState();
    });

    // EVENT UPLOAD GAMBAR (Guru Kelas dan Guru Mapel)
    this.bindReportImageUploads();

    // EVENT PILIH KELOMPOK NGAJI
    this.selectedReportGroups = [];

    document
      .getElementById("idKelompokLaporan")
      ?.addEventListener("change", (event) => {
        const select = event.target;
        const selectedOption = select.options[select.selectedIndex];

        if (!select.value || !selectedOption) return;

        const idKelompok = select.value;
        const namaKelompok = selectedOption.textContent.trim();

        const sudahAda = this.selectedReportGroups.some(
          (item) => item.ID_KELOMPOK === idKelompok,
        );

        if (!sudahAda) {
          this.selectedReportGroups.push({
            ID_KELOMPOK: idKelompok,
            NAMA_KELOMPOK: namaKelompok,
          });

          this.renderSelectedReportGroups();
          this.updateReportSubmitState();
        }

        select.value = "";
      });

    // TOMBOL BATAL
    document
      .getElementById("btnBatalLaporan")
      ?.addEventListener("click", () => {
        Modal.close();
      });

    // TOMBOL KIRIM
    document
      .getElementById("btnKirimLaporan")
      ?.addEventListener("click", () => {
        this.submitLaporan();
      });

    // MUAT PILIHAN MASTER
    await this.loadReportFormOptions();
  },

  renderReportImageUploadFields() {
    const fields = [
      { id: "modulAjarUpload", name: "MODUL_AJAR", label: "Modul Ajar" },
      { id: "asesmenUpload", name: "ASESMEN", label: "Asesmen" },
      { id: "dokumentasiUpload", name: "DOKUMENTASI", label: "Dokumentasi" },
    ];

    return `
      <div class="report-image-uploads">
        <h4>Lampiran Gambar</h4>
        <p class="report-section-info">
          Pilih gambar JPG, PNG, atau WEBP. Gambar akan dikompres otomatis
          dengan target ukuran di bawah 100 KB.
        </p>
        ${fields
          .map(
            (field) => `
          <div class="report-form-group report-image-field">
            <label for="${field.id}">${field.label}</label>
            <input
              type="file"
              id="${field.id}"
              accept="image/jpeg,image/png,image/webp"
              data-report-image="${field.name}"
            >
            <small id="${field.id}Status">Belum ada gambar dipilih.</small>
            <img
              id="${field.id}Preview"
              alt="Preview ${field.label}"
              hidden
              style="display:none;max-width:100%;max-height:180px;object-fit:contain;border-radius:8px;margin-top:8px;"
            >
          </div>
        `,
          )
          .join("")}
      </div>
    `;
  },

  async compressReportImage(file, maxBytes = 100 * 1024) {
    if (!file || !file.type || !file.type.startsWith("image/")) {
      throw new Error("File harus berupa gambar.");
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      throw new Error("Format gambar harus JPG, PNG, atau WEBP.");
    }

    const imageUrl = URL.createObjectURL(file);

    try {
      const image = new Image();
      image.src = imageUrl;

      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = () => reject(new Error("Gambar tidak dapat dibaca."));
      });

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) throw new Error("Browser tidak mendukung kompresi gambar.");

      let width = image.naturalWidth;
      let height = image.naturalHeight;
      const maxDimension = 1600;

      if (Math.max(width, height) > maxDimension) {
        const scale = maxDimension / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }

      let dataUrl = "";

      for (let resizeAttempt = 0; resizeAttempt < 6; resizeAttempt++) {
        canvas.width = width;
        canvas.height = height;
        context.clearRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);

        let quality = 0.82;

        for (let qualityAttempt = 0; qualityAttempt < 8; qualityAttempt++) {
          dataUrl = canvas.toDataURL("image/jpeg", quality);
          const base64Length = dataUrl.split(",")[1].length;
          const estimatedBytes = Math.ceil((base64Length * 3) / 4);

          if (estimatedBytes <= maxBytes) return dataUrl;

          quality -= 0.08;
        }

        width = Math.round(width * 0.8);
        height = Math.round(height * 0.8);
      }

      throw new Error(
        "Gambar terlalu besar untuk dikompres di bawah 100 KB. Coba gambar lain.",
      );
    } finally {
      URL.revokeObjectURL(imageUrl);
    }
  },

  bindReportImageUploads() {
    const inputs = document.querySelectorAll("[data-report-image]");

    inputs.forEach((input) => {
      if (input.dataset.bound === "true") return;
      input.dataset.bound = "true";

      input.addEventListener("change", async () => {
        const fieldName = input.dataset.reportImage;
        const preview = document.getElementById(input.id + "Preview");
        const status = document.getElementById(input.id + "Status");

        this.reportUploads = this.reportUploads || {};
        delete this.reportUploads[fieldName];

        if (preview) {
          preview.removeAttribute("src");
          preview.hidden = true;
          preview.style.display = "none";
        }

        const file = input.files && input.files[0];
        if (!file) {
          if (status) status.textContent = "Belum ada gambar dipilih.";
          this.updateReportSubmitState();
          return;
        }

        if (status) status.textContent = "Mengompres gambar...";

        try {
          const dataUrl = await this.compressReportImage(file);
          this.reportUploads[fieldName] = dataUrl;

          if (preview) {
            preview.src = dataUrl;
            preview.hidden = false;
            preview.style.display = "block";
          }

          const sizeKB = Math.ceil(
            (dataUrl.split(",")[1].length * 3) / 4 / 1024,
          );
          if (status) status.textContent = `Siap diunggah • ${sizeKB} KB`;
        } catch (error) {
          input.value = "";
          if (status) status.textContent = error.message;
          alert(error.message);
        }

        this.updateReportSubmitState();
      });
    });
  },

  renderSelectedReportGroups() {
    const container = document.getElementById("daftarKelompokNgaji");

    if (!container) return;

    container.replaceChildren();

    if (!this.selectedReportGroups?.length) {
      this.updateReportSubmitState();
      return;
    }

    const list = document.createElement("div");
    list.className = "selected-groups-list";

    this.selectedReportGroups.forEach((item, index) => {
      const row = document.createElement("div");
      row.className = "selected-group-item";

      const name = document.createElement("span");
      name.textContent = item.NAMA_KELOMPOK;

      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.className = "btn-remove-group";
      removeButton.setAttribute("aria-label", "Hapus kelompok");

      const icon = document.createElement("i");
      icon.setAttribute("data-lucide", "x");

      removeButton.appendChild(icon);

      removeButton.addEventListener("click", () => {
        this.selectedReportGroups.splice(index, 1);
        this.renderSelectedReportGroups();
      });

      row.append(name, removeButton);
      list.appendChild(row);
    });

    container.appendChild(list);

    if (window.lucide) {
      window.lucide.createIcons();
    }

    this.updateReportSubmitState();
  },

  renderReportCategory(kategori) {
    const isKelas = kategori === "GURU_KELAS";
    const isMapel = kategori === "GURU_MAPEL";
    const isNgaji = kategori === "GURU_NGAJI";

    // Tampilkan bagian pilihan master
    document.getElementById("sectionPilihanLaporan").hidden = !kategori;

    // Tampilkan bagian kehadiran
    document.getElementById("sectionKehadiranLaporan").hidden = !kategori;

    // Tampilkan pilihan berdasarkan kategori
    document.getElementById("pilihanGuruKelas").hidden = !isKelas;
    document.getElementById("pilihanGuruMapel").hidden = !isMapel;
    document.getElementById("pilihanGuruNgaji").hidden = !isNgaji;

    // Tampilkan detail pembelajaran
    document.getElementById("sectionGuruKelas").hidden = !isKelas;
    document.getElementById("sectionGuruMapel").hidden = !isMapel;
    document.getElementById("sectionGuruNgaji").hidden = !isNgaji;

    const uploadSection = document.getElementById("sectionReportUploads");
    if (uploadSection) {
      uploadSection.hidden = !(isKelas || isMapel);
    }

    // Field wajib setiap kategori
    const requiredFields = {
      GURU_KELAS: ["idKelasLaporan"],
      GURU_MAPEL: ["idKelasMapelLaporan", "idMapelLaporan"],
      GURU_NGAJI: ["idSesiNgajiLaporan", "halamanSuratAyat"],
    };

    // Reset seluruh status required
    [
      "idKelasLaporan",
      "idKelasMapelLaporan",
      "idMapelLaporan",
      "idKelompokLaporan",
      "idSesiNgajiLaporan",
      "tingkatNgaji",
      "halamanSuratAyat",
    ].forEach((id) => {
      const element = document.getElementById(id);
      if (element) element.required = false;
    });

    // Aktifkan required kategori terpilih
    (requiredFields[kategori] || []).forEach((id) => {
      const element = document.getElementById(id);
      if (element) element.required = true;
    });

    // Reset daftar kelompok ketika kategori berganti
    this.selectedReportGroups = [];
    this.reportUploads = {};

    ["modulAjarUpload", "asesmenUpload", "dokumentasiUpload"].forEach((id) => {
      const input = document.getElementById(id);
      const preview = document.getElementById(id + "Preview");
      const status = document.getElementById(id + "Status");
      if (input) input.value = "";
      if (preview) {
        preview.removeAttribute("src");
        preview.hidden = true;
        preview.style.display = "none";
      }
      if (status) status.textContent = "Belum ada gambar dipilih.";
    });

    const kelompokSelect = document.getElementById("idKelompokLaporan");

    if (kelompokSelect) {
      kelompokSelect.value = "";
    }

    const daftarKelompok = document.getElementById("daftarKelompokNgaji");

    if (daftarKelompok) {
      daftarKelompok.innerHTML = "";
    }

    // Reset tombol kirim
    const submitButton = document.getElementById("btnKirimLaporan");

    if (submitButton) {
      submitButton.disabled = true;
    }

    // Perbarui ikon
    if (window.lucide) {
      lucide.createIcons();
    }
  },

  async loadReportFormOptions() {
    const setOptions = (
      selectId,
      items,
      valueField,
      labelField,
      placeholder,
    ) => {
      const select = document.getElementById(selectId);
      if (!select) return;

      select.innerHTML = "";

      const defaultOption = document.createElement("option");
      defaultOption.value = "";
      defaultOption.textContent = placeholder;
      select.appendChild(defaultOption);

      (Array.isArray(items) ? items : []).forEach((item) => {
        const value = item[valueField];

        if (value === undefined || value === null || value === "") return;

        const option = document.createElement("option");
        option.value = String(value);
        option.textContent = item[labelField] || String(value);

        select.appendChild(option);
      });

      select.disabled = select.options.length <= 1;
    };

    try {
      // Ambil pilihan master dari backend
      const response = await API.post("laporan.formOptions", {});

      if (!response || response.success !== true || !response.data) {
        throw new Error(response?.message || "Gagal memuat pilihan laporan.");
      }

      const data = response.data;

      // Simpan pilihan master
      this.reportFormOptions = data;

      // =====================================
      // GURU KELAS
      // =====================================

      const guruKelas = data.GURU_KELAS || {};

      setOptions(
        "idKelasLaporan",
        guruKelas.kelas,
        "ID_KELAS",
        "NAMA_KELAS",
        "Pilih kelas",
      );

      // =====================================
      // GURU MAPEL
      // =====================================

      const guruMapel = data.GURU_MAPEL || {};

      setOptions(
        "idKelasMapelLaporan",
        guruMapel.kelas,
        "ID_KELAS",
        "NAMA_KELAS",
        "Pilih kelas",
      );

      setOptions(
        "idMapelLaporan",
        guruMapel.mataPelajaran,
        "ID_MAPEL",
        "NAMA_MAPEL",
        "Pilih mata pelajaran",
      );

      // =====================================
      // GURU NGAJI
      // =====================================

      const guruNgaji = data.GURU_NGAJI || {};

      setOptions(
        "idKelompokLaporan",
        guruNgaji.kelompokNgaji,
        "ID_KELOMPOK",
        "NAMA_KELOMPOK",
        "Pilih kelompok ngaji",
      );

      setOptions(
        "idSesiNgajiLaporan",
        guruNgaji.sesiNgaji,
        "ID_SESI",
        "NAMA_SESI",
        "Pilih sesi ngaji",
      );

      console.log("[Dashboard] Pilihan laporan berhasil dimuat.", data);
    } catch (error) {
      console.error("[Dashboard] Gagal memuat pilihan laporan:", error);

      this.reportFormOptions = null;

      alert(error.message || "Gagal memuat pilihan laporan.");
    } finally {
      this.updateReportSubmitState();
    }
  },

  updateReportSourceInfo(selectedId) {
    const state = this.reportFormOptions;
    if (!state) return;

    const selected = state.options.find(
      (item) => String(item[state.setting.valueField]) === String(selectedId),
    );

    const kelas = document.getElementById("kelasLaporan");
    const mapel = document.getElementById("mapelLaporan");
    const jumlah = document.getElementById("jumlahPesertaLaporan");
    const info = document.getElementById("infoSumberLaporan");
    const button = document.getElementById("btnKirimLaporan");

    kelas.value = "";
    mapel.value = "";
    jumlah.value = "0";

    ["sakitLaporan", "izinLaporan", "alpaLaporan"].forEach((id) => {
      document.getElementById(id).value = "0";
    });

    document.getElementById("jumlahTidakHadirLaporan").textContent = "0";

    if (!selected) {
      info.textContent = state.setting.info;
      button.disabled = true;
      this.updateAttendanceSummary();
      return;
    }

    // Isi identitas sumber terlebih dahulu.
    if (state.jenisGuru === "GURU_KELAS") {
      kelas.value = selected.ID_KELAS || "";
    }

    if (state.jenisGuru === "GURU_MAPEL") {
      kelas.value = selected.ID_KELAS || "";
      mapel.value = selected.ID_MAPEL || "";

      info.textContent =
        [
          selected.HARI || "",
          selected.JAM_MULAI && selected.JAM_SELESAI
            ? selected.JAM_MULAI + " - " + selected.JAM_SELESAI
            : "",
        ]
          .filter(Boolean)
          .join(" • ") || state.setting.info;
    }

    if (state.jenisGuru === "GURU_NGAJI") {
      kelas.value = selected.ID_KELOMPOK_NGAJI || selected.ID_KELOMPOK || "";
    }

    // Validasi jumlah peserta dari backend.
    const peserta = Number(selected.JUMLAH_PESERTA);

    if (
      selected.JUMLAH_PESERTA === undefined ||
      selected.JUMLAH_PESERTA === null ||
      selected.JUMLAH_PESERTA === "" ||
      !Number.isSafeInteger(peserta) ||
      peserta < 0
    ) {
      jumlah.value = "0";

      info.textContent =
        "Data jadwal berhasil dimuat, tetapi jumlah peserta belum dikirim server.";

      button.disabled = true;
      this.updateAttendanceSummary();
      return;
    }

    jumlah.value = String(peserta);

    if (state.jenisGuru === "GURU_NGAJI") {
      info.textContent =
        "Kelompok ngaji dipilih. Jumlah peserta aktif: " + peserta;
    }

    this.updateAttendanceSummary();
  },

  /* =====================================
   REPORT FORM EVENTS
===================================== */

  bindReportForm() {
    const form = document.getElementById("formLaporanHarian");
    const dateInput = document.getElementById("tanggalLaporan");
    const dayInput = document.getElementById("hariLaporan");

    const updateDay = () => {
      if (!dateInput.value) {
        dayInput.value = "";
        return;
      }

      const date = new Date(dateInput.value + "T12:00:00");

      dayInput.value = new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
      }).format(date);
    };

    dateInput.addEventListener("change", updateDay);
    updateDay();

    ["sakitLaporan", "izinLaporan", "alpaLaporan"].forEach((id) => {
      document.getElementById(id).addEventListener("input", () => {
        this.updateAttendanceSummary();
      });
    });

    document
      .getElementById("btnBatalLaporan")
      .addEventListener("click", () => Modal.close());

    document
      .getElementById("btnKirimLaporan")
      .addEventListener("click", () => this.submitLaporan());

    form.addEventListener("submit", (event) => {
      event.preventDefault();
    });
  },

  updateAttendanceSummary() {
    const getCount = (id) => Number(document.getElementById(id).value || 0);

    const sakit = getCount("sakitLaporan");
    const izin = getCount("izinLaporan");
    const alpa = getCount("alpaLaporan");
    const jumlahPeserta = getCount("jumlahPesertaLaporan");

    const totalTidakHadir = sakit + izin + alpa;
    const hadir = jumlahPeserta - totalTidakHadir;

    document.getElementById("jumlahTidakHadirLaporan").textContent =
      totalTidakHadir.toLocaleString("id-ID");

    const info = document.getElementById("infoKehadiranLaporan");
    const button = document.getElementById("btnKirimLaporan");

    const valid =
      [sakit, izin, alpa].every(
        (value) => Number.isSafeInteger(value) && value >= 0,
      ) &&
      totalTidakHadir <= jumlahPeserta &&
      !!document.getElementById("sumberLaporan").value;

    info.textContent =
      `Jumlah tidak hadir ${totalTidakHadir} dari ${jumlahPeserta} peserta. ` +
      `Hadir otomatis: ${Math.max(0, hadir)}.`;

    info.style.color = valid
      ? "var(--success, #16834a)"
      : "var(--danger, #dc3545)";

    if (!this.reportSubmitting) {
      button.disabled = !valid;
    }
  },

  async submitLaporan() {
    if (this.reportSubmitting) return;

    const form = document.getElementById("formLaporanHarian");

    if (!form || !form.reportValidity()) return;

    const kategori = this.selectedReportCategory;

    if (!["GURU_KELAS", "GURU_MAPEL", "GURU_NGAJI"].includes(kategori)) {
      alert("Silakan pilih kategori laporan.");
      return;
    }

    // =====================================
    // IDENTITAS GURU
    // =====================================

    const guru = Auth.getGuru();

    if (!guru || !guru.NBM) {
      alert("Identitas guru tidak ditemukan. Silakan login kembali.");
      return;
    }

    const payload = {
      NBM: String(guru.NBM).trim(),
    };

    const getValue = (id) => {
      const element = document.getElementById(id);
      return element ? element.value.trim() : "";
    };

    const getNumber = (id) => {
      const value = Number(getValue(id));

      return Number.isSafeInteger(value) && value >= 0 ? value : NaN;
    };

    // =====================================
    // TANGGAL DAN ABSENSI
    // =====================================

    payload.TANGGAL_LAPORAN = getValue("tanggalLaporan");

    const attendance = {
      SAKIT: getNumber("sakitLaporan"),
      IZIN: getNumber("izinLaporan"),
      ALPA: getNumber("alpaLaporan"),
    };

    if (
      Object.values(attendance).some((value) => !Number.isSafeInteger(value))
    ) {
      alert(
        "Jumlah Sakit, Izin, dan Alpa harus berupa angka bulat tidak negatif.",
      );
      return;
    }

    Object.assign(payload, attendance);

    let endpoint = "";

    // =====================================
    // GURU KELAS
    // =====================================

    if (kategori === "GURU_KELAS") {
      endpoint = "laporan.createGuruKelas";

      payload.ID_KELAS = getValue("idKelasLaporan");

      payload.HADITS_DOA = getValue("haditsDoaKelas");
      payload.PENDIDIKAN_ADAB = getValue("pendidikanAdabKelas");
      payload.RINGKASAN_PEMBELAJARAN = getValue("ringkasanPembelajaranKelas");
      payload.KENDALA = getValue("kendalaKelas");
      payload.SOLUSI = getValue("solusiKelas");
      payload.UPLOADS = this.reportUploads || {};

      if (!payload.ID_KELAS) {
        alert("Silakan pilih kelas.");
        return;
      }

      if (
        !payload.HADITS_DOA &&
        !payload.PENDIDIKAN_ADAB &&
        !payload.RINGKASAN_PEMBELAJARAN &&
        !payload.KENDALA &&
        !payload.SOLUSI
      ) {
        alert("Isi minimal satu informasi pembelajaran.");
        return;
      }
    }

    // =====================================
    // GURU MAPEL
    // =====================================

    if (kategori === "GURU_MAPEL") {
      endpoint = "laporan.createGuruMapel";

      payload.ID_KELAS = getValue("idKelasMapelLaporan");
      payload.ID_MAPEL = getValue("idMapelLaporan");

      payload.RINGKASAN_PEMBELAJARAN = getValue("ringkasanPembelajaranMapel");
      payload.KENDALA = getValue("kendalaMapel");
      payload.SOLUSI = getValue("solusiMapel");
      payload.UPLOADS = this.reportUploads || {};

      if (!payload.ID_KELAS || !payload.ID_MAPEL) {
        alert("Silakan pilih kelas dan mata pelajaran.");
        return;
      }

      if (!payload.RINGKASAN_PEMBELAJARAN) {
        alert("Ringkasan pembelajaran wajib diisi.");
        return;
      }
    }

    // =====================================
    // GURU NGAJI
    // =====================================

    if (kategori === "GURU_NGAJI") {
      endpoint = "laporan.createGuruNgaji";

      payload.ID_SESI = getValue("idSesiNgajiLaporan");

      // Ambil nama kelompok dari daftar kelompok terpilih.
      const selectedGroups = this.selectedReportGroups || [];

      const groupNames = selectedGroups
        .map((item) => {
          return typeof item === "string"
            ? item.trim()
            : String(item.NAMA_KELOMPOK || "").trim();
        })
        .filter(Boolean);

      payload.KELOMPOK_NGAJI = [...new Set(groupNames)].join(", ");

      payload.HALAMAN_SURAT_AYAT = getValue("halamanSuratAyat");
      payload.HAFALAN_QURAN = getValue("hafalanQuran");
      payload.CATATAN_PEMBELAJARAN = getValue("catatanPembelajaranNgaji");
      payload.KENDALA = getValue("kendalaNgaji");
      payload.SOLUSI = getValue("solusiNgaji");

      if (!payload.ID_SESI) {
        alert("Silakan pilih sesi ngaji.");
        return;
      }

      if (!payload.KELOMPOK_NGAJI) {
        alert("Silakan pilih minimal satu kelompok ngaji.");
        return;
      }

      if (!payload.HALAMAN_SURAT_AYAT) {
        alert("Halaman / Surat / Ayat wajib diisi.");
        return;
      }
    }

    // =====================================
    // KIRIM LAPORAN
    // =====================================

    const button = document.getElementById("btnKirimLaporan");

    if (!button) return;

    const originalContent = button.innerHTML;

    this.reportSubmitting = true;
    button.disabled = true;
    button.textContent = "Mengirim...";

    try {
      const response = await API.post(endpoint, payload);

      if (!response || response.success !== true) {
        throw new Error(response?.message || "Gagal mengirim laporan.");
      }

      alert(response.message || "Laporan berhasil dikirim.");

      Modal.close();

      this.initialized = false;
      await this.init();
    } catch (error) {
      console.error("[Dashboard] Gagal mengirim laporan:", error);

      alert(error.message || "Terjadi kesalahan saat mengirim laporan.");
    } finally {
      this.reportSubmitting = false;

      const currentButton = document.getElementById("btnKirimLaporan");

      if (currentButton) {
        currentButton.innerHTML = originalContent;
        this.updateReportSubmitState();

        if (window.lucide) {
          lucide.createIcons();
        }
      }
    }
  },
};
