
/**
 * ============================================================
 * TEACHLY - GURU REPOSITORY
 * QEDEV BACKEND STANDARD
 * ============================================================
 *
 * Tanggung jawab:
 * 1. Mengambil seluruh data guru.
 * 2. Mencari guru berdasarkan NBM.
 * 3. Mengambil data guru aktif.
 * 4. Menambahkan data guru.
 * 5. Memperbarui data guru tanpa mengubah NBM.
 *
 * Database:
 * Sheet GURU
 *
 * ============================================================
 */

const GuruRepository = {

  /**
   * ----------------------------------------------------------
   * GET ALL GURU
   * ----------------------------------------------------------
   */

  getAll() {

    return SheetManager.getAll("GURU");

  },


  /**
   * ----------------------------------------------------------
   * FIND GURU BY NBM
   * ----------------------------------------------------------
   */

  
  findByNBM(nbm) {

    const searchNBM = Utils.normalizeText(nbm);

    if (!searchNBM) {
      return null;
    }

    const sheet = SheetManager.getSheet("GURU");
    const headers = SHEET_SCHEMA.GURU.headers;

    const nbmIndex = headers.indexOf("NBM");

    if (nbmIndex === -1) {
      throw new Error("Kolom NBM tidak ditemukan.");
    }

    const lastRow = sheet.getLastRow();

    if (lastRow < 2) {
      return null;
    }

    // Baca hanya kolom NBM terlebih dahulu.
    const nbmValues = sheet
      .getRange(2, nbmIndex + 1, lastRow - 1, 1)
      .getDisplayValues();

    const foundIndex = nbmValues.findIndex(row =>
      Utils.normalizeText(row[0]) === searchNBM
    );

    if (foundIndex === -1) {
      return null;
    }

    // Ambil satu baris guru yang ditemukan.
    const rowNumber = foundIndex + 2;

    const values = sheet
      .getRange(rowNumber, 1, 1, headers.length)
      .getValues()[0];

    return Object.fromEntries(
      headers.map((header, index) => [
        header,
        values[index]
      ])
    );

  },



  /**
   * ----------------------------------------------------------
   * GET ACTIVE GURU
   * ----------------------------------------------------------
   */

  getActive() {

    return SheetManager.getActive(
      "GURU",
      "STATUS_AKUN"
    );

  },


  /**
   * ----------------------------------------------------------
   * CREATE GURU
   * ----------------------------------------------------------
   */


  /**
   * ----------------------------------------------------------
   * CREATE GURU
   * ----------------------------------------------------------
   */

  create(data) {

    if (
      !data ||
      typeof data !== "object" ||
      Array.isArray(data)
    ) {
      throw new Error("Data guru tidak valid.");
    }

    const nbm = Utils.normalizeText(data.NBM);
    const namaGuru = Utils.normalizeText(data.NAMA_GURU);

    if (!nbm) {
      throw new Error("NBM wajib diisi.");
    }

    if (!Utils.validateNBM(nbm)) {
      throw new Error("Format NBM tidak valid.");
    }

    if (!namaGuru) {
      throw new Error("Nama guru wajib diisi.");
    }

    // Periksa duplikasi NBM
    if (this.findByNBM(nbm)) {
      throw new Error("NBM sudah terdaftar.");
    }

    SheetManager.validateHeaders("GURU");

    const sheet = SheetManager.getSheet("GURU");
    const headers = SHEET_SCHEMA.GURU.headers;

    const nbmIndex = headers.indexOf("NBM");

    if (nbmIndex === -1) {
      throw new Error("Kolom NBM tidak ditemukan.");
    }

    const newData = {
      ...data,
      NBM: nbm,
      NAMA_GURU: namaGuru
    };

    const row = headers.map(header => {
      return newData[header] !== undefined
        ? newData[header]
        : "";
    });

    const nextRow = sheet.getLastRow() + 1;

    // Pastikan NBM tersimpan sebagai TEXT
    sheet
      .getRange(nextRow, nbmIndex + 1)
      .setNumberFormat("@");

    sheet
      .getRange(nextRow, 1, 1, headers.length)
      .setValues([row]);

    return Object.fromEntries(
      headers.map((header, index) => [
        header,
        row[index]
      ])
    );

  },


  /**
   * ----------------------------------------------------------
   * UPDATE GURU BY NBM
   * NBM DAN CREATED_AT TIDAK BOLEH DIUBAH
   * ----------------------------------------------------------
   */

  updateByNBM(nbm, data) {

    if (
      !data ||
      typeof data !== "object" ||
      Array.isArray(data)
    ) {
      throw new Error("Data perubahan tidak valid.");
    }

    const searchNBM = Utils.normalizeText(nbm);

    if (!searchNBM) {
      throw new Error("NBM tidak valid.");
    }

    if (!data || typeof data !== "object") {
      throw new Error("Data perubahan tidak valid.");
    }

    SheetManager.validateHeaders("GURU");

    const sheet = SheetManager.getSheet("GURU");
    const headers = SHEET_SCHEMA.GURU.headers;

    const nbmIndex = headers.indexOf("NBM");

    const lastRow = sheet.getLastRow();

    if (lastRow < 2) {
      throw new Error("Data guru tidak ditemukan.");
    }

    // Cari berdasarkan NBM yang tersimpan sebagai teks
    const nbmValues = sheet
      .getRange(2, nbmIndex + 1, lastRow - 1, 1)
      .getDisplayValues();

    const foundIndex = nbmValues.findIndex(row => {
      return Utils.normalizeText(row[0]) === searchNBM;
    });

    if (foundIndex === -1) {
      throw new Error("Data guru tidak ditemukan.");
    }

    const rowNumber = foundIndex + 2;

    const currentRow = sheet
      .getRange(rowNumber, 1, 1, headers.length)
      .getValues()[0];

    const protectedFields = [
      "NBM",
      "CREATED_AT"
    ];

    const updatedRow = [...currentRow];

    headers.forEach((header, index) => {

      if (protectedFields.includes(header)) {
        return;
      }

      if (Object.prototype.hasOwnProperty.call(data, header)) {
        updatedRow[index] = data[header];
      }

    });

    sheet
      .getRange(rowNumber, 1, 1, headers.length)
      .setValues([updatedRow]);

    return Object.fromEntries(
      headers.map((header, index) => [
        header,
        updatedRow[index]
      ])
    );

  }

};
