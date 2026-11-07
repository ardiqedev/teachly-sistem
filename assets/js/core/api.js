/* =========================================
   QEDEV API
========================================= */

const API = {};

/* =====================================
   CONFIG
===================================== */

API.baseUrl = CONFIG.API.URL;

/* =====================================
   REQUEST
===================================== */

API.request = async function (action, data = {}) {
  try {
    const token =
      typeof Auth !== "undefined" && Auth.getToken ? Auth.getToken() || "" : "";

    /*
     * Format sesuai Request.gs
     */
    const payload = new URLSearchParams({
      action: action,
      token: token,
      params: JSON.stringify(data),
    });

    const controller = new AbortController();

    const timeout = setTimeout(function () {
      controller.abort();
    }, CONFIG.API.TIMEOUT || 30000);

    let response;

    try {
      response = await fetch(this.baseUrl, {
        method: "POST",
        body: payload,
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

      throw new Error(
        `Server mengembalikan response tidak valid (${response.status}).`,
      );
    }

    /* =================================
       HTTP ERROR
    ================================= */

    if (!response.ok) {
      throw new Error(result?.message || `Request gagal (${response.status}).`);
    }

    /* =================================
       APPLICATION ERROR
    ================================= */

    if (result.success === false) {
      throw new Error(result.message || "Request gagal.");
    }

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

API.post = function (action, data = {}) {
  return this.request(action, data);
};
