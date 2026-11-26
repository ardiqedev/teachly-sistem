
/**
 * ============================================================
 * TEACHLY - ADMIN TAHUN AJARAN CONTROLLER
 * QEDEV BACKEND STANDARD
 * ============================================================
 *
 * Tanggung jawab:
 * 1. Mengambil seluruh tahun ajaran.
 * 2. Menambahkan tahun ajaran baru.
 * 3. Memperbarui nama tahun ajaran.
 * 4. Mengaktifkan tahun ajaran.
 *
 * Aturan:
 * - Wajib tepat satu tahun ajaran AKTIF.
 * - Tahun ajaran baru otomatis NONAKTIF.
 * - Aktivasi tahun baru menonaktifkan tahun sebelumnya.
 * - Tidak menyediakan nonaktif manual.
 * - Tidak menyediakan hapus permanen.
 *
 * ============================================================
 */

const AdminTahunAjaranController = {

  /**
   * ----------------------------------------------------------
   * GET ALL TAHUN AJARAN
   * ----------------------------------------------------------
   *
   * Endpoint: adminTahunAjaran.list
   *
   */

  getList(payload = {}) {
    try {

      const data = TahunAjaranService.getAll();

      return Response.success(
        data,
        "Daftar tahun ajaran berhasil diambil."
      );

    } catch (error) {

      return Response.error(
        Utils.getErrorMessage(error)
      );

    }
  },

  /**
   * ----------------------------------------------------------
   * CREATE TAHUN AJARAN
   * ----------------------------------------------------------
   *
   * Endpoint: adminTahunAjaran.create
   *
   * Payload:
   * {
   *   NAMA_TAHUN_AJARAN: "2031/2032"
   * }
   *
   */

  create(payload = {}) {
    try {

      const data = TahunAjaranService.create(payload);

      return Response.success(
        data,
        "Tahun ajaran berhasil ditambahkan."
      );

    } catch (error) {

      return Response.error(
        Utils.getErrorMessage(error)
      );

    }
  },

  /**
   * ----------------------------------------------------------
   * UPDATE TAHUN AJARAN
   * ----------------------------------------------------------
   *
   * Endpoint: adminTahunAjaran.update
   *
   * Payload:
   * {
   *   ID_TAHUN_AJARAN: "TA002",
   *   NAMA_TAHUN_AJARAN: "2027/2028"
   * }
   *
   */

  update(payload = {}) {
    try {

      const data = TahunAjaranService.update(
        payload.ID_TAHUN_AJARAN,
        payload
      );

      return Response.success(
        data,
        "Tahun ajaran berhasil diperbarui."
      );

    } catch (error) {

      return Response.error(
        Utils.getErrorMessage(error)
      );

    }
  },

  /**
   * ----------------------------------------------------------
   * ACTIVATE TAHUN AJARAN
   * ----------------------------------------------------------
   *
   * Endpoint: adminTahunAjaran.activate
   *
   * Payload:
   * {
   *   ID_TAHUN_AJARAN: "TA002"
   * }
   *
   */

  activate(payload = {}) {
    try {

      const data = TahunAjaranService.activate(
        payload.ID_TAHUN_AJARAN
      );

      return Response.success(
        data,
        "Tahun ajaran berhasil diaktifkan."
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
      "adminTahunAjaran.list",
      this.getList
    );

    Router.register(
      "adminTahunAjaran.create",
      this.create
    );

    Router.register(
      "adminTahunAjaran.update",
      this.update
    );

    Router.register(
      "adminTahunAjaran.activate",
      this.activate
    );

  }

};

/**
 * ============================================================
 * REGISTER ADMIN TAHUN AJARAN ROUTES
 * ============================================================
 */

