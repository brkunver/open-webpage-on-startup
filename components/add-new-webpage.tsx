import { i18n } from "#i18n"
import { webpageStorage } from "@/utils/storage"

export default function AddNewWebpage() {
  const t = i18n.t

  async function addNewWebpage() {
    console.log("addNewWebpage")
    let newPage: Webpage = {
      name: "Test",
      url: "https://google.com",
      repeat: "everytime",
      lastOpened: new Date().toISOString(),
    }

    const webpages = await webpageStorage.getValue()
    webpages.push(newPage)
    await webpageStorage.setValue(webpages)
  }

  return (
    <div class="flex flex-col gap-1 p-1 m-1">
      <h1 class="text-xl font-bold">Add New Webpage</h1>
      <input type="text" placeholder="Name" />
      <input type="text" placeholder="URL" />
      <button class="cursor-pointer bg-blue-800 text-white p-2 rounded w-fit" onclick={addNewWebpage}>
        Add
      </button>
    </div>
  )
}
