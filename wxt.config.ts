import { defineConfig } from "wxt"
import tailwindcss from "@tailwindcss/vite"

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-solid", "@wxt-dev/i18n/module"],
  manifest: ({ browser }) => ({
    default_locale: "en",
    name: "__MSG_extensionName__",
    description: "__MSG_extensionDescription__",
    // `tabs` is deliberately absent: creating tabs needs no permission, and
    // requesting it makes Chrome warn about reading your browsing history.
    permissions: ["storage", "alarms"],
    // `browser_specific_settings` is Firefox-only. Chrome logs
    // "Unrecognized manifest key 'browser_specific_settings'" if it is present.
    ...(browser === "firefox" && {
      browser_specific_settings: {
        gecko: {
          data_collection_permissions: {
            required: ["none"],
          },
        },
      },
    }),
  }),
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  webExt: {
    disabled: true,
  },
})
