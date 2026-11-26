
/**
 * ============================================================
 * TEACHLY - GURU CONTROLLER
 * QEDEV BACKEND STANDARD
 * ============================================================
 *
 * Tanggung jawab:
 * 1. Menerima request terkait data guru.
 * 2. Memanggil GuruService.
 * 3. Mengembalikan response standar Teachly.
 * 4. Mendaftarkan endpoint guru ke Router.
 *
 * ============================================================
 */

const GuruController = {

  /**
   * ----------------------------------------------------------
   * GET GURU PROFILE
   * ----------------------------------------------------------
   *
   * Endpoint:
   * guru.profile
   *
   * Payload:
   * {
   *   nbm: "123456"
   * }
   *
   * ----------------------------------------------------------
   */

  getProfile(payload = {}) {

    try {

      const nbm = payload.nbm;

      const guru = GuruService.getActiveProfile(nbm);

      return Response.success(
        {
          NBM: guru.NBM,
          NAMA_GURU: guru.NAMA_GURU,
          STATUS_AKUN: guru.STATUS_AKUN
        },
        "Profil guru berhasil diambil."
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
      "guru.profile",
      this.getProfile
    );

  }

};


/**
 * ============================================================
 * REGISTER GURU ROUTES
 * ============================================================
 */

