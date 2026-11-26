
/* =========================================
   TEACHLY - PENGGUNA SERVICE
   QEDEV BACKEND STANDARD
========================================= */

const PenggunaService = {

  ROLES: [
    "ADMIN",
    "ADMIN_KURIKULUM",
    "ADMIN_GURU_NGAJI"
  ],

  normalizeUsername(value) {
    return String(value || "").trim().toLowerCase();
  },

  normalizeRole(value) {
    return String(value || "").trim().toUpperCase();
  },

  validatePassword(password) {
    const value = String(password || "");

    if (value.length < 12 || value.length > 128) {
      throw new Error(
        "Password harus terdiri dari 12–128 karakter."
      );
    }

    return value;
  },

  validateRole(role) {
    const value = this.normalizeRole(role);

    if (!this.ROLES.includes(value)) {
      throw new Error("Role pengguna tidak valid.");
    }

    return value;
  },

  sanitize(user) {
    return {
      ID_PENGGUNA: user.ID_PENGGUNA,
      USERNAME: user.USERNAME,
      NAMA_PENGGUNA: user.NAMA_PENGGUNA,
      ROLE: user.ROLE,
      STATUS_AKUN: user.STATUS_AKUN,
      CREATED_AT: user.CREATED_AT,
      UPDATED_AT: user.UPDATED_AT
    };
  },

  list() {
    return PenggunaRepository.getAll().map(
      user => this.sanitize(user)
    );
  },

  create(data = {}) {

    const username = this.normalizeUsername(
      data.USERNAME
    );

    const name = String(
      data.NAMA_PENGGUNA || ""
    ).trim();

    const role = this.validateRole(data.ROLE);

    const password = this.validatePassword(
      data.PASSWORD
    );

    if (!/^[a-z0-9._-]{3,50}$/.test(username)) {
      throw new Error(
        "Username harus 3–50 karakter dan hanya menggunakan huruf kecil, angka, titik, underscore, atau tanda minus."
      );
    }

    if (!name) {
      throw new Error("Nama pengguna wajib diisi.");
    }

    const lock = LockService.getScriptLock();

    if (!lock.tryLock(10000)) {
      throw new Error("Sistem sedang sibuk.");
    }

    try {

      if (PenggunaRepository.findByUsername(username)) {
        throw new Error("Username sudah digunakan.");
      }

      const now = new Date();

      const record = {
        ID_PENGGUNA: PenggunaRepository.generateId(),
        USERNAME: username,
        PASSWORD: PasswordService.hashPasswordV2(password),
        NAMA_PENGGUNA: name,
        ROLE: role,
        STATUS_AKUN: "AKTIF",
        CREATED_AT: now,
        UPDATED_AT: now
      };

      PenggunaRepository.create(record);

      return this.sanitize(record);

    } finally {
      lock.releaseLock();
    }

  },

  update(idPengguna, data = {}) {

    const current = PenggunaRepository.findById(
      idPengguna
    );

    if (!current) {
      throw new Error("Pengguna tidak ditemukan.");
    }

    const changes = {};

    if (data.USERNAME !== undefined) {

      const username = this.normalizeUsername(
        data.USERNAME
      );

      if (!/^[a-z0-9._-]{3,50}$/.test(username)) {
        throw new Error("Format username tidak valid.");
      }

      const existing = PenggunaRepository.findByUsername(
        username
      );

      if (
        existing &&
        existing.ID_PENGGUNA !== current.ID_PENGGUNA
      ) {
        throw new Error("Username sudah digunakan.");
      }

      changes.USERNAME = username;
    }

    if (data.NAMA_PENGGUNA !== undefined) {

      const name = String(
        data.NAMA_PENGGUNA || ""
      ).trim();

      if (!name) {
        throw new Error("Nama pengguna wajib diisi.");
      }

      changes.NAMA_PENGGUNA = name;
    }

    if (data.ROLE !== undefined) {
      changes.ROLE = this.validateRole(data.ROLE);
    }

    if (!Object.keys(changes).length) {
      throw new Error("Tidak ada data yang diperbarui.");
    }

    changes.UPDATED_AT = new Date();

    PenggunaRepository.update(
      idPengguna,
      changes
    );

    return this.sanitize({
      ...current,
      ...changes
    });

  },

  updateStatus(idPengguna, status) {

    const current = PenggunaRepository.findById(
      idPengguna
    );

    if (!current) {
      throw new Error("Pengguna tidak ditemukan.");
    }

    const normalized = String(
      status || ""
    ).trim().toUpperCase();

    if (!["AKTIF", "NONAKTIF"].includes(normalized)) {
      throw new Error("Status akun tidak valid.");
    }

    if (
      current.ROLE === "ADMIN" &&
      normalized === "NONAKTIF"
    ) {

      const activeAdmins = PenggunaRepository
        .getAll()
        .filter(user =>
          user.ROLE === "ADMIN" &&
          user.STATUS_AKUN === "AKTIF"
        );

      if (activeAdmins.length <= 1) {
        throw new Error(
          "Admin aktif terakhir tidak boleh dinonaktifkan."
        );
      }
    }

    PenggunaRepository.update(
      idPengguna,
      {
        STATUS_AKUN: normalized,
        UPDATED_AT: new Date()
      }
    );

    return this.sanitize({
      ...current,
      STATUS_AKUN: normalized
    });

  },

  resetPassword(idPengguna, newPassword) {

    const current = PenggunaRepository.findById(
      idPengguna
    );

    if (!current) {
      throw new Error("Pengguna tidak ditemukan.");
    }

    const password = this.validatePassword(
      newPassword
    );

    const hash = PasswordService.hashPasswordV2(
      password
    );

    PenggunaRepository.updatePassword(
      idPengguna,
      hash
    );

    PenggunaRepository.update(
      idPengguna,
      {
        UPDATED_AT: new Date()
      }
    );

    return {
      success: true,
      ID_PENGGUNA: idPengguna
    };

  }

};
