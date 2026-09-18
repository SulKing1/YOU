# YOU

Personal site for **Sultan Said Salim Ahmed Al Ghafry**.

A small static page for a University of Alberta student who likes drawing and programming. About, now, drawings, work, email, and GitHub. Dark and light themes are built in.

The Drawings tab has a plus button. Choose an image from your device and it stays in that browser (it is not uploaded to GitHub).

## Preview locally

Any static file server works. From this folder:

```bash
python3 -m http.server 4173
```

Then open [http://localhost:4173](http://localhost:4173).

## Publish with GitHub Pages

1. In the repository settings, open **Pages**.
2. Set the source to **Deploy from a branch**.
3. Choose `main` and the `/` (root) folder.
4. Save. GitHub will host `index.html` at your Pages URL.

## Customize

Edit `index.html` to change copy, sections, or links. Colors live in `styles.css` under `:root` and `[data-theme="light"]`.
