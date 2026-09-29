# AI Rules

- Project type: Browser Extension
- Supported browsers: Firefox, Chromium
- Purpose: Open user-defined webpages on browser startup
- Customizable: User can define which webpages to open on startup, and can set one time or repeat during the day.

## Frameworks & Tools

- WXT Framework
- TypeScript
- Tailwind CSS v4
- Svelte 5 (runes mode)
- Vite
- wxt/storage
- wxt/i18n
- Bun

## Commands

- `bun run dev` / `bun run dev:firefox` - dev server (`webExt.disabled` is on, load `.output/*` manually)
- `bun run build` / `bun run build:firefox` - production build
- `bun run compile` - `tsc --noEmit`
- `bun run check` - `svelte-check`, **tsc does not look at `.svelte` files, always run this too**
- `bun test` - unit tests for the pure helpers in `utils/`

## Data model

The webpage list lives in one storage item (`utils/storage.ts`, `local:webpages`).
Every entry has a stable `id`; never match entries by URL, two entries may share one.
When the `Webpage` shape changes, bump `version` and add a migration keyed by the
version being migrated **to**.
