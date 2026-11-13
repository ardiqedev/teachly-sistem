/* =========================================
   TEACHLY - ADMIN KELAS SERVICE
========================================= */

const KelasService = {
  /* =====================================
     GET ALL KELAS
  ===================================== */

  async getAll() {
    const response = await KelasRepository.getAll();

    if (!response || response.success !== true) {
      throw new Error(response?.message || "Gagal mengambil data kelas.");
    }

    return Array.isArray(response.data) ? response.data : [];
  },

  /* =====================================
     CREATE KELAS
  ===================================== */

  async create(data) {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      throw new Error("Data kelas tidak valid.");
    }

    const namaKelas = this.validateNama(data.NAMA_KELAS);
    const tingkat = this.validateTingkat(data.TINGKAT);

    const response = await KelasRepository.create({
      NAMA_KELAS: namaKelas,
      TINGKAT: tingkat,
    });

    if (!response || response.success !== true) {
      throw new Error(response?.message || "Gagal menambahkan kelas.");
    }

    return response.data;
  },

  /* =====================================
     UPDATE KELAS
  ===================================== */

  async update(idKelas, data) {
    const validId = this.validateId(idKelas);

    if (!data || typeof data !== "object" || Array.isArray(data)) {
      throw new Error("Data perubahan tidak valid.");
    }

    const namaKelas = this.validateNama(data.NAMA_KELAS);
    const tingkat = this.validateTingkat(data.TINGKAT);

    const response = await KelasRepository.update(validId, {
      NAMA_KELAS: namaKelas,
      TINGKAT: tingkat,
    });

    if (!response || response.success !== true) {
      throw new Error(response?.message || "Gagal memperbarui data kelas.");
    }

    return response.data;
  },

  /* =====================================
     UPDATE STATUS KELAS
  ===================================== */

  async updateStatus(idKelas, status) {
    const validId = this.validateId(idKelas);

    const validStatus = String(status || "")
      .trim()
      .toUpperCase();

    if (!["AKTIF", "NONAKTIF"].includes(validStatus)) {
      throw new Error("Status kelas tidak valid.");
    }

    const response = await KelasRepository.updateStatus(validId, validStatus);

    if (!response || response.success !== true) {
      throw new Error(response?.message || "Gagal memperbarui status kelas.");
    }

    return response.data;
  },

  /* =====================================
     VALIDATION
  ===================================== */

  validateId(idKelas) {
    const value = String(idKelas ?? "").trim();

    if (!value) {
      throw new Error("ID kelas wajib diisi.");
    }

    return value;
  },

  validateNama(nama) {
    const value = String(nama ?? "").trim();

    if (!value) {
      throw new Error("Nama kelas wajib diisi.");
    }

    if (value.length > 150) {
      throw new Error("Nama kelas maksimal 150 karakter.");
    }

    return value;
  },

  validateTingkat(tingkat) {
    const value = String(tingkat ?? "").trim();

    if (!/^[1-6]$/.test(value)) {
      throw new Error("Tingkat kelas harus antara 1 sampai 6.");
    }

    return value;
  },
};
