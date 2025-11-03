import { defineConfig } from "wxt"
import tailwindcss from "@tailwindcss/vite"
import svelte from "@sveltejs/vite-plugin-svelte"

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/i18n/module"],
  manifest: {
    default_locale: "en",
    name: "__MSG_extensionName__",
    permissions: ["storage"],
  },
  vite: () => ({
    plugins: [tailwindcss(), svelte()],
  }),
  webExt: {
    disabled: true,
  },
})
