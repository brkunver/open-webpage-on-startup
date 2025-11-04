<script lang="ts">
  import { i18n } from "#i18n"
  import { webpageStorage } from "@/utils/storage"
  import Select from "@/components/select.svelte"

  let selected = $state({ label: "Everytime", value: "everytime" })
  const options = [
    {
      label: "Everytime",
      value: "everytime",
    },
    {
      label: "Daily Once",
      value: "daily_once",
    },
    {
      label: "Passive",
      value: "passive",
    },
  ]

  // Form state
  let url = $state<string>("")
  let name = $state<string>("")
  let enableDailyRange = $state<boolean>(false)
  let dailyRange = $state({
    start: 9, // Default start time: 09:00
    end: 17, // Default end time: 17:00
  })

  const t = i18n.t

  // Format hour to HH:00 format
  function formatHour(hour: number): string {
    return hour.toString().padStart(2, "0") + ":00"
  }

  // Add new webpage to storage
  async function addNewWebpage() {
    console.log("addNewWebpage")
    let newPage: Webpage = {
      name: name,
      url: url,
      repeat: selected.value as "everytime" | "daily_once" | "passive",
      lastOpened: 0,
    }

    if (enableDailyRange) {
      newPage.dailyRange = {
        before: dailyRange.start,
        after: dailyRange.end,
      }
    }

    const webpages = await webpageStorage.getValue()
    webpages.push(newPage)
    await webpageStorage.setValue(webpages)

    // Reset form
    name = ""
    url = ""
    enableDailyRange = false
    dailyRange = { start: 9, end: 17 }
  }
</script>

<div class="flex flex-col gap-3 p-4 max-w-md mx-auto">
  <h1 class="text-xl font-bold mb-2">{t("addNewWebpage")}</h1>

  <div class="mb-3">
    <label for="website-name" class="block text-sm font-medium mb-1">Name</label>
    <input
      id="website-name"
      type="text"
      placeholder="Website name"
      bind:value={name}
      class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  </div>

  <div class="mb-3">
    <label for="website-url" class="block text-sm font-medium mb-1">URL</label>
    <input
      id="website-url"
      type="url"
      placeholder="https://example.com"
      bind:value={url}
      class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  </div>

  <div class="mb-3">
    <label for="open-mode" class="block text-sm font-medium mb-1">Open Mode</label>
    <div id="open-mode">
      <Select {options} bind:value={selected} placeholder="Select an option" />
    </div>
  </div>

  <div class="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
    <div class="flex items-center mb-3">
      <input
        id="enable-daily-range"
        type="checkbox"
        class="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
        bind:checked={enableDailyRange}
      />
      <label for="enable-daily-range" class="ml-2 block text-sm font-medium text-gray-700 cursor-pointer">
        Enable daily time range
      </label>
    </div>

    {#if enableDailyRange}
      <div class="grid grid-cols-2 gap-4 mt-2">
        <div>
          <label for="start-time" class="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
          <div class="relative">
            <input
              id="start-time"
              type="range"
              min="0"
              max="23"
              bind:value={dailyRange.start}
              class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:hover:bg-blue-600 [&::-webkit-slider-thumb]:focus:ring-2 [&::-webkit-slider-thumb]:focus:ring-blue-500 [&::-webkit-slider-thumb]:focus:ring-offset-2"
            />
          </div>
          <div class="mt-1 text-center font-mono text-sm bg-gray-100 py-1 rounded">
            {formatHour(dailyRange.start)}
          </div>
        </div>
        <div>
          <label for="end-time" class="block text-sm font-medium text-gray-700 mb-1">End Time</label>
          <div class="relative">
            <input
              id="end-time"
              type="range"
              min="0"
              max="23"
              bind:value={dailyRange.end}
              class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:hover:bg-blue-600 [&::-webkit-slider-thumb]:focus:ring-2 [&::-webkit-slider-thumb]:focus:ring-blue-500 [&::-webkit-slider-thumb]:focus:ring-offset-2"
            />
          </div>
          <div class="mt-1 text-center font-mono text-sm bg-gray-100 py-1 rounded">
            {formatHour(dailyRange.end)}
          </div>
        </div>
      </div>
      <div class="mt-3 text-sm text-gray-600 bg-blue-50 p-2 rounded-md">
        Page will only open between <span class="font-medium">{formatHour(dailyRange.start)}</span> and
        <span class="font-medium">{formatHour(dailyRange.end)}</span>
      </div>
    {/if}
  </div>

  <button
    class="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
    onclick={addNewWebpage}
    disabled={!name || !url}
  >
    {t("addNewWebpage")}
  </button>
</div>
