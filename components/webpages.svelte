<script lang="ts">
  import { onMount } from "svelte"
  import { fade } from "svelte/transition"
  import { i18n } from "#i18n"
  import Entry from "./entry.svelte"
  import WebpageForm from "./webpage-form.svelte"
  import { webpageStorage, type Webpage } from "@/utils/storage"

  const t = i18n.t

  let webpages = $state<Webpage[]>([])
  let editingId = $state<string | null>(null)

  onMount(() => {
    let active = true

    // Keep the list in sync with changes made from the other extension page
    const unwatch = webpageStorage.watch(value => {
      webpages = value
    })

    webpageStorage
      .getValue()
      .then(value => {
        if (active) webpages = value
      })
      .catch(error => {
        console.error("[open-webpage-on-startup] Could not read the saved webpages", error)
      })

    return () => {
      active = false
      unwatch()
    }
  })
</script>

<div class="flex w-full flex-col gap-3">
  <div class="flex items-center justify-between gap-2 px-1">
    <h2 class="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
      {t("savedWebpagesTitle")}
    </h2>
    {#if webpages.length > 0}
      <span class="chip bg-slate-200/70 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
        {webpages.length}
      </span>
    {/if}
  </div>

  {#if webpages.length === 0}
    <div class="card flex flex-col items-center gap-2 p-8 text-center">
      <span
        class="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
      >
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M13 3H6a2 2 0 00-2 2v13a2 2 0 002 2h13a2 2 0 002-2v-7"
          />
          <path stroke-linecap="round" stroke-linejoin="round" d="M16 3h5v5M10 14L21 3" />
        </svg>
      </span>
      <p class="text-sm font-medium text-slate-700 dark:text-slate-200">{t("noWebpagesYet")}</p>
      <p class="max-w-xs text-xs text-slate-500 dark:text-slate-400">{t("noWebpagesHint")}</p>
    </div>
  {:else}
    {#each webpages as webpage (webpage.id)}
      {#if editingId === webpage.id}
        <div class="card p-4" transition:fade={{ duration: 150 }}>
          <WebpageForm {webpage} onDone={() => (editingId = null)} />
        </div>
      {:else}
        <Entry {webpage} onEdit={() => (editingId = webpage.id)} />
      {/if}
    {/each}
  {/if}
</div>
