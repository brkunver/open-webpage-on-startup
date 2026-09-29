/**
 * Bootstraps the extension environment for `bun test`.
 *
 * While bundling, WXT resolves the `#imports` virtual module and provides the
 * extension globals. There is no bundler while testing, so this module wires
 * both up by hand:
 *
 * - `browser` is the in-memory implementation from `wxt/testing`, which ships
 *   with WXT and needs no extra dependency.
 * - `storage` is the real `wxt/storage` implementation, so the tests exercise
 *   the same versioning and migration code the extension runs in production.
 *
 * Import this module before any module that touches storage.
 */
import { mock } from "bun:test"
import { fakeBrowser } from "wxt/testing/fake-browser"

// `@wxt-dev/browser` captures `globalThis.browser` when `wxt/storage` loads, so
// the fake has to be in place before the imports below.
Object.assign(globalThis, { browser: fakeBrowser })

const { storage } = await import("wxt/utils/storage")
const { defineBackground } = await import("wxt/utils/define-background")

Object.assign(globalThis, { defineBackground })

mock.module("#imports", () => ({ browser: fakeBrowser, storage }))

export { fakeBrowser }
