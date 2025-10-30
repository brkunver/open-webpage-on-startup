//import { createSignal } from "solid-js"
import { i18n } from "#i18n"

export default function App() {
  const t = i18n.t
  return (
    <div class="flex flex-col min-w-[400px] min-h-[200px]">
      <h1 class="text-2xl text-center font-bold">{t("extensionName")}</h1>
    </div>
  )
}
