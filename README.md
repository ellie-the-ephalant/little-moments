# Little Moments

A local-first photobooth for composing and keeping photo strips. No account, analytics, cookies, or network uploads. Camera shots stay in memory until you export them or explicitly save a strip to this browser.

## Features

- Camera capture or photo uploads, countdowns, retakes, and camera selection
- Five layouts, six paper themes, seven tones, and editable strip details
- PNG download, file sharing, clipboard copy, print, and an on-device gallery

## Stack and setup

Next.js 16 App Router with static export, React 19, TypeScript, Tailwind CSS 4, Zustand, Zod, IndexedDB (`idb-keyval`), and Vitest.

Requires Node.js 22.12.0 or newer.

```sh
npm ci
npm run dev
```

Quality gates:

```sh
npm run lint
npm run typecheck
npm run test
npm run build
npm run format:check
```

Preview the static export locally:

```sh
npm run build
python3 -m http.server 4173 --directory out
```

Open <http://localhost:4173>.

## Local data and privacy

- Settings only: `localStorage` key `little-moments.settings.v1`.
- Gallery: IndexedDB database `little-moments`, object store `gallery`, keys `strip:<id>`.
- Saving stores a flattened 1× JPEG (quality 0.90) and a 320×400 JPEG thumbnail (quality 0.80); the gallery keeps up to 30 strips.
- Captured photos are not uploaded or saved automatically. Downloads, sharing, copy, and print happen only when you choose those actions.

## Deployment

### Vercel

Run `npm run build` and deploy the exported `out/` directory at the site root. Leave `PAGES_BASE_PATH` unset.

### GitHub Pages

The `Deploy to GitHub Pages` workflow is manual-only and guarded to `main`. Merging does not publish the new app: the legacy root `index.html` remains in place and Pages stays on its current branch source.

1. In **Settings → Pages**, change **Source** to **GitHub Actions**.
2. In **Actions**, run **Deploy to GitHub Pages** on `main`. The workflow sets `PAGES_BASE_PATH` to the repository path and deploys `out`.
3. Verify `/little-moments/`, `/little-moments/studio/`, `/little-moments/gallery/`, the icon, and a missing route.
4. To roll back, restore Pages to the previous `main` branch / root configuration; the legacy `index.html` remains available.

To reproduce the project-path build locally, run `PAGES_BASE_PATH=/little-moments npm run build`.

Static export cannot set response headers or a CSP. The app makes no third-party runtime requests.

## Browser support and limits

- Camera access requires HTTPS, except on `localhost`.
- Safari canvas filters use JavaScript color matrices; `CanvasRenderingContext2D.filter` is not used for exports.
- Older iOS (<18) can cap canvases at 4096 px / 16 MP. High is disabled when the safe effective scale is below 1.25×; the UI shows actual export dimensions.
- Share and PNG clipboard copy depend on browser support. Download remains available. Tall strips may span pages when printed or saved as PDF.

## QA checklist

- [ ] Camera permission allow/deny, no camera, busy camera, front/rear camera and device picker; mirror on/off; countdown 0/3/5/10; cancel, resume, and retake.
- [ ] Upload 1/4/6 photos, files over 25 MB, invalid images, and HEIC.
- [ ] Every layout, theme, and tone; Safari preview/export parity; Standard/High dimensions and old-iOS High-unavailable copy; download, share, copy, and print.
- [ ] Gallery save/reload/detail/delete/clear, 30-strip cap and quota handling (including Safari private mode); Recent Moments empty and populated.
- [ ] Keyboard-only session, reduced motion, 200% zoom, and widths 360/390/768/1024/1440 with no horizontal scroll.
- [ ] Network requests stay same-origin; no console errors except expected camera-permission errors in automation.

## Project structure

```text
src/app/                 Routes, metadata, and global styles
src/components/          Landing, studio, gallery, site, and UI components
src/hooks/               Browser workflows
src/lib/                 Domain, persistence, rendering, and export logic
src/test/                Vitest tests
public/                  Static assets
.github/workflows/       Manual GitHub Pages deployment
```
