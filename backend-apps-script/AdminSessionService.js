
/* =========================================
   TEACHLY - ADMIN SESSION SERVICE
   Signed Session Token V1

   Backend: Google Apps Script
   Storage: ScriptProperties

   Tidak mengubah Router atau login lama.
========================================= */

const AdminSessionService = {

  VERSION: "AS1",

  SECRET_PROPERTY: "TEACHLY_ADMIN_SESSION_SECRET",

  SESSION_PREFIX: "TEACHLY_ADMIN_SESSION_",

  SESSION_DURATION_MS: 8 * 60 * 60 * 1000,

  MAX_TOKEN_LENGTH: 1024,

  /* =====================================
     SECRET
  ===================================== */

  getSecret() {
    const value = PropertiesService
      .getScriptProperties()
      .getProperty(this.SECRET_PROPERTY);

    if (
      !value ||
      !/^[0-9a-f]{64,}$/i.test(value) ||
      value.length % 2 !== 0
    ) {
      throw new Error(
        "Secret sesi Admin belum dikonfigurasi."
      );
    }

    return PasswordService.fromHex(value);
  },

  /* =====================================
     SIGN TOKEN
  ===================================== */

  sign(message) {
    const secret = this.getSecret();

    const bytes = Utilities
      .newBlob(message)
      .getBytes()
      .map(byte => byte & 255);

    const signature = PasswordService.hmac(
      bytes,
      secret
    );

    return PasswordService.toHex(signature);
  },

  /* =====================================
     VERIFY SIGNATURE
  ===================================== */

  verifySignature(message, signature) {
    if (!/^[0-9a-f]{64}$/i.test(signature)) {
      return false;
    }

    const expected = PasswordService.fromHex(
      this.sign(message)
    );

    const actual = PasswordService.fromHex(
      signature
    );

    return PasswordService.constantTimeEqual(
      expected,
      actual
    );
  },

  /* =====================================
     CREATE SESSION

     Hanya dipanggil setelah login berhasil.
  ===================================== */

  create(account) {
    const idPengguna = String(
      account?.ID_PENGGUNA || ""
    ).trim();

    if (!idPengguna) {
      throw new Error(
        "ID pengguna wajib tersedia."
      );
    }

    const now = Date.now();
    const expiresAt = now + this.SESSION_DURATION_MS;

    /*
     * UUID dipakai sebagai identifier sesi,
     * bukan sebagai satu-satunya pengaman token.
     * Integritas token dilindungi HMAC.
     */
    const sessionId = Utilities.getUuid();

    const message = [
      this.VERSION,
      sessionId,
      idPengguna,
      now,
      expiresAt
    ].join(".");

    const signature = this.sign(message);

    const token = message + "." + signature;

    const record = {
      idPengguna,
      createdAt: now,
      expiresAt,
      revoked: false
    };

    PropertiesService
      .getScriptProperties()
      .setProperty(
        this.SESSION_PREFIX + sessionId,
        JSON.stringify(record)
      );

    return {
      token,
      expiresAt: new Date(expiresAt).toISOString()
    };
  },

  /* =====================================
     VERIFY SESSION
  ===================================== */

  verify(token) {
    const rawToken = String(token || "").trim();

    if (
      !rawToken ||
      rawToken.length > this.MAX_TOKEN_LENGTH
    ) {
      return null;
    }

    const parts = rawToken.split(".");

    if (parts.length !== 6) {
      return null;
    }

    const [
      version,
      sessionId,
      idPengguna,
      createdAtText,
      expiresAtText,
      signature
    ] = parts;

    if (version !== this.VERSION) {
      return null;
    }

    if (
      !/^[0-9a-f-]{36}$/i.test(sessionId) ||
      !idPengguna ||
      !/^\d{13}$/.test(createdAtText) ||
      !/^\d{13}$/.test(expiresAtText)
    ) {
      return null;
    }

    const createdAt = Number(createdAtText);
    const expiresAt = Number(expiresAtText);

    if (
      !Number.isSafeInteger(createdAt) ||
      !Number.isSafeInteger(expiresAt) ||
      expiresAt <= createdAt ||
      expiresAt <= Date.now() ||
      createdAt > Date.now() ||
      expiresAt - createdAt > this.SESSION_DURATION_MS
    ) {
      return null;
    }

    const message = parts.slice(0, 5).join(".");

    if (!this.verifySignature(message, signature)) {
      return null;
    }

    const properties = PropertiesService
      .getScriptProperties();

    const key = this.SESSION_PREFIX + sessionId;

    const stored = properties.getProperty(key);

    if (!stored) {
      return null;
    }

    let record;

    try {
      record = JSON.parse(stored);
    } catch (_) {
      return null;
    }

    if (
      record.revoked === true ||
      record.idPengguna !== idPengguna ||
      record.createdAt !== createdAt ||
      record.expiresAt !== expiresAt
    ) {
      return null;
    }

    /*
     * Pemeriksaan akun terbaru.
     * Tidak mempercayai role dari token.
     */
    const account = AdminAuthRepository.findById(
      idPengguna
    );

    if (!account) {
      return null;
    }

    const status = String(
      account.STATUS_AKUN || ""
    ).trim().toUpperCase();

    if (status !== TEACHLY_STATUS.AKTIF) {
      return null;
    }

    const role = String(
      account.ROLE || ""
    ).trim().toUpperCase();

    if (
      ![
        "ADMIN",
        "ADMIN_KURIKULUM",
        "ADMIN_GURU_NGAJI"
      ].includes(role)
    ) {
      return null;
    }

    return {
      ID_PENGGUNA: account.ID_PENGGUNA,
      USERNAME: account.USERNAME,
      NAMA_PENGGUNA: account.NAMA_PENGGUNA,
      ROLE: role,
      STATUS_AKUN: status,
      SESSION_ID: sessionId,
      EXPIRES_AT: new Date(expiresAt).toISOString()
    };
  },

  /* =====================================
     REVOKE SESSION
  ===================================== */

  revoke(token) {
    const session = this.verify(token);

    if (!session) {
      return false;
    }

    const key = this.SESSION_PREFIX +
      session.SESSION_ID;

    const properties = PropertiesService
      .getScriptProperties();

    const stored = properties.getProperty(key);

    if (!stored) {
      return false;
    }

    const record = JSON.parse(stored);

    record.revoked = true;
    record.revokedAt = Date.now();

    properties.setProperty(
      key,
      JSON.stringify(record)
    );

    return true;
  }

};




function setupAdminSessionSecretOnce() {

  const props =
    PropertiesService.getScriptProperties();

  const key = "TEACHLY_ADMIN_SESSION_SECRET";

  // Jangan mengganti secret yang sudah ada.
  if (props.getProperty(key)) {
    console.log(
      "Secret sesi Admin sudah tersedia. Tidak diubah."
    );
    return;
  }

  const secret = Array.from(
    { length: 4 },
    () => Utilities.getUuid().replace(/-/g, "")
  ).join("");

  props.setProperty(key, secret);

  console.log(
    "Secret sesi Admin berhasil disimpan."
  );

}

