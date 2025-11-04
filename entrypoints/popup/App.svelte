<script lang="ts">
  import { i18n } from "#i18n"
  import Webpages from "../../components/webpages.svelte"

  const t = i18n.t

  async function openOptionsPage() {
    console.log("openOptionsPage")
    await browser.runtime.openOptionsPage()
  }
</script>

<main class="flex flex-col gap-4 bg-gray-50 p-4 w-[400px] min-h-[200px]">
  <header>
    <h1 class="text-2xl font-bold text-center text-gray-800">{t("extensionName")}</h1>
  </header>

  <button
    class="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
    onclick={openOptionsPage}
  >
    <span>{t("addNewWebpage")}</span>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-5 w-5">
      <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
      <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
    </svg>
  </button>

  <div class="border-t border-gray-200"></div>

  <Webpages />
</main>
