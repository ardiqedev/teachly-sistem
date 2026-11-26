
/* =========================================
   TEACHLY - ADMIN MAPEL CONTROLLER
========================================= */

const AdminMapelController = {

  /* =====================================
     GET ALL MAPEL
  ===================================== */

  getList(payload = {}) {
    try {
      return Response.success(
        MataPelajaranService.getAll(),
        "Daftar mata pelajaran berhasil diambil."
      );
    } catch (error) {
      return Response.error(Utils.getErrorMessage(error));
    }
  },

  /* =====================================
     CREATE MAPEL
  ===================================== */

  create(payload = {}) {
    try {
      return Response.success(
        MataPelajaranService.create(payload),
        "Mata pelajaran berhasil ditambahkan."
      );
    } catch (error) {
      return Response.error(Utils.getErrorMessage(error));
    }
  },

  /* =====================================
     UPDATE MAPEL
  ===================================== */

  update(payload = {}) {
    try {
      return Response.success(
        MataPelajaranService.update(
          payload.ID_MAPEL,
          payload
        ),
        "Mata pelajaran berhasil diperbarui."
      );
    } catch (error) {
      return Response.error(Utils.getErrorMessage(error));
    }
  },

  /* =====================================
     UPDATE STATUS MAPEL
  ===================================== */

  updateStatus(payload = {}) {
    try {
      return Response.success(
        MataPelajaranService.updateStatus(
          payload.ID_MAPEL,
          payload.STATUS_MAPEL
        ),
        "Status mata pelajaran berhasil diperbarui."
      );
    } catch (error) {
      return Response.error(Utils.getErrorMessage(error));
    }
  },

  /* =====================================
     REGISTER ROUTES
  ===================================== */

  registerRoutes() {
    Router.register("adminMapel.list", this.getList);
    Router.register("adminMapel.create", this.create);
    Router.register("adminMapel.update", this.update);
    Router.register("adminMapel.updateStatus", this.updateStatus);
  }

};

