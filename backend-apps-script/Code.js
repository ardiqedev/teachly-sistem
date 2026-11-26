
/**
 * ============================================================
 * TEACHLY - APPLICATION ENTRY POINT
 * QEDEV BACKEND STANDARD
 * ============================================================
 *
 * Tanggung jawab:
 * 1. Menjadi pintu masuk aplikasi Google Apps Script.
 * 2. Menangani HTTP GET.
 * 3. Menangani HTTP POST.
 * 4. Mengirim response JSON.
 * 5. Mendukung JSONP untuk ARE_D+QEDEV Framework.
 *
 * ============================================================
 */


/**
 * ============================================================
 * HTTP GET
 * ============================================================
 *
 * Digunakan untuk:
 * - Request data.
 * - Mengambil dropdown.
 * - Mendukung JSONP.
 *
 * ============================================================
 */

function doGet(e) {

  try {

    const response = Router.handleGet(e);

    const params = e && e.parameter
      ? e.parameter
      : {};

    const callback = params.callback;

    // Jika request menggunakan JSONP
    if (callback) {

      // Validasi nama callback untuk mencegah injeksi kode
      const isValidCallback =
        /^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(callback);

      if (!isValidCallback) {
        return Response.output(
          Response.validation(
            "Nama callback tidak valid."
          )
        );
      }

      return ContentService
        .createTextOutput(
          callback + "(" +
          Response.toJSON(response) +
          ");"
        )
        .setMimeType(
          ContentService.MimeType.JAVASCRIPT
        );

    }

    // Request GET biasa
    return Response.output(response);

  } catch (error) {

    Utils.logError("Code.gs doGet", error);

    return Response.output(
      Response.error(
        TEACHLY_CONFIG.DEBUG
          ? Utils.getErrorMessage(error)
          : "Terjadi kesalahan pada server."
      )
    );

  }

}


/**
 * ============================================================
 * HTTP POST
 * ============================================================
 *
 * Digunakan untuk:
 * - Menyimpan data.
 * - Memperbarui data.
 * - Menjalankan proses backend.
 *
 * ============================================================
 */

function doPost(e) {

  try {

    const response = Router.handlePost(e);

    return Response.output(response);

  } catch (error) {

    Utils.logError("Code.gs doPost", error);

    return Response.output(
      Response.error(
        TEACHLY_CONFIG.DEBUG
          ? Utils.getErrorMessage(error)
          : "Terjadi kesalahan pada server."
      )
    );

  }

}


/**
 * ============================================================
 * APPLICATION INFORMATION
 * ============================================================
 */

function getAppInfo() {

  return {
    app: TEACHLY_CONFIG.APP_NAME,
    version: TEACHLY_CONFIG.APP_VERSION,
    apiVersion: TEACHLY_CONFIG.API_VERSION,
    status: "READY"
  };

}


function testEntryPoint() {

  const response = doGet({
    parameter: {
      endpoint: "app.info"
    }
  });

  console.log(
    response.getContent()
  );

}
