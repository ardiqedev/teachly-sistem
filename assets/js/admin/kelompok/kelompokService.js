/* =========================================
   TEACHLY - ADMIN KELOMPOK NGAJI SERVICE
   QEDEV FRONTEND STANDARD
========================================= */

const KelompokService = {
  /* =====================================
     GET ALL KELOMPOK NGAJI
  ===================================== */

  async getAll() {
    const response = await KelompokRepository.getAll();

    if (!response || response.success !== true) {
      throw new Error(
        response?.message || "Gagal mengambil data kelompok ngaji.",
      );
    }

    return Array.isArray(response.data) ? response.data : [];
  },

  /* =====================================
     CREATE KELOMPOK NGAJI
  ===================================== */

  async create(data) {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      throw new Error("Data kelompok ngaji tidak valid.");
    }

    const namaKelompok = this.validateNama(data.NAMA_KELOMPOK);

    const response = await KelompokRepository.create({
      NAMA_KELOMPOK: namaKelompok,
    });

    if (!response || response.success !== true) {
      throw new Error(response?.message || "Gagal menambahkan kelompok ngaji.");
    }

    return response.data;
  },

  /* =====================================
     UPDATE KELOMPOK NGAJI
  ===================================== */

  async update(idKelompok, data) {
    const validId = this.validateId(idKelompok);

    if (!data || typeof data !== "object" || Array.isArray(data)) {
      throw new Error("Data perubahan tidak valid.");
    }

    const namaKelompok = this.validateNama(data.NAMA_KELOMPOK);

    const response = await KelompokRepository.update(validId, {
      NAMA_KELOMPOK: namaKelompok,
    });

    if (!response || response.success !== true) {
      throw new Error(response?.message || "Gagal memperbarui kelompok ngaji.");
    }

    return response.data;
  },

  /* =====================================
     UPDATE STATUS KELOMPOK NGAJI
  ===================================== */

  async updateStatus(idKelompok, status) {
    const validId = this.validateId(idKelompok);

    const validStatus = String(status || "")
      .trim()
      .toUpperCase();

    if (!["AKTIF", "NONAKTIF"].includes(validStatus)) {
      throw new Error("Status kelompok ngaji tidak valid.");
    }

    const response = await KelompokRepository.updateStatus(
      validId,
      validStatus,
    );

    if (!response || response.success !== true) {
      throw new Error(
        response?.message || "Gagal memperbarui status kelompok ngaji.",
      );
    }

    return response.data;
  },

  /* =====================================
     VALIDATE ID KELOMPOK
  ===================================== */

  validateId(idKelompok) {
    const value = String(idKelompok ?? "").trim();

    if (!value) {
      throw new Error("ID kelompok ngaji wajib diisi.");
    }

    return value;
  },

  /* =====================================
     VALIDATE NAMA KELOMPOK
  ===================================== */

  validateNama(nama) {
    const value = String(nama ?? "").trim();

    if (!value) {
      throw new Error("Nama kelompok ngaji wajib diisi.");
    }

    if (value.length > 150) {
      throw new Error("Nama kelompok ngaji maksimal 150 karakter.");
    }

    return value;
  },
};
