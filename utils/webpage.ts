/**
 * Pure webpage model and open-decision helpers.
 *
 * This module intentionally has no dependency on WXT or the browser APIs so it
 * can be unit tested directly. `utils/storage.ts` re-exports everything here.
 */

export type RepeatMode = "everytime" | "daily_once" | "passive"

export type DailyRange = {
  /** First hour (0-23) the page is allowed to open. */
  before: number
  /** Hour (0-23) the window closes, exclusive. */
  after: number
}

export type Webpage = {
  /**
   * Stable identifier, added in storage version 2.
   *
   * Entries used to be matched by URL, which made deleting or cycling the
   * repeat mode of one entry affect another entry sharing the same URL.
   */
  id: string
  name: string
  url: string
  logo?: string
  repeat: RepeatMode
  dailyRange?: DailyRange
  lastOpened?: number
}

export const repeatModes: RepeatMode[] = ["everytime", "daily_once", "passive"]

/**
 * Generates an id for a webpage.
 *
 * `crypto.randomUUID` is available in all extension contexts (service worker,
 * background page, popup/options), the fallback only exists for exotic builds.
 */
export function createId(): string {
  const uuid = globalThis.crypto?.randomUUID?.()
  if (uuid) return uuid
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

/** Narrows an arbitrary value to a known repeat mode, defaulting to `everytime`. */
export function toRepeatMode(value: unknown): RepeatMode {
  return repeatModes.includes(value as RepeatMode) ? (value as RepeatMode) : "everytime"
}

/** Migrates the stored v1 array (no `id`) to the v2 shape. */
export function migrateToV2(oldValue: unknown): Webpage[] {
  if (!Array.isArray(oldValue)) return []

  return oldValue.map((entry): Webpage => {
    const old = entry && typeof entry === "object" ? (entry as Record<string, unknown>) : {}

    const rawRange = old.dailyRange && typeof old.dailyRange === "object" ? (old.dailyRange as Record<string, unknown>) : null
    const dailyRange =
      rawRange && Number.isFinite(rawRange.before) && Number.isFinite(rawRange.after)
        ? { before: rawRange.before as number, after: rawRange.after as number }
        : undefined

    return {
      // Keep an existing id, re-running the migration must not reshuffle data
      id: typeof old.id === "string" && old.id ? old.id : createId(),
      name: typeof old.name === "string" ? old.name : "",
      url: typeof old.url === "string" ? old.url : "",
      ...(typeof old.logo === "string" ? { logo: old.logo } : {}),
      // Unknown or legacy modes are parked instead of opening unexpectedly
      repeat: old.repeat === "daily_once" || old.repeat === "everytime" ? old.repeat : "passive",
      ...(dailyRange ? { dailyRange } : {}),
      lastOpened: typeof old.lastOpened === "number" ? old.lastOpened : 0,
    }
  })
}

/** Whether `now` falls inside the (optional) daily window of a webpage. */
export function isWithinDailyRange(site: Webpage, now: Date): boolean {
  const range = site.dailyRange
  if (!range) return true

  const hour = now.getHours()
  const { before, after } = range

  // Zero-length window: never open
  if (before === after) return false
  // Same-day window, e.g. 09 -> 17 (17 is exclusive)
  if (before < after) return hour >= before && hour < after
  // Window wrapping past midnight, e.g. 22 -> 06
  return hour >= before || hour < after
}

/** Whether the webpage was already opened on `now`'s local calendar day. */
export function wasOpenedToday(site: Webpage, now: Date): boolean {
  if (!site.lastOpened) return false
  return new Date(site.lastOpened).toDateString() === now.toDateString()
}

/** Pages to open when the browser session starts. */
export function shouldOpenOnStartup(site: Webpage, now: Date): boolean {
  if (!isWithinDailyRange(site, now)) return false

  switch (site.repeat) {
    case "everytime":
      return true
    case "daily_once":
      return !wasOpenedToday(site, now)
    default:
      return false
  }
}

/**
 * Pages to open while the browser is already running.
 *
 * Without this, a "once a day" page with a daily window would never open when
 * the browser was started outside that window and left open all day. Only
 * windowed pages are picked up here, so pages without a window keep the plain
 * "open on startup" behaviour.
 */
export function shouldOpenOnAlarm(site: Webpage, now: Date): boolean {
  return (
    site.repeat === "daily_once" &&
    site.dailyRange != null &&
    !wasOpenedToday(site, now) &&
    isWithinDailyRange(site, now)
  )
}
