import { i18n } from "#i18n"
import WebpageForm from "@/components/webpage-form"

const t = i18n.t

export default function AddNewWebpage() {
  return (
    <section class="card p-5">
      <h2 class="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
        <span class="grid h-6 w-6 place-items-center rounded-md bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
          <svg class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
          </svg>
        </span>
        {t("addNewWebpage")}
      </h2>

      <WebpageForm />
    </section>
  )
}
