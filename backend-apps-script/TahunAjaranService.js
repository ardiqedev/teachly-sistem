
/* =========================================
   TEACHLY - TAHUN AJARAN SERVICE
========================================= */

const TahunAjaranService = {

  /**
   * Mengambil tahun ajaran yang sedang aktif.
   * Harus tepat satu data aktif.
   */
  getActive() {
    const activeYears = TahunAjaranRepository.getActive();

    if (activeYears.length === 0) {
      throw new Error(
        "Belum ada tahun ajaran yang aktif."
      );
    }

    if (activeYears.length > 1) {
      throw new Error(
        "Terdapat lebih dari satu tahun ajaran aktif. Silakan hubungi administrator."
      );
    }

    return {
      ID_TAHUN_AJARAN: activeYears[0].ID_TAHUN_AJARAN,
      NAMA_TAHUN_AJARAN: activeYears[0].NAMA_TAHUN_AJARAN,
      STATUS_TAHUN_AJARAN: activeYears[0].STATUS_TAHUN_AJARAN
    };
  },

  /**
   * Memvalidasi ID tahun ajaran.
   */
  validateTahunAjaran(idTahunAjaran) {
    const id = String(idTahunAjaran || "").trim();

    if (!id) {
      throw new Error("Tahun ajaran wajib dipilih.");
    }

    const tahunAjaran = TahunAjaranRepository.findById(id);

    if (!tahunAjaran) {
      throw new Error("Tahun ajaran tidak ditemukan.");
    }

    const status = String(
      tahunAjaran.STATUS_TAHUN_AJARAN || ""
    ).trim().toUpperCase();

    if (status !== TEACHLY_STATUS.AKTIF) {
      throw new Error("Tahun ajaran tersebut tidak aktif.");
    }

    return {
      ID_TAHUN_AJARAN: tahunAjaran.ID_TAHUN_AJARAN,
      NAMA_TAHUN_AJARAN: tahunAjaran.NAMA_TAHUN_AJARAN,
      STATUS_TAHUN_AJARAN: status
    };
  },


/* =====================================
   GET ALL UNTUK ADMIN
===================================== */

getAll() {
  return TahunAjaranRepository.getAll();
},

/* =====================================
   VALIDATE NAMA TAHUN AJARAN
   FORMAT: YYYY/YYYY
===================================== */

validateNama(nama) {
  const value = String(nama ?? "").trim();

  if (!/^\d{4}\/\d{4}$/.test(value)) {
    throw new Error(
      "Format tahun ajaran harus YYYY/YYYY. Contoh: 2026/2027."
    );
  }

  const [tahunAwal, tahunAkhir] = value
    .split("/")
    .map(Number);

  if (tahunAkhir !== tahunAwal + 1) {
    throw new Error(
      "Tahun akhir harus satu tahun setelah tahun awal."
    );
  }

  return value;
},

/* =====================================
   CREATE TAHUN AJARAN
   STATUS DEFAULT NONAKTIF
===================================== */

create(data) {
  if (
    !data ||
    typeof data !== "object" ||
    Array.isArray(data)
  ) {
    throw new Error("Data tahun ajaran tidak valid.");
  }

  const nama = this.validateNama(
    data.NAMA_TAHUN_AJARAN
  );

  const lock = LockService.getScriptLock();

  try {
    lock.waitLock(10000);

    const all = TahunAjaranRepository.getAll();

    const activeCount = all.filter(item =>
      String(item.STATUS_TAHUN_AJARAN || "")
        .trim()
        .toUpperCase() === TEACHLY_STATUS.AKTIF
    ).length;

    if (activeCount !== 1) {
      throw new Error(
        "Data tahun ajaran harus memiliki tepat satu tahun ajaran aktif."
      );
    }

    const duplicate = all.some(item =>
      String(item.NAMA_TAHUN_AJARAN || "")
        .trim() === nama
    );

    if (duplicate) {
      throw new Error(
        "Tahun ajaran sudah terdaftar."
      );
    }

    const maxId = all.reduce((max, item) => {
      const match = String(
        item.ID_TAHUN_AJARAN || ""
      ).match(/^TA(\d+)$/i);

      return match
        ? Math.max(max, Number(match[1]))
        : max;
    }, 0);

    const id = "TA" +
      String(maxId + 1).padStart(3, "0");

    const now = Utils.now();

    const result = TahunAjaranRepository.create({
      ID_TAHUN_AJARAN: id,
      NAMA_TAHUN_AJARAN: nama,
      STATUS_TAHUN_AJARAN: TEACHLY_STATUS.NONAKTIF,
      CREATED_AT: now,
      UPDATED_AT: now
    });

    SpreadsheetApp.flush();

    return result;

  } finally {
    if (lock.hasLock()) {
      lock.releaseLock();
    }
  }
},

/* =====================================
   UPDATE NAMA TAHUN AJARAN
===================================== */

update(idTahunAjaran, data) {
  const id = String(idTahunAjaran || "").trim();

  if (!id) {
    throw new Error(
      "ID tahun ajaran wajib diisi."
    );
  }

  if (
    !data ||
    typeof data !== "object" ||
    Array.isArray(data)
  ) {
    throw new Error("Data perubahan tidak valid.");
  }

  const nama = this.validateNama(
    data.NAMA_TAHUN_AJARAN
  );

  const lock = LockService.getScriptLock();

  try {
    lock.waitLock(10000);

    const all = TahunAjaranRepository.getAll();

    const target = all.find(item =>
      String(item.ID_TAHUN_AJARAN || "").trim() === id
    );

    if (!target) {
      throw new Error(
        "Tahun ajaran tidak ditemukan."
      );
    }

    const activeCount = all.filter(item =>
      String(item.STATUS_TAHUN_AJARAN || "")
        .trim()
        .toUpperCase() === TEACHLY_STATUS.AKTIF
    ).length;

    if (activeCount !== 1) {
      throw new Error(
        "Data tahun ajaran harus memiliki tepat satu tahun ajaran aktif."
      );
    }

    const duplicate = all.some(item =>
      String(item.ID_TAHUN_AJARAN || "").trim() !== id &&
      String(item.NAMA_TAHUN_AJARAN || "").trim() === nama
    );

    if (duplicate) {
      throw new Error(
        "Nama tahun ajaran sudah digunakan."
      );
    }

    const result = TahunAjaranRepository.updateById(
      id,
      {
        NAMA_TAHUN_AJARAN: nama,
        UPDATED_AT: Utils.now()
      }
    );

    SpreadsheetApp.flush();

    return result;

  } finally {
    if (lock.hasLock()) {
      lock.releaseLock();
    }
  }
},

/* =====================================
   ACTIVATE TAHUN AJARAN
   WAJIB TEPAT SATU AKTIF
===================================== */

activate(idTahunAjaran) {
  const id = String(idTahunAjaran || "").trim();

  if (!id) {
    throw new Error(
      "ID tahun ajaran wajib diisi."
    );
  }

  const lock = LockService.getScriptLock();

  try {
    lock.waitLock(10000);

    const all = TahunAjaranRepository.getAll();

    const target = all.find(item =>
      String(item.ID_TAHUN_AJARAN || "").trim() === id
    );

    if (!target) {
      throw new Error(
        "Tahun ajaran tidak ditemukan."
      );
    }

    const activeYears = all.filter(item =>
      String(item.STATUS_TAHUN_AJARAN || "")
        .trim()
        .toUpperCase() === TEACHLY_STATUS.AKTIF
    );

    if (activeYears.length !== 1) {
      throw new Error(
        "Pergantian tahun ajaran ditolak. Sistem harus memiliki tepat satu tahun ajaran aktif sebelum perubahan."
      );
    }

    if (
      String(activeYears[0].ID_TAHUN_AJARAN).trim() === id
    ) {
      return {
        ID_TAHUN_AJARAN: target.ID_TAHUN_AJARAN,
        NAMA_TAHUN_AJARAN: target.NAMA_TAHUN_AJARAN,
        STATUS_TAHUN_AJARAN: TEACHLY_STATUS.AKTIF
      };
    }

    const result = TahunAjaranRepository.activateById(
      id,
      Utils.now()
    );

    SpreadsheetApp.flush();

    // Verifikasi setelah penulisan.
    const activeAfter = TahunAjaranRepository.getActive();

    if (
      activeAfter.length !== 1 ||
      String(activeAfter[0].ID_TAHUN_AJARAN).trim() !== id
    ) {
      throw new Error(
        "Verifikasi pergantian tahun ajaran gagal. Periksa status tahun ajaran pada Spreadsheet."
      );
    }

    return result;

  } finally {
    if (lock.hasLock()) {
      lock.releaseLock();
    }
  }
}


};
