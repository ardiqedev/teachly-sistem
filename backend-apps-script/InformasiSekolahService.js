
/* =========================================
   TEACHLY - INFORMASI SEKOLAH SERVICE
   QEDEV BACKEND STANDARD
========================================= */

const InformasiSekolahService = {

  /* =====================================
     VALIDATE SUMBER INFORMASI
  ===================================== */

  validateSource(source) {
    const value = String(source ?? "")
      .trim()
      .toUpperCase();

    const allowedSources = [
      "KURIKULUM",
      "GURU_NGAJI",
      "KEPALA_SEKOLAH"
    ];

    if (!allowedSources.includes(value)) {
      throw new Error(
        "Pilih sumber informasi yang valid."
      );
    }

    return value;
  },

  /* =====================================
     NORMALIZE TEXT
     MEMPERTAHANKAN ENTER
  ===================================== */

  normalizeText(value) {
    return String(value ?? "")
      .replace(/\r\n?/g, "\n");
  },

  /* =====================================
     GET ALL INFORMATION
     UNTUK ADMIN DAN HALAMAN GURU
  ===================================== */

  getAll() {
    const record = InformasiSekolahRepository.getAll();

    return Object.fromEntries(
      ["KURIKULUM", "GURU_NGAJI", "KEPALA_SEKOLAH"].map(source => [
        source, InformasiSekolahRepository.mapSource(source, record)
      ])
    );
  },

  /* =====================================
     GET INFORMATION BY SOURCE
     UNTUK AUTO-FILL FORM
  ===================================== */

  getBySource(source) {
    const sumber = this.validateSource(source);

    return InformasiSekolahRepository.getBySource(
      sumber
    );
  },

  /* =====================================
     VALIDATE FORM DATA
  ===================================== */

  validateData(data) {
    if (
      !data ||
      typeof data !== "object" ||
      Array.isArray(data)
    ) {
      throw new Error(
        "Data informasi sekolah tidak valid."
      );
    }

    const sumber = this.validateSource(
      data.SUMBER_INFORMASI
    );

    const nama = this.normalizeText(
      data.NAMA_INFORMASI
    ).trim();

    const detail = this.normalizeText(
      data.DETAIL_INFORMASI
    ).trim();

    if (!nama) {
      throw new Error(
        "Nama informasi wajib diisi."
      );
    }

    if (!detail) {
      throw new Error(
        "Detail informasi wajib diisi."
      );
    }

    if (nama.length > 150) {
      throw new Error(
        "Nama informasi maksimal 150 karakter."
      );
    }

    // Batas aman isi satu sel Google Sheets.
    if (detail.length > 45000) {
      throw new Error(
        "Detail informasi maksimal 45.000 karakter."
      );
    }

    return {
      SUMBER_INFORMASI: sumber,
      NAMA_INFORMASI: nama,
      DETAIL_INFORMASI: detail
    };
  },

  /* =====================================
     SAVE INFORMATION
     AUTO UPDATE RECORD INF001
  ===================================== */

  save(data, updatedBy = "ADMIN") {
    const validated = this.validateData(data);

    const actor = String(updatedBy ?? "")
      .trim() || "ADMIN";

    const lock = LockService.getScriptLock();

    try {
      lock.waitLock(10000);

      // Pastikan record INF001 tersedia.
      InformasiSekolahRepository.getRecord();

      // Tanggal dibuat oleh server, bukan frontend.
      const now = new Date();

      const result =
        InformasiSekolahRepository.updateBySource(
          validated.SUMBER_INFORMASI,
          {
            NAMA_INFORMASI:
              validated.NAMA_INFORMASI,

            DETAIL_INFORMASI:
              validated.DETAIL_INFORMASI,

            TANGGAL_INFORMASI: now,

            UPDATED_BY: actor
          }
        );

      SpreadsheetApp.flush();

      return result;

    } finally {
      if (lock.hasLock()) {
        lock.releaseLock();
      }
    }
  }

};
