import { storage } from "#imports"

export type Webpage = {
  name: string
  url: string
  logo?: string
  repeat: "everytime" | "daily_once" | "passive"
  dailyRange?: { before: number; after: number }
  lastOpened?: number
}

export const webpageStorage = storage.defineItem<Webpage[]>("local:webpages", {
  fallback: [],
  version: 1,
  migrations: {
    1: oldValue => {
      return oldValue
    },
  },
})

export function checkCondition(site: Webpage, now: Date): boolean {
  const hour = now.getHours()

  if (site.dailyRange) {
    if (site.dailyRange.before <= site.dailyRange.after) {
      if (hour < site.dailyRange.before || hour >= site.dailyRange.after) {
        return false
      }
    } else {
      if (hour < site.dailyRange.before && hour >= site.dailyRange.after) {
        return false
      }
    }
  }

  const last = site.lastOpened || 0
  const lastDate = new Date(last)

  switch (site.repeat) {
    case "daily_once":
      return lastDate.toDateString() !== now.toDateString()

    case "passive":
      return false

    case "everytime":
      return true

    default:
      return false
  }
}
