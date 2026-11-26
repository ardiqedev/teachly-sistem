/* =========================================
   QEDEV API
   TEACHLY - TOKENLESS VERSION
========================================= */

const API = {};

/* =====================================
   CONFIG
===================================== */

API.baseUrl = CONFIG.API.URL;

/* =====================================
   REQUEST
===================================== */

API.request = async function (endpoint, payload = {}, { admin = false } = {}) {
  try {
    if (!this.baseUrl) {
      throw new Error("URL API belum dikonfigurasi.");
    }

    const requestBody = {
      endpoint: endpoint,
      payload: payload,
    };

    /* =====================================
   ADMIN SESSION TOKEN
   Hanya untuk endpoint terlindungi
===================================== */

    const protectedAdminEndpoints = [
      "adminAuth.logout",
      "informasiSekolah.save",
      "pengguna.list",
      "pengguna.create",
      "pengguna.update",
      "pengguna.updateStatus",
      "pengguna.resetPassword",
    ];

    const protectedAdminPrefixes = [
      "admin.guru.",
      "admin.laporan.",
      "admin.absensi.",
      "adminDashboard.",
      "adminKelas.",
      "adminKelompok.",
      "adminMapel.",
      "adminSesi.",
      "adminTahunAjaran.",
    ];

    const requiresAdminToken =
      admin ||
      protectedAdminEndpoints.includes(endpoint) ||
      protectedAdminPrefixes.some(function (prefix) {
        return endpoint.startsWith(prefix);
      });

    if (requiresAdminToken) {
      const token =
        typeof AdminAuth !== "undefined" ? AdminAuth.getToken() : null;

      if (!token) {
        throw new Error(
          "Sesi administrator tidak tersedia. Silakan login kembali.",
        );
      }

      requestBody.sessionToken = token;
    }

    const requiresTeacherToken = endpoint === "dashboard.summary" || endpoint === "laporan.formOptions" ||
      endpoint === "laporan.absensiSiswa" ||
      /^laporan\.(create|getHistory|getDetail)KepalaSekolah$/.test(endpoint) ||
      /^laporan\.(create|getHistory|getDetail)Guru(Kelas|Mapel|Ngaji)$/.test(endpoint);
    if (requiresTeacherToken) {
      const token = typeof Auth !== "undefined" ? Auth.getToken() : null;
      if (!token) throw new Error("Sesi guru tidak tersedia. Silakan masuk kembali.");
      requestBody.sessionToken = token;
    }

    const controller = new AbortController();

    const timeout = setTimeout(function () {
      controller.abort();
    }, CONFIG.API.TIMEOUT || 30000);

    let response;
    let text;

    try {
      response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });
      text = await response.text();
    } finally {
      clearTimeout(timeout);
    }

    /* =================================
       READ RESPONSE
    ================================= */

    let result;

    try {
      result = JSON.parse(text);
    } catch (parseError) {
      console.error("[API] Invalid JSON response:", text);

      throw new Error(`Respons server tidak valid (${response.status}).`);
    }

    /* =================================
       HTTP ERROR
    ================================= */

    if (!response.ok) {
      throw new Error(result?.message || `Request gagal (${response.status}).`);
    }

    /* =================================
       VALIDATE RESPONSE
    ================================= */

    if (!result || typeof result.success !== "boolean") {
      throw new Error("Format respons server tidak valid.");
    }

    /*
     * Jangan throw ketika success === false.
     * Auth.login membutuhkan response.message
     * untuk menampilkan pesan kegagalan login.
     */

    return result;
  } catch (error) {
    if (error.name === "AbortError") {
      const timeoutError = new Error("Waktu tunggu server habis.");
      timeoutError.code = "API_TIMEOUT";
      throw timeoutError;
    }

    console.error("[API] Request error:", error);

    throw error;
  }
};

/* =====================================
   POST
===================================== */

API.post = function (endpoint, payload = {}) {
  return this.request(endpoint, payload);
};

API.postAdmin = function (endpoint, payload = {}) {
  return this.request(endpoint, payload, { admin: true });
};
