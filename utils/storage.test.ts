/**
 * Tests for the stored webpage list itself: the key it lives under, the shape
 * the UI reads back, and the v1 -> v2 migration being wired to the right
 * version.
 */
import { beforeEach, describe, expect, test } from "bun:test"
import type { Webpage } from "./webpage"

const { fakeBrowser } = await import("../test/extension")
const { webpageStorage } = await import("@/utils/storage")

/** The v1 shape: no `id`, and no version metadata in storage at all. */
const legacyValue = [
  { name: "Work", url: "https://work.test/", repeat: "daily_once", dailyRange: { before: 9, after: 17 }, lastOpened: 123 },
  { name: "News", url: "https://news.test/", repeat: "everytime" },
]

beforeEach(() => {
  fakeBrowser.reset()
})

describe("webpageStorage", () => {
  test("reads an empty list when nothing was saved yet", async () => {
    expect(webpageStorage.key).toBe("local:webpages")
    expect(await webpageStorage.getValue()).toEqual([])
  })

  test("reads back exactly what the UI saved", async () => {
    const value: Webpage[] = [
      { id: "a", name: "A", url: "https://a.test/", repeat: "daily_once", dailyRange: { before: 8, after: 12 }, lastOpened: 42 },
      { id: "b", name: "B", url: "https://b.test/", repeat: "passive", logo: "https://b.test/logo.png" },
    ]

    await webpageStorage.setValue(value)

    expect(await webpageStorage.getValue()).toEqual(value)
  })

  test("migrates a saved v1 list by giving every entry an id", async () => {
    await fakeBrowser.storage.local.set({ webpages: legacyValue })

    await webpageStorage.migrate()

    const stored = await webpageStorage.getValue()
    expect(stored).toHaveLength(2)
    expect(stored[0]!.id).toHaveLength(36)
    expect(stored[1]!.id).toHaveLength(36)
    expect(stored[0]!.id).not.toBe(stored[1]!.id)
    expect(stored[0]).toMatchObject({
      name: "Work",
      url: "https://work.test/",
      repeat: "daily_once",
      dailyRange: { before: 9, after: 17 },
      lastOpened: 123,
    })
    // The migrated list is written back and marked as v2, otherwise every
    // context would migrate the same list again
    expect((await fakeBrowser.storage.local.get("webpages$")).webpages$).toEqual({ v: 2 })
  })

  test("does not reshuffle the migrated entries when it runs again", async () => {
    await fakeBrowser.storage.local.set({ webpages: legacyValue })
    await webpageStorage.migrate()
    const migrated = await webpageStorage.getValue()

    // Backdating the metadata is the only way to reach the migration again
    await fakeBrowser.storage.local.set({ webpages$: { v: 1 } })
    await webpageStorage.migrate()

    expect(await webpageStorage.getValue()).toEqual(migrated)
  })
})
