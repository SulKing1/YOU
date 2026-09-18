(() => {
  const DB_NAME = "you-drawings";
  const STORE = "drawings";
  const OWNER_KEY = "you-gallery-owner";
  const MAX_BYTES = 2.5 * 1024 * 1024;
  const grid = document.querySelector("[data-drawing-grid]");
  const fileInput = document.querySelector("[data-drawing-file]");
  const statusEl = document.querySelector("[data-drawings-status]");
  const dialog = document.querySelector("[data-drawing-dialog]");
  const preview = document.querySelector("[data-drawing-preview]");
  const closeDialog = document.querySelector("[data-drawing-close]");
  const ledeEl = document.querySelector("[data-gallery-lede]");
  const ownerBar = document.querySelector("[data-owner-bar]");
  const lockBtn = document.querySelector("[data-owner-lock]");
  const objectUrls = new Map();

  if (!grid || !fileInput) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  if (params.get("owner") === "1") {
    localStorage.setItem(OWNER_KEY, "1");
    params.delete("owner");
    const clean = `${window.location.pathname}${params.toString() ? `?${params}` : ""}${window.location.hash}`;
    window.history.replaceState({}, "", clean);
  }
  if (params.get("owner") === "0") {
    localStorage.removeItem(OWNER_KEY);
    params.delete("owner");
    const clean = `${window.location.pathname}${params.toString() ? `?${params}` : ""}${window.location.hash}`;
    window.history.replaceState({}, "", clean);
  }

  let dbPromise;

  init();

  function isOwner() {
    return localStorage.getItem(OWNER_KEY) === "1";
  }

  function init() {
    updateOwnerUi();
    dbPromise = openDb();
    render().catch((error) => {
      const fallback = isOwner() ? [buildAddTile()] : [];
      grid.replaceChildren(...fallback);
      showStatus("Could not open the drawings gallery.");
      console.error(error);
    });

    grid.addEventListener("click", onGridClick);
    fileInput.addEventListener("change", onFilesChosen);
    lockBtn?.addEventListener("click", () => {
      localStorage.removeItem(OWNER_KEY);
      updateOwnerUi();
      render().catch((error) => console.error(error));
    });
    closeDialog?.addEventListener("click", () => dialog?.close());
    dialog?.addEventListener("click", (event) => {
      if (event.target === dialog) {
        dialog.close();
      }
    });
    dialog?.addEventListener("close", () => {
      if (preview) {
        preview.removeAttribute("src");
        preview.alt = "";
      }
    });
  }

  function updateOwnerUi() {
    const owner = isOwner();
    document.body.classList.toggle("is-owner", owner);
    if (ledeEl) {
      ledeEl.textContent = owner
        ? "Adding is on for this device. Press plus to add a drawing. Visitors cannot add."
        : "Drawings by Sultan Al Ghafry.";
    }
    if (ownerBar) {
      ownerBar.hidden = !owner;
    }
  }

  function openDb() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE, { keyPath: "id" });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  function listDrawings() {
    return dbPromise.then(
      (db) =>
        new Promise((resolve, reject) => {
          const tx = db.transaction(STORE, "readonly");
          const request = tx.objectStore(STORE).getAll();
          request.onsuccess = () => {
            const items = request.result || [];
            items.sort((a, b) => (a.addedAt || 0) - (b.addedAt || 0));
            resolve(items);
          };
          request.onerror = () => reject(request.error);
        })
    );
  }

  function saveDrawing(record) {
    return dbPromise.then(
      (db) =>
        new Promise((resolve, reject) => {
          const tx = db.transaction(STORE, "readwrite");
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
          tx.objectStore(STORE).put(record);
        })
    );
  }

  function deleteDrawing(id) {
    return dbPromise.then(
      (db) =>
        new Promise((resolve, reject) => {
          const tx = db.transaction(STORE, "readwrite");
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
          tx.objectStore(STORE).delete(id);
        })
    );
  }

  async function loadPublished() {
    try {
      const response = await fetch("./published.json", { cache: "no-store" });
      if (!response.ok) {
        return [];
      }
      const data = await response.json();
      return Array.isArray(data.drawings) ? data.drawings : [];
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async function render() {
    const published = await loadPublished();
    const local = isOwner() ? await listDrawings() : [];
    revokeUrls();

    const nodes = [
      ...published.map(buildPublishedTile),
      ...local.map(buildDrawingTile),
    ];
    if (isOwner()) {
      nodes.unshift(buildAddTile());
    }
    if (!nodes.length) {
      nodes.push(buildEmptyTile());
    }
    grid.replaceChildren(...nodes);
  }

  function buildEmptyTile() {
    const item = document.createElement("li");
    item.className = "drawing-item gallery-empty";
    item.textContent = "No drawings yet.";
    return item;
  }

  function buildAddTile() {
    const item = document.createElement("li");
    item.className = "drawing-item";
    const button = document.createElement("button");
    button.type = "button";
    button.className = "add-drawing";
    button.setAttribute("aria-label", "Add a drawing");
    const icon = document.createElement("span");
    icon.className = "add-drawing-icon";
    icon.setAttribute("aria-hidden", "true");
    button.append(icon);
    item.append(button);
    return item;
  }

  function buildPublishedTile(record) {
    const item = document.createElement("li");
    item.className = "drawing-item drawing-tile";
    const open = document.createElement("button");
    open.type = "button";
    open.className = "drawing-open";
    open.setAttribute("aria-label", `Open ${record.name || "drawing"}`);
    const img = document.createElement("img");
    img.src = record.src;
    img.alt = record.name || "Drawing";
    open.append(img);
    item.append(open);
    return item;
  }

  function buildDrawingTile(record) {
    const item = document.createElement("li");
    item.className = "drawing-item drawing-tile";
    item.dataset.id = record.id;

    const url = URL.createObjectURL(record.blob);
    objectUrls.set(record.id, url);

    const open = document.createElement("button");
    open.type = "button";
    open.className = "drawing-open";
    open.setAttribute("aria-label", `Open ${record.name}`);

    const img = document.createElement("img");
    img.src = url;
    img.alt = record.name;
    open.append(img);

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "drawing-remove";
    remove.setAttribute("aria-label", `Remove ${record.name}`);
    remove.dataset.remove = record.id;
    remove.textContent = "×";

    item.append(open, remove);
    return item;
  }

  function onGridClick(event) {
    const removeBtn = event.target.closest("[data-remove]");
    if (removeBtn) {
      event.preventDefault();
      if (!isOwner()) {
        return;
      }
      removeDrawing(removeBtn.dataset.remove);
      return;
    }

    if (event.target.closest(".add-drawing")) {
      if (!isOwner()) {
        return;
      }
      fileInput.click();
      return;
    }

    const tile = event.target.closest(".drawing-tile");
    if (tile) {
      const img = tile.querySelector("img");
      if (img && preview && dialog) {
        preview.src = img.src;
        preview.alt = img.alt;
        dialog.showModal();
      }
    }
  }

  async function onFilesChosen(event) {
    if (!isOwner()) {
      return;
    }
    const files = [...(event.target.files || [])];
    fileInput.value = "";
    if (!files.length) {
      return;
    }

    try {
      for (const file of files) {
        const isImage =
          file.type.startsWith("image/") ||
          /\.(png|jpe?g|gif|webp)$/i.test(file.name || "");
        if (!isImage) {
          showStatus("Choose an image file, like a JPG or PNG.");
          continue;
        }
        const blob = await prepareBlob(file);
        await saveDrawing({
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          name: file.name || "Drawing",
          addedAt: Date.now(),
          blob,
        });
      }
      hideStatus();
      await render();
    } catch (error) {
      showStatus("Could not add that drawing. Try a smaller image.");
      console.error(error);
    }
  }

  async function removeDrawing(id) {
    try {
      await deleteDrawing(id);
      hideStatus();
      await render();
    } catch (error) {
      showStatus("Could not remove that drawing.");
      console.error(error);
    }
  }

  async function prepareBlob(file) {
    if (file.size <= MAX_BYTES) {
      return file;
    }

    const image = await fileToImage(file);
    const maxEdge = 1600;
    const scale = Math.min(1, maxEdge / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext("2d");
    context.fillStyle = "#f4efe6";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", 0.84);
    });
    return blob || file;
  }

  function fileToImage(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const image = new Image();
      image.onload = () => {
        URL.revokeObjectURL(url);
        resolve(image);
      };
      image.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Could not read image"));
      };
      image.src = url;
    });
  }

  function revokeUrls() {
    objectUrls.forEach((url) => URL.revokeObjectURL(url));
    objectUrls.clear();
  }

  function showStatus(message) {
    if (!statusEl) {
      return;
    }
    statusEl.hidden = false;
    statusEl.textContent = message;
  }

  function hideStatus() {
    if (!statusEl) {
      return;
    }
    statusEl.hidden = true;
    statusEl.textContent = "";
  }
})();
