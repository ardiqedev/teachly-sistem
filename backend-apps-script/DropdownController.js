
/**
 * ============================================================
 * TEACHLY - DROPDOWN CONTROLLER
 * QEDEV BACKEND STANDARD
 * ============================================================
 *
 * Tanggung jawab:
 * 1. Endpoint daftar tingkat.
 * 2. Endpoint daftar kelas berdasarkan tingkat.
 * 3. Endpoint daftar mata pelajaran.
 * 4. Endpoint daftar sesi ngaji.
 * 5. Endpoint daftar kelompok ngaji.
 *
 * ============================================================
 */

const DropdownController = {

  getTingkat(payload = {}) {
    try {
      const data = DropdownService.getTingkat();

      return Response.success(
        data,
        "Daftar tingkat berhasil diambil."
      );

    } catch (error) {
      return Response.error(Utils.getErrorMessage(error));
    }
  },

  getKelas(payload = {}) {
    try {
      const data = DropdownService.getKelasByTingkat(
        payload.tingkat
      );

      return Response.success(
        data,
        "Daftar kelas berhasil diambil."
      );

    } catch (error) {
      return Response.error(Utils.getErrorMessage(error));
    }
  },

  getMapel(payload = {}) {
    try {
      const data = DropdownService.getMataPelajaran();

      return Response.success(
        data,
        "Daftar mata pelajaran berhasil diambil."
      );

    } catch (error) {
      return Response.error(Utils.getErrorMessage(error));
    }
  },

  getSesiNgaji(payload = {}) {
    try {
      const data = DropdownService.getSesiNgaji();

      return Response.success(
        data,
        "Daftar sesi ngaji berhasil diambil."
      );

    } catch (error) {
      return Response.error(Utils.getErrorMessage(error));
    }
  },

  getKelompokNgaji(payload = {}) {
    try {
      const data = DropdownService.getKelompokNgaji();

      return Response.success(
        data,
        "Daftar kelompok ngaji berhasil diambil."
      );

    } catch (error) {
      return Response.error(Utils.getErrorMessage(error));
    }
  },

  registerRoutes() {
    Router.register("dropdown.tingkat", this.getTingkat);
    Router.register("dropdown.kelas", this.getKelas);
    Router.register("dropdown.mapel", this.getMapel);
    Router.register("dropdown.sesiNgaji", this.getSesiNgaji);
    Router.register("dropdown.kelompokNgaji", this.getKelompokNgaji);
  }

};

