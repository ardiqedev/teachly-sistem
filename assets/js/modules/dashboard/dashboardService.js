/* =========================================
   TEACHLY - DASHBOARD SERVICE
========================================= */

const DashboardService = {
  async getSummary() {
    const data = await DashboardRepository.getSummary();

    if (!data || !data.guru || !data.statistik) {
      throw new Error("Format data dashboard tidak valid.");
    }

    return {
      guru: {
        idGuru: data.guru.idGuru || "",
        namaGuru: data.guru.namaGuru || "Guru",
        nbm: data.guru.nbm || "-",
        jenisGuru: String(data.guru.jenisGuru || "").trim(),
      },

      tanggal: data.tanggal || "",

      tahunAjaran: data.tahunAjaran
        ? data.tahunAjaran.namaTahunAjaran || "-"
        : "-",

      statistik: {
        totalLaporan: Number(data.statistik.totalLaporan) || 0,
        laporanBulanIni: Number(data.statistik.laporanBulanIni) || 0,
      },
    };
  },
};
