/* =========================================
   TEACHLY - ADMIN PENGGUNA SERVICE
   QEDEV FRONTEND STANDARD
========================================= */

const PenggunaService = {
  ROLES: ["ADMIN", "ADMIN_KURIKULUM", "ADMIN_GURU_NGAJI"],

  /* =====================================
     GET ALL
  ===================================== */

  async getAll() {
    const response = await PenggunaRepository.getAll();

    if (!response || response.success !== true) {
      throw new Error(response?.message || "Gagal mengambil data pengguna.");
    }

    const rows = Array.isArray(response.data) ? response.data : [];

    // PASSWORD tidak boleh tersedia pada data UI.
    return rows.map(({ PASSWORD, ...pengguna }) => pengguna);
  },

  /* =====================================
     CREATE
  ===================================== */

  async create(data) {
    this.validateData(data);

    const payload = {
      USERNAME: this.validateUsername(data.USERNAME),
      PASSWORD: this.validatePassword(data.PASSWORD),
      NAMA_PENGGUNA: this.validateNama(data.NAMA_PENGGUNA),
      ROLE: this.validateRole(data.ROLE),
      STATUS_AKUN: this.validateStatus(data.STATUS_AKUN || "AKTIF"),
    };

    const response = await PenggunaRepository.create(payload);

    if (!response || response.success !== true) {
      throw new Error(response?.message || "Gagal menambahkan pengguna.");
    }

    return response.data;
  },

  /* =====================================
     UPDATE
  ===================================== */

  async update(idPengguna, data) {
    const id = this.validateId(idPengguna);
    this.validateData(data);

    const payload = {
      USERNAME: this.validateUsername(data.USERNAME),
      NAMA_PENGGUNA: this.validateNama(data.NAMA_PENGGUNA),
      ROLE: this.validateRole(data.ROLE),
    };

    const response = await PenggunaRepository.update(id, payload);

    if (!response || response.success !== true) {
      throw new Error(response?.message || "Gagal memperbarui pengguna.");
    }

    return response.data;
  },

  /* =====================================
     UPDATE STATUS
  ===================================== */

  async updateStatus(idPengguna, status) {
    const id = this.validateId(idPengguna);
    const validStatus = this.validateStatus(status);

    const response = await PenggunaRepository.updateStatus(id, validStatus);

    if (!response || response.success !== true) {
      throw new Error(
        response?.message || "Gagal memperbarui status pengguna.",
      );
    }

    return response.data;
  },

  /* =====================================
     RESET PASSWORD
  ===================================== */

  async resetPassword(idPengguna, password) {
    const id = this.validateId(idPengguna);
    const validPassword = this.validatePassword(password);

    const response = await PenggunaRepository.resetPassword(id, validPassword);

    if (!response || response.success !== true) {
      throw new Error(response?.message || "Gagal mereset password.");
    }

    return response.data;
  },

  /* =====================================
     VALIDATIONS
  ===================================== */

  validateData(data) {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      throw new Error("Data pengguna tidak valid.");
    }
  },

  validateId(idPengguna) {
    const value = String(idPengguna ?? "").trim();

    if (!value) {
      throw new Error("ID pengguna wajib diisi.");
    }

    return value;
  },

  validateUsername(username) {
    const value = String(username ?? "")
      .trim()
      .toLowerCase();

    if (!value) {
      throw new Error("Username wajib diisi.");
    }

    if (!/^[a-z0-9._-]{3,50}$/.test(value)) {
      throw new Error(
        "Username harus 3-50 karakter, menggunakan huruf kecil, angka, titik, underscore, atau tanda hubung.",
      );
    }

    return value;
  },

  validateNama(nama) {
    const value = String(nama ?? "").trim();

    if (!value) {
      throw new Error("Nama pengguna wajib diisi.");
    }

    if (value.length > 150) {
      throw new Error("Nama pengguna maksimal 150 karakter.");
    }

    return value;
  },

  validateRole(role) {
    const value = String(role ?? "")
      .trim()
      .toUpperCase();

    if (!this.ROLES.includes(value)) {
      throw new Error("Role pengguna tidak valid.");
    }

    return value;
  },

  validateStatus(status) {
    const value = String(status ?? "")
      .trim()
      .toUpperCase();

    if (!["AKTIF", "NONAKTIF"].includes(value)) {
      throw new Error("Status akun tidak valid.");
    }

    return value;
  },

  validatePassword(password) {
    const value = String(password ?? "");

    if (value.length < 12) {
      throw new Error("Password minimal 12 karakter.");
    }

    return value;
  },
};
