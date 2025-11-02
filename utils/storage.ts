import { storage } from "#imports"

export type Webpage = {
  name: string
  url: string
  logo?: string
  repeat: "everytime" | "daily_once" | "passive"
  dailyRange?: { before: string; after: string }
  lastOpened: string
}

export const webpageStorage = storage.defineItem<Webpage[]>("local:webpages", {
  fallback: [],
})
