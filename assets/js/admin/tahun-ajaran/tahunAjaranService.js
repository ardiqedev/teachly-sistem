/* =========================================
   TEACHLY - ADMIN TAHUN AJARAN SERVICE
   QEDEV FRONTEND STANDARD
========================================= */

const TahunAjaranAdminService = {
  /* =====================================
     GET ALL TAHUN AJARAN
  ===================================== */

  async getAll() {
    const response = await TahunAjaranAdminRepository.getAll();

    if (!response || response.success !== true) {
      throw new Error(
        response?.message || "Gagal mengambil data tahun ajaran.",
      );
    }

    if (!Array.isArray(response.data)) {
      throw new Error("Format data tahun ajaran tidak valid.");
    }

    return response.data;
  },

  /* =====================================
     GET ACTIVE TAHUN AJARAN
  ===================================== */

  async getActive() {
    const data = await this.getAll();

    const activeYears = data.filter(
      (item) => this.normalizeStatus(item.STATUS_TAHUN_AJARAN) === "AKTIF",
    );

    if (activeYears.length === 0) {
      throw new Error("Belum ada tahun ajaran yang aktif.");
    }

    if (activeYears.length > 1) {
      throw new Error("Terdapat lebih dari satu tahun ajaran aktif.");
    }

    return activeYears[0];
  },

  /* =====================================
     CREATE TAHUN AJARAN
     DEFAULT STATUS: NONAKTIF
  ===================================== */

  async create(data) {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      throw new Error("Data tahun ajaran tidak valid.");
    }

    const nama = this.validateNama(data.NAMA_TAHUN_AJARAN);

    const response = await TahunAjaranAdminRepository.create({
      NAMA_TAHUN_AJARAN: nama,
    });

    if (!response || response.success !== true) {
      throw new Error(response?.message || "Gagal menambahkan tahun ajaran.");
    }

    return response.data;
  },

  /* =====================================
     UPDATE NAMA TAHUN AJARAN
  ===================================== */

  async update(idTahunAjaran, data) {
    const validId = this.validateId(idTahunAjaran);

    if (!data || typeof data !== "object" || Array.isArray(data)) {
      throw new Error("Data perubahan tidak valid.");
    }

    const nama = this.validateNama(data.NAMA_TAHUN_AJARAN);

    const response = await TahunAjaranAdminRepository.update(validId, {
      NAMA_TAHUN_AJARAN: nama,
    });

    if (!response || response.success !== true) {
      throw new Error(response?.message || "Gagal memperbarui tahun ajaran.");
    }

    return response.data;
  },

  /* =====================================
     ACTIVATE TAHUN AJARAN
     WAJIB TEPAT SATU AKTIF
  ===================================== */

  async activate(idTahunAjaran) {
    const validId = this.validateId(idTahunAjaran);

    const response = await TahunAjaranAdminRepository.activate(validId);

    if (!response || response.success !== true) {
      throw new Error(response?.message || "Gagal mengaktifkan tahun ajaran.");
    }

    return response.data;
  },

  /* =====================================
     VALIDATE ID TAHUN AJARAN
  ===================================== */

  validateId(idTahunAjaran) {
    const value = String(idTahunAjaran ?? "").trim();

    if (!value) {
      throw new Error("ID tahun ajaran wajib diisi.");
    }

    return value;
  },

  /* =====================================
     VALIDATE NAMA TAHUN AJARAN
     FORMAT: YYYY/YYYY
  ===================================== */

  validateNama(nama) {
    const value = String(nama ?? "").trim();

    if (!/^\d{4}\/\d{4}$/.test(value)) {
      throw new Error(
        "Format tahun ajaran harus YYYY/YYYY. Contoh: 2026/2027.",
      );
    }

    const [tahunAwal, tahunAkhir] = value.split("/").map(Number);

    if (tahunAkhir !== tahunAwal + 1) {
      throw new Error("Tahun akhir harus satu tahun setelah tahun awal.");
    }

    return value;
  },

  /* =====================================
     NORMALIZE STATUS
  ===================================== */

  normalizeStatus(status) {
    return String(status ?? "")
      .trim()
      .toUpperCase();
  },
};
