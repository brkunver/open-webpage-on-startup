import { defineConfig } from "wxt"
import tailwindcss from "@tailwindcss/vite"

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-svelte", "@wxt-dev/i18n/module"],
  manifest: {
    default_locale: "en",
    name: "__MSG_extensionName__",
    permissions: ["storage", "tabs"],
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  webExt: {
    disabled: true,
  },
})
