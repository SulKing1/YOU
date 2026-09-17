# YOU

A fast, accessible personal portfolio built with **Vite + React + TypeScript**.

## Getting started

```bash
npm ci        # install exact dependencies from the lockfile
npm run dev   # start the dev server at http://localhost:5173
```

## Scripts

| Script          | Description                                  |
| --------------- | -------------------------------------------- |
| `npm run dev`   | Start the Vite dev server with HMR           |
| `npm run build` | Type-check (`tsc -b`) and build for prod     |
| `npm run lint`  | Lint the codebase with oxlint                |
| `npm run test`  | Run the unit tests with Vitest               |
| `npm run preview` | Preview the production build locally       |

## Project structure

```
src/
  App.tsx        # Portfolio page (hero, skills, projects)
  data.ts        # Profile content (name, skills, projects)
  utils.ts       # Small helpers (e.g. initials)
  utils.test.ts  # Unit tests for utils
  App.css        # Component styles
  index.css      # Global styles / theme
```

## Cloud Agent environment

This repo includes `.cursor/environment.json` so Cursor Cloud Agents can install
dependencies (`npm ci`) and run the dev server automatically.
