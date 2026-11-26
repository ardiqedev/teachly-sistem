
/**
 * ============================================================
 * TEACHLY - SHEET MANAGER
 * QEDEV BACKEND STANDARD
 * ============================================================
 *
 * Tanggung jawab:
 * 1. Mengakses Google Spreadsheet.
 * 2. Mengambil objek sheet.
 * 3. Memvalidasi keberadaan sheet.
 * 4. Memvalidasi header sheet.
 * 5. Membaca data berdasarkan header.
 *
 * Tidak membuat, menghapus, atau mengubah struktur sheet.
 *
 * ============================================================
 */


/**
 * Mengambil koneksi database utama.
 */
const SheetManager = {

  /**
   * Mendapatkan Spreadsheet utama.
   */
  getDatabase() {

    const spreadsheetId = TEACHLY_CONFIG.SPREADSHEET_ID;

    if (
      !spreadsheetId ||
      spreadsheetId === "ISI_ID_SPREADSHEET_DI_SINI"
    ) {
      throw new Error(
        "SPREADSHEET_ID belum dikonfigurasi."
      );
    }

    try {

      return SpreadsheetApp.openById(spreadsheetId);

    } catch (error) {

      throw new Error(
        "Gagal mengakses database Teachly: " +
        error.message
      );

    }

  },


  /**
   * Mengambil sheet berdasarkan nama.
   */
  getSheet(sheetKey) {

    const schema = SHEET_SCHEMA[sheetKey];

    if (!schema) {
      throw new Error(
        "Konfigurasi sheet tidak ditemukan: " +
        sheetKey
      );
    }

    const database = this.getDatabase();

    const sheet = database.getSheetByName(
      schema.name
    );

    if (!sheet) {
      throw new Error(
        "Sheet tidak ditemukan: " +
        schema.name
      );
    }

    return sheet;

  },


  /**
   * Memvalidasi header sheet.
   */
  validateHeaders(sheetKey) {

    const schema = SHEET_SCHEMA[sheetKey];

    if (!schema) {
      throw new Error(
        "Schema tidak ditemukan: " +
        sheetKey
      );
    }

    const sheet = this.getSheet(sheetKey);

    const expectedHeaders = schema.headers;

    const actualHeaders = sheet
      .getRange(1, 1, 1, expectedHeaders.length)
      .getDisplayValues()[0]
      .map(value => String(value).trim());

    const errors = [];

    expectedHeaders.forEach((header, index) => {

      if (actualHeaders[index] !== header) {

        errors.push({
          column: index + 1,
          expected: header,
          actual: actualHeaders[index] || ""
        });

      }

    });

    if (errors.length > 0) {

      throw new Error(
        "Header sheet " +
        schema.name +
        " tidak sesuai: " +
        JSON.stringify(errors)
      );

    }

    return true;

  },


  /**
   * Memvalidasi seluruh master sheet.
   */
  validateAllSheets() {

    const results = {};

    Object.keys(SHEET_SCHEMA).forEach(sheetKey => {

      try {

        this.validateHeaders(sheetKey);

        results[sheetKey] = {
          success: true,
          message: "Header sesuai"
        };

      } catch (error) {

        results[sheetKey] = {
          success: false,
          message: error.message
        };

      }

    });

    return results;

  },


  /**
   * Membaca seluruh data sheet.
   * Baris pertama dianggap sebagai header.
   */
  getAll(sheetKey) {

    this.validateHeaders(sheetKey);

    const sheet = this.getSheet(sheetKey);

    const lastRow = sheet.getLastRow();

    const headers = SHEET_SCHEMA[sheetKey].headers;

    if (lastRow < 2) {
      return [];
    }

    const values = sheet
      .getRange(
        2,
        1,
        lastRow - 1,
        headers.length
      )
      .getValues();

    return values.map(row => {

      const item = {};

      headers.forEach((header, index) => {

        item[header] = row[index];

      });

      return item;

    });

  },


  /**
   * Membaca data aktif berdasarkan kolom status.
   */
  getActive(sheetKey, statusColumn) {

    const data = this.getAll(sheetKey);

    return data.filter(item => {

      return String(item[statusColumn]).trim()
        .toUpperCase() === TEACHLY_STATUS.AKTIF;

    });

  }

};
