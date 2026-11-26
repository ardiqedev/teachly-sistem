
/* =========================================
   TEACHLY - ADMIN AUTH SERVICE
   Backend Authentication
   Authentication Source: Sheet PENGGUNA
========================================= */

const AdminAuthService = {




/**
 * Memverifikasi password Admin
 * menggunakan HMAC-SHA256 V2.
 *
 * Password plaintext dan PBKDF2 lama
 * tidak diterima oleh method ini.
 */
verifyAdminPassword(rawPassword, storedPassword) {

  const password = String(rawPassword ?? "");
  const stored = String(storedPassword ?? "").trim();

  if (!password || !stored) {
    return false;
  }

  // Hanya menerima hash V2.
  if (!PasswordService.isV2Hash(stored)) {
    return false;
  }

  // Validasi struktur hash.
  const parts = stored.split("$");

  if (
    parts.length !== 3 ||
    parts[0] !== "hmac_sha256_v2" ||
    !/^[0-9a-f]{32}$/i.test(parts[1]) ||
    !/^[0-9a-f]{64}$/i.test(parts[2])
  ) {
    return false;
  }

  // Verifikasi menggunakan pepper rahasia
  // dari Script Properties.
  return PasswordService.verifyV2(
    password,
    stored
  );

},



/**
 * Login Admin V2.
 *
 * Menggunakan password hash HMAC V2
 * dan membuat sesi server.
 *
 * Belum menggantikan login() lama.
 */
loginV2(username, password) {

  const normalizedUsername = String(
    username || ""
  ).trim().toLowerCase();

  const rawPassword = String(
    password || ""
  );

  if (!normalizedUsername || !rawPassword) {
    throw new Error(
      "Username dan password wajib diisi."
    );
  }

  AdminLoginLimiter.assertAllowed(
    normalizedUsername
  );

  const account =
    AdminAuthRepository.findByUsername(
      normalizedUsername
    );

  if (!account) {

    AdminLoginLimiter.recordFailure(
      normalizedUsername
    );

    throw new Error(
      "Username atau password tidak valid."
    );

  }

  const status = String(
    account.STATUS_AKUN || ""
  ).trim().toUpperCase();

  if (status !== TEACHLY_STATUS.AKTIF) {
    throw new Error(
      "Akun administrator tidak aktif."
    );
  }

  const role = String(
    account.ROLE || ""
  ).trim().toUpperCase();

  
  if (!AdminPermission.ROLES.includes(role)) {
    throw new Error(
      "Akun tidak memiliki hak akses administrator."
    );
  }


  const storedPassword = String(
    account.PASSWORD || ""
  );

  
  if (!this.verifyAdminPassword(
    rawPassword,
    storedPassword
  )) {

    AdminLoginLimiter.recordFailure(
      normalizedUsername
    );

    throw new Error(
      "Username atau password tidak valid."
    );

  }


  const session =
    AdminSessionService.create(account);

    AdminLoginLimiter.clear(
      normalizedUsername
    );

  AdminAuthRepository.updateLastLogin(
    account.ID_PENGGUNA
  );

  return {

    admin: {
      ID_PENGGUNA: account.ID_PENGGUNA,
      USERNAME: account.USERNAME,
      NAMA_PENGGUNA: account.NAMA_PENGGUNA,
      ROLE: role,
      STATUS_AKUN: status
    },

    sessionToken: session.token,

    expiresAt: session.expiresAt

  };

},




};
