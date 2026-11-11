/* =========================================
   QEDEV AUTH ENGINE
   TEACHLY - TOKENLESS VERSION
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

  async login(nbm) {
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

      const user = response.data?.user;
      const guru = response.data?.guru;

      if (!user || !guru) {
        throw new Error("Data profil pengguna tidak lengkap.");
      }

      const session = {
        authenticated: true,
        loginAt: new Date().toISOString(),
      };

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
      this.session &&
      this.session.authenticated === true &&
      this.user &&
      this.guru,
    );
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
