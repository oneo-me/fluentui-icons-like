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
    effectiveSelectedColor,
    colorPickerValue,
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
    effectiveSelectedColor: string;
    colorPickerValue: string;
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
    'grid w-full cursor-pointer place-items-center overflow-hidden rounded-md border border-border bg-card/76 p-0 text-foreground shadow-xs transition-[transform,border-color,background,box-shadow,color] duration-150 ease-out';
  const iconItemActive =
    '-translate-y-px !border-primary/55 bg-background shadow-lg ring-2 ring-ring/24';
  const iconItemIdle =
    'hover:-translate-y-px hover:border-primary/40 hover:bg-background hover:shadow-md';

  let iconBorderRadius = $derived(
    selectedScale === 3 ? '14px' : selectedScale === 2 ? '10px' : '6px',
  );

  function iconClass(icon: IconEntry) {
    return `${iconItemBase} ${selectedIcon?.key === icon.key ? iconItemActive : iconItemIdle}`;
  }

  function scaleButtonClass(scale: number) {
    const base =
      'h-8 min-w-8 cursor-pointer rounded-md border px-2 text-[11px] font-extrabold transition-[border-color,background-color,color,box-shadow]';
    const active =
      'border-primary/55 bg-primary/12 text-primary shadow-[inset_0_1px_0_color-mix(in_oklab,var(--color-primary)_18%,transparent)]';
    const idle =
      'border-border bg-card text-foreground hover:border-primary/40 hover:bg-accent hover:text-accent-foreground';

    return `${base} ${selectedScale === scale ? active : idle}`;
  }
</script>

<main class="flex min-h-0 min-w-0 flex-col">
  <div
    class="grid min-h-[52px] grid-cols-[minmax(0,1fr)_256px] items-center gap-2 border-b border-border bg-card/88 px-2.5 py-2 backdrop-blur-sm">
    <label class="block min-w-0">
      <input
        class="h-9 w-full min-w-0 rounded-md border border-input bg-background px-2.5 text-foreground shadow-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"
        type="search"
        bind:value={keyword}
        placeholder={`Searching metadata from ${leftFilteredCount.toLocaleString()} icons...`} />
    </label>
    <div class="flex min-w-0 items-center justify-end gap-2">
      <label
        class="grid size-9 cursor-pointer place-items-center rounded-md border border-input bg-background shadow-sm"
        title="Choose icon color">
        <span class="sr-only">Choose icon color</span>
        <input
          class="size-7 cursor-pointer rounded border-0 bg-transparent p-0"
          type="color"
          value={colorPickerValue}
          oninput={(event) => (selectedColor = event.currentTarget.value)}
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
        class="grid min-h-[220px] place-items-center content-center gap-2 text-center text-muted-foreground">
        <strong class="font-serif text-xl text-foreground"
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
            style="height: {itemSize}px; border-radius: {iconBorderRadius}; color: {effectiveSelectedColor}"
            title={icon.description || icon.name}
            onclick={() => onSelectIcon(icon)}>
            <Comp size={selectedSize * selectedScale} style={selectedStyle} />
          </button>
        {/each}
      </div>
    {/if}
  </div>
</main>
