<script lang="ts">
  import CopyIcon from '$lib/icons/Copy.svelte';
  import type { IconEntry, IconStyle } from '$lib/index.js';

  let {
    selectedIcon,
    selectedStyle,
    copiedKey,
    onCopySelectedKey,
  }: {
    selectedIcon: IconEntry | null;
    selectedStyle: IconStyle;
    copiedKey: string;
    onCopySelectedKey: () => void;
  } = $props();
</script>

<aside
  class="overflow-y-auto border-l border-[#18211e1f] bg-[#fbfcf7]/75 px-2 py-2.5 max-[1120px]:hidden"
  aria-label="Selected icon details">
  {#if selectedIcon}
    {@const DetailComp = selectedIcon.value}
    <div
      class="mb-2.5 flex min-h-10 items-center border-b border-[#18211e1a] pb-2.5">
      <h2
        class="m-0 overflow-hidden truncate font-serif text-[17px] leading-[1.05] text-[#18211e]">
        {selectedIcon.name}
      </h2>
    </div>

    <div
      class="grid aspect-square w-full place-items-center rounded-lg border border-[#d6dcd2] bg-[linear-gradient(90deg,rgba(15,108,97,0.08)_1px,transparent_1px),linear-gradient(rgba(15,108,97,0.08)_1px,transparent_1px)] bg-white text-[#123f38] [background-position:4px_4px] [background-size:16px_16px]">
      <DetailComp
        class="bg-[#d6dcd24a]"
        size={120}
        style={selectedStyle}
        title={selectedIcon.name} />
    </div>

    <dl class="m-0 grid">
      <div
        class="grid grid-cols-[64px_minmax(0,1fr)] items-center gap-2 border-b border-[#18211e1a] py-2">
        <dt class="text-[11px] font-extrabold text-[#66706a]">Key</dt>
        <dd
          class="m-0 flex min-w-0 items-center justify-between gap-2 text-xs leading-7 text-[#18211e]">
          <span class="min-w-0 [overflow-wrap:anywhere]"
            >{selectedIcon.key}</span
          >
          <button
            type="button"
            class="inline-flex size-7 flex-none cursor-pointer items-center justify-center rounded-md border border-transparent bg-transparent p-0 text-[11px] font-extrabold text-[#18211e] hover:border-[#0f6c61] hover:text-[#073b35]"
            aria-label="Copy key"
            title={copiedKey === selectedIcon.key ? "Copied" : "Copy key"}
            onclick={onCopySelectedKey}>
            <CopyIcon size={16} style={selectedStyle} title={null} />
          </button>
        </dd>
      </div>
      <div
        class="grid grid-cols-[64px_minmax(0,1fr)] items-center gap-2 border-b border-[#18211e1a] py-2">
        <dt class="text-[11px] font-extrabold text-[#66706a]">Keyword</dt>
        <dd
          class="m-0 min-w-0 text-xs leading-[1.45] break-words text-[#18211e]">
          {selectedIcon.keyword}
        </dd>
      </div>
      <div
        class="grid grid-cols-[64px_minmax(0,1fr)] items-center gap-2 border-b border-[#18211e1a] py-2">
        <dt class="text-[11px] font-extrabold text-[#66706a]">Description</dt>
        <dd
          class="m-0 min-w-0 text-xs leading-[1.45] break-words text-[#18211e]">
          {selectedIcon.description || "No description"}
        </dd>
      </div>
    </dl>

    <div class="mt-3 grid gap-1.5">
      <span
        class="text-[11px] font-extrabold tracking-[0.08em] text-[#66706a] uppercase">
        Styles
      </span>
      <div class="flex min-w-0 flex-wrap gap-1">
        {#each selectedIcon.styles as style}
          <span
            class="max-w-full overflow-hidden rounded-full bg-[#e8f0ee] px-2 py-0.5 text-[10px] text-ellipsis whitespace-nowrap text-[#31504b]">
            {style}
          </span>
        {/each}
      </div>
    </div>

    <div class="mt-3 grid gap-1.5">
      <span
        class="text-[11px] font-extrabold tracking-[0.08em] text-[#66706a] uppercase">
        Sizes
      </span>
      <div class="flex min-w-0 flex-wrap gap-1">
        {#each selectedIcon.sizes as size}
          <span
            class="max-w-full overflow-hidden rounded-full bg-[#e8f0ee] px-2 py-0.5 text-[10px] text-ellipsis whitespace-nowrap text-[#31504b]">
            {size}px
          </span>
        {/each}
      </div>
    </div>

    <div class="mt-3 grid gap-1.5">
      <span
        class="text-[11px] font-extrabold tracking-[0.08em] text-[#66706a] uppercase">
        Metaphors
      </span>
      <div class="flex min-w-0 flex-wrap gap-1">
        {#each selectedIcon.metaphor as tag}
          <span
            class="max-w-full overflow-hidden rounded-full bg-[#e8f0ee] px-2 py-0.5 text-[10px] text-ellipsis whitespace-nowrap text-[#31504b]">
            {tag}
          </span>
        {/each}
      </div>
    </div>

    {#if selectedIcon.directionType}
      <div class="mt-3 grid gap-1.5">
        <span
          class="text-[11px] font-extrabold tracking-[0.08em] text-[#66706a] uppercase">
          Direction
        </span>
        <div class="flex min-w-0 flex-wrap gap-1">
          <span
            class="max-w-full overflow-hidden rounded-full bg-[#e8f0ee] px-2 py-0.5 text-[10px] text-ellipsis whitespace-nowrap text-[#31504b]">
            {selectedIcon.directionType}
          </span>
          {#if selectedIcon.singleton}
            <span
              class="max-w-full overflow-hidden rounded-full bg-[#e8f0ee] px-2 py-0.5 text-[10px] text-ellipsis whitespace-nowrap text-[#31504b]">
              {selectedIcon.singleton}
            </span>
          {/if}
        </div>
      </div>
    {/if}
  {:else}
    <div
      class="grid min-h-[220px] place-items-center content-center gap-2 text-center text-[#66706a]">
      <strong class="font-serif text-xl text-[#18211e]">Select an icon</strong>
      <span>Details appear here.</span>
    </div>
  {/if}
</aside>
