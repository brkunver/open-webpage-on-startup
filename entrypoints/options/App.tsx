//import { createSignal } from "solid-js"
import { i18n } from "#i18n"
import Webpages from "@/components/webpages"

export default function App() {
  const t = i18n.t

  async function openOptionsPage() {
    console.log("openOptionsPage")
    await browser.runtime.openOptionsPage()
  }
  return (
    <div class="flex flex-col min-w-[400px] min-h-[200px]">
      <h1 class="text-2xl text-center font-bold">{t("extensionName")}</h1>
      <button class="text-center cursor-pointer p-2 m-2 hover:bg-gray-200" onclick={openOptionsPage}>
        <p>{t("addNewWebpage")}</p>
      </button>
      <Webpages />
    </div>
  )
}
