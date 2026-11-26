
function testInformasiSekolahRBAC() {

  const roles = [
    {
      role: "ADMIN",
      allowed: ["KURIKULUM", "GURU_NGAJI"]
    },
    {
      role: "ADMIN_KURIKULUM",
      allowed: ["KURIKULUM"]
    },
    {
      role: "ADMIN_GURU_NGAJI",
      allowed: ["GURU_NGAJI"]
    }
  ];

  let passed = 0;

  function assert(condition, message) {
    if (!condition) {
      throw new Error("FAIL: " + message);
    }

    passed++;
    Logger.log("PASS " + passed + ": " + message);
  }

  roles.forEach(item => {

    const actual =
      AdminPermission.getAllowedInformationSources(
        item.role
      );

    assert(
      JSON.stringify(actual) ===
      JSON.stringify(item.allowed),
      item.role + " memiliki sumber yang benar."
    );

  });

  assert(
    AdminPermission.assertInformationSource(
      "ADMIN_KURIKULUM",
      "KURIKULUM"
    ) === "KURIKULUM",
    "Kurikulum boleh mengakses KURIKULUM."
  );

  assert(
    AdminPermission.assertInformationSource(
      "ADMIN_GURU_NGAJI",
      "GURU_NGAJI"
    ) === "GURU_NGAJI",
    "Guru Ngaji boleh mengakses GURU_NGAJI."
  );

  function isDenied(role, source) {
    try {
      AdminPermission.assertInformationSource(
        role,
        source
      );
      return false;
    } catch (error) {
      return true;
    }
  }

  assert(
    isDenied("ADMIN_KURIKULUM", "GURU_NGAJI"),
    "Kurikulum ditolak mengakses GURU_NGAJI."
  );

  assert(
    isDenied("ADMIN_GURU_NGAJI", "KURIKULUM"),
    "Guru Ngaji ditolak mengakses KURIKULUM."
  );

  assert(
    isDenied("ROLE_TIDAK_VALID", "KURIKULUM"),
    "Role tidak valid ditolak."
  );

  Logger.log(
    "=== INFORMASI SEKOLAH RBAC: " +
    passed + "/8 PASS ==="
  );

}
