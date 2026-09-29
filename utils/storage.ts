import { storage } from "#imports"
import { migrateToV2, type Webpage } from "./webpage"

// The model itself is browser-agnostic and lives in ./webpage so it stays testable
export * from "./webpage"

export const webpageStorage = storage.defineItem<Webpage[]>("local:webpages", {
  fallback: [],
  version: 2,
  migrations: {
    // Runs when migrating v1 -> v2: give every saved webpage a stable id.
    2: migrateToV2,
  },
})
