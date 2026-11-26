
/**
 * ============================================================
 * TEACHLY - DROPDOWN SERVICE
 * QEDEV BACKEND STANDARD
 * ============================================================
 *
 * Tanggung jawab:
 * 1. Menyediakan dropdown Tingkat.
 * 2. Menyediakan dropdown Kelas berdasarkan Tingkat.
 * 3. Menyediakan dropdown Mata Pelajaran.
 * 4. Menyediakan dropdown Sesi Ngaji.
 * 5. Menyediakan dropdown Kelompok Ngaji.
 *
 * Seluruh data bersumber dari master Spreadsheet.
 * Tidak menggunakan data hardcode.
 *
 * ============================================================
 */

const DropdownService = {

  /**
   * Dropdown Tingkat
   */
  getTingkat() {
    return KelasService.getAvailableTingkat();
  },

  /**
   * Dropdown Kelas berdasarkan Tingkat
   */
  getKelasByTingkat(tingkat) {
    return KelasService.getClassesByTingkat(tingkat);
  },

  /**
   * Dropdown Mata Pelajaran
   */
  getMataPelajaran() {
    return MataPelajaranService.getActive();
  },

  /**
   * Dropdown Sesi Ngaji
   */
  getSesiNgaji() {
    return SesiNgajiService.getActive();
  },

  /**
   * Dropdown Kelompok Ngaji
   */
  getKelompokNgaji() {
    return KelompokNgajiService.getActive();
  }

};
