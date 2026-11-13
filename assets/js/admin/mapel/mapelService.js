/* =========================================
   TEACHLY - ADMIN MAPEL SERVICE
========================================= */

const MapelService = {
  /* =====================================
     GET ALL MATA PELAJARAN
  ===================================== */

  async getAll() {
    const response = await MapelRepository.getAll();

    if (!response || response.success !== true) {
      throw new Error(
        response?.message || "Gagal mengambil data mata pelajaran.",
      );
    }

    return Array.isArray(response.data) ? response.data : [];
  },

  /* =====================================
     CREATE MATA PELAJARAN
  ===================================== */

  async create(data) {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      throw new Error("Data mata pelajaran tidak valid.");
    }

    const namaMapel = this.validateNama(data.NAMA_MAPEL);

    const response = await MapelRepository.create({
      NAMA_MAPEL: namaMapel,
    });

    if (!response || response.success !== true) {
      throw new Error(response?.message || "Gagal menambahkan mata pelajaran.");
    }

    return response.data;
  },

  /* =====================================
     UPDATE MATA PELAJARAN
  ===================================== */

  async update(idMapel, data) {
    const validId = this.validateId(idMapel);

    if (!data || typeof data !== "object" || Array.isArray(data)) {
      throw new Error("Data perubahan tidak valid.");
    }

    const namaMapel = this.validateNama(data.NAMA_MAPEL);

    const response = await MapelRepository.update(validId, {
      NAMA_MAPEL: namaMapel,
    });

    if (!response || response.success !== true) {
      throw new Error(response?.message || "Gagal memperbarui mata pelajaran.");
    }

    return response.data;
  },

  /* =====================================
     UPDATE STATUS MATA PELAJARAN
  ===================================== */

  async updateStatus(idMapel, status) {
    const validId = this.validateId(idMapel);

    const validStatus = String(status || "")
      .trim()
      .toUpperCase();

    if (!["AKTIF", "NONAKTIF"].includes(validStatus)) {
      throw new Error("Status mata pelajaran tidak valid.");
    }

    const response = await MapelRepository.updateStatus(validId, validStatus);

    if (!response || response.success !== true) {
      throw new Error(
        response?.message || "Gagal memperbarui status mata pelajaran.",
      );
    }

    return response.data;
  },

  /* =====================================
     VALIDATION
  ===================================== */

  validateId(idMapel) {
    const value = String(idMapel ?? "").trim();

    if (!value) {
      throw new Error("ID mata pelajaran wajib diisi.");
    }

    return value;
  },

  validateNama(nama) {
    const value = String(nama ?? "").trim();

    if (!value) {
      throw new Error("Nama mata pelajaran wajib diisi.");
    }

    if (value.length > 150) {
      throw new Error("Nama mata pelajaran maksimal 150 karakter.");
    }

    return value;
  },
};
