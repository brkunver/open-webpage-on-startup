<script lang="ts">
  import type { Webpage } from "@/utils/storage"
  import { webpageStorage } from "@/utils/storage"

  export let webpage: Webpage

  async function deleteWebpage() {
    const webpages = await webpageStorage.getValue()
    const newWebpages = webpages.filter(p => p.url !== webpage.url)
    await webpageStorage.setValue(newWebpages)
  }
</script>

<div class="flex flex-col gap-1 p-1 m-1">
  <p>{webpage.name}</p>
  <p>{webpage.url}</p>
  <p>{webpage.repeat}</p>
  <p>{webpage.lastOpened}</p>
  <button class="cursor-pointer bg-red-800 text-white p-2 rounded w-fit" on:click={deleteWebpage}>
    Delete
  </button>
</div>
