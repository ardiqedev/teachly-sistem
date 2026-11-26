function testAdminPermission() {

  const tests = [
    ["ADMIN", "pengguna.list", true],
    ["ADMIN_KURIKULUM", "pengguna.list", false],
    ["ADMIN_GURU_NGAJI", "pengguna.list", false],

    ["ADMIN_KURIKULUM", "adminKelas.list", true],
    ["ADMIN_KURIKULUM", "adminKelompok.list", false],

    ["ADMIN_GURU_NGAJI", "adminSesi.list", true],
    ["ADMIN_GURU_NGAJI", "adminMapel.list", false],

    ["ADMIN_KURIKULUM", "admin.laporan.list", true],
    ["ADMIN_GURU_NGAJI", "admin.laporan.list", true],

    ["ADMIN", "informasiSekolah.save", true]
  ];

  let passed = 0;

  tests.forEach(function(test, index) {

    const actual = AdminPermission.canAccess(
      test[0],
      test[1]
    );

    if (actual !== test[2]) {
      throw new Error(
        "FAIL " + (index + 1) +
        ": " + test[0] +
        " -> " + test[1]
      );
    }

    passed++;

    Logger.log(
      "PASS " + (index + 1) +
      ": " + test[0] +
      " -> " + test[1]
    );

  });

  Logger.log(
    "=== ADMIN PERMISSION: " +
    passed + "/" + tests.length +
    " PASS ==="
  );

}

function testRouterAdminProtection() {

  const originalEnabled =
    Router.adminSecurity.enabled;

  const endpoint = "pengguna.list";

  try {

    Router.adminSecurity.enabled = true;

    const result = Router.dispatch(
      endpoint,
      {},
      ""
    );

    if (
      !result ||
      result.success !== false
    ) {
      throw new Error(
        "FAIL: Endpoint Admin dapat diakses tanpa token."
      );
    }

    console.log(
      "PASS 1: Request tanpa token ditolak."
    );

    if (!Router.requiresAdminAuth(endpoint)) {
      throw new Error(
        "FAIL: Endpoint CRUD tidak terlindungi."
      );
    }

    console.log(
      "PASS 2: Endpoint CRUD dikenali sebagai terlindungi."
    );

    const getResult = Router.handleGet({
      parameter: {
        endpoint: endpoint
      }
    });

    if (
      !getResult ||
      getResult.success !== false
    ) {
      throw new Error(
        "FAIL: Endpoint Admin dapat diakses melalui GET."
      );
    }

    console.log(
      "PASS 3: GET endpoint Admin ditolak."
    );

    Router.adminSecurity.enabled = false;

    const disabledResult = Router.dispatch(
      endpoint,
      {},
      ""
    );

    if (
      !disabledResult ||
      disabledResult.success !== false
    ) {
      throw new Error(
        "FAIL: Endpoint terbuka saat proteksi nonaktif."
      );
    }

    console.log(
      "PASS 4: Endpoint ditolak saat proteksi nonaktif."
    );

    console.log(
      "=== ROUTER ADMIN PROTECTION: 4/4 PASS ==="
    );

  } finally {

    Router.adminSecurity.enabled =
      originalEnabled;

  }

}



/**
 * SETUP SHEET LAPORAN TEACHLY
 * Membuat 3 sheet laporan beserta header.
 */

function setupLaporanSheets() {
  const ss = SpreadsheetApp.openById(
    TEACHLY_CONFIG.SPREADSHEET_ID
  );

  const sheetKeys = [
    "LAPORAN_GURU_KELAS",
    "LAPORAN_GURU_MAPEL",
    "LAPORAN_GURU_NGAJI"
  ];

  const results = [];

  sheetKeys.forEach(key => {
    const schema = SHEET_SCHEMA[key];

    if (!schema) {
      throw new Error(
        "Schema tidak ditemukan: " + key
      );
    }

    let sheet = ss.getSheetByName(schema.name);
    let status = "";

    // Buat tab jika belum tersedia
    if (!sheet) {
      sheet = ss.insertSheet(schema.name);
      status = "SHEET DIBUAT";
    } else {
      status = "SHEET SUDAH ADA";
    }

    const headers = schema.headers;
    const currentHeaders = sheet
      .getRange(1, 1, 1, headers.length)
      .getValues()[0];

    const isEmpty = currentHeaders.every(
      value => value === ""
    );

    // Isi header jika baris pertama masih kosong
    if (isEmpty) {
      sheet
        .getRange(1, 1, 1, headers.length)
        .setValues([headers]);

      sheet.setFrozenRows(1);

      status += " | HEADER DIBUAT";

    } else {
      // Jangan menimpa header yang sudah ada
      const isSame = headers.every(
        (header, index) =>
          currentHeaders[index] === header
      );

      if (!isSame) {
        throw new Error(
          "Header tidak sesuai pada sheet: " +
          schema.name +
          ". Tidak ada perubahan header yang dilakukan."
        );
      }

      status += " | HEADER SUDAH SESUAI";
    }

    results.push({
      sheet: schema.name,
      jumlahKolom: headers.length,
      status: status
    });
  });

  console.log("HASIL SETUP SHEET LAPORAN:");

  results.forEach(item => {
    console.log(
      item.sheet +
      " | " +
      item.jumlahKolom +
      " kolom | " +
      item.status
    );
  });

  return results;
}





/* =========================================
   TEACHLY - ROUTER ENDPOINT AUDIT
   Hanya untuk pengujian internal.
========================================= */

function testRouterRegisteredEndpoints() {

  const endpoints = Object.keys(
    Router.routes
  ).sort();

  console.log(
    "=== TEACHLY REGISTERED ENDPOINTS ==="
  );

  endpoints.forEach(function(endpoint, index) {
    console.log(
      (index + 1) + ". " + endpoint
    );
  });

  console.log(
    "TOTAL ENDPOINT: " + endpoints.length
  );

  return endpoints.length;
}




function testRouterAdminSecurity() {

  const router = Router;

  const tests = [
    ["admin.guru.list", true],
    ["admin.laporan.getAll", true],
    ["adminDashboard.summary", true],
    ["adminKelas.list", true],
    ["adminKelompok.list", true],
    ["adminMapel.list", true],
    ["adminSesi.list", true],
    ["adminTahunAjaran.list", true],
    ["informasiSekolah.save", true],
    ["adminAuth.login", false],
    ["auth.login", false],
    ["laporan.formOptions", false]
  ];

  tests.forEach(function(test) {

    const actual = router.requiresAdminAuth(
      test[0]
    );

    if (actual !== test[1]) {
      throw new Error(
        "FAIL: " + test[0]
      );
    }

    console.log(
      "PASS:",
      test[0],
      "protected:",
      actual
    );

  });

  console.log(
    "=== ROUTER ADMIN SECURITY: " +
    tests.length + "/" +
    tests.length + " PASS ==="
  );

}

