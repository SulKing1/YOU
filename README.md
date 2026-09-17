# YOU

Personal site for **Sultan Said Salim Ahmed Al Ghafry**.

A small static page: about, what I am doing now, work, and a GitHub link. Dark and light themes are built in.

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
