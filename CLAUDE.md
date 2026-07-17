# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The public portfolio site for artist Ignacio Crevecoeur (deployed to `ignaciocrevecoeur.com` via GitHub Pages, see `CNAME`). Built with Vite + React + TypeScript + shadcn-ui + Tailwind. Originally scaffolded/edited via Lovable.

## Commands

```sh
npm run dev         # start dev server
npm run build        # production build
npm run build:dev    # development-mode build
npm run lint         # eslint .
npm run test         # vitest run (single run)
npm run test:watch   # vitest watch mode
```

Run a single test file: `npx vitest run src/test/example.test.ts`

## Architecture

### Content is static JSON, not a database or CMS backend

There is no backend. All site content (artworks, exhibitions, prints, press, homepage carousel) lives as static JSON files under `public/data/`: `obras.json`, `exposiciones.json`, `prints.json`, `prensa.json`, `carrusel.json`. Public pages read these at runtime via `src/hooks/usePortfolioData.ts`, which does a plain `fetch('/data/<file>', { cache: 'no-cache' })` and pulls `json[key]`. Shared TypeScript shapes for this content (`Exhibition`, `Print`, `PressItem`, `GalleryMedia`) live in `src/data/portfolio.ts` — that file has no actual data, only types.

### The admin panel is a browser-based Git CMS

`/admin` (`src/pages/Admin.tsx` + `src/components/admin/`) is a password-gated editor for the JSON files above. It does **not** write to a server — it commits directly to this GitHub repo using the GitHub Contents API:

- `src/lib/githubApi.ts` — `getFileFromGitHub` (reads + base64-decodes a file, returns its `sha`) and `updateFileOnGitHub` (base64-encodes new content and PUTs a commit to `main`, using the previous `sha`).
- The admin's personal access token is entered once through `LoginScreen.tsx`, encrypted client-side with a user password, and persisted in `localStorage` (`STORAGE_KEY`/`STORAGE_SALT`/`STORAGE_IV` in `constants.ts`). It is never read from an env var.
- `src/components/admin/constants.ts` maps each of the 5 content types (`obras`, `exposiciones`, `prints`, `prensa`, `carrusel`) to its file path (`FILE_PATHS`) and its JSON root key (`FILE_PATHS` uses `public/data/*.json`; `JSON_KEYS` is the key inside that JSON).
- Editing content in `/admin` = making a real commit to `main`. The live site only picks up the change after that commit is deployed (GitHub Pages rebuild), since `usePortfolioData` fetches the JSON as a static asset, not live from GitHub.
- Image uploads in the admin go through Cloudinary (`src/lib/cloudinaryUpload.ts`), using `VITE_CLOUD_NAME` / `VITE_UPLOAD_PRESET` env vars — not GitHub.

When changing the content data shape, update in lockstep: the TS interfaces in `src/data/portfolio.ts`, the admin's `ItemForm.tsx`/`types.ts`, and the actual JSON files in `public/data/`.

### i18n

`react-i18next`, resources loaded eagerly from `src/i18n/en.json` / `es.json` (`src/i18n/index.ts`). Language preference is read from `localStorage.getItem('language')`, defaulting to `'es'`. Separately, individual content JSON items carry their own manual English fields (e.g. `description_en`, `edition_en`, `excerpt_en` on `Exhibition`/`Print`/`PressItem`) — UI chrome is translated via i18next, but per-item content translation is a parallel, manual `_en` suffix convention, not routed through i18next.

### Routing

All routes are defined flat in `src/App.tsx` (no nested/layout routes): `/`, `/portfolio`, `/exhibitions`, `/prints`, `/press`, `/contact`, `/admin`, plus a catch-all `NotFound`. Global providers wrap everything in this order: `QueryClientProvider` → `TooltipProvider` → toasters (shadcn `Toaster` + Sonner) → `BrowserRouter`.

### Testing

Vitest + jsdom (`vitest.config.ts`), `setupFiles: src/test/setup.ts` (jest-dom matchers, `matchMedia` stub). Test files must match `src/**/*.{test,spec}.{ts,tsx}`. The `@` path alias (`src/`) is mirrored between `vite.config.ts` and `vitest.config.ts` — keep both in sync if it changes.

### Styling / shadcn conventions

Standard shadcn-ui setup — `components.json` declares aliases (`@/components`, `@/components/ui`, `@/lib/utils`, `@/hooks`) and CSS-variable-driven color tokens defined in `src/index.css`, consumed via `tailwind.config.ts`. Custom additions on top of the shadcn defaults: `magenta`/`cyan` brand colors, `Cormorant Garamond` (display) / `Inter` (body) fonts, and custom fade/slide keyframes.
