/**
 * ============================================================
 * TEACHLY - SESI NGAJI CONTROLLER
 * QEDEV BACKEND STANDARD
 * ============================================================
 */

const SesiNgajiController = {

  getList(payload = {}) {
    try {
      const data = SesiNgajiService.getActive();

      return Response.success(
        data,
        "Daftar sesi ngaji berhasil diambil."
      );

    } catch (error) {
      return Response.error(Utils.getErrorMessage(error));
    }
  },

  getDetail(payload = {}) {
    try {
      const data = SesiNgajiService.validateSesi(
        payload.idSesi
      );

      return Response.success(
        data,
        "Detail sesi ngaji berhasil diambil."
      );

    } catch (error) {
      return Response.error(Utils.getErrorMessage(error));
    }
  },

  registerRoutes() {
    Router.register("sesiNgaji.list", this.getList);
    Router.register("sesiNgaji.detail", this.getDetail);
  }

};

