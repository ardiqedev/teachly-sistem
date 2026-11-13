/* =========================================
   TEACHLY - ADMIN MAPEL REPOSITORY
========================================= */

const MapelRepository = {
  /* =====================================
     GET ALL MATA PELAJARAN
  ===================================== */

  async getAll() {
    return API.post("adminMapel.list", {});
  },

  /* =====================================
     CREATE MATA PELAJARAN
  ===================================== */

  async create(data) {
    return API.post("adminMapel.create", {
      NAMA_MAPEL: String(data.NAMA_MAPEL || "").trim(),
    });
  },

  /* =====================================
     UPDATE MATA PELAJARAN
  ===================================== */

  async update(idMapel, data) {
    return API.post("adminMapel.update", {
      ID_MAPEL: String(idMapel || "").trim(),
      NAMA_MAPEL: String(data.NAMA_MAPEL || "").trim(),
    });
  },

  /* =====================================
     UPDATE STATUS MATA PELAJARAN
  ===================================== */

  async updateStatus(idMapel, status) {
    return API.post("adminMapel.updateStatus", {
      ID_MAPEL: String(idMapel || "").trim(),
      STATUS_MAPEL: String(status || "")
        .trim()
        .toUpperCase(),
    });
  },
};
