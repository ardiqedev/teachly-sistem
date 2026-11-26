const GuruCredentialService = {
  key(nbm) {
    return "TEACHLY_GURU_CREDENTIAL_" + nbm;
  },

  get(nbm) {
    const raw = PropertiesService.getScriptProperties().getProperty(this.key(nbm));
    return raw ? JSON.parse(raw) : null;
  },

  replaceTemporary(nbm, current, password) {
    if (typeof password !== "string" || password.length < 12 || password.length > 128) {
      throw new Error("Password baru harus terdiri dari 12–128 karakter.");
    }
    if (PasswordService.verifyV2(password, current.passwordHash)) {
      throw new Error("Password baru harus berbeda dari password sementara.");
    }
    const next = {
      passwordHash: PasswordService.hashPasswordV2(password),
      mustChangePassword: false,
      version: Utilities.getUuid(),
      updatedAt: new Date().toISOString(),
      updatedBy: nbm,
    };
    const lock = LockService.getScriptLock();
    lock.waitLock(5000);
    try {
      if (this.get(nbm)?.version !== current.version) {
        throw new Error("Password sudah berubah. Silakan masuk kembali.");
      }
      this.save(nbm, next);
      return next;
    } finally {
      lock.releaseLock();
    }
  },

  save(nbm, credential) {
    PropertiesService.getScriptProperties().setProperty(this.key(nbm), JSON.stringify(credential));
  },

  resetPassword(nbm, adminId) {
    const username = Utils.normalizeText(nbm);
    if (!Utils.validateNBM(username) || !GuruRepository.findByNBM(username)) {
      throw new Error("Akun guru tidak ditemukan.");
    }

    const password = PasswordService.generateSaltV2().slice(0, 24);
    const credential = {
      passwordHash: PasswordService.hashPasswordV2(password),
      mustChangePassword: true,
      version: Utilities.getUuid(),
      updatedAt: new Date().toISOString(),
      updatedBy: adminId,
    };

    const lock = LockService.getScriptLock();
    lock.waitLock(5000);
    try {
      this.save(username, credential);
    } finally {
      lock.releaseLock();
    }

    return { nbm: username, temporaryPassword: password };
  },
};
