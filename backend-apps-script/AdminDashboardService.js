
/* =========================================
   TEACHLY - ADMIN DASHBOARD SERVICE
========================================= */

const AdminDashboardService = {

  /* =====================================
     GET SUMMARY
  ===================================== */

  getSummary(payload = {}) {
    try {
      const periode = this.getReportPeriod(payload);
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const { statistikGuru, guruByNbm } = this.getTeacherStatistics();

      // Ambil tahun ajaran aktif
      const tahunAjaran = this.getActiveAcademicYear(ss);

      if (!tahunAjaran) {
        return {
          success: true,
          data: {
            tahunAjaran: null,
            periode,
            statistikGuru,
            laporanPerGuru: [],
            laporanGuruKelas: 0,
            laporanGuruMapel: 0,
            laporanGuruNgaji: 0,
            totalSeluruhLaporan: 0
          }
        };
      }

      const idTahunAjaran = tahunAjaran.ID_TAHUN_AJARAN;

      // Hitung laporan berdasarkan tahun ajaran aktif
      const laporanGuruKelas = this.countReports(ss, "LAPORAN_GURU_KELAS", idTahunAjaran, guruByNbm, "kelas", periode);
      const laporanGuruMapel = this.countReports(ss, "LAPORAN_GURU_MAPEL", idTahunAjaran, guruByNbm, "mapel", periode);
      const laporanGuruNgaji = this.countReports(ss, "LAPORAN_GURU_NGAJI", idTahunAjaran, guruByNbm, "ngaji", periode);
      const laporanPerGuru = Array.from(guruByNbm.values())
        .sort((a, b) => b.total - a.total || a.nama.localeCompare(b.nama, "id"));

      const totalSeluruhLaporan =
        laporanGuruKelas +
        laporanGuruMapel +
        laporanGuruNgaji;

      return {
        success: true,
        data: {
          tahunAjaran: tahunAjaran.NAMA_TAHUN_AJARAN,
          idTahunAjaran: idTahunAjaran,
          periode,
          statistikGuru,
          laporanPerGuru,
          laporanGuruKelas: laporanGuruKelas,
          laporanGuruMapel: laporanGuruMapel,
          laporanGuruNgaji: laporanGuruNgaji,
          totalSeluruhLaporan: totalSeluruhLaporan
        }
      };

    } catch (error) {
      console.error(
        "[AdminDashboardService.getSummary]",
        error
      );

      return {
        success: false,
        message: error.message
      };
    }
  },

  getReportPeriod({ tanggal, bulan }) {
    if (tanggal == null && bulan == null) return null;
    if (bulan == null && typeof tanggal === "string" && /^\d{4}-\d{2}-\d{2}$/.test(tanggal)) {
      const date = new Date(tanggal + "T00:00:00Z");
      if (!isNaN(date.getTime()) && date.toISOString().slice(0, 10) === tanggal) {
        return { tanggal };
      }
    }
    if (tanggal == null && typeof bulan === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(bulan)) {
      return { bulan };
    }
    throw new Error("Pilih satu tanggal atau bulan laporan yang valid.");
  },

  getTeacherStatistics() {
    const stats = { total: 0, aktif: 0, nonaktif: 0, lainnya: 0 };
    const guruByNbm = new Map();
    for (const guru of GuruRepository.getAll()) {
      const nbm = Utils.normalizeText(guru.NBM);
      if (!nbm || guruByNbm.has(nbm)) continue;

      guruByNbm.set(nbm, {
        nama: Utils.normalizeText(guru.NAMA_GURU) || "Nama belum tersedia",
        kelas: 0,
        mapel: 0,
        ngaji: 0,
        total: 0
      });
      stats.total++;
      const status = Utils.normalizeText(guru.STATUS_AKUN).toUpperCase();
      if (status === "AKTIF") stats.aktif++;
      else if (status === "NONAKTIF") stats.nonaktif++;
      else stats.lainnya++;
    }
    return { statistikGuru: stats, guruByNbm };
  },

  /* =====================================
     GET ACTIVE ACADEMIC YEAR
  ===================================== */

  getActiveAcademicYear(ss) {
    const sheet = ss.getSheetByName("TAHUN_AJARAN");

    if (!sheet || sheet.getLastRow() < 2) {
      return null;
    }

    const values = sheet.getDataRange().getValues();
    const headers = values[0].map(header =>
      String(header).trim()
    );

    const idIndex = headers.indexOf("ID_TAHUN_AJARAN");
    const namaIndex = headers.indexOf("NAMA_TAHUN_AJARAN");
    const statusIndex = headers.indexOf("STATUS_TAHUN_AJARAN");

    if (idIndex === -1 || namaIndex === -1 || statusIndex === -1) {
      throw new Error("Header sheet TAHUN_AJARAN tidak lengkap.");
    }

    for (let i = 1; i < values.length; i++) {
      const status = String(values[i][statusIndex])
        .trim()
        .toUpperCase();

      if (status === "AKTIF") {
        return {
          ID_TAHUN_AJARAN: String(values[i][idIndex]).trim(),
          NAMA_TAHUN_AJARAN: values[i][namaIndex]
        };
      }
    }

    return null;
  },

  /* =====================================
     COUNT REPORTS
  ===================================== */

  countReports(ss, sheetName, idTahunAjaran, guruByNbm, category, periode) {
    const sheet = ss.getSheetByName(sheetName);

    if (!sheet || sheet.getLastRow() < 2) {
      return 0;
    }

    const values = sheet.getDataRange().getValues();
    const headers = values[0].map(header =>
      String(header).trim()
    );

    const tahunIndex = headers.indexOf("ID_TAHUN_AJARAN");
    const nbmIndex = headers.indexOf("NBM");
    const tanggalIndex = headers.indexOf("TANGGAL_LAPORAN");

    if (tahunIndex === -1) {
      throw new Error(
        "Kolom ID_TAHUN_AJARAN tidak ditemukan pada sheet " +
        sheetName
      );
    }
    if (periode && tanggalIndex === -1) {
      throw new Error("Kolom TANGGAL_LAPORAN tidak ditemukan pada sheet " + sheetName);
    }

    let total = 0;

    for (let i = 1; i < values.length; i++) {
      const id = String(values[i][tahunIndex]).trim();

      if (id === String(idTahunAjaran).trim()) {
        if (periode) {
          const value = values[i][tanggalIndex];
          const tanggal = value instanceof Date
            ? Utils.formatDate(value, "yyyy-MM-dd")
            : LaporanService.normalizeReportDate(value);
          if (periode.tanggal ? tanggal !== periode.tanggal : tanggal.slice(0, 7) !== periode.bulan) continue;
        }
        total++;
        const guru = guruByNbm.get(Utils.normalizeText(values[i][nbmIndex]));
        if (guru) {
          guru[category]++;
          guru.total++;
        }
      }
    }

    return total;
  }

};
