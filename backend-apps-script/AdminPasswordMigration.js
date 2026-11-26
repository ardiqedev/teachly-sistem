
/* =========================================
   TEACHLY - ADMIN PASSWORD MIGRATION
   Target: adm_01
   Sheet: PENGGUNA
========================================= */

const AdminPasswordMigration = {

  SHEET_NAME: "PENGGUNA",
  TARGET_ID: "adm_01",
  TARGET_USERNAME: "admin",

  /**
   * Validasi struktur hash V2.
   */
  validateHash(hash) {

    const value = String(hash || "").trim();

    const pattern =
      /^hmac_sha256_v2\$[0-9a-f]{32}\$[0-9a-f]{64}$/i;

    if (!pattern.test(value)) {
      throw new Error(
        "Format hash V2 tidak valid."
      );
    }

    return value;
  },

  /**
   * Cari akun target dan posisi sel password.
   *
   * spreadsheet: objek Spreadsheet
   */
  findTarget(spreadsheet) {

    const sheet = spreadsheet.getSheetByName(
      this.SHEET_NAME
    );

    if (!sheet) {
      throw new Error(
        "Sheet PENGGUNA tidak ditemukan."
      );
    }

    const lastRow = sheet.getLastRow();
    const lastColumn = sheet.getLastColumn();

    if (lastRow < 2) {
      throw new Error(
        "Sheet PENGGUNA belum memiliki data."
      );
    }

    const headers = sheet
      .getRange(1, 1, 1, lastColumn)
      .getValues()[0]
      .map(function(value) {
        return String(value || "").trim();
      });

    const required = [
      "ID_PENGGUNA",
      "USERNAME",
      "PASSWORD",
      "ROLE",
      "STATUS_AKUN"
    ];

    required.forEach(function(name) {

      if (headers.filter(function(header) {
        return header === name;
      }).length !== 1) {
        throw new Error(
          "Header tidak ditemukan atau duplikat: " +
          name
        );
      }

    });

    const column = function(name) {
      return headers.indexOf(name);
    };

    const rows = sheet
      .getRange(
        2,
        1,
        lastRow - 1,
        lastColumn
      )
      .getValues();

    const matches = [];

    rows.forEach((row, index) => {

      const id = String(
        row[column("ID_PENGGUNA")] || ""
      ).trim();

      if (id === this.TARGET_ID) {
        matches.push({
          rowNumber: index + 2,
          row: row
        });
      }

    });

    if (matches.length !== 1) {
      throw new Error(
        "Akun target harus ditemukan tepat satu kali."
      );
    }

    const target = matches[0];
    const row = target.row;

    const username = String(
      row[column("USERNAME")] || ""
    ).trim().toLowerCase();

    const role = String(
      row[column("ROLE")] || ""
    ).trim().toUpperCase();

    const status = String(
      row[column("STATUS_AKUN")] || ""
    ).trim().toUpperCase();

    if (
      username !== this.TARGET_USERNAME ||
      role !== "ADMIN" ||
      status !== "AKTIF"
    ) {
      throw new Error(
        "Identitas atau status akun target tidak sesuai."
      );
    }

    return {
      sheet: sheet,
      rowNumber: target.rowNumber,
      passwordColumn: column("PASSWORD") + 1
    };

  },

  /**
   * Migrasi satu sel password.
   *
   * hashV2 harus sudah dibuat sebelumnya.
   */
  migrate(hashV2, spreadsheet) {

    const validHash = this.validateHash(hashV2);

    if (!spreadsheet) {
      throw new Error(
        "Objek Spreadsheet wajib diberikan."
      );
    }

    const lock = LockService.getScriptLock();

    if (!lock.tryLock(10000)) {
      throw new Error(
        "Migrasi sedang diproses. Coba lagi."
      );
    }

    try {

      const target = this.findTarget(
        spreadsheet
      );

      const cell = target.sheet.getRange(
        target.rowNumber,
        target.passwordColumn
      );

      const existing = String(
        cell.getValue() || ""
      ).trim();

      // Jangan menimpa hash V2 yang
      // sudah tersimpan.
      if (PasswordService.isV2Hash(existing)) {
        throw new Error(
          "Password akun sudah menggunakan V2."
        );
      }

      // Hanya satu sel yang diperbarui.
      cell.setValue(validHash);

      SpreadsheetApp.flush();

      const saved = String(
        cell.getValue() || ""
      ).trim();

      if (saved !== validHash) {
        throw new Error(
          "Verifikasi penyimpanan password gagal."
        );
      }

      console.log(
        "[AdminPasswordMigration] Migrasi berhasil untuk adm_01."
      );

      return {
        success: true,
        idPengguna: this.TARGET_ID,
        migrated: true
      };

    } finally {

      lock.releaseLock();

    }

  }

};
