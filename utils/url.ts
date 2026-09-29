/**
 * Matches a leading URI scheme, e.g. `https:`, `mailto:`, `javascript:`.
 * Used to decide whether a user typed a scheme or a bare host like `wxt.dev`.
 */
const HAS_SCHEME_PATTERN = /^[a-z][a-z0-9+.-]*:/i

/**
 * Normalizes user input into a canonical `http`/`https` URL.
 *
 * - Bare hosts get a `https://` prefix (`wxt.dev` -> `https://wxt.dev/`).
 * - Anything that is not a valid `http`/`https` URL returns `null`, including
 *   other schemes (`javascript:`, `data:`, `file:`) that should never be
 *   handed to `browser.tabs.create`.
 */
export function normalizeUrl(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return null

  const candidate = HAS_SCHEME_PATTERN.test(trimmed) ? trimmed : `https://${trimmed}`

  try {
    const url = new URL(candidate)
    if (url.protocol !== "http:" && url.protocol !== "https:") return null
    if (!url.hostname) return null
    return url.toString()
  } catch {
    return null
  }
}

/** Formats an hour (0-23) as `HH:00`. */
export function formatHour(hour: number): string {
  return `${hour.toString().padStart(2, "0")}:00`
}
