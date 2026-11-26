
/**
 * ============================================================
 * TEACHLY - LAPORAN SERVICE
 * QEDEV BACKEND STANDARD
 * ============================================================
 *
 * Tanggung jawab:
 * 1. Memvalidasi laporan Guru Kelas.
 * 2. Memvalidasi laporan Guru Mapel.
 * 3. Memvalidasi laporan Guru Ngaji.
 * 4. Mengambil tahun ajaran aktif otomatis.
 * 5. Membuat ID laporan.
 * 6. Menyiapkan data sebelum disimpan.
 *
 * ============================================================
 */

const LaporanService = {

  // ==========================================================
  // KONFIGURASI
  // ==========================================================

  SHEETS: {
    GURU_KELAS: "LAPORAN_GURU_KELAS",
    GURU_MAPEL: "LAPORAN_GURU_MAPEL",
    GURU_NGAJI: "LAPORAN_GURU_NGAJI",
    KEPALA_SEKOLAH: "LAPORAN_KEPALA_SEKOLAH"
  },

  ATTENDANCE_FIELDS: [  
    "SAKIT",
    "IZIN",
    "ALPA"
  ],


  EDITABLE_FIELDS: {
    GURU_KELAS: [
      "TANGGAL_LAPORAN",
      "ID_KELAS",
      "SAKIT",
      "IZIN",
      "ALPA",
      "HADITS_DOA",
      "PENDIDIKAN_ADAB",
      "RINGKASAN_PEMBELAJARAN",
      "KENDALA",
      "SOLUSI"
    ],

    GURU_MAPEL: [
      "TANGGAL_LAPORAN",
      "ID_KELAS",
      "ID_MAPEL",
      "SAKIT",
      "IZIN",
      "ALPA",
      "RINGKASAN_PEMBELAJARAN",
      "KENDALA",
      "SOLUSI"
    ],

    GURU_NGAJI: [
      "TANGGAL_LAPORAN",
      "KELOMPOK_NGAJI",
      "ID_SESI",
      "SAKIT",
      "IZIN",
      "ALPA",
      "HALAMAN_SURAT_AYAT",
      "HAFALAN_QURAN",
      "CATATAN_PEMBELAJARAN",
      "KENDALA",
      "SOLUSI"
    ]
  },


    // ==========================================================
    // SCRIPT LOCK
    // ==========================================================

    /**
     * Menjalankan proses tulis dengan Script Lock.
     * Mencegah beberapa eksekusi menulis Spreadsheet bersamaan.
     */
    withScriptLock(callback, timeout = 30000) {

      const lock = LockService.getScriptLock();

      try {

        lock.waitLock(timeout);

        const result = callback();

        // Pastikan perubahan Spreadsheet dikirim sebelum lock dilepas.
        SpreadsheetApp.flush();

        return result;

      } catch (error) {

        throw error;

      } finally {

        if (lock.hasLock()) {
          lock.releaseLock();
        }

      }

    },



  // ==========================================================
  // VALIDASI UMUM
  // ==========================================================

  /**
   * Memvalidasi NBM guru.
   */
  validateNBM(nbm) {

    const value = Utils.normalizeText(nbm);

    Utils.required(value, "NBM");

    if (!Utils.validateNBM(value)) {
      throw new Error("Format NBM tidak valid.");
    }

    return value;

  },


  /**
   * Memvalidasi tanggal laporan.
   * Format yang diterima: yyyy-MM-dd
   */
  validateTanggal(tanggal) {

    const value = Utils.normalizeText(tanggal);

    Utils.required(value, "Tanggal laporan");

    const match = value.match(
      /^(\d{4})-(\d{2})-(\d{2})$/
    );

    if (!match) {
      throw new Error(
        "Format tanggal laporan harus yyyy-MM-dd."
      );
    }

    const date = new Date(
      Number(match[1]),
      Number(match[2]) - 1,
      Number(match[3])
    );

    if (
      date.getFullYear() !== Number(match[1]) ||
      date.getMonth() !== Number(match[2]) - 1 ||
      date.getDate() !== Number(match[3])
    ) {
      throw new Error("Tanggal laporan tidak valid.");
    }

    return value;

  },


  /**
   * Memvalidasi jumlah kehadiran.
   * Semua nilai harus bilangan bulat dan tidak negatif.
   */

  validateAttendance(data) {

    const result = {};

    this.ATTENDANCE_FIELDS.forEach(field => {

      const value = data[field];

      Utils.required(value, field);

      const number = Number(value);

      if (
        !Number.isFinite(number) ||
        !Number.isInteger(number) ||
        number < 0
      ) {
        throw new Error(
          field + " harus berupa bilangan bulat minimal 0."
        );
      }

      result[field] = number;

    });

    return result;

  },


  /**
   * Memastikan payload berupa objek.
   */
  validatePayload(payload) {

    if (
      !payload ||
      typeof payload !== "object" ||
      Array.isArray(payload)
    ) {
      throw new Error("Data laporan tidak valid.");
    }

    return true;

  },


  // ==========================================================
  // VALIDASI GURU KELAS
  // ==========================================================

  validateGuruKelas(data) {

    Utils.required(data.ID_KELAS, "Kelas");

    return {
      ID_KELAS: Utils.normalizeText(data.ID_KELAS),
      ...this.validateAttendance(data)
    };

  },


  // ==========================================================
  // VALIDASI GURU MAPEL
  // ==========================================================

  validateGuruMapel(data) {

    Utils.required(data.ID_KELAS, "Kelas");
    Utils.required(data.ID_MAPEL, "Mata pelajaran");

    return {
      ID_KELAS: Utils.normalizeText(data.ID_KELAS),
      ID_MAPEL: Utils.normalizeText(data.ID_MAPEL),
      ...this.validateAttendance(data)
    };

  },


  // ==========================================================
  // VALIDASI GURU NGAJI
  // ==========================================================

  
  /**
   * ==========================================================
   * VALIDASI GURU NGAJI
   * ==========================================================
   */
  validateGuruNgaji(data) {

    Utils.required(data.KELOMPOK_NGAJI, "Kelompok ngaji");
    Utils.required(data.ID_SESI, "Sesi ngaji");

    // Normalisasi daftar nama kelompok
    const kelompok = String(data.KELOMPOK_NGAJI)
      .split(",")
      .map(nama => nama.trim())
      .filter(Boolean);

    if (kelompok.length === 0) {
      throw new Error("Minimal pilih satu kelompok ngaji.");
    }

    // Cegah nama kelompok duplikat
    const kelompokUnik = [...new Set(kelompok)];

    return {
      KELOMPOK_NGAJI: kelompokUnik.join(", "),
      ID_SESI: Utils.normalizeText(data.ID_SESI),
      ...this.validateAttendance(data)
    };

  },



  // ==========================================================
  // PROSES PENYIMPANAN
  // ==========================================================

  /**
   * Membuat laporan berdasarkan kategori.
   *
   * sheetKey:
   * LAPORAN_GURU_KELAS
   * LAPORAN_GURU_MAPEL
   * LAPORAN_GURU_NGAJI
   */
  
  /**
   * Membuat laporan berdasarkan kategori.
   *
   * sheetKey:
   * LAPORAN_GURU_KELAS
   * LAPORAN_GURU_MAPEL
   * LAPORAN_GURU_NGAJI
   */
  create(sheetKey, payload) {

    this.validatePayload(payload);

    const allowedSheets = Object.values(this.SHEETS);

    if (!allowedSheets.includes(sheetKey)) {
      throw new Error(
        "Kategori laporan tidak dikenal."
      );
    }

    // ========================================================
    // IDENTITAS GURU
    // ========================================================

    const nbm = this.validateNBM(payload.NBM);

    // ========================================================
    // TANGGAL LAPORAN
    // ========================================================

    const tanggal = this.validateTanggal(
      payload.TANGGAL_LAPORAN
    );

    // ========================================================
    // VALIDASI KATEGORI
    // ========================================================

    let categoryData = {};

    switch (sheetKey) {

      case this.SHEETS.GURU_KELAS:
        categoryData = this.validateGuruKelas(payload);
        break;

      case this.SHEETS.GURU_MAPEL:
        categoryData = this.validateGuruMapel(payload);
        break;

      case this.SHEETS.GURU_NGAJI:
        categoryData = this.validateGuruNgaji(payload);
        break;

      case this.SHEETS.KEPALA_SEKOLAH:
        categoryData = {
          KEGIATAN: Utils.normalizeText(payload.KEGIATAN),
          CATATAN: Utils.normalizeText(payload.CATATAN)
        };
        Utils.required(categoryData.KEGIATAN, "Kegiatan Kepala Sekolah");
        break;
    }

    // ========================================================
    // TAHUN AJARAN AKTIF
    // ========================================================

    const tahunAjaran = TahunAjaranService.getActive();
    if (sheetKey === this.SHEETS.GURU_KELAS) {
      AbsensiSiswaService.assertAssigned(nbm, categoryData.ID_KELAS, Utils.normalizeText(tahunAjaran.ID_TAHUN_AJARAN));
      if (!payload.ABSENSI_SISWA) {
        throw new Error("Buka dan simpan ulang draft untuk memuat daftar siswa.");
      }
    }

    // ========================================================
    // ID DAN WAKTU LAPORAN
    // ========================================================

    const laporanId = Utils.generateId("LAP");
    const now = Utils.now();

    // ========================================================
    // PROSES UPLOAD GAMBAR
    // ========================================================

    const isUploadCategory = [
      this.SHEETS.GURU_KELAS,
      this.SHEETS.GURU_MAPEL,
      this.SHEETS.KEPALA_SEKOLAH
    ].includes(sheetKey);

    const uploads = payload.UPLOADS === undefined
      ? {}
      : payload.UPLOADS;

    if (sheetKey === this.SHEETS.KEPALA_SEKOLAH &&
        (!uploads || typeof uploads !== "object" || Array.isArray(uploads) ||
          Object.keys(uploads).some(key => key !== "DOKUMENTASI") ||
          (uploads.DOKUMENTASI && !/^data:image\/jpeg;base64,/i.test(uploads.DOKUMENTASI)))) {
      throw new Error("Lampiran Kepala Sekolah hanya menerima satu foto JPEG.");
    }

    if (!isUploadCategory) {

      if (
        uploads &&
        typeof uploads === "object" &&
        !Array.isArray(uploads) &&
        Object.values(uploads).some(Boolean)
      ) {
        throw new Error(
          "Upload gambar tidak tersedia untuk Guru Ngaji."
        );
      }

      if (
        uploads &&
        (
          typeof uploads !== "object" ||
          Array.isArray(uploads)
        )
      ) {
        throw new Error("Data upload laporan tidak valid.");
      }

    }

    let uploadResult = {
      data: {
        MODUL_AJAR: "",
        ASESMEN: "",
        DOKUMENTASI: ""
      },
      fileIds: []
    };

    try {

      // ======================================================
      // UPLOAD GAMBAR
      // ======================================================

      if (isUploadCategory) {

        uploadResult = LaporanDriveService.uploadAll(
          uploads,
          laporanId
        );

      }

      // ======================================================
      // SIAPKAN DATA LAPORAN
      // ======================================================

      const data = {

        ...payload,

        ID_LAPORAN: laporanId,

        ID_TAHUN_AJARAN:
          tahunAjaran.ID_TAHUN_AJARAN,

        NBM: nbm,

        TANGGAL_LAPORAN: tanggal,

        ...categoryData,

        MODUL_AJAR: uploadResult.data.MODUL_AJAR,
        ASESMEN: uploadResult.data.ASESMEN,
        DOKUMENTASI: uploadResult.data.DOKUMENTASI,

        CREATED_AT: Utils.formatDateTime(now)

      };

      // ======================================================
      // BERSIHKAN FIELD YANG TIDAK DISIMPAN
      // ======================================================

      delete data.UPLOADS;
      delete data.ABSENSI_SISWA;
      delete data.HADIR;

      // Pastikan tahun ajaran berasal dari backend.
      data.ID_TAHUN_AJARAN =
        tahunAjaran.ID_TAHUN_AJARAN;

      // ======================================================
      // SIMPAN LAPORAN
      // ======================================================

      return this.withScriptLock(() => {
        if (sheetKey !== this.SHEETS.GURU_KELAS) return LaporanRepository.create(sheetKey, data);

        const { totals, rows } = AbsensiSiswaService.prepare(data, payload.ABSENSI_SISWA);
        const { SAKIT, IZIN, ALPA } = totals;
        const range = AbsensiSiswaService.append(rows);
        try {
          return LaporanRepository.create(sheetKey, { ...data, SAKIT, IZIN, ALPA });
        } catch (error) {
          if (range) {
            range.clearContent();
            SpreadsheetApp.flush();
          }
          throw error;
        }
      });

    } catch (error) {

      // Hapus gambar jika proses setelah upload gagal.
      // Termasuk kegagalan menyiapkan data dan menyimpan laporan.
      LaporanDriveService.rollback(
        uploadResult.fileIds
      );

      throw error;

    }

  },


  // ==========================================================
  // RIWAYAT LAPORAN
  // ==========================================================

  /**
   * Normalisasi tanggal dari Spreadsheet.
   */
  normalizeReportDate(value) {

    if (!value) return "";

    if (value instanceof Date) {
      return Utilities.formatDate(
        value,
        Session.getScriptTimeZone(),
        "yyyy-MM-dd"
      );
    }

    const text = String(value).trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
      return text;
    }

    return "";

  },


  /**
   * Memvalidasi kategori laporan.
   */
  validateSheetKey(sheetKey) {

    if (!Object.values(this.SHEETS).includes(sheetKey)) {
      throw new Error("Kategori laporan tidak valid.");
    }

    return true;

  },



  /**
   * Menambahkan nama kelas pada data laporan.
   * ID_KELAS tetap dipertahankan.
   */
  enrichWithClassName(data) {

    const daftarKelas = KelasRepository.getAll();

    const kelasMap = new Map(
      daftarKelas.map(kelas => [
        String(kelas.ID_KELAS).trim(),
        kelas.NAMA_KELAS
      ])
    );

    const enrich = laporan => ({
      ...laporan,
      NAMA_KELAS:
        kelasMap.get(String(laporan.ID_KELAS || "").trim()) ||
        laporan.ID_KELAS ||
        "-"
    });

    return Array.isArray(data)
      ? data.map(enrich)
      : enrich(data);

  },



  /**
   * Mengambil riwayat laporan milik guru.
   *
   * filters:
   * {
   *   tanggalMulai: "2026-11-01",
   *   tanggalAkhir: "2026-11-30"
   * }
   */
  getHistory(sheetKey, nbm, filters = {}) {

    this.validateSheetKey(sheetKey);

    const guruNBM = this.validateNBM(nbm);

    const tanggalMulai = filters.tanggalMulai
      ? this.validateTanggal(filters.tanggalMulai)
      : "";

    const tanggalAkhir = filters.tanggalAkhir
      ? this.validateTanggal(filters.tanggalAkhir)
      : "";

    if (
      tanggalMulai &&
      tanggalAkhir &&
      tanggalMulai > tanggalAkhir
    ) {
      throw new Error(
        "Tanggal mulai tidak boleh melebihi tanggal akhir."
      );
    }

    const data = LaporanRepository.getByNBM(
      sheetKey,
      guruNBM
    );

    
    const filteredData = data
      .filter(item => {

        const tanggal = this.normalizeReportDate(
          item.TANGGAL_LAPORAN
        );

        if (!tanggal) return false;

        if (tanggalMulai && tanggal < tanggalMulai) {
          return false;
        }

        if (tanggalAkhir && tanggal > tanggalAkhir) {
          return false;
        }

        return true;

      })
      .sort((a, b) => {

        return this.normalizeReportDate(
          b.TANGGAL_LAPORAN
        ).localeCompare(
          this.normalizeReportDate(a.TANGGAL_LAPORAN)
        );

      });

    return sheetKey === this.SHEETS.KEPALA_SEKOLAH
      ? filteredData : this.enrichWithClassName(filteredData);


  },


  /**
   * Mengambil detail laporan.
   * Hanya laporan milik guru yang bersangkutan.
   */
  getDetail(sheetKey, idLaporan, nbm) {

    this.validateSheetKey(sheetKey);

    const guruNBM = this.validateNBM(nbm);

    const laporan = LaporanRepository.getById(
      sheetKey,
      idLaporan
    );

    if (!laporan) {
      throw new Error("Laporan tidak ditemukan.");
    }

    if (
      String(laporan.NBM).trim() !== String(guruNBM).trim()
    ) {
      throw new Error(
        "Anda tidak memiliki akses ke laporan ini."
      );
    }

    return sheetKey === this.SHEETS.KEPALA_SEKOLAH
      ? laporan : this.enrichWithClassName(laporan);

  },


  /**
   * Memperbarui laporan milik guru.
   * Foto dan identitas laporan tidak diubah.
   */

    /**
   * Memperbarui laporan milik guru.
   * Foto dan identitas laporan tidak diubah.
   *
   * Seluruh proses baca-validasi-simpan dilindungi Script Lock.
   */
  update(sheetKey, idLaporan, nbm, payload) {

    this.validateSheetKey(sheetKey);
    this.validatePayload(payload);

    const guruNBM = this.validateNBM(nbm);

    return this.withScriptLock(() => {

      // ======================================================
      // AMBIL DATA TERBARU DI DALAM LOCK
      // ======================================================

      const current = this.getDetail(
        sheetKey,
        idLaporan,
        guruNBM
      );

      // ======================================================
      // GABUNGKAN DATA LAMA DENGAN PERUBAHAN
      // ======================================================

      const merged = {
        ...current
      };

      const category = Object.keys(this.SHEETS).find(
        key => this.SHEETS[key] === sheetKey
      );

      const editableFields = this.EDITABLE_FIELDS[category];

      editableFields.forEach(field => {

        if (
          Object.prototype.hasOwnProperty.call(payload, field)
        ) {
          merged[field] = payload[field];
        }

      });

      // ======================================================
      // VALIDASI TANGGAL
      // ======================================================

      const tanggal = this.validateTanggal(
        merged.TANGGAL_LAPORAN
      );

      // ======================================================
      // VALIDASI KATEGORI
      // ======================================================

      let categoryData = {};

      switch (sheetKey) {

        case this.SHEETS.GURU_KELAS:
          categoryData = this.validateGuruKelas(merged);
          break;

        case this.SHEETS.GURU_MAPEL:
          categoryData = this.validateGuruMapel(merged);
          break;

        case this.SHEETS.GURU_NGAJI:
          categoryData = this.validateGuruNgaji(merged);
          break;

      }

      // ======================================================
      // SIAPKAN DATA UPDATE
      // ======================================================

      const updateData = {
        TANGGAL_LAPORAN: tanggal,
        ...categoryData
      };

      // Pertahankan field teks tambahan.
      editableFields.forEach(field => {

        if (
          field !== "TANGGAL_LAPORAN" &&
          Object.prototype.hasOwnProperty.call(merged, field) &&
          !Object.prototype.hasOwnProperty.call(categoryData, field)
        ) {
          updateData[field] = merged[field];
        }

      });

      // ======================================================
      // SIMPAN PERUBAHAN
      // ======================================================

      return LaporanRepository.updateById(
        sheetKey,
        idLaporan,
        updateData
      );

    });

  },
 




  // ==========================================================
  // PUBLIC METHODS
  // ==========================================================

  createGuruKelas(payload) {

    return this.create(
      this.SHEETS.GURU_KELAS,
      payload
    );

  },


  createGuruMapel(payload) {

    return this.create(
      this.SHEETS.GURU_MAPEL,
      payload
    );

  },


  createGuruNgaji(payload) {

    return this.create(
      this.SHEETS.GURU_NGAJI,
      payload
    );

  },


  getHistoryGuruKelas(nbm, filters) {
    return this.getHistory(
      this.SHEETS.GURU_KELAS,
      nbm,
      filters
    );
  },

  getHistoryGuruMapel(nbm, filters) {
    return this.getHistory(
      this.SHEETS.GURU_MAPEL,
      nbm,
      filters
    );
  },

  getHistoryGuruNgaji(nbm, filters) {
    return this.getHistory(
      this.SHEETS.GURU_NGAJI,
      nbm,
      filters
    );
  },


  // ==========================================================
  // DETAIL LAPORAN
  // ==========================================================

  getDetailGuruKelas(idLaporan, nbm) {
    return this.getDetail(
      this.SHEETS.GURU_KELAS,
      idLaporan,
      nbm
    );
  },

  getDetailGuruMapel(idLaporan, nbm) {
    return this.getDetail(
      this.SHEETS.GURU_MAPEL,
      idLaporan,
      nbm
    );
  },

  getDetailGuruNgaji(idLaporan, nbm) {
    return this.getDetail(
      this.SHEETS.GURU_NGAJI,
      idLaporan,
      nbm
    );
  },



  

};
