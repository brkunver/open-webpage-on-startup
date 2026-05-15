# AIRules

- Project type: Browser Extension
- Supported browsers: Firefox, Chromium
- Purpose: Open user-defined webpages on browser startup
- Customizable: User can define which webpages to open on startup, and can set one time or repeat during the day.

## Frameworks & Tools

- WXT Framework
- TypeScript
- Tailwind CSS v4
- SolidJS
- Vite
- wxt/storage
- wxt/i18n
- Bun

## Configuration

- Extension manifest is defined in `wxt.config.ts`
- Locales are stored in `src/locales`
- Code style is defined in `.prettierrc.json`

## i18n Usage Example

```tsx
import { i18n } from "#i18n"

const t = i18n.t

<div>
  <h1>{t("extensionName")}</h1>
</div>
```
