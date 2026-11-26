
/**
 * ============================================================
 * TEACHLY - API RESPONSE
 * QEDEV BACKEND STANDARD
 * ============================================================
 *
 * Tanggung jawab:
 * 1. Menyeragamkan format respons API.
 * 2. Menangani respons sukses.
 * 3. Menangani respons gagal.
 * 4. Menangani respons validasi.
 *
 * ============================================================
 */

const Response = {

  /**
   * Respons sukses.
   */
  success(data = null, message = "Berhasil") {

    return {
      success: true,
      message: message,
      data: data
    };

  },


  /**
   * Respons gagal.
   */
  error(message = "Terjadi kesalahan", data = null) {

    return {
      success: false,
      message: message,
      data: data
    };

  },


  /**
   * Respons validasi gagal.
   */
  validation(message = "Validasi gagal", errors = []) {

    return {
      success: false,
      message: message,
      data: null,
      errors: errors
    };

  },


  /**
   * Respons data tidak ditemukan.
   */
  notFound(message = "Data tidak ditemukan") {

    return {
      success: false,
      message: message,
      data: null
    };

  },


  /**
   * Respons akses ditolak.
   */
  unauthorized(message = "Akses tidak diizinkan") {

    return {
      success: false,
      message: message,
      data: null
    };

  },


  /**
   * Mengubah object response menjadi JSON string.
   */
  toJSON(response) {

    return JSON.stringify(response);

  },


  /**
   * Membuat output JSON untuk Google Apps Script.
   */
  output(response) {

    return ContentService
      .createTextOutput(this.toJSON(response))
      .setMimeType(ContentService.MimeType.JSON);

  }

};
