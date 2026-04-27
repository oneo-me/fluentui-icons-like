<script lang="ts">
  import type { Component } from 'svelte';
  import registry from '../icons';
  import { onMount, tick } from 'svelte';

  interface IconEntry {
    key: string;
    value: Component;
  }

  const ITEM_WIDTH = 130;
  const ITEM_HEIGHT = 82;
  const GAP = 8;
  const PADDING = 16;
  const ROW_HEIGHT = ITEM_HEIGHT + GAP;
  const OVERSCAN = 2;

  let source = $state<IconEntry[]>([]);
  let filtered = $state<IconEntry[]>([]);
  let keyword = $state('');

  let gridEl = $state<HTMLDivElement | null>(null);

  let containerWidth = $state(800);
  let containerHeight = $state(600);
  let scrollTopRaw = $state(0);

  let columnsPerRow = $derived(Math.max(1, Math.floor((containerWidth - PADDING * 2 + GAP) / (ITEM_WIDTH + GAP))));
  let totalRows = $derived(Math.ceil(filtered.length / columnsPerRow));
  let startRow = $derived(Math.max(0, Math.floor(scrollTopRaw / ROW_HEIGHT) - OVERSCAN));
  let visibleRows = $derived(Math.ceil(containerHeight / ROW_HEIGHT) + OVERSCAN * 2 + 1);
  let startIndex = $derived(startRow * columnsPerRow);
  let endIndex = $derived(Math.min(filtered.length, (startRow + visibleRows) * columnsPerRow));
  let visibleIcons = $derived(filtered.slice(startIndex, endIndex));
  let itemsTop = $derived(startRow * ROW_HEIGHT);

  function onInput() {
    const q = keyword.toLowerCase();
    filtered = q ? source.filter((icon) => icon.key.toLowerCase().includes(q)) : source;
    scrollTopRaw = 0;
    if (gridEl) gridEl.scrollTop = 0;
  }

  async function onClick(key: string) {
    await navigator.clipboard.writeText(key);
  }

  function onScroll() {
    if (gridEl) scrollTopRaw = gridEl.scrollTop;
  }

  onMount(() => {
    source = registry as IconEntry[];
    onInput();
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

<svelte:head>
  <title>Fluent UI Icons - Svelte</title>
</svelte:head>

<div class="app">
  <header class="header">
    <div class="header-left">
      <h1 class="title">Fluent UI Icons - Svelte</h1>
      <span class="count">{filtered.length} icons</span>
    </div>
    <input
      type="text"
      class="search"
      bind:value={keyword}
      oninput={onInput}
      placeholder="Search icons..."
    />
  </header>

  <div
    class="grid"
    bind:this={gridEl}
    onscroll={onScroll}
  >
    <div class="spacer" style="height: {totalRows * ROW_HEIGHT + PADDING * 2}px"></div>
    <div
      class="items"
      style="transform: translateY({itemsTop + PADDING}px)"
    >
      {#each visibleIcons as { key, value: Comp }}
        {#key key}
          <button
            class="icon-item"
            title={key}
            onclick={() => onClick(key)}
          >
            <Comp size={36} />
            <span class="icon-name" title={key}>{key}</span>
          </button>
        {/key}
      {/each}
    </div>
  </div>
</div>

<style>
  :global(*) {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  .app {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: #f8fafc;
    color: #334155;
    font-family: system-ui, -apple-system, sans-serif;
  }

  .header {
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    background: #ffffff;
    border-bottom: 1px solid #e2e8f0;
    gap: 16px;
    flex-shrink: 0;
  }

  .header-left {
    display: flex;
    align-items: baseline;
    gap: 12px;
  }

  .title {
    font-size: 18px;
    font-weight: 700;
    white-space: nowrap;
  }

  .count {
    font-size: 13px;
    color: #94a3b8;
  }

  .search {
    width: 240px;
    padding: 8px 12px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 14px;
    outline: none;
    transition: border-color 0.15s;
  }

  .search:focus {
    border-color: #6366f1;
  }

  .grid {
    flex: 1;
    position: relative;
    overflow-y: auto;
    padding: 16px;
  }

  .spacer {
    pointer-events: none;
  }

  .items {
    position: absolute;
    top: 0;
    left: 16px;
    right: 16px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-content: flex-start;
    will-change: transform;
  }

  .icon-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    gap: 4px;
    width: 130px;
    height: 82px;
    padding: 12px 8px;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    background: #ffffff;
    cursor: pointer;
    transition: all 0.15s;
    overflow: hidden;
  }

  .icon-item:hover {
    border-color: #6366f1;
    background: #eef2ff;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.12);
  }

  .icon-name {
    font-size: 11px;
    color: #94a3b8;
    text-align: center;
    word-break: break-all;
    line-height: 1.2;
  }
</style>
