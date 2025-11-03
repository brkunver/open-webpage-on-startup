import "~/assets/tailwind.css"
import App from "./App.svelte"
import { i18n } from "#i18n"

// set title
document.title = i18n.t("optionsTitle")

const app = new App({
  target: document.getElementById("root")!,
})

export default app
