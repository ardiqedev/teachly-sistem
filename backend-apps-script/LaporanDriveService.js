
/**
 * ============================================================
 * TEACHLY - LAPORAN DRIVE SERVICE
 * QEDEV BACKEND STANDARD
 * ============================================================
 *
 * Tanggung jawab:
 * 1. Menyimpan foto dan PDF laporan ke Google Drive.
 * 2. Mengelola upload MODUL_AJAR.
 * 3. Mengelola upload ASESMEN.
 * 4. Mengelola upload DOKUMENTASI.
 * 5. Menghapus file jika proses penyimpanan laporan gagal.
 *
 * Catatan:
 * - Kompresi gambar dilakukan frontend.
 * - Tidak ada validasi batas ukuran 100 KB.
 * - File tetap mengikuti akses folder Drive.
 * - Tidak mengaktifkan akses publik.
 *
 * ============================================================
 */

const LaporanDriveService = {

  // ==========================================================
  // KONFIGURASI
  // ==========================================================

  FOLDER_ID: "1qghGLZNYMvs7TiYFgMAzH14NAdM_GHef",

  ALLOWED_FIELDS: [
    "MODUL_AJAR",
    "ASESMEN",
    "DOKUMENTASI"
  ],


  // ==========================================================
  // VALIDASI LAMPIRAN
  // ==========================================================

  validateAttachment(attachment, field) {

    let dataUrl = "";

      if (typeof attachment === "string") {
        dataUrl = attachment;
      } else if (
        attachment &&
        typeof attachment === "object" &&
        !Array.isArray(attachment)
      ) {
        dataUrl = String(attachment.data || "");
      } else {
        throw new Error("Data lampiran " + field + " tidak valid.");
      }

    const match = dataUrl.match(
      /^data:(image\/jpeg|application\/pdf);base64,([A-Za-z0-9+/]+={0,2})$/i
    );

    if (!match) {
      throw new Error(
        "Format lampiran " + field + " harus JPEG atau PDF."
      );
    }

    const mimeType = match[1].toLowerCase();
    const isPdf = mimeType === "application/pdf";
    const encoded = match[2];
    const maxPdfBytes = 5 * 1024 * 1024;

    if (isPdf && encoded.length > Math.ceil(maxPdfBytes / 3) * 4) {
      throw new Error("Ukuran PDF " + field + " maksimal 5 MB.");
    }

    let bytes;

    try {
      bytes = Utilities.base64Decode(encoded);
    } catch (error) {
      throw new Error(
        "Data lampiran " + field + " tidak dapat dibaca."
      );
    }

    if (isPdf) {
      if (bytes.length > maxPdfBytes) {
        throw new Error("Ukuran PDF " + field + " maksimal 5 MB.");
      }
      const header = [37, 80, 68, 70, 45];
      if (!header.every((byte, index) => bytes[index] === byte)) {
        throw new Error("Isi lampiran " + field + " bukan PDF yang valid.");
      }
      return { bytes, mimeType, extension: ".pdf" };
    }

    if (
      bytes.length < 3 ||
      (bytes[0] & 255) !== 0xFF ||
      (bytes[1] & 255) !== 0xD8 ||
      (bytes[2] & 255) !== 0xFF
    ) {
      throw new Error(
        "Isi gambar " + field + " bukan JPEG yang valid."
      );
    }

    return { bytes, mimeType, extension: ".jpg" };

  },


  // ==========================================================
  // UPLOAD SATU LAMPIRAN
  // ==========================================================

  upload(attachment, field, laporanId) {

    if (!this.ALLOWED_FIELDS.includes(field)) {
      throw new Error(
        "Jenis upload tidak diizinkan: " + field
      );
    }

    const { bytes, mimeType, extension } = this.validateAttachment(attachment, field);

    const folder = DriveApp.getFolderById(this.FOLDER_ID);

    const fileName =
      laporanId + "_" +
      field + "_" +
      Utilities.getUuid() +
      extension;

    const blob = Utilities.newBlob(
      bytes,
      mimeType,
      fileName
    );

    const file = folder.createFile(blob);

    return {
      id: file.getId(),
      url: extension === ".pdf"
        ? file.getUrl() + "#teachly-pdf"
        : file.getUrl()
    };

  },


  // ==========================================================
  // UPLOAD SEMUA LAMPIRAN
  // ==========================================================

  uploadAll(uploads, laporanId) {

    if (
      !uploads ||
      typeof uploads !== "object" ||
      Array.isArray(uploads)
    ) {
      throw new Error("Data upload laporan tidak valid.");
    }

    const unknownFields = Object.keys(uploads).filter(
      field => !this.ALLOWED_FIELDS.includes(field)
    );

    if (unknownFields.length) {
      throw new Error(
        "Jenis upload tidak dikenal: " + unknownFields.join(", ")
      );
    }

    const result = {
      MODUL_AJAR: "",
      ASESMEN: "",
      DOKUMENTASI: ""
    };

    const createdFiles = [];

    try {

      this.ALLOWED_FIELDS.forEach(field => {

        const attachment = uploads[field];

        // Upload bersifat opsional.
        if (!attachment) return;

        const uploaded = this.upload(
          attachment,
          field,
          laporanId
        );

        result[field] = uploaded.url;
        createdFiles.push(uploaded.id);

      });

      return {
        data: result,
        fileIds: createdFiles
      };

    } catch (error) {

      this.rollback(createdFiles);

      throw error;

    }

  },


  // ==========================================================
  // ROLLBACK FILE
  // ==========================================================

  rollback(fileIds) {

    (fileIds || []).forEach(fileId => {

      try {

        DriveApp
          .getFileById(fileId)
          .setTrashed(true);

      } catch (error) {

        console.error(
          "[LaporanDriveService] Rollback gagal:",
          fileId,
          error
        );

      }

    });

  }

};
