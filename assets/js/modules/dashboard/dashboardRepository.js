/* =========================================
   TEACHLY - DASHBOARD REPOSITORY
========================================= */

const DashboardRepository = {
  async getSummary() {
    const response = await API.post("dashboard.summary", {});

    if (!response || response.success !== true) {
      throw new Error(response?.message || "Gagal mengambil data dashboard.");
    }

    return response.data;
  },
};
