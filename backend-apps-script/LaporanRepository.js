
/**
 * ============================================================
 * TEACHLY - LAPORAN REPOSITORY
 * QEDEV BACKEND STANDARD
 * ============================================================
 *
 * Tanggung jawab:
 * 1. Menyimpan laporan Guru Kelas.
 * 2. Menyimpan laporan Guru Mapel.
 * 3. Menyimpan laporan Guru Ngaji.
 * 4. Membaca seluruh laporan.
 * 5. Mencari laporan berdasarkan ID.
 * 6. Mencari laporan berdasarkan NBM.
 *
 * Tidak menangani validasi bisnis.
 * Tidak menentukan tahun ajaran aktif.
 *
 * ============================================================
 */

const LaporanRepository = {

  /**
   * Daftar sheet laporan yang diizinkan.
   */
  SHEETS: [
    "LAPORAN_GURU_KELAS",
    "LAPORAN_GURU_MAPEL",
    "LAPORAN_GURU_NGAJI",
    "LAPORAN_KEPALA_SEKOLAH"
  ],


  /**
   * Memastikan kategori sheet laporan valid.
   */
  validateSheetKey(sheetKey) {

    if (!this.SHEETS.includes(sheetKey)) {
      throw new Error(
        "Kategori laporan tidak valid: " + sheetKey
      );
    }

    if (!SHEET_SCHEMA[sheetKey]) {
      throw new Error(
        "Schema laporan tidak ditemukan: " + sheetKey
      );
    }

    return true;

  },


  /**
   * Menyimpan laporan baru.
   *
   * ID_LAPORAN dan field lainnya
   * disiapkan oleh Service.
   */
  create(sheetKey, data) {

    this.validateSheetKey(sheetKey);

    if (!data || typeof data !== "object") {
      throw new Error(
        "Data laporan tidak valid."
      );
    }

    // Validasi struktur header
    SheetManager.validateHeaders(sheetKey);

    const sheet = SheetManager.getSheet(sheetKey);
    const headers = SHEET_SCHEMA[sheetKey].headers;

    // Susun data sesuai urutan header
    const row = headers.map(header => {

      return data[header] !== undefined &&
             data[header] !== null
        ? data[header]
        : "";

    });

    // Simpan ke baris berikutnya
    const nextRow = sheet.getLastRow() + 1;

    sheet
      .getRange(nextRow, 1, 1, headers.length)
      .setValues([row]);

    return data;

  },


  /**
   * Mengambil seluruh laporan dari satu kategori.
   */
  getAll(sheetKey) {

    this.validateSheetKey(sheetKey);

    return SheetManager.getAll(sheetKey);

  },


  /**
   * Mencari laporan berdasarkan ID.
   */
  getById(sheetKey, idLaporan) {

    this.validateSheetKey(sheetKey);

    if (!idLaporan) {
      return null;
    }

    const data = this.getAll(sheetKey);

    return data.find(item =>
      String(item.ID_LAPORAN) === String(idLaporan)
    ) || null;

  },


  /**
   * Memperbarui laporan berdasarkan ID.
   *
   * Tidak mengubah identitas laporan,
   * pemilik laporan, metadata, dan foto.
   */
  updateById(sheetKey, idLaporan, data) {

    this.validateSheetKey(sheetKey);

    if (!idLaporan) {
      throw new Error("ID laporan tidak valid.");
    }

    if (!data || typeof data !== "object") {
      throw new Error("Data laporan tidak valid.");
    }

    SheetManager.validateHeaders(sheetKey);

    const sheet = SheetManager.getSheet(sheetKey);
    const headers = SHEET_SCHEMA[sheetKey].headers;

    const lastRow = sheet.getLastRow();

    if (lastRow < 2) {
      throw new Error("Data laporan tidak ditemukan.");
    }

    const idColumn = headers.indexOf("ID_LAPORAN") + 1;

    if (idColumn === 0) {
      throw new Error("Kolom ID_LAPORAN tidak ditemukan.");
    }

    // Cari posisi laporan berdasarkan ID
    const ids = sheet
      .getRange(2, idColumn, lastRow - 1, 1)
      .getDisplayValues();

    const index = ids.findIndex(row =>
      String(row[0]).trim() === String(idLaporan).trim()
    );

    if (index === -1) {
      throw new Error("Laporan tidak ditemukan.");
    }

    const rowNumber = index + 2;

    // Kolom yang tidak boleh diubah
    const protectedFields = [
      "ID_LAPORAN",
      "ID_TAHUN_AJARAN",
      "NBM",
      "CREATED_AT",
      "MODUL_AJAR",
      "ASESMEN",
      "DOKUMENTASI"
    ];

    // Ambil data laporan saat ini
    const currentRow = sheet
      .getRange(rowNumber, 1, 1, headers.length)
      .getValues()[0];

    const updatedRow = [...currentRow];

    // Perbarui hanya kolom yang diizinkan
    headers.forEach((header, columnIndex) => {

      if (protectedFields.includes(header)) {
        return;
      }

      if (
        Object.prototype.hasOwnProperty.call(data, header) &&
        data[header] !== undefined
      ) {
        updatedRow[columnIndex] = data[header];
      }

    });

    // Simpan perubahan
    sheet
      .getRange(rowNumber, 1, 1, headers.length)
      .setValues([updatedRow]);

    return headers.reduce((result, header, index) => {
      result[header] = updatedRow[index];
      return result;
    }, {});

  },



  /**
   * Mengambil seluruh laporan berdasarkan NBM guru.
   */
  getByNBM(sheetKey, nbm) {

    this.validateSheetKey(sheetKey);

    if (!nbm) {
      return [];
    }

    const data = this.getAll(sheetKey);

    return data.filter(item =>
      String(item.NBM).trim() === String(nbm).trim()
    );

  }

};
