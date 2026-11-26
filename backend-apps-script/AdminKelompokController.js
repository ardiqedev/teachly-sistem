
/* =========================================
   TEACHLY - ADMIN KELOMPOK CONTROLLER
========================================= */

const AdminKelompokController = {

  getList(payload = {}) {
    try {
      return Response.success(
        KelompokNgajiService.getAll(),
        "Daftar kelompok ngaji berhasil diambil."
      );
    } catch (error) {
      return Response.error(Utils.getErrorMessage(error));
    }
  },

  create(payload = {}) {
    try {
      return Response.success(
        KelompokNgajiService.create(payload),
        "Kelompok ngaji berhasil ditambahkan."
      );
    } catch (error) {
      return Response.error(Utils.getErrorMessage(error));
    }
  },

  update(payload = {}) {
    try {
      return Response.success(
        KelompokNgajiService.update(
          payload.ID_KELOMPOK,
          payload
        ),
        "Kelompok ngaji berhasil diperbarui."
      );
    } catch (error) {
      return Response.error(Utils.getErrorMessage(error));
    }
  },

  updateStatus(payload = {}) {
    try {
      return Response.success(
        KelompokNgajiService.updateStatus(
          payload.ID_KELOMPOK,
          payload.STATUS_KELOMPOK
        ),
        "Status kelompok ngaji berhasil diperbarui."
      );
    } catch (error) {
      return Response.error(Utils.getErrorMessage(error));
    }
  },

  registerRoutes() {
    Router.register(
      "adminKelompok.list",
      this.getList
    );

    Router.register(
      "adminKelompok.create",
      this.create
    );

    Router.register(
      "adminKelompok.update",
      this.update
    );

    Router.register(
      "adminKelompok.updateStatus",
      this.updateStatus
    );
  }

};

