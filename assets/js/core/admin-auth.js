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

      if (!this.isLoggedIn()) {
        this.clearSession();
      }

      this.initialized = true;

      console.log("[AdminAuth] Initialized V2.");
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
      const token = response.data?.sessionToken;
      const expiresAt = response.data?.expiresAt;

      if (
        !admin ||
        !admin.ID_PENGGUNA ||
        admin.ROLE !== "ADMIN" ||
        typeof token !== "string" ||
        !token ||
        !expiresAt ||
        !Number.isFinite(new Date(expiresAt).getTime())
      ) {
        throw new Error("Data sesi administrator tidak valid.");
      }

      const session = {
        token: token,
        expiresAt: expiresAt,
        loginAt: new Date().toISOString(),
      };

      this.setSession({
        user: admin,
        session: session,
      });

      console.log("[AdminAuth] Login V2 successful.");

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
    if (
      !this.user ||
      !this.user.ID_PENGGUNA ||
      this.user.ROLE !== "ADMIN" ||
      !this.session ||
      typeof this.session.token !== "string" ||
      !this.session.token
    ) {
      return false;
    }

    const expiresAt = new Date(this.session.expiresAt).getTime();

    if (!Number.isFinite(expiresAt) || Date.now() >= expiresAt) {
      return false;
    }

    return true;
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
   GET SESSION TOKEN
===================================== */

  getToken() {
    return this.isLoggedIn() ? this.session.token : null;
  },

  /* =====================================
     DESTROY
  ===================================== */

  destroy() {
    this.clearSession();
    this.initialized = false;
  },
};
