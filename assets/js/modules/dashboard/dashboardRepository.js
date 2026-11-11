const DashboardRepository = {
  /**
   * Mengambil ringkasan data Dashboard.
   *
   * @param {string} nbm
   * @returns {Promise<Object>}
   */
  async getSummary(nbm) {
    if (!nbm) {
      return {
        success: false,
        message: "NBM guru tidak ditemukan.",
        data: null,
      };
    }

    return await API.post("dashboard.summary", {
      NBM: nbm,
    });
  },

  /**
   * Mengambil tahun ajaran aktif.
   *
   * @returns {Promise<Object>}
   */
  async getActiveAcademicYear() {
    return await API.post("tahunAjaran.aktif", {});
  },
};
