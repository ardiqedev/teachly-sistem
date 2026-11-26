
/**
 * ============================================================
 * TEACHLY - PENGGUNA REPOSITORY
 * QEDEV BACKEND STANDARD
 * ============================================================
 *
 * Tanggung jawab:
 * 1. Mengambil seluruh data pengguna.
 * 2. Mencari pengguna berdasarkan USERNAME.
 * 3. Memvalidasi username dan password.
 * 4. Memastikan akun berstatus AKTIF.
 *
 * Database:
 * Sheet PENGGUNA
 *
 * ============================================================
 */

const PenggunaRepository = {

  /**
   * ----------------------------------------------------------
   * GET ALL PENGGUNA
   * ----------------------------------------------------------
   */

  getAll() {

    return SheetManager.getAll("PENGGUNA");

  },


  /**
   * ----------------------------------------------------------
   * FIND PENGGUNA BY USERNAME
   * ----------------------------------------------------------
   */

  findByUsername(username) {

    const searchUsername = Utils.normalizeText(username);

    if (!searchUsername) {
      return null;
    }

    const data = this.getAll();

    return data.find(pengguna => {
      return Utils.normalizeText(pengguna.USERNAME) === searchUsername;
    }) || null;

  },


  /**
   * ----------------------------------------------------------
   * VALIDATE LOGIN
   * ----------------------------------------------------------
   */

  validateLogin(username, password) {

    const searchUsername = Utils.normalizeText(username);

    if (!searchUsername || password === undefined || password === null) {
      return null;
    }

    const pengguna = this.findByUsername(searchUsername);

    if (!pengguna) {
      return null;
    }

    if (
      String(pengguna.PASSWORD) !== String(password)
    ) {
      return null;
    }

    if (
      Utils.normalizeText(pengguna.STATUS_AKUN) !== "AKTIF"
    ) {
      return null;
    }

    return pengguna;

  },



/* =========================================
   FIND BY ID
========================================= */

findById(idPengguna) {
  const id = String(idPengguna || "").trim();

  if (!id) return null;

  return this.getAll().find((item) =>
    String(item.ID_PENGGUNA || "").trim() === id
  ) || null;
},

/* =========================================
   FIND ROW BY ID
========================================= */

findRowById(idPengguna) {
  const id = String(idPengguna || "").trim();

  if (!id) return -1;

  const sheet = SheetManager.getSheet("PENGGUNA");
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) return -1;

  const headers = SHEET_SCHEMA.PENGGUNA.headers;
  const idColumn = headers.indexOf("ID_PENGGUNA") + 1;

  if (!idColumn) {
    throw new Error("Kolom ID_PENGGUNA tidak ditemukan.");
  }

  const values = sheet
    .getRange(2, idColumn, lastRow - 1, 1)
    .getDisplayValues();

  const index = values.findIndex((row) =>
    String(row[0]).trim() === id
  );

  return index === -1 ? -1 : index + 2;
},

/* =========================================
   GENERATE UNIQUE ID
   Dipanggil dalam LockService oleh Service.
========================================= */

generateId() {
  const existingIds = this.getAll().map((item) =>
    String(item.ID_PENGGUNA || "").trim()
  );

  const used = new Set(existingIds);
  let number = 1;
  let id;

  do {
    id = "adm_" + String(number).padStart(2, "0");
    number++;
  } while (used.has(id));

  return id;
},

/* =========================================
   CREATE PENGGUNA
   Data sudah divalidasi oleh Service.
========================================= */

create(data) {
  const sheet = SheetManager.getSheet("PENGGUNA");
  const headers = SHEET_SCHEMA.PENGGUNA.headers;

  const row = headers.map((header) => {
    return Object.prototype.hasOwnProperty.call(
      data, header
    ) ? data[header] : "";
  });

  sheet.appendRow(row);

  return data.ID_PENGGUNA;
},

/* =========================================
   UPDATE PENGGUNA
   Hanya field yang diizinkan.
========================================= */

update(idPengguna, changes) {
  const sheet = SheetManager.getSheet("PENGGUNA");
  const rowNumber = this.findRowById(idPengguna);

  if (rowNumber === -1) {
    throw new Error("Pengguna tidak ditemukan.");
  }

  const headers = SHEET_SCHEMA.PENGGUNA.headers;

  
  const allowedFields = [
    "USERNAME",
    "NAMA_PENGGUNA",
    "ROLE",
    "STATUS_AKUN",
    "UPDATED_AT"
  ];


  const updates = Object.keys(changes || {}).filter(
    (field) =>
      allowedFields.includes(field) &&
      headers.includes(field)
  );

  updates.forEach((field) => {
    const column = headers.indexOf(field) + 1;

    sheet
      .getRange(rowNumber, column)
      .setValue(changes[field]);
  });

  return true;
},



/* =========================================
   UPDATE PASSWORD PENGGUNA
   Hanya menerima hash V2.
========================================= */

updatePassword(idPengguna, passwordHash) {

  const hash = String(
    passwordHash || ""
  ).trim();

  if (
    !/^hmac_sha256_v2\$[0-9a-f]{32}\$[0-9a-f]{64}$/i.test(hash)
  ) {
    throw new Error(
      "Format hash password tidak valid."
    );
  }

  const sheet = SheetManager.getSheet(
    "PENGGUNA"
  );

  const rowNumber = this.findRowById(
    idPengguna
  );

  if (rowNumber === -1) {
    throw new Error(
      "Pengguna tidak ditemukan."
    );
  }

  const headers =
    SHEET_SCHEMA.PENGGUNA.headers;

  const passwordColumn =
    headers.indexOf("PASSWORD") + 1;

  if (passwordColumn < 1) {
    throw new Error(
      "Kolom PASSWORD tidak ditemukan."
    );
  }

  sheet.getRange(
    rowNumber,
    passwordColumn
  ).setValue(hash);

  return true;

},


/* =========================================
   DELETE PENGGUNA
   Perlindungan dilakukan di Service.
========================================= */

delete(idPengguna) {
  const sheet = SheetManager.getSheet("PENGGUNA");
  const rowNumber = this.findRowById(idPengguna);

  if (rowNumber === -1) {
    throw new Error("Pengguna tidak ditemukan.");
  }

  sheet.deleteRow(rowNumber);

  return true;
}


};
