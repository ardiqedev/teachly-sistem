
/**
 * ============================================================
 * TEACHLY - SHEET SCHEMA
 * QEDEV BACKEND STANDARD
 * ============================================================
 *
 * Berisi definisi nama sheet dan header database.
 * Tidak melakukan operasi baca/tulis spreadsheet.
 *
 * ============================================================
 */

const SHEET_SCHEMA = Object.freeze({
  LAPORAN_KEPALA_SEKOLAH: {
    name: "LAPORAN_KEPALA_SEKOLAH",
    headers: ["ID_LAPORAN", "ID_TAHUN_AJARAN", "NBM", "TANGGAL_LAPORAN",
      "KEGIATAN", "CATATAN", "DOKUMENTASI", "CREATED_AT"]
  },
  SISWA: {
    name: "SISWA",
    headers: ["ID_SISWA", "NAMA_SISWA", "ID_KELAS", "ID_TAHUN_AJARAN", "STATUS_SISWA"]
  },
  ABSENSI_SISWA: {
    name: "ABSENSI_SISWA",
    headers: ["ID_TAHUN_AJARAN", "TANGGAL_ABSENSI", "ID_KELAS", "ID_SISWA",
      "STATUS_KEHADIRAN", "ID_LAPORAN", "NBM_GURU", "CREATED_AT"]
  },
  PENUGASAN_GURU_KELAS: {
    name: "PENUGASAN_GURU_KELAS",
    headers: ["NBM_GURU", "ID_KELAS", "ID_TAHUN_AJARAN"]
  },

  // ==========================================================
  // GURU
  // ==========================================================

  GURU: {
    get name() { return TEACHLY_SHEETS.GURU; },
    headers: [
      "NBM",
      "NAMA_GURU",
      "STATUS_AKUN",
      "CREATED_AT",
      "UPDATED_AT"
    ]
  },


  // ==========================================================
  // KELAS
  // ==========================================================

  KELAS: {
    get name() { return TEACHLY_SHEETS.KELAS; },
    headers: [
      "ID_KELAS",
      "NAMA_KELAS",
      "TINGKAT",
      "STATUS_KELAS",
      "CREATED_AT",
      "UPDATED_AT"
    ]
  },


  // ==========================================================
  // SESI NGAJI
  // ==========================================================

  SESI_NGAJI: {
    get name() { return TEACHLY_SHEETS.SESI_NGAJI; },
    headers: [
      "ID_SESI",
      "NAMA_SESI",
      "STATUS_SESI",
      "CREATED_AT",
      "UPDATED_AT"
    ]
  },


  // ==========================================================
  // KELOMPOK NGAJI
  // ==========================================================

  KELOMPOK_NGAJI: {
    get name() { return TEACHLY_SHEETS.KELOMPOK_NGAJI; },
    headers: [
      "ID_KELOMPOK",
      "NAMA_KELOMPOK",
      "STATUS_KELOMPOK",
      "CREATED_AT",
      "UPDATED_AT"
    ]
  },


  // ==========================================================
  // MATA PELAJARAN
  // ==========================================================

  MATA_PELAJARAN: {
    get name() { return TEACHLY_SHEETS.MATA_PELAJARAN; },
    headers: [
      "ID_MAPEL",
      "NAMA_MAPEL",
      "STATUS_MAPEL",
      "CREATED_AT",
      "UPDATED_AT"
    ]
  },



  PENGGUNA: {
    name: "PENGGUNA",
    headers: [
      "ID_PENGGUNA",
      "USERNAME",
      "PASSWORD",
      "NAMA_PENGGUNA",
      "ROLE",
      "STATUS_AKUN",
      "CREATED_AT",
      "UPDATED_AT"
    ]
  },




  // ==========================================================
  // TAHUN AJARAN
  // ==========================================================

  TAHUN_AJARAN: {
    name: "TAHUN_AJARAN",
    headers: [
      "ID_TAHUN_AJARAN",
      "NAMA_TAHUN_AJARAN",
      "STATUS_TAHUN_AJARAN",
      "CREATED_AT",
      "UPDATED_AT"
    ]
  },

    LAPORAN_GURU_KELAS: {
    name: "LAPORAN_GURU_KELAS",
    headers: [
      "ID_LAPORAN",
      "ID_TAHUN_AJARAN",
      "NBM",
      "TANGGAL_LAPORAN",
      "ID_KELAS",      
      "SAKIT",
      "IZIN",
      "ALPA",
      "HADITS_DOA",
      "PENDIDIKAN_ADAB",
      "RINGKASAN_PEMBELAJARAN",
      "KENDALA",
      "SOLUSI",
      "MODUL_AJAR",
      "ASESMEN",
      "DOKUMENTASI",
      "CREATED_AT"
    ]
  },

  LAPORAN_GURU_MAPEL: {
    name: "LAPORAN_GURU_MAPEL",
    headers: [
      "ID_LAPORAN",
      "ID_TAHUN_AJARAN",
      "NBM",
      "TANGGAL_LAPORAN",
      "ID_KELAS",
      "ID_MAPEL",     
      "SAKIT",
      "IZIN",
      "ALPA",
      "RINGKASAN_PEMBELAJARAN",
      "KENDALA",
      "SOLUSI",
      "MODUL_AJAR",
      "ASESMEN",
      "DOKUMENTASI",
      "CREATED_AT"
    ]
  },

  
LAPORAN_GURU_NGAJI: {
  name: "LAPORAN_GURU_NGAJI",
  headers: [
    "ID_LAPORAN",
    "ID_TAHUN_AJARAN",
    "NBM",
    "TANGGAL_LAPORAN",
    "KELOMPOK_NGAJI",
    "ID_SESI",
    "SAKIT",
    "IZIN",
    "ALPA",
    "HALAMAN_SURAT_AYAT",
    "HAFALAN_QURAN",
    "CATATAN_PEMBELAJARAN",
    "KENDALA",
    "SOLUSI",
    "CREATED_AT"
  ]
},



  // ==========================================================
  // INFORMASI SEKOLAH
  // ==========================================================

  INFORMASI_SEKOLAH: {
    name: "INFORMASI_SEKOLAH",
    headers: [
      "ID_INFORMASI",
      "NAMA_KURIKULUM",
      "DETAIL_KURIKULUM",
      "TANGGAL_KURIKULUM",
      "UPDATED_BY_KURIKULUM",
      "NAMA_GURU_NGAJI",
      "DETAIL_GURU_NGAJI",
      "TANGGAL_GURU_NGAJI",
      "UPDATED_BY_GURU_NGAJI",
      "NAMA_KEPALA_SEKOLAH",
      "DETAIL_KEPALA_SEKOLAH",
      "TANGGAL_KEPALA_SEKOLAH",
      "UPDATED_BY_KEPALA_SEKOLAH"
    ]
  }






});
