
/**
 * ============================================================
 * TEACHLY - LAPORAN FORM OPTIONS CONTROLLER
 * QEDEV BACKEND STANDARD
 * ============================================================
 *
 * Tanggung jawab:
 * 1. Menyediakan opsi form Guru Kelas.
 * 2. Menyediakan opsi form Guru Mapel.
 * 3. Menyediakan opsi form Guru Ngaji.
 * 4. Mendaftarkan endpoint form options.
 *
 * Endpoint:
 * laporan.formOptions
 *
 * ============================================================
 */

const LaporanFormOptionsController = {

  /**
   * ----------------------------------------------------------
   * GET LAPORAN FORM OPTIONS
   * ----------------------------------------------------------
   *
   * Endpoint:
   * laporan.formOptions
   *
   * ----------------------------------------------------------
   */

  getFormOptions(payload = {}) {

    try {

      const data = LaporanFormOptionsService.getAll(payload.NBM);

      return Response.success(
        data,
        "Opsi form laporan berhasil diambil."
      );

    } catch (error) {

      Utils.logError(
        "LaporanFormOptionsController.getFormOptions",
        error
      );

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
      "laporan.formOptions",
      this.getFormOptions
    );

  }

};


/**
 * ============================================================
 * REGISTER LAPORAN FORM OPTIONS ROUTES
 * ============================================================
 */

