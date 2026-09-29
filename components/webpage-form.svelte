<script lang="ts">
  import { untrack } from "svelte"
  import { fade } from "svelte/transition"
  import { i18n } from "#i18n"
  import Select from "@/components/select.svelte"
  import { createId, toRepeatMode, webpageStorage, type Webpage } from "@/utils/storage"
  import { formatHour, normalizeUrl } from "@/utils/url"

  let { webpage = null, onDone }: { webpage?: Webpage | null; onDone?: () => void } = $props()

  const t = i18n.t
  const uid = $props.id()

  const isEditing = $derived(webpage !== null)

  const options = $derived([
    { label: t("repeatModeEverytime"), value: "everytime" },
    { label: t("repeatModeDailyOnce"), value: "daily_once" },
    { label: t("repeatModePassive"), value: "passive" },
  ])

  const rangeTicks = [0, 6, 12, 18, 23]

  // A new form instance is mounted per webpage, so the fields are seeded once
  // on purpose - later prop changes must not clobber what the user typed.
  const initial = untrack(() => webpage)

  let name = $state(initial?.name ?? "")
  let url = $state(initial?.url ?? "")
  let repeat = $state<string>(initial?.repeat ?? "everytime")
  let enableDailyRange = $state(initial?.dailyRange != null)
  let dailyRange = $state({
    start: initial?.dailyRange?.before ?? 9,
    end: initial?.dailyRange?.after ?? 17,
  })

  let error = $state<string | null>(null)
  let saving = $state(false)

  const canSubmit = $derived(name.trim().length > 0 && url.trim().length > 0 && !saving)

  function resetForm() {
    name = ""
    url = ""
    repeat = "everytime"
    enableDailyRange = false
    dailyRange = { start: 9, end: 17 }
    error = null
  }

  async function save() {
    if (!canSubmit) return

    const normalizedUrl = normalizeUrl(url)
    if (!normalizedUrl) {
      error = t("errorInvalidUrl")
      return
    }

    saving = true
    error = null

    try {
      const webpages = await webpageStorage.getValue()

      if (webpages.some(page => page.id !== webpage?.id && page.url === normalizedUrl)) {
        error = t("errorDuplicateUrl")
        return
      }

      const entry: Webpage = {
        id: webpage?.id ?? createId(),
        name: name.trim(),
        url: normalizedUrl,
        repeat: toRepeatMode(repeat),
        ...(webpage?.logo ? { logo: webpage.logo } : {}),
        ...(enableDailyRange ? { dailyRange: { before: dailyRange.start, after: dailyRange.end } } : {}),
        lastOpened: webpage?.lastOpened ?? 0,
      }

      await webpageStorage.setValue(
        webpage ? webpages.map(page => (page.id === entry.id ? entry : page)) : [...webpages, entry],
      )

      if (webpage) onDone?.()
      else resetForm()
    } catch (err) {
      console.error("[open-webpage-on-startup] Could not save the webpage", err)
      error = t("errorSaveFailed")
    } finally {
      saving = false
    }
  }
</script>

<div class="flex flex-col gap-5">
  <div class="grid gap-4 sm:grid-cols-2">
    <div>
      <label class="label" for="{uid}-name">{t("nameLabel")}</label>
      <input
        id="{uid}-name"
        class="input"
        type="text"
        placeholder={t("websiteNamePlaceholder")}
        bind:value={name}
        oninput={() => (error = null)}
      />
    </div>

    <div>
      <label class="label" for="{uid}-url">{t("urlLabel")}</label>
      <input
        id="{uid}-url"
        class="input"
        type="url"
        placeholder="https://example.com"
        bind:value={url}
        oninput={() => (error = null)}
      />
    </div>
  </div>

  <div class="grid gap-4 sm:grid-cols-2">
    <div>
      <label class="label" for="{uid}-open-mode">{t("openModeLabel")}</label>
      <Select {options} bind:value={repeat} />
    </div>

    <div>
      <span class="label">{t("dailyTimeRangeLabel")}</span>
      <label
        class="flex h-9.5 cursor-pointer items-center justify-between gap-3 rounded-lg border border-slate-300 bg-white px-3 transition-colors hover:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:hover:border-slate-600"
      >
        <span
          class="text-sm {enableDailyRange
            ? 'font-medium text-slate-900 dark:text-slate-100'
            : 'text-slate-400 dark:text-slate-500'}"
        >
          {enableDailyRange ? `${formatHour(dailyRange.start)} - ${formatHour(dailyRange.end)}` : "—"}
        </span>

        <span class="inline-flex shrink-0">
          <input
            id="{uid}-enable-daily-range"
            type="checkbox"
            class="peer sr-only"
            bind:checked={enableDailyRange}
          />
          <span
            class="relative h-5 w-9 rounded-full bg-slate-300 transition-colors peer-checked:bg-blue-600 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500/40 after:absolute after:top-0.5 after:left-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow after:transition-transform after:content-[''] peer-checked:after:translate-x-4 dark:bg-slate-700"
          ></span>
        </span>
      </label>
    </div>
  </div>

  {#if enableDailyRange}
    <div
      class="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/40"
      transition:fade={{ duration: 150 }}
    >
      <div class="grid gap-5 sm:grid-cols-2">
        <div class="space-y-2">
          <div class="flex items-center justify-between gap-2">
            <label class="label mb-0" for="{uid}-start-time">{t("startTimeLabel")}</label>
            <span class="badge bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
              {formatHour(dailyRange.start)}
            </span>
          </div>
          <input
            id="{uid}-start-time"
            type="range"
            min="0"
            max="23"
            bind:value={dailyRange.start}
            class="w-full cursor-pointer accent-blue-600"
          />
          <div class="flex justify-between text-[10px] text-slate-400 dark:text-slate-500">
            {#each rangeTicks as tick (tick)}
              <span>{formatHour(tick)}</span>
            {/each}
          </div>
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between gap-2">
            <label class="label mb-0" for="{uid}-end-time">{t("endTimeLabel")}</label>
            <span class="badge bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
              {formatHour(dailyRange.end)}
            </span>
          </div>
          <input
            id="{uid}-end-time"
            type="range"
            min="0"
            max="23"
            bind:value={dailyRange.end}
            class="w-full cursor-pointer accent-blue-600"
          />
          <div class="flex justify-between text-[10px] text-slate-400 dark:text-slate-500">
            {#each rangeTicks as tick (tick)}
              <span>{formatHour(tick)}</span>
            {/each}
          </div>
        </div>
      </div>

      <div class="mt-4 flex items-start gap-2 rounded-lg bg-blue-50 p-3 dark:bg-blue-500/10">
        <svg class="mt-px h-4 w-4 shrink-0 text-blue-500 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
          <path
            fill-rule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clip-rule="evenodd"
          />
        </svg>
        <div class="min-w-0">
          <p class="text-xs font-semibold text-blue-800 dark:text-blue-300">{t("pageAvailability")}</p>
          <p class="mt-0.5 text-xs text-blue-700 dark:text-blue-400">
            {t("pageWillBeAvailableBetween", [formatHour(dailyRange.start), formatHour(dailyRange.end)])}
          </p>
        </div>
      </div>
    </div>
  {/if}

  {#if error}
    <p
      class="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700 dark:bg-red-500/10 dark:text-red-400"
      role="alert"
    >
      <svg class="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path
          fill-rule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clip-rule="evenodd"
        />
      </svg>
      {error}
    </p>
  {/if}

  <div class="flex gap-2">
    <button class="btn-primary flex-1" onclick={save} disabled={!canSubmit}>
      {isEditing ? t("saveChanges") : t("addNewWebpage")}
    </button>

    {#if isEditing}
      <button class="btn-secondary" onclick={() => onDone?.()}>
        {t("cancel")}
      </button>
    {/if}
  </div>
</div>
