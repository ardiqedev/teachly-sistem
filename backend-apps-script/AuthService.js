
const AuthService = {

  /**
   * Memproses login guru menggunakan NBM.
   */
  getActiveTeacher(nbm) {
    // 1. Validasi NBM
    const normalizedNBM = String(nbm || "").trim();

    if (!normalizedNBM) {
      throw new Error("NBM wajib diisi.");
    }

    if (!Utils.validateNBM(normalizedNBM)) {
      throw new Error("Format NBM tidak valid.");
    }

    // 2. Cari akun berdasarkan NBM
    const account = AuthRepository.findByNBM(normalizedNBM);

    if (!account) {
      throw new Error("NBM tidak terdaftar.");
    }

    // 3. Periksa status akun
    const status = String(account.STATUS_AKUN || "")
      .trim()
      .toUpperCase();

    if (status !== TEACHLY_STATUS.AKTIF) {
      throw new Error("Akun Anda sedang nonaktif. Silakan hubungi administrator.");
    }

    // 4. Ambil profil guru
    return {
      NBM: String(account.NBM),
      NAMA_GURU: account.NAMA_GURU,
      STATUS_AKUN: status,
      IS_KEPALA_SEKOLAH: normalizedNBM === Utils.normalizeText(
        PropertiesService.getScriptProperties().getProperty("TEACHLY_KEPALA_SEKOLAH_NBM")
      )
    };
  },

  login({ nbm, password, newPassword }) {
    const username = Utils.normalizeText(nbm);
    if (!Utils.validateNBM(username) || username.length > 64 ||
        typeof password !== "string" || !password || password.length > 128) {
      throw new Error("NBM dan password wajib diisi dengan benar.");
    }

    const limiter = { ...AdminLoginLimiter, PREFIX: "TEACHLY_GURU_LOGIN_" };
    limiter.assertAllowed(username);
    let credential = GuruCredentialService.get(username);
    if (!credential || !PasswordService.verifyV2(password, credential.passwordHash)) {
      limiter.recordFailure(username);
      throw new Error("NBM atau password salah. Hubungi admin jika belum menerima password.");
    }

    const guru = this.getActiveTeacher(username);
    limiter.clear(username);
    if (credential.mustChangePassword) {
      if (newPassword === undefined) return { mustChangePassword: true };
      credential = GuruCredentialService.replaceTemporary(username, credential, newPassword);
    } else if (newPassword !== undefined) {
      throw new Error("Password sementara sudah tidak berlaku. Silakan masuk kembali.");
    }

    const expiresAt = Date.now() + 8 * 60 * 60 * 1000;
    const message = ["GURU1", guru.NBM, credential.version, expiresAt].join(".");
    const token = message + "." + AdminSessionService.sign(message);
    return { user: guru, guru, session: { token, expiresAt } };
  },

  verifySession(token) {
    const parts = String(token || "").split(".");
    if (parts.length !== 5 || parts[0] !== "GURU1" ||
        !/^\d{13}$/.test(parts[3]) || Number(parts[3]) <= Date.now() ||
        !Utils.validateNBM(parts[1])) return null;
    if (!AdminSessionService.verifySignature(parts.slice(0, 4).join("."), parts[4])) return null;

    const credential = GuruCredentialService.get(parts[1]);
    if (!credential || credential.mustChangePassword || credential.version !== parts[2]) return null;
    try {
      return this.getActiveTeacher(parts[1]);
    } catch {
      return null;
    }
  },

};
