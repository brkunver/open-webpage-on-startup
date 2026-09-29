/**
 * Integration tests for the background entrypoint.
 *
 * The handlers run against the real `wxt/storage` item and an in-memory
 * `browser`, so these cover the whole flow: read the saved list, decide what is
 * due, open the tabs and write `lastOpened` back.
 */
import { afterEach, beforeEach, describe, expect, test } from "bun:test"
import type { Webpage } from "@/utils/webpage"

const { fakeBrowser } = await import("../test/extension")
const { webpageStorage } = await import("@/utils/storage")
const { default: background } = await import("./background")

const ALARM_NAME = "open-webpages-check"
const ALARM_PERIOD_MINUTES = 30

type Alarm = { name: string }

type Listeners = {
  startup?: () => void
  installed?: () => void
  alarm?: (alarm: Alarm) => void
}

let listeners: Listeners = {}
/** URLs the entrypoint asked the browser to open, in order. */
let opened: string[] = []
/** URLs `browser.tabs.create` should reject for. */
let failFor: string[] = []
/** Runs right before a tab is opened, to simulate edits made in the meantime. */
let beforeOpen: (() => Promise<void>) | undefined
let alarmCalls: { name: string; periodInMinutes?: number }[] = []

/**
 * The untouched `alarms.create`, captured before the tests wrap it. Wrapping it
 * again per test would build a chain that counts every call once per test.
 */
const realCreateAlarm = fakeBrowser.alarms.create.bind(fakeBrowser.alarms)

const originalLog = console.log
const originalWarn = console.warn

/** Lets the fire-and-forget handler chains settle. */
const flush = () => new Promise(resolve => setTimeout(resolve, 0))

function page(id: string, overrides: Partial<Webpage> = {}): Webpage {
  return { id, name: id, url: `https://${id}.test/`, repeat: "everytime", ...overrides }
}

/** A daily window that contains the current hour. */
function windowAround(now: Date) {
  const hour = now.getHours()
  return { before: hour, after: (hour + 1) % 24 }
}

/** A daily window that excludes the current hour. */
function windowOutside(now: Date) {
  const hour = now.getHours()
  return { before: (hour + 1) % 24, after: (hour + 2) % 24 }
}

/** Runs the entrypoint and captures the listeners it registers. */
async function boot(): Promise<Listeners> {
  const captured: Listeners = {}

  fakeBrowser.runtime.onStartup.addListener = ((listener: () => void) => {
    captured.startup = listener
  }) as never
  fakeBrowser.runtime.onInstalled.addListener = ((listener: () => void) => {
    captured.installed = listener
  }) as never
  fakeBrowser.alarms.onAlarm.addListener = ((listener: (alarm: Alarm) => void) => {
    captured.alarm = listener
  }) as never

  background.main()
  // The entrypoint also ensures the alarm while it loads
  await flush()

  return captured
}

async function triggerStartup() {
  listeners.startup!()
  await flush()
}

async function triggerInstalled() {
  listeners.installed!()
  await flush()
}

async function triggerAlarm(name = ALARM_NAME) {
  listeners.alarm!({ name })
  await flush()
}

/** Reads a raw storage key. The fake browser types `storage.get` strictly. */
function readRaw(key: string) {
  return (fakeBrowser.storage.local.get as unknown as (key: string) => Promise<Record<string, unknown>>)(key)
}

beforeEach(async () => {
  fakeBrowser.reset()
  opened = []
  failFor = []
  beforeOpen = undefined
  alarmCalls = []

  // The entrypoint logs what it opened; the assertions cover that instead
  console.log = () => {}
  console.warn = () => {}

  fakeBrowser.alarms.create = ((name: string, info?: { periodInMinutes?: number }) => {
    alarmCalls.push({ name, periodInMinutes: info?.periodInMinutes })
    return realCreateAlarm(name, info as never)
  }) as never

  fakeBrowser.tabs.create = (async (props: { url?: string }) => {
    const url = props.url ?? ""
    if (beforeOpen) await beforeOpen()
    if (failFor.includes(url)) throw new Error(`blocked: ${url}`)
    opened.push(url)
    return { id: opened.length } as never
  }) as never

  listeners = await boot()
})

afterEach(() => {
  console.log = originalLog
  console.warn = originalWarn
})

describe("startup", () => {
  test("opens the due pages and remembers when it opened them", async () => {
    const now = new Date()
    const everytime = page("everytime")
    const daily = page("daily", { repeat: "daily_once" })
    const openedToday = page("opened-today", { repeat: "daily_once", lastOpened: now.getTime() })
    const passive = page("passive", { repeat: "passive" })

    await webpageStorage.setValue([everytime, daily, openedToday, passive])
    const startedAt = Date.now()

    await triggerStartup()

    expect(opened).toEqual([everytime.url, daily.url])

    const stored = await webpageStorage.getValue()
    const byId = new Map(stored.map(site => [site.id, site]))
    expect(byId.get("everytime")!.lastOpened).toBeGreaterThanOrEqual(startedAt)
    expect(byId.get("daily")!.lastOpened).toBeGreaterThanOrEqual(startedAt)
    // Untouched entries keep exactly what they had
    expect(byId.get("opened-today")!.lastOpened).toBe(now.getTime())
    expect(byId.get("passive")!.lastOpened).toBeUndefined()
  })

  test("skips pages that refuse to open and keeps opening the rest", async () => {
    const first = page("first")
    const broken = page("broken")
    const last = page("last")

    await webpageStorage.setValue([first, broken, last])
    failFor = [broken.url]

    await triggerStartup()

    expect(opened).toEqual([first.url, last.url])

    const stored = await webpageStorage.getValue()
    expect(stored.map(site => site.id)).toEqual(["first", "broken", "last"])
    // The page that never opened must not look like it did
    expect(stored[1]!.lastOpened).toBeUndefined()
  })

  test("keeps edits made while the tabs were opening", async () => {
    const existing = page("existing")
    await webpageStorage.setValue([existing])

    // The popup can save a new page while the background is still opening tabs
    beforeOpen = async () => {
      beforeOpen = undefined
      await webpageStorage.setValue([existing, page("added-later")])
    }

    await triggerStartup()

    const stored = await webpageStorage.getValue()
    expect(stored.map(site => site.id)).toEqual(["existing", "added-later"])
    expect(stored[0]!.lastOpened).toBeGreaterThan(0)
    expect(stored[1]!.lastOpened).toBeUndefined()
  })

  test("leaves pages that are outside their daily window alone", async () => {
    const now = new Date()
    const outside = page("outside", { repeat: "everytime", dailyRange: windowOutside(now) })

    await webpageStorage.setValue([outside])

    await triggerStartup()

    expect(opened).toEqual([])
  })

  test("does not touch storage when nothing is due", async () => {
    await triggerStartup()

    expect(opened).toEqual([])
    expect(await webpageStorage.getValue()).toEqual([])
    // Nothing was opened, so the item must not have been written at all
    expect(await readRaw("webpages")).toEqual({})
  })
})

describe("alarm", () => {
  test("rechecks windowed daily pages while the browser stays open", async () => {
    const now = new Date()
    const inside = page("inside", { repeat: "daily_once", dailyRange: windowAround(now) })
    const outside = page("outside", { repeat: "daily_once", dailyRange: windowOutside(now) })
    const openedToday = page("opened-today", { repeat: "daily_once", dailyRange: windowAround(now), lastOpened: now.getTime() })
    const everytime = page("everytime")

    await webpageStorage.setValue([inside, outside, openedToday, everytime])

    await triggerAlarm()

    expect(opened).toEqual([inside.url])
  })

  test("ignores alarms that belong to someone else", async () => {
    await webpageStorage.setValue([page("inside", { repeat: "daily_once" })])

    await triggerAlarm("some-other-alarm")

    expect(opened).toEqual([])
  })
})

describe("alarm setup", () => {
  test("creates the periodic alarm while the background starts", () => {
    expect(alarmCalls).toEqual([{ name: ALARM_NAME, periodInMinutes: ALARM_PERIOD_MINUTES }])
  })

  test("does not reset the timer of an alarm that already exists", async () => {
    await triggerInstalled()

    expect(alarmCalls).toHaveLength(1)
    expect(await fakeBrowser.alarms.get(ALARM_NAME)).toBeDefined()
  })

  test("re-creates a missing alarm, since alarms do not survive a restart", async () => {
    await fakeBrowser.alarms.clear(ALARM_NAME)
    alarmCalls = []

    await triggerInstalled()

    expect(alarmCalls).toEqual([{ name: ALARM_NAME, periodInMinutes: ALARM_PERIOD_MINUTES }])
  })
})
