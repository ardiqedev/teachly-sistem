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
      const data = await DashboardService.getSummary();

      this.render(data);

      this.initialized = true;

      console.log("[Dashboard] Berhasil dimuat.", data);
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
    this.setText("[data-stat-total]", "...");
    this.setText("[data-stat-bulan]", "...");
    this.setText("[data-guru-nama]", "Memuat...");
    this.setText("[data-guru-jenis]", "-");
    this.setText("[data-guru-nbm]", "-");
    this.setText("[data-dashboard-date]", "Memuat...");
    this.setText("[data-tahun-ajaran]", "Memuat...");
  },

  /* =====================================
     RENDER DATA
  ===================================== */

  render(data) {
    this.setText("[data-guru-nama]", data.guru.namaGuru);

    this.setText("[data-guru-jenis]", data.guru.jenisGuru.replaceAll("_", " "));

    this.setText("[data-guru-nbm]", data.guru.nbm);

    this.setText("[data-dashboard-date]", this.formatDate(data.tanggal));

    this.setText("[data-tahun-ajaran]", data.tahunAjaran);

    this.setText(
      "[data-stat-total]",
      this.formatNumber(data.statistik.totalLaporan),
    );

    this.setText(
      "[data-stat-bulan]",
      this.formatNumber(data.statistik.laporanBulanIni),
    );

    if (window.lucide) {
      window.lucide.createIcons();
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
    this.setText("[data-guru-nama]", "Guru");
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
        <input type="hidden" id="idTahunAjaranLaporan">

        <div class="report-form-group">
          <label for="tanggalLaporan">Tanggal Laporan</label>
          <input type="date" id="tanggalLaporan"
            value="${tanggalHariIni}" required>
        </div>

        <div class="report-form-group">
          <label for="hariLaporan">Hari</label>
          <input type="text" id="hariLaporan" readonly>
        </div>

        <div class="report-form-group">
          <label id="labelSumberLaporan" for="sumberLaporan">
            Memuat pilihan...
          </label>
          <select id="sumberLaporan" disabled required>
            <option value="">Memuat pilihan dari server...</option>
          </select>
          <small id="infoSumberLaporan">
            Pilihan mengikuti penugasan akun Anda.
          </small>
        </div>

        <div class="report-form-row">
          <div class="report-form-group" id="groupKelasLaporan">
            <label id="labelKelasLaporan">Kelas</label>
            <input type="text" id="kelasLaporan"
              placeholder="Otomatis" readonly>
          </div>

          <div class="report-form-group" id="groupMapelLaporan">
            <label>Mata Pelajaran</label>
            <input type="text" id="mapelLaporan"
              placeholder="Otomatis" readonly>
          </div>
        </div>

        <div class="report-form-group" id="groupSesiNgaji" hidden>
          <label for="sesiNgaji">Sesi Ngaji</label>
          <select id="sesiNgaji">
            <option value="">Pilih sesi ngaji</option>
          </select>
        </div>

        <div class="report-section">
          <h3>Rekap Kehadiran</h3>
          <p class="report-section-info">
            Jumlah peserta dihitung otomatis berdasarkan penempatan aktif.
          </p>

          <div class="report-form-group">
            <label>Jumlah Peserta</label>
            <input type="number" id="jumlahPesertaLaporan"
              value="0" readonly>
          </div>

          <div class="report-form-row">
            <div class="report-form-group">
              <label for="hadirLaporan">Hadir</label>
              <input type="number" id="hadirLaporan"
                min="0" step="1" value="0" required>
            </div>

            <div class="report-form-group">
              <label for="sakitLaporan">Sakit</label>
              <input type="number" id="sakitLaporan"
                min="0" step="1" value="0" required>
            </div>
          </div>

          <div class="report-form-row">
            <div class="report-form-group">
              <label for="izinLaporan">Izin</label>
              <input type="number" id="izinLaporan"
                min="0" step="1" value="0" required>
            </div>

            <div class="report-form-group">
              <label for="alpaLaporan">Alpa</label>
              <input type="number" id="alpaLaporan"
                min="0" step="1" value="0" required>
            </div>
          </div>

          <div class="report-attendance-summary">
            <span>Tidak Hadir</span>
            <strong id="jumlahTidakHadirLaporan">0</strong>
          </div>

          <small id="infoKehadiranLaporan">
            Total hadir, sakit, izin, dan alpa harus sama dengan jumlah peserta.
          </small>
        </div>

        <!-- DETAIL GURU KELAS DAN MAPEL -->
        <div id="sectionPembelajaranUmum" hidden>
          <div class="report-section">
            <h3>Detail Pembelajaran</h3>

            <div class="report-form-group">
              <label for="materiLaporan">Materi Pembelajaran</label>
              <input type="text" id="materiLaporan"
                maxlength="200"
                placeholder="Masukkan materi pembelajaran">
            </div>

            <div class="report-form-group">
              <label for="tujuanLaporan">Tujuan Pembelajaran</label>
              <textarea id="tujuanLaporan" rows="3"></textarea>
            </div>

            <div class="report-form-group">
              <label for="kegiatanPendahuluan">Kegiatan Pendahuluan</label>
              <textarea id="kegiatanPendahuluan" rows="3"></textarea>
            </div>

            <div class="report-form-group">
              <label for="kegiatanInti">Kegiatan Inti</label>
              <textarea id="kegiatanInti" rows="4"></textarea>
            </div>

            <div class="report-form-group">
              <label for="kegiatanPenutup">Kegiatan Penutup</label>
              <textarea id="kegiatanPenutup" rows="3"></textarea>
            </div>

            <div class="report-form-group">
              <label for="hasilPembelajaran">Hasil Pembelajaran</label>
              <textarea id="hasilPembelajaran" rows="3"></textarea>
            </div>

            <div class="report-form-group">
              <label for="kendalaLaporan">Kendala</label>
              <textarea id="kendalaLaporan" rows="2"></textarea>
            </div>

            <div class="report-form-group">
              <label for="tindakLanjut">Tindak Lanjut</label>
              <textarea id="tindakLanjut" rows="2"></textarea>
            </div>

            <div class="report-form-group">
              <label for="catatanGuru">Catatan Guru</label>
              <textarea id="catatanGuru" rows="2"></textarea>
            </div>
          </div>
        </div>

        <!-- DETAIL GURU NGAJI -->
        <div id="sectionPembelajaranNgaji" hidden>
          <div class="report-section">
            <h3>Detail Pembelajaran Ngaji</h3>

            <div class="report-form-group">
              <label for="haditsDoa">Hadits dan Doa</label>
              <textarea id="haditsDoa" rows="3"></textarea>
            </div>

            <div class="report-form-group">
              <label for="pendidikanAdab">Pendidikan Adab</label>
              <textarea id="pendidikanAdab" rows="3"></textarea>
            </div>

            <div class="report-form-group">
              <label for="ringkasanPembelajaran">Ringkasan Pembelajaran</label>
              <textarea id="ringkasanPembelajaran" rows="3"></textarea>
            </div>

            <div class="report-form-group">
              <label for="tingkatNgaji">Tingkat Ngaji</label>
              <input type="text" id="tingkatNgaji">
            </div>

            <div class="report-form-group">
              <label for="halamanSuratAyat">Halaman / Surat / Ayat</label>
              <input type="text" id="halamanSuratAyat">
            </div>

            <div class="report-form-group">
              <label for="targetPembelajaran">Target Pembelajaran</label>
              <textarea id="targetPembelajaran" rows="3"></textarea>
            </div>

            <div class="report-form-group">
              <label for="hafalanQuran">Hafalan Al-Qur'an</label>
              <textarea id="hafalanQuran" rows="3"></textarea>
            </div>

            <div class="report-form-group">
              <label for="capaianHafalan">Capaian Hafalan</label>
              <textarea id="capaianHafalan" rows="3"></textarea>
            </div>

            <div class="report-form-group">
              <label for="perkembanganBacaan">Perkembangan Bacaan</label>
              <textarea id="perkembanganBacaan" rows="3"></textarea>
            </div>
          </div>
        </div>
      </form>
    `,
      footer: `
      <button type="button" class="btn btn-outline"
        id="btnBatalLaporan">Batal</button>

      <button type="button" class="btn btn-primary"
        id="btnKirimLaporan" disabled>
        <i data-lucide="send"></i>
        Kirim Laporan
      </button>
    `,
    });

    this.bindReportForm();
    await this.loadReportFormOptions();
  },

  async loadReportFormOptions() {
    const select = document.getElementById("sumberLaporan");
    const label = document.getElementById("labelSumberLaporan");
    const info = document.getElementById("infoSumberLaporan");
    const submitButton = document.getElementById("btnKirimLaporan");

    try {
      const response = await API.post("laporan.formOptions");

      if (!response || response.success !== true || !response.data) {
        throw new Error(response?.message || "Gagal memuat pilihan laporan.");
      }

      const data = response.data;
      const jenisGuru = data.jenisGuru;
      const options = Array.isArray(data.options) ? data.options : [];

      const config = {
        GURU_KELAS: {
          label: "Penugasan Kelas",
          info: "Pilih kelas yang menjadi tanggung jawab Anda.",
          valueField: "ID_PENUGASAN",
          detailField: "ID_KELAS",
        },
        GURU_MAPEL: {
          label: "Jadwal Mengajar",
          info: "Pilih jadwal mata pelajaran Anda.",
          valueField: "ID_JADWAL",
        },
        GURU_NGAJI: {
          label: "Kelompok Ngaji",
          info: "Pilih kelompok ngaji yang menjadi tanggung jawab Anda.",
          valueField: "ID_PENUGASAN",
          detailField: "ID_KELOMPOK_NGAJI",
        },
      };

      const setting = config[jenisGuru];

      if (!setting) {
        throw new Error("Jenis guru tidak dikenali.");
      }

      this.reportFormOptions = {
        jenisGuru,
        tahunAjaran: data.tahunAjaran,
        options,
        setting,
        sesiNgaji: data.sesiNgaji || ["Sesi 1", "Sesi 2", "Sesi 3"],
      };

      document.getElementById("idTahunAjaranLaporan").value =
        data.tahunAjaran.ID_TAHUN_AJARAN;

      label.textContent = setting.label;
      info.textContent = setting.info;

      select.innerHTML = "";

      const placeholder = document.createElement("option");
      placeholder.value = "";
      placeholder.textContent = options.length
        ? "Pilih " + setting.label.toLowerCase()
        : "Belum ada penugasan aktif";

      select.appendChild(placeholder);

      options.forEach((item) => {
        const value = item[setting.valueField];
        if (!value) return;

        const option = document.createElement("option");
        option.value = value;

        const detailId = setting.detailField ? item[setting.detailField] : "";

        if (jenisGuru === "GURU_MAPEL") {
          const parts = [
            item.ID_KELAS ? "Kelas " + item.ID_KELAS : "",
            item.ID_MAPEL ? "Mapel " + item.ID_MAPEL : "",
            item.HARI || "",
          ].filter(Boolean);

          option.textContent = parts.join(" • ") || value;
        } else {
          option.textContent = detailId || value;
        }
        select.appendChild(option);
      });

      select.disabled = options.length === 0;

      // Tampilkan bagian berdasarkan kategori guru.
      const isNgaji = jenisGuru === "GURU_NGAJI";

      document.getElementById("groupMapelLaporan").hidden = isNgaji;

      document
        .getElementById("groupKelasLaporan")
        .querySelector("label").textContent = isNgaji
        ? "Kelompok Ngaji"
        : "Kelas";

      document.getElementById("groupSesiNgaji").hidden = !isNgaji;

      document.getElementById("sectionPembelajaranUmum").hidden = isNgaji;

      document.getElementById("sectionPembelajaranNgaji").hidden = !isNgaji;

      const sesiSelect = document.getElementById("sesiNgaji");
      sesiSelect.innerHTML = '<option value="">Pilih sesi ngaji</option>';

      this.reportFormOptions.sesiNgaji.forEach((sesi) => {
        const option = document.createElement("option");
        option.value = sesi;
        option.textContent = sesi;
        sesiSelect.appendChild(option);
      });

      select.addEventListener("change", () => {
        this.updateReportSourceInfo(select.value);
      });

      submitButton.disabled = options.length === 0;

      console.log("[Dashboard] Form options berhasil dimuat.", data);
    } catch (error) {
      console.error("[Dashboard] Gagal memuat form options:", error);

      select.innerHTML = '<option value="">Gagal memuat pilihan</option>';
      select.disabled = true;
      info.textContent = error.message;
      submitButton.disabled = true;
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

    ["hadirLaporan", "sakitLaporan", "izinLaporan", "alpaLaporan"].forEach(
      (id) => {
        document.getElementById(id).value = "0";
      },
    );

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

    ["hadirLaporan", "sakitLaporan", "izinLaporan", "alpaLaporan"].forEach(
      (id) => {
        document.getElementById(id).addEventListener("input", () => {
          this.updateAttendanceSummary();
        });
      },
    );

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

    const hadir = getCount("hadirLaporan");
    const sakit = getCount("sakitLaporan");
    const izin = getCount("izinLaporan");
    const alpa = getCount("alpaLaporan");

    const totalTidakHadir = sakit + izin + alpa;
    const jumlahPeserta = Number(
      document.getElementById("jumlahPesertaLaporan").value || 0,
    );

    document.getElementById("jumlahTidakHadirLaporan").textContent =
      totalTidakHadir.toLocaleString("id-ID");

    const total = hadir + sakit + izin + alpa;
    const info = document.getElementById("infoKehadiranLaporan");
    const button = document.getElementById("btnKirimLaporan");

    const valid =
      [hadir, sakit, izin, alpa].every(
        (value) => Number.isSafeInteger(value) && value >= 0,
      ) &&
      total === jumlahPeserta &&
      !!document.getElementById("sumberLaporan").value;

    info.textContent = valid
      ? "Rekap kehadiran sudah sesuai dengan jumlah peserta."
      : `Total rekap ${total} dari ${jumlahPeserta} peserta. Periksa kembali jumlahnya.`;

    info.style.color = valid
      ? "var(--success, #16834a)"
      : "var(--danger, #dc3545)";

    if (this.reportSubmitting) return;

    button.disabled = !valid;
  },

  async submitLaporan() {
    if (this.reportSubmitting) return;

    const form = document.getElementById("formLaporanHarian");

    if (!form.reportValidity()) return;

    const state = this.reportFormOptions;
    if (!state) {
      alert("Pilihan penugasan belum tersedia.");
      return;
    }

    const sourceId = document.getElementById("sumberLaporan").value;
    const selected = state.options.find(
      (item) => String(item[state.setting.valueField]) === String(sourceId),
    );

    if (!selected) {
      alert("Silakan pilih penugasan atau jadwal terlebih dahulu.");
      return;
    }

    const getValue = (id) => document.getElementById(id).value.trim();

    const getNumber = (id) => Number(document.getElementById(id).value);

    const attendance = {
      HADIR: getNumber("hadirLaporan"),
      SAKIT: getNumber("sakitLaporan"),
      IZIN: getNumber("izinLaporan"),
      ALPA: getNumber("alpaLaporan"),
    };

    const jumlahPeserta = Number(selected.JUMLAH_PESERTA);

    const totalAttendance =
      attendance.HADIR + attendance.SAKIT + attendance.IZIN + attendance.ALPA;

    if (totalAttendance !== jumlahPeserta) {
      alert("Total rekap kehadiran harus sama dengan jumlah peserta.");
      return;
    }

    const isNgaji = state.jenisGuru === "GURU_NGAJI";

    const detail = isNgaji
      ? {
          HADITS_DOA: getValue("haditsDoa"),
          PENDIDIKAN_ADAB: getValue("pendidikanAdab"),
          RINGKASAN_PEMBELAJARAN: getValue("ringkasanPembelajaran"),
          TINGKAT_NGAJI: getValue("tingkatNgaji"),
          HALAMAN_SURAT_AYAT: getValue("halamanSuratAyat"),
          TARGET_PEMBELAJARAN: getValue("targetPembelajaran"),
          HAFALAN_QURAN: getValue("hafalanQuran"),
          CAPAIAN_HAFALAN: getValue("capaianHafalan"),
          PERKEMBANGAN_BACAAN: getValue("perkembanganBacaan"),
        }
      : {
          MATERI_PEMBELAJARAN: getValue("materiLaporan"),
          TUJUAN_PEMBELAJARAN: getValue("tujuanLaporan"),
          KEGIATAN_PENDAHULUAN: getValue("kegiatanPendahuluan"),
          KEGIATAN_INTI: getValue("kegiatanInti"),
          KEGIATAN_PENUTUP: getValue("kegiatanPenutup"),
          HASIL_PEMBELAJARAN: getValue("hasilPembelajaran"),
          KENDALA: getValue("kendalaLaporan"),
          TINDAK_LANJUT: getValue("tindakLanjut"),
          CATATAN_GURU: getValue("catatanGuru"),
        };

    const payload = {
      ID_TAHUN_AJARAN: getValue("idTahunAjaranLaporan"),
      TANGGAL_LAPORAN: getValue("tanggalLaporan"),

      ID_PENUGASAN: state.jenisGuru === "GURU_MAPEL" ? "" : sourceId,

      ID_JADWAL: state.jenisGuru === "GURU_MAPEL" ? sourceId : "",

      SESI_NGAJI: isNgaji ? getValue("sesiNgaji") : "",

      HADIR: attendance.HADIR,
      SAKIT: attendance.SAKIT,
      IZIN: attendance.IZIN,
      ALPA: attendance.ALPA,

      detail: detail,
    };

    if (isNgaji && !payload.SESI_NGAJI) {
      alert("Silakan pilih sesi ngaji.");
      return;
    }

    if (!isNgaji && !payload.detail.MATERI_PEMBELAJARAN) {
      alert("Materi pembelajaran wajib diisi.");
      return;
    }

    if (isNgaji && !Object.values(detail).some((value) => value !== "")) {
      alert("Minimal satu informasi pembelajaran ngaji wajib diisi.");
      return;
    }

    const button = document.getElementById("btnKirimLaporan");
    const originalContent = button.innerHTML;

    this.reportSubmitting = true;
    button.disabled = true;
    button.innerHTML = "Mengirim...";

    try {
      const response = await API.post("laporan.create", payload);

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
        this.updateAttendanceSummary();
      }
    }
  },
};
