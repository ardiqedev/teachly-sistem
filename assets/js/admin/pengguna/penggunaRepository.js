/* =========================================
   TEACHLY - ADMIN PENGGUNA REPOSITORY
   QEDEV FRONTEND STANDARD
========================================= */

const PenggunaRepository = {
  /* =====================================
     GET ALL PENGGUNA
  ===================================== */

  async getAll() {
    return API.post("pengguna.list", {});
  },

  /* =====================================
     CREATE PENGGUNA
  ===================================== */

  async create(data) {
    return API.post("pengguna.create", {
      USERNAME: String(data.USERNAME || "").trim(),
      PASSWORD: String(data.PASSWORD || ""),
      NAMA_PENGGUNA: String(data.NAMA_PENGGUNA || "").trim(),
      ROLE: String(data.ROLE || "")
        .trim()
        .toUpperCase(),
      STATUS_AKUN: String(data.STATUS_AKUN || "AKTIF")
        .trim()
        .toUpperCase(),
    });
  },

  /* =====================================
     UPDATE PENGGUNA
  ===================================== */

  async update(idPengguna, data) {
    return API.post("pengguna.update", {
      ID_PENGGUNA: String(idPengguna || "").trim(),
      USERNAME: String(data.USERNAME || "").trim(),
      NAMA_PENGGUNA: String(data.NAMA_PENGGUNA || "").trim(),
      ROLE: String(data.ROLE || "")
        .trim()
        .toUpperCase(),
    });
  },

  /* =====================================
     UPDATE STATUS PENGGUNA
  ===================================== */

  async updateStatus(idPengguna, status) {
    return API.post("pengguna.updateStatus", {
      ID_PENGGUNA: String(idPengguna || "").trim(),
      STATUS_AKUN: String(status || "")
        .trim()
        .toUpperCase(),
    });
  },

  /* =====================================
     RESET PASSWORD
  ===================================== */

  async resetPassword(idPengguna, password) {
    return API.post("pengguna.resetPassword", {
      ID_PENGGUNA: String(idPengguna || "").trim(),
      PASSWORD: String(password || ""),
    });
  },
};
