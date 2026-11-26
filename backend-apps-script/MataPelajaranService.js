
/**
 * ============================================================
 * TEACHLY - MATA PELAJARAN SERVICE
 * QEDEV BACKEND STANDARD
 * ============================================================
 *
 * Tanggung jawab:
 * 1. Mengambil daftar mata pelajaran aktif.
 * 2. Memvalidasi ID_MAPEL.
 * 3. Memastikan mata pelajaran berstatus AKTIF.
 *
 * Repository:
 * MataPelajaranRepository.gs
 *
 * ============================================================
 */

const MataPelajaranService = {

  /**
   * ----------------------------------------------------------
   * GET ACTIVE MATA PELAJARAN
   * ----------------------------------------------------------
   */

  getActive() {

    return MataPelajaranRepository.getActive()
      .map(mapel => ({
        ID_MAPEL: mapel.ID_MAPEL,
        NAMA_MAPEL: mapel.NAMA_MAPEL
      }));

  },


  /**
   * ----------------------------------------------------------
   * VALIDATE MATA PELAJARAN
   * ----------------------------------------------------------
   */

  validateMapel(idMapel) {

    const searchId = Utils.normalizeText(idMapel);

    if (Utils.isEmpty(searchId)) {
      throw new Error("Mata pelajaran wajib dipilih.");
    }

    const mapel = MataPelajaranRepository.findById(searchId);

    if (!mapel) {
      throw new Error("Mata pelajaran tidak ditemukan.");
    }

    if (
      Utils.toUpperCase(mapel.STATUS_MAPEL) !==
      TEACHLY_STATUS.AKTIF
    ) {
      throw new Error("Mata pelajaran tidak aktif.");
    }

    return {
      ID_MAPEL: mapel.ID_MAPEL,
      NAMA_MAPEL: mapel.NAMA_MAPEL
    };

  },



/* =========================================
   GET ALL UNTUK ADMIN
========================================= */

getAll() {
  return MataPelajaranRepository.getAll();
},

/* =========================================
   CREATE MATA PELAJARAN
========================================= */

create(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Data mata pelajaran tidak valid.");
  }

  const nama = Utils.normalizeText(data.NAMA_MAPEL);

  if (!nama) {
    throw new Error("Nama mata pelajaran wajib diisi.");
  }

  if (nama.length > 150) {
    throw new Error("Nama mata pelajaran maksimal 150 karakter.");
  }

  const lock = LockService.getScriptLock();

  try {
    lock.waitLock(10000);

    const all = MataPelajaranRepository.getAll();

    const duplicate = all.some(item =>
      Utils.normalizeText(item.NAMA_MAPEL).toUpperCase() ===
      nama.toUpperCase()
    );

    if (duplicate) {
      throw new Error("Nama mata pelajaran sudah terdaftar.");
    }

    const maxId = all.reduce((max, item) => {
      const match = String(item.ID_MAPEL || "")
        .match(/^pel_(\d+)$/i);

      return match
        ? Math.max(max, Number(match[1]))
        : max;
    }, 0);

    const id = "pel_" + String(maxId + 1).padStart(3, "0");
    const now = Utils.now();

    const result = MataPelajaranRepository.create({
      ID_MAPEL: id,
      NAMA_MAPEL: nama,
      STATUS_MAPEL: TEACHLY_STATUS.AKTIF,
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

/* =========================================
   UPDATE MATA PELAJARAN
========================================= */

update(idMapel, data) {
  const id = Utils.normalizeText(idMapel);

  if (!id) {
    throw new Error("ID mata pelajaran wajib diisi.");
  }

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Data perubahan tidak valid.");
  }

  const nama = Utils.normalizeText(data.NAMA_MAPEL);

  if (!nama) {
    throw new Error("Nama mata pelajaran wajib diisi.");
  }

  if (nama.length > 150) {
    throw new Error("Nama mata pelajaran maksimal 150 karakter.");
  }

  const lock = LockService.getScriptLock();

  try {
    lock.waitLock(10000);

    if (!MataPelajaranRepository.findById(id)) {
      throw new Error("Mata pelajaran tidak ditemukan.");
    }

    const duplicate = MataPelajaranRepository.getAll().some(item =>
      Utils.normalizeText(item.ID_MAPEL) !== id &&
      Utils.normalizeText(item.NAMA_MAPEL).toUpperCase() ===
      nama.toUpperCase()
    );

    if (duplicate) {
      throw new Error("Nama mata pelajaran sudah digunakan.");
    }

    const result = MataPelajaranRepository.updateById(id, {
      NAMA_MAPEL: nama,
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

/* =========================================
   UPDATE STATUS MATA PELAJARAN
========================================= */

updateStatus(idMapel, status) {
  const id = Utils.normalizeText(idMapel);
  const newStatus = Utils.toUpperCase(status);

  if (!id) {
    throw new Error("ID mata pelajaran wajib diisi.");
  }

  if (
    newStatus !== TEACHLY_STATUS.AKTIF &&
    newStatus !== TEACHLY_STATUS.NONAKTIF
  ) {
    throw new Error("Status mata pelajaran tidak valid.");
  }

  const lock = LockService.getScriptLock();

  try {
    lock.waitLock(10000);

    if (!MataPelajaranRepository.findById(id)) {
      throw new Error("Mata pelajaran tidak ditemukan.");
    }

    const result = MataPelajaranRepository.updateById(id, {
      STATUS_MAPEL: newStatus,
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
