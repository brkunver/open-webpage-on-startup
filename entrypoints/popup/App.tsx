//import { createSignal } from "solid-js"
import { i18n } from "#i18n"

export default function App() {
  const t = i18n.t
  return (
    <>
      <h1>{t("extensionName")}</h1>
    </>
  )
}
