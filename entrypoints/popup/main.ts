import "~/assets/tailwind.css"
import App from "./App.svelte"
import { i18n } from "#i18n"
import { mount } from "svelte"

// The <title> tag holds the localized manifest message, replace it with plain text
document.title = i18n.t("extensionName")

const app = mount(App, {
  target: document.getElementById("root")!,
})

export default app
