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

<div class="flex flex-col gap-1">
  {#each webpages as webpage}
    <Entry {webpage} />
  {/each}
</div>
