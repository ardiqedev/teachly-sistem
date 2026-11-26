
/**
 * ============================================================
 * TEACHLY - PENGGUNA CONTROLLER
 * QEDEV BACKEND STANDARD
 * ============================================================
 *
 * CRUD Pengguna:
 * - List
 * - Create
 * - Update
 * - Update Status
 * - Reset Password
 *
 * Autentikasi Admin wajib diperiksa Router.
 * ============================================================
 */

const PenggunaController = {

  /* =========================================
     LIST PENGGUNA
  ========================================= */

  list(payload = {}) {

    try {

      const data = PenggunaService.list();

      return Response.success(
        data,
        "Data pengguna berhasil dimuat."
      );

    } catch (error) {

      return Response.error(
        Utils.getErrorMessage(error)
      );

    }

  },


  /* =========================================
     CREATE PENGGUNA
  ========================================= */

  create(payload = {}) {

    try {

      const pengguna = PenggunaService.create(
        payload
      );

      return Response.success(
        pengguna,
        "Pengguna berhasil ditambahkan."
      );

    } catch (error) {

      return Response.error(
        Utils.getErrorMessage(error)
      );

    }

  },


  /* =========================================
     UPDATE PENGGUNA
  ========================================= */

  update(payload = {}) {

    try {

      const pengguna = PenggunaService.update(
        payload.ID_PENGGUNA,
        payload
      );

      return Response.success(
        pengguna,
        "Pengguna berhasil diperbarui."
      );

    } catch (error) {

      return Response.error(
        Utils.getErrorMessage(error)
      );

    }

  },


  /* =========================================
     UPDATE STATUS
  ========================================= */

  updateStatus(payload = {}) {

    try {

      const pengguna = PenggunaService.updateStatus(
        payload.ID_PENGGUNA,
        payload.STATUS_AKUN
      );

      return Response.success(
        pengguna,
        "Status pengguna berhasil diperbarui."
      );

    } catch (error) {

      return Response.error(
        Utils.getErrorMessage(error)
      );

    }

  },


  /* =========================================
     RESET PASSWORD
  ========================================= */

  resetPassword(payload = {}) {

    try {

      const result = PenggunaService.resetPassword(
        payload.ID_PENGGUNA,
        payload.PASSWORD
      );

      return Response.success(
        result,
        "Password pengguna berhasil diperbarui."
      );

    } catch (error) {

      return Response.error(
        Utils.getErrorMessage(error)
      );

    }

  },


  /* =========================================
     REGISTER ROUTES
  ========================================= */

  registerRoutes() {

    Router.register(
      "pengguna.list",
      this.list.bind(this)
    );

    Router.register(
      "pengguna.create",
      this.create.bind(this)
    );

    Router.register(
      "pengguna.update",
      this.update.bind(this)
    );

    Router.register(
      "pengguna.updateStatus",
      this.updateStatus.bind(this)
    );

    Router.register(
      "pengguna.resetPassword",
      this.resetPassword.bind(this)
    );

  }

};


/* =========================================
   REGISTER CONTROLLER
========================================= */

