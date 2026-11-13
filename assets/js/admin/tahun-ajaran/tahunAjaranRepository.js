/* =========================================
   TEACHLY - ADMIN TAHUN AJARAN REPOSITORY
   QEDEV FRONTEND STANDARD
========================================= */

const TahunAjaranAdminRepository = {
  /* =====================================
     GET ALL TAHUN AJARAN
  ===================================== */

  async getAll() {
    return API.post("adminTahunAjaran.list", {});
  },

  /* =====================================
     CREATE TAHUN AJARAN
     DEFAULT STATUS: NONAKTIF
  ===================================== */

  async create(data) {
    return API.post("adminTahunAjaran.create", {
      NAMA_TAHUN_AJARAN: String(data.NAMA_TAHUN_AJARAN || "").trim(),
    });
  },

  /* =====================================
     UPDATE NAMA TAHUN AJARAN
  ===================================== */

  async update(idTahunAjaran, data) {
    return API.post("adminTahunAjaran.update", {
      ID_TAHUN_AJARAN: String(idTahunAjaran || "").trim(),

      NAMA_TAHUN_AJARAN: String(data.NAMA_TAHUN_AJARAN || "").trim(),
    });
  },

  /* =====================================
     ACTIVATE TAHUN AJARAN
     HANYA SATU TAHUN AJARAN AKTIF
  ===================================== */

  async activate(idTahunAjaran) {
    return API.post("adminTahunAjaran.activate", {
      ID_TAHUN_AJARAN: String(idTahunAjaran || "").trim(),
    });
  },
};
