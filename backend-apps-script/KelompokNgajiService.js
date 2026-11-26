/**
 * ============================================================
 * TEACHLY - KELOMPOK NGAJI SERVICE
 * QEDEV BACKEND STANDARD
 * ============================================================
 *
 * Tanggung jawab:
 * 1. Mengambil daftar kelompok ngaji aktif.
 * 2. Mengambil kelompok berdasarkan ID_KELOMPOK.
 * 3. Memvalidasi kelompok ngaji.
 *
 * Catatan:
 * Kelompok ngaji berdiri sendiri dan tidak terikat
 * pada sesi tertentu.
 *
 * ============================================================
 */

const KelompokNgajiService = {

  getActive() {
    const data = KelompokNgajiRepository.getActive();

    return data.map(item => ({
      ID_KELOMPOK: item.ID_KELOMPOK,
      NAMA_KELOMPOK: item.NAMA_KELOMPOK
    }));
  },

  validateKelompok(idKelompok) {
    if (Utils.isEmpty(idKelompok)) {
      throw new Error("Kelompok ngaji wajib dipilih.");
    }

    const kelompok = KelompokNgajiRepository.findById(idKelompok);

    if (!kelompok) {
      throw new Error("Kelompok ngaji tidak ditemukan.");
    }

    if (kelompok.STATUS_KELOMPOK !== TEACHLY_STATUS.AKTIF) {
      throw new Error("Kelompok ngaji tidak aktif.");
    }

    return {
      ID_KELOMPOK: kelompok.ID_KELOMPOK,
      NAMA_KELOMPOK: kelompok.NAMA_KELOMPOK
    };
  },



/* =====================================
   GET ALL UNTUK ADMIN
===================================== */

getAll() {
  return KelompokNgajiRepository.getAll();
},

/* =====================================
   CREATE KELOMPOK NGAJI
===================================== */

create(data) {
  const nama = String(data?.NAMA_KELOMPOK || "").trim();

  if (!nama) {
    throw new Error("Nama kelompok ngaji wajib diisi.");
  }

  if (nama.length > 150) {
    throw new Error(
      "Nama kelompok ngaji maksimal 150 karakter."
    );
  }

  const lock = LockService.getScriptLock();

  try {
    lock.waitLock(10000);

    const all = KelompokNgajiRepository.getAll();

    const duplicate = all.some(item =>
      String(item.NAMA_KELOMPOK || "")
        .trim()
        .toUpperCase() === nama.toUpperCase()
    );

    if (duplicate) {
      throw new Error(
        "Nama kelompok ngaji sudah terdaftar."
      );
    }

    const maxId = all.reduce((max, item) => {
      const match = String(item.ID_KELOMPOK || "")
        .match(/^kel_(\d+)$/i);

      return match
        ? Math.max(max, Number(match[1]))
        : max;
    }, 0);

    const id = "kel_" +
      String(maxId + 1).padStart(3, "0");

    const now = Utils.now();

    const result = KelompokNgajiRepository.create({
      ID_KELOMPOK: id,
      NAMA_KELOMPOK: nama,
      STATUS_KELOMPOK: TEACHLY_STATUS.AKTIF,
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
   UPDATE KELOMPOK NGAJI
===================================== */

update(idKelompok, data) {
  const id = String(idKelompok || "").trim();
  const nama = String(data?.NAMA_KELOMPOK || "").trim();

  if (!id) {
    throw new Error("ID kelompok ngaji wajib diisi.");
  }

  if (!nama) {
    throw new Error("Nama kelompok ngaji wajib diisi.");
  }

  if (nama.length > 150) {
    throw new Error(
      "Nama kelompok ngaji maksimal 150 karakter."
    );
  }

  const lock = LockService.getScriptLock();

  try {
    lock.waitLock(10000);

    if (!KelompokNgajiRepository.findById(id)) {
      throw new Error("Kelompok ngaji tidak ditemukan.");
    }

    const duplicate = KelompokNgajiRepository
      .getAll()
      .some(item =>
        String(item.ID_KELOMPOK).trim() !== id &&
        String(item.NAMA_KELOMPOK || "")
          .trim()
          .toUpperCase() === nama.toUpperCase()
      );

    if (duplicate) {
      throw new Error(
        "Nama kelompok ngaji sudah digunakan."
      );
    }

    const result = KelompokNgajiRepository.updateById(
      id,
      {
        NAMA_KELOMPOK: nama,
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
   UPDATE STATUS KELOMPOK NGAJI
===================================== */

updateStatus(idKelompok, status) {
  const id = String(idKelompok || "").trim();

  const newStatus = String(status || "")
    .trim()
    .toUpperCase();

  if (!id) {
    throw new Error("ID kelompok ngaji wajib diisi.");
  }

  if (
    newStatus !== TEACHLY_STATUS.AKTIF &&
    newStatus !== TEACHLY_STATUS.NONAKTIF
  ) {
    throw new Error("Status kelompok ngaji tidak valid.");
  }

  const lock = LockService.getScriptLock();

  try {
    lock.waitLock(10000);

    if (!KelompokNgajiRepository.findById(id)) {
      throw new Error("Kelompok ngaji tidak ditemukan.");
    }

    const result = KelompokNgajiRepository.updateById(
      id,
      {
        STATUS_KELOMPOK: newStatus,
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
}


};