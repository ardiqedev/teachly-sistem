
/**
 * =========================================
 * TEACHLY - ADMIN BOOTSTRAP
 * Jalankan sekali dari Apps Script Editor.
 * Bukan endpoint Router.
 * =========================================
 */

function bootstrapFirstAdmin() {

  const properties =
    PropertiesService.getScriptProperties();

  const propertyName =
    "TEACHLY_BOOTSTRAP_ADMIN_PASSWORD";

  const password =
    properties.getProperty(propertyName);

  if (!password) {
    throw new Error(
      "Atur TEACHLY_BOOTSTRAP_ADMIN_PASSWORD " +
      "di Script Properties terlebih dahulu."
    );
  }

  // Jangan membuat Admin bootstrap apabila
  // sudah ada data pengguna.
  const existing =
    PenggunaRepository.getAll();

  if (existing.length > 0) {
    throw new Error(
      "Bootstrap ditolak: sheet PENGGUNA " +
      "sudah memiliki data."
    );
  }

  // Menggunakan validasi dan hash V2
  // dari PenggunaService.
  const admin = PenggunaService.create({
    USERNAME: "admin",
    PASSWORD: password,
    NAMA_PENGGUNA: "Administrator",
    ROLE: "ADMIN"
  });

  properties.deleteProperty(propertyName);

  console.log(
    "BOOTSTRAP BERHASIL: " +
    admin.ID_PENGGUNA +
    " | " +
    admin.USERNAME
  );

  return admin;

}
