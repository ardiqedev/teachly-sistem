
/* =========================================
   TEACHLY - ADMIN SESI CONTROLLER
========================================= */

const AdminSesiController = {

  getList(payload = {}) {
    try {
      return Response.success(
        SesiNgajiService.getAll(),
        "Daftar sesi ngaji berhasil diambil."
      );
    } catch (error) {
      return Response.error(Utils.getErrorMessage(error));
    }
  },

  create(payload = {}) {
    try {
      return Response.success(
        SesiNgajiService.create(payload),
        "Sesi ngaji berhasil ditambahkan."
      );
    } catch (error) {
      return Response.error(Utils.getErrorMessage(error));
    }
  },

  update(payload = {}) {
    try {
      return Response.success(
        SesiNgajiService.update(
          payload.ID_SESI,
          payload
        ),
        "Sesi ngaji berhasil diperbarui."
      );
    } catch (error) {
      return Response.error(Utils.getErrorMessage(error));
    }
  },

  updateStatus(payload = {}) {
    try {
      return Response.success(
        SesiNgajiService.updateStatus(
          payload.ID_SESI,
          payload.STATUS_SESI
        ),
        "Status sesi ngaji berhasil diperbarui."
      );
    } catch (error) {
      return Response.error(Utils.getErrorMessage(error));
    }
  },

  registerRoutes() {
    Router.register("adminSesi.list", this.getList);
    Router.register("adminSesi.create", this.create);
    Router.register("adminSesi.update", this.update);
    Router.register(
      "adminSesi.updateStatus",
      this.updateStatus
    );
  }

};

