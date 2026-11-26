const AdminAbsensiService = {
  getWeeklyAbsences() {
    const today = Utils.formatDate(Utils.now(), "yyyy-MM-dd");
    const monday = new Date(today + "T00:00:00Z");
    monday.setUTCDate(monday.getUTCDate() - (monday.getUTCDay() + 6) % 7);
    const startDate = monday.toISOString().slice(0, 10);
    const year = Utils.normalizeText(TahunAjaranService.getActive().ID_TAHUN_AJARAN);
    const rows = AbsensiSiswaService.getSaved("", year, startDate, today)
      .filter(row => row.ID_SISWA && ["SAKIT", "IZIN", "ALPA"].includes(row.STATUS_KEHADIRAN));
    if (!rows.length) return { startDate, endDate: today, siswa: [] };

    const studentIds = new Set(rows.map(row => Utils.normalizeText(row.ID_SISWA)));
    const names = new Map();
    for (const student of SheetManager.getAll("SISWA")) {
      const id = Utils.normalizeText(student.ID_SISWA);
      if (studentIds.has(id) && Utils.normalizeText(student.ID_TAHUN_AJARAN) === year) {
        names.set(id, Utils.normalizeText(student.NAMA_SISWA));
      }
    }
    const classNames = new Map(KelasService.getActiveClasses().map(row =>
      [Utils.normalizeText(row.ID_KELAS), row.NAMA_KELAS]
    ));
    const grouped = new Map();
    const counted = new Set();
    for (const row of rows) {
      const id = Utils.normalizeText(row.ID_SISWA);
      const classId = Utils.normalizeText(row.ID_KELAS);
      const date = AbsensiSiswaService.getDateKey(row.TANGGAL_ABSENSI);
      const dayKey = JSON.stringify([classId, id, date]);
      if (counted.has(dayKey)) continue;
      counted.add(dayKey);
      const key = JSON.stringify([classId, id]);
      if (!grouped.has(key)) {
        grouped.set(key, { nama: names.get(id) || id, kelas: classNames.get(classId) || classId, SAKIT: 0, IZIN: 0, ALPA: 0 });
      }
      grouped.get(key)[row.STATUS_KEHADIRAN]++;
    }
    return {
      startDate,
      endDate: today,
      siswa: Array.from(grouped.values()).sort((a, b) =>
        a.kelas.localeCompare(b.kelas, "id") || a.nama.localeCompare(b.nama, "id")
      )
    };
  },

  getContext(payload) {
    const date = LaporanService.validateTanggal(payload.tanggal);
    const activeYear = TahunAjaranService.getActive();
    return {
      date,
      year: Utils.normalizeText(activeYear.ID_TAHUN_AJARAN),
      yearName: activeYear.NAMA_TAHUN_AJARAN,
    };
  },

  getSummary(payload) {
    const { date, year, yearName } = this.getContext(payload);
    const byClass = new Map();
    for (const row of AbsensiSiswaService.getSaved("", year, date)) {
      const classId = Utils.normalizeText(row.ID_KELAS);
      if (!byClass.has(classId)) byClass.set(classId, []);
      byClass.get(classId).push(row);
    }

    return {
      tahunAjaran: yearName,
      kelas: KelasService.getActiveClasses().map(item => {
        const id = Utils.normalizeText(item.ID_KELAS);
        const rows = byClass.get(id);
        return { id, nama: item.NAMA_KELAS, totals: rows ? AbsensiSiswaService.getSavedTotals(rows) : null };
      })
    };
  },

  getDetail(payload) {
    const { date, year } = this.getContext(payload);
    const classId = Utils.normalizeText(payload.idKelas);
    if (!classId) throw new Error("Pilih kelas untuk membuka detail.");

    const rows = AbsensiSiswaService.getSaved(classId, year, date);
    const absence = rows.filter(row => row.ID_SISWA &&
      ["SAKIT", "IZIN", "ALPA"].includes(row.STATUS_KEHADIRAN));
    const names = new Map();
    if (absence.length) {
      const ids = new Set(absence.map(row => Utils.normalizeText(row.ID_SISWA)));
      for (const student of SheetManager.getAll("SISWA")) {
        const id = Utils.normalizeText(student.ID_SISWA);
        if (ids.has(id) && Utils.normalizeText(student.ID_TAHUN_AJARAN) === year) {
          names.set(id, Utils.normalizeText(student.NAMA_SISWA));
        }
      }
    }
    return {
      recorded: rows.length > 0,
      siswa: absence.map(row => {
        const id = Utils.normalizeText(row.ID_SISWA);
        return { nama: names.get(id) || id, status: row.STATUS_KEHADIRAN };
      })
    };
  },

  getMonthly(payload) {
    const activeYear = TahunAjaranService.getActive();
    const yearId = Utils.normalizeText(activeYear.ID_TAHUN_AJARAN);
    const yearName = Utils.normalizeText(activeYear.NAMA_TAHUN_AJARAN);
    const academicYear = /^(\d{4})\s*\/\s*(\d{4})$/.exec(yearName);
    if (!academicYear || Number(academicYear[2]) !== Number(academicYear[1]) + 1) {
      throw new Error("Format tahun ajaran harus seperti 2026/2027.");
    }
    const id = Utils.normalizeText(payload.idKelas);
    const kelas = KelasService.getActiveClasses().find(item => Utils.normalizeText(item.ID_KELAS) === id);
    if (!kelas) throw new Error("Pilih kelas aktif untuk mencetak rekap.");

    const months = Array.from({ length: 12 }, (_, index) => {
      const month = (index + 6) % 12 + 1;
      const year = academicYear[index < 6 ? 1 : 2];
      return `${year}-${String(month).padStart(2, "0")}`;
    });
    const monthIndexes = new Map(months.map((month, index) => [month, index]));
    const statusIndexes = new Map([["SAKIT", 0], ["IZIN", 1], ["ALPA", 2]]);
    const students = new Map();
    const names = new Map();
    const addStudent = (studentId, name) => {
      if (!students.has(studentId)) {
        students.set(studentId, { nama: name || studentId, counts: months.map(() => [0, 0, 0]) });
      }
      return students.get(studentId);
    };
    for (const row of SheetManager.getAll("SISWA")) {
      if (Utils.normalizeText(row.ID_TAHUN_AJARAN) !== yearId) continue;
      const studentId = Utils.normalizeText(row.ID_SISWA);
      if (!studentId) continue;
      const name = Utils.normalizeText(row.NAMA_SISWA);
      names.set(studentId, name);
      if (Utils.normalizeText(row.ID_KELAS) === id && Utils.toUpperCase(row.STATUS_SISWA) === "AKTIF") {
        addStudent(studentId, name);
      }
    }

    const counted = new Set();
    for (const row of SheetManager.getAll("ABSENSI_SISWA")) {
      if (Utils.normalizeText(row.ID_TAHUN_AJARAN) !== yearId ||
          Utils.normalizeText(row.ID_KELAS) !== id) continue;
      const studentId = Utils.normalizeText(row.ID_SISWA);
      const statusIndex = statusIndexes.get(row.STATUS_KEHADIRAN);
      if (!studentId || statusIndex === undefined) continue;
      const date = row.TANGGAL_ABSENSI instanceof Date
        ? Utils.formatDate(row.TANGGAL_ABSENSI, "yyyy-MM-dd")
        : Utils.normalizeText(row.TANGGAL_ABSENSI);
      const monthIndex = monthIndexes.get(date.slice(0, 7));
      const key = JSON.stringify([studentId, date]);
      if (monthIndex === undefined || counted.has(key)) continue;
      counted.add(key);
      addStudent(studentId, names.get(studentId)).counts[monthIndex][statusIndex]++;
    }

    return {
      kelas: kelas.NAMA_KELAS,
      tahunAjaran: yearName,
      bulan: months,
      siswa: Array.from(students.values()).sort((a, b) => a.nama.localeCompare(b.nama, "id"))
    };
  },
};
