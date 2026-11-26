
/**
 * ============================================================
 * TEACHLY - APPLICATION CONFIGURATION
 * QEDEV BACKEND STANDARD
 * ============================================================
 */

const TEACHLY_CONFIG = Object.freeze({

  // Informasi aplikasi
  APP_NAME: "Teachly",
  APP_VERSION: "1.0.0",

  // Database
  SPREADSHEET_ID: "13Qqwbj2ZtwVb-Qy2leSaO1sxTCC-7ARCQztV4WNPrYo",

  // Pengaturan waktu
  TIMEZONE: "Asia/Jakarta",
  DATE_FORMAT: "yyyy-MM-dd",
  DATETIME_FORMAT: "yyyy-MM-dd HH:mm:ss",

  // Mode aplikasi
  DEBUG: true,

  // Pengaturan API
  API_VERSION: "v1"

});


/**
 * ============================================================
 * DATABASE SHEET CONFIGURATION
 * ============================================================
 */

const TEACHLY_SHEETS = Object.freeze({

  GURU: "GURU",

  KELAS: "KELAS",

  SESI_NGAJI: "SESI_NGAJI",

  KELOMPOK_NGAJI: "KELOMPOK_NGAJI",

  MATA_PELAJARAN: "MATA_PELAJARAN"

});


/**
 * ============================================================
 * APPLICATION STATUS
 * ============================================================
 */

const TEACHLY_STATUS = Object.freeze({

  AKTIF: "AKTIF",

  NONAKTIF: "NONAKTIF"

});
