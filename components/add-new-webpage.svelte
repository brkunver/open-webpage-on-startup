<script lang="ts">
  import { i18n } from "#i18n"
  import { webpageStorage } from "@/utils/storage"

  let url = $state("")
  let name = $state("")

  const t = i18n.t

  async function addNewWebpage() {
    console.log("addNewWebpage")
    let newPage: Webpage = {
      name: name,
      url: url,
      repeat: "everytime",
      lastOpened: new Date().toISOString(),
    }

    const webpages = await webpageStorage.getValue()
    webpages.push(newPage)
    await webpageStorage.setValue(webpages)
  }
</script>

<div class="flex flex-col gap-1 p-1 m-1">
  <h1 class="text-xl font-bold">{t("addNewWebpage")}</h1>
  <input type="text" placeholder="Name" bind:value={name} />
  <input type="text" placeholder="URL" bind:value={url} />
  <button class="cursor-pointer bg-blue-800 text-white p-2 rounded w-fit" onclick={addNewWebpage}>
    {t("addNewWebpage")}
  </button>
</div>
