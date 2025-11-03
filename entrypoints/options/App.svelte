<script lang="ts">
  import Webpages from "@/components/webpages.svelte"
  import AddNewWebpage from "@/components/add-new-webpage.svelte"
  import { i18n } from "#i18n"

  const t = i18n.t
</script>

<div class="flex flex-col min-w-[400px] min-h-[200px]">
  <h1 class="text-2xl text-center font-bold">{t("extensionName")}</h1>
  <AddNewWebpage />
  <Webpages />
</div>
