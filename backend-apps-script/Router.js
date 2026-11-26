
/**
 * ============================================================
 * TEACHLY - API ROUTER
 * QEDEV BACKEND STANDARD
 * ============================================================
 *
 * Tanggung jawab:
 * 1. Menerima request API.
 * 2. Mengidentifikasi endpoint.
 * 3. Mengarahkan request ke Controller.
 * 4. Menangani error secara terpusat.
 *
 * ============================================================
 */

const Router = {

  /**
   * Registry endpoint API.
   */
  routes: {},
  routesInitialized: false,

  initializeRoutes() {
    if (this.routesInitialized) return;

    const controllers = [
      AdminAuthController,
      AdminGuruController,
      AdminKelasController,
      AdminKelompokController,
      AdminLaporanController,
      AdminMapelController,
      AdminSesiController,
      AdminTahunAjaranController,
      AppController,
      AuthController,
      DashboardController,
      DropdownController,
      GuruController,
      InformasiSekolahController,
      KelasController,
      KelompokNgajiController,
      LaporanController,
      LaporanFormOptionsController,
      MataPelajaranController,
      PenggunaController,
      SesiNgajiController,
      TahunAjaranController,
    ];

    controllers.forEach(controller => controller.registerRoutes());
    this.routesInitialized = true;
  },


  /* =====================================
    ADMIN ROUTE SECURITY
  ===================================== */

  adminSecurity: {

    // Jangan aktifkan sebelum frontend
    // sudah mengirim token sesi.
    enabled: true,

    protectedPrefixes: [
      "admin.guru.",
      "admin.laporan.",
      "admin.absensi.",
      "adminDashboard.",
      "adminKelas.",
      "adminKelompok.",
      "adminMapel.",
      "adminSesi.",
      "adminTahunAjaran."
    ],

    
    protectedEndpoints: [
       "adminAuth.logout",

      "informasiSekolah.list",
      "informasiSekolah.detail",
      "informasiSekolah.save",

      // CRUD PENGGUNA - ADMIN ONLY
      "pengguna.list",
      "pengguna.create",
      "pengguna.update",
      "pengguna.updateStatus",
      "pengguna.resetPassword"
    ],


    publicEndpoints: [
      "adminAuth.login"
    ]

  },



  /**
   * Mendaftarkan endpoint.
   *
   * Contoh:
   * Router.register("masterData.formOptions", handler);
   */
  register(endpoint, handler) {

    const path = Utils.normalizeText(endpoint);

    if (!path) {
      throw new Error("Endpoint wajib diisi.");
    }

    if (typeof handler !== "function") {
      throw new Error("Handler endpoint harus berupa function.");
    }

    if (this.routes[path]) {
      throw new Error("Endpoint sudah terdaftar: " + path);
    }

    this.routes[path] = handler;

  },



/**
 * Memeriksa apakah endpoint memerlukan
 * autentikasi Admin.
 */

requiresAdminAuth(endpoint) {

  const path = String(endpoint || "").trim();

  const config = this.adminSecurity;

  if (config.publicEndpoints.includes(path)) {
    return false;
  }

  if (config.protectedEndpoints.includes(path)) {
    return true;
  }

  return config.protectedPrefixes.some(
    function(prefix) {
      return path.startsWith(prefix);
    }
  );

},


/**
 * Memvalidasi token dan hak akses Admin.
 *
 * Return:
 * - null jika endpoint tidak dilindungi
 * - profil Admin jika valid
 * - throw Error jika tidak valid
 */

authorizeAdmin(endpoint, sessionToken) {

  if (!this.requiresAdminAuth(endpoint)) {
    return null;
  }

  if (!this.adminSecurity.enabled) {
    throw new Error(
      "Proteksi administrator belum diaktifkan."
    );
  }

  const token = String(
    sessionToken || ""
  ).trim();

  if (!token) {
    throw new Error(
      "Sesi administrator diperlukan."
    );
  }

  const admin = AdminSessionService.verify(
    token
  );

  if (!admin) {
    throw new Error(
      "Sesi administrator tidak valid atau telah berakhir."
    );
  }

  // RBAC - pemeriksaan hak akses
  if (!AdminPermission.canAccess(
    admin.ROLE,
    endpoint
  )) {
    throw new Error(
      "Anda tidak memiliki izin untuk mengakses fitur ini."
    );
  }

  return admin;

},


  


  /**
   * Menjalankan endpoint API.
   */
  dispatch(endpoint, payload = {}, sessionToken = "") {

    try {
      this.initializeRoutes();

      const path = Utils.normalizeText(endpoint);

      if (!path) {
        return Response.validation(
          "Endpoint wajib diisi."
        );
      }

      const handler = this.routes[path];

      if (!handler) {
        return Response.notFound(
          "Endpoint tidak ditemukan: " + path
        );
      }




      /* =====================================
        ADMIN AUTHORIZATION
      ===================================== */
      let verifiedAdmin = null;

      if (this.requiresAdminAuth(path)) {

        if (!this.adminSecurity.enabled) {
          return Response.unauthorized(
            "Proteksi administrator belum diaktifkan."
          );
        }

        try {

          verifiedAdmin = this.authorizeAdmin(
            path,
            sessionToken
          );

        } catch (error) {

          return Response.unauthorized(
            Utils.getErrorMessage(error)
          );

        }

      }




      const teacherEndpoint = path === "dashboard.summary" || path === "laporan.formOptions" ||
        path === "laporan.absensiSiswa" ||
        /^laporan\.(create|getHistory|getDetail)KepalaSekolah$/.test(path) ||
        /^laporan\.(create|getHistory|getDetail)Guru(Kelas|Mapel|Ngaji)$/.test(path);
      if (teacherEndpoint) {
        const guru = AuthService.verifySession(sessionToken);
        if (!guru) return Response.unauthorized("Sesi guru tidak valid. Silakan masuk kembali.");
        if (path.endsWith("KepalaSekolah") && !guru.IS_KEPALA_SEKOLAH) {
          return Response.unauthorized("Laporan ini hanya tersedia untuk Kepala Sekolah.");
        }
        if ([payload.NBM, payload.nbm].some(value =>
          value != null && Utils.normalizeText(value) !== guru.NBM
        )) {
          return Response.unauthorized("Sesi guru tidak sesuai dengan NBM laporan.");
        }
        payload = { ...payload, NBM: guru.NBM, nbm: guru.NBM, IS_KEPALA_SEKOLAH: guru.IS_KEPALA_SEKOLAH };
      }

      const result = handler(payload, verifiedAdmin);

      // Jika handler sudah mengembalikan response standar.
      if (
        result &&
        typeof result === "object" &&
        typeof result.success === "boolean"
      ) {
        return result;
      }

      return Response.success(
        result,
        "Request berhasil."
      );

    } catch (error) {

      Utils.logError("Router.dispatch", error);

      return Response.error(
        TEACHLY_CONFIG.DEBUG
          ? Utils.getErrorMessage(error)
          : "Terjadi kesalahan pada server."
      );

    }

  },


  /**
   * Menangani request GET.
   */
  handleGet(e) {

    const params = e && e.parameter
      ? e.parameter
      : {};

    const endpoint = params.endpoint;

    const payload = {
      ...params
    };

    delete payload.endpoint;


    if (this.requiresAdminAuth(endpoint)) {
      return Response.unauthorized(
        "Endpoint administrator hanya menerima POST."
      );
    }


    return this.dispatch(endpoint, payload);

  },


  /**
   * Menangani request POST.
   */
  handlePost(e) {

    try {

      if (!e || !e.postData || !e.postData.contents) {
        return Response.validation(
          "Request body tidak ditemukan."
        );
      }

      const body = JSON.parse(
        e.postData.contents
      );

      if (!body || typeof body !== "object" || Array.isArray(body)) {
        return Response.validation(
          "Format request body tidak valid."
        );
      }

      const endpoint = body.endpoint;

      const payload = body.payload || {};

      const sessionToken = String(
        body.sessionToken || ""
      ).trim();

      if (
        typeof payload !== "object" ||
        payload === null ||
        Array.isArray(payload)
      ) {
        return Response.validation(
          "Payload harus berupa object."
        );
      }

      return this.dispatch(
        endpoint,
        payload,
        sessionToken
      );

    } catch (error) {

      Utils.logError("Router.handlePost", error);

      return Response.error(
        TEACHLY_CONFIG.DEBUG
          ? Utils.getErrorMessage(error)
          : "Request tidak dapat diproses."
      );

    }

  }

  

};
