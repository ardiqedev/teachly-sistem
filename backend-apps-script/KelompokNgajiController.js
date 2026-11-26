/**
 * ============================================================
 * TEACHLY - KELOMPOK NGAJI CONTROLLER
 * QEDEV BACKEND STANDARD
 * ============================================================
 */

const KelompokNgajiController = {

  getList(payload = {}) {
    try {
      const data = KelompokNgajiService.getActive();

      return Response.success(
        data,
        "Daftar kelompok ngaji berhasil diambil."
      );

    } catch (error) {
      return Response.error(Utils.getErrorMessage(error));
    }
  },

  getDetail(payload = {}) {
    try {
      const data = KelompokNgajiService.validateKelompok(
        payload.idKelompok
      );

      return Response.success(
        data,
        "Detail kelompok ngaji berhasil diambil."
      );

    } catch (error) {
      return Response.error(Utils.getErrorMessage(error));
    }
  },

  registerRoutes() {
    Router.register("kelompokNgaji.list", this.getList);
    Router.register("kelompokNgaji.detail", this.getDetail);
  }

};

