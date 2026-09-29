# Open Webpages on Startup | Browser Extension

Open Webpages on Startup is a browser extension that opens your favorite webpages on startup.
You can set frequency of opening webpages, daily range, and more.

Chrome Store Url : https://chromewebstore.google.com/detail/gfdhcbmjhiadddlnmegnelonlialapgi?utm_source=item-share-cb

Firefox Store Url : will be added soon

## Development

```bash
bun install
bun run dev            # or: bun run dev:firefox
```

`wxt.config.ts` sets `webExt.disabled`, so the browser is not launched automatically -
load the generated `.output/<browser>-mv*` directory manually.

| Command               | Description                          |
| --------------------- | ------------------------------------ |
| `bun run build`       | Production build (Chromium)          |
| `bun run build:firefox` | Production build (Firefox)         |
| `bun run zip:all`     | Store-ready archives for both        |
| `bun run compile`     | Type check `.ts` and `.tsx` files (`tsc`) |
| `bun run verify`      | Type check plus unit tests            |
| `bun test`            | Unit and background tests (`bun:test`) |
