
/**
 * ============================================================
 * TEACHLY - KELAS REPOSITORY
 * QEDEV BACKEND STANDARD
 * ============================================================
 *
 * Tanggung jawab:
 * 1. Mengambil seluruh data kelas.
 * 2. Mengambil kelas aktif.
 * 3. Mengambil kelas berdasarkan tingkat.
 * 4. Mencari kelas berdasarkan ID_KELAS.
 *
 * Database:
 * Sheet KELAS
 *
 * ============================================================
 */

const KelasRepository = {

  /**
   * ----------------------------------------------------------
   * GET ALL KELAS
   * ----------------------------------------------------------
   */

  getAll() {

    return SheetManager.getAll("KELAS");

  },


  /**
   * ----------------------------------------------------------
   * GET ACTIVE KELAS
   * ----------------------------------------------------------
   */

  getActive() {

    return SheetManager.getActive(
      "KELAS",
      "STATUS_KELAS"
    );

  },


  /**
   * ----------------------------------------------------------
   * GET KELAS BY TINGKAT
   * ----------------------------------------------------------
   */

  getByTingkat(tingkat) {

    const searchTingkat = Utils.normalizeText(tingkat);

    if (!searchTingkat) {
      return [];
    }

    const data = this.getActive();

    return data.filter(kelas => {

      return Utils.normalizeText(kelas.TINGKAT)
        .toUpperCase() === searchTingkat.toUpperCase();

    });

  },



/**
 * CREATE KELAS
 */
create(data) {
  SheetManager.validateHeaders("KELAS");

  const sheet = SheetManager.getSheet("KELAS");
  const headers = SHEET_SCHEMA.KELAS.headers;

  const row = headers.map(header =>
    data[header] !== undefined ? data[header] : ""
  );

  sheet
    .getRange(sheet.getLastRow() + 1, 1, 1, headers.length)
    .setValues([row]);

  return Object.fromEntries(
    headers.map((header, index) => [header, row[index]])
  );
},

/**
 * UPDATE KELAS
 */
updateById(idKelas, data) {
  SheetManager.validateHeaders("KELAS");

  const sheet = SheetManager.getSheet("KELAS");
  const headers = SHEET_SCHEMA.KELAS.headers;

  const idIndex = headers.indexOf("ID_KELAS");

  if (idIndex === -1) {
    throw new Error("Kolom ID_KELAS tidak ditemukan.");
  }

  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    throw new Error("Data kelas tidak ditemukan.");
  }

  const ids = sheet
    .getRange(2, idIndex + 1, lastRow - 1, 1)
    .getDisplayValues();

  const index = ids.findIndex(row =>
    Utils.normalizeText(row[0]) === Utils.normalizeText(idKelas)
  );

  if (index === -1) {
    throw new Error("Data kelas tidak ditemukan.");
  }

  const rowNumber = index + 2;

  const currentRow = sheet
    .getRange(rowNumber, 1, 1, headers.length)
    .getValues()[0];

  const protectedFields = ["ID_KELAS", "CREATED_AT"];

  const updatedRow = currentRow.map((value, i) => {
    const header = headers[i];

    if (protectedFields.includes(header)) return value;

    return Object.prototype.hasOwnProperty.call(data, header)
      ? data[header]
      : value;
  });

  sheet
    .getRange(rowNumber, 1, 1, headers.length)
    .setValues([updatedRow]);

  return Object.fromEntries(
    headers.map((header, index) => [header, updatedRow[index]])
  );
},



  /**
   * ----------------------------------------------------------
   * FIND KELAS BY ID
   * ----------------------------------------------------------
   */

  findById(idKelas) {

    const searchId = Utils.normalizeText(idKelas);

    if (!searchId) {
      return null;
    }

    const data = this.getAll();

    return data.find(kelas => {

      return Utils.normalizeText(kelas.ID_KELAS)
        === searchId;

    }) || null;

  }


  

};




