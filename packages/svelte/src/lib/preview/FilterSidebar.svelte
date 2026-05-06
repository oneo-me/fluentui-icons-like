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
    'h-7 min-w-0 cursor-pointer overflow-hidden rounded-md border px-2 text-[11px] font-bold text-ellipsis whitespace-nowrap transition-[border-color,background-color,color,box-shadow]';
  const metaphorChipBase =
    'h-6 min-w-0 cursor-pointer overflow-hidden rounded-md border px-1.5 text-[11px] font-bold text-ellipsis whitespace-nowrap transition-[border-color,background-color,color,box-shadow]';
  const chipIdle =
    'border-border bg-card/70 text-foreground hover:border-primary/45 hover:bg-accent hover:text-accent-foreground';
  const chipActive =
    'border-primary/55 bg-primary/12 text-primary shadow-[inset_0_1px_0_color-mix(in_oklab,var(--color-primary)_18%,transparent)]';

  function chipClass(active: boolean) {
    return `${chipBase} ${active ? chipActive : chipIdle}`;
  }

  function metaphorChipClass(active: boolean) {
    return `${metaphorChipBase} ${active ? chipActive : chipIdle}`;
  }
</script>

<aside
  class="flex min-h-0 flex-col overflow-hidden border-r border-border bg-sidebar/92 p-2.5 text-sidebar-foreground backdrop-blur-sm"
  aria-label="Icon filters">
  <div
    class="mb-1.5 grid min-w-[172px] gap-2 pb-1">
    <div class="flex min-h-10 items-center gap-2">
      <div class="relative grid size-[30px] shrink-0 place-items-center">
        <img
          src="/logo.png"
          alt=""
          aria-hidden="true"
          class="pointer-events-none absolute size-[60px] max-w-none object-contain opacity-20 blur-md" />
        <img
          src="/logo.png"
          alt="FluentUI Icons Like logo"
          class="relative size-[30px] object-contain" />
      </div>
      <div>
        <h1
          class="m-0 font-serif text-[17px] leading-[1.05] text-sidebar-foreground">
          FluentUI Icons Like
        </h1>
        <span
          class="mt-0.5 block text-[11px] leading-tight font-bold text-muted-foreground">
          {iconCount.toLocaleString()}
          icons
        </span>
      </div>
    </div>
    <a
      class="inline-flex h-8 w-full cursor-pointer items-center justify-center gap-1.5 rounded-md border border-sidebar-primary bg-sidebar-primary px-2 text-[11px] font-extrabold text-sidebar-primary-foreground shadow-sm transition-[filter,transform] hover:brightness-110 focus:outline-none focus:ring-3 focus:ring-sidebar-ring/25"
      href="https://github.com/oneo-me/fluentui-icons-like"
      target="_blank"
      rel="noreferrer">
      <span>Getting started</span>
    </a>
  </div>

<section class="min-h-0 pb-1.5">
    <div class="mb-2 flex items-center justify-between gap-2.5">
      <span
        class="text-[11px] font-extrabold tracking-[0.08em] text-muted-foreground uppercase">
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
    class="min-h-0 pt-1 pb-1.5">
    <div class="mb-2 flex items-center justify-between gap-2.5">
      <span
        class="text-[11px] font-extrabold tracking-[0.08em] text-muted-foreground uppercase">
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
    class="flex min-h-0 flex-1 flex-col pt-1">
    <div class="mb-2 flex items-center justify-between gap-2.5">
      <span
        class="text-[11px] font-extrabold tracking-[0.08em] text-muted-foreground uppercase">
        Metaphors
      </span>
    </div>
    <label class="mb-1.5 block">
      <input
        class="h-[30px] w-full min-w-0 rounded-md border border-input bg-background px-2 text-[11px] font-bold text-foreground shadow-xs outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"
        type="search"
        bind:value={metaphorKeyword}
        placeholder="Filter metaphors" />
    </label>
    <div
      class="-mr-2.5 flex min-h-0 flex-1 flex-wrap content-start items-start gap-1 overflow-y-auto pr-2.5 [scrollbar-gutter:stable]">
      <button
        type="button"
        class={`${metaphorChipClass(selectedMetaphor === '')} w-auto max-w-full`}
        onclick={() => onSelectMetaphor('')}>
        All
      </button>
      {#each visibleMetaphors as metaphor}
        <button
          type="button"
          class={`${metaphorChipClass(selectedMetaphor === metaphor)} w-auto max-w-full`}
          title={metaphor}
          onclick={() => onSelectMetaphor(metaphor)}>
          {metaphor}
        </button>
      {/each}
    </div>
  </section>

  <div
    class="mt-1 grid gap-1 pt-1 text-[11px] leading-[1.35] text-muted-foreground">
    <span>
      This project was created by
      <a
        class="font-extrabold text-primary hover:text-accent-foreground hover:underline"
        href="https://oneo.me"
        target="_blank"
        rel="noreferrer">
        ONEO
      </a>
      using
      <a
        class="font-extrabold text-primary hover:text-accent-foreground hover:underline"
        href="https://github.com/microsoft/fluentui-system-icons"
        target="_blank"
        rel="noreferrer">
        fluentui-system-icons
      </a>
    </span>
  </div>
</aside>
