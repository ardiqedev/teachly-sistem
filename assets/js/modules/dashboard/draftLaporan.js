const DraftLaporan = {
  maxBatchSize: 3,
  categories: {
    KEPALA_SEKOLAH: {
      label: "Kepala Sekolah",
      fields: [["kegiatanKepalaSekolah", "Kegiatan"], ["catatanKepalaSekolah", "Catatan"]],
    },
    GURU_KELAS: {
      label: "Guru Kelas",
      fields: [
        ["idKelasLaporan", "Kelas"],
        ["haditsDoaKelas", "Hadits dan Doa"],
        ["pendidikanAdabKelas", "Pendidikan Adab"],
        ["ringkasanPembelajaranKelas", "Ringkasan Pembelajaran"],
        ["catatanKelas", "Catatan"],
      ],
    },
    GURU_MAPEL: {
      label: "Guru Mapel",
      fields: [
        ["idKelasMapelLaporan", "Kelas"],
        ["idMapelLaporan", "Mata Pelajaran"],
        ["ringkasanPembelajaranMapel", "Ringkasan Pembelajaran"],
        ["catatanMapel", "Catatan"],
      ],
    },
    GURU_NGAJI: {
      label: "Guru Ngaji",
      fields: [
        ["idSesiNgajiLaporan", "Sesi"],
        ["halamanSuratAyat", "Halaman / Surat / Ayat"],
        ["hafalanQuran", "Hafalan Al-Qur’an"],
        ["catatanPembelajaranNgaji", "Catatan Pembelajaran"],
        ["catatanNgaji", "Catatan"],
      ],
    },
  },

  async init() {
    const root = document.getElementById("draftLaporanPage");
    const nbm = String(Auth.getGuru()?.NBM || "").trim();
    if (!root) return;
    if (!nbm) {
      await Router.navigate("login");
      return;
    }

    const list = root.querySelector("[data-draft-list]");
    const status = root.querySelector("[data-draft-status]");
    const send = root.querySelector("[data-send-drafts]");
    const create = root.querySelector("[data-create-draft]");
    const choices = () => Array.from(list.querySelectorAll("[data-draft-select]"));
    const selected = () => choices().filter((input) => input.checked && !input.disabled);
    root.querySelector("[data-draft-limit]").textContent =
      `Maksimal ${this.maxBatchSize} draft setiap pengiriman.`;
    const updateSelection = () => {
      const checks = choices();
      const count = checks.filter((input) => input.checked && input.dataset.eligible === "true").length;
      for (const input of checks) {
        input.disabled = input.dataset.eligible !== "true" || (!input.checked && count >= this.maxBatchSize);
      }
      send.disabled = this.sending || this.deleting || !count;
      send.textContent = this.sending
        ? "Mengirim…"
        : count ? `Kirim Terpilih (${count}/${this.maxBatchSize})` : "Kirim Terpilih";
    };

    const render = async (keepSelected = [], errors = new Map()) => {
      try {
        const drafts = await ReportDraft.access(nbm, "list");
        if (!root.isConnected) return;
        drafts.sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0));
        list.replaceChildren(...drafts.map((draft) =>
          this.renderCard(nbm, draft, keepSelected.includes(draft.id), errors.get(draft.revision) || draft.failure, removeDraft)
        ));
        if (!drafts.length) list.textContent = "Belum ada draft laporan.";
      } catch (error) {
        console.error("[DraftLaporan] Gagal memuat draft:", error);
        list.textContent = "Draft tidak dapat dimuat dari browser.";
      }
      updateSelection();
    };

    const removeDraft = async (draft) => {
      if (this.sending || this.deleting || String(Auth.getGuru()?.NBM || "").trim() !== nbm) return;
      const confirmed = await Confirm.ask({
        title: "Hapus draft?",
        message: "Draft ini beserta lampirannya akan dihapus dari browser.",
        confirmText: "Hapus Draft",
        type: "danger",
      });
      if (!confirmed || !root.isConnected || this.sending ||
          this.deleting || String(Auth.getGuru()?.NBM || "").trim() !== nbm) return;

      const keepSelected = selected().map((input) => input.value);
      this.deleting = true;
      list.inert = true;
      create.disabled = true;
      updateSelection();
      try {
        const removed = await ReportDraft.access(nbm, "remove", draft);
        if (removed) Toast.success("Draft dihapus.");
        else Toast.info("Draft sudah berubah atau telah dihapus. Daftar diperbarui.");
      } catch (error) {
        console.error("[DraftLaporan] Gagal menghapus draft:", error);
        Toast.error("Draft gagal dihapus. Coba lagi.");
      } finally {
        if (root.isConnected) await render(keepSelected);
        this.deleting = false;
        list.inert = false;
        create.disabled = false;
        updateSelection();
      }
    };

    create.addEventListener("click", () => {
      if (!this.sending) void Dashboard.openCreateReport();
    });
    list.addEventListener("change", updateSelection);
    send.addEventListener("click", async () => {
      if (this.sending || this.deleting || !selected().length) return;
      const picks = selected().map((input) => ({ id: input.value, revision: input.dataset.revision }));
      if (picks.length > this.maxBatchSize) {
        Toast.warning(`Pilih maksimal ${this.maxBatchSize} draft setiap pengiriman.`);
        return;
      }
      this.sending = true;
      root.setAttribute("aria-busy", "true");
      list.inert = true;
      create.disabled = true;
      status.textContent = "Mengirim draft terpilih…";
      updateSelection();

      let sent = 0;
      let cleanupFailed = false;
      const errors = new Map();
      try {
        for (const [index, pick] of picks.entries()) {
          status.textContent = `Memproses draft ${index + 1} dari ${picks.length}…`;
          try {
            if (String(Auth.getGuru()?.NBM || "").trim() !== nbm) {
              throw new Error("Sesi guru berubah. Silakan masuk kembali.");
            }
            const draft = await ReportDraft.access(nbm, "get", pick);
            if (!draft || draft.revision !== pick.revision) {
              throw new Error("Draft telah berubah. Periksa kembali isinya.");
            }
            const { endpoint, payload } = Dashboard.buildDraftRequest(nbm, draft);
            const response = await API.post(endpoint, payload);
            if (response?.success !== true) {
              throw new Error(response?.message || "Server gagal menerima laporan.");
            }
            sent++;
            try {
              await ReportDraft.access(nbm, "remove", draft);
            } catch (error) {
              this.sentRevisions.add(draft.revision);
              errors.set(pick.revision, { message: "Sudah terkirim, tetapi draft lokal gagal dibersihkan." });
              cleanupFailed = true;
            }
          } catch (error) {
            const uncertain = error.code === "API_TIMEOUT" || error.name === "TypeError";
            const failure = {
              uncertain,
              message: uncertain
                ? "Server belum mengonfirmasi. Cek Riwayat sebelum mengirim ulang."
                : error.message || "Gagal mengirim draft.",
            };
            errors.set(pick.revision, failure);
            try {
              await ReportDraft.access(nbm, "markFailed", { ...pick, failure });
            } catch (storageError) {
              console.warn("[DraftLaporan] Status gagal tidak dapat disimpan:", storageError);
            }
          }
        }
        const failed = picks.length - sent;
        const message = `${sent} laporan terkirim.${failed ? ` ${failed} laporan belum terkonfirmasi dan tetap di Draft.` : ""}`;
        if (!sent) Toast.error(message);
        else if (failed || cleanupFailed) Toast.warning(
          cleanupFailed ? `${message} Ada draft terkirim yang gagal dibersihkan.` : message,
        );
        else Toast.success(message);
      } catch (error) {
        console.error("[DraftLaporan] Gagal membaca pilihan draft:", error);
        Toast.error("Draft terpilih tidak dapat dibaca. Coba lagi.");
      } finally {
        this.sending = false;
        status.textContent = "";
        root.removeAttribute("aria-busy");
        list.inert = false;
        create.disabled = false;
        if (root.isConnected) {
          await render(picks.map((pick) => pick.id), errors);
        }
      }
    });

    await render();
  },

  sending: false,
  deleting: false,
  sentRevisions: new Set(),

  renderCard(nbm, draft, selected, error, removeDraft) {
    const make = (tag, text, className) => {
      const node = document.createElement(tag);
      if (text) node.textContent = text;
      if (className) node.className = className;
      return node;
    };
    const category = this.categories[draft.fields.kategoriLaporan?.value];
    const title = category?.label || "Kategori belum dipilih";
    const date = draft.fields.tanggalLaporan?.value;
    const card = make("article", "", "draft-card");
    const heading = make("div", "", "draft-card-heading");
    const checkbox = make("input");
    checkbox.type = "checkbox";
    checkbox.dataset.draftSelect = "";
    checkbox.value = draft.id;
    checkbox.dataset.revision = draft.revision;
    checkbox.setAttribute("aria-label", `Pilih ${title}, ${date || "tanpa tanggal"}`);
    let validation = "";
    try {
      Dashboard.buildDraftRequest(nbm, draft);
    } catch (error) {
      validation = error.message;
    }
    const sent = this.sentRevisions.has(draft.revision);
    const status = sent
      ? ["Terkirim", "ready"]
      : validation
        ? ["Belum lengkap", "incomplete"]
        : error
          ? [error.uncertain ? "Perlu dicek" : "Gagal dikirim", "failed"]
          : ["Siap dikirim", "ready"];
    checkbox.disabled = Boolean(validation) || sent;
    checkbox.dataset.eligible = String(!checkbox.disabled);
    checkbox.checked = selected && !checkbox.disabled;
    const identity = make("div", "", "draft-card-identity");
    identity.append(
      make("h2", title),
      make("p", date ? Dashboard.formatDate(date) : "Tanggal belum diisi", "draft-card-date"),
    );
    heading.append(checkbox, identity, make("span", status[0], `draft-badge draft-badge--${status[1]}`));
    card.append(heading);

    const details = make("details");
    details.append(make("summary", "Detail"));
    const fields = make("dl", "", "draft-details");
    const addField = (label, value) => {
      const item = make("div", "", "draft-detail-item");
      item.append(make("dt", label), make("dd", value));
      fields.append(item);
    };
    for (const [id, label] of category?.fields || []) {
      const field = draft.fields[id];
      if (!field?.value) continue;
      addField(label, field.label || field.value);
    }
    if (draft.groups?.length) {
      addField("Kelompok Ngaji", draft.groups.map((group) => group.NAMA_KELOMPOK || group).join(", "));
    }

    if (draft.fields.kategoriLaporan?.value === "GURU_KELAS" && draft.attendance?.totals) {
      const attendance = make("ul", "", "draft-chip-list");
      attendance.setAttribute("aria-label", "Absensi");
      for (const [id, label] of [["HADIR", "Hadir"], ["SAKIT", "Sakit"], ["IZIN", "Izin"], ["ALPA", "Alpa"]]) {
        attendance.append(make("li", `${label} ${draft.attendance.totals[id]}`, "draft-chip"));
      }
      details.append(attendance);
    }
    if (fields.childElementCount) details.append(fields);

    const attachmentLabels = { MODUL_AJAR: "Modul Ajar", ASESMEN: "Asesmen", DOKUMENTASI: "Dokumentasi" };
    const attachments = make("ul", "", "draft-chip-list");
    attachments.setAttribute("aria-label", "Lampiran");
    for (const [key, data] of Object.entries(draft.uploads || {})) {
      const attachment = make("li", "", "draft-chip draft-chip--attachment");
      attachment.append(
        make("span", attachmentLabels[key]),
        make("strong", data.startsWith("data:application/pdf;") ? "PDF" : "Foto"),
      );
      attachments.append(attachment);
    }
    if (attachments.childElementCount) details.append(attachments);

    const edit = make("button", "Edit Draft", "btn btn-outline draft-card-edit");
    edit.type = "button";
    edit.disabled = sent;
    edit.addEventListener("click", () => {
      if (!this.sending) void Dashboard.openCreateReport(draft);
    });
    if (error || validation) card.append(make("p", error?.message || validation, "draft-card-message"));
    const remove = make("button", "Hapus Draft", "btn btn-outline draft-card-remove");
    remove.type = "button";
    remove.addEventListener("click", () => void removeDraft(draft));

    const actions = make("div", "", "draft-card-actions");
    actions.append(edit, remove);
    card.append(details, actions);
    return card;
  },
};
