
/* =========================================
   TEACHLY - SESI NGAJI REPOSITORY
   QEDEV BACKEND STANDARD
========================================= */

const SesiNgajiRepository = {

  getAll() {
    return SheetManager.getAll(TEACHLY_SHEETS.SESI_NGAJI);
  },

  getActive() {
    return SheetManager.getActive(
      TEACHLY_SHEETS.SESI_NGAJI,
      "STATUS_SESI"
    );
  },

  findById(idSesi) {
    if (Utils.isEmpty(idSesi)) {
      return null;
    }

    const data = this.getAll();

    return data.find(item =>
      String(item.ID_SESI).trim() === String(idSesi).trim()
    ) || null;
  },

  /* =====================================
     CREATE SESI
  ===================================== */

  create(data) {
    SheetManager.validateHeaders(TEACHLY_SHEETS.SESI_NGAJI);

    const sheet = SheetManager.getSheet(
      TEACHLY_SHEETS.SESI_NGAJI
    );

    const headers = SHEET_SCHEMA.SESI_NGAJI.headers;

    const row = headers.map(header =>
      data[header] !== undefined ? data[header] : ""
    );

    const nextRow = sheet.getLastRow() + 1;
    const idIndex = headers.indexOf("ID_SESI");

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
     UPDATE SESI
  ===================================== */

  updateById(idSesi, data) {
    SheetManager.validateHeaders(TEACHLY_SHEETS.SESI_NGAJI);

    const sheet = SheetManager.getSheet(
      TEACHLY_SHEETS.SESI_NGAJI
    );

    const headers = SHEET_SCHEMA.SESI_NGAJI.headers;
    const idIndex = headers.indexOf("ID_SESI");

    const lastRow = sheet.getLastRow();

    if (lastRow < 2) {
      throw new Error("Sesi ngaji tidak ditemukan.");
    }

    const ids = sheet
      .getRange(2, idIndex + 1, lastRow - 1, 1)
      .getDisplayValues();

    const foundIndex = ids.findIndex(row =>
      String(row[0]).trim() === String(idSesi).trim()
    );

    if (foundIndex === -1) {
      throw new Error("Sesi ngaji tidak ditemukan.");
    }

    const rowNumber = foundIndex + 2;

    const currentRow = sheet
      .getRange(rowNumber, 1, 1, headers.length)
      .getValues()[0];

    const protectedFields = [
      "ID_SESI",
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
