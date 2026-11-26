
/**
 * ============================================================
 * TEACHLY - ADMIN LAPORAN CONTROLLER
 * QEDEV BACKEND STANDARD
 * ============================================================
 *
 * Tanggung jawab:
 * 1. Menerima request laporan dari halaman Admin.
 * 2. Memanggil AdminLaporanService.
 * 3. Mengembalikan response standar Teachly.
 * 4. Mendaftarkan endpoint laporan ke Router.
 *
 * ============================================================
 */

const AdminLaporanController = {

  /**
   * ----------------------------------------------------------
   * GET ALL REPORTS
   * ----------------------------------------------------------
   *
   * Endpoint:
   * admin.laporan.getAll
   *
   * Payload:
   * {
   *   kategori: "GURU_KELAS",
   *   nbm: "",
   *   tanggalMulai: "",
   *   tanggalSelesai: "",
   *   idTahunAjaran: ""
   * }
   *
   * ----------------------------------------------------------
   */

  getAll(payload = {}, admin = null) {

    try {

      const data = AdminLaporanService.getAll(
        payload,
        admin
      );

      return Response.success(
        data,
        "Data laporan berhasil diambil."
      );

    } catch (error) {

      return Response.error(
        Utils.getErrorMessage(error)
      );

    }

  },


  /**
   * ----------------------------------------------------------
   * GET REPORT STATISTICS
   * ----------------------------------------------------------
   *
   * Endpoint:
   * admin.laporan.getStatistics
   *
   * ----------------------------------------------------------
   */

  getStatistics(payload = {}, admin = null) {

    try {

      const data = AdminLaporanService.getStatistics(
        payload,
        admin
      );

      return Response.success(
        data,
        "Statistik laporan berhasil diambil."
      );

    } catch (error) {

      return Response.error(
        Utils.getErrorMessage(error)
      );

    }

  },


  /**
   * ----------------------------------------------------------
   * GET REPORT DETAIL
   * ----------------------------------------------------------
   *
   * Endpoint:
   * admin.laporan.getDetail
   *
   * Payload:
   * {
   *   idLaporan: "LAP001",
   *   kategori: "GURU_KELAS"
   * }
   *
   * ----------------------------------------------------------
   */

  getDetail(payload = {}, admin = null) {

    try {

      const data = AdminLaporanService.getDetail(
        payload.idLaporan,
        payload.kategori,
        admin
      );

      return Response.success(
        data,
        "Detail laporan berhasil diambil."
      );

    } catch (error) {

      return Response.error(
        Utils.getErrorMessage(error)
      );

    }

  },

  /**
   * ----------------------------------------------------------
   * REGISTER ROUTES
   * ----------------------------------------------------------
   */

  registerRoutes() {

    Router.register(
      "admin.laporan.getAll",
      this.getAll
    );

    Router.register(
      "admin.laporan.getStatistics",
      this.getStatistics
    );

    Router.register(
      "admin.laporan.getDetail",
      this.getDetail
    );

  }

};


/**
 * ============================================================
 * REGISTER ADMIN LAPORAN ROUTES
 * ============================================================
 */

