
const AdminLoginLimiter = {

  PREFIX: "TEACHLY_ADMIN_LOGIN_",

  MAX_ATTEMPTS: 5,

  WINDOW_MS: 15 * 60 * 1000,

  LOCK_MS: 15 * 60 * 1000,

  getKey(username) {

    const normalized = String(
      username || ""
    ).trim().toLowerCase();

    const digest = Utilities.computeDigest(
      Utilities.DigestAlgorithm.SHA_256,
      normalized
    );

    const hex = digest.map(function(byte) {
      return ("0" + (byte & 255).toString(16)).slice(-2);
    }).join("");

    return this.PREFIX + hex;

  },

  getState(username) {

    const key = this.getKey(username);

    const raw = PropertiesService
      .getScriptProperties()
      .getProperty(key);

    if (!raw) {
      return {
        attempts: 0,
        firstAttemptAt: 0,
        lockedUntil: 0
      };
    }

    try {
      return JSON.parse(raw);
    } catch (error) {
      throw new Error(
        "Status pembatasan login tidak dapat dibaca."
      );
    }

  },

  assertAllowed(username) {

    const state = this.getState(username);

    if (Date.now() < Number(state.lockedUntil || 0)) {
      throw new Error(
        "Terlalu banyak percobaan login. Coba lagi dalam 15 menit."
      );
    }

  },


recordFailure(username) {

  const lock = LockService.getScriptLock();

  if (!lock.tryLock(5000)) {
    throw new Error(
      "Sistem login sedang sibuk. Silakan coba lagi."
    );
  }

  try {

    const now = Date.now();
    const state = this.getState(username);

    if (
      !state.firstAttemptAt ||
      now - state.firstAttemptAt >= this.WINDOW_MS
    ) {
      state.attempts = 0;
      state.firstAttemptAt = now;
      state.lockedUntil = 0;
    }

    // Jangan memperpanjang lockout
    // akibat request yang datang saat terkunci.
    if (now < Number(state.lockedUntil || 0)) {
      return state;
    }

    state.attempts++;

    if (state.attempts >= this.MAX_ATTEMPTS) {
      state.lockedUntil = now + this.LOCK_MS;
    }

    PropertiesService
      .getScriptProperties()
      .setProperty(
        this.getKey(username),
        JSON.stringify(state)
      );

    return state;

  } finally {

    lock.releaseLock();

  }

},


  clear(username) {

    PropertiesService
      .getScriptProperties()
      .deleteProperty(
        this.getKey(username)
      );

  }

};
