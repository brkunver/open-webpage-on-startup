import "~/assets/tailwind.css"
import { render } from "solid-js/web"
import { i18n } from "#i18n"
import App from "./App"

// The <title> tag holds the localized manifest message, replace it with plain text
document.title = i18n.t("extensionName")

render(App, document.getElementById("root")!)
