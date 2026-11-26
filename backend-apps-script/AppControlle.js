
/**
 * ============================================================
 * TEACHLY - APPLICATION CONTROLLER
 * QEDEV BACKEND STANDARD
 * ============================================================
 *
 * Tanggung jawab:
 * 1. Menyediakan informasi aplikasi.
 * 2. Menyediakan informasi versi API.
 * 3. Mendaftarkan endpoint aplikasi ke Router.
 *
 * ============================================================
 */

const AppController = {

  /**
   * ----------------------------------------------------------
   * GET APPLICATION INFO
   * ----------------------------------------------------------
   */

  getInfo(payload = {}) {

    return Response.success(
      {
        app: TEACHLY_CONFIG.APP_NAME,
        version: TEACHLY_CONFIG.APP_VERSION,
        apiVersion: TEACHLY_CONFIG.API_VERSION,
        status: "READY"
      },
      "Informasi aplikasi berhasil diambil."
    );

  },

  /**
   * ----------------------------------------------------------
   * REGISTER ROUTES
   * ----------------------------------------------------------
   */

  
  registerRoutes() {

    Router.register(
      "app.info",
      this.getInfo
    );

    // ADMIN DASHBOARD
    Router.register(
      "adminDashboard.summary",
      (payload) => AdminDashboardService.getSummary(payload)
    );
    Router.register("adminDashboard.weeklyAbsences", () =>
      Response.success(AdminAbsensiService.getWeeklyAbsences())
    );

  }


};


/**
 * ============================================================
 * REGISTER APPLICATION ROUTES
 * ============================================================
 */

