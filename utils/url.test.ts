import { describe, expect, test } from "bun:test"
import { formatHour, normalizeUrl } from "./url"

describe("normalizeUrl", () => {
  test("prefixes bare hosts with https", () => {
    expect(normalizeUrl("wxt.dev")).toBe("https://wxt.dev/")
    expect(normalizeUrl("  wxt.dev/docs  ")).toBe("https://wxt.dev/docs")
  })

  test("keeps http and https URLs", () => {
    expect(normalizeUrl("https://example.com/a?b=c#d")).toBe("https://example.com/a?b=c#d")
    expect(normalizeUrl("http://example.com")).toBe("http://example.com/")
  })

  test("rejects empty input", () => {
    expect(normalizeUrl("")).toBeNull()
    expect(normalizeUrl("   ")).toBeNull()
  })

  test("rejects schemes that must never be opened in a tab", () => {
    expect(normalizeUrl("javascript:alert(1)")).toBeNull()
    expect(normalizeUrl("data:text/html,<h1>hi</h1>")).toBeNull()
    expect(normalizeUrl("file:///etc/passwd")).toBeNull()
    expect(normalizeUrl("chrome://settings")).toBeNull()
  })

  test("rejects broken URLs", () => {
    expect(normalizeUrl("https://")).toBeNull()
    expect(normalizeUrl("not a url")).toBeNull()
    // Ambiguous with a scheme, so an explicit scheme is required
    expect(normalizeUrl("localhost:3000")).toBeNull()
    expect(normalizeUrl("http://localhost:3000")).toBe("http://localhost:3000/")
  })
})

describe("formatHour", () => {
  test("pads single digit hours", () => {
    expect(formatHour(0)).toBe("00:00")
    expect(formatHour(9)).toBe("09:00")
    expect(formatHour(23)).toBe("23:00")
  })
})
