<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import type {
    PreviewIconEntry,
    PreviewIconStyle,
  } from '$lib/preview/registry.js';
  import FilterSidebar from '$lib/preview/FilterSidebar.svelte';
  import IconCatalog from '$lib/preview/IconCatalog.svelte';
  import IconDetails from '$lib/preview/IconDetails.svelte';

  const GAP = 6;
  const PADDING = 10;
  const MIN_OVERSCAN_ROWS = 8;
  const MAX_OVERSCAN_ROWS = 24;
  const DEFAULT_ICON_COLOR = '';
  const THEME_ICON_COLOR = 'var(--color-foreground)';

  const VALID_STYLES = new Set<PreviewIconStyle>([
    'Filled',
    'Light',
    'Regular',
  ]);
  const VALID_SCALES = new Set([1, 2, 3]);
  const HEX_COLOR_RE = /^#[0-9a-f]{6}$/i;

  function readParams(url: URL): {
    keyword: string;
    size: number;
    style: PreviewIconStyle;
    metaphor: string;
    iconKey: string;
    color: string;
    scale: number;
  } {
    const p = url.searchParams;
    const style = p.get('style') ?? '';
    const color = p.get('color') ?? '';
    const scale = Number(p.get('scale')) || 1;
    return {
      keyword: p.get('q') ?? '',
      size: Number(p.get('size')) || 20,
      style: VALID_STYLES.has(style as PreviewIconStyle)
        ? (style as PreviewIconStyle)
        : 'Regular',
      metaphor: p.get('metaphor') ?? '',
      iconKey: p.get('icon') ?? '',
      color: HEX_COLOR_RE.test(color)
        ? color.toLowerCase()
        : DEFAULT_ICON_COLOR,
      scale: VALID_SCALES.has(scale) ? scale : 1,
    };
  }

  function buildParams(): URLSearchParams {
    const p = new URLSearchParams();
    if (keyword) p.set('q', keyword);
    if (selectedSize !== 20) p.set('size', String(selectedSize));
    if (selectedStyle !== 'Regular') p.set('style', selectedStyle);
    if (selectedMetaphor) p.set('metaphor', selectedMetaphor);
    if (selectedIcon) p.set('icon', selectedIcon.key);
    if (selectedColor !== DEFAULT_ICON_COLOR) p.set('color', selectedColor);
    if (selectedScale !== 1) p.set('scale', String(selectedScale));
    return p;
  }

  let source = $state<PreviewIconEntry[]>([]);
  let keyword = $state('');
  let selectedSize = $state(20);
  let selectedStyle = $state<PreviewIconStyle>('Regular');
  let selectedMetaphor = $state('');
  let selectedColor = $state(DEFAULT_ICON_COLOR);
  let themeIconColor = $state('#333333');
  let selectedScale = $state(1);
  let metaphorKeyword = $state('');
  let selectedIcon = $state<PreviewIconEntry | null>(null);

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
  let displaySize = $derived(selectedSize * selectedScale);
  let baseItemSize = $derived(Math.max(36, displaySize + 24));

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
  let effectiveSelectedColor = $derived(selectedColor || THEME_ICON_COLOR);
  let colorPickerValue = $derived(selectedColor || themeIconColor);

  function getMetaphors(icon: PreviewIconEntry) {
    return icon.metaphor
      .map((metaphor) => metaphor.trim())
      .filter((metaphor) => metaphor.length > 0);
  }

  function getSearchText(icon: PreviewIconEntry) {
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

  function matchesSearch(icon: PreviewIconEntry) {
    const terms = keyword.trim().toLowerCase().split(/\s+/).filter(Boolean);

    return (
      terms.length === 0 ||
      terms.every((term) => getSearchText(icon).includes(term))
    );
  }

  function matchesLeftFilters(icon: PreviewIconEntry) {
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

  function selectStyle(style: PreviewIconStyle) {
    selectedStyle = style;
    resetScroll();
  }

  function selectMetaphor(metaphor: string) {
    selectedMetaphor = metaphor;
    resetScroll();
  }

  function selectScale(scale: number) {
    if (!VALID_SCALES.has(scale)) return;

    selectedScale = scale;
    resetScroll();
  }

  function selectIcon(icon: PreviewIconEntry) {
    selectedIcon = icon;
  }

  function onScroll() {
    if (!gridEl) return;

    const nextScrollRow = Math.floor(gridEl.scrollTop / rowHeight);
    if (nextScrollRow !== scrollRow) scrollRow = nextScrollRow;
  }

  function syncThemeIconColor() {
    const color = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-foreground')
      .trim();

    if (color) themeIconColor = color;
  }

  onMount(async () => {
    const { registry } = await import('$lib/preview/registry.js');
    source = registry;

    syncThemeIconColor();

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onThemeChange = () => syncThemeIconColor();
    const observer = new MutationObserver(() => syncThemeIconColor());
    media.addEventListener('change', onThemeChange);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    const params = readParams($page.url);
    keyword = params.keyword;
    selectedSize = params.size;
    selectedStyle = params.style;
    selectedMetaphor = params.metaphor;
    selectedColor = params.color;
    selectedScale = params.scale;

    if (params.iconKey) {
      selectedIcon =
        registry.find((icon) => icon.key === params.iconKey) ?? null;
    }
    if (!selectedIcon) {
      selectedIcon = registry[0] ?? null;
    }

    urlSyncReady = true;

    return () => {
      media.removeEventListener('change', onThemeChange);
      observer.disconnect();
    };
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
  class="min-h-screen overflow-hidden bg-background font-sans text-foreground">
  <div class="grid h-screen min-h-0 grid-cols-[236px_minmax(0,1fr)_236px] bg-background">
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
      {selectedScale}
      {totalRows}
      {rowHeight}
      padding={PADDING}
      {columnsPerRow}
      {itemsTop}
        {itemSize}
        {onScroll}
        bind:selectedColor
        {colorPickerValue}
        effectiveSelectedColor={effectiveSelectedColor}
        onSelectScale={selectScale}
        onSelectIcon={selectIcon} />

    <IconDetails
      {selectedIcon}
      {selectedSize}
      {selectedStyle}
      selectedColor={effectiveSelectedColor} />
  </div>
</div>
