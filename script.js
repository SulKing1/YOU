(() => {
  const root = document.documentElement;
  const year = document.getElementById("year");
  const themeToggle = document.querySelector(".theme-toggle");
  const nav = document.querySelector(".nav");
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = [...document.querySelectorAll(".nav-list a")];
  const sections = [...document.querySelectorAll("main section[id]")];

  const storedTheme = localStorage.getItem("theme");
  const systemTheme = window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
  setTheme(storedTheme || systemTheme);

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  themeToggle?.addEventListener("click", () => {
    const next = root.dataset.theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
  });

  navToggle?.addEventListener("click", () => {
    const open = !nav.classList.contains("is-open");
    nav.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      navToggle?.setAttribute("aria-expanded", "false");
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) {
        return;
      }

      navLinks.forEach((link) => {
        const active = link.hash === `#${visible.target.id}`;
        link.classList.toggle("is-active", active);
      });
    },
    { rootMargin: "-35% 0px -50% 0px", threshold: [0.2, 0.5, 1] }
  );

  sections.forEach((section) => observer.observe(section));

  function setTheme(theme) {
    root.dataset.theme = theme;
    const toLight = theme === "dark";
    themeToggle?.setAttribute(
      "aria-label",
      toLight ? "Switch to light theme" : "Switch to dark theme"
    );
  }
})();

(() => {
  const DB_NAME = "you-drawings";
  const STORE = "drawings";
  const MAX_BYTES = 2.5 * 1024 * 1024;
  const grid = document.querySelector("[data-drawing-grid]");
  const fileInput = document.querySelector("[data-drawing-file]");
  const statusEl = document.querySelector("[data-drawings-status]");
  const dialog = document.querySelector("[data-drawing-dialog]");
  const preview = document.querySelector("[data-drawing-preview]");
  const closeDialog = document.querySelector("[data-drawing-close]");
  const objectUrls = new Map();

  if (!grid || !fileInput) {
    return;
  }

  let dbPromise;

  init();

  function init() {
    dbPromise = openDb();
    render().catch((error) => {
      grid.replaceChildren(buildAddTile());
      showStatus("Could not open the drawings gallery.");
      console.error(error);
    });

    grid.addEventListener("click", onGridClick);
    fileInput.addEventListener("change", onFilesChosen);
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

  async function render() {
    const items = await listDrawings();
    revokeUrls();
    grid.replaceChildren(buildAddTile(), ...items.map(buildDrawingTile));
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
      removeDrawing(removeBtn.dataset.remove);
      return;
    }

    if (event.target.closest(".add-drawing")) {
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
