const AdminAbsensi = {
  render() {
    return `
      <section class="admin-panel" data-admin-absensi>
        <form class="admin-report-period">
          <label>Tanggal <input type="date" name="tanggal" required></label>
          <label>Kelas <select name="kelas"><option value="">Semua kelas</option></select></label>
          <button type="submit" class="btn btn-primary">Muat Rekap</button>
          <p role="status"></p>
        </form>
        <div class="admin-guru-table-wrapper">
          <table class="admin-guru-table" aria-label="Rekap absensi siswa">
            <thead>
              <tr>
                <th scope="col">Kelas</th><th scope="col">Status</th>
                <th scope="col">Hadir</th><th scope="col">Sakit</th>
                <th scope="col">Izin</th><th scope="col">Alpa</th>
                <th scope="col">Aksi</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
      </section>
    `;
  },

  init(root) {
    const form = root.querySelector("form");
    const date = form.elements.tanggal;
    const classSelect = form.elements.kelas;
    const status = form.querySelector("[role='status']");
    const table = root.querySelector("tbody");
    let rows = [];
    let currentDate = "";
    let requestId = 0;
    let detailId = 0;
    const parts = new Intl.DateTimeFormat("en", {
      timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit",
    }).formatToParts(new Date());
    const { year, month, day } = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
    date.value = `${year}-${month}-${day}`;

    const renderRows = () => {
      table.replaceChildren();
      for (const row of rows) {
        if (classSelect.value && row.id !== classSelect.value) continue;
        const tr = table.insertRow();
        tr.insertCell().textContent = row.nama;
        const badge = document.createElement("span");
        badge.className = `admin-guru-badge ${row.totals ? "active" : "inactive"}`;
        badge.textContent = row.totals ? "Sudah mengisi" : "Belum mengisi";
        tr.insertCell().append(badge);
        for (const key of ["HADIR", "SAKIT", "IZIN", "ALPA"]) {
          tr.insertCell().textContent = row.totals?.[key] ?? "—";
        }
        const actions = document.createElement("div");
        actions.className = "admin-guru-actions";
        tr.insertCell().append(actions);
        if (row.totals) {
          const button = document.createElement("button");
          button.type = "button";
          button.className = "btn btn-outline";
          button.textContent = "Detail";
          button.setAttribute("aria-label", `Detail absensi ${row.nama}`);
          button.addEventListener("click", async () => {
            const id = ++detailId;
            button.disabled = true;
            const selectedDate = currentDate;
            try {
              const response = await API.post("admin.absensi.detail", {
                tanggal: selectedDate, idKelas: row.id,
              });
              if (!root.isConnected || id !== detailId || !button.isConnected) return;
              if (!response?.success) throw new Error(response?.message || "Detail absensi gagal dimuat.");
              this.showDetail(row.nama, selectedDate, response.data);
            } catch (error) {
              if (root.isConnected && id === detailId) Toast.error(error.message);
            } finally {
              button.disabled = false;
            }
          });
          actions.append(button);
        }

        const preview = document.createElement("button");
        preview.type = "button";
        preview.className = "btn btn-outline";
        preview.textContent = "Preview PDF";
        preview.setAttribute("aria-label", `Preview PDF kelas ${row.nama}`);
        preview.addEventListener("click", async () => {
          const id = ++detailId;
          preview.disabled = true;
          try {
            const response = await API.post("admin.absensi.monthly", { idKelas: row.id });
            if (!root.isConnected || id !== detailId || !preview.isConnected) return;
            if (!response?.success) throw new Error(response?.message || "Preview rekap gagal dimuat.");
            this.showMonthlyPreview(response.data);
          } catch (error) {
            if (root.isConnected && id === detailId) Toast.error(error.message);
          } finally {
            preview.disabled = false;
          }
        });
        actions.append(preview);
      }
    };

    const load = async () => {
      const id = ++requestId;
      detailId++;
      const selectedDate = date.value;
      status.textContent = "Memuat rekap…";
      table.replaceChildren();
      classSelect.disabled = true;
      try {
        const response = await API.post("admin.absensi.summary", { tanggal: selectedDate });
        if (!root.isConnected || id !== requestId) return;
        if (!response?.success) throw new Error(response?.message || "Rekap absensi gagal dimuat.");
        currentDate = selectedDate;
        rows = response.data.kelas;
        const previousClass = classSelect.value;
        classSelect.replaceChildren(new Option("Semua kelas", ""), ...rows.map(row =>
          new Option(row.nama, row.id)
        ));
        if (rows.some(row => row.id === previousClass)) classSelect.value = previousClass;
        classSelect.disabled = !rows.length;
        const recorded = rows.filter(row => row.totals).length;
        status.textContent = rows.length
          ? `${selectedDate} · Tahun ajaran ${response.data.tahunAjaran} · ${recorded} dari ${rows.length} kelas sudah mengisi`
          : "Belum ada kelas aktif.";
        renderRows();
      } catch (error) {
        if (root.isConnected && id === requestId) status.textContent = error.message;
      }
    };

    classSelect.addEventListener("change", () => {
      detailId++;
      renderRows();
    });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      void load();
    });
    void load();
  },

  showDetail(className, date, data) {
    Modal.open({
      title: "Detail Absensi Siswa",
      body: '<div id="adminAbsensiDetail"><p></p><ul></ul></div>',
      footer: '<button type="button" class="btn btn-outline" id="adminAbsensiClose">Tutup</button>',
    });
    const root = document.getElementById("adminAbsensiDetail");
    const list = root.querySelector("ul");
    root.querySelector("p").textContent = `${className} · ${date}`;
    if (!data.siswa.length) {
      const item = document.createElement("li");
      item.textContent = data.recorded ? "Tidak ada siswa yang sakit, izin, atau alpa." : "Absensi belum tercatat.";
      list.append(item);
    }
    for (const { nama, status } of data.siswa) {
      const item = document.createElement("li");
      item.textContent = `${nama} — ${status}`;
      list.append(item);
    }
    document.getElementById("adminAbsensiClose").onclick = () => Modal.close();
  },

  showMonthlyPreview(data) {
    Modal.open({
      title: "Preview Rekap Ketidakhadiran",
      size: "lg",
      body: '<div id="adminAbsensiMonthly" class="admin-absensi-monthly"></div>',
      footer: '<button type="button" id="adminAbsensiPrint" class="btn btn-primary">Cetak PDF</button>',
    });
    const preview = document.getElementById("adminAbsensiMonthly");
    const print = document.getElementById("adminAbsensiPrint");
    print.disabled = !data.siswa.length;
    if (!data.siswa.length) {
      preview.textContent = "Belum ada data siswa untuk kelas ini.";
      return;
    }

    const monthFormat = new Intl.DateTimeFormat("id-ID", {
      month: "long", year: "numeric", timeZone: "UTC",
    });
    for (const offset of [0, 6]) {
      const section = document.createElement("section");
      const title = document.createElement("h3");
      title.textContent = `Rekap Ketidakhadiran · ${data.kelas}`;
      const caption = document.createElement("p");
      caption.textContent = `Tahun Ajaran ${data.tahunAjaran} · Semester ${offset / 6 + 1}`;
      const table = document.createElement("table");
      const header = table.createTHead();
      const top = header.insertRow();
      const bottom = header.insertRow();
      const addHeader = (row, label, colspan, rowspan, scope) => {
        const cell = document.createElement("th");
        cell.textContent = label;
        cell.colSpan = colspan;
        cell.rowSpan = rowspan;
        cell.scope = scope;
        row.append(cell);
      };
      addHeader(top, "No.", 1, 2, "col");
      addHeader(top, "Nama Siswa", 1, 2, "col");
      for (const month of data.bulan.slice(offset, offset + 6)) {
        addHeader(top, monthFormat.format(new Date(`${month}-01T00:00:00Z`)), 3, 1, "colgroup");
        for (const status of ["S", "I", "A"]) addHeader(bottom, status, 1, 1, "col");
      }
      const body = table.createTBody();
      data.siswa.forEach((student, index) => {
        const row = body.insertRow();
        row.insertCell().textContent = index + 1;
        row.insertCell().textContent = student.nama;
        for (const count of student.counts.slice(offset, offset + 6).flat()) {
          row.insertCell().textContent = count;
        }
      });
      const legend = document.createElement("p");
      legend.textContent = "S = Sakit · I = Izin · A = Alpa. Angka 0 berarti tidak ada ketidakhadiran yang tercatat.";
      section.append(title, caption, table, legend);
      preview.append(section);
    }
    print.onclick = () => this.printMonthly(preview);
  },

  printMonthly(preview) {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      Toast.warning("Izinkan pop-up untuk membuka cetak PDF.");
      return;
    }
    const doc = printWindow.document;
    doc.title = "Rekap Ketidakhadiran Siswa";
    const style = doc.createElement("style");
    style.textContent = `
      @page { size: A4 landscape; margin: 10mm; }
      body { font: 9pt Arial, sans-serif; color: #161b2d; }
      h3 { margin: 0; font-size: 14pt; }
      p { margin: 6px 0 9px; }
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1px solid #9da9bc; padding: 4px; text-align: center; }
      th { background: #eef2fa; print-color-adjust: exact; }
      th:nth-child(2), td:nth-child(2) { text-align: left; min-width: 43mm; }
      thead tr:nth-child(2) th { text-align: center; min-width: 0; }
      thead { display: table-header-group; }
      tr { break-inside: avoid; }
      section + section { break-before: page; }
    `;
    doc.head.append(style);
    doc.body.append(doc.importNode(preview, true));
    printWindow.focus();
    printWindow.print();
  },
};
