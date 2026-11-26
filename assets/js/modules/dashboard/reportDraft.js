const ReportDraft = {
  async access(nbm, operation, draft) {
    const database = await new Promise((resolve, reject) => {
      const request = indexedDB.open("teachly-report-drafts", 1);
      request.onupgradeneeded = () => request.result.createObjectStore("drafts");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    try {
      return await new Promise((resolve, reject) => {
        const transaction = database.transaction(
          "drafts", operation === "list" || operation === "get" ? "readonly" : "readwrite",
        );
        const store = transaction.objectStore("drafts");
        if (operation === "list") {
          const range = IDBKeyRange.bound([nbm, ""], [nbm, "\uffff"]);
          const drafts = store.getAll(range);
          const legacy = store.get(nbm);
          transaction.oncomplete = () => resolve([
            ...drafts.result,
            ...(legacy.result ? [{ ...legacy.result, id: "legacy" }] : []),
          ]);
        } else if (operation === "get") {
          const key = draft.id === "legacy" ? nbm : [nbm, draft.id];
          const request = store.get(key);
          transaction.oncomplete = () => resolve(
            request.result && { ...request.result, id: draft.id },
          );
        } else if (operation === "save") {
          store.put(draft, draft.id === "legacy" ? nbm : [nbm, draft.id]);
          transaction.oncomplete = () => resolve();
        } else if (operation === "remove" || operation === "markFailed") {
          const key = draft.id === "legacy" ? nbm : [nbm, draft.id];
          const request = store.get(key);
          let changed = false;
          request.onsuccess = () => {
            if (!request.result || request.result.revision !== draft.revision) return;
            if (operation === "remove") {
              store.delete(key);
            } else {
              store.put({ ...request.result, failure: draft.failure }, key);
            }
            changed = true;
          };
          transaction.oncomplete = () => resolve(changed);
        }
        transaction.onabort = () => reject(transaction.error);
      });
    } finally {
      database.close();
    }
  },
};
