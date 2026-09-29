import { shouldOpenOnAlarm, shouldOpenOnStartup, webpageStorage, type Webpage } from "@/utils/storage"

const ALARM_NAME = "open-webpages-check"
/** How often to re-check windowed "once a day" pages while the browser stays open. */
const ALARM_PERIOD_MINUTES = 30

export default defineBackground(() => {
  browser.runtime.onStartup.addListener(() => runSafely("startup", () => openScheduledWebpages("startup")))
  browser.runtime.onInstalled.addListener(() => runSafely("installed", ensureAlarm))

  browser.alarms.onAlarm.addListener(alarm => {
    if (alarm.name === ALARM_NAME) runSafely("alarm", () => openScheduledWebpages("alarm"))
  })

  // Covers browser sessions that started before the extension was installed or
  // updated (alarms do not survive a browser restart).
  runSafely("ensure-alarm", ensureAlarm)
})

function runSafely(label: string, task: () => Promise<unknown>) {
  task().catch(error => {
    console.error(`[open-webpage-on-startup] ${label} failed`, error)
  })
}

async function ensureAlarm() {
  // Creating an existing alarm would reset its timer, so only create it once.
  if (await browser.alarms.get(ALARM_NAME)) return
  await browser.alarms.create(ALARM_NAME, { periodInMinutes: ALARM_PERIOD_MINUTES })
}

async function openScheduledWebpages(trigger: "startup" | "alarm") {
  const now = new Date()
  const shouldOpen = trigger === "startup" ? shouldOpenOnStartup : shouldOpenOnAlarm
  const sites = await webpageStorage.getValue()
  const toOpen = sites.filter(site => shouldOpen(site, now))

  const openedIds = await openTabs(toOpen)

  if (openedIds.length > 0) {
    await markOpened(openedIds, now)
    console.log(`[open-webpage-on-startup] ${trigger}: opened ${openedIds.length} tab(s).`)
  }
}

/**
 * Opens the tabs one by one, so the tab order matches the saved order and a
 * single bad URL cannot abort the rest of the list.
 */
async function openTabs(sites: Webpage[]): Promise<string[]> {
  const openedIds: string[] = []

  for (const site of sites) {
    try {
      await browser.tabs.create({ url: site.url })
      openedIds.push(site.id)
    } catch (error) {
      console.warn(`[open-webpage-on-startup] Could not open "${site.url}"`, error)
    }
  }

  return openedIds
}

/**
 * Records `lastOpened` for the tabs that actually opened. The list is re-read
 * first so edits made in the meantime are not overwritten.
 */
async function markOpened(ids: string[], now: Date) {
  const openedAt = now.getTime()
  const current = await webpageStorage.getValue()
  const next = current.map(site => (ids.includes(site.id) ? { ...site, lastOpened: openedAt } : site))
  await webpageStorage.setValue(next)
}
