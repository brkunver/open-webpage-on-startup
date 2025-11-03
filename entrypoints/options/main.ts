import "~/assets/tailwind.css"
import App from "./App.svelte"
import { i18n } from "#i18n"
import { mount } from "svelte"

// set title
document.title = i18n.t("optionsTitle")

const app = mount(App, {
  target: document.getElementById("root")!,
})

export default app
