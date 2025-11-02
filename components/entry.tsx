import { Webpage } from "@/utils/storage"

export default function Entry({ webpage }: { webpage: Webpage }) {
  return (
    <div class="flex flex-col gap-1 p-1 m-1">
      <p>{webpage.name}</p>
      <p>{webpage.url}</p>
      <p>{webpage.repeat}</p>
      <p>{webpage.lastOpened}</p>
    </div>
  )
}
