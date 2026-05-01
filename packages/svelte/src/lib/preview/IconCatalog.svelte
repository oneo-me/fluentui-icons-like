<script lang="ts">
  import type { IconEntry, IconStyle } from '$lib/index.js';

  let {
    keyword = $bindable(),
    leftFilteredCount,
    filtered,
    visibleIcons,
    selectedIcon,
    selectedSize,
    selectedStyle,
    gridEl = $bindable(),
    totalRows,
    rowHeight,
    padding,
    columnsPerRow,
    itemsTop,
    itemSize,
    onScroll,
    onSelectIcon,
  }: {
    keyword: string;
    leftFilteredCount: number;
    filtered: IconEntry[];
    visibleIcons: IconEntry[];
    selectedIcon: IconEntry | null;
    selectedSize: number;
    selectedStyle: IconStyle;
    gridEl: HTMLDivElement | null;
    totalRows: number;
    rowHeight: number;
    padding: number;
    columnsPerRow: number;
    itemsTop: number;
    itemSize: number;
    onScroll: () => void;
    onSelectIcon: (icon: IconEntry) => void;
  } = $props();

  const iconItemBase =
    'grid w-full cursor-pointer place-items-center overflow-hidden rounded-md border border-[#18211e1a] bg-white/70 p-0 text-[#18211e] transition-[transform,border-color,background,box-shadow] duration-150 ease-out';
  const iconItemActive =
    '!border-[#0f6c61] bg-[#fafffb] shadow-[inset_0_0_0_2px_rgba(15,108,97,0.28),0_4px_12px_rgba(35,55,48,0.10)] -translate-y-px';
  const iconItemIdle =
    'hover:border-[#0f6c61] hover:bg-[#fafffb] hover:shadow-[0_4px_12px_rgba(35,55,48,0.10)] hover:-translate-y-px';

  function iconClass(icon: IconEntry) {
    return `${iconItemBase} ${selectedIcon?.key === icon.key ? iconItemActive : iconItemIdle}`;
  }
</script>

<main class="flex min-h-0 min-w-0 flex-col">
  <div
    class="min-h-[52px] border-b border-[#18211e1a] bg-[#fbfcf7]/60 px-2.5 py-2">
    <label class="block w-full">
      <input
        class="h-9 w-full min-w-0 rounded-md border border-[#d6dcd2] bg-white px-2.5 text-[#18211e] shadow-[0_1px_0_rgba(24,33,30,0.05)] outline-none focus:border-[#0f6c61] focus:shadow-[0_0_0_3px_rgba(15,108,97,0.14)]"
        type="search"
        bind:value={keyword}
        placeholder={`Searching metadata from ${leftFilteredCount.toLocaleString()} icons...`} />
    </label>
  </div>

  <div
    class="relative min-h-0 flex-1 overflow-y-auto p-2.5"
    bind:this={gridEl}
    onscroll={onScroll}>
    {#if filtered.length === 0}
      <div
        class="grid min-h-[220px] place-items-center content-center gap-2 text-center text-[#66706a]">
        <strong class="font-serif text-xl text-[#18211e]"
          >No icons found</strong
        >
        <span>Try another keyword, size, or style.</span>
      </div>
    {:else}
      <div
        class="pointer-events-none"
        style="height: {totalRows * rowHeight + padding * 2}px"></div>
      <div
        class="absolute top-0 right-2.5 left-2.5 grid content-start gap-1.5 will-change-transform"
        style="grid-template-columns: repeat({columnsPerRow}, minmax(0, 1fr)); transform: translateY({itemsTop + padding}px)">
        {#each visibleIcons as icon}
          {#key icon.key}
            {@const Comp = icon.value}
            <button
              type="button"
              class={iconClass(icon)}
              style="height: {itemSize}px"
              title={icon.description || icon.name}
              onclick={() => onSelectIcon(icon)}>
              <Comp size={selectedSize} style={selectedStyle} />
            </button>
          {/key}
        {/each}
      </div>
    {/if}
  </div>
</main>
