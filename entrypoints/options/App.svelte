<script lang="ts">
  import Webpages from "@/components/webpages.svelte"
  import AddNewWebpage from "@/components/add-new-webpage.svelte"
  import { i18n } from "#i18n"

  const t = i18n.t
</script>

<div class="min-h-screen">
  <header
    class="sticky top-0 z-10 border-b border-slate-200 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-900/85"
  >
    <div class="mx-auto flex max-w-3xl items-center gap-3 px-6 py-3">
      <span class="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-600 text-white shadow-sm">
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13 3H6a2 2 0 00-2 2v13a2 2 0 002 2h13a2 2 0 002-2v-7" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M16 3h5v5M10 14L21 3" />
        </svg>
      </span>
      <div class="min-w-0">
        <h1 class="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{t("extensionName")}</h1>
        <p class="truncate text-xs text-slate-500 dark:text-slate-400">{t("extensionDescription")}</p>
      </div>
    </div>
  </header>

  <main class="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-6 pb-16">
    <AddNewWebpage />
    <Webpages />
  </main>
</div>
