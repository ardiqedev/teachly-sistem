/* =========================================
   TEACHLY - ADMIN SESI SERVICE
   QEDEV FRONTEND STANDARD
========================================= */

const SesiService = {
  /* =====================================
     GET ALL SESI NGAJI
  ===================================== */

  async getAll() {
    const response = await SesiRepository.getAll();

    if (!response || response.success !== true) {
      throw new Error(response?.message || "Gagal mengambil data sesi ngaji.");
    }

    return Array.isArray(response.data) ? response.data : [];
  },

  /* =====================================
     CREATE SESI NGAJI
  ===================================== */

  async create(data) {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      throw new Error("Data sesi ngaji tidak valid.");
    }

    const namaSesi = this.validateNama(data.NAMA_SESI);

    const response = await SesiRepository.create({
      NAMA_SESI: namaSesi,
    });

    if (!response || response.success !== true) {
      throw new Error(response?.message || "Gagal menambahkan sesi ngaji.");
    }

    return response.data;
  },

  /* =====================================
     UPDATE SESI NGAJI
  ===================================== */

  async update(idSesi, data) {
    const validId = this.validateId(idSesi);

    if (!data || typeof data !== "object" || Array.isArray(data)) {
      throw new Error("Data perubahan tidak valid.");
    }

    const namaSesi = this.validateNama(data.NAMA_SESI);

    const response = await SesiRepository.update(validId, {
      NAMA_SESI: namaSesi,
    });

    if (!response || response.success !== true) {
      throw new Error(response?.message || "Gagal memperbarui sesi ngaji.");
    }

    return response.data;
  },

  /* =====================================
     UPDATE STATUS SESI NGAJI
  ===================================== */

  async updateStatus(idSesi, status) {
    const validId = this.validateId(idSesi);

    const validStatus = String(status || "")
      .trim()
      .toUpperCase();

    if (!["AKTIF", "NONAKTIF"].includes(validStatus)) {
      throw new Error("Status sesi ngaji tidak valid.");
    }

    const response = await SesiRepository.updateStatus(validId, validStatus);

    if (!response || response.success !== true) {
      throw new Error(
        response?.message || "Gagal memperbarui status sesi ngaji.",
      );
    }

    return response.data;
  },

  /* =====================================
     VALIDATE ID SESI
  ===================================== */

  validateId(idSesi) {
    const value = String(idSesi ?? "").trim();

    if (!value) {
      throw new Error("ID sesi ngaji wajib diisi.");
    }

    return value;
  },

  /* =====================================
     VALIDATE NAMA SESI
  ===================================== */

  validateNama(nama) {
    const value = String(nama ?? "").trim();

    if (!value) {
      throw new Error("Nama sesi ngaji wajib diisi.");
    }

    if (value.length > 150) {
      throw new Error("Nama sesi ngaji maksimal 150 karakter.");
    }

    return value;
  },
};
