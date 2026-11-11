/* =========================================
   TEACHLY - ADMIN AUTH ENGINE
   Separate Authentication | Tokenless
========================================= */

const AdminAuth = {
  config: {
    userKey: "admin_user",
    sessionKey: "admin_session",
  },

  user: null,
  session: null,
  initialized: false,

  /* =====================================
     INITIALIZE
  ===================================== */

  init() {
    if (this.initialized) return;

    try {
      this.user = Storage.get(this.config.userKey) || null;
      this.session = Storage.get(this.config.sessionKey) || null;

      this.initialized = true;

      console.log("[AdminAuth] Initialized.");
    } catch (error) {
      console.error("[AdminAuth] Initialization failed:", error);
      this.clearSession();
      this.initialized = true;
    }
  },

  /* =====================================
     LOGIN
  ===================================== */

  async login(username, password) {
    const normalizedUsername = String(username || "").trim();
    const normalizedPassword = String(password || "");

    if (!normalizedUsername || !normalizedPassword) {
      return {
        success: false,
        message: "Username dan password wajib diisi.",
        data: null,
      };
    }

    try {
      const response = await API.post("adminAuth.login", {
        username: normalizedUsername,
        password: normalizedPassword,
      });

      if (!response || response.success !== true) {
        return (
          response || {
            success: false,
            message: "Login admin gagal.",
            data: null,
          }
        );
      }

      const admin = response.data?.admin;

      if (!admin || !admin.ID_PENGGUNA || !admin.ROLE) {
        throw new Error("Data akun administrator tidak lengkap.");
      }

      const session = {
        authenticated: true,
        loginAt: new Date().toISOString(),
      };

      this.setSession({
        user: admin,
        session: session,
      });

      console.log("[AdminAuth] Login successful.");

      return response;
    } catch (error) {
      console.error("[AdminAuth] Login failed:", error);

      return {
        success: false,
        message: error.message || "Terjadi kesalahan saat login admin.",
        data: null,
      };
    }
  },

  /* =====================================
     SET SESSION
  ===================================== */

  setSession(data) {
    this.user = data.user || null;
    this.session = data.session || null;

    Storage.set(this.config.userKey, this.user);
    Storage.set(this.config.sessionKey, this.session);
  },

  /* =====================================
     LOGOUT
  ===================================== */

  logout() {
    this.clearSession();

    console.log("[AdminAuth] Logout successful.");

    return true;
  },

  /* =====================================
     CLEAR SESSION
  ===================================== */

  clearSession() {
    this.user = null;
    this.session = null;

    Storage.remove(this.config.userKey);
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
      this.user.ID_PENGGUNA,
    );
  },

  /* =====================================
     GET USER
  ===================================== */

  getUser() {
    return this.user;
  },

  getRole() {
    return this.user?.ROLE || null;
  },

  /* =====================================
     DESTROY
  ===================================== */

  destroy() {
    this.clearSession();
    this.initialized = false;
  },
};
