
/* =========================================
   TEACHLY - TAHUN AJARAN REPOSITORY
========================================= */

const TahunAjaranRepository = {

  /**
   * Mengambil seluruh data tahun ajaran.
   */
  getAll() {
    return SheetManager.getAll("TAHUN_AJARAN");
  },

  /**
   * Mengambil seluruh tahun ajaran aktif.
   */
  getActive() {
    return this.getAll().filter(item =>
      String(item.STATUS_TAHUN_AJARAN || "")
        .trim()
        .toUpperCase() === TEACHLY_STATUS.AKTIF
    );
  },

  /**
   * Mencari tahun ajaran berdasarkan ID.
   */
  findById(idTahunAjaran) {
    const id = String(idTahunAjaran || "").trim();

    if (!id) return null;

    return this.getAll().find(item =>
      String(item.ID_TAHUN_AJARAN || "").trim() === id
    ) || null;
  },


/* =====================================
   CREATE TAHUN AJARAN
===================================== */

create(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Data tahun ajaran tidak valid.");
  }

  SheetManager.validateHeaders("TAHUN_AJARAN");

  const sheet = SheetManager.getSheet("TAHUN_AJARAN");
  const headers = SHEET_SCHEMA.TAHUN_AJARAN.headers;

  const idIndex = headers.indexOf("ID_TAHUN_AJARAN");

  if (idIndex === -1) {
    throw new Error("Kolom ID_TAHUN_AJARAN tidak ditemukan.");
  }

  const row = headers.map(header =>
    Object.prototype.hasOwnProperty.call(data, header)
      ? data[header]
      : ""
  );

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
   UPDATE TAHUN AJARAN
===================================== */

updateById(idTahunAjaran, data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Data perubahan tidak valid.");
  }

  const id = String(idTahunAjaran || "").trim();

  if (!id) {
    throw new Error("ID tahun ajaran wajib diisi.");
  }

  SheetManager.validateHeaders("TAHUN_AJARAN");

  const sheet = SheetManager.getSheet("TAHUN_AJARAN");
  const headers = SHEET_SCHEMA.TAHUN_AJARAN.headers;
  const idIndex = headers.indexOf("ID_TAHUN_AJARAN");

  if (idIndex === -1) {
    throw new Error("Kolom ID_TAHUN_AJARAN tidak ditemukan.");
  }

  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    throw new Error("Tahun ajaran tidak ditemukan.");
  }

  const ids = sheet
    .getRange(2, idIndex + 1, lastRow - 1, 1)
    .getDisplayValues();

  const foundIndex = ids.findIndex(row =>
    String(row[0]).trim() === id
  );

  if (foundIndex === -1) {
    throw new Error("Tahun ajaran tidak ditemukan.");
  }

  const rowNumber = foundIndex + 2;

  const currentRow = sheet
    .getRange(rowNumber, 1, 1, headers.length)
    .getValues()[0];

  const protectedFields = [
    "ID_TAHUN_AJARAN",
    "CREATED_AT",
    "STATUS_TAHUN_AJARAN"
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
},

/* =====================================
   ACTIVATE TAHUN AJARAN
   HANYA SATU YANG AKTIF
===================================== */

activateById(idTahunAjaran, updatedAt) {
  const id = String(idTahunAjaran || "").trim();

  if (!id) {
    throw new Error("ID tahun ajaran wajib diisi.");
  }

  SheetManager.validateHeaders("TAHUN_AJARAN");

  const sheet = SheetManager.getSheet("TAHUN_AJARAN");
  const headers = SHEET_SCHEMA.TAHUN_AJARAN.headers;

  const idIndex = headers.indexOf("ID_TAHUN_AJARAN");
  const statusIndex = headers.indexOf("STATUS_TAHUN_AJARAN");
  const updatedIndex = headers.indexOf("UPDATED_AT");

  if ([idIndex, statusIndex, updatedIndex].includes(-1)) {
    throw new Error("Struktur sheet TAHUN_AJARAN tidak valid.");
  }

  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    throw new Error("Belum ada data tahun ajaran.");
  }

  const range = sheet.getRange(
    2,
    1,
    lastRow - 1,
    headers.length
  );

  const rows = range.getValues();

  const targetIndex = rows.findIndex(row =>
    String(row[idIndex]).trim() === id
  );

  if (targetIndex === -1) {
    throw new Error("Tahun ajaran tidak ditemukan.");
  }

  // Siapkan perubahan dalam satu batch.
  // Tidak ada proses menonaktifkan semua tahun
  // terlebih dahulu.

  const updatedRows = rows.map((row, index) => {
    const next = [...row];

    const desiredStatus = index === targetIndex
      ? TEACHLY_STATUS.AKTIF
      : TEACHLY_STATUS.NONAKTIF;

    const currentStatus = String(
      row[statusIndex] || ""
    ).trim().toUpperCase();

    if (currentStatus !== desiredStatus) {
      next[statusIndex] = desiredStatus;
      next[updatedIndex] = updatedAt;
    }

    return next;
  });

  range.setValues(updatedRows);

  return Object.fromEntries(
    headers.map((header, index) => [
      header,
      updatedRows[targetIndex][index]
    ])
  );
}


};
