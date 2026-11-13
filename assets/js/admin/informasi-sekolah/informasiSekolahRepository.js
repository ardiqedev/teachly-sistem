/* =========================================
   TEACHLY - INFORMASI SEKOLAH REPOSITORY
   QEDEV FRONTEND STANDARD
========================================= */

const InformasiSekolahAdminRepository = {
  /* =====================================
     GET ALL INFORMATION

     Mengambil informasi Kurikulum dan
     Guru Ngaji sekaligus.
  ===================================== */

  async getAll() {
    return API.post("informasiSekolah.list", {});
  },

  /* =====================================
     GET INFORMATION BY SOURCE

     Untuk mengisi formulir otomatis
     saat memilih sumber informasi.

     Source:
     - KURIKULUM
     - GURU_NGAJI
  ===================================== */

  async getBySource(source) {
    return API.post("informasiSekolah.detail", {
      SUMBER_INFORMASI: String(source ?? "")
        .trim()
        .toUpperCase(),
    });
  },

  /* =====================================
     SAVE INFORMATION

     Otomatis memperbarui record INF001.
     Tidak membuat baris baru.

     Payload:
     {
       SUMBER_INFORMASI: "KURIKULUM",
       NAMA_INFORMASI: "...",
       DETAIL_INFORMASI: "..."
     }
  ===================================== */

  async save(data) {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      throw new Error("Data informasi sekolah tidak valid.");
    }

    return API.post("informasiSekolah.save", {
      SUMBER_INFORMASI: String(data.SUMBER_INFORMASI ?? "")
        .trim()
        .toUpperCase(),

      NAMA_INFORMASI: String(data.NAMA_INFORMASI ?? "").trim(),

      // Pertahankan karakter Enter,
      // bullet, dan numbering.
      DETAIL_INFORMASI: String(data.DETAIL_INFORMASI ?? "").replace(
        /\r\n?/g,
        "\n",
      ),
    });
  },
};
