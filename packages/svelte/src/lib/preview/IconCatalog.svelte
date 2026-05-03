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
    selectedColor = $bindable(),
    selectedScale,
    gridEl = $bindable(),
    totalRows,
    rowHeight,
    padding,
    columnsPerRow,
    itemsTop,
    itemSize,
    onScroll,
    onSelectScale,
    onSelectIcon,
  }: {
    keyword: string;
    leftFilteredCount: number;
    filtered: IconEntry[];
    visibleIcons: IconEntry[];
    selectedIcon: IconEntry | null;
    selectedSize: number;
    selectedStyle: IconStyle;
    selectedColor: string;
    selectedScale: number;
    gridEl: HTMLDivElement | null;
    totalRows: number;
    rowHeight: number;
    padding: number;
    columnsPerRow: number;
    itemsTop: number;
    itemSize: number;
    onScroll: () => void;
    onSelectScale: (scale: number) => void;
    onSelectIcon: (icon: IconEntry) => void;
  } = $props();

  const scales = [1, 2, 3];
  const iconItemBase =
    'grid w-full cursor-pointer place-items-center overflow-hidden rounded-md border border-teal-900/15 bg-white/70 p-0 text-slate-800 transition-[transform,border-color,background,box-shadow] duration-150 ease-out dark:border-teal-300/15 dark:bg-zinc-900/70 dark:text-zinc-100';
  const iconItemActive =
    '-translate-y-px !border-teal-600 bg-white shadow-md ring-2 ring-teal-600/30 dark:!border-teal-400 dark:bg-zinc-950 dark:ring-teal-400/30';
  const iconItemIdle =
    'hover:-translate-y-px hover:border-teal-600 hover:bg-white hover:shadow-md dark:hover:border-teal-400 dark:hover:bg-zinc-950';

  let iconBorderRadius = $derived(
    selectedScale === 3 ? '14px' : selectedScale === 2 ? '10px' : '6px',
  );

  function iconClass(icon: IconEntry) {
    return `${iconItemBase} ${selectedIcon?.key === icon.key ? iconItemActive : iconItemIdle}`;
  }

  function scaleButtonClass(scale: number) {
    const base =
      'h-8 min-w-8 cursor-pointer rounded-md border px-2 text-[11px] font-extrabold transition-colors';
    const active =
      'border-teal-600 bg-teal-50 text-teal-900 shadow-inner dark:border-teal-400 dark:bg-teal-950/60 dark:text-teal-100';
    const idle =
      'border-teal-900/15 bg-white text-slate-800 hover:border-teal-600 hover:text-teal-800 dark:border-teal-300/15 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:border-teal-400 dark:hover:text-teal-200';

    return `${base} ${selectedScale === scale ? active : idle}`;
  }
</script>

<main class="flex min-h-0 min-w-0 flex-col">
  <div
    class="grid min-h-[52px] grid-cols-[minmax(0,1fr)_256px] items-center gap-2 border-b border-teal-900/15 bg-white px-2.5 py-2 dark:border-teal-300/15 dark:bg-zinc-900/60">
    <label class="block min-w-0">
      <input
        class="h-9 w-full min-w-0 rounded-md border border-teal-900/15 bg-white px-2.5 text-slate-800 shadow-sm outline-none focus:border-teal-600 focus:ring-3 focus:ring-teal-600/20 dark:border-teal-300/15 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-teal-400 dark:focus:ring-teal-400/20"
        type="search"
        bind:value={keyword}
        placeholder={`Searching metadata from ${leftFilteredCount.toLocaleString()} icons...`} />
    </label>
    <div class="flex min-w-0 items-center justify-end gap-2">
      <label
        class="grid size-9 cursor-pointer place-items-center rounded-md border border-teal-900/15 bg-white shadow-sm dark:border-teal-300/15 dark:bg-zinc-950"
        title="Choose icon color">
        <span class="sr-only">Choose icon color</span>
        <input
          class="size-7 cursor-pointer rounded border-0 bg-transparent p-0"
          type="color"
          bind:value={selectedColor}
          aria-label="Choose icon color" />
      </label>
      <div class="grid grid-cols-3 gap-1" aria-label="Icon display scale">
        {#each scales as scale}
          <button
            type="button"
            class={scaleButtonClass(scale)}
            aria-pressed={selectedScale === scale}
            onclick={() => onSelectScale(scale)}>
            {scale}x
          </button>
        {/each}
      </div>
    </div>
  </div>

  <div
    class="relative min-h-0 flex-1 overflow-y-auto p-2.5"
    bind:this={gridEl}
    onscroll={onScroll}>
    {#if filtered.length === 0}
      <div
        class="grid min-h-[220px] place-items-center content-center gap-2 text-center text-slate-500 dark:text-zinc-400">
        <strong class="font-serif text-xl text-slate-800 dark:text-zinc-100"
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
        {#each visibleIcons as icon (icon.key)}
          {@const Comp = icon.value}
          <button
            type="button"
            class={iconClass(icon)}
            style="height: {itemSize}px; border-radius: {iconBorderRadius}; color: {selectedColor}"
            title={icon.description || icon.name}
            onclick={() => onSelectIcon(icon)}>
            <Comp size={selectedSize * selectedScale} style={selectedStyle} />
          </button>
        {/each}
      </div>
    {/if}
  </div>
</main>
