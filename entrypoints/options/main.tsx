import { render } from "solid-js/web"
import "~/assets/tailwind.css"
import App from "./App"
import { i18n } from "#i18n"

document.title = i18n.t("optionsTitle")
render(() => <App />, document.getElementById("root")!)
