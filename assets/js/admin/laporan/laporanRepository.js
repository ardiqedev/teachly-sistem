/* =========================================
   TEACHLY - ADMIN LAPORAN REPOSITORY
   QEDEV FRONTEND STANDARD
========================================= */

const LaporanRepository = {
  /**
   * Mengambil seluruh laporan.
   * Guru Kelas, Guru Mapel, dan Guru Ngaji.
   */
  async getAll(filters = {}) {
    return API.post("admin.laporan.getAll", {
      filters: filters,
    });
  },

  /**
   * Mengambil statistik seluruh laporan.
   */
  async getStatistics(filters = {}) {
    return API.post("admin.laporan.getStatistics", {
      filters: filters,
    });
  },

  /**
   * Mengambil detail laporan berdasarkan ID
   * dan kategori laporan.
   */
  async getDetail(idLaporan, kategori) {
    if (!idLaporan) {
      throw new Error("ID laporan wajib diisi.");
    }

    const validKategori = String(kategori || "")
      .trim()
      .toUpperCase();

    const allowedCategories = ["GURU_KELAS", "GURU_MAPEL", "GURU_NGAJI"];

    if (!allowedCategories.includes(validKategori)) {
      throw new Error("Kategori laporan tidak valid.");
    }

    return API.post("admin.laporan.getDetail", {
      idLaporan: String(idLaporan).trim(),
      kategori: validKategori,
    });
  },
};
