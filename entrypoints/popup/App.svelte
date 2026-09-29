<script lang="ts">
  import { i18n } from "#i18n"
  import Webpages from "@/components/webpages.svelte"

  const t = i18n.t

  async function openOptionsPage() {
    await browser.runtime.openOptionsPage()
  }
</script>

<main class="flex w-100 flex-col bg-slate-100 dark:bg-slate-950">
  <header
    class="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900"
  >
    <span class="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-blue-600 text-white shadow-sm">
      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M13 3H6a2 2 0 00-2 2v13a2 2 0 002 2h13a2 2 0 002-2v-7" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M16 3h5v5M10 14L21 3" />
      </svg>
    </span>
    <h1 class="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{t("extensionName")}</h1>
  </header>

  <div class="p-3 pb-0">
    <button class="btn-primary w-full" onclick={openOptionsPage}>
      <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
      </svg>
      {t("addNewWebpage")}
    </button>
  </div>

  <div class="p-3">
    <Webpages />
  </div>
</main>
