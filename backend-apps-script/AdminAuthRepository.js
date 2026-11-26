
/* =========================================
   TEACHLY - ADMIN AUTH REPOSITORY
   Data Access Layer
   Source: Sheet PENGGUNA
========================================= */

const AdminAuthRepository = {

  /* =====================================
     FIND BY USERNAME
  ===================================== */

  findByUsername(username) {

    const normalizedUsername = String(username || "")
      .trim()
      .toLowerCase();

    if (!normalizedUsername) {
      return null;
    }

    const users = SheetManager.getAll("PENGGUNA");

    const account = users.find(user => {

      const storedUsername = String(user.USERNAME || "")
        .trim()
        .toLowerCase();

      return storedUsername === normalizedUsername;

    });

    console.log(
      "[AdminAuth] Account found:",
      Boolean(account)
    );

    return account || null;

  },



/**
 * Mencari akun Admin berdasarkan ID_PENGGUNA.
 *
 * Digunakan untuk memvalidasi sesi Admin.
 */
findById(idPengguna) {

  const normalizedId = String(
    idPengguna || ""
  ).trim();

  if (!normalizedId) {
    return null;
  }

  const users = SheetManager.getAll("PENGGUNA");

  const account = users.find(function(user) {
    return String(
      user.ID_PENGGUNA || ""
    ).trim() === normalizedId;
  });

  return account || null;

},



  /* =====================================
     UPDATE LOGIN ACTIVITY
  ===================================== */

  updateLastLogin(idPengguna) {

    const normalizedId = String(idPengguna || "").trim();

    if (!normalizedId) {
      throw new Error("ID pengguna wajib diisi.");
    }

    const sheet = SheetManager.getSheet("PENGGUNA");

    const lastRow = sheet.getLastRow();

    if (lastRow < 2) {
      throw new Error("Data pengguna belum tersedia.");
    }

    const headers = SHEET_SCHEMA.PENGGUNA.headers;

    const idColumn = headers.indexOf("ID_PENGGUNA") + 1;
    const updatedColumn = headers.indexOf("UPDATED_AT") + 1;

    if (!idColumn || !updatedColumn) {
      throw new Error("Kolom ID_PENGGUNA atau UPDATED_AT tidak ditemukan.");
    }

    const idValues = sheet
      .getRange(2, idColumn, lastRow - 1, 1)
      .getDisplayValues();

    const rowIndex = idValues.findIndex(row =>
      String(row[0]).trim() === normalizedId
    );

    if (rowIndex === -1) {
      throw new Error("Data pengguna tidak ditemukan.");
    }

    sheet
      .getRange(rowIndex + 2, updatedColumn)
      .setValue(new Date());

    return true;

  }

};
