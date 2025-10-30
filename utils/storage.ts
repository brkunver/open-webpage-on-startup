import { storage } from "#imports"

type Webpage = {
  name: string
  url: string
  repeat: "everyday" | "never" | "daily"
  lastOpened: Date
}

export const webpageStorage = storage.defineItem<Webpage[]>("local:webpages", {
  fallback: [],
})
