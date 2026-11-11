/* =========================================
   TEACHLY - ADMIN LAPORAN SERVICE
   QEDEV FRONTEND STANDARD
========================================= */

const LaporanService = {
  CATEGORIES: {
    GURU_KELAS: "GURU_KELAS",
    GURU_MAPEL: "GURU_MAPEL",
    GURU_NGAJI: "GURU_NGAJI",
  },

  // ==================================================
  // AMBIL SEMUA LAPORAN
  // ==================================================

  async getAll(filters = {}) {
    const response = await LaporanRepository.getAll(filters);

    if (!response || response.success !== true) {
      throw new Error(response?.message || "Gagal mengambil data laporan.");
    }

    return Array.isArray(response.data) ? response.data : [];
  },

  // ==================================================
  // AMBIL LAPORAN BERDASARKAN KATEGORI
  // ==================================================

  async getByCategory(kategori, filters = {}) {
    const validKategori = this.validateCategory(kategori);

    const data = await this.getAll(filters);

    return data.filter(
      (item) => String(item.KATEGORI || "").toUpperCase() === validKategori,
    );
  },

  // ==================================================
  // AMBIL STATISTIK
  // ==================================================

  async getStatistics(filters = {}) {
    const response = await LaporanRepository.getStatistics(filters);

    if (!response || response.success !== true) {
      throw new Error(
        response?.message || "Gagal mengambil statistik laporan.",
      );
    }

    const data = response.data || {};

    return {
      total: Number(data.total) || 0,
      guruKelas: Number(data.guruKelas) || 0,
      guruMapel: Number(data.guruMapel) || 0,
      guruNgaji: Number(data.guruNgaji) || 0,
    };
  },

  // ==================================================
  // DETAIL LAPORAN
  // ==================================================

  async getDetail(idLaporan, kategori) {
    const validKategori = this.validateCategory(kategori);

    const id = String(idLaporan || "").trim();

    if (!id) {
      throw new Error("ID laporan wajib diisi.");
    }

    const response = await LaporanRepository.getDetail(id, validKategori);

    if (!response || response.success !== true) {
      throw new Error(response?.message || "Gagal mengambil detail laporan.");
    }

    if (!response.data) {
      throw new Error("Detail laporan tidak ditemukan.");
    }

    return response.data;
  },

  // ==================================================
  // VALIDASI KATEGORI
  // ==================================================

  validateCategory(kategori) {
    const value = String(kategori || "")
      .trim()
      .toUpperCase();

    if (!Object.values(this.CATEGORIES).includes(value)) {
      throw new Error("Kategori laporan tidak valid.");
    }

    return value;
  },

  // ==================================================
  // FORMAT TANGGAL
  // ==================================================

  formatDate(value) {
    if (!value) return "-";

    const date = new Date(value);

    if (isNaN(date.getTime())) return "-";

    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);
  },

  // ==================================================
  // FORMAT KEHADIRAN
  // ==================================================

  formatAttendance(data = {}) {
    return {
      sakit: Number(data.SAKIT) || 0,
      izin: Number(data.IZIN) || 0,
      alpa: Number(data.ALPA) || 0,
    };
  },

  // ==================================================
  // PENCARIAN LAPORAN
  // ==================================================

  search(data = [], keyword = "") {
    const query = String(keyword || "")
      .trim()
      .toLowerCase();

    if (!query) return [...data];

    return data.filter((item) => {
      const searchable = [
        item.NBM,
        item.NAMA_GURU,
        item.NAMA_KATEGORI,
        item.NAMA_KELAS,
        item.NAMA_MAPEL,
        item.NAMA_KELOMPOK,
        item.NAMA_SESI,
        item.RINGKASAN_PEMBELAJARAN,
      ];

      return searchable.some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(query),
      );
    });
  },
};
