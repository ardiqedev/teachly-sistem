/* =========================================
   TEACHLY - INFORMASI SEKOLAH SERVICE
   QEDEV FRONTEND STANDARD
========================================= */

const InformasiSekolahAdminService = {
  /* =====================================
     AVAILABLE SOURCES
  ===================================== */

  SOURCES: {
    KURIKULUM: "KURIKULUM",
    GURU_NGAJI: "GURU_NGAJI",
  },

  /* =====================================
     VALIDATE SOURCE
  ===================================== */

  validateSource(source) {
    const value = String(source ?? "")
      .trim()
      .toUpperCase();

    if (!Object.values(this.SOURCES).includes(value)) {
      throw new Error("Pemberi informasi harus Kurikulum atau Guru Ngaji.");
    }

    return value;
  },

  /* =====================================
     NORMALIZE MULTILINE TEXT

     Mempertahankan:
     - Enter
     - Bullet
     - Numbering
  ===================================== */

  normalizeText(value) {
    return String(value ?? "").replace(/\r\n?/g, "\n");
  },

  /* =====================================
     FORMAT INFORMATION OBJECT
  ===================================== */

  normalizeInformation(data, source) {
    const sumber = this.validateSource(source);

    const record = data && typeof data === "object" ? data : {};

    return {
      SUMBER_INFORMASI: sumber,

      NAMA_INFORMASI: String(record.NAMA_INFORMASI ?? ""),

      DETAIL_INFORMASI: this.normalizeText(record.DETAIL_INFORMASI),

      TANGGAL_INFORMASI: record.TANGGAL_INFORMASI ?? "",

      UPDATED_BY: String(record.UPDATED_BY ?? ""),
    };
  },

  /* =====================================
     GET ALL INFORMATION

     Untuk menampilkan kedua informasi
     pada halaman Guru.
  ===================================== */

  async getAll() {
    const response = await InformasiSekolahAdminRepository.getAll();

    if (!response || response.success !== true) {
      throw new Error(
        response?.message || "Gagal mengambil informasi sekolah.",
      );
    }

    if (
      !response.data ||
      typeof response.data !== "object" ||
      Array.isArray(response.data)
    ) {
      throw new Error("Format informasi sekolah tidak valid.");
    }

    return {
      KURIKULUM: this.normalizeInformation(
        response.data.KURIKULUM,
        this.SOURCES.KURIKULUM,
      ),

      GURU_NGAJI: this.normalizeInformation(
        response.data.GURU_NGAJI,
        this.SOURCES.GURU_NGAJI,
      ),
    };
  },

  /* =====================================
     GET INFORMATION BY SOURCE

     Digunakan untuk auto-fill formulir.
  ===================================== */

  async getBySource(source) {
    const sumber = this.validateSource(source);

    const response = await InformasiSekolahAdminRepository.getBySource(sumber);

    if (!response || response.success !== true) {
      throw new Error(response?.message || "Gagal mengambil detail informasi.");
    }

    if (
      !response.data ||
      typeof response.data !== "object" ||
      Array.isArray(response.data)
    ) {
      throw new Error("Format detail informasi tidak valid.");
    }

    return this.normalizeInformation(response.data, sumber);
  },

  /* =====================================
     VALIDATE FORM DATA
  ===================================== */

  validateData(data) {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      throw new Error("Data informasi sekolah tidak valid.");
    }

    const sumber = this.validateSource(data.SUMBER_INFORMASI);

    const nama = this.normalizeText(data.NAMA_INFORMASI).trim();

    const detail = this.normalizeText(data.DETAIL_INFORMASI).trim();

    if (!nama) {
      throw new Error("Nama informasi wajib diisi.");
    }

    if (!detail) {
      throw new Error("Detail informasi wajib diisi.");
    }

    if (nama.length > 150) {
      throw new Error("Nama informasi maksimal 150 karakter.");
    }

    if (detail.length > 45000) {
      throw new Error("Detail informasi maksimal 45.000 karakter.");
    }

    return {
      SUMBER_INFORMASI: sumber,
      NAMA_INFORMASI: nama,
      DETAIL_INFORMASI: detail,
    };
  },

  /* =====================================
     SAVE INFORMATION

     Otomatis UPDATE record INF001.
  ===================================== */

  async save(data) {
    const validated = this.validateData(data);

    const response = await InformasiSekolahAdminRepository.save(validated);

    if (!response || response.success !== true) {
      throw new Error(
        response?.message || "Gagal menyimpan informasi sekolah.",
      );
    }

    if (
      !response.data ||
      typeof response.data !== "object" ||
      Array.isArray(response.data)
    ) {
      throw new Error("Respons penyimpanan informasi tidak valid.");
    }

    return this.normalizeInformation(response.data, validated.SUMBER_INFORMASI);
  },

  /* =====================================
     FORMAT DATE FOR DISPLAY

     Mendukung:
     - ISO string
     - Date object
     - String tanggal yang sudah diformat
  ===================================== */

  formatDate(value) {
    if (!value) return "-";

    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Jakarta",
    }).format(date);
  },

  /* =====================================
     CHECK UNSAVED CHANGES

     Membandingkan isi formulir dengan
     data terakhir dari Spreadsheet.
  ===================================== */

  hasChanges(current, original) {
    const currentNama = String(current?.NAMA_INFORMASI ?? "").trim();

    const originalNama = String(original?.NAMA_INFORMASI ?? "").trim();

    const currentDetail = this.normalizeText(current?.DETAIL_INFORMASI);

    const originalDetail = this.normalizeText(original?.DETAIL_INFORMASI);

    return currentNama !== originalNama || currentDetail !== originalDetail;
  },

  /* =====================================
     CREATE EMPTY INFORMATION

     Digunakan ketika formulir belum
     memiliki informasi tersimpan.
  ===================================== */

  createEmpty(source) {
    return {
      SUMBER_INFORMASI: this.validateSource(source),
      NAMA_INFORMASI: "",
      DETAIL_INFORMASI: "",
      TANGGAL_INFORMASI: "",
      UPDATED_BY: "",
    };
  },
};
