/**
 * ============================================================
 * TEACHLY - KELOMPOK NGAJI REPOSITORY
 * QEDEV BACKEND STANDARD
 * ============================================================
 *
 * Tanggung jawab:
 * 1. Mengambil seluruh data kelompok ngaji.
 * 2. Mengambil kelompok ngaji yang aktif.
 * 3. Mencari kelompok berdasarkan ID_KELOMPOK.
 *
 * ============================================================
 */

const KelompokNgajiRepository = {

  getAll() {
    return SheetManager.getAll(
      TEACHLY_SHEETS.KELOMPOK_NGAJI
    );
  },

  getActive() {
    return SheetManager.getActive(
      TEACHLY_SHEETS.KELOMPOK_NGAJI,
      "STATUS_KELOMPOK"
    );
  },

  findById(idKelompok) {
    if (Utils.isEmpty(idKelompok)) {
      return null;
    }

    const data = this.getAll();

    return data.find(item =>
      String(item.ID_KELOMPOK).trim() ===
      String(idKelompok).trim()
    ) || null;
  },


/* =====================================
   CREATE KELOMPOK NGAJI
===================================== */

create(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Data kelompok ngaji tidak valid.");
  }

  SheetManager.validateHeaders(
    TEACHLY_SHEETS.KELOMPOK_NGAJI
  );

  const sheet = SheetManager.getSheet(
    TEACHLY_SHEETS.KELOMPOK_NGAJI
  );

  const headers = SHEET_SCHEMA.KELOMPOK_NGAJI.headers;

  const row = headers.map(header =>
    data[header] !== undefined ? data[header] : ""
  );

  const idIndex = headers.indexOf("ID_KELOMPOK");

  if (idIndex === -1) {
    throw new Error("Kolom ID_KELOMPOK tidak ditemukan.");
  }

  const nextRow = sheet.getLastRow() + 1;

  sheet
    .getRange(nextRow, idIndex + 1)
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

/* =====================================
   UPDATE KELOMPOK NGAJI
===================================== */

updateById(idKelompok, data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Data perubahan tidak valid.");
  }

  const id = String(idKelompok || "").trim();

  if (!id) {
    throw new Error("ID kelompok ngaji wajib diisi.");
  }

  SheetManager.validateHeaders(
    TEACHLY_SHEETS.KELOMPOK_NGAJI
  );

  const sheet = SheetManager.getSheet(
    TEACHLY_SHEETS.KELOMPOK_NGAJI
  );

  const headers = SHEET_SCHEMA.KELOMPOK_NGAJI.headers;
  const idIndex = headers.indexOf("ID_KELOMPOK");

  if (idIndex === -1) {
    throw new Error("Kolom ID_KELOMPOK tidak ditemukan.");
  }

  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    throw new Error("Kelompok ngaji tidak ditemukan.");
  }

  const ids = sheet
    .getRange(2, idIndex + 1, lastRow - 1, 1)
    .getDisplayValues();

  const foundIndex = ids.findIndex(row =>
    String(row[0]).trim() === id
  );

  if (foundIndex === -1) {
    throw new Error("Kelompok ngaji tidak ditemukan.");
  }

  const rowNumber = foundIndex + 2;

  const currentRow = sheet
    .getRange(rowNumber, 1, 1, headers.length)
    .getValues()[0];

  const protectedFields = [
    "ID_KELOMPOK",
    "CREATED_AT"
  ];

  const updatedRow = currentRow.map((value, index) => {
    const header = headers[index];

    if (protectedFields.includes(header)) {
      return value;
    }

    return Object.prototype.hasOwnProperty.call(
      data,
      header
    )
      ? data[header]
      : value;
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