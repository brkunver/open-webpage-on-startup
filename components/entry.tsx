import { createMemo, createSignal, Match, Show, Switch } from "solid-js"
import { i18n } from "#i18n"
import { repeatModes, webpageStorage, type RepeatMode, type Webpage } from "@/utils/storage"
import { formatHour } from "@/utils/url"

const t = i18n.t

const repeatStyles: Record<RepeatMode, { label: string; color: string }> = {
  everytime: {
    label: t("repeatModeEverytime"),
    color:
      "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20",
  },
  daily_once: {
    label: t("repeatModeDailyOnce"),
    color:
      "bg-sky-50 text-sky-700 hover:bg-sky-100 dark:bg-sky-500/10 dark:text-sky-400 dark:hover:bg-sky-500/20",
  },
  passive: {
    label: t("repeatModePassive"),
    color:
      "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700",
  },
}

type EntryProps = {
  webpage: Webpage
  onEdit: () => void
}

export default function Entry(props: EntryProps) {
  const [confirmingDelete, setConfirmingDelete] = createSignal(false)
  const [busy, setBusy] = createSignal(false)

  const style = createMemo(() => repeatStyles[props.webpage.repeat])
  const dailyRangeLabel = createMemo(() =>
    props.webpage.dailyRange
      ? `${formatHour(props.webpage.dailyRange.before)} - ${formatHour(props.webpage.dailyRange.after)}`
      : null,
  )

  /** Applies a change to the stored list, matched by id so entries sharing a URL stay independent. */
  async function updateStorage(update: (webpages: Webpage[]) => Webpage[]) {
    if (busy()) return
    setBusy(true)
    try {
      await webpageStorage.setValue(update(await webpageStorage.getValue()))
    } catch (error) {
      console.error("[open-webpage-on-startup] Could not update the webpage", error)
    } finally {
      setBusy(false)
    }
  }

  function cycleRepeatMode() {
    const next = repeatModes[(repeatModes.indexOf(props.webpage.repeat) + 1) % repeatModes.length] ?? "everytime"
    void updateStorage(webpages =>
      webpages.map(page => (page.id === props.webpage.id ? { ...page, repeat: next } : page)),
    )
  }

  function deleteWebpage() {
    setConfirmingDelete(false)
    void updateStorage(webpages => webpages.filter(page => page.id !== props.webpage.id))
  }

  function formatLastOpened(timestamp: number | undefined): string {
    if (!timestamp) return t("never")
    return new Date(timestamp).toLocaleString()
  }

  return (
    <Show
      when={!confirmingDelete()}
      fallback={
        <div class="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-900/60 dark:bg-red-950/30">
          <span class="min-w-0 truncate text-xs font-medium text-red-700 dark:text-red-400">{t("confirmDelete")}</span>
          <div class="flex shrink-0 gap-2">
            <button class="btn-danger px-3 py-1.5 text-xs" onClick={deleteWebpage} disabled={busy()}>
              {t("deleteWebpage")}
            </button>
            <button class="btn-secondary px-3 py-1.5 text-xs" onClick={() => setConfirmingDelete(false)}>
              {t("cancel")}
            </button>
          </div>
        </div>
      }
    >
      <div class="group card flex items-center gap-3 p-3 transition hover:border-slate-300 hover:shadow-md dark:hover:border-slate-700">
        <div class="shrink-0">
          <Show
            when={props.webpage.logo}
            fallback={
              <div class="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-sm font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                {props.webpage.name.charAt(0).toUpperCase()}
              </div>
            }
          >
            {logo => (
              <img src={logo()} alt={`${props.webpage.name} logo`} class="h-9 w-9 rounded-xl object-cover" />
            )}
          </Show>
        </div>

        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-semibold text-slate-900 dark:text-slate-100" title={props.webpage.name}>
            {props.webpage.name}
          </p>
          <a
            href={props.webpage.url}
            target="_blank"
            rel="noopener noreferrer"
            class="block truncate text-xs text-slate-500 transition-colors hover:text-blue-600 hover:underline dark:text-slate-400 dark:hover:text-blue-400"
            title={props.webpage.url}
          >
            {props.webpage.url}
          </a>

          <div class="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
            <button
              class={`chip cursor-pointer transition-colors disabled:opacity-50 ${style().color}`}
              onClick={cycleRepeatMode}
              disabled={busy()}
              title={t("changeRepeatMode")}
            >
              <Switch>
                <Match when={props.webpage.repeat === "everytime"}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </Match>
                <Match when={props.webpage.repeat === "daily_once"}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </Match>
                <Match when={props.webpage.repeat === "passive"}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </Match>
              </Switch>
              <span>{style().label}</span>
            </button>

            <Show when={dailyRangeLabel()}>
              {label => (
                <span
                  class="chip bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                  title={t("dailyTimeRangeLabel")}
                >
                  <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{label()}</span>
                </span>
              )}
            </Show>

            <span class="text-[11px] text-slate-400 dark:text-slate-500">
              {t("lastOpened")}: {formatLastOpened(props.webpage.lastOpened)}
            </span>
          </div>
        </div>

        <div class="flex shrink-0 items-center gap-0.5 opacity-60 transition-opacity group-hover:opacity-100">
          <button
            class="icon-button hover:text-blue-600 dark:hover:text-blue-400"
            onClick={() => props.onEdit()}
            title={t("editWebpage")}
            aria-label={t("editWebpage")}
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>

          <button
            class="icon-button hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
            onClick={() => setConfirmingDelete(true)}
            title={t("deleteWebpage")}
            aria-label={t("deleteWebpage")}
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </Show>
  )
}
