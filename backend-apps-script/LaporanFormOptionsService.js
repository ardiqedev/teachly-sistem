
const LaporanFormOptionsService = {

  getAll(nbm) {

    const kelas = KelasService.getActiveClasses();
    const year = nbm ? Utils.normalizeText(TahunAjaranService.getActive().ID_TAHUN_AJARAN) : "";
    const assigned = new Set(nbm ? AbsensiSiswaService.getAssignedClassIds(nbm, year) : []);
    const mataPelajaran = MataPelajaranService.getActive();
    const kelompokNgaji = KelompokNgajiService.getActive();
    const sesiNgaji = SesiNgajiService.getActive();

    return {

      GURU_KELAS: {
        kelas: kelas.filter(item => assigned.has(Utils.normalizeText(item.ID_KELAS)))
      },

      GURU_MAPEL: {
        kelas: kelas,
        mataPelajaran: mataPelajaran
      },

      GURU_NGAJI: {
        kelompokNgaji: kelompokNgaji,
        sesiNgaji: sesiNgaji
      }

    };

  }

};



function testLaporanFormOptions() {

  const result = LaporanFormOptionsService.getAll();

  console.log(
    "FORM OPTIONS:",
    JSON.stringify(result)
  );

}



function testLaporanMasterData() {

  console.log(
    "DATA KELAS:",
    JSON.stringify(KelasService.getActiveClasses())
  );

  console.log(
    "DATA MAPEL:",
    JSON.stringify(MataPelajaranService.getActive())
  );

  console.log(
    "DATA KELOMPOK NGAJI:",
    JSON.stringify(KelompokNgajiService.getActive())
  );

  console.log(
    "DATA SESI NGAJI:",
    JSON.stringify(SesiNgajiService.getActive())
  );

}



function testLaporanMasterRawData() {

  const sheets = [
    "KELAS",
    "MATA_PELAJARAN",
    "KELOMPOK_NGAJI",
    "SESI_NGAJI"
  ];

  sheets.forEach(sheetKey => {

    const data = SheetManager.getAll(sheetKey);

    console.log(
      "RAW " + sheetKey + ":",
      JSON.stringify(data)
    );

  });

}


