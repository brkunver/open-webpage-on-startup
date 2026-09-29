import { createMemo, createSignal, createUniqueId, Show } from "solid-js"
import { i18n } from "#i18n"
import Select from "@/components/select"
import { createId, toRepeatMode, webpageStorage, type Webpage } from "@/utils/storage"
import { formatHour, normalizeUrl } from "@/utils/url"

const t = i18n.t

const rangeTicks = [0, 6, 12, 18, 23]

type WebpageFormProps = {
  webpage?: Webpage | null
  onDone?: () => void
}

export default function WebpageForm(props: WebpageFormProps) {
  const uid = createUniqueId()

  // A form is created per webpage, so the fields are seeded once on purpose
  const [name, setName] = createSignal(props.webpage?.name ?? "")
  const [url, setUrl] = createSignal(props.webpage?.url ?? "")
  const [repeat, setRepeat] = createSignal<string>(props.webpage?.repeat ?? "everytime")
  const [enableDailyRange, setEnableDailyRange] = createSignal(props.webpage?.dailyRange != null)
  const [rangeStart, setRangeStart] = createSignal(props.webpage?.dailyRange?.before ?? 9)
  const [rangeEnd, setRangeEnd] = createSignal(props.webpage?.dailyRange?.after ?? 17)
  const [error, setError] = createSignal<string | null>(null)
  const [saving, setSaving] = createSignal(false)

  const isEditing = createMemo(() => props.webpage != null)
  const canSubmit = createMemo(() => name().trim().length > 0 && url().trim().length > 0 && !saving())

  const options = [
    { label: t("repeatModeEverytime"), value: "everytime" },
    { label: t("repeatModeDailyOnce"), value: "daily_once" },
    { label: t("repeatModePassive"), value: "passive" },
  ]

  function resetForm() {
    setName("")
    setUrl("")
    setRepeat("everytime")
    setEnableDailyRange(false)
    setRangeStart(9)
    setRangeEnd(17)
    setError(null)
  }

  async function save() {
    if (!canSubmit()) return

    const normalizedUrl = normalizeUrl(url())
    if (!normalizedUrl) {
      setError(t("errorInvalidUrl"))
      return
    }

    const current = props.webpage ?? null
    setSaving(true)
    setError(null)

    try {
      const webpages = await webpageStorage.getValue()

      if (webpages.some(page => page.id !== current?.id && page.url === normalizedUrl)) {
        setError(t("errorDuplicateUrl"))
        return
      }

      const entry: Webpage = {
        id: current?.id ?? createId(),
        name: name().trim(),
        url: normalizedUrl,
        repeat: toRepeatMode(repeat()),
        ...(current?.logo ? { logo: current.logo } : {}),
        ...(enableDailyRange() ? { dailyRange: { before: rangeStart(), after: rangeEnd() } } : {}),
        lastOpened: current?.lastOpened ?? 0,
      }

      await webpageStorage.setValue(
        current ? webpages.map(page => (page.id === entry.id ? entry : page)) : [...webpages, entry],
      )

      if (current) props.onDone?.()
      else resetForm()
    } catch (err) {
      console.error("[open-webpage-on-startup] Could not save the webpage", err)
      setError(t("errorSaveFailed"))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div class="flex flex-col gap-5">
      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label class="label" for={`${uid}-name`}>
            {t("nameLabel")}
          </label>
          <input
            id={`${uid}-name`}
            class="input"
            type="text"
            placeholder={t("websiteNamePlaceholder")}
            value={name()}
            onInput={event => {
              setName(event.currentTarget.value)
              setError(null)
            }}
          />
        </div>

        <div>
          <label class="label" for={`${uid}-url`}>
            {t("urlLabel")}
          </label>
          <input
            id={`${uid}-url`}
            class="input"
            type="url"
            placeholder="https://example.com"
            value={url()}
            onInput={event => {
              setUrl(event.currentTarget.value)
              setError(null)
            }}
          />
        </div>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label class="label" for={`${uid}-open-mode`}>
            {t("openModeLabel")}
          </label>
          <Select options={options} value={repeat()} onChange={setRepeat} />
        </div>

        <div>
          <span class="label">{t("dailyTimeRangeLabel")}</span>
          <label class="flex h-9.5 cursor-pointer items-center justify-between gap-3 rounded-lg border border-slate-300 bg-white px-3 transition-colors hover:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:hover:border-slate-600">
            <span
              class={`text-sm ${
                enableDailyRange()
                  ? "font-medium text-slate-900 dark:text-slate-100"
                  : "text-slate-400 dark:text-slate-500"
              }`}
            >
              {enableDailyRange() ? `${formatHour(rangeStart())} - ${formatHour(rangeEnd())}` : "—"}
            </span>

            <span class="inline-flex shrink-0">
              <input
                id={`${uid}-enable-daily-range`}
                type="checkbox"
                class="peer sr-only"
                checked={enableDailyRange()}
                onChange={event => setEnableDailyRange(event.currentTarget.checked)}
              />
              <span class="relative h-5 w-9 rounded-full bg-slate-300 transition-colors peer-checked:bg-blue-600 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500/40 after:absolute after:top-0.5 after:left-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow after:transition-transform after:content-[''] peer-checked:after:translate-x-4 dark:bg-slate-700" />
            </span>
          </label>
        </div>
      </div>

      <Show when={enableDailyRange()}>
        <div class="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/40">
          <div class="grid gap-5 sm:grid-cols-2">
            <div class="space-y-2">
              <div class="flex items-center justify-between gap-2">
                <label class="label mb-0" for={`${uid}-start-time`}>
                  {t("startTimeLabel")}
                </label>
                <span class="badge bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                  {formatHour(rangeStart())}
                </span>
              </div>
              <input
                id={`${uid}-start-time`}
                type="range"
                min="0"
                max="23"
                value={rangeStart()}
                onInput={event => setRangeStart(Number(event.currentTarget.value))}
                class="w-full cursor-pointer accent-blue-600"
              />
              <div class="flex justify-between text-[10px] text-slate-400 dark:text-slate-500">
                {rangeTicks.map(tick => (
                  <span>{formatHour(tick)}</span>
                ))}
              </div>
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-between gap-2">
                <label class="label mb-0" for={`${uid}-end-time`}>
                  {t("endTimeLabel")}
                </label>
                <span class="badge bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                  {formatHour(rangeEnd())}
                </span>
              </div>
              <input
                id={`${uid}-end-time`}
                type="range"
                min="0"
                max="23"
                value={rangeEnd()}
                onInput={event => setRangeEnd(Number(event.currentTarget.value))}
                class="w-full cursor-pointer accent-blue-600"
              />
              <div class="flex justify-between text-[10px] text-slate-400 dark:text-slate-500">
                {rangeTicks.map(tick => (
                  <span>{formatHour(tick)}</span>
                ))}
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
                {t("pageWillBeAvailableBetween", [formatHour(rangeStart()), formatHour(rangeEnd())])}
              </p>
            </div>
          </div>
        </div>
      </Show>

      <Show when={error()}>
        {message => (
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
            {message()}
          </p>
        )}
      </Show>

      <div class="flex gap-2">
        <button class="btn-primary flex-1" onClick={save} disabled={!canSubmit()}>
          {isEditing() ? t("saveChanges") : t("addNewWebpage")}
        </button>

        <Show when={isEditing()}>
          <button class="btn-secondary" onClick={() => props.onDone?.()}>
            {t("cancel")}
          </button>
        </Show>
      </div>
    </div>
  )
}
