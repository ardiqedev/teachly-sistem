
/* =========================================
   TEACHLY - INFORMASI SEKOLAH REPOSITORY
   QEDEV BACKEND STANDARD
========================================= */

const InformasiSekolahRepository = {

  SHEET_NAME: "INFORMASI_SEKOLAH",
  RECORD_ID: "INF001",

  HEADERS: [
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
  ],

  /* =====================================
     GET SHEET & VALIDATE STRUCTURE
  ===================================== */

  getSheet() {
    const sheet = SheetManager.getSheet(
      this.SHEET_NAME
    );

    if (!sheet) {
      throw new Error(
        "Sheet INFORMASI_SEKOLAH tidak ditemukan."
      );
    }

    const headers = sheet
      .getRange(1, 1, 1, this.HEADERS.length)
      .getDisplayValues()[0];

    const valid = this.HEADERS.every(
      (header, index) =>
        String(headers[index] || "").trim() === header
    );

    if (!valid) {
      throw new Error(
        "Struktur header INFORMASI_SEKOLAH tidak sesuai."
      );
    }

    return sheet;
  },

  /* =====================================
     FIND SINGLE RECORD
  ===================================== */

  getRecord() {
    const sheet = this.getSheet();

    const lastRow = sheet.getLastRow();

    if (lastRow < 2) {
      throw new Error(
        "Record INF001 belum tersedia. Isi INF001 pada sel A2."
      );
    }

    // Pastikan sheet hanya memiliki satu record.
    if (lastRow > 2) {
      throw new Error(
        "INFORMASI_SEKOLAH hanya boleh memiliki satu baris data."
      );
    }

    const values = sheet
      .getRange(2, 1, 1, this.HEADERS.length)
      .getValues()[0];

    const id = String(values[0] || "").trim();

    if (id !== this.RECORD_ID) {
      throw new Error(
        "ID informasi tidak valid. Sel A2 harus berisi INF001."
      );
    }

    return Object.fromEntries(
      this.HEADERS.map((header, index) => [
        header,
        values[index]
      ])
    );
  },

  /* =====================================
     GET ALL INFORMATION
  ===================================== */

  getAll() {
    return this.getRecord();
  },

  /* =====================================
     GET INFORMATION BY SOURCE
  ===================================== */

  getBySource(source) {
    const sumber = String(source || "")
      .trim()
      .toUpperCase();

    if (!this.HEADERS.includes("NAMA_" + sumber)) throw new Error("Sumber informasi tidak valid.");
    return this.mapSource(sumber, this.getRecord());
  },

  mapSource(source, record) {
    return {
      SUMBER_INFORMASI: source,
      NAMA_INFORMASI: String(record["NAMA_" + source] ?? ""),
      DETAIL_INFORMASI: String(record["DETAIL_" + source] ?? ""),
      TANGGAL_INFORMASI: record["TANGGAL_" + source] || "",
      UPDATED_BY: String(record["UPDATED_BY_" + source] ?? "")
    };
  },

  /* =====================================
     UPDATE INFORMATION BY SOURCE
     ONLY UPDATE SELECTED COLUMNS
  ===================================== */

  updateBySource(source, data) {
    const sumber = String(source || "")
      .trim()
      .toUpperCase();

    if (
      !data ||
      typeof data !== "object" ||
      Array.isArray(data)
    ) {
      throw new Error(
        "Data informasi tidak valid."
      );
    }

    const sheet = this.getSheet();

    // Validasi record sebelum melakukan update.
    this.getRecord();

    const startColumn = this.HEADERS.indexOf("NAMA_" + sumber) + 1;
    if (!startColumn) throw new Error("Sumber informasi tidak valid.");

    const values = [
      String(data.NAMA_INFORMASI ?? "").trim(),
      String(data.DETAIL_INFORMASI ?? ""),
      data.TANGGAL_INFORMASI ?? "",
      String(data.UPDATED_BY ?? "").trim()
    ];

    // Satu operasi penulisan untuk empat kolom
    // milik sumber informasi yang dipilih.
    sheet
      .getRange(2, startColumn, 1, 4)
      .setValues([values]);

    return {
      SUMBER_INFORMASI: sumber,
      NAMA_INFORMASI: values[0],
      DETAIL_INFORMASI: values[1],
      TANGGAL_INFORMASI: values[2],
      UPDATED_BY: values[3]
    };
  }

};
