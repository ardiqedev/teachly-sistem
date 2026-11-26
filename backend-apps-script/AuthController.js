
const AuthController = {

  /**
   * Endpoint login guru menggunakan NBM.
   * POST auth.login
   */
  login(payload = {}) {
    try {
      const data = AuthService.login(payload);

      return Response.success(
        data,
        data.mustChangePassword ? "Buat password baru untuk melanjutkan." : "Login berhasil."
      );

    } catch (error) {
      return Response.unauthorized(
        error.message || "Login gagal."
      );
    }
  },

  /**
   * Mendaftarkan endpoint autentikasi.
   */
  registerRoutes() {
    Router.register(
      "auth.login",
      this.login.bind(this)
    );
  }

};

// Registrasi route autentikasi
