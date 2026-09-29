# AI Rules

- Project type: Browser Extension
- Supported browsers: Firefox, Chromium
- Purpose: Open user-defined webpages on browser startup
- Customizable: User can define which webpages to open on startup, and can set one time or repeat during the day.

## Frameworks & Tools

- WXT Framework
- TypeScript
- Tailwind CSS v4
- SolidJS (`.tsx` components, no virtual DOM)
- Vite
- wxt/storage
- wxt/i18n
- Bun

## Commands

- `bun run dev` / `bun run dev:firefox` - dev server (`webExt.disabled` is on, load `.output/*` manually)
- `bun run build` / `bun run build:firefox` - production build
- `bun run compile` - `tsc --noEmit`, this also type checks the `.tsx` components
- `bun run verify` - `compile` plus the unit tests
- `bun test` - `bun:test`, no extra library; `test/extension.ts` boots the extension environment with the `fakeBrowser` that ships with WXT, so background tests run against the real storage layer

## UI (SolidJS)

Components execute once and never re-render, so only reactive expressions update:

- Read props as `props.x`; never destructure them, use `splitProps`/`mergeProps` when needed.
- Local state is `createSignal`, derived state is `createMemo` (not an effect plus a setter).
- Lists use `<For>`, conditionals `<Show>`/`<Switch>`; a simple ternary is fine inline.
- Clean up subscriptions with `onCleanup()`.
- Shared styling primitives (`card`, `input`, `label`, `btn-*`, `chip`, `badge`) live in `assets/tailwind.css`.

## Data model

The webpage list lives in one storage item (`utils/storage.ts`, `local:webpages`).
Every entry has a stable `id`; never match entries by URL, two entries may share one.
When the `Webpage` shape changes, bump `version` and add a migration keyed by the
version being migrated **to**.
