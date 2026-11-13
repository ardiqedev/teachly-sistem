/* =========================================
   TEACHLY - ADMIN KELOMPOK NGAJI REPOSITORY
   QEDEV FRONTEND STANDARD
========================================= */

const KelompokRepository = {
  /* =====================================
     GET ALL KELOMPOK NGAJI
  ===================================== */

  async getAll() {
    return API.post("adminKelompok.list", {});
  },

  /* =====================================
     CREATE KELOMPOK NGAJI
  ===================================== */

  async create(data) {
    return API.post("adminKelompok.create", {
      NAMA_KELOMPOK: String(data.NAMA_KELOMPOK || "").trim(),
    });
  },

  /* =====================================
     UPDATE KELOMPOK NGAJI
  ===================================== */

  async update(idKelompok, data) {
    return API.post("adminKelompok.update", {
      ID_KELOMPOK: String(idKelompok || "").trim(),

      NAMA_KELOMPOK: String(data.NAMA_KELOMPOK || "").trim(),
    });
  },

  /* =====================================
     UPDATE STATUS KELOMPOK NGAJI
  ===================================== */

  async updateStatus(idKelompok, status) {
    return API.post("adminKelompok.updateStatus", {
      ID_KELOMPOK: String(idKelompok || "").trim(),

      STATUS_KELOMPOK: String(status || "")
        .trim()
        .toUpperCase(),
    });
  },
};
