import { storage } from "#imports"

export type Webpage = {
  name: string
  url: string
  logo?: string
  repeat: "everytime" | "daily_once" | "passive"
  dailyRange?: { before: number; after: number }
  lastOpened: string
}

export const webpageStorage = storage.defineItem<Webpage[]>("local:webpages", {
  fallback: [],
})

export function checkCondition(site: Webpage, now: Date): boolean {
  const hour = now.getHours()
  if (site.dailyRange && (hour < site.dailyRange.before || hour > site.dailyRange.after)) return false

  const last = site.lastOpened || 0
  switch (site.repeat) {
    case "daily_once":
      return new Date(last).toDateString() === now.toDateString()
    case "passive":
      return last === 0
    case "everytime":
      return true
    default:
      return false
  }
}
