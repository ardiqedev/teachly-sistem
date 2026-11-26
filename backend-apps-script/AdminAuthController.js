
/* =========================================
   TEACHLY - ADMIN AUTH CONTROLLER
   Authentication Controller
========================================= */

const AdminAuthController = {

  
  /* =====================================
    LOGIN ADMIN V2
    POST adminAuth.login
  ===================================== */

  login(payload = {}) {

    try {

      const username = payload.username;
      const password = payload.password;

      const result = AdminAuthService.loginV2(
        username,
        password
      );

      return Response.success(
        {
          admin: result.admin,
          sessionToken: result.sessionToken,
          expiresAt: result.expiresAt
        },
        "Login administrator berhasil."
      );

    } catch (error) {

      return Response.unauthorized(
        error.message || "Login administrator gagal."
      );

    }

  },


/* =====================================
   LOGOUT ADMIN V2
   POST adminAuth.logout
===================================== */

logout(payload = {}) {

  try {

    const token = String(
      payload.sessionToken || ""
    ).trim();

    if (!token) {
      return Response.unauthorized(
        "Token sesi administrator tidak tersedia."
      );
    }

    const revoked = AdminSessionService.revoke(token);

    if (!revoked) {
      return Response.unauthorized(
        "Sesi administrator sudah tidak valid."
      );
    }

    return Response.success(
      { loggedOut: true },
      "Logout administrator berhasil."
    );

  } catch (error) {

    console.error(
      "[AdminAuthController] Logout failed:",
      error
    );

    return Response.error(
      "Gagal mengakhiri sesi administrator."
    );

  }

},


/* =====================================
   LOGOUT ADMIN V2
===================================== */

logout(payload = {}, admin = null) {

  try {

    if (!admin || !admin.SESSION_ID) {
      return Response.unauthorized(
        "Sesi administrator tidak valid."
      );
    }

    const token = String(
      payload.sessionToken || ""
    ).trim();

    if (!token) {
      return Response.unauthorized(
        "Token logout tidak tersedia."
      );
    }

    // Pastikan token payload milik sesi
    // yang telah diverifikasi oleh Router.
    const verifiedSession = AdminSessionService.verify(token);

    if (
      !verifiedSession ||
      verifiedSession.SESSION_ID !== admin.SESSION_ID
    ) {
      return Response.unauthorized(
        "Token logout tidak sesuai."
      );
    }

    const revoked = AdminSessionService.revoke(token);

    if (!revoked) {
      return Response.unauthorized(
        "Sesi administrator sudah tidak valid."
      );
    }

    return Response.success(
      { loggedOut: true },
      "Logout administrator berhasil."
    );

  } catch (error) {

    console.error(
      "[AdminAuthController] Logout failed:",
      error
    );

    return Response.error(
      "Gagal mengakhiri sesi administrator."
    );

  }

},




  
  /* =====================================
    REGISTER ROUTES
  ===================================== */

  registerRoutes() {

    Router.register(
      "adminAuth.login",
      this.login.bind(this)
    );

    Router.register(
      "adminAuth.logout",
      this.logout.bind(this)
    );

  }


};




/* =========================================
   REGISTER CONTROLLER
========================================= */

