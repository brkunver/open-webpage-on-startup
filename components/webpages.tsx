import { createSignal, onMount, For } from "solid-js"

import type { Webpage } from "@/utils/storage"
import { webpageStorage } from "@/utils/storage"
import Entry from "./entry"

export default function Webpages() {
  const [webpages, setWebpages] = createSignal<Webpage[]>([])

  webpageStorage.watch(value => {
    setWebpages(value)
  })

  onMount(async () => {
    const webpages = await webpageStorage.getValue()
    setWebpages(webpages)
  })


  return (
    <div class="flex flex-col gap-1">
      <For each={webpages()}>
        {(webpage) => <Entry webpage={webpage} />}
      </For>
    </div>
  )
}
