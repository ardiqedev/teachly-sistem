
const DashboardController = {
  /**
   * Mengambil ringkasan Dashboard guru.
   *
   * @param {Object} payload
   * @returns {Object}
   */
  getSummary(payload = {}) {
    try {
      const data = DashboardService.getSummary(payload.NBM, payload.IS_KEPALA_SEKOLAH);

      return Response.success(
        data,
        "Ringkasan Dashboard berhasil dimuat."
      );
    } catch (error) {
      Utils.logError("DashboardController.getSummary", error);

      return Response.error(
        Utils.getErrorMessage(error)
      );
    }
  },

  /**
   * Registrasi endpoint Dashboard.
   */
  registerRoutes() {
    Router.register(
      "dashboard.summary",
      this.getSummary
    );
  }
};

