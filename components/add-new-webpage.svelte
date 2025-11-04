<script lang="ts">
  import { i18n } from "#i18n"
  import { webpageStorage } from "@/utils/storage"
  import Select from "@/components/select.svelte"
  import { fade } from "svelte/transition"

  const t = i18n.t

  let selected = $state({ label: t("repeatModeEverytime"), value: "everytime" })
  const options = $derived([
    {
      label: t("repeatModeEverytime"),
      value: "everytime",
    },
    {
      label: t("repeatModeDailyOnce"),
      value: "daily_once",
    },
    {
      label: t("repeatModePassive"),
      value: "passive",
    },
  ])

  // Form state
  let url = $state<string>("")
  let name = $state<string>("")
  let enableDailyRange = $state<boolean>(false)
  let dailyRange = $state({
    start: 9, // Default start time: 09:00
    end: 17, // Default end time: 17:00
  })

  // Format hour to HH:00 format
  function formatHour(hour: number): string {
    return hour.toString().padStart(2, "0") + ":00"
  }

  // Add new webpage to storage
  async function addNewWebpage() {
    console.log("addNewWebpage")
    const lowerCaseUrl = url.toLowerCase()
    if (!lowerCaseUrl.startsWith("http://") && !lowerCaseUrl.startsWith("https://")) {
      url = "https://" + url
    }
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
    <label for="website-name" class="block text-sm font-medium mb-1">{t("nameLabel")}</label>
    <input
      id="website-name"
      type="text"
      placeholder={t("websiteNamePlaceholder")}
      bind:value={name}
      class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  </div>

  <div class="mb-3">
    <label for="website-url" class="block text-sm font-medium mb-1">{t("urlLabel")}</label>
    <input
      id="website-url"
      type="url"
      placeholder="https://example.com"
      bind:value={url}
      class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  </div>

  <div class="mb-3">
    <label for="open-mode" class="block text-sm font-medium mb-1">{t("openModeLabel")}</label>
    <div id="open-mode">
      <Select {options} bind:value={selected} placeholder={t("selectPlaceholder")} />
    </div>
  </div>

  <div
    class="mb-6 p-5 bg-white border border-gray-200 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md w-full"
  >
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center">
        <div class="w-8 h-5 flex items-center justify-center mr-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <label for="enable-daily-range" class="block text-sm font-medium text-gray-700 cursor-pointer">
          {t("dailyTimeRangeLabel")}
        </label>
      </div>
      <label class="relative inline-flex items-center cursor-pointer">
        <input id="enable-daily-range" type="checkbox" class="sr-only peer" bind:checked={enableDailyRange} />
        <div
          class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
        ></div>
      </label>
    </div>

    {#if enableDailyRange}
      <div class="space-y-4" transition:fade={{ duration: 200 }}>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label for="start-time" class="block text-sm font-medium text-gray-700">{t("startTimeLabel")} </label>
              <div
                class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {formatHour(dailyRange.start)}
              </div>
            </div>
            <div class="relative">
              <input
                id="start-time"
                type="range"
                min="0"
                max="23"
                bind:value={dailyRange.start}
                oninput={e => {
                  const target = e.target as HTMLInputElement
                  dailyRange.start = parseInt(target.value)
                }}
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-600 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:hover:bg-blue-50 [&::-webkit-slider-thumb]:active:bg-blue-100 [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-200"
              />
              <div class="flex justify-between text-xs text-gray-500 mt-1">
                {#each Array(5).fill(0) as _, i}
                  <span>{i * 6}:00</span>
                {/each}
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label for="end-time" class="block text-sm font-medium text-gray-700"> {t("endTimeLabel")} </label>
              <div
                class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {formatHour(dailyRange.end)}
              </div>
            </div>
            <div class="relative">
              <input
                id="end-time"
                type="range"
                min="0"
                max="23"
                bind:value={dailyRange.end}
                oninput={e => {
                  const target = e.target as HTMLInputElement
                  dailyRange.end = parseInt(target.value)
                }}
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-600 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:hover:bg-blue-50 [&::-webkit-slider-thumb]:active:bg-blue-100 [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-200"
              />
              <div class="flex justify-between text-xs text-gray-500 mt-1">
                {#each Array(5).fill(0) as _, i}
                  <span>{i * 6}:00</span>
                {/each}
              </div>
            </div>
          </div>
        </div>

        <div
          class="p-3 border rounded-lg flex items-start transition-colors duration-200 bg-blue-50/70 border-blue-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 mr-2 mt-0.5 shrink-0 text-blue-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clip-rule="evenodd"
            />
          </svg>
          <div>
            <p class="text-sm font-medium text-gray-800">{t("pageAvailability")}</p>
            <p class="text-sm text-gray-600">
              {t("pageWillBeAvailableBetween")}
              <span class="font-semibold text-blue-700">{formatHour(dailyRange.start)}</span>
              {t("and")}
              <span class="font-semibold text-blue-700">{formatHour(dailyRange.end)}</span>
            </p>
          </div>
        </div>
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
