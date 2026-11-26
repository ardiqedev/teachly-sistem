
const DashboardRepository = {
  /**
   * Mengambil laporan Guru Kelas berdasarkan NBM.
   *
   * @param {string} nbm
   * @returns {Array<Object>}
   */
  getLaporanGuruKelas(nbm) {
    return LaporanRepository.getByNBM(
      LaporanService.SHEETS.GURU_KELAS,
      nbm
    );
  },

  /**
   * Mengambil laporan Guru Mapel berdasarkan NBM.
   *
   * @param {string} nbm
   * @returns {Array<Object>}
   */
  getLaporanGuruMapel(nbm) {
    return LaporanRepository.getByNBM(
      LaporanService.SHEETS.GURU_MAPEL,
      nbm
    );
  },

  /**
   * Mengambil laporan Guru Ngaji berdasarkan NBM.
   *
   * @param {string} nbm
   * @returns {Array<Object>}
   */
  getLaporanGuruNgaji(nbm) {
    return LaporanRepository.getByNBM(
      LaporanService.SHEETS.GURU_NGAJI,
      nbm
    );
  },

  /**
   * Mengambil seluruh kategori laporan berdasarkan NBM.
   *
   * @param {string} nbm
   * @returns {Object}
   */
  getAllLaporanByNBM(nbm) {
    return {
      guruKelas: this.getLaporanGuruKelas(nbm),
      guruMapel: this.getLaporanGuruMapel(nbm),
      guruNgaji: this.getLaporanGuruNgaji(nbm)
    };
  }
};
