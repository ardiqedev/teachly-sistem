/* =========================================
   TEACHLY - DASHBOARD INFORMASI SEKOLAH
   QEDEV FRONTEND STANDARD
========================================= */

const DashboardInformasi = {
  /* =====================================
     CONFIGURATION
  ===================================== */

  containerSelector: "#dashboardInformasi",
  initialized: false,
  loading: false,
  requestId: 0,

  /* =====================================
     SOURCE CONFIGURATION
  ===================================== */

  SOURCES: [
    {
      key: "KURIKULUM",
      label: "Kurikulum",
      icon: "book-open",
      theme: "kurikulum",
    },
    {
      key: "GURU_NGAJI",
      label: "Guru Ngaji",
      icon: "book-marked",
      theme: "ngaji",
    },
  ],

  /* =====================================
     INITIALIZE
  ===================================== */

  /* =====================================
   INITIALIZE DASHBOARD INFORMASI
===================================== */

  async init() {
    const container = document.querySelector(this.containerSelector);

    if (!container) {
      console.warn("[DashboardInformasi] Container belum ditemukan.");
      return;
    }

    if (this.loading) return;

    this.initialized = false;
    this.loading = true;

    const currentRequest = ++this.requestId;

    this.renderLoading(container);

    try {
      const response = await API.post("informasiSekolah.list", {});

      if (
        !response ||
        response.success !== true ||
        !response.data ||
        typeof response.data !== "object" ||
        Array.isArray(response.data)
      ) {
        throw new Error(response?.message || "Gagal memuat informasi sekolah.");
      }

      // Abaikan respons jika halaman sudah berganti
      // atau request sudah tidak relevan.
      if (
        currentRequest !== this.requestId ||
        !container.isConnected ||
        container !== document.querySelector(this.containerSelector)
      ) {
        return;
      }

      // render() menerima objek data asli dari API.
      // Normalisasi dilakukan di dalam render().
      this.render(container, response.data);

      this.initialized = true;

      console.log("[DashboardInformasi] Berhasil dimuat.", this.items);
    } catch (error) {
      if (currentRequest !== this.requestId || !container.isConnected) {
        return;
      }

      this.initialized = false;

      console.error("[DashboardInformasi] Gagal memuat:", error);

      this.renderError(container);
    } finally {
      if (currentRequest === this.requestId) {
        this.loading = false;
      }
    }
  },

  /* =====================================
   NORMALIZE INFORMATION
===================================== */

  normalizeInformation(data, source) {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return null;
    }

    const nama = String(data.NAMA_INFORMASI ?? "").trim();

    const detail = String(data.DETAIL_INFORMASI ?? "").replace(/\r\n?/g, "\n");

    // Jangan tampilkan informasi yang kosong.
    if (!nama || !detail.trim()) {
      return null;
    }

    return {
      SUMBER_INFORMASI: source.key,
      LABEL_SUMBER: source.label,
      ICON: source.icon,
      THEME: source.theme,

      NAMA_INFORMASI: nama,
      DETAIL_INFORMASI: detail,

      TANGGAL_INFORMASI: data.TANGGAL_INFORMASI ?? "",
    };
  },

  /* =====================================
     ESCAPE HTML
  ===================================== */

  escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  },

  /* =====================================
     FORMAT DATE
  ===================================== */

  formatDate(value) {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Jakarta",
    }).format(date);
  },

  /* =====================================
     CREATE SUMMARY
  ===================================== */

  createSummary(value, maxLength = 140) {
    const text = String(value ?? "")
      .replace(/\s+/g, " ")
      .trim();

    if (text.length <= maxLength) {
      return text;
    }

    return text.slice(0, maxLength).trimEnd() + "...";
  },

  /* =====================================
     SOURCE CONFIGURATION
  ===================================== */

  getSourceConfig(source) {
    if (source === "KURIKULUM") {
      return {
        label: "Kurikulum",
        icon: "book-open",
        className: "kurikulum",
      };
    }

    return {
      label: "Guru Ngaji",
      icon: "book-marked",
      className: "guru-ngaji",
    };
  },

  /* =====================================
     RENDER LOADING
  ===================================== */

  renderLoading(container) {
    container.innerHTML = `
      <section class="dashboard-informasi-section">

        <div class="dashboard-informasi-heading">
          <div>
            <span class="dashboard-informasi-eyebrow">
              PENGUMUMAN SEKOLAH
            </span>
            <h2>Informasi Terbaru</h2>
          </div>
        </div>

        <div class="dashboard-informasi-loading">
          Memuat informasi sekolah...
        </div>

      </section>
    `;
  },

  /* =====================================
   RENDER PREMIUM INFORMATION CARDS
===================================== */

  render(container, data) {
    const items = this.SOURCES.map((source) => {
      return this.normalizeInformation(data[source.key], source);
    }).filter(Boolean);

    // Jika tidak ada informasi, sembunyikan section.
    if (!items.length) {
      this.items = [];
      container.innerHTML = "";
      container.hidden = true;
      return;
    }

    this.items = items;
    container.hidden = false;

    container.innerHTML = `
    <section class="dashboard-informasi-section">

      <!-- SECTION HEADING -->
      <div class="dashboard-informasi-heading">

        <div class="dashboard-informasi-heading-text">
          <span class="dashboard-informasi-eyebrow">
            PENGUMUMAN SEKOLAH
          </span>

          <h2>Informasi Terbaru</h2>

          <p class="dashboard-informasi-subtitle">
            Kabar dan pembaruan untuk guru
          </p>
        </div>

        <div class="dashboard-informasi-heading-icon">
          <i data-lucide="megaphone"></i>
        </div>

      </div>

      <!-- INFORMATION CARDS -->
      <div class="dashboard-informasi-list">

        ${items
          .map(
            (item) => `
          <article
            class="dashboard-informasi-card
                   dashboard-informasi-card--${item.THEME}"
          >

            <!-- CARD HEADER -->
            <div class="dashboard-informasi-card-header">

              <div class="dashboard-informasi-icon">
                <i data-lucide="${item.ICON}"></i>
              </div>

              <div class="dashboard-informasi-source">

                <strong>
                  ${this.escapeHtml(item.LABEL_SUMBER)}
                </strong>

                <span class="dashboard-informasi-date">
                  <i data-lucide="calendar-days"></i>
                  ${this.escapeHtml(
                    this.formatDate(item.TANGGAL_INFORMASI) ||
                      "Tanggal belum tersedia",
                  )}
                </span>

              </div>

              <span class="dashboard-informasi-badge">
                Terbaru
              </span>

            </div>

            <!-- CARD CONTENT -->
            <div class="dashboard-informasi-card-body">

              <h3 class="dashboard-informasi-title">
                ${this.escapeHtml(item.NAMA_INFORMASI)}
              </h3>

              <p class="dashboard-informasi-summary">
                ${this.escapeHtml(this.createSummary(item.DETAIL_INFORMASI))}
              </p>

            </div>

            <!-- CARD FOOTER -->
            <div class="dashboard-informasi-footer">

              <button
                type="button"
                class="dashboard-informasi-read"
                data-informasi-source="${item.SUMBER_INFORMASI}"
                aria-label="Baca selengkapnya informasi ${this.escapeHtml(
                  item.LABEL_SUMBER,
                )}: ${this.escapeHtml(item.NAMA_INFORMASI)}"
              >
                <span>Baca Selengkapnya</span>
                <i data-lucide="arrow-up-right"></i>
              </button>

            </div>

          </article>
        `,
          )
          .join("")}

      </div>

    </section>
  `;

    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  /* =====================================
     BIND READ MORE EVENTS
  ===================================== */

  bindEvents(container, informasi) {
    const buttons = container.querySelectorAll("[data-informasi-index]");

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const index = Number(button.dataset.informasiIndex);

        const item = informasi[index];

        if (!item) return;

        this.openDetail(item);
      });
    });
  },

  /* =====================================
     OPEN DETAIL MODAL
  ===================================== */

  openDetail(item) {
    if (typeof Modal === "undefined" || typeof Modal.open !== "function") {
      console.error("[DashboardInformasi] Modal Engine tidak tersedia.");
      return;
    }

    const config = this.getSourceConfig(item.SUMBER_INFORMASI);

    const title = this.escapeHtml(item.NAMA_INFORMASI);

    const detail = this.escapeHtml(item.DETAIL_INFORMASI);

    const tanggal = this.escapeHtml(this.formatDate(item.TANGGAL_INFORMASI));

    Modal.open({
      title: `
        <div class="dashboard-informasi-modal-heading">
          <span>Informasi Sekolah</span>
          <small>${config.label}</small>
        </div>
      `,

      size: "md",

      body: `
        <div class="dashboard-informasi-modal">

          <div class="dashboard-informasi-modal-source ${config.className}">
            <i data-lucide="${config.icon}"></i>
            <span>${config.label}</span>
          </div>

          <h3 class="dashboard-informasi-modal-title">
            ${title}
          </h3>

          <div class="dashboard-informasi-modal-date">
            <i data-lucide="calendar-days"></i>
            <span>${tanggal}</span>
          </div>

          <div
            class="dashboard-informasi-modal-detail"
            style="white-space: pre-wrap; overflow-wrap: anywhere;"
          >${detail}</div>

        </div>
      `,

      footer: `
        <button
          type="button"
          class="btn btn-primary"
          id="btnTutupInformasi"
        >
          Tutup
        </button>
      `,
    });

    document
      .getElementById("btnTutupInformasi")
      ?.addEventListener("click", () => {
        Modal.close();
      });

    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  /* =====================================
     RENDER ERROR
  ===================================== */

  renderError(container) {
    container.innerHTML = `
      <section class="dashboard-informasi-section">

        <div class="dashboard-informasi-heading">
          <div>
            <span class="dashboard-informasi-eyebrow">
              PENGUMUMAN SEKOLAH
            </span>
            <h2>Informasi Terbaru</h2>
          </div>
        </div>

        <div class="dashboard-informasi-error">
          Informasi sekolah belum dapat ditampilkan.
        </div>

      </section>
    `;
  },
};
