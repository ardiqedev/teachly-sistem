
/* =========================================
   TEACHLY - TAHUN AJARAN CONTROLLER
========================================= */

const TahunAjaranController = {

  /**
   * Mengambil tahun ajaran aktif.
   * Endpoint: tahunAjaran.aktif
   */
  getActive() {
    try {
      const tahunAjaran = TahunAjaranService.getActive();

      return Response.success(
        tahunAjaran,
        "Tahun ajaran aktif berhasil diambil."
      );

    } catch (error) {
      return Response.error(
        error.message || "Gagal mengambil tahun ajaran aktif."
      );
    }
  },

  /**
   * Registrasi endpoint.
   */
  registerRoutes() {
    Router.register(
      "tahunAjaran.aktif",
      this.getActive.bind(this)
    );
  }

};

// Registrasi route tahun ajaran
