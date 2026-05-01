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
    'grid w-full cursor-pointer place-items-center overflow-hidden rounded-md border border-slate-900/10 bg-white/70 p-0 text-slate-950 transition-[transform,border-color,background,box-shadow] duration-150 ease-out dark:border-zinc-100/10 dark:bg-zinc-900/70 dark:text-zinc-100';
  const iconItemActive =
    '-translate-y-px !border-teal-700 bg-white shadow-md ring-2 ring-teal-700/30 dark:!border-teal-400 dark:bg-zinc-950 dark:ring-teal-400/30';
  const iconItemIdle =
    'hover:-translate-y-px hover:border-teal-700 hover:bg-white hover:shadow-md dark:hover:border-teal-400 dark:hover:bg-zinc-950';

  function iconClass(icon: IconEntry) {
    return `${iconItemBase} ${selectedIcon?.key === icon.key ? iconItemActive : iconItemIdle}`;
  }
</script>

<main class="flex min-h-0 min-w-0 flex-col">
  <div
    class="min-h-[52px] border-b border-slate-900/10 bg-stone-50/60 px-2.5 py-2 dark:border-zinc-100/10 dark:bg-zinc-900/60">
    <label class="block w-full">
      <input
        class="h-9 w-full min-w-0 rounded-md border border-stone-300 bg-white px-2.5 text-slate-950 shadow-sm outline-none focus:border-teal-700 focus:ring-3 focus:ring-teal-700/15 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-teal-400 dark:focus:ring-teal-400/20"
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
        class="grid min-h-[220px] place-items-center content-center gap-2 text-center text-slate-500 dark:text-zinc-400">
        <strong class="font-serif text-xl text-slate-950 dark:text-zinc-100"
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
