<script lang="ts">
  import { i18n } from "#i18n"

  const t = i18n.t

  let {
    options = [],
    value = $bindable(""),
    placeholder = t("selectPlaceholder"),
    class: className = "",
  }: {
    options?: { label: string; value: string }[]
    value?: string
    placeholder?: string
    class?: string
  } = $props()

  let isOpen = $state(false)
  let container = $state<HTMLElement | null>(null)

  const selected = $derived(options.find(option => option.value === value))
  const selectedLabel = $derived(selected?.label ?? placeholder)

  function selectOption(option: { label: string; value: string }) {
    value = option.value
    isOpen = false
  }

  function handleWindowClick(event: MouseEvent) {
    if (!isOpen) return
    if (container && event.target instanceof Node && container.contains(event.target)) return
    isOpen = false
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") isOpen = false
  }
</script>

<svelte:window onclick={handleWindowClick} onkeydown={handleKeydown} />

<div class="relative w-full {className}" bind:this={container}>
  <button
    type="button"
    onclick={() => (isOpen = !isOpen)}
    aria-haspopup="listbox"
    aria-expanded={isOpen}
    class="flex h-9.5 w-full items-center justify-between gap-2 rounded-lg border border-slate-300 bg-white px-3 text-left text-sm transition-colors hover:border-slate-400 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:outline-none dark:border-slate-700 dark:bg-slate-950 dark:hover:border-slate-600"
  >
    <span class="truncate {selected ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'}">
      {selectedLabel}
    </span>
    <svg
      class="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 {isOpen ? 'rotate-180' : ''}"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      viewBox="0 0 24 24"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  </button>

  {#if isOpen}
    <div
      role="listbox"
      class="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-900"
    >
      {#each options as option (option.value)}
        <button
          type="button"
          role="option"
          aria-selected={value === option.value}
          onclick={() => selectOption(option)}
          class="flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors
                 {value === option.value
            ? 'bg-blue-50 font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-300'
            : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'}"
        >
          <span class="truncate">{option.label}</span>
          {#if value === option.value}
            <svg class="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 011.4-1.4L8 12.6l7.3-7.3a1 1 0 011.4 0z"
                clip-rule="evenodd"
              />
            </svg>
          {/if}
        </button>
      {/each}
    </div>
  {/if}
</div>
