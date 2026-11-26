
/**
 * TEACHLY - ADMIN KELAS CONTROLLER
 */

const AdminKelasController = {

  getList(payload = {}) {
    try {
      return Response.success(
        KelasService.getAll(),
        "Daftar kelas berhasil diambil."
      );
    } catch (error) {
      return Response.error(Utils.getErrorMessage(error));
    }
  },

  create(payload = {}) {
    try {
      return Response.success(
        KelasService.create(payload),
        "Kelas berhasil ditambahkan."
      );
    } catch (error) {
      return Response.error(Utils.getErrorMessage(error));
    }
  },

  update(payload = {}) {
    try {
      return Response.success(
        KelasService.update(payload.ID_KELAS, payload),
        "Kelas berhasil diperbarui."
      );
    } catch (error) {
      return Response.error(Utils.getErrorMessage(error));
    }
  },

  updateStatus(payload = {}) {
    try {
      return Response.success(
        KelasService.updateStatus(
          payload.ID_KELAS,
          payload.STATUS_KELAS
        ),
        "Status kelas berhasil diperbarui."
      );
    } catch (error) {
      return Response.error(Utils.getErrorMessage(error));
    }
  },

  registerRoutes() {
    Router.register("adminKelas.list", this.getList);
    Router.register("adminKelas.create", this.create);
    Router.register("adminKelas.update", this.update);
    Router.register("adminKelas.updateStatus", this.updateStatus);
  }

};

