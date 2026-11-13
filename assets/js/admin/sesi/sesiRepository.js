/* =========================================
   TEACHLY - ADMIN SESI REPOSITORY
   QEDEV FRONTEND STANDARD
========================================= */

const SesiRepository = {
  /* =====================================
     GET ALL SESI NGAJI
  ===================================== */

  async getAll() {
    return API.post("adminSesi.list", {});
  },

  /* =====================================
     CREATE SESI NGAJI
  ===================================== */

  async create(data) {
    return API.post("adminSesi.create", {
      NAMA_SESI: String(data.NAMA_SESI || "").trim(),
    });
  },

  /* =====================================
     UPDATE SESI NGAJI
  ===================================== */

  async update(idSesi, data) {
    return API.post("adminSesi.update", {
      ID_SESI: String(idSesi || "").trim(),
      NAMA_SESI: String(data.NAMA_SESI || "").trim(),
    });
  },

  /* =====================================
     UPDATE STATUS SESI NGAJI
  ===================================== */

  async updateStatus(idSesi, status) {
    return API.post("adminSesi.updateStatus", {
      ID_SESI: String(idSesi || "").trim(),
      STATUS_SESI: String(status || "")
        .trim()
        .toUpperCase(),
    });
  },
};
