const AbsensiSiswaService = {
  statuses: ["HADIR", "SAKIT", "IZIN", "ALPA"],

  getAssignedClassIds(nbm, year) {
    if (!SheetManager.getDatabase().getSheetByName("PENUGASAN_GURU_KELAS")) return [];
    return SheetManager.getAll("PENUGASAN_GURU_KELAS")
      .filter(row => Utils.normalizeText(row.NBM_GURU) === nbm &&
        Utils.normalizeText(row.ID_TAHUN_AJARAN) === year)
      .map(row => Utils.normalizeText(row.ID_KELAS));
  },

  assertAssigned(nbm, classId, year) {
    if (!classId || !this.getAssignedClassIds(nbm, year).includes(classId)) {
      throw new Error("Kelas ini belum ditugaskan kepada akun guru Anda.");
    }
  },

  getRoster(classId, year) {
    const students = SheetManager.getAll("SISWA")
      .filter(row => Utils.normalizeText(row.ID_KELAS) === classId &&
        Utils.normalizeText(row.ID_TAHUN_AJARAN) === year &&
        Utils.toUpperCase(row.STATUS_SISWA) === "AKTIF")
      .map(row => ({
        id: Utils.normalizeText(row.ID_SISWA),
        nama: Utils.normalizeText(row.NAMA_SISWA)
      }));
    if (students.some(student => !student.id || !student.nama) ||
        new Set(students.map(student => student.id)).size !== students.length) {
      throw new Error("Data siswa kelas ini belum lengkap atau memiliki ID ganda.");
    }
    return students;
  },

  getSaved(classId, year, date, endDate = date) {
    return SheetManager.getAll("ABSENSI_SISWA").filter(row => {
      if ((classId && Utils.normalizeText(row.ID_KELAS) !== classId) ||
          Utils.normalizeText(row.ID_TAHUN_AJARAN) !== year) return false;
      const day = this.getDateKey(row.TANGGAL_ABSENSI);
      return day >= date && day <= endDate;
    });
  },

  getDateKey(value) {
    return value instanceof Date ? Utils.formatDate(value, "yyyy-MM-dd") : Utils.normalizeText(value);
  },

  read(payload) {
    const year = Utils.normalizeText(TahunAjaranService.getActive().ID_TAHUN_AJARAN);
    const classId = Utils.normalizeText(payload.ID_KELAS);
    const date = LaporanService.validateTanggal(payload.TANGGAL_LAPORAN);
    this.assertAssigned(payload.NBM, classId, year);
    const students = this.getRoster(classId, year);
    const saved = this.getSaved(classId, year, date);
    const savedStatuses = new Map(saved.filter(row => row.ID_SISWA).map(row => [
      Utils.normalizeText(row.ID_SISWA), row.STATUS_KEHADIRAN
    ]));
    return {
      year,
      recorded: saved.length > 0,
      students: students
        .filter(student => !saved.length || savedStatuses.has(student.id))
        .map(student => ({ ...student, status: savedStatuses.get(student.id) || "HADIR" })),
      totals: saved.length ? this.getSavedTotals(saved) : null
    };
  },

  countStatuses(statuses) {
    const totals = { HADIR: 0, SAKIT: 0, IZIN: 0, ALPA: 0 };
    statuses.forEach(status => {
      if (!this.statuses.includes(status)) throw new Error("Status kehadiran tidak valid.");
      totals[status]++;
    });
    return totals;
  },

  getSavedTotals(rows) {
    const totals = this.countStatuses(
      rows.filter(row => row.ID_SISWA).map(row => row.STATUS_KEHADIRAN)
    );
    const summary = rows.find(row => !row.ID_SISWA &&
      /^REKAP_HADIR:\d+$/.test(row.STATUS_KEHADIRAN));
    if (summary) totals.HADIR = Number(summary.STATUS_KEHADIRAN.split(":")[1]);
    return totals;
  },

  prepare(data, attendance) {
    const year = Utils.normalizeText(data.ID_TAHUN_AJARAN);
    const classId = data.ID_KELAS;
    const date = data.TANGGAL_LAPORAN;
    this.assertAssigned(data.NBM, classId, year);
    const saved = this.getSaved(classId, year, date);
    if (!attendance || attendance.year !== year ||
        attendance.classId !== classId || attendance.date !== date) {
      throw new Error("Buka dan simpan ulang draft untuk memuat absensi terbaru.");
    }
    if (saved.length) {
      if (!attendance.recorded) {
        const selection = new Map((attendance.entries || [])
          .filter(entry => entry.status !== "HADIR")
          .map(entry => [entry.id, entry.status]));
        const absent = saved.filter(row => row.ID_SISWA && row.STATUS_KEHADIRAN !== "HADIR");
        if (selection.size !== absent.length || absent.some(row =>
          selection.get(Utils.normalizeText(row.ID_SISWA)) !== row.STATUS_KEHADIRAN
        )) {
          throw new Error("Absensi kelas sudah dicatat. Buka dan simpan ulang draft untuk memakai rekap yang tersimpan.");
        }
      }
      return { totals: this.getSavedTotals(saved), rows: [] };
    }
    const roster = this.getRoster(classId, year);
    const entries = attendance.entries;
    const expectedCount = attendance.onlyAbsent ? attendance.studentCount : entries?.length;
    if (attendance.recorded || !roster.length || !Array.isArray(entries) || expectedCount !== roster.length) {
      throw new Error("Daftar siswa berubah atau kosong. Buka dan simpan ulang draft.");
    }
    const selections = new Map(entries.map(entry => [entry.id, entry.status]));
    const rosterIds = new Set(roster.map(student => student.id));
    if (selections.size !== entries.length || entries.some(entry => !rosterIds.has(entry.id)) ||
        (!attendance.onlyAbsent && selections.size !== roster.length)) {
      throw new Error("Daftar siswa yang dikirim tidak sesuai. Buka dan simpan ulang draft.");
    }
    const totals = this.countStatuses(roster.map(student =>
      selections.has(student.id) ? selections.get(student.id) : "HADIR"
    ));
    const makeRow = (id, status) => [
      year, date, classId, id, status, data.ID_LAPORAN, data.NBM, data.CREATED_AT
    ];
    const rows = [makeRow("", "REKAP_HADIR:" + totals.HADIR)];
    for (const [id, status] of selections) {
      if (status !== "HADIR") rows.push(makeRow(id, status));
    }
    return { totals, rows };
  },

  append(rows) {
    if (!rows.length) return null;
    const sheet = SheetManager.getSheet("ABSENSI_SISWA");
    const range = sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length);
    range.setValues(rows);
    return range;
  }
};
