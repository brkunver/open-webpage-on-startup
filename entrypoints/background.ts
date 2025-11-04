import { webpageStorage } from "@/utils/storage"

export default defineBackground(() => {
  browser.runtime.onStartup.addListener(async () => {
    const now = new Date()
    const sites = await webpageStorage.getValue()
    const toOpen: Webpage[] = []

    // testing opening tabs
    // await browser.tabs.create({ url: "https://wxt.dev" })

    for (const site of sites) {
      if (checkCondition(site, now)) {
        toOpen.push(site)
      }
    }

    // Open tabs
    for (const site of toOpen) {
      await browser.tabs.create({ url: site.url })
      // Update lastOpened
      site.lastOpened = now.getTime()
    }

    // Update Storage
    await webpageStorage.setValue(sites)
    console.log(`Startup tabs: ${toOpen.length} tabs opened.`)
  })
})
