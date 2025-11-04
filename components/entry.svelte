<script lang="ts">
  import type { Webpage } from "@/utils/storage"
  import { webpageStorage } from "@/utils/storage"
  import { fade } from "svelte/transition"

  export let webpage: Webpage

  const repeatStates: Webpage["repeat"][] = ["everytime", "daily_once", "passive"]

  const repeatStyles: Record<
    Webpage["repeat"],
    { label: string; color: string; hoverColor: string; icon: string }
  > = {
    everytime: {
      label: "Every Time",
      color: "bg-green-100 text-green-800",
      hoverColor: "hover:bg-green-200",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`, // Clock icon
    },
    daily_once: {
      label: "Once a Day",
      color: "bg-blue-100 text-blue-800",
      hoverColor: "hover:bg-blue-200",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>`, // Sun icon
    },
    passive: {
      label: "Passive",
      color: "bg-gray-100 text-gray-700",
      hoverColor: "hover:bg-gray-200",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`, // Pause icon
    },
  }

  async function cycleRepeatStatus() {
    const currentIndex = repeatStates.indexOf(webpage.repeat)
    const nextIndex = (currentIndex + 1) % repeatStates.length
    const nextState = repeatStates[nextIndex]

    const webpages = await webpageStorage.getValue()
    const index = webpages.findIndex(p => p.url === webpage.url)
    if (index !== -1) {
      webpages[index].repeat = nextState
      await webpageStorage.setValue(webpages)
    }
  }

  async function deleteWebpage() {
    const webpages = await webpageStorage.getValue()
    const newWebpages = webpages.filter(p => p.url !== webpage.url)
    await webpageStorage.setValue(newWebpages)
  }

  function formatLastOpened(timestamp: number | undefined): string {
    if (!timestamp || timestamp === 0) {
      return "Never"
    }
    return new Date(timestamp).toLocaleString()
  }
</script>

<div
  class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-4 flex items-center gap-4"
  transition:fade
>
  <div class="flex-shrink-0">
    {#if webpage.logo}
      <img src={webpage.logo} alt="{webpage.name} logo" class="w-10 h-10 rounded-full object-cover" />
    {:else}
      <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-lg">
        {webpage.name.charAt(0).toUpperCase()}
      </div>
    {/if}
  </div>

  <div class="flex-grow overflow-hidden">
    <p class="text-lg font-semibold text-gray-800 truncate" title={webpage.name}>{webpage.name}</p>
    <a
      href={webpage.url}
      target="_blank"
      rel="noopener noreferrer"
      class="text-sm text-blue-600 hover:underline truncate block"
      title={webpage.url}
    >
      {webpage.url}
    </a>
    <p class="text-xs text-gray-500 mt-1">
      Last opened: {formatLastOpened(webpage.lastOpened)}
    </p>
  </div>

  <div class="flex-shrink-0 flex items-center gap-2">
    <button
      class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer {repeatStyles[
        webpage.repeat
      ].color} {repeatStyles[webpage.repeat].hoverColor}"
      onclick={cycleRepeatStatus}
      title="Click to change repeat mode"
    >
      {@html repeatStyles[webpage.repeat].icon}
      <span>{repeatStyles[webpage.repeat].label}</span>
    </button>

    <button
      class="p-2 rounded-full text-gray-400 hover:bg-red-100 hover:text-red-600 transition-colors cursor-pointer"
      onclick={deleteWebpage}
      title="Delete webpage"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        />
      </svg>
    </button>
  </div>
</div>
