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
