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
        ? "Press plus for this device only. Public drawings come from drawings/published.json. Add a line there for each file in drawings/media/."
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
    const listed = await loadPublishedJson();
    const uploaded = await loadUploadedMedia();
    const seen = new Set(listed.map((item) => item.src));
    return [
      ...listed,
      ...uploaded.filter((item) => !seen.has(item.src)),
    ];
  }

  async function loadPublishedJson() {
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

  async function loadUploadedMedia() {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${galleryRepo()}/contents/drawings/media`,
        { headers: { Accept: "application/vnd.github+json" } }
      );
      if (!response.ok) {
        return [];
      }
      const items = await response.json();
      if (!Array.isArray(items)) {
        return [];
      }
      return items
        .filter(
          (item) =>
            item &&
            item.type === "file" &&
            /\.(png|jpe?g|gif|webp)$/i.test(item.name || "")
        )
        .map((item) => ({
          src: `./media/${item.name}`,
          name: prettyDrawingName(item.name),
        }));
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  function galleryRepo() {
    const host = window.location.hostname;
    if (host.endsWith(".github.io")) {
      const owner = host.slice(0, -".github.io".length);
      const repo = window.location.pathname.split("/").filter(Boolean)[0];
      if (owner && repo) {
        return `${owner}/${repo}`;
      }
    }
    return "SulKing1/YOU";
  }

  function prettyDrawingName(filename) {
    let base = String(filename || "").replace(/\.[^.]+$/, "");
    base = base.replace(/_\d+$/, "");
    base = base.replace(/([a-z])([A-Z])/g, "$1 $2");
    base = base.replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2");
    base = base.replace(/([0-9])([A-Z])/g, "$1 $2");
    base = base.replace(/\.+/g, ". ");
    base = base.replace(/[-_]+/g, " ");
    base = base.replace(/\s+/g, " ").trim();
    if (!base) {
      return filename;
    }
    return base.replace(/\b[a-z]/g, (ch) => ch.toUpperCase());
  }

  async function render() {
    const published = await loadPublished();
    const local = await listDrawings();
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

    const badge = document.createElement("span");
    badge.className = "drawing-badge";
    badge.textContent = "Only on this device";

    item.append(open, badge);

    if (isOwner()) {
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "drawing-remove";
      remove.setAttribute("aria-label", `Remove ${record.name}`);
      remove.dataset.remove = record.id;
      remove.textContent = "×";
      item.append(remove);
    }

    const download = document.createElement("button");
    download.type = "button";
    download.className = "drawing-download";
    download.setAttribute("aria-label", `Download ${record.name}`);
    download.dataset.download = record.name || "drawing.png";
    download.textContent = "Save";
    item.append(download);

    return item;
  }

  function onGridClick(event) {
    const downloadBtn = event.target.closest("[data-download]");
    if (downloadBtn) {
      event.preventDefault();
      const tile = downloadBtn.closest(".drawing-tile");
      const img = tile?.querySelector("img");
      if (img) {
        const link = document.createElement("a");
        link.href = img.src;
        link.download = downloadBtn.dataset.download || "drawing.png";
        link.click();
      }
      return;
    }
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
