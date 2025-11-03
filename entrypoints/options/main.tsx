import { render } from "solid-js/web"
import { i18n } from "#i18n"

import "~/assets/tailwind.css"
import App from "./App"

// set title
document.title = i18n.t("optionsTitle")

render(() => <App />, document.getElementById("root")!)
