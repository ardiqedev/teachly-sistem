
/**
 * ============================================================
 * TEACHLY - MATA PELAJARAN REPOSITORY
 * QEDEV BACKEND STANDARD
 * ============================================================
 *
 * Tanggung jawab:
 * 1. Mengambil seluruh data mata pelajaran.
 * 2. Mengambil mata pelajaran aktif.
 * 3. Mencari mata pelajaran berdasarkan ID_MAPEL.
 *
 * Database:
 * Sheet MATA_PELAJARAN
 *
 * ============================================================
 */

const MataPelajaranRepository = {

  /**
   * ----------------------------------------------------------
   * GET ALL MATA PELAJARAN
   * ----------------------------------------------------------
   */

  getAll() {

    return SheetManager.getAll("MATA_PELAJARAN");

  },


  /**
   * ----------------------------------------------------------
   * GET ACTIVE MATA PELAJARAN
   * ----------------------------------------------------------
   */

  getActive() {

    return SheetManager.getActive(
      "MATA_PELAJARAN",
      "STATUS_MAPEL"
    );

  },


  /**
   * ----------------------------------------------------------
   * FIND MATA PELAJARAN BY ID
   * ----------------------------------------------------------
   */

  findById(idMapel) {

    const searchId = Utils.normalizeText(idMapel);

    if (!searchId) {
      return null;
    }

    const data = this.getAll();

    return data.find(mapel => {

      return Utils.normalizeText(mapel.ID_MAPEL)
        === searchId;

    }) || null;

  },



/* =========================================
   CREATE MATA PELAJARAN
========================================= */

create(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Data mata pelajaran tidak valid.");
  }

  SheetManager.validateHeaders("MATA_PELAJARAN");

  const sheet = SheetManager.getSheet("MATA_PELAJARAN");
  const headers = SHEET_SCHEMA.MATA_PELAJARAN.headers;

  const row = headers.map(header =>
    data[header] !== undefined ? data[header] : ""
  );

  const nextRow = sheet.getLastRow() + 1;
  const idIndex = headers.indexOf("ID_MAPEL");

  if (idIndex === -1) {
    throw new Error("Kolom ID_MAPEL tidak ditemukan.");
  }

  sheet.getRange(nextRow, idIndex + 1).setNumberFormat("@");

  sheet
    .getRange(nextRow, 1, 1, headers.length)
    .setValues([row]);

  return Object.fromEntries(
    headers.map((header, index) => [header, row[index]])
  );
},

/* =========================================
   UPDATE MATA PELAJARAN
========================================= */

updateById(idMapel, data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Data perubahan tidak valid.");
  }

  const searchId = Utils.normalizeText(idMapel);

  if (!searchId) {
    throw new Error("ID mata pelajaran wajib diisi.");
  }

  SheetManager.validateHeaders("MATA_PELAJARAN");

  const sheet = SheetManager.getSheet("MATA_PELAJARAN");
  const headers = SHEET_SCHEMA.MATA_PELAJARAN.headers;

  const idIndex = headers.indexOf("ID_MAPEL");

  if (idIndex === -1) {
    throw new Error("Kolom ID_MAPEL tidak ditemukan.");
  }

  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    throw new Error("Data mata pelajaran tidak ditemukan.");
  }

  const ids = sheet
    .getRange(2, idIndex + 1, lastRow - 1, 1)
    .getDisplayValues();

  const foundIndex = ids.findIndex(row =>
    Utils.normalizeText(row[0]) === searchId
  );

  if (foundIndex === -1) {
    throw new Error("Data mata pelajaran tidak ditemukan.");
  }

  const rowNumber = foundIndex + 2;

  const currentRow = sheet
    .getRange(rowNumber, 1, 1, headers.length)
    .getValues()[0];

  const protectedFields = ["ID_MAPEL", "CREATED_AT"];

  const updatedRow = currentRow.map((value, index) => {
    const header = headers[index];

    if (protectedFields.includes(header)) {
      return value;
    }

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
}


};
