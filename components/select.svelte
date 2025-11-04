<script lang="ts">
  import { i18n } from "#i18n"
  const t = i18n.t
  let { options = [], value = $bindable(), placeholder = t("selectPlaceholder"), class: className = "" } = $props()

  let isOpen = $state(false)

  function selectOption(option: { label: string; value: string }) {
    value = option
    isOpen = false
  }

  function toggleDropdown() {
    isOpen = !isOpen
  }

  const selectedLabel = $derived(value?.label || placeholder)
</script>

<div class="relative w-64 {className}">
  <button
    type="button"
    onclick={toggleDropdown}
    class="w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-lg
           hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500
           flex justify-between items-center"
  >
    <span class={value?.value ? "text-gray-900" : "text-gray-500"}>
      {selectedLabel}
    </span>
    <svg
      class="w-5 h-5 transition-transform {isOpen ? 'rotate-180' : ''}"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
    </svg>
  </button>

  {#if isOpen}
    <div class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
      {#each options as option}
        <button
          type="button"
          onclick={() => selectOption(option)}
          class="w-full px-4 py-2 text-left hover:bg-gray-100
                 {value?.value === option.value ? 'bg-blue-50 text-blue-600' : 'text-gray-900'}"
        >
          {option.label}
        </button>
      {/each}
    </div>
  {/if}
</div>
