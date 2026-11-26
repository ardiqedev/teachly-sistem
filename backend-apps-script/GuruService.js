
/**
 * ============================================================
 * TEACHLY - GURU SERVICE
 * QEDEV BACKEND STANDARD
 * ============================================================
 *
 * Tanggung jawab:
 * 1. Validasi NBM.
 * 2. Mengambil profil guru.
 * 3. Memastikan akun guru aktif.
 * 4. Mengambil daftar guru.
 * 5. Menambahkan data guru.
 * 6. Memperbarui nama guru.
 * 7. Mengubah status akun guru.
 *
 * Repository:
 * GuruRepository.gs
 *
 * ============================================================
 */

const GuruService = {

  /**
   * ----------------------------------------------------------
   * VALIDATE NBM
   * ----------------------------------------------------------
   */

  validateNBM(nbm) {

    const value = Utils.normalizeText(nbm);

    if (Utils.isEmpty(value)) {
      throw new Error("NBM wajib diisi.");
    }

    if (!Utils.validateNBM(value)) {
      throw new Error("Format NBM tidak valid.");
    }

    return value;

  },


  /**
   * ----------------------------------------------------------
   * GET ALL GURU
   * ----------------------------------------------------------
   */

  getAll() {

    return GuruRepository.getAll();

  },


  /**
   * ----------------------------------------------------------
   * GET ACTIVE GURU
   * ----------------------------------------------------------
   */

  getActive() {

    return GuruRepository.getActive();

  },


  /**
   * ----------------------------------------------------------
   * GET GURU PROFILE
   * ----------------------------------------------------------
   */

  getProfile(nbm) {

    const validNBM = this.validateNBM(nbm);

    const guru = GuruRepository.findByNBM(validNBM);

    if (!guru) {
      throw new Error(
        "Data guru dengan NBM tersebut tidak ditemukan."
      );
    }

    return guru;

  },


  /**
   * ----------------------------------------------------------
   * GET ACTIVE GURU PROFILE
   * ----------------------------------------------------------
   */

  getActiveProfile(nbm) {

    const guru = this.getProfile(nbm);

    const status = Utils.toUpperCase(
      guru.STATUS_AKUN
    );

    if (status !== TEACHLY_STATUS.AKTIF) {
      throw new Error("Akun guru tidak aktif.");
    }

    return guru;

  },


  /**
   * ----------------------------------------------------------
   * CHECK GURU ACTIVE STATUS
   * ----------------------------------------------------------
   */

  isActive(nbm) {

    try {

      this.getActiveProfile(nbm);

      return true;

    } catch (error) {

      return false;

    }

  },


  /**
   * ----------------------------------------------------------
   * CREATE GURU
   * ----------------------------------------------------------
   */

  create(data) {

    if (
      !data ||
      typeof data !== "object" ||
      Array.isArray(data)
    ) {
      throw new Error("Data guru tidak valid.");
    }

    const nbm = this.validateNBM(data.NBM);
    const namaGuru = Utils.normalizeText(data.NAMA_GURU);

    if (!namaGuru) {
      throw new Error("Nama guru wajib diisi.");
    }

    const lock = LockService.getScriptLock();

    try {

      // Mencegah pendaftaran NBM ganda secara bersamaan
      lock.waitLock(10000);

      const now = Utils.now();

      const guru = GuruRepository.create({

        NBM: nbm,

        NAMA_GURU: namaGuru,

        STATUS_AKUN: TEACHLY_STATUS.AKTIF,

        CREATED_AT: now,

        UPDATED_AT: now

      });

      return guru;

    } finally {

      if (lock.hasLock()) {
        lock.releaseLock();
      }

    }

  },


  /**
   * ----------------------------------------------------------
   * UPDATE GURU
   * HANYA NAMA GURU YANG DAPAT DIUBAH
   * ----------------------------------------------------------
   */

  update(nbm, data) {

    const validNBM = this.validateNBM(nbm);

    if (
      !data ||
      typeof data !== "object" ||
      Array.isArray(data)
    ) {
      throw new Error("Data perubahan tidak valid.");
    }

    // Pastikan guru tersedia
    this.getProfile(validNBM);

    const namaGuru = Utils.normalizeText(data.NAMA_GURU);

    if (!namaGuru) {
      throw new Error("Nama guru wajib diisi.");
    }

    return GuruRepository.updateByNBM(
      validNBM,
      {
        NAMA_GURU: namaGuru,
        UPDATED_AT: Utils.now()
      }
    );

  },


  /**
   * ----------------------------------------------------------
   * UPDATE STATUS GURU
   * ----------------------------------------------------------
   */

  updateStatus(nbm, status) {

    const validNBM = this.validateNBM(nbm);

    const newStatus = Utils.toUpperCase(status);

    if (
      newStatus !== TEACHLY_STATUS.AKTIF &&
      newStatus !== TEACHLY_STATUS.NONAKTIF
    ) {
      throw new Error("Status akun tidak valid.");
    }

    // Pastikan guru tersedia
    this.getProfile(validNBM);

    return GuruRepository.updateByNBM(
      validNBM,
      {
        STATUS_AKUN: newStatus,
        UPDATED_AT: Utils.now()
      }
    );

  }

};
