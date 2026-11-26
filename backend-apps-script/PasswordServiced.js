
/* =========================================
   TEACHLY - PASSWORD SERVICE
   QEDEV BACKEND STANDARD

   PBKDF2-HMAC-SHA256
   Salt per akun
   Versioned password format
========================================= */

const PasswordService = {

  ALGORITHM: "pbkdf2_sha256",
  ITERATIONS: 210000,
  SALT_BYTES: 16,
  HASH_BYTES: 32,

  /* =====================================
     HASH PASSWORD
  ===================================== */

  hash(password) {
    const raw = String(password ?? "");

    if (!raw) {
      throw new Error("Password wajib diisi.");
    }

    const salt = this.generateSalt();

    const derivedKey = this.pbkdf2(
      raw,
      salt,
      this.ITERATIONS,
      this.HASH_BYTES
    );

    return [
      this.ALGORITHM,
      this.ITERATIONS,
      this.toHex(salt),
      this.toHex(derivedKey)
    ].join("$");
  },

  /* =====================================
     VERIFY PASSWORD
  ===================================== */

  verify(password, storedHash) {
    const raw = String(password ?? "");
    const stored = String(storedHash ?? "");

    if (!raw || !stored) return false;

    const parts = stored.split("$");

    if (parts.length !== 4) return false;
    if (parts[0] !== this.ALGORITHM) return false;

    const iterations = Number(parts[1]);

    if (
      !Number.isSafeInteger(iterations) ||
      iterations < 1 ||
      iterations > 1000000
    ) {
      return false;
    }

    const salt = this.fromHex(parts[2]);
    const expected = this.fromHex(parts[3]);

    if (
      salt.length !== this.SALT_BYTES ||
      expected.length !== this.HASH_BYTES
    ) {
      return false;
    }

    const actual = this.pbkdf2(
      raw,
      salt,
      iterations,
      expected.length
    );

    return this.constantTimeEqual(
      actual,
      expected
    );
  },

  /* =====================================
     GENERATE SALT
  ===================================== */

  generateSalt() {
    // UUID menyediakan nilai acak dari platform.
    // Digunakan sebagai sumber salt per akun.
    const uuid = Utilities.getUuid()
      .replace(/-/g, "");

    return this.fromHex(
      uuid.slice(0, this.SALT_BYTES * 2)
    );
  },

  /* =====================================
     PBKDF2-HMAC-SHA256
  ===================================== */

  pbkdf2(password, salt, iterations, keyLength) {
    const passwordBytes = Utilities
      .newBlob(password)
      .getBytes();

    const hashLength = 32;
    const blockCount = Math.ceil(
      keyLength / hashLength
    );

    const result = [];

    for (let block = 1; block <= blockCount; block++) {
      const blockIndex = [
        (block >>> 24) & 255,
        (block >>> 16) & 255,
        (block >>> 8) & 255,
        block & 255
      ];

      let u = this.hmac(
        salt.concat(blockIndex),
        passwordBytes
      );

      const t = u.slice();

      for (let i = 1; i < iterations; i++) {
        u = this.hmac(u, passwordBytes);

        for (let j = 0; j < hashLength; j++) {
          t[j] = (t[j] ^ u[j]) & 255;
        }
      }

      result.push(...t);
    }

    return result.slice(0, keyLength);
  },

  /* =====================================
     HMAC SHA256
  ===================================== */

  hmac(message, key) {
    return Utilities.computeHmacSha256Signature(
      message.map((byte) => byte > 127 ? byte - 256 : byte),
      key.map((byte) => byte > 127 ? byte - 256 : byte)
    ).map((byte) => byte & 255);
  },

  /* =====================================
     CONSTANT TIME COMPARISON
  ===================================== */

  constantTimeEqual(a, b) {
    if (a.length !== b.length) return false;

    let difference = 0;

    for (let i = 0; i < a.length; i++) {
      difference |= a[i] ^ b[i];
    }

    return difference === 0;
  },

  /* =====================================
     HEX HELPERS
  ===================================== */

  toHex(bytes) {
    return bytes
      .map((byte) =>
        (byte & 255)
          .toString(16)
          .padStart(2, "0")
      )
      .join("");
  },

  fromHex(hex) {
    const value = String(hex ?? "");

    if (
      value.length % 2 !== 0 ||
      !/^[0-9a-f]*$/i.test(value)
    ) {
      return [];
    }

    const bytes = [];

    for (let i = 0; i < value.length; i += 2) {
      bytes.push(
        parseInt(value.slice(i, i + 2), 16)
      );
    }

    return bytes;
  },


/* =========================================
   PASSWORD SERVICE V2
   HMAC-SHA256 + SERVER PEPPER

   Format:
   hmac_sha256_v2$<saltHex>$<macHex>

   Pepper disimpan di ScriptProperties.
========================================= */

V2_ALGORITHM: "hmac_sha256_v2",
V2_PEPPER_PROPERTY: "TEACHLY_PASSWORD_PEPPER_V2",

/* =====================================
   GENERATE V2 PEPPER
   Jalankan sekali saat setup.
========================================= */

setupV2Pepper() {
  const properties = PropertiesService
    .getScriptProperties();

  if (properties.getProperty(
    this.V2_PEPPER_PROPERTY
  )) {
    return false;
  }

  // Catatan: UUID Apps Script tidak memberikan
  // jaminan eksplisit sebagai CSPRNG.
  // Untuk produksi, gunakan secret acak
  // kriptografis yang dibuat di luar Apps Script.
  throw new Error(
    "Pepper belum tersedia. Buat secret acak " +
    "kriptografis minimal 32 byte, lalu simpan " +
    "secara manual di ScriptProperties dengan key " +
    this.V2_PEPPER_PROPERTY
  );
},

/* =====================================
   READ SERVER PEPPER
========================================= */

getV2Pepper() {
  const value = PropertiesService
    .getScriptProperties()
    .getProperty(this.V2_PEPPER_PROPERTY);

  if (!value) {
    throw new Error(
      "Password pepper V2 belum dikonfigurasi."
    );
  }

  // 32 byte = 64 karakter hex.
  if (!/^[0-9a-f]{64,}$/i.test(value) ||
      value.length % 2 !== 0) {
    throw new Error(
      "Format pepper V2 tidak valid."
    );
  }

  return this.fromHex(value);
},

/* =====================================
   HASH PASSWORD V2

   HMAC(
     key = pepper,
     message = salt || password
   )
========================================= */

hashV2(password, saltHex) {
  const raw = String(password ?? "");

  if (raw.length < 12) {
    throw new Error(
      "Password minimal 12 karakter."
    );
  }

  if (!saltHex) {
    throw new Error(
      "Salt kriptografis wajib disediakan."
    );
  }

  if (!/^[0-9a-f]{32}$/i.test(saltHex)) {
    throw new Error(
      "Salt harus berupa 16 byte hex."
    );
  }

  const pepper = this.getV2Pepper();
  const salt = this.fromHex(saltHex);

  const passwordBytes = Utilities
    .newBlob(raw)
    .getBytes()
    .map((byte) => byte & 255);

  // Pemisah domain untuk format V2.
  const prefix = Utilities
    .newBlob("TEACHLY_PASSWORD_V2")
    .getBytes()
    .map((byte) => byte & 255);

  const message = prefix
    .concat([0])
    .concat(salt)
    .concat([0])
    .concat(passwordBytes);

  const mac = this.hmac(message, pepper);

  return [
    this.V2_ALGORITHM,
    saltHex.toLowerCase(),
    this.toHex(mac)
  ].join("$");
},

/* =====================================
   VERIFY PASSWORD V2
========================================= */


verifyV2(password, storedHash) {

  const raw = String(password ?? "");
  const stored = String(storedHash ?? "");

  if (!raw || !stored) {
    return false;
  }

  const parts = stored.split("$");

  if (
    parts.length !== 3 ||
    parts[0] !== this.V2_ALGORITHM ||
    !/^[0-9a-f]{32}$/i.test(parts[1]) ||
    !/^[0-9a-f]{64}$/i.test(parts[2])
  ) {
    return false;
  }

  // Password baru minimal 12 karakter.
  // Input login yang lebih pendek ditolak
  // tanpa menyebabkan exception.
  if (raw.length < 12) {
    return false;
  }

  const actual = this.hashV2(
    raw,
    parts[1]
  );

  const actualMac = this.fromHex(
    actual.split("$")[2]
  );

  const expectedMac = this.fromHex(
    parts[2]
  );

  return this.constantTimeEqual(
    actualMac,
    expectedMac
  );

},


/* =====================================
   DETECT V2 HASH
========================================= */

isV2Hash(value) {
  return String(value ?? "")
    .startsWith(this.V2_ALGORITHM + "$");
},


/* =========================================
   PASSWORD SERVICE V2
   SALT DERIVATION

   Salt diturunkan menggunakan HMAC-SHA256
   dengan pepper rahasia aplikasi.

   Catatan:
   Identifier harus unik untuk setiap
   pembuatan hash password.
========================================= */

generateSaltV2() {
  const pepper = this.getV2Pepper();

  const identifier = Utilities.getUuid();

  const message = Utilities
    .newBlob(
      "TEACHLY_SALT_V2:" + identifier
    )
    .getBytes()
    .map(byte => byte & 255);

  const derived = this.hmac(message, pepper);

  // Ambil 16 byte pertama.
  return this.toHex(derived.slice(0, 16));
},

/* =========================================
   HASH PASSWORD OTOMATIS V2
========================================= */

hashPasswordV2(password) {
  const salt = this.generateSaltV2();

  return this.hashV2(password, salt);
}



};
