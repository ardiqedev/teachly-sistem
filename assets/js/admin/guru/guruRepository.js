/* =========================================
   TEACHLY - ADMIN GURU REPOSITORY
========================================= */

const GuruRepository = {
  /* =====================================
     GET ALL GURU
  ===================================== */

  async getAll() {
    return API.post("admin.guru.list", {});
  },

  /* =====================================
     GET DETAIL GURU
  ===================================== */

  async getDetail(nbm) {
    return API.post("admin.guru.detail", {
      nbm: String(nbm).trim(),
    });
  },

  /* =====================================
     CREATE GURU
  ===================================== */

  async create(data) {
    return API.post("admin.guru.create", {
      NBM: String(data.NBM || "").trim(),
      NAMA_GURU: String(data.NAMA_GURU || "").trim(),
    });
  },

  /* =====================================
     UPDATE GURU
  ===================================== */

  async update(nbm, data) {
    return API.post("admin.guru.update", {
      nbm: String(nbm).trim(),
      NAMA_GURU: String(data.NAMA_GURU || "").trim(),
    });
  },

  /* =====================================
     UPDATE STATUS GURU
  ===================================== */

  async updateStatus(nbm, status) {
    return API.post("admin.guru.updateStatus", {
      nbm: String(nbm).trim(),
      status: String(status).trim().toUpperCase(),
    });
  },
};
