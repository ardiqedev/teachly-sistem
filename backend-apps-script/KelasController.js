
/**
 * ============================================================
 * TEACHLY - KELAS CONTROLLER
 * QEDEV BACKEND STANDARD
 * ============================================================
 *
 * Tanggung jawab:
 * 1. Mengambil daftar kelas aktif.
 * 2. Mengambil daftar tingkat yang tersedia.
 * 3. Mengambil kelas berdasarkan tingkat.
 * 4. Mendaftarkan endpoint kelas ke Router.
 *
 * ============================================================
 */

const KelasController = {

  /**
   * ----------------------------------------------------------
   * GET ACTIVE KELAS
   * ----------------------------------------------------------
   *
   * Endpoint:
   * kelas.list
   *
   * ----------------------------------------------------------
   */

  getList(payload = {}) {

    try {

      const data = KelasService.getActiveClasses();

      return Response.success(
        data,
        "Daftar kelas berhasil diambil."
      );

    } catch (error) {

      return Response.error(
        Utils.getErrorMessage(error)
      );

    }

  },


  /**
   * ----------------------------------------------------------
   * GET AVAILABLE TINGKAT
   * ----------------------------------------------------------
   *
   * Endpoint:
   * kelas.tingkat
   *
   * ----------------------------------------------------------
   */

  getTingkat(payload = {}) {

    try {

      const data = KelasService.getAvailableTingkat();

      return Response.success(
        data,
        "Daftar tingkat berhasil diambil."
      );

    } catch (error) {

      return Response.error(
        Utils.getErrorMessage(error)
      );

    }

  },


  /**
   * ----------------------------------------------------------
   * GET KELAS BY TINGKAT
   * ----------------------------------------------------------
   *
   * Endpoint:
   * kelas.byTingkat
   *
   * Payload:
   * {
   *   tingkat: "1"
   * }
   *
   * ----------------------------------------------------------
   */

  getByTingkat(payload = {}) {

    try {

      const data = KelasService.getClassesByTingkat(
        payload.tingkat
      );

      return Response.success(
        data,
        "Daftar kelas berdasarkan tingkat berhasil diambil."
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
      "kelas.list",
      this.getList
    );

    Router.register(
      "kelas.tingkat",
      this.getTingkat
    );

    Router.register(
      "kelas.byTingkat",
      this.getByTingkat
    );

  }

};


/**
 * ============================================================
 * REGISTER KELAS ROUTES
 * ============================================================
 */

