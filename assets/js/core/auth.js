/* =========================================
   QEDEV AUTH ENGINE
   TEACHLY - SESI GURU
========================================= */

const Auth = {
  /* =====================================
     CONFIG
  ===================================== */

  config: {
    userKey: "user",
    guruKey: "guru",
    sessionKey: "session",
  },

  user: null,
  guru: null,
  session: null,
  initialized: false,

  /* =====================================
     INITIALIZE
  ===================================== */

  init() {
    if (this.initialized) return;

    try {
      this.user = Storage.get(this.config.userKey) || null;
      this.guru = Storage.get(this.config.guruKey) || null;
      this.session = Storage.get(this.config.sessionKey) || null;

      this.initialized = true;

      console.log("[Auth] Authentication initialized.");
    } catch (error) {
      console.error("[Auth] Initialization failed:", error);

      this.clearSession();
      this.initialized = true;
    }
  },

  /* =====================================
     LOGIN
  ===================================== */

  async login(nbm, password, newPassword) {
    const normalizedNBM = String(nbm || "").trim();

    if (!normalizedNBM) {
      return {
        success: false,
        message: "NBM wajib diisi.",
        data: null,
      };
    }

    try {
      const response = await API.post("auth.login", {
        nbm: normalizedNBM,
        password,
        ...(newPassword === undefined ? {} : { newPassword }),
      });

      if (!response || response.success !== true) {
        return (
          response || {
            success: false,
            message: "Login gagal.",
            data: null,
          }
        );
      }

      if (response.data?.mustChangePassword) return response;
      const user = response.data?.user;
      const guru = response.data?.guru;
      const session = response.data?.session;

      if (!user || !guru || !session?.token || session.expiresAt <= Date.now() ||
          !Number.isFinite(session.expiresAt)) {
        throw new Error("Sesi login guru belum tersedia. Periksa deployment Apps Script.");
      }

      this.setSession({
        user: user,
        guru: guru,
        session: session,
      });

      console.log("[Auth] Login successful.");

      return response;
    } catch (error) {
      console.error("[Auth] Login failed:", error);

      return {
        success: false,
        message: error.message || "Terjadi kesalahan saat login.",
        data: null,
      };
    }
  },

  /* =====================================
     SET SESSION
  ===================================== */

  setSession(data) {
    this.user = data.user || null;
    this.guru = data.guru || null;
    this.session = data.session || null;

    Storage.set(this.config.userKey, this.user);
    Storage.set(this.config.guruKey, this.guru);
    Storage.set(this.config.sessionKey, this.session);
  },

  /* =====================================
     LOGOUT
  ===================================== */

  logout() {
    this.clearSession();

    console.log("[Auth] Logout successful.");

    return true;
  },

  /* =====================================
     CLEAR SESSION
  ===================================== */

  clearSession() {
    this.user = null;
    this.guru = null;
    this.session = null;

    Storage.remove(this.config.userKey);
    Storage.remove(this.config.guruKey);
    Storage.remove(this.config.sessionKey);
  },

  /* =====================================
     CHECK AUTHENTICATION
  ===================================== */

  check() {
    return this.isLoggedIn();
  },

  isLoggedIn() {
    return Boolean(
      this.getToken() && this.user && this.guru,
    );
  },

  getToken() {
    return this.session?.expiresAt > Date.now() ? this.session.token || null : null;
  },

  /* =====================================
     USER
  ===================================== */

  getUser() {
    return this.user;
  },

  setUser(user) {
    this.user = user;
    Storage.set(this.config.userKey, user);
  },

  clearUser() {
    this.user = null;
    Storage.remove(this.config.userKey);
  },

  /* =====================================
     GURU
  ===================================== */

  getGuru() {
    return this.guru;
  },

  setGuru(guru) {
    this.guru = guru;
    Storage.set(this.config.guruKey, guru);
  },

  clearGuru() {
    this.guru = null;
    Storage.remove(this.config.guruKey);
  },

  /* =====================================
     DESTROY
  ===================================== */

  destroy() {
    this.clearSession();
    this.initialized = false;
  },
};
