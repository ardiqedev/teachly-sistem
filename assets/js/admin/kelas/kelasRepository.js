/* =========================================
   TEACHLY - ADMIN KELAS REPOSITORY
========================================= */

const KelasRepository = {
  /* =====================================
     GET ALL KELAS
  ===================================== */

  async getAll() {
    return API.post("adminKelas.list", {});
  },

  /* =====================================
     CREATE KELAS
  ===================================== */

  async create(data) {
    return API.post("adminKelas.create", {
      NAMA_KELAS: String(data.NAMA_KELAS || "").trim(),
      TINGKAT: String(data.TINGKAT || "").trim(),
    });
  },

  /* =====================================
     UPDATE KELAS
  ===================================== */

  async update(idKelas, data) {
    return API.post("adminKelas.update", {
      ID_KELAS: String(idKelas || "").trim(),
      NAMA_KELAS: String(data.NAMA_KELAS || "").trim(),
      TINGKAT: String(data.TINGKAT || "").trim(),
    });
  },

  /* =====================================
     UPDATE STATUS KELAS
  ===================================== */

  async updateStatus(idKelas, status) {
    return API.post("adminKelas.updateStatus", {
      ID_KELAS: String(idKelas || "").trim(),
      STATUS_KELAS: String(status || "")
        .trim()
        .toUpperCase(),
    });
  },
};
