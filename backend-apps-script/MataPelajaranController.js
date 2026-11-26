
/**
 * ============================================================
 * TEACHLY - MATA PELAJARAN CONTROLLER
 * QEDEV BACKEND STANDARD
 * ============================================================
 *
 * Tanggung jawab:
 * 1. Mengambil daftar mata pelajaran aktif.
 * 2. Mengambil detail mata pelajaran berdasarkan ID_MAPEL.
 * 3. Mendaftarkan endpoint mata pelajaran ke Router.
 *
 * ============================================================
 */

const MataPelajaranController = {

  /**
   * ----------------------------------------------------------
   * GET ACTIVE MATA PELAJARAN
   * ----------------------------------------------------------
   *
   * Endpoint:
   * mapel.list
   *
   * ----------------------------------------------------------
   */

  getList(payload = {}) {

    try {

      const data = MataPelajaranService.getActive();

      return Response.success(
        data,
        "Daftar mata pelajaran berhasil diambil."
      );

    } catch (error) {

      return Response.error(
        Utils.getErrorMessage(error)
      );

    }

  },


  /**
   * ----------------------------------------------------------
   * GET MATA PELAJARAN DETAIL
   * ----------------------------------------------------------
   *
   * Endpoint:
   * mapel.detail
   *
   * Payload:
   * {
   *   idMapel: "MAPEL-001"
   * }
   *
   * ----------------------------------------------------------
   */

  getDetail(payload = {}) {

    try {

      const data = MataPelajaranService.validateMapel(
        payload.idMapel
      );

      return Response.success(
        data,
        "Detail mata pelajaran berhasil diambil."
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
      "mapel.list",
      this.getList
    );

    Router.register(
      "mapel.detail",
      this.getDetail
    );

  }

};


/**
 * ============================================================
 * REGISTER MATA PELAJARAN ROUTES
 * ============================================================
 */

