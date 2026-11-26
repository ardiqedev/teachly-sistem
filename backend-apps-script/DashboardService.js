
const DashboardService = {
  /**
   * Mengambil dan mengolah ringkasan Dashboard.
   *
   * @param {string} nbm
   * @returns {Object}
   */
  getSummary(nbm, principal = false) {
    const normalizedNBM = Utils.normalizeText(nbm);
    Utils.required(normalizedNBM, "NBM");

    if (!Utils.validateNBM(normalizedNBM)) {
      throw new Error("Format NBM tidak valid.");
    }

    const laporan = principal ? { guruKelas: [], guruMapel: [], guruNgaji: [] } : DashboardRepository.getAllLaporanByNBM(
      normalizedNBM
    );

    const semuaLaporan = principal && SheetManager.getDatabase().getSheetByName("LAPORAN_KEPALA_SEKOLAH")
      ? LaporanRepository.getByNBM("LAPORAN_KEPALA_SEKOLAH", normalizedNBM)
      : [
      ...laporan.guruKelas,
      ...laporan.guruMapel,
      ...laporan.guruNgaji
    ];

    const sekarang = new Date();

    const hariIni = Utilities.formatDate(
      sekarang,
      TEACHLY_CONFIG.TIMEZONE,
      "yyyy-MM-dd"
    );

    const bulanIni = Utilities.formatDate(
      sekarang,
      TEACHLY_CONFIG.TIMEZONE,
      "yyyy-MM"
    );

    const hitungTanggal = (tanggal) => {
      if (!tanggal) return "";

      const date = new Date(tanggal);

      if (isNaN(date.getTime())) return "";

      return Utilities.formatDate(
        date,
        TEACHLY_CONFIG.TIMEZONE,
        "yyyy-MM-dd"
      );
    };

    const laporanHariIni = semuaLaporan.filter((item) => {
      return hitungTanggal(item.TANGGAL_LAPORAN) === hariIni;
    });

    const laporanBulanIni = semuaLaporan.filter((item) => {
      return hitungTanggal(item.TANGGAL_LAPORAN).startsWith(bulanIni);
    });

    return {
      totalLaporan: semuaLaporan.length,
      laporanHariIni: laporanHariIni.length,
      laporanBulanIni: laporanBulanIni.length,

      kategori: {
        guruKelas: laporan.guruKelas.length,
        guruMapel: laporan.guruMapel.length,
        guruNgaji: laporan.guruNgaji.length
      }
    };
  }
};
