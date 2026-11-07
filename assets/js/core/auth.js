/* =========================================
   TEACHLY - QEDEV AUTH
========================================= */

const Auth = {};

/* =====================================
   CONFIG
===================================== */

Auth.config = {
  tokenKey: "token",
  userKey: "user",
  guruKey: "guru",
  sessionKey: "session",
  expiresKey: "session_expires_at",
};

/* =====================================
   INIT
===================================== */

Auth.init = function () {
  const token = Storage.get(this.config.tokenKey);
  const user = Storage.get(this.config.userKey);
  const guru = Storage.get(this.config.guruKey);
  const session = Storage.get(this.config.sessionKey);
  const expiresAt = Storage.get(this.config.expiresKey);

  if (token) State.set("token", token);
  if (user) State.set("user", user);
  if (guru) State.set("guru", guru);
  if (session) State.set("session", session);
  if (expiresAt) State.set("sessionExpiresAt", expiresAt);

  // Periksa masa berlaku session lokal.
  if (token && expiresAt) {
    if (new Date(expiresAt).getTime() <= Date.now()) {
      this.destroy();
    }
  }
};

/* =====================================
   LOGIN
===================================== */

Auth.login = async function (username, password) {
  try {
    const response = await API.post("auth.login", {
      username: String(username || "").trim(),
      password: String(password || ""),
    });

    if (!response || !response.success) {
      return (
        response || {
          success: false,
          message: "Respons server tidak valid.",
        }
      );
    }

    const data = response.data || {};
    const session = data.session || {};
    const token = session.token;

    if (!token || !data.user) {
      return {
        success: false,
        message: "Data session dari server tidak lengkap.",
      };
    }

    // Simpan seluruh informasi session.
    this.setSession({
      token: token,
      user: data.user,
      guru: data.guru || null,
      session: session,
      expiresAt: session.expiresAt || null,
    });

    return response;
  } catch (error) {
    console.error("[Auth] Login gagal:", error);

    return {
      success: false,
      message: error.message || "Gagal menghubungi server.",
    };
  }
};

/* =====================================
   SET SESSION
===================================== */

Auth.setSession = function (data) {
  this.setToken(data.token);
  this.setUser(data.user);
  this.setGuru(data.guru);
  this.setSessionInfo(data.session);
  this.setExpiresAt(data.expiresAt);
};

/* =====================================
   LOGOUT
===================================== */

Auth.logout = async function () {
  const token = this.getToken();

  try {
    if (token) {
      await API.post("auth.logout", { token });
    }
  } catch (error) {
    console.error("[Auth] Logout server gagal:", error);
  } finally {
    this.destroy();
  }

  return {
    success: true,
    message: "Session lokal telah diakhiri.",
  };
};

/* =====================================
   CHECK SESSION
===================================== */

Auth.check = function () {
  return this.isLoggedIn();
};

/* =====================================
   IS LOGGED IN
===================================== */

Auth.isLoggedIn = function () {
  const token = this.getToken();

  if (!token) return false;

  const expiresAt = State.get("sessionExpiresAt");

  if (expiresAt && new Date(expiresAt).getTime() <= Date.now()) {
    this.destroy();
    return false;
  }

  return true;
};

/* =====================================
   USER
===================================== */

Auth.user = function () {
  return State.get("user");
};

Auth.setUser = function (user) {
  Storage.set(this.config.userKey, user);
  State.set("user", user);
};

Auth.clearUser = function () {
  Storage.remove(this.config.userKey);
  State.remove("user");
};

/* =====================================
   GURU
===================================== */

Auth.guru = function () {
  return State.get("guru");
};

Auth.setGuru = function (guru) {
  if (guru) {
    Storage.set(this.config.guruKey, guru);
    State.set("guru", guru);
  } else {
    this.clearGuru();
  }
};

Auth.clearGuru = function () {
  Storage.remove(this.config.guruKey);
  State.remove("guru");
};

/* =====================================
   TOKEN
===================================== */

Auth.getToken = function () {
  return State.get("token");
};

Auth.setToken = function (token) {
  Storage.set(this.config.tokenKey, token);
  State.set("token", token);
};

Auth.clearToken = function () {
  Storage.remove(this.config.tokenKey);
  State.remove("token");
};

/* =====================================
   SESSION INFO
===================================== */

Auth.setSessionInfo = function (session) {
  Storage.set(this.config.sessionKey, session);
  State.set("session", session);
};

Auth.setExpiresAt = function (expiresAt) {
  if (expiresAt) {
    Storage.set(this.config.expiresKey, expiresAt);
    State.set("sessionExpiresAt", expiresAt);
  } else {
    Storage.remove(this.config.expiresKey);
    State.remove("sessionExpiresAt");
  }
};

/* =====================================
   DESTROY SESSION
===================================== */

Auth.destroy = function () {
  this.clearToken();
  this.clearUser();
  this.clearGuru();

  Storage.remove(this.config.sessionKey);
  Storage.remove(this.config.expiresKey);

  State.remove("session");
  State.remove("sessionExpiresAt");
};
