# YOU

Personal site for **Sultan Said Salim Ahmed Al Ghafry**.

A small static page for a University of Alberta student who likes drawing and programming. About, now, drawings, work, email, and GitHub. Dark and light themes are built in.

The Drawings tab has a plus button. Choose an image from your device and it stays in that browser (it is not uploaded to GitHub).

## Live site

**https://sulking1.github.io/YOU/**

GitHub Pages is set to `main` → `/` (root).

- Home: **https://sulking1.github.io/YOU/**
- Gallery: **https://sulking1.github.io/YOU/drawings/**

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

The public gallery does not let visitors add drawings. The plus button appears only on a device that has been unlocked as the owner.

To turn adding on for your browser, open:

https://sulking1.github.io/YOU/drawings/?owner=1

Then bookmark the gallery without `?owner=1`. Click **Lock** when you want to hide the plus button again.

Drawings added with plus stay in that browser, even after you click **Lock**. Lock only hides the plus button.

Public drawings are listed in `drawings/published.json`. Put the image file in `drawings/media/`, then add a line in that JSON file:

```json
{
  "drawings": [
    { "src": "./media/Boy.jpg", "name": "Boy", "group": "pencil" },
    { "src": "./media/Naruto.PNG", "name": "Naruto", "group": "ipad" }
  ]
}
```

`src` is the path from the gallery folder: `./media/` plus the exact filename. `name` is the title. `group` is `pencil` or `ipad`.

To rebuild the list from every image currently in `drawings/media/`:

```bash
node scripts/write-published-json.mjs
```

You can also send the image here and I will add it to the gallery.

## Vite app (optional)

`src/` still has a Vite + React + TypeScript scaffold used for local tooling and tests:

```bash
npm ci
npm run test
```
