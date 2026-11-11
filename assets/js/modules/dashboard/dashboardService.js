const DashboardService = {
  /**
   * Mengambil ringkasan Dashboard.
   *
   * @param {string} nbm
   * @returns {Promise<Object>}
   */
  async getSummary(nbm) {
    try {
      const response = await DashboardRepository.getSummary(nbm);

      if (!response || response.success !== true) {
        return {
          success: false,
          message: response?.message || "Gagal mengambil ringkasan Dashboard.",
          data: null,
        };
      }

      return {
        success: true,
        message: response.message || "Ringkasan Dashboard berhasil dimuat.",
        data: response.data || {},
      };
    } catch (error) {
      console.error("[DashboardService.getSummary]", error);

      return {
        success: false,
        message: error.message || "Terjadi kesalahan saat mengambil ringkasan.",
        data: null,
      };
    }
  },

  /**
   * Mengambil tahun ajaran aktif.
   *
   * @returns {Promise<Object>}
   */
  async getActiveAcademicYear() {
    try {
      const response = await DashboardRepository.getActiveAcademicYear();

      if (!response || response.success !== true) {
        return {
          success: false,
          message: response?.message || "Gagal mengambil tahun ajaran aktif.",
          data: null,
        };
      }

      return {
        success: true,
        message: response.message || "Tahun ajaran berhasil dimuat.",
        data: response.data || {},
      };
    } catch (error) {
      console.error("[DashboardService.getActiveAcademicYear]", error);

      return {
        success: false,
        message:
          error.message || "Terjadi kesalahan saat mengambil tahun ajaran.",
        data: null,
      };
    }
  },
};
