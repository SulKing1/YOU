# YOU

Personal site for **Sultan Said Salim Ahmed Al Ghafry**.

## Live site

**https://sulking1.github.io/YOU/**

GitHub Pages is set to `main` → `/` (root).

- Home: **https://sulking1.github.io/YOU/**
- Drawings (separate site): **https://sulking1.github.io/YOU/drawings/**

## Preview locally

From this folder:

```bash
python3 -m http.server 4173
```

Then open [http://localhost:4173](http://localhost:4173) and [http://localhost:4173/drawings/](http://localhost:4173/drawings/).

## What GitHub Pages serves

The public site is the static files at the repo root:

- `index.html` — personal site
- `drawings/index.html` — drawings gallery
- `styles.css`, `script.js`, `drawings.js`, `favicon.svg`

Those paths are relative, so they work at `https://sulking1.github.io/YOU/`. `.nojekyll` tells GitHub not to run Jekyll on the files.

The Drawings plus button saves images in your browser only. They are not uploaded to GitHub.

## Vite app (optional)

`src/` still has a Vite + React + TypeScript scaffold used for local tooling and tests:

```bash
npm ci
npm run test
```
