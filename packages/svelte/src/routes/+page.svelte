<script lang="ts">
  import { onMount } from 'svelte';
  import { type IconEntry, type IconStyle, registry } from '$lib/index.js';

  const GAP = 6;
  const PADDING = 10;
  const OVERSCAN = 3;

  let source = $state<IconEntry[]>([]);
  let keyword = $state('');
  let selectedSize = $state(20);
  let selectedStyle = $state<IconStyle>('Regular');
  let selectedMetaphor = $state('');
  let metaphorKeyword = $state('');
  let selectedIcon = $state<IconEntry | null>(null);
  let copiedKey = $state('');

  let gridEl = $state<HTMLDivElement | null>(null);
  let containerWidth = $state(900);
  let containerHeight = $state(620);
  let scrollTopRaw = $state(0);

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
  let filtered = $derived(source.filter(matchesFilters));
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
  let startRow = $derived(
    Math.max(0, Math.floor(scrollTopRaw / rowHeight) - OVERSCAN),
  );
  let visibleRows = $derived(
    Math.ceil(containerHeight / rowHeight) + OVERSCAN * 2 + 1,
  );
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

  function matchesFilters(icon: IconEntry) {
    const terms = keyword.trim().toLowerCase().split(/\s+/).filter(Boolean);

    const matchesSearch =
      terms.length === 0 ||
      terms.every((term) => getSearchText(icon).includes(term));
    const matchesSize = icon.sizes.includes(selectedSize);
    const matchesStyle = icon.styles.includes(selectedStyle);
    const matchesMetaphor =
      selectedMetaphor === '' || getMetaphors(icon).includes(selectedMetaphor);

    return matchesSearch && matchesSize && matchesStyle && matchesMetaphor;
  }

  function resetScroll() {
    scrollTopRaw = 0;
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

  async function copyKey(key: string) {
    await navigator.clipboard.writeText(key);
    copiedKey = key;
    window.setTimeout(() => {
      if (copiedKey === key) copiedKey = '';
    }, 1200);
  }

  function copySelectedKey() {
    if (selectedIcon) void copyKey(selectedIcon.key);
  }

  function selectIcon(icon: IconEntry) {
    selectedIcon = icon;
  }

  function onScroll() {
    if (gridEl) scrollTopRaw = gridEl.scrollTop;
  }

  onMount(() => {
    source = registry;
    selectedIcon = registry[0] ?? null;
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
      }
    });
    ro.observe(el);

    return () => ro.disconnect();
  });
</script>

<svelte:head> <title>Fluent UI Icons Preview</title> </svelte:head>

<div class="app">
  <div class="workspace">
    <aside class="filters" aria-label="Icon filters">
      <div class="brand">
        <span class="brand-mark">F</span>
        <div>
          <h1>Fluent UI Icons</h1>
        </div>
      </div>

      <section class="filter-section">
        <div class="section-title">
          <span>Size</span>
          <strong>{selectedSize}</strong>
        </div>
        <div class="chip-grid size-grid">
          {#each allSizes as size}
            <button
              type="button"
              class:active={selectedSize === size}
              onclick={() => selectSize(size)}>
              {size}
            </button>
          {/each}
        </div>
      </section>

      <section class="filter-section">
        <div class="section-title">
          <span>Style</span>
          <strong>{selectedStyle}</strong>
        </div>
        <div class="chip-grid">
          {#each allStyles as style}
            <button
              type="button"
              class:active={selectedStyle === style}
              onclick={() => selectStyle(style)}>
              {style}
            </button>
          {/each}
        </div>
      </section>

      <section class="filter-section">
        <div class="section-title">
          <span>Metaphors</span>
          <strong>{selectedMetaphor || 'All'}</strong>
        </div>
        <label class="metaphor-search">
          <input
            type="search"
            bind:value={metaphorKeyword}
            placeholder="Filter metaphors" />
        </label>
        <div class="chip-grid metaphor-grid">
          <button
            type="button"
            class:active={selectedMetaphor === ''}
            onclick={() => selectMetaphor('')}>
            All
          </button>
          {#each visibleMetaphors as metaphor}
            <button
              type="button"
              class:active={selectedMetaphor === metaphor}
              title={metaphor}
              onclick={() => selectMetaphor(metaphor)}>
              {metaphor}
            </button>
          {/each}
        </div>
      </section>

      <div class="sidebar-footer">
        <strong>Fluent UI Icons Preview</strong>
        <span>Icons copyright Microsoft Corporation.</span>
      </div>
    </aside>

    <main class="catalog">
      <div class="catalog-toolbar">
        <label class="search">
          <input
            type="search"
            bind:value={keyword}
            placeholder={`Searching metadata from ${source.length.toLocaleString()} icons…`} />
        </label>
      </div>

      <div class="grid" bind:this={gridEl} onscroll={onScroll}>
        {#if filtered.length === 0}
          <div class="empty-state">
            <strong>No icons found</strong>
            <span>Try another keyword, size, or style.</span>
          </div>
        {:else}
          <div
            class="spacer"
            style="height: {totalRows * rowHeight + PADDING * 2}px"></div>
          <div
            class="items"
            style="grid-template-columns: repeat({columnsPerRow}, minmax(0, 1fr)); transform: translateY({itemsTop + PADDING}px)">
            {#each visibleIcons as icon}
              {#key icon.key}
                {@const Comp = icon.value}
                <button
                  type="button"
                  class="icon-item"
                  class:selected={selectedIcon?.key === icon.key}
                  style="height: {itemSize}px"
                  title={icon.description || icon.name}
                  onclick={() => selectIcon(icon)}>
                  <Comp size={selectedSize} style={selectedStyle} />
                </button>
              {/key}
            {/each}
          </div>
        {/if}
      </div>
    </main>

    <aside class="details" aria-label="Selected icon details">
      {#if selectedIcon}
        {@const DetailComp = selectedIcon.value}
        <div class="detail-preview">
          <DetailComp
            size={120}
            style={selectedStyle}
            title={selectedIcon.name} />
        </div>

        <div class="detail-title">
          <h2>{selectedIcon.name}</h2>
          <button type="button" class="copy-button" onclick={copySelectedKey}>
            {copiedKey === selectedIcon.key ? 'Copied' : 'Copy key'}
          </button>
        </div>

        <dl class="detail-list">
          <div>
            <dt>Key</dt>
            <dd>{selectedIcon.key}</dd>
          </div>
          <div>
            <dt>Keyword</dt>
            <dd>{selectedIcon.keyword}</dd>
          </div>
          <div>
            <dt>Description</dt>
            <dd>{selectedIcon.description || 'No description'}</dd>
          </div>
        </dl>

        <div class="token-block">
          <span>Styles</span>
          <div>
            {#each selectedIcon.styles as style}
              <span>{style}</span>
            {/each}
          </div>
        </div>

        <div class="token-block">
          <span>Sizes</span>
          <div>
            {#each selectedIcon.sizes as size}
              <span>{size}px</span>
            {/each}
          </div>
        </div>

        <div class="token-block">
          <span>Metaphors</span>
          <div>
            {#each selectedIcon.metaphor as tag}
              <span>{tag}</span>
            {/each}
          </div>
        </div>
      {:else}
        <div class="empty-detail">
          <strong>Select an icon</strong>
          <span>Details appear here.</span>
        </div>
      {/if}
    </aside>
  </div>
</div>

<style>
  :global(*) {
    box-sizing: border-box;
  }

  :global(body) {
    margin: 0;
    background: #eef0ea;
  }

  :global(button),
  :global(input) {
    font: inherit;
  }

  .app {
    --ink: #18211e;
    --muted: #66706a;
    --line: #d6dcd2;
    --panel: #fbfcf7;
    --panel-strong: #ffffff;
    --accent: #0f6c61;
    --accent-ink: #073b35;
    height: 100vh;
    overflow: hidden;
    background: #eef0ea;
    color: var(--ink);
    font-family: ui-sans-serif, 'Avenir Next', 'Segoe UI', sans-serif;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 172px;
    min-height: 42px;
    margin-bottom: 12px;
    padding-bottom: 10px;
    border-bottom: 1px solid rgba(24, 33, 30, 0.1);
  }

  .brand-mark {
    display: grid;
    place-items: center;
    width: 30px;
    height: 30px;
    border: 1px solid #123f38;
    background: #123f38;
    color: #f7f4df;
    font-family: Georgia, serif;
    font-size: 18px;
    font-weight: 700;
  }

  h1,
  h2 {
    margin: 0;
  }

  .brand h1 {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 17px;
    line-height: 1.05;
    letter-spacing: 0;
  }

  .search {
    position: relative;
    display: block;
    width: 100%;
  }

  .section-title span,
  .token-block > span {
    color: var(--muted);
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .search input {
    width: 100%;
    min-width: 0;
    height: 36px;
    border: 1px solid var(--line);
    border-radius: 6px;
    padding: 0 10px;
    outline: none;
    background: var(--panel-strong);
    color: var(--ink);
    box-shadow: 0 1px 0 rgba(24, 33, 30, 0.05);
  }

  .search input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(15, 108, 97, 0.14);
  }

  .workspace {
    display: grid;
    grid-template-columns: 236px minmax(0, 1fr) 236px;
    height: 100%;
    min-height: 0;
  }

  .filters,
  .details {
    min-height: 0;
    background: rgba(251, 252, 247, 0.76);
  }

  .filters {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-right: 1px solid rgba(24, 33, 30, 0.12);
    padding: 10px;
  }

  .details {
    overflow-y: auto;
  }

  .filter-section {
    min-height: 0;
    padding: 0 0 12px;
  }

  .filter-section + .filter-section {
    border-top: 1px solid rgba(24, 33, 30, 0.1);
    padding-top: 12px;
  }

  .filter-section:last-of-type {
    display: flex;
    flex: 1;
    flex-direction: column;
    padding-bottom: 0;
  }

  .sidebar-footer {
    display: grid;
    gap: 4px;
    margin-top: 12px;
    padding-top: 10px;
    border-top: 1px solid rgba(24, 33, 30, 0.1);
    color: var(--muted);
    font-size: 11px;
    line-height: 1.35;
  }

  .sidebar-footer strong {
    color: var(--accent-ink);
    font-size: 12px;
  }

  .section-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 8px;
  }

  .section-title strong {
    color: var(--accent-ink);
    font-size: 12px;
  }

  .chip-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 5px;
  }

  .size-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .metaphor-search {
    display: block;
    margin-bottom: 8px;
  }

  .metaphor-search input {
    width: 100%;
    min-width: 0;
    height: 30px;
    border: 1px solid var(--line);
    border-radius: 6px;
    padding: 0 8px;
    outline: none;
    background: var(--panel-strong);
    color: var(--ink);
    font-size: 11px;
    font-weight: 700;
  }

  .metaphor-search input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(15, 108, 97, 0.14);
  }

  .metaphor-grid {
    display: flex;
    flex: 1;
    flex-wrap: wrap;
    align-items: flex-start;
    align-content: flex-start;
    min-height: 0;
    margin-right: -10px;
    overflow-y: auto;
    padding-right: 10px;
    scrollbar-gutter: stable;
  }

  .metaphor-grid button {
    width: auto;
    max-width: 100%;
    padding: 0 8px;
  }

  .chip-grid button,
  .copy-button {
    height: 28px;
    border: 1px solid var(--line);
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.74);
    color: var(--ink);
    cursor: pointer;
  }

  .chip-grid button {
    font-size: 11px;
    font-weight: 700;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .chip-grid button:hover,
  .copy-button:hover {
    border-color: var(--accent);
    color: var(--accent-ink);
  }

  .chip-grid button.active {
    border-color: var(--accent);
    background: #dceee9;
    color: var(--accent-ink);
    box-shadow: inset 0 0 0 1px rgba(15, 108, 97, 0.16);
  }

  .catalog {
    display: flex;
    min-width: 0;
    min-height: 0;
    flex-direction: column;
  }

  .catalog-toolbar {
    min-height: 52px;
    padding: 8px 10px;
    border-bottom: 1px solid rgba(24, 33, 30, 0.1);
    background: rgba(251, 252, 247, 0.62);
  }

  .grid {
    position: relative;
    min-height: 0;
    flex: 1;
    overflow-y: auto;
    padding: 10px;
  }

  .spacer {
    pointer-events: none;
  }

  .items {
    position: absolute;
    top: 0;
    left: 10px;
    right: 10px;
    display: grid;
    gap: 6px;
    align-content: flex-start;
    will-change: transform;
  }

  .icon-item {
    display: grid;
    place-items: center;
    width: 100%;
    border: 1px solid rgba(24, 33, 30, 0.1);
    border-radius: 6px;
    padding: 0;
    background: rgba(255, 255, 255, 0.72);
    color: inherit;
    cursor: pointer;
    overflow: hidden;
    transition:
      transform 0.16s ease,
      border-color 0.16s ease,
      background 0.16s ease,
      box-shadow 0.16s ease;
  }

  .icon-item:hover,
  .icon-item.selected {
    border-color: rgba(15, 108, 97, 0.66);
    background: #fafffb;
    box-shadow: 0 4px 12px rgba(35, 55, 48, 0.1);
    transform: translateY(-1px);
  }

  .icon-item.selected {
    box-shadow:
      inset 0 0 0 2px rgba(15, 108, 97, 0.16),
      0 4px 12px rgba(35, 55, 48, 0.1);
  }

  .token-block div {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 5px;
    min-width: 0;
    width: 100%;
  }

  .token-block div span {
    max-width: 100%;
    border-radius: 999px;
    padding: 3px 7px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 10px;
  }

  .token-block div span {
    background: #e8f0ee;
    color: #31504b;
  }

  .details {
    border-left: 1px solid rgba(24, 33, 30, 0.12);
    padding: 8px;
  }

  .detail-preview {
    display: grid;
    place-items: center;
    width: 100%;
    aspect-ratio: 1;
    border: 1px solid var(--line);
    border-radius: 8px;
    background:
      linear-gradient(90deg, rgba(15, 108, 97, 0.08) 1px, transparent 1px),
      linear-gradient(rgba(15, 108, 97, 0.08) 1px, transparent 1px), #ffffff;
    background-size: 16px 16px;
    color: #123f38;
  }

  .detail-title {
    display: grid;
    gap: 8px;
    margin: 8px 0;
  }

  .detail-title h2 {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 18px;
    line-height: 1.05;
  }

  .copy-button {
    width: 88px;
    font-size: 11px;
    font-weight: 800;
  }

  .detail-list {
    display: grid;
    gap: 0;
    margin: 0;
    border-top: 1px solid rgba(24, 33, 30, 0.1);
  }

  .detail-list div {
    display: grid;
    grid-template-columns: 64px minmax(0, 1fr);
    gap: 8px;
    padding: 7px 0;
    border-bottom: 1px solid rgba(24, 33, 30, 0.1);
  }

  .detail-list dt {
    color: var(--muted);
    font-size: 11px;
    font-weight: 800;
  }

  .detail-list dd {
    min-width: 0;
    margin: 0;
    color: var(--ink);
    overflow-wrap: anywhere;
    font-size: 12px;
    line-height: 1.45;
  }

  .token-block {
    display: grid;
    gap: 6px;
    margin-top: 12px;
  }

  .token-block div {
    justify-content: flex-start;
  }

  .empty-state,
  .empty-detail {
    display: grid;
    place-items: center;
    align-content: center;
    gap: 8px;
    min-height: 220px;
    color: var(--muted);
    text-align: center;
  }

  .empty-state strong,
  .empty-detail strong {
    color: var(--ink);
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 20px;
  }

  @media (max-width: 1120px) {
    .workspace {
      grid-template-columns: 236px minmax(0, 1fr);
    }

    .details {
      display: none;
    }
  }

  @media (max-width: 760px) {
    .brand {
      grid-column: 1 / -1;
      min-width: 0;
      margin-bottom: 0;
    }

    .workspace {
      grid-template-columns: 1fr;
    }

    .filters {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      overflow-y: auto;
      border-right: 0;
      border-bottom: 1px solid rgba(24, 33, 30, 0.12);
      padding: 10px;
    }

    .filter-section {
      padding: 0;
    }

    .filter-section + .filter-section {
      border-top: 0;
      padding-top: 0;
    }

    .metaphor-grid {
      margin-right: 0;
    }

    .sidebar-footer {
      grid-column: 1 / -1;
      margin-top: 0;
    }
  }
</style>
