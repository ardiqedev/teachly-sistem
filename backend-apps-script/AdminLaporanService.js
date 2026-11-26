
/**
 * ============================================================
 * TEACHLY - ADMIN LAPORAN SERVICE
 * QEDEV BACKEND STANDARD
 * ============================================================
 *
 * Tanggung jawab:
 * 1. Mengambil laporan Guru Kelas.
 * 2. Mengambil laporan Guru Mapel.
 * 3. Mengambil laporan Guru Ngaji.
 * 4. Menggabungkan data referensi.
 * 5. Mengubah ID menjadi nama.
 * 6. Menyediakan filter laporan.
 * 7. Menyediakan detail laporan.
 *
 * Tidak menangani:
 * - Create laporan.
 * - Update laporan.
 * - Validasi laporan guru.
 * - Role dan hak akses.
 *
 * ============================================================
 */

const AdminLaporanService = {

  SHEETS: {
    GURU_KELAS: "LAPORAN_GURU_KELAS",
    GURU_MAPEL: "LAPORAN_GURU_MAPEL",
    GURU_NGAJI: "LAPORAN_GURU_NGAJI",
    KEPALA_SEKOLAH: "LAPORAN_KEPALA_SEKOLAH"
  },


  /* =========================================
    RBAC LAPORAN GURU
  ========================================= */

  ALLOWED_CATEGORIES: {
    ADMIN: [
      "GURU_KELAS",
      "GURU_MAPEL",
      "GURU_NGAJI",
      "KEPALA_SEKOLAH"
    ],

    ADMIN_KURIKULUM: [
      "GURU_KELAS",
      "GURU_MAPEL"
    ],

    ADMIN_GURU_NGAJI: [
      "GURU_NGAJI"
    ]
  },

  getAllowedCategories(admin) {

    if (
      !admin ||
      typeof admin !== "object" ||
      !admin.ID_PENGGUNA
    ) {
      throw new Error(
        "Sesi administrator tidak valid."
      );
    }

    const role = String(
      admin.ROLE || ""
    ).trim().toUpperCase();

    const categories = this.ALLOWED_CATEGORIES[role];

    if (!categories) {
      throw new Error(
        "Role tidak memiliki akses laporan."
      );
    }

    return categories;

  },

  assertCategoryAccess(kategori, admin) {

    const category = String(
      kategori || ""
    ).trim().toUpperCase();

    if (!this.getAllowedCategories(admin).includes(category)) {
      throw new Error(
        "Anda tidak memiliki izin untuk kategori laporan ini."
      );
    }

    return category;

  },



  // ==========================================================
  // AMBIL REFERENSI
  // ==========================================================

  getReferences() {

    const guru = SheetManager.getAll("GURU");
    const kelas = SheetManager.getAll("KELAS");
    const mapel = SheetManager.getAll("MATA_PELAJARAN");
    const kelompok = SheetManager.getAll("KELOMPOK_NGAJI");
    const sesi = SheetManager.getAll("SESI_NGAJI");

    return {
      guru: this.createMap(guru, "NBM", "NAMA_GURU"),
      kelas: this.createMap(kelas, "ID_KELAS", "NAMA_KELAS"),
      mapel: this.createMap(mapel, "ID_MAPEL", "NAMA_MAPEL"),
      kelompok: this.createMap(
        kelompok,
        "ID_KELOMPOK",
        "NAMA_KELOMPOK"
      ),
      sesi: this.createMap(sesi, "ID_SESI", "NAMA_SESI")
    };

  },


  /**
   * Mengubah data referensi menjadi Map.
   */
  createMap(data, keyField, valueField) {

    const result = new Map();

    (Array.isArray(data) ? data : []).forEach(item => {

      const key = String(item[keyField] || "").trim();

      if (!key) return;

      result.set(
        key,
        item[valueField] || ""
      );

    });

    return result;

  },


  // ==========================================================
  // AMBIL SEMUA LAPORAN
  // ==========================================================

  
  getAll(filters = {}, admin = null) {

    const allowedCategories =
      this.getAllowedCategories(admin);

    const requestedCategory = String(
      filters?.kategori || ""
    ).trim().toUpperCase();

    // Kategori spesifik harus diizinkan.
    if (requestedCategory) {
      this.assertCategoryAccess(
        requestedCategory,
        admin
      );
    }

    const references = this.getReferences();

    let result = [];

    if (allowedCategories.includes("GURU_KELAS")) {

      const laporanKelas = SheetManager
        .getAll(this.SHEETS.GURU_KELAS)
        .map(item =>
          this.formatGuruKelas(item, references)
        );

      result.push(...laporanKelas);

    }

    if (allowedCategories.includes("GURU_MAPEL")) {

      const laporanMapel = SheetManager
        .getAll(this.SHEETS.GURU_MAPEL)
        .map(item =>
          this.formatGuruMapel(item, references)
        );

      result.push(...laporanMapel);

    }

    if (allowedCategories.includes("GURU_NGAJI")) {

      const laporanNgaji = SheetManager
        .getAll(this.SHEETS.GURU_NGAJI)
        .map(item =>
          this.formatGuruNgaji(item, references)
        );

      result.push(...laporanNgaji);

    }

    if (allowedCategories.includes("KEPALA_SEKOLAH") &&
        SheetManager.getDatabase().getSheetByName(this.SHEETS.KEPALA_SEKOLAH)) {
      result.push(...SheetManager.getAll(this.SHEETS.KEPALA_SEKOLAH)
        .map(item => this.formatKepalaSekolah(item, references)));
    }

    result = this.applyFilters(
      result,
      filters || {}
    );

    // Laporan terbaru terlebih dahulu.
    result.sort((a, b) =>
      String(b.TANGGAL_LAPORAN || "")
        .localeCompare(
          String(a.TANGGAL_LAPORAN || "")
        )
    );

    return result;

  },



  // ==========================================================
  // FORMAT GURU KELAS
  // ==========================================================

  formatGuruKelas(item, references) {

    return {
      ...item,

      KATEGORI: "GURU_KELAS",
      NAMA_KATEGORI: "Guru Kelas",

      NAMA_GURU: references.guru.get(
        String(item.NBM || "").trim()
      ) || "-",

      NAMA_KELAS: references.kelas.get(
        String(item.ID_KELAS || "").trim()
      ) || "-"

    };

  },

  formatKepalaSekolah(item, references) {
    return {
      ...item,
      KATEGORI: "KEPALA_SEKOLAH",
      NAMA_KATEGORI: "Kepala Sekolah",
      NAMA_GURU: references.guru.get(Utils.normalizeText(item.NBM)) || "-"
    };
  },


  // ==========================================================
  // FORMAT GURU MAPEL
  // ==========================================================

  formatGuruMapel(item, references) {

    return {
      ...item,

      KATEGORI: "GURU_MAPEL",
      NAMA_KATEGORI: "Guru Mapel",

      NAMA_GURU: references.guru.get(
        String(item.NBM || "").trim()
      ) || "-",

      NAMA_KELAS: references.kelas.get(
        String(item.ID_KELAS || "").trim()
      ) || "-",

      NAMA_MAPEL: references.mapel.get(
        String(item.ID_MAPEL || "").trim()
      ) || "-"

    };

  },


  // ==========================================================
  // FORMAT GURU NGAJI
  // ==========================================================

  formatGuruNgaji(item, references) {

    const kelompokValue = String(
      item.ID_KELOMPOK || item.KELOMPOK_NGAJI || ""
    ).trim();

    const namaKelompok =
      references.kelompok.get(kelompokValue) || kelompokValue || "-";

    return {
      ...item,

      KATEGORI: "GURU_NGAJI",
      NAMA_KATEGORI: "Guru Ngaji",

      NAMA_GURU: references.guru.get(
        String(item.NBM || "").trim()
      ) || "-",

      NAMA_KELOMPOK: namaKelompok,

      NAMA_SESI: references.sesi.get(
        String(item.ID_SESI || "").trim()
      ) || "-"

    };

  },


  // ==========================================================
  // FILTER LAPORAN
  // ==========================================================

  applyFilters(data, filters = {}) {

    let result = data;

    const kategori = String(
      filters.kategori || ""
    ).trim().toUpperCase();

    const nbm = String(
      filters.nbm || ""
    ).trim().toLowerCase();

    const tanggalMulai = String(
      filters.tanggalMulai || ""
    ).trim();

    const tanggalSelesai = String(
      filters.tanggalSelesai || ""
    ).trim();

    const tahunAjaran = String(
      filters.idTahunAjaran || ""
    ).trim();

    if (kategori) {
      result = result.filter(item =>
        item.KATEGORI === kategori
      );
    }

    if (nbm) {
      result = result.filter(item =>
        String(item.NBM || "")
          .toLowerCase()
          .includes(nbm)
      );
    }

    if (tanggalMulai) {
      result = result.filter(item =>
        String(item.TANGGAL_LAPORAN || "") >= tanggalMulai
      );
    }

    if (tanggalSelesai) {
      result = result.filter(item =>
        String(item.TANGGAL_LAPORAN || "") <= tanggalSelesai
      );
    }

    if (tahunAjaran) {
      result = result.filter(item =>
        String(item.ID_TAHUN_AJARAN || "") === tahunAjaran
      );
    }

    return result;

  },


  // ==========================================================
  // DETAIL LAPORAN
  // ==========================================================

  getDetail(idLaporan, kategori, admin = null) {

    if (!idLaporan) {
      throw new Error("ID laporan wajib diisi.");
    }

    
    const validKategori = this.assertCategoryAccess(
      kategori,
      admin
    );

    const sheetKey = this.SHEETS[validKategori];


    if (!sheetKey) {
      throw new Error("Kategori laporan tidak valid.");
    }

    const references = this.getReferences();

    const data = SheetManager.getAll(sheetKey);

    const laporan = data.find(item =>
      String(item.ID_LAPORAN || "").trim() ===
      String(idLaporan).trim()
    );

    if (!laporan) {
      throw new Error("Laporan tidak ditemukan.");
    }

    switch (validKategori) {

      case "GURU_KELAS":
        return this.formatGuruKelas(laporan, references);

      case "GURU_MAPEL":
        return this.formatGuruMapel(laporan, references);

      case "GURU_NGAJI":
        return this.formatGuruNgaji(laporan, references);

      case "KEPALA_SEKOLAH":
        return this.formatKepalaSekolah(laporan, references);

      default:
        throw new Error("Kategori laporan tidak valid.");

    }

  },


  // ==========================================================
  // STATISTIK LAPORAN
  // ==========================================================

  
getStatistics(filters = {}, admin = null) {

  const data = this.getAll(
    filters,
    admin
  );

  return {
    total: data.length,

    guruKelas: data.filter(item =>
      item.KATEGORI === "GURU_KELAS"
    ).length,

    guruMapel: data.filter(item =>
      item.KATEGORI === "GURU_MAPEL"
    ).length,

    guruNgaji: data.filter(item =>
      item.KATEGORI === "GURU_NGAJI"
    ).length
  };

},


};
