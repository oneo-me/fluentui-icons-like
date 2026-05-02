<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { type IconEntry, type IconStyle, registry } from '$lib/index.js';
  import FilterSidebar from '$lib/preview/FilterSidebar.svelte';
  import IconCatalog from '$lib/preview/IconCatalog.svelte';
  import IconDetails from '$lib/preview/IconDetails.svelte';

  const GAP = 6;
  const PADDING = 10;
  const MIN_OVERSCAN_ROWS = 8;
  const MAX_OVERSCAN_ROWS = 24;

  const VALID_STYLES = new Set<IconStyle>(['Filled', 'Light', 'Regular']);

  function readParams(url: URL): {
    keyword: string;
    size: number;
    style: IconStyle;
    metaphor: string;
    iconKey: string;
  } {
    const p = url.searchParams;
    const style = p.get('style') ?? '';
    return {
      keyword: p.get('q') ?? '',
      size: Number(p.get('size')) || 20,
      style: VALID_STYLES.has(style as IconStyle)
        ? (style as IconStyle)
        : 'Regular',
      metaphor: p.get('metaphor') ?? '',
      iconKey: p.get('icon') ?? '',
    };
  }

  function buildParams(): URLSearchParams {
    const p = new URLSearchParams();
    if (keyword) p.set('q', keyword);
    if (selectedSize !== 20) p.set('size', String(selectedSize));
    if (selectedStyle !== 'Regular') p.set('style', selectedStyle);
    if (selectedMetaphor) p.set('metaphor', selectedMetaphor);
    if (selectedIcon) p.set('icon', selectedIcon.key);
    return p;
  }

  let source = $state<IconEntry[]>([]);
  let keyword = $state('');
  let selectedSize = $state(20);
  let selectedStyle = $state<IconStyle>('Regular');
  let selectedMetaphor = $state('');
  let metaphorKeyword = $state('');
  let selectedIcon = $state<IconEntry | null>(null);

  let gridEl = $state<HTMLDivElement | null>(null);
  let containerWidth = $state(900);
  let containerHeight = $state(620);
  let scrollRow = $state(0);

  let urlSyncReady = $state(false);

  let allSizes = $derived(
    Array.from(new Set(source.flatMap((icon) => icon.sizes))).sort(
      (a, b) => a - b,
    ),
  );
  let allStyles = $derived(
    Array.from(new Set(source.flatMap((icon) => icon.styles))).sort(),
  );
  let allMetaphors = $derived(
    Array.from(
      new Set(
        source
          .filter(
            (icon) =>
              icon.sizes.includes(selectedSize) &&
              icon.styles.includes(selectedStyle),
          )
          .flatMap(getMetaphors),
      ),
    ).sort((a, b) => a.localeCompare(b)),
  );
  let visibleMetaphors = $derived(
    allMetaphors.filter((metaphor) =>
      metaphor.toLowerCase().includes(metaphorKeyword.trim().toLowerCase()),
    ),
  );
  let leftFiltered = $derived(source.filter(matchesLeftFilters));
  let filtered = $derived(leftFiltered.filter(matchesSearch));
  let gridWidth = $derived(Math.max(0, containerWidth));
  let baseItemSize = $derived(Math.max(36, selectedSize + 24));

  let columnsPerRow = $derived(
    Math.max(1, Math.floor((gridWidth + GAP) / (baseItemSize + GAP))),
  );
  let itemSize = $derived(
    (gridWidth - GAP * (columnsPerRow - 1)) / columnsPerRow,
  );
  let rowHeight = $derived(itemSize + GAP);
  let totalRows = $derived(Math.ceil(filtered.length / columnsPerRow));
  let viewportRows = $derived(Math.ceil(containerHeight / rowHeight));
  let overscanRows = $derived(
    Math.max(
      MIN_OVERSCAN_ROWS,
      Math.min(MAX_OVERSCAN_ROWS, Math.ceil(viewportRows * 0.75)),
    ),
  );
  let startRow = $derived(Math.max(0, scrollRow - overscanRows));
  let visibleRows = $derived(viewportRows + overscanRows * 2 + 1);
  let startIndex = $derived(startRow * columnsPerRow);
  let endIndex = $derived(
    Math.min(filtered.length, (startRow + visibleRows) * columnsPerRow),
  );
  let visibleIcons = $derived(filtered.slice(startIndex, endIndex));
  let itemsTop = $derived(startRow * rowHeight);

  function getMetaphors(icon: IconEntry) {
    return icon.metaphor
      .map((metaphor) => metaphor.trim())
      .filter((metaphor) => metaphor.length > 0);
  }

  function getSearchText(icon: IconEntry) {
    return [
      icon.key,
      icon.name,
      icon.keyword,
      icon.description,
      ...icon.styles,
      ...icon.sizes.map(String),
      ...getMetaphors(icon),
    ]
      .join(' ')
      .toLowerCase();
  }

  function matchesSearch(icon: IconEntry) {
    const terms = keyword.trim().toLowerCase().split(/\s+/).filter(Boolean);

    return (
      terms.length === 0 ||
      terms.every((term) => getSearchText(icon).includes(term))
    );
  }

  function matchesLeftFilters(icon: IconEntry) {
    const matchesSize = icon.sizes.includes(selectedSize);
    const matchesStyle = icon.styles.includes(selectedStyle);
    const matchesMetaphor =
      selectedMetaphor === '' || getMetaphors(icon).includes(selectedMetaphor);

    return matchesSize && matchesStyle && matchesMetaphor;
  }

  function resetScroll() {
    scrollRow = 0;
    if (gridEl) gridEl.scrollTop = 0;
  }

  function selectSize(size: number) {
    selectedSize = size;
    resetScroll();
  }

  function selectStyle(style: IconStyle) {
    selectedStyle = style;
    resetScroll();
  }

  function selectMetaphor(metaphor: string) {
    selectedMetaphor = metaphor;
    resetScroll();
  }

  function selectIcon(icon: IconEntry) {
    selectedIcon = icon;
  }

  function onScroll() {
    if (!gridEl) return;

    const nextScrollRow = Math.floor(gridEl.scrollTop / rowHeight);
    if (nextScrollRow !== scrollRow) scrollRow = nextScrollRow;
  }

  onMount(() => {
    source = registry;

    const params = readParams($page.url);
    keyword = params.keyword;
    selectedSize = params.size;
    selectedStyle = params.style;
    selectedMetaphor = params.metaphor;

    if (params.iconKey) {
      selectedIcon =
        registry.find((icon) => icon.key === params.iconKey) ?? null;
    }
    if (!selectedIcon) {
      selectedIcon = registry[0] ?? null;
    }

    urlSyncReady = true;
  });

  $effect(() => {
    if (!urlSyncReady || !source.length) return;

    const params = buildParams();
    const qs = params.toString();
    const currentQs = $page.url.searchParams.toString();
    if (qs === currentQs) return;

    const newUrl = new URL($page.url);
    newUrl.search = qs ? `?${qs}` : '';
    goto(newUrl, { replaceState: true, noScroll: true, keepFocus: true });
  });

  $effect(() => {
    keyword;
    resetScroll();
  });

  $effect(() => {
    if (selectedMetaphor && !allMetaphors.includes(selectedMetaphor)) {
      selectedMetaphor = '';
      resetScroll();
    }
  });

  $effect(() => {
    if (selectedIcon && !filtered.includes(selectedIcon)) {
      selectedIcon = filtered[0] ?? null;
    } else if (!selectedIcon && filtered.length) {
      selectedIcon = filtered[0];
    }
  });

  $effect(() => {
    const el = gridEl;
    if (!el) return;

    const ro = new ResizeObserver(([entry]) => {
      if (entry) {
        containerWidth = entry.contentRect.width;
        containerHeight = entry.contentRect.height;
        scrollRow = Math.floor(el.scrollTop / rowHeight);
      }
    });
    ro.observe(el);

    return () => ro.disconnect();
  });
</script>

<svelte:head>
  <title>FluentUI Icons Like — Svelte Icon Components</title>
  <meta
    name="description"
    content="Browse, search, and copy over 2,000+ SVG icon components for Svelte — based on Microsoft Fluent UI System Icons. Supports Regular, Filled, and Light styles in multiple sizes." />
  <meta
    property="og:title"
    content="FluentUI Icons Like — Svelte Icon Components" />
  <meta
    property="og:description"
    content="Browse, search, and copy over 2,000+ SVG icon components for Svelte — based on Microsoft Fluent UI System Icons." />
  <meta
    name="twitter:title"
    content="FluentUI Icons Like — Svelte Icon Components" />
  <meta
    name="twitter:description"
    content="Browse, search, and copy over 2,000+ SVG icon components for Svelte — based on Microsoft Fluent UI System Icons." />
</svelte:head>

<div
  class="h-screen overflow-hidden bg-stone-100 font-sans text-slate-950 dark:bg-zinc-950 dark:text-zinc-100">
  <div
    class="grid h-full min-h-0 grid-cols-[236px_minmax(0,1fr)_236px] max-[1120px]:grid-cols-[236px_minmax(0,1fr)] max-[760px]:grid-cols-1">
    <FilterSidebar
      iconCount={source.length}
      {allSizes}
      {allStyles}
      {visibleMetaphors}
      {selectedSize}
      {selectedStyle}
      {selectedMetaphor}
      bind:metaphorKeyword
      onSelectSize={selectSize}
      onSelectStyle={selectStyle}
      onSelectMetaphor={selectMetaphor} />

    <IconCatalog
      bind:keyword
      bind:gridEl
      leftFilteredCount={leftFiltered.length}
      {filtered}
      {visibleIcons}
      {selectedIcon}
      {selectedSize}
      {selectedStyle}
      {totalRows}
      {rowHeight}
      padding={PADDING}
      {columnsPerRow}
      {itemsTop}
      {itemSize}
      {onScroll}
      onSelectIcon={selectIcon} />

    <IconDetails {selectedIcon} {selectedSize} {selectedStyle} />
  </div>
</div>
