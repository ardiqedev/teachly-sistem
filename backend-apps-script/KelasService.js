
/**
 * ============================================================
 * TEACHLY - KELAS SERVICE
 * QEDEV BACKEND STANDARD
 * ============================================================
 *
 * Tanggung jawab:
 * 1. Mengambil daftar kelas aktif.
 * 2. Mengambil daftar tingkat secara dinamis.
 * 3. Mengambil kelas berdasarkan tingkat.
 * 4. Memvalidasi ID kelas.
 *
 * Repository:
 * KelasRepository.gs
 *
 * ============================================================
 */

const KelasService = {

  /**
   * ----------------------------------------------------------
   * GET ACTIVE KELAS
   * ----------------------------------------------------------
   */

  getActiveClasses() {

    return KelasRepository.getActive();

  },


  /**
   * ----------------------------------------------------------
   * GET AVAILABLE TINGKAT
   * ----------------------------------------------------------
   *
   * Tingkat diambil dari data kelas aktif.
   * Tidak menggunakan daftar tingkat hardcode.
   *
   * ----------------------------------------------------------
   */

  getAvailableTingkat() {

    const data = KelasRepository.getActive();

    const tingkatList = data
      .map(kelas => Utils.normalizeText(kelas.TINGKAT))
      .filter(tingkat => !Utils.isEmpty(tingkat));

    return [...new Set(
      tingkatList.map(tingkat => tingkat.toUpperCase())
    )].sort((a, b) => {
      return a.localeCompare(b, "id", {
        numeric: true
      });
    });

  },


  /**
   * ----------------------------------------------------------
   * GET KELAS BY TINGKAT
   * ----------------------------------------------------------
   */

  getClassesByTingkat(tingkat) {

    const searchTingkat = Utils.normalizeText(tingkat);

    if (Utils.isEmpty(searchTingkat)) {
      throw new Error("Tingkat wajib dipilih.");
    }

    const tingkatList = this.getAvailableTingkat();

    const isValid = tingkatList.some(item => {
      return item === searchTingkat.toUpperCase();
    });

    if (!isValid) {
      throw new Error(
        "Tingkat tidak ditemukan atau tidak aktif."
      );
    }

    return KelasRepository.getByTingkat(searchTingkat)
      .map(kelas => ({
        ID_KELAS: kelas.ID_KELAS,
        NAMA_KELAS: kelas.NAMA_KELAS,
        TINGKAT: kelas.TINGKAT
      }));

  },


  /**
   * ----------------------------------------------------------
   * VALIDATE KELAS
   * ----------------------------------------------------------
   */

  validateKelas(idKelas) {

    const searchId = Utils.normalizeText(idKelas);

    if (Utils.isEmpty(searchId)) {
      throw new Error("Kelas wajib dipilih.");
    }

    const kelas = KelasRepository.findById(searchId);

    if (!kelas) {
      throw new Error("Kelas tidak ditemukan.");
    }

    if (
      Utils.toUpperCase(kelas.STATUS_KELAS) !==
      TEACHLY_STATUS.AKTIF
    ) {
      throw new Error("Kelas tidak aktif.");
    }

    return kelas;

  },


/**
 * GET ALL KELAS UNTUK ADMIN
 */
getAll() {
  return KelasRepository.getAll();
},

/**
 * CREATE KELAS
 */
create(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Data kelas tidak valid.");
  }

  const nama = Utils.normalizeText(data.NAMA_KELAS);
  const tingkat = Utils.normalizeText(data.TINGKAT);

  if (!nama) throw new Error("Nama kelas wajib diisi.");

  if (!/^[1-6]$/.test(tingkat)) {
    throw new Error("Tingkat harus antara 1 sampai 6.");
  }

  const lock = LockService.getScriptLock();

  try {
    lock.waitLock(10000);

    const all = KelasRepository.getAll();

    const duplicate = all.some(item =>
      Utils.normalizeText(item.NAMA_KELAS).toUpperCase() ===
      nama.toUpperCase()
    );

    if (duplicate) {
      throw new Error("Nama kelas sudah terdaftar.");
    }

    const maxId = all.reduce((max, item) => {
      const match = String(item.ID_KELAS || "").match(/^kls_(\d+)$/i);
      return match ? Math.max(max, Number(match[1])) : max;
    }, 0);

    const id = "kls_" + String(maxId + 1).padStart(3, "0");
    const now = Utils.now();

    const result = KelasRepository.create({
      ID_KELAS: id,
      NAMA_KELAS: nama,
      TINGKAT: tingkat,
      STATUS_KELAS: TEACHLY_STATUS.AKTIF,
      CREATED_AT: now,
      UPDATED_AT: now
    });

    SpreadsheetApp.flush();
    return result;
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
},

/**
 * UPDATE KELAS
 */
update(idKelas, data) {
  const id = Utils.normalizeText(idKelas);

  if (!id) throw new Error("ID kelas wajib diisi.");

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Data perubahan tidak valid.");
  }

  const nama = Utils.normalizeText(data.NAMA_KELAS);
  const tingkat = Utils.normalizeText(data.TINGKAT);

  if (!nama) throw new Error("Nama kelas wajib diisi.");

  if (!/^[1-6]$/.test(tingkat)) {
    throw new Error("Tingkat harus antara 1 sampai 6.");
  }

  const lock = LockService.getScriptLock();

  try {
    lock.waitLock(10000);

    if (!KelasRepository.findById(id)) {
      throw new Error("Kelas tidak ditemukan.");
    }

    const duplicate = KelasRepository.getAll().some(item =>
      Utils.normalizeText(item.ID_KELAS) !== id &&
      Utils.normalizeText(item.NAMA_KELAS).toUpperCase() === nama.toUpperCase()
    );

    if (duplicate) {
      throw new Error("Nama kelas sudah digunakan.");
    }

    const result = KelasRepository.updateById(id, {
      NAMA_KELAS: nama,
      TINGKAT: tingkat,
      UPDATED_AT: Utils.now()
    });

    SpreadsheetApp.flush();
    return result;
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
},

/**
 * UPDATE STATUS KELAS
 */
updateStatus(idKelas, status) {
  const id = Utils.normalizeText(idKelas);
  const newStatus = Utils.toUpperCase(status);

  if (!id) throw new Error("ID kelas wajib diisi.");

  if (
    newStatus !== TEACHLY_STATUS.AKTIF &&
    newStatus !== TEACHLY_STATUS.NONAKTIF
  ) {
    throw new Error("Status kelas tidak valid.");
  }

  const lock = LockService.getScriptLock();

  try {
    lock.waitLock(10000);

    if (!KelasRepository.findById(id)) {
      throw new Error("Kelas tidak ditemukan.");
    }

    const result = KelasRepository.updateById(id, {
      STATUS_KELAS: newStatus,
      UPDATED_AT: Utils.now()
    });

    SpreadsheetApp.flush();
    return result;
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}


};
