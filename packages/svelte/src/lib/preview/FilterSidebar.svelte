<script lang="ts">
  import type { IconStyle } from '$lib/index.js';

  let {
    iconCount,
    allSizes,
    allStyles,
    visibleMetaphors,
    selectedSize,
    selectedStyle,
    selectedMetaphor,
    metaphorKeyword = $bindable(),
    onSelectSize,
    onSelectStyle,
    onSelectMetaphor,
  }: {
    iconCount: number;
    allSizes: number[];
    allStyles: IconStyle[];
    visibleMetaphors: string[];
    selectedSize: number;
    selectedStyle: IconStyle;
    selectedMetaphor: string;
    metaphorKeyword: string;
    onSelectSize: (size: number) => void;
    onSelectStyle: (style: IconStyle) => void;
    onSelectMetaphor: (metaphor: string) => void;
  } = $props();

  const chipBase =
    'h-7 min-w-0 cursor-pointer overflow-hidden rounded-md border px-2 text-[11px] font-bold text-ellipsis whitespace-nowrap transition-colors';
  const chipIdle =
    'border-stone-300 bg-white/75 text-slate-950 hover:border-teal-700 hover:text-teal-900 dark:border-zinc-700 dark:bg-zinc-900/75 dark:text-zinc-100 dark:hover:border-teal-400 dark:hover:text-teal-200';
  const chipActive =
    'border-teal-700 bg-teal-50 text-teal-900 shadow-inner dark:border-teal-400 dark:bg-teal-950/60 dark:text-teal-100';

  function chipClass(active: boolean) {
    return `${chipBase} ${active ? chipActive : chipIdle}`;
  }
</script>

<aside
  class="flex min-h-0 flex-col overflow-hidden border-r border-slate-900/10 bg-stone-50/75 p-2.5 max-[760px]:grid max-[760px]:grid-cols-2 max-[760px]:gap-2.5 max-[760px]:overflow-y-auto max-[760px]:border-r-0 max-[760px]:border-b dark:border-zinc-100/10 dark:bg-zinc-900/75"
  aria-label="Icon filters">
  <div
    class="mb-3 grid min-w-[172px] gap-2 border-b border-slate-900/10 pb-2.5 max-[760px]:col-span-full max-[760px]:mb-0 max-[760px]:min-w-0 dark:border-zinc-100/10">
    <div class="flex min-h-10 items-center gap-2">
      <span
        class="grid size-[30px] place-items-center border border-teal-900 bg-teal-900 font-serif text-lg font-bold text-stone-50 dark:border-teal-300 dark:bg-teal-300 dark:text-zinc-950">
        F
      </span>
      <div>
        <h1 class="m-0 font-serif text-[17px] leading-[1.05] text-slate-950 dark:text-zinc-100">
          FluentUI Icons Like
        </h1>
        <span
          class="mt-0.5 block text-[11px] leading-tight font-bold text-slate-500 dark:text-zinc-400">
          {iconCount.toLocaleString()}
          icons
        </span>
      </div>
    </div>
    <a
      class="inline-flex h-8 w-full cursor-pointer items-center justify-center gap-1.5 rounded-md border border-teal-700 bg-teal-900 px-2 text-[11px] font-extrabold text-stone-50 shadow-sm transition-colors hover:bg-teal-700 focus:outline-none focus:ring-3 focus:ring-teal-700/20 dark:border-teal-300 dark:bg-teal-300 dark:text-zinc-950 dark:hover:bg-teal-200 dark:focus:ring-teal-300/25"
      href="https://github.com/oneo-me/fluentui-icons-like"
      target="_blank"
      rel="noreferrer">
      <span>Getting started</span>
    </a>
  </div>

  <section class="min-h-0 pb-3 max-[760px]:p-0">
    <div class="mb-2 flex items-center justify-between gap-2.5">
      <span
        class="text-[11px] font-extrabold tracking-[0.08em] text-slate-500 uppercase dark:text-zinc-400">
        Size
      </span>
    </div>
    <div class="grid grid-cols-4 gap-1">
      {#each allSizes as size}
        <button
          type="button"
          class={chipClass(selectedSize === size)}
          onclick={() => onSelectSize(size)}>
          {size}
        </button>
      {/each}
    </div>
  </section>

  <section
    class="min-h-0 border-t border-slate-900/10 pt-3 pb-3 max-[760px]:border-t-0 max-[760px]:p-0 dark:border-zinc-100/10">
    <div class="mb-2 flex items-center justify-between gap-2.5">
      <span
        class="text-[11px] font-extrabold tracking-[0.08em] text-slate-500 uppercase dark:text-zinc-400">
        Style
      </span>
    </div>
    <div class="grid grid-cols-3 gap-1">
      {#each allStyles as style}
        <button
          type="button"
          class={chipClass(selectedStyle === style)}
          onclick={() => onSelectStyle(style)}>
          {style}
        </button>
      {/each}
    </div>
  </section>

  <section
    class="flex min-h-0 flex-1 flex-col border-t border-slate-900/10 pt-3 max-[760px]:border-t-0 max-[760px]:p-0 dark:border-zinc-100/10">
    <div class="mb-2 flex items-center justify-between gap-2.5">
      <span
        class="text-[11px] font-extrabold tracking-[0.08em] text-slate-500 uppercase dark:text-zinc-400">
        Metaphors
      </span>
    </div>
    <label class="mb-2 block">
      <input
        class="h-[30px] w-full min-w-0 rounded-md border border-stone-300 bg-white px-2 text-[11px] font-bold text-slate-950 outline-none focus:border-teal-700 focus:ring-3 focus:ring-teal-700/15 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-teal-400 dark:focus:ring-teal-400/20"
        type="search"
        bind:value={metaphorKeyword}
        placeholder="Filter metaphors" />
    </label>
    <div
      class="-mr-2.5 flex min-h-0 flex-1 flex-wrap content-start items-start gap-1 overflow-y-auto pr-2.5 [scrollbar-gutter:stable] max-[760px]:mr-0">
      <button
        type="button"
        class={`${chipClass(selectedMetaphor === '')} w-auto max-w-full`}
        onclick={() => onSelectMetaphor('')}>
        All
      </button>
      {#each visibleMetaphors as metaphor}
        <button
          type="button"
          class={`${chipClass(selectedMetaphor === metaphor)} w-auto max-w-full`}
          title={metaphor}
          onclick={() => onSelectMetaphor(metaphor)}>
          {metaphor}
        </button>
      {/each}
    </div>
  </section>

  <div
    class="mt-3 grid gap-1 border-t border-slate-900/10 pt-2.5 text-[11px] leading-[1.35] text-slate-500 max-[760px]:col-span-full max-[760px]:mt-0 dark:border-zinc-100/10 dark:text-zinc-400">
    <span>
      This project was created by
      <a
        class="font-extrabold text-teal-900 hover:underline dark:text-teal-200"
        href="https://oneo.me"
        target="_blank"
        rel="noreferrer">
        ONEO
      </a>
      using
      <a
        class="font-extrabold text-teal-900 hover:underline dark:text-teal-200"
        href="https://github.com/microsoft/fluentui-system-icons"
        target="_blank"
        rel="noreferrer">
        fluentui-system-icons
      </a>
    </span>
  </div>
</aside>
