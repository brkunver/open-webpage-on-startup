import { describe, expect, test } from "bun:test"
import {
  isWithinDailyRange,
  migrateToV2,
  shouldOpenOnAlarm,
  shouldOpenOnStartup,
  wasOpenedToday,
  type Webpage,
} from "./webpage"

function page(overrides: Partial<Webpage> = {}): Webpage {
  return { id: "page-1", name: "Example", url: "https://example.com/", repeat: "everytime", ...overrides }
}

/** Local-time date helper so the tests never depend on the machine timezone. */
function at(day: number, hour: number): Date {
  return new Date(2026, 0, day, hour, 30, 0, 0)
}

describe("isWithinDailyRange", () => {
  test("a page without a window is always allowed", () => {
    expect(isWithinDailyRange(page(), at(15, 3))).toBe(true)
  })

  test("9 -> 17 is inclusive of 09:00 and exclusive of 17:00", () => {
    const site = page({ dailyRange: { before: 9, after: 17 } })
    expect(isWithinDailyRange(site, at(15, 8))).toBe(false)
    expect(isWithinDailyRange(site, at(15, 9))).toBe(true)
    expect(isWithinDailyRange(site, at(15, 16))).toBe(true)
    expect(isWithinDailyRange(site, at(15, 17))).toBe(false)
  })

  test("22 -> 6 wraps past midnight", () => {
    const site = page({ dailyRange: { before: 22, after: 6 } })
    expect(isWithinDailyRange(site, at(15, 23))).toBe(true)
    expect(isWithinDailyRange(site, at(16, 0))).toBe(true)
    expect(isWithinDailyRange(site, at(16, 5))).toBe(true)
    expect(isWithinDailyRange(site, at(16, 6))).toBe(false)
    expect(isWithinDailyRange(site, at(15, 21))).toBe(false)
  })

  test("a zero-length window never opens", () => {
    const site = page({ dailyRange: { before: 9, after: 9 } })
    expect(isWithinDailyRange(site, at(15, 9))).toBe(false)
    expect(isWithinDailyRange(site, at(15, 3))).toBe(false)
  })
})

describe("wasOpenedToday", () => {
  test("a page that was never opened counts as not opened", () => {
    expect(page().lastOpened).toBeUndefined()
    expect(wasOpenedToday(page(), at(15, 10))).toBe(false)
    expect(wasOpenedToday(page({ lastOpened: 0 }), at(15, 10))).toBe(false)
  })

  test("compares the local calendar day", () => {
    expect(wasOpenedToday(page({ lastOpened: at(15, 8).getTime() }), at(15, 23))).toBe(true)
    expect(wasOpenedToday(page({ lastOpened: at(14, 23).getTime() }), at(15, 1))).toBe(false)
  })
})

describe("shouldOpenOnStartup", () => {
  test("everytime pages open on every startup once inside their window", () => {
    expect(shouldOpenOnStartup(page({ repeat: "everytime" }), at(15, 10))).toBe(true)
    expect(shouldOpenOnStartup(page({ repeat: "everytime", lastOpened: at(15, 9).getTime() }), at(15, 10))).toBe(true)
  })

  test("passive pages never open", () => {
    expect(shouldOpenOnStartup(page({ repeat: "passive" }), at(15, 10))).toBe(false)
  })

  test("daily_once pages open only once per day", () => {
    const site = page({ repeat: "daily_once" })
    expect(shouldOpenOnStartup(site, at(15, 10))).toBe(true)
    expect(shouldOpenOnStartup({ ...site, lastOpened: at(15, 8).getTime() }, at(15, 20))).toBe(false)
    expect(shouldOpenOnStartup({ ...site, lastOpened: at(14, 8).getTime() }, at(15, 8))).toBe(true)
  })

  test("the daily window blocks the startup check", () => {
    const site = page({ repeat: "everytime", dailyRange: { before: 9, after: 17 } })
    expect(shouldOpenOnStartup(site, at(15, 6))).toBe(false)
    expect(shouldOpenOnStartup(site, at(15, 12))).toBe(true)
  })
})

describe("shouldOpenOnAlarm", () => {
  test("picks up windowed daily pages that were missed at startup", () => {
    const site = page({ repeat: "daily_once", dailyRange: { before: 9, after: 17 } })
    expect(shouldOpenOnAlarm(site, at(15, 8))).toBe(false) // still before the window
    expect(shouldOpenOnAlarm(site, at(15, 9))).toBe(true) // window opened later
    expect(shouldOpenOnAlarm({ ...site, lastOpened: at(15, 9).getTime() }, at(15, 12))).toBe(false)
  })

  test("leaves pages without a window to the startup event", () => {
    expect(shouldOpenOnAlarm(page({ repeat: "daily_once" }), at(15, 10))).toBe(false)
    expect(shouldOpenOnAlarm(page({ repeat: "everytime" }), at(15, 10))).toBe(false)
    expect(shouldOpenOnAlarm(page({ repeat: "passive" }), at(15, 10))).toBe(false)
  })
})

describe("migrateToV2", () => {
  test("non-array values become an empty list", () => {
    expect(migrateToV2(null)).toEqual([])
    expect(migrateToV2({ a: 1 })).toEqual([])
  })

  test("adds ids to v1 entries and keeps the rest of the data", () => {
    const migrated = migrateToV2([
      { name: "Work", url: "https://example.com/", repeat: "daily_once", dailyRange: { before: 9, after: 17 }, lastOpened: 123 },
    ])

    expect(migrated).toHaveLength(1)
    expect(typeof migrated[0]!.id).toBe("string")
    expect(migrated[0]!.id).toHaveLength(36)
    expect(migrated[0]).toMatchObject({
      name: "Work",
      url: "https://example.com/",
      repeat: "daily_once",
      dailyRange: { before: 9, after: 17 },
      lastOpened: 123,
    })
  })

  test("keeps an existing id so re-running is idempotent", () => {
    const [migrated] = migrateToV2([{ id: "keep-me", name: "A", url: "https://a.test/", repeat: "everytime" }])
    expect(migrated!.id).toBe("keep-me")
  })

  test("parks unknown repeat modes and repairs broken fields instead of losing the entry", () => {
    const migrated = migrateToV2([
      { name: "Legacy", url: "https://legacy.test/", repeat: "sometimes", dailyRange: { before: "nope", after: 5 }, logo: "https://logo.test/a.png" },
    ])

    expect(migrated[0]).toMatchObject({
      name: "Legacy",
      url: "https://legacy.test/",
      repeat: "passive",
      logo: "https://logo.test/a.png",
      lastOpened: 0,
    })
    expect(migrated[0]!.dailyRange).toBeUndefined()
  })

  test("drops entries that are not objects", () => {
    const migrated = migrateToV2(["nonsense"])
    expect(migrated).toHaveLength(1)
    expect(migrated[0]).toMatchObject({ name: "", url: "", repeat: "passive" })
  })
})
