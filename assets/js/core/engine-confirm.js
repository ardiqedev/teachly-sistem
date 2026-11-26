const Confirm = {
  dialog: null,

  ask({ title = "Konfirmasi", message = "", confirmText = "Lanjutkan", type = "warning" } = {}) {
    if (this.dialog) return Promise.resolve(false);

    const dialog = document.createElement("dialog");
    const isDanger = type === "danger";
    dialog.className = `confirm confirm-${isDanger ? "danger" : "warning"}`;
    dialog.setAttribute("aria-labelledby", "confirmTitle");
    dialog.setAttribute("aria-describedby", "confirmMessage");
    dialog.innerHTML = `
      <form method="dialog">
        <div class="confirm-icon" aria-hidden="true">
          <i data-lucide="${isDanger ? "trash-2" : "triangle-alert"}"></i>
        </div>
        <h2 class="confirm-title" id="confirmTitle"></h2>
        <p class="confirm-message" id="confirmMessage"></p>
        <div class="confirm-footer">
          <button type="submit" class="btn btn-outline" value="cancel" autofocus>Batal</button>
          <button type="submit" class="btn btn-primary confirm-ok" value="confirm"></button>
        </div>
      </form>
    `;
    dialog.querySelector("#confirmTitle").textContent = title;
    dialog.querySelector("#confirmMessage").textContent = message;
    dialog.querySelector(".confirm-ok").textContent = confirmText;

    dialog.addEventListener("keydown", (event) => {
      if (event.key === "Escape") event.stopPropagation();
    });
    dialog.addEventListener("click", (event) => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right ||
          event.clientY < bounds.top || event.clientY > bounds.bottom) {
        dialog.close("cancel");
      }
    });

    const activeElement = document.activeElement;
    const result = new Promise((resolve) => {
      dialog.addEventListener("close", () => {
        dialog.remove();
        this.dialog = null;
        if (activeElement?.isConnected) activeElement.focus();
        resolve(dialog.returnValue === "confirm");
      }, { once: true });
    });

    document.body.append(dialog);
    this.dialog = dialog;
    dialog.showModal();
    window.lucide?.createIcons();
    return result;
  },
};
