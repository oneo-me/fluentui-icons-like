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
    'border-[#d6dcd2] bg-white/75 text-[#18211e] hover:border-[#0f6c61] hover:text-[#073b35]';
  const chipActive =
    'border-[#0f6c61] bg-[#dceee9] text-[#073b35] shadow-[inset_0_0_0_1px_rgba(15,108,97,0.16)]';

  function chipClass(active: boolean) {
    return `${chipBase} ${active ? chipActive : chipIdle}`;
  }
</script>

<aside
  class="flex min-h-0 flex-col overflow-hidden border-r border-[#18211e1f] bg-[#fbfcf7]/75 p-2.5 max-[760px]:grid max-[760px]:grid-cols-2 max-[760px]:gap-2.5 max-[760px]:overflow-y-auto max-[760px]:border-r-0 max-[760px]:border-b"
  aria-label="Icon filters">
  <div
    class="mb-3 grid min-w-[172px] gap-2 border-b border-[#18211e1a] pb-2.5 max-[760px]:col-span-full max-[760px]:mb-0 max-[760px]:min-w-0">
    <div class="flex min-h-10 items-center gap-2">
      <span
        class="grid size-[30px] place-items-center border border-[#123f38] bg-[#123f38] font-serif text-lg font-bold text-[#f7f4df]">
        F
      </span>
      <div>
        <h1 class="m-0 font-serif text-[17px] leading-[1.05] text-[#18211e]">
          FluentUI Icons Like
        </h1>
        <span
          class="mt-0.5 block text-[11px] leading-tight font-bold text-[#66706a]">
          {iconCount.toLocaleString()}
          icons
        </span>
      </div>
    </div>
    <a
      class="inline-flex h-8 w-full cursor-pointer items-center justify-center gap-1.5 rounded-md border border-[#0f6c61] bg-[#123f38] px-2 text-[11px] font-extrabold text-[#f7f4df] shadow-[0_1px_0_rgba(24,33,30,0.08)] transition-colors hover:bg-[#0f6c61] focus:outline-none focus:ring-3 focus:ring-[#0f6c6124]"
      href="https://github.com/oneo-me/fluentui-icons-like"
      target="_blank"
      rel="noreferrer">
      <span>Getting started</span>
    </a>
  </div>

  <section class="min-h-0 pb-3 max-[760px]:p-0">
    <div class="mb-2 flex items-center justify-between gap-2.5">
      <span
        class="text-[11px] font-extrabold tracking-[0.08em] text-[#66706a] uppercase">
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
    class="min-h-0 border-t border-[#18211e1a] pt-3 pb-3 max-[760px]:border-t-0 max-[760px]:p-0">
    <div class="mb-2 flex items-center justify-between gap-2.5">
      <span
        class="text-[11px] font-extrabold tracking-[0.08em] text-[#66706a] uppercase">
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
    class="flex min-h-0 flex-1 flex-col border-t border-[#18211e1a] pt-3 max-[760px]:border-t-0 max-[760px]:p-0">
    <div class="mb-2 flex items-center justify-between gap-2.5">
      <span
        class="text-[11px] font-extrabold tracking-[0.08em] text-[#66706a] uppercase">
        Metaphors
      </span>
    </div>
    <label class="mb-2 block">
      <input
        class="h-[30px] w-full min-w-0 rounded-md border border-[#d6dcd2] bg-white px-2 text-[11px] font-bold text-[#18211e] outline-none focus:border-[#0f6c61] focus:shadow-[0_0_0_3px_rgba(15,108,97,0.14)]"
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
    class="mt-3 grid gap-1 border-t border-[#18211e1a] pt-2.5 text-[11px] leading-[1.35] text-[#66706a] max-[760px]:col-span-full max-[760px]:mt-0">
    <span>
      This project was created by
      <a
        class="font-extrabold text-[#073b35] hover:underline"
        href="https://oneo.me"
        target="_blank"
        rel="noreferrer">
        ONEO
      </a>
      using
      <a
        class="font-extrabold text-[#073b35] hover:underline"
        href="https://github.com/microsoft/fluentui-system-icons"
        target="_blank"
        rel="noreferrer">
        fluentui-system-icons
      </a>
    </span>
  </div>
</aside>
