<script lang="ts">
  import { onMount } from "svelte"
  import type { Webpage } from "@/utils/storage"
  import { webpageStorage } from "@/utils/storage"
  import Entry from "./entry.svelte"

  let webpages: Webpage[] = []
  webpageStorage.watch(value => {
    webpages = value
  })

  onMount(async () => {
    webpages = await webpageStorage.getValue()
  })
</script>

<div class="flex flex-col w-full max-w-[700px] mx-auto gap-2">
  <h2 class="text-2xl text-center font-bold">Saved Webpages</h2>
  {#each webpages as webpage}
    <Entry {webpage} />
  {/each}
</div>
