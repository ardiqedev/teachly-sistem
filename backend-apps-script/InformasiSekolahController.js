
/* =========================================
   TEACHLY - INFORMASI SEKOLAH CONTROLLER
   QEDEV BACKEND STANDARD
========================================= */

const InformasiSekolahController = {

  getPublicList() {
    const information = InformasiSekolahService.getAll();
    const announcements = Object.fromEntries(
      Object.entries(information).map(([source, item]) => [
        source,
        {
          SUMBER_INFORMASI: item.SUMBER_INFORMASI,
          NAMA_INFORMASI: item.NAMA_INFORMASI,
          DETAIL_INFORMASI: item.DETAIL_INFORMASI,
          TANGGAL_INFORMASI: item.TANGGAL_INFORMASI
        }
      ])
    );

    return Response.success(announcements, "Informasi sekolah berhasil diambil.");
  },

  /* =====================================
     GET ALL INFORMATION

     Endpoint:
     informasiSekolah.list
  ===================================== */

  

getList(payload = {}, admin = null) {

  try {

    if (!admin || !admin.ID_PENGGUNA) {
      throw new Error(
        "Sesi administrator tidak valid."
      );
    }

    const allowedSources =
      AdminPermission.getAllowedInformationSources(
        admin.ROLE
      );

    if (!allowedSources.length) {
      throw new Error(
        "Anda tidak memiliki izin mengakses informasi sekolah."
      );
    }

    const data = InformasiSekolahService.getAll();

    // Pertahankan struktur object asli.
    const filtered = {};

    allowedSources.forEach(source => {

      if (
        Object.prototype.hasOwnProperty.call(
          data,
          source
        )
      ) {
        filtered[source] = data[source];
      }

    });

    return Response.success(
      filtered,
      "Informasi sekolah berhasil diambil."
    );

  } catch (error) {

    return Response.error(
      Utils.getErrorMessage(error)
    );

  }

},



  /* =====================================
     GET INFORMATION BY SOURCE

     Endpoint:
     informasiSekolah.detail

     Payload:
     {
       SUMBER_INFORMASI: "KURIKULUM"
     }

     Atau:
     {
       SUMBER_INFORMASI: "GURU_NGAJI"
     }
  ===================================== */


    
  getDetail(payload = {}, admin = null) {

    try {

      if (!admin || !admin.ID_PENGGUNA) {
        throw new Error(
          "Sesi administrator tidak valid."
        );
      }

      const sumber =
        AdminPermission.assertInformationSource(
          admin.ROLE,
          payload.SUMBER_INFORMASI
        );

      const data = InformasiSekolahService.getBySource(
        sumber
      );

      return Response.success(
        data,
        "Detail informasi berhasil diambil."
      );

    } catch (error) {

      return Response.error(
        Utils.getErrorMessage(error)
      );

    }

  },



  /* =====================================
     SAVE INFORMATION

     Endpoint:
     informasiSekolah.save

     Payload:
     {
       SUMBER_INFORMASI: "KURIKULUM",
       NAMA_INFORMASI: "Jadwal Penilaian",
       DETAIL_INFORMASI: "Informasi kegiatan..."
     }
  ===================================== */

  
  
  save(payload = {}, admin = null) {

    try {

      if (!admin || !admin.ID_PENGGUNA) {
        throw new Error(
          "Sesi administrator tidak valid."
        );
      }

      const sumber =
        AdminPermission.assertInformationSource(
          admin.ROLE,
          payload.SUMBER_INFORMASI
        );

      const data = InformasiSekolahService.save(
        {
          ...payload,
          SUMBER_INFORMASI: sumber
        },
        admin.ID_PENGGUNA
      );

      return Response.success(
        data,
        "Informasi sekolah berhasil disimpan."
      );

    } catch (error) {

      return Response.error(
        Utils.getErrorMessage(error)
      );

    }

  },



  /* =====================================
     REGISTER ROUTES
  ===================================== */

  registerRoutes() {

    Router.register(
      "informasiSekolah.publicList",
      this.getPublicList
    );

    Router.register(
      "informasiSekolah.list",
      this.getList
    );

    Router.register(
      "informasiSekolah.detail",
      this.getDetail
    );

    Router.register(
      "informasiSekolah.save",
      this.save
    );

  }

};

/* =========================================
   REGISTER INFORMASI SEKOLAH ROUTES
========================================= */

