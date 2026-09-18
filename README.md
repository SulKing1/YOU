# YOU

Personal site for **Sultan Said Salim Ahmed Al Ghafry**.

<<<<<<< HEAD
A small static page for a University of Alberta student who likes drawing and programming. About, now, drawings, work, email, and GitHub. Dark and light themes are built in.

The Drawings tab has a plus button. Choose an image from your device and it stays in that browser (it is not uploaded to GitHub).
=======
## Live site

**https://sulking1.github.io/YOU/**

GitHub Pages is set to `main` → `/` (root). After this is merged into `main`, wait about a minute, then refresh that URL. You should see the personal site, not a blank page.
>>>>>>> origin/main

## Preview locally

From this folder:

```bash
python3 -m http.server 4173
```

Then open [http://localhost:4173](http://localhost:4173).

## What GitHub Pages serves

The public site is the static files at the repo root:

- `index.html`
- `styles.css`
- `script.js`
- `favicon.svg`

Those paths are relative (`./styles.css`), so they work at `https://sulking1.github.io/YOU/`. `.nojekyll` tells GitHub not to run Jekyll on the files.

The Drawings plus button saves images in your browser only. They are not uploaded to GitHub.

## Vite app (optional)

`src/` still has a Vite + React + TypeScript scaffold used for local tooling and tests:

```bash
npm ci
npm run test
```
