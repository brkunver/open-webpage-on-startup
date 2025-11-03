import type { Webpage } from "@/utils/storage"
import { webpageStorage } from "@/utils/storage"

export default function Entry({ webpage }: { webpage: Webpage }) {
  async function deleteWebpage() {
    const webpages = await webpageStorage.getValue()
    const newWebpages = webpages.filter(webpage => webpage.url !== webpage.url)
    await webpageStorage.setValue(newWebpages)
  }

  return (
    <div class="flex flex-col gap-1 p-1 m-1">
      <p>{webpage.name}</p>
      <p>{webpage.url}</p>
      <p>{webpage.repeat}</p>
      <p>{webpage.lastOpened}</p>
      <button class="cursor-pointer bg-red-800 text-white p-2 rounded w-fit" onclick={deleteWebpage}>
        Delete
      </button>
    </div>
  )
}
