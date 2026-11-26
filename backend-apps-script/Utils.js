
/**
 * ============================================================
 * TEACHLY - UTILITIES
 * QEDEV BACKEND STANDARD
 * ============================================================
 *
 * Tanggung jawab:
 * 1. Normalisasi teks.
 * 2. Validasi nilai.
 * 3. Format tanggal dan waktu.
 * 4. Generate ID unik.
 * 5. Penanganan error.
 *
 * ============================================================
 */

const Utils = {

  // ==========================================================
  // TEXT UTILITIES
  // ==========================================================

  /**
   * Mengubah nilai menjadi string yang sudah dibersihkan.
   */
  normalizeText(value) {

    if (value === null || value === undefined) {
      return "";
    }

    return String(value).trim();

  },


  /**
   * Mengubah teks menjadi huruf kapital.
   */
  toUpperCase(value) {

    return this.normalizeText(value).toUpperCase();

  },


  /**
   * Mengubah teks menjadi huruf kecil.
   */
  toLowerCase(value) {

    return this.normalizeText(value).toLowerCase();

  },


  // ==========================================================
  // VALIDATION UTILITIES
  // ==========================================================

  /**
   * Memeriksa apakah nilai kosong.
   */
  isEmpty(value) {

    return (
      value === null ||
      value === undefined ||
      String(value).trim() === ""
    );

  },


  /**
   * Memastikan nilai wajib diisi.
   */
  required(value, fieldName = "Field") {

    if (this.isEmpty(value)) {

      throw new Error(
        fieldName + " wajib diisi."
      );

    }

    return true;

  },


  /**
   * Memeriksa format NBM.
   * NBM diperlakukan sebagai TEXT.
   */
  validateNBM(value) {

    const nbm = this.normalizeText(value);

    if (!nbm) {
      return false;
    }

    return /^[A-Za-z0-9]+$/.test(nbm);

  },


  // ==========================================================
  // DATE UTILITIES
  // ==========================================================

  /**
   * Mendapatkan waktu sekarang.
   */
  now() {

    return new Date();

  },


  /**
   * Format tanggal.
   */
  formatDate(date, format) {

    if (!(date instanceof Date) || isNaN(date.getTime())) {
      throw new Error("Tanggal tidak valid.");
    }

    return Utilities.formatDate(
      date,
      TEACHLY_CONFIG.TIMEZONE,
      format || TEACHLY_CONFIG.DATE_FORMAT
    );

  },


  /**
   * Format tanggal dan waktu.
   */
  formatDateTime(date) {

    return this.formatDate(
      date,
      TEACHLY_CONFIG.DATETIME_FORMAT
    );

  },


  // ==========================================================
  // ID GENERATOR
  // ==========================================================

  /**
   * Membuat ID unik berdasarkan prefix.
   *
   * Contoh:
   * KLS-20261110-A1B2C3D4
   */
  
    generateId(prefix) {

      const safePrefix = this.toUpperCase(prefix);

      if (!safePrefix) {
        throw new Error("Prefix ID wajib diisi.");
      }

      const timestamp = Utilities.formatDate(
        this.now(),
        TEACHLY_CONFIG.TIMEZONE,
        "yyyyMMdd"
      );

      const random = Utilities.getUuid()
        .replace(/-/g, "")
        .substring(0, 16)
        .toUpperCase();

      return safePrefix + "-" + timestamp + "-" + random;
    },



  // ==========================================================
  // ERROR UTILITIES
  // ==========================================================

  /**
   * Mengambil pesan error.
   */
  getErrorMessage(error) {

    if (error instanceof Error) {
      return error.message;
    }

    return String(error || "Terjadi kesalahan.");

  },


  /**
   * Membuat informasi error untuk logging.
   */
  logError(context, error) {

    console.error(
      "[" + context + "] " + this.getErrorMessage(error)
    );

  }

};
