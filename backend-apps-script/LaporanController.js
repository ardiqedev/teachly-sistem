
/**
 * ============================================================
 * TEACHLY - LAPORAN CONTROLLER
 * QEDEV BACKEND STANDARD
 * ============================================================
 *
 * Endpoint:
 *
 * CREATE:
 * 1. laporan.createGuruKelas
 * 2. laporan.createGuruMapel
 * 3. laporan.createGuruNgaji
 *
 * RIWAYAT:
 * 4. laporan.getHistoryGuruKelas
 * 5. laporan.getHistoryGuruMapel
 * 6. laporan.getHistoryGuruNgaji
 *
 * DETAIL:
 * 7. laporan.getDetailGuruKelas
 * 8. laporan.getDetailGuruMapel
 * 9. laporan.getDetailGuruNgaji
 *
 * UPDATE:
 *
 * ============================================================
 */

const LaporanController = {

  // ==========================================================
  // CREATE LAPORAN
  // ==========================================================

  createGuruKelas(payload = {}) {

    try {

      const data = LaporanService.createGuruKelas(payload);

      return Response.success(
        data,
        "Laporan Guru Kelas berhasil disimpan."
      );

    } catch (error) {

      Utils.logError("LaporanController.createGuruKelas", error);

      return Response.error(
        Utils.getErrorMessage(error)
      );

    }

  },


  createGuruMapel(payload = {}) {

    try {

      const data = LaporanService.createGuruMapel(payload);

      return Response.success(
        data,
        "Laporan Guru Mapel berhasil disimpan."
      );

    } catch (error) {

      Utils.logError("LaporanController.createGuruMapel", error);

      return Response.error(
        Utils.getErrorMessage(error)
      );

    }

  },


  createGuruNgaji(payload = {}) {

    try {

      const data = LaporanService.createGuruNgaji(payload);

      return Response.success(
        data,
        "Laporan Guru Ngaji berhasil disimpan."
      );

    } catch (error) {

      Utils.logError("LaporanController.createGuruNgaji", error);

      return Response.error(
        Utils.getErrorMessage(error)
      );

    }

  },


  // ==========================================================
  // RIWAYAT LAPORAN
  // ==========================================================

  getHistoryGuruKelas(payload = {}) {

    try {

      const data = LaporanService.getHistoryGuruKelas(
        payload.nbm,
        payload.filters || {}
      );

      return Response.success(
        data,
        "Riwayat laporan Guru Kelas berhasil diambil."
      );

    } catch (error) {

      Utils.logError("LaporanController.getHistoryGuruKelas", error);

      return Response.error(
        Utils.getErrorMessage(error)
      );

    }

  },


  getHistoryGuruMapel(payload = {}) {

    try {

      const data = LaporanService.getHistoryGuruMapel(
        payload.nbm,
        payload.filters || {}
      );

      return Response.success(
        data,
        "Riwayat laporan Guru Mapel berhasil diambil."
      );

    } catch (error) {

      Utils.logError("LaporanController.getHistoryGuruMapel", error);

      return Response.error(
        Utils.getErrorMessage(error)
      );

    }

  },


  getHistoryGuruNgaji(payload = {}) {

    try {

      const data = LaporanService.getHistoryGuruNgaji(
        payload.nbm,
        payload.filters || {}
      );

      return Response.success(
        data,
        "Riwayat laporan Guru Ngaji berhasil diambil."
      );

    } catch (error) {

      Utils.logError("LaporanController.getHistoryGuruNgaji", error);

      return Response.error(
        Utils.getErrorMessage(error)
      );

    }

  },


  // ==========================================================
  // DETAIL LAPORAN
  // ==========================================================

  getDetailGuruKelas(payload = {}) {

    try {

      const data = LaporanService.getDetail(
        LaporanService.SHEETS.GURU_KELAS,
        payload.idLaporan,
        payload.nbm
      );

      return Response.success(
        data,
        "Detail laporan Guru Kelas berhasil diambil."
      );

    } catch (error) {

      Utils.logError("LaporanController.getDetailGuruKelas", error);

      return Response.error(
        Utils.getErrorMessage(error)
      );

    }

  },


  getDetailGuruMapel(payload = {}) {

    try {

      const data = LaporanService.getDetail(
        LaporanService.SHEETS.GURU_MAPEL,
        payload.idLaporan,
        payload.nbm
      );

      return Response.success(
        data,
        "Detail laporan Guru Mapel berhasil diambil."
      );

    } catch (error) {

      Utils.logError("LaporanController.getDetailGuruMapel", error);

      return Response.error(
        Utils.getErrorMessage(error)
      );

    }

  },


  getDetailGuruNgaji(payload = {}) {

    try {

      const data = LaporanService.getDetail(
        LaporanService.SHEETS.GURU_NGAJI,
        payload.idLaporan,
        payload.nbm
      );

      return Response.success(
        data,
        "Detail laporan Guru Ngaji berhasil diambil."
      );

    } catch (error) {

      Utils.logError("LaporanController.getDetailGuruNgaji", error);

      return Response.error(
        Utils.getErrorMessage(error)
      );

    }

  },


  // ==========================================================
  // UPDATE LAPORAN
  // ==========================================================

  updateGuruKelas(payload = {}) {

    try {

      const data = LaporanService.update(
        LaporanService.SHEETS.GURU_KELAS,
        payload.idLaporan,
        payload.nbm,
        payload.data
      );

      return Response.success(
        data,
        "Laporan Guru Kelas berhasil diperbarui."
      );

    } catch (error) {

      Utils.logError("LaporanController.updateGuruKelas", error);

      return Response.error(
        Utils.getErrorMessage(error)
      );

    }

  },


  updateGuruMapel(payload = {}) {

    try {

      const data = LaporanService.update(
        LaporanService.SHEETS.GURU_MAPEL,
        payload.idLaporan,
        payload.nbm,
        payload.data
      );

      return Response.success(
        data,
        "Laporan Guru Mapel berhasil diperbarui."
      );

    } catch (error) {

      Utils.logError("LaporanController.updateGuruMapel", error);

      return Response.error(
        Utils.getErrorMessage(error)
      );

    }

  },


  updateGuruNgaji(payload = {}) {

    try {

      const data = LaporanService.update(
        LaporanService.SHEETS.GURU_NGAJI,
        payload.idLaporan,
        payload.nbm,
        payload.data
      );

      return Response.success(
        data,
        "Laporan Guru Ngaji berhasil diperbarui."
      );

    } catch (error) {

      Utils.logError("LaporanController.updateGuruNgaji", error);

      return Response.error(
        Utils.getErrorMessage(error)
      );

    }

  },


  // ==========================================================
  // REGISTER ROUTES
  // ==========================================================

  registerRoutes() {
    Router.register("laporan.createKepalaSekolah", (payload) =>
      Response.success(LaporanService.create(LaporanService.SHEETS.KEPALA_SEKOLAH, payload))
    );
    Router.register("laporan.getHistoryKepalaSekolah", (payload) =>
      Response.success(LaporanService.getHistory(LaporanService.SHEETS.KEPALA_SEKOLAH, payload.NBM, payload.filters))
    );
    Router.register("laporan.getDetailKepalaSekolah", (payload) =>
      Response.success(LaporanService.getDetail(LaporanService.SHEETS.KEPALA_SEKOLAH, payload.idLaporan, payload.NBM))
    );
    Router.register("admin.absensi.summary", (payload) =>
      Response.success(AdminAbsensiService.getSummary(payload))
    );
    Router.register("admin.absensi.detail", (payload) =>
      Response.success(AdminAbsensiService.getDetail(payload))
    );
    Router.register("admin.absensi.monthly", (payload) =>
      Response.success(AdminAbsensiService.getMonthly(payload))
    );
    Router.register("laporan.absensiSiswa", (payload) =>
      Response.success(AbsensiSiswaService.read(payload))
    );

    // CREATE
    Router.register("laporan.createGuruKelas", this.createGuruKelas);
    Router.register("laporan.createGuruMapel", this.createGuruMapel);
    Router.register("laporan.createGuruNgaji", this.createGuruNgaji);

    // RIWAYAT
    Router.register("laporan.getHistoryGuruKelas", this.getHistoryGuruKelas);
    Router.register("laporan.getHistoryGuruMapel", this.getHistoryGuruMapel);
    Router.register("laporan.getHistoryGuruNgaji", this.getHistoryGuruNgaji);

    // DETAIL
    Router.register("laporan.getDetailGuruKelas", this.getDetailGuruKelas);
    Router.register("laporan.getDetailGuruMapel", this.getDetailGuruMapel);
    Router.register("laporan.getDetailGuruNgaji", this.getDetailGuruNgaji);

  }

};


/**
 * ============================================================
 * REGISTER LAPORAN ROUTES
 * ============================================================
 */

