
function testAdminLaporanRBAC() {

  const service = AdminLaporanService;

  const accounts = {
    admin: {
      ID_PENGGUNA: "test_admin",
      ROLE: "ADMIN"
    },
    kurikulum: {
      ID_PENGGUNA: "test_kurikulum",
      ROLE: "ADMIN_KURIKULUM"
    },
    ngaji: {
      ID_PENGGUNA: "test_ngaji",
      ROLE: "ADMIN_GURU_NGAJI"
    }
  };

  let passed = 0;

  function assert(condition, message) {
    if (!condition) {
      throw new Error("FAIL: " + message);
    }

    passed++;
    Logger.log("PASS " + passed + ": " + message);
  }

  function isDenied(category, account) {
    try {
      service.assertCategoryAccess(category, account);
      return false;
    } catch (error) {
      return true;
    }
  }

  assert(
    service.getAllowedCategories(accounts.admin).length === 3,
    "ADMIN memiliki 3 kategori."
  );

  assert(
    service.getAllowedCategories(accounts.kurikulum).length === 2,
    "ADMIN_KURIKULUM memiliki 2 kategori."
  );

  assert(
    service.getAllowedCategories(accounts.ngaji).length === 1,
    "ADMIN_GURU_NGAJI memiliki 1 kategori."
  );

  assert(
    service.assertCategoryAccess(
      "GURU_KELAS",
      accounts.kurikulum
    ) === "GURU_KELAS",
    "Kurikulum dapat mengakses Guru Kelas."
  );

  assert(
    service.assertCategoryAccess(
      "GURU_NGAJI",
      accounts.kurikulum
    ) === "GURU_NGAJI",
    "Kurikulum dapat mengakses Guru Ngaji."
  );

  assert(
    isDenied("GURU_MAPEL", accounts.kurikulum),
    "Kurikulum ditolak untuk Guru Mapel."
  );

  assert(
    isDenied("GURU_KELAS", accounts.ngaji),
    "Admin Guru Ngaji ditolak untuk Guru Kelas."
  );

  assert(
    isDenied("GURU_MAPEL", accounts.ngaji),
    "Admin Guru Ngaji ditolak untuk Guru Mapel."
  );

  assert(
    service.assertCategoryAccess(
      "GURU_NGAJI",
      accounts.ngaji
    ) === "GURU_NGAJI",
    "Admin Guru Ngaji dapat mengakses Guru Ngaji."
  );

  assert(
    isDenied("GURU_NGAJI", null),
    "Request tanpa identitas Admin ditolak."
  );

  Logger.log(
    "=== ADMIN LAPORAN RBAC: " +
    passed + "/10 PASS ==="
  );

}


function setupPepperV2Once() {
  const props = PropertiesService.getScriptProperties();
  const key = "TEACHLY_PASSWORD_PEPPER_V2";

  if (props.getProperty(key)) {
    console.log("Pepper V2 sudah tersedia. Tidak diubah.");
    return;
  }

  const pepper = Array.from({ length: 4 }, () =>
    Utilities.getUuid().replace(/-/g, "")
  ).join("");

  props.setProperty(key, pepper);

  console.log("Pepper V2 berhasil disimpan.");
}
