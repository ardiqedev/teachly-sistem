
/**
 * ============================================================
 * TEACHLY - ADMIN GURU CONTROLLER
 * QEDEV BACKEND STANDARD
 * ============================================================
 *
 * Tanggung jawab:
 * 1. Menerima request administrasi data guru.
 * 2. Memanggil GuruService.
 * 3. Mengembalikan response standar Teachly.
 * 4. Mendaftarkan endpoint Admin Guru ke Router.
 *
 * Repository:
 * GuruRepository.gs
 *
 * Service:
 * GuruService.gs
 *
 * ============================================================
 */

const AdminGuruController = {

  /**
   * ----------------------------------------------------------
   * GET ALL GURU
   * ----------------------------------------------------------
   *
   * Endpoint:
   * admin.guru.list
   *
   * ----------------------------------------------------------
   */

  getAll(payload = {}) {

    try {

      const data = GuruService.getAll();

      return Response.success(
        data,
        "Data guru berhasil diambil."
      );

    } catch (error) {

      return Response.error(
        Utils.getErrorMessage(error)
      );

    }

  },


  /**
   * ----------------------------------------------------------
   * GET GURU DETAIL
   * ----------------------------------------------------------
   *
   * Endpoint:
   * admin.guru.detail
   *
   * Payload:
   * {
   *   nbm: "123456"
   * }
   *
   * ----------------------------------------------------------
   */

  getDetail(payload = {}) {

    try {

      const nbm = payload.nbm;

      const guru = GuruService.getProfile(nbm);

      return Response.success(
        guru,
        "Detail guru berhasil diambil."
      );

    } catch (error) {

      return Response.error(
        Utils.getErrorMessage(error)
      );

    }

  },


  /**
   * ----------------------------------------------------------
   * CREATE GURU
   * ----------------------------------------------------------
   *
   * Endpoint:
   * admin.guru.create
   *
   * Payload:
   * {
   *   NBM: "123456",
   *   NAMA_GURU: "Nama Guru"
   * }
   *
   * ----------------------------------------------------------
   */

  create(payload = {}) {

    try {

      const guru = GuruService.create(payload);

      return Response.success(
        guru,
        "Data guru berhasil ditambahkan."
      );

    } catch (error) {

      return Response.error(
        Utils.getErrorMessage(error)
      );

    }

  },


  /**
   * ----------------------------------------------------------
   * UPDATE GURU
   * ----------------------------------------------------------
   *
   * Endpoint:
   * admin.guru.update
   *
   * Payload:
   * {
   *   nbm: "123456",
   *   NAMA_GURU: "Nama Guru Baru"
   * }
   *
   * NBM TIDAK DAPAT DIUBAH.
   *
   * ----------------------------------------------------------
   */

  update(payload = {}) {

    try {

      const nbm = payload.nbm;

      const guru = GuruService.update(
        nbm,
        {
          NAMA_GURU: payload.NAMA_GURU
        }
      );

      return Response.success(
        guru,
        "Data guru berhasil diperbarui."
      );

    } catch (error) {

      return Response.error(
        Utils.getErrorMessage(error)
      );

    }

  },


  /**
   * ----------------------------------------------------------
   * UPDATE GURU STATUS
   * ----------------------------------------------------------
   *
   * Endpoint:
   * admin.guru.updateStatus
   *
   * Payload:
   * {
   *   nbm: "123456",
   *   status: "NONAKTIF"
   * }
   *
   * ----------------------------------------------------------
   */

  updateStatus(payload = {}) {

    try {

      const nbm = payload.nbm;
      const status = payload.status;

      const guru = GuruService.updateStatus(
        nbm,
        status
      );

      return Response.success(
        guru,
        "Status akun guru berhasil diperbarui."
      );

    } catch (error) {

      return Response.error(
        Utils.getErrorMessage(error)
      );

    }

  },


  /**
   * ----------------------------------------------------------
   * REGISTER ROUTES
   * ----------------------------------------------------------
   */

  registerRoutes() {

    Router.register(
      "admin.guru.list",
      this.getAll.bind(this)
    );

    Router.register(
      "admin.guru.detail",
      this.getDetail.bind(this)
    );

    Router.register(
      "admin.guru.create",
      this.create.bind(this)
    );

    Router.register(
      "admin.guru.update",
      this.update.bind(this)
    );

    Router.register(
      "admin.guru.updateStatus",
      this.updateStatus.bind(this)
    );

    Router.register("admin.guru.resetPassword", (payload, admin) => {
      const credential = GuruCredentialService.resetPassword(payload.nbm, admin.ID_PENGGUNA);
      return Response.success(credential, "Password sementara berhasil dibuat.");
    });

  }

};


/**
 * ============================================================
 * REGISTER ADMIN GURU ROUTES
 * ============================================================
 */

