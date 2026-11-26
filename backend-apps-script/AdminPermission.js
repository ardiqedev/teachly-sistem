
/**
 * =========================================
 * TEACHLY - ADMIN PERMISSION
 * RBAC V1
 * =========================================
 */

const AdminPermission = {

  ROLES: [
    "ADMIN",
    "ADMIN_KURIKULUM",
    "ADMIN_GURU_NGAJI"
  ],

  /*
   * Prefix endpoint berdasarkan modul.
   * ADMIN memiliki akses penuh.
   */
  RULES: [
    {
      prefix: "admin.absensi.",
      roles: ["ADMIN_KURIKULUM"]
    },

    // DATA GURU
    {
      prefix: "admin.guru.",
      roles: ["ADMIN_KURIKULUM"]
    },

    // DATA KELAS
    {
      prefix: "adminKelas.",
      roles: ["ADMIN_KURIKULUM"]
    },

    // MATA PELAJARAN
    {
      prefix: "adminMapel.",
      roles: ["ADMIN_KURIKULUM"]
    },

    // TAHUN AJARAN
    {
      prefix: "adminTahunAjaran.",
      roles: ["ADMIN_KURIKULUM"]
    },

    // KELOMPOK NGAJI
    {
      prefix: "adminKelompok.",
      roles: ["ADMIN_GURU_NGAJI"]
    },

    // SESI NGAJI
    {
      prefix: "adminSesi.",
      roles: ["ADMIN_GURU_NGAJI"]
    },

    // LAPORAN GURU
    {
      prefix: "admin.laporan.",
      roles: [
        "ADMIN_KURIKULUM",
        "ADMIN_GURU_NGAJI"
      ]
    },

    // DASHBOARD
    // DASHBOARD - ADMIN ONLY
    {
      prefix: "adminDashboard.",
      roles: ["ADMIN"]
    }

  ],

  /*
   * Endpoint khusus.
   *
   * CRUD Pengguna hanya untuk ADMIN.
   */
  ENDPOINT_RULES: {

    "adminAuth.logout": [
      "ADMIN",
      "ADMIN_KURIKULUM",
      "ADMIN_GURU_NGAJI"
    ],


    "pengguna.list": ["ADMIN"],
    "pengguna.create": ["ADMIN"],
    "pengguna.update": ["ADMIN"],
    "pengguna.updateStatus": ["ADMIN"],
    "pengguna.resetPassword": ["ADMIN"],
    "admin.guru.resetPassword": ["ADMIN"],

    "informasiSekolah.save": [
      "ADMIN",
      "ADMIN_KURIKULUM",
      "ADMIN_GURU_NGAJI"
    ],

    "informasiSekolah.list": [
      "ADMIN",
      "ADMIN_KURIKULUM",
      "ADMIN_GURU_NGAJI"
    ],

    "informasiSekolah.detail": [
      "ADMIN",
      "ADMIN_KURIKULUM",
      "ADMIN_GURU_NGAJI"
    ],

  },

  /**
   * Periksa izin berdasarkan role dan endpoint.
   */
  canAccess(role, endpoint) {

    const currentRole = String(
      role || ""
    ).trim().toUpperCase();

    const path = String(
      endpoint || ""
    ).trim();

    if (!this.ROLES.includes(currentRole)) {
      return false;
    }

    if (!path) {
      return false;
    }

    // Endpoint khusus
    if (
      Object.prototype.hasOwnProperty.call(
        this.ENDPOINT_RULES,
        path
      )
    ) {
      return this.ENDPOINT_RULES[path]
        .includes(currentRole);
    }

    // ADMIN memiliki akses penuh ke endpoint
    // yang telah diklasifikasikan terlindungi.
    if (currentRole === "ADMIN") {
      return true;
    }

    // Role terbatas hanya mengakses modul
    // yang tercantum dalam RULES.
    const rule = this.RULES.find(
      item => path.startsWith(item.prefix)
    );

    if (!rule) {
      return false;
    }

    return rule.roles.includes(currentRole);

  },


getAllowedInformationSources(role) {

  const currentRole = String(
    role || ""
  ).trim().toUpperCase();

  const rules = {
    ADMIN: [
      "KURIKULUM",
      "GURU_NGAJI",
      "KEPALA_SEKOLAH"
    ],

    ADMIN_KURIKULUM: [
      "KURIKULUM"
    ],

    ADMIN_GURU_NGAJI: [
      "GURU_NGAJI"
    ]
  };

  return rules[currentRole] || [];

},

assertInformationSource(role, source) {

  const normalizedSource = String(
    source || ""
  ).trim().toUpperCase();

  const allowed = this.getAllowedInformationSources(
    role
  );

  if (!allowed.includes(normalizedSource)) {
    throw new Error(
      "Anda tidak memiliki izin untuk sumber informasi ini."
    );
  }

  return normalizedSource;

}


};
