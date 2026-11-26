
const AuthRepository = {

  /**
   * Mencari akun berdasarkan NBM.
   * Sumber data: Sheet GURU.
   */
  findByNBM(nbm) {
    const normalizedNBM = String(nbm || "").trim();

    if (!normalizedNBM) {
      return null;
    }

    return GuruRepository.findByNBM(normalizedNBM);
  },

  /**
   * Mencari akun berdasarkan NBM
   * dan memastikan status akun AKTIF.
   */
  findActiveByNBM(nbm) {
    const account = this.findByNBM(nbm);

    if (!account) {
      return null;
    }

    const status = String(account.STATUS_AKUN || "")
      .trim()
      .toUpperCase();

    if (status !== TEACHLY_STATUS.AKTIF) {
      return null;
    }

    return account;
  }

};
