
/* =========================================
   TEACHLY - SESI NGAJI SERVICE
   QEDEV BACKEND STANDARD
========================================= */

const SesiNgajiService = {

  getActive() {
    const data = SesiNgajiRepository.getActive();

    return data.map(item => ({
      ID_SESI: item.ID_SESI,
      NAMA_SESI: item.NAMA_SESI
    }));
  },

  validateSesi(idSesi) {
    if (Utils.isEmpty(idSesi)) {
      throw new Error("Sesi ngaji wajib dipilih.");
    }

    const sesi = SesiNgajiRepository.findById(idSesi);

    if (!sesi) {
      throw new Error("Sesi ngaji tidak ditemukan.");
    }

    if (sesi.STATUS_SESI !== TEACHLY_STATUS.AKTIF) {
      throw new Error("Sesi ngaji tidak aktif.");
    }

    return {
      ID_SESI: sesi.ID_SESI,
      NAMA_SESI: sesi.NAMA_SESI
    };
  },

  /* =====================================
     GET ALL UNTUK ADMIN
  ===================================== */

  getAll() {
    return SesiNgajiRepository.getAll();
  },

  /* =====================================
     CREATE SESI
  ===================================== */

  create(data) {
    const nama = String(data?.NAMA_SESI || "").trim();

    if (!nama) {
      throw new Error("Nama sesi wajib diisi.");
    }

    if (nama.length > 150) {
      throw new Error("Nama sesi maksimal 150 karakter.");
    }

    const lock = LockService.getScriptLock();

    try {
      lock.waitLock(10000);

      const all = SesiNgajiRepository.getAll();

      const duplicate = all.some(item =>
        String(item.NAMA_SESI || "")
          .trim()
          .toUpperCase() === nama.toUpperCase()
      );

      if (duplicate) {
        throw new Error("Nama sesi sudah terdaftar.");
      }

      const maxId = all.reduce((max, item) => {
        const match = String(item.ID_SESI || "")
          .match(/^ses_(\d+)$/i);

        return match
          ? Math.max(max, Number(match[1]))
          : max;
      }, 0);

      const id = "ses_" +
        String(maxId + 1).padStart(3, "0");

      const now = Utils.now();

      const result = SesiNgajiRepository.create({
        ID_SESI: id,
        NAMA_SESI: nama,
        STATUS_SESI: TEACHLY_STATUS.AKTIF,
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
     UPDATE SESI
  ===================================== */

  update(idSesi, data) {
    const id = String(idSesi || "").trim();
    const nama = String(data?.NAMA_SESI || "").trim();

    if (!id) {
      throw new Error("ID sesi wajib diisi.");
    }

    if (!nama) {
      throw new Error("Nama sesi wajib diisi.");
    }

    if (nama.length > 150) {
      throw new Error("Nama sesi maksimal 150 karakter.");
    }

    const lock = LockService.getScriptLock();

    try {
      lock.waitLock(10000);

      if (!SesiNgajiRepository.findById(id)) {
        throw new Error("Sesi ngaji tidak ditemukan.");
      }

      const duplicate = SesiNgajiRepository.getAll().some(
        item =>
          String(item.ID_SESI).trim() !== id &&
          String(item.NAMA_SESI || "")
            .trim()
            .toUpperCase() === nama.toUpperCase()
      );

      if (duplicate) {
        throw new Error("Nama sesi sudah digunakan.");
      }

      const result = SesiNgajiRepository.updateById(id, {
        NAMA_SESI: nama,
        UPDATED_AT: Utils.now()
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
     UPDATE STATUS SESI
  ===================================== */

  updateStatus(idSesi, status) {
    const id = String(idSesi || "").trim();
    const newStatus = String(status || "")
      .trim()
      .toUpperCase();

    if (!id) {
      throw new Error("ID sesi wajib diisi.");
    }

    if (
      newStatus !== TEACHLY_STATUS.AKTIF &&
      newStatus !== TEACHLY_STATUS.NONAKTIF
    ) {
      throw new Error("Status sesi tidak valid.");
    }

    const lock = LockService.getScriptLock();

    try {
      lock.waitLock(10000);

      if (!SesiNgajiRepository.findById(id)) {
        throw new Error("Sesi ngaji tidak ditemukan.");
      }

      const result = SesiNgajiRepository.updateById(id, {
        STATUS_SESI: newStatus,
        UPDATED_AT: Utils.now()
      });

      SpreadsheetApp.flush();

      return result;

    } finally {
      if (lock.hasLock()) {
        lock.releaseLock();
      }
    }
  }

};
