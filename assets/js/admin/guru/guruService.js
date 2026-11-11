/* =========================================
   TEACHLY - ADMIN GURU SERVICE
========================================= */

const GuruService = {
  /* =====================================
     GET ALL GURU
  ===================================== */

  async getAll() {
    const response = await GuruRepository.getAll();

    if (!response || response.success !== true) {
      throw new Error(response?.message || "Gagal mengambil data guru.");
    }

    return Array.isArray(response.data) ? response.data : [];
  },

  /* =====================================
     GET DETAIL GURU
  ===================================== */

  async getDetail(nbm) {
    const validNBM = this.validateNBM(nbm);

    const response = await GuruRepository.getDetail(validNBM);

    if (!response || response.success !== true) {
      throw new Error(response?.message || "Gagal mengambil detail guru.");
    }

    if (!response.data) {
      throw new Error("Data guru tidak ditemukan.");
    }

    return response.data;
  },

  /* =====================================
     CREATE GURU
  ===================================== */

  async create(data) {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      throw new Error("Data guru tidak valid.");
    }

    const nbm = this.validateNBM(data.NBM);
    const namaGuru = this.validateNama(data.NAMA_GURU);

    const response = await GuruRepository.create({
      NBM: nbm,
      NAMA_GURU: namaGuru,
    });

    if (!response || response.success !== true) {
      throw new Error(response?.message || "Gagal menambahkan guru.");
    }

    return response.data;
  },

  /* =====================================
     UPDATE GURU
  ===================================== */

  async update(nbm, data) {
    const validNBM = this.validateNBM(nbm);

    if (!data || typeof data !== "object" || Array.isArray(data)) {
      throw new Error("Data perubahan tidak valid.");
    }

    const namaGuru = this.validateNama(data.NAMA_GURU);

    const response = await GuruRepository.update(validNBM, {
      NAMA_GURU: namaGuru,
    });

    if (!response || response.success !== true) {
      throw new Error(response?.message || "Gagal memperbarui data guru.");
    }

    return response.data;
  },

  /* =====================================
     UPDATE STATUS GURU
  ===================================== */

  async updateStatus(nbm, status) {
    const validNBM = this.validateNBM(nbm);
    const validStatus = String(status || "")
      .trim()
      .toUpperCase();

    if (!["AKTIF", "NONAKTIF"].includes(validStatus)) {
      throw new Error("Status akun guru tidak valid.");
    }

    const response = await GuruRepository.updateStatus(validNBM, validStatus);

    if (!response || response.success !== true) {
      throw new Error(
        response?.message || "Gagal memperbarui status akun guru.",
      );
    }

    return response.data;
  },

  /* =====================================
     VALIDATION
  ===================================== */

  validateNBM(nbm) {
    const value = String(nbm ?? "").trim();

    if (!value) {
      throw new Error("NBM wajib diisi.");
    }

    if (!/^[A-Za-z0-9]+$/.test(value)) {
      throw new Error("Format NBM tidak valid.");
    }

    return value;
  },

  validateNama(nama) {
    const value = String(nama ?? "").trim();

    if (!value) {
      throw new Error("Nama guru wajib diisi.");
    }

    if (value.length > 150) {
      throw new Error("Nama guru maksimal 150 karakter.");
    }

    return value;
  },
};
