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

API.request = async function (endpoint, payload = {}) {
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
      "adminDashboard.",
      "adminKelas.",
      "adminKelompok.",
      "adminMapel.",
      "adminSesi.",
      "adminTahunAjaran.",
    ];

    const requiresAdminToken =
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

    const controller = new AbortController();

    const timeout = setTimeout(function () {
      controller.abort();
    }, CONFIG.API.TIMEOUT || 30000);

    let response;

    try {
      response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    /* =================================
       READ RESPONSE
    ================================= */

    const text = await response.text();

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
      throw new Error("Request timeout. Silakan coba kembali.");
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
