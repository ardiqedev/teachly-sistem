
function testAdminPasswordVerification() {

  const verify = function(password, hash) {
    return AdminAuthService.verifyAdminPassword(
      password,
      hash
    );
  };

  // TEST 1: Plaintext harus ditolak.
  if (verify("admin123", "admin123")) {
    throw new Error(
      "FAIL 1: Plaintext diterima."
    );
  }

  console.log("PASS 1: Plaintext ditolak.");

  // TEST 2: Hash HMAC V2 harus ditolak.
  const fakeV2 = [
    "hmac_sha256_v2",
    "00112233445566778899aabbccddeeff",
    "a".repeat(64)
  ].join("$");

  if (verify("TeachlyAdmin2027!", fakeV2)) {
    throw new Error(
      "FAIL 2: HMAC V2 diterima."
    );
  }

  console.log("PASS 2: HMAC V2 ditolak.");

  // TEST 3: PBKDF2 dengan iterasi rendah ditolak.
  const weakHash = [
    "pbkdf2_sha256",
    "5000",
    "00112233445566778899aabbccddeeff",
    "a".repeat(64)
  ].join("$");

  if (verify("TeachlyAdmin2027!", weakHash)) {
    throw new Error(
      "FAIL 3: Hash iterasi rendah diterima."
    );
  }

  console.log(
    "PASS 3: PBKDF2 iterasi rendah ditolak."
  );

  // TEST 4: Format hash rusak ditolak.
  if (verify(
    "TeachlyAdmin2027!",
    "pbkdf2_sha256$210000$invalid$invalid"
  )) {
    throw new Error(
      "FAIL 4: Format hash rusak diterima."
    );
  }

  console.log("PASS 4: Format hash rusak ditolak.");

  // TEST 5: Password kosong ditolak.
  if (verify("", "pbkdf2_sha256$210000$")) {
    throw new Error(
      "FAIL 5: Password kosong diterima."
    );
  }

  console.log("PASS 5: Password kosong ditolak.");

  console.log(
    "=== ADMIN PASSWORD FORMAT TEST: 5/5 PASS ==="
  );

}






function testPBKDF2Compatibility() {

  const password = "password";

  const salt = Utilities
    .newBlob("salt")
    .getBytes()
    .map(byte => byte & 255);

  const expected =
    "120fb6cffcf8b32c43e7225256c4f837" +
    "a86548c92ccc35480805987cb70be17b";

  const actual = PasswordService.toHex(
    PasswordService.pbkdf2(
      password,
      salt,
      1,
      32
    )
  );

  if (actual !== expected) {
    throw new Error(
      "FAIL: PBKDF2 tidak sesuai test vector."
    );
  }

  console.log(
    "PASS: PBKDF2 sesuai test vector SHA256."
  );

}



function testAdminPasswordV2Verification() {

  const password = "TeachlyAdminTest2027!";

  // Membuat hash V2 untuk pengujian.
  const storedHash =
    PasswordService.hashPasswordV2(password);

  let passed = 0;

  function assertTest(condition, message) {

    if (!condition) {
      throw new Error("FAIL: " + message);
    }

    passed++;
    console.log("PASS " + passed + ": " + message);

  }

  // TEST 1: Password benar.
  assertTest(
    AdminAuthService.verifyAdminPassword(
      password,
      storedHash
    ) === true,
    "Password benar diterima."
  );

  // TEST 2: Password salah.
  assertTest(
    AdminAuthService.verifyAdminPassword(
      "PasswordSalah2027!",
      storedHash
    ) === false,
    "Password salah ditolak."
  );

  // TEST 3: Plaintext.
  assertTest(
    AdminAuthService.verifyAdminPassword(
      password,
      password
    ) === false,
    "Password plaintext ditolak."
  );

  // TEST 4: Password kosong.
  assertTest(
    AdminAuthService.verifyAdminPassword(
      "",
      storedHash
    ) === false,
    "Password kosong ditolak."
  );

  // TEST 5: Hash rusak.
  assertTest(
    AdminAuthService.verifyAdminPassword(
      password,
      "hmac_sha256_v2$invalid$invalid"
    ) === false,
    "Hash tidak valid ditolak."
  );

  // TEST 6: Hash PBKDF2 tidak diterima.
  const fakePBKDF2 = [
    "pbkdf2_sha256",
    "210000",
    "a".repeat(32),
    "b".repeat(64)
  ].join("$");

  assertTest(
    AdminAuthService.verifyAdminPassword(
      password,
      fakePBKDF2
    ) === false,
    "Format PBKDF2 ditolak."
  );

  // TEST 7: Hash V2 dimodifikasi.
  const parts = storedHash.split("$");

  const modifiedHash = [
    parts[0],
    parts[1],
    (parts[2][0] === "a" ? "b" : "a") +
      parts[2].slice(1)
  ].join("$");

  assertTest(
    AdminAuthService.verifyAdminPassword(
      password,
      modifiedHash
    ) === false,
    "Hash yang dimodifikasi ditolak."
  );

  console.log(
    "=== ADMIN PASSWORD V2 VERIFICATION: " +
    passed + "/7 PASS ==="
  );

}




function testAdminLoginV2RejectInvalid() {

  const username =
    "admin";

  const invalidPassword =
    "WrongPasswordTest2027!";

  let rejected = false;

  try {

    AdminAuthService.loginV2(
      username,
      invalidPassword
    );

  } catch (error) {

    rejected = true;

    console.log(
      "PASS: Login V2 menolak password tidak valid."
    );

  }

  if (!rejected) {
    throw new Error(
      "FAIL: Login V2 menerima password salah."
    );
  }

  console.log(
    "=== ADMIN LOGIN V2 NEGATIVE TEST: PASS ==="
  );

}




function testAdminLoginV2LimiterIntegration() {

  const username = "__teachly_login_integration_test__";
  const password = "WrongPasswordTest2027!";

  try {

    AdminLoginLimiter.clear(username);

    for (let i = 0; i < 5; i++) {

      try {
        AdminAuthService.loginV2(
          username,
          password
        );
      } catch (error) {
        // Kegagalan login memang diharapkan.
      }

    }

    const state =
      AdminLoginLimiter.getState(username);

    if (
      state.attempts !== 5 ||
      state.lockedUntil <= Date.now()
    ) {
      throw new Error(
        "FAIL: Lima kegagalan tidak menghasilkan lockout."
      );
    }

    console.log(
      "PASS 1: Lima kegagalan login tercatat."
    );

    let blocked = false;

    try {

      AdminAuthService.loginV2(
        username,
        password
      );

    } catch (error) {

      blocked = String(error.message)
        .includes("Terlalu banyak percobaan");

    }

    if (!blocked) {
      throw new Error(
        "FAIL: Login tidak diblokir setelah lockout."
      );
    }

    console.log(
      "PASS 2: Login diblokir setelah lima kegagalan."
    );

    console.log(
      "=== ADMIN LOGIN V2 LIMITER INTEGRATION: 2/2 PASS ==="
    );

  } finally {

    AdminLoginLimiter.clear(username);

  }

}



function testPenggunaRepositoryReadOnly() {

  const repository = PenggunaRepository;

  const data = repository.getAll();

  if (!Array.isArray(data)) {
    throw new Error(
      "FAIL: getAll() tidak menghasilkan array."
    );
  }

  console.log(
    "PASS 1: getAll() menghasilkan array."
  );

  const notFound = repository.findById(
    "__ID_TIDAK_ADA__"
  );

  if (notFound !== null) {
    throw new Error(
      "FAIL: findById() tidak mengembalikan null."
    );
  }

  console.log(
    "PASS 2: findById() menangani ID tidak ditemukan."
  );

  const row = repository.findRowById(
    "__ID_TIDAK_ADA__"
  );

  if (row !== -1) {
    throw new Error(
      "FAIL: findRowById() tidak mengembalikan -1."
    );
  }

  console.log(
    "PASS 3: findRowById() menangani ID tidak ditemukan."
  );

  const id = repository.generateId();

  if (!/^adm_\d+$/.test(id)) {
    throw new Error(
      "FAIL: Format ID pengguna tidak valid."
    );
  }

  console.log(
    "PASS 4: generateId() menghasilkan ID valid."
  );

  console.log(
    "=== PENGGUNA REPOSITORY: 4/4 PASS ==="
  );

}



function testPenggunaServiceValidation() {

  let passed = 0;

  function assert(condition, message) {
    if (!condition) {
      throw new Error("FAIL: " + message);
    }

    passed++;
    console.log("PASS " + passed + ": " + message);
  }

  assert(
    PenggunaService.normalizeUsername(
      "  ADMIN.TEST  "
    ) === "admin.test",
    "Normalisasi username."
  );

  assert(
    PenggunaService.validateRole(
      "admin_kurikulum"
    ) === "ADMIN_KURIKULUM",
    "Validasi role."
  );

  let invalidRoleRejected = false;

  try {
    PenggunaService.validateRole("SUPER_ADMIN");
  } catch (error) {
    invalidRoleRejected = true;
  }

  assert(
    invalidRoleRejected,
    "Role tidak dikenal ditolak."
  );

  let shortPasswordRejected = false;

  try {
    PenggunaService.validatePassword("12345");
  } catch (error) {
    shortPasswordRejected = true;
  }

  assert(
    shortPasswordRejected,
    "Password pendek ditolak."
  );

  const sanitized = PenggunaService.sanitize({
    ID_PENGGUNA: "adm_01",
    USERNAME: "admin",
    PASSWORD: "SECRET_HASH",
    NAMA_PENGGUNA: "Administrator",
    ROLE: "ADMIN",
    STATUS_AKUN: "AKTIF"
  });

  assert(
    !Object.prototype.hasOwnProperty.call(
      sanitized,
      "PASSWORD"
    ),
    "Password tidak masuk respons."
  );

  console.log(
    "=== PENGGUNA SERVICE VALIDATION: " +
    passed + "/5 PASS ==="
  );

}





function testPenggunaControllerRoutes() {

  const endpoints = [
    "pengguna.list",
    "pengguna.create",
    "pengguna.update",
    "pengguna.updateStatus",
    "pengguna.resetPassword"
  ];

  let passed = 0;

  endpoints.forEach(function(endpoint) {

    const handler = Router.routes[endpoint];

    if (typeof handler !== "function") {
      throw new Error(
        "FAIL: Endpoint tidak terdaftar: " +
        endpoint
      );
    }

    if (!Router.requiresAdminAuth(endpoint)) {
      throw new Error(
        "FAIL: Endpoint tidak terlindungi: " +
        endpoint
      );
    }

    passed++;

    console.log(
      "PASS " + passed + ": " +
      endpoint + " terdaftar dan diklasifikasikan terlindungi."
    );

  });

  if (Router.routes["pengguna.login"]) {
    throw new Error(
      "FAIL: Endpoint login plaintext lama masih terdaftar."
    );
  }

  console.log(
    "PASS: Endpoint pengguna.login lama tidak terdaftar."
  );

  console.log(
    "=== PENGGUNA CONTROLLER ROUTES: 6/6 PASS ==="
  );

}




