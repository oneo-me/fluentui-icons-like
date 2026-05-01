<script lang="ts">
  import CopyIcon from '$lib/icons/Copy.svelte';
  import type { IconEntry, IconStyle } from '$lib/index.js';

  let {
    selectedIcon,
    selectedStyle,
  }: {
    selectedIcon: IconEntry | null;
    selectedStyle: IconStyle;
  } = $props();

  const detailRow =
    'grid gap-1.5 border-b border-slate-900/10 py-2 dark:border-zinc-100/10';
  const detailLabel =
    'text-[11px] font-extrabold tracking-[0.08em] text-slate-500 uppercase dark:text-zinc-400';
  const detailValue =
    'm-0 min-w-0 text-xs leading-[1.45] break-words text-slate-950 dark:text-zinc-100';
  const tagClass =
    'max-w-full overflow-hidden rounded-full bg-teal-50 px-2 py-0.5 text-[10px] text-ellipsis whitespace-nowrap text-teal-900 dark:bg-teal-950/60 dark:text-teal-100';
  const copyButtonClass =
    'copy-button inline-flex size-7 flex-none cursor-pointer items-center justify-center rounded-md bg-transparent p-0 text-[11px] font-extrabold text-slate-950 transition-colors hover:bg-teal-50 hover:text-teal-900 dark:text-zinc-100 dark:hover:bg-teal-950/60 dark:hover:text-teal-200';

  let copiedKey = $state('');
  let copiedKeyPulse = $state(0);
  let copiedKeyTimeout: ReturnType<typeof window.setTimeout> | undefined;
  let copiedName = $state('');
  let copiedNamePulse = $state(0);
  let copiedNameTimeout: ReturnType<typeof window.setTimeout> | undefined;

  function splitKeywords(keyword: string) {
    return keyword
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
  }

  function copyKey(key: string) {
    copiedKey = key;
    copiedKeyPulse += 1;
    window.clearTimeout(copiedKeyTimeout);
    copiedKeyTimeout = window.setTimeout(() => {
      if (copiedKey === key) copiedKey = '';
    }, 420);
    void navigator.clipboard.writeText(key).catch(() => undefined);
  }

  function copyName(name: string) {
    copiedName = name;
    copiedNamePulse += 1;
    window.clearTimeout(copiedNameTimeout);
    copiedNameTimeout = window.setTimeout(() => {
      if (copiedName === name) copiedName = '';
    }, 420);
    void navigator.clipboard.writeText(name).catch(() => undefined);
  }
</script>

<aside
  class="overflow-y-auto border-l border-slate-900/10 bg-stone-50/75 px-2 py-3 max-[1120px]:hidden dark:border-zinc-100/10 dark:bg-zinc-900/75"
  aria-label="Selected icon details">
  {#if selectedIcon}
    {@const DetailComp = selectedIcon.value}
    <dl class="m-0 grid">
      <div class="grid p-2">
        <dt class="sr-only">Preview</dt>
        <dd class="m-0 min-w-0" aria-label="Preview">
          <div
            class="preview-grid grid aspect-square w-full place-items-center rounded-lg border border-stone-300 bg-white text-teal-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-teal-200">
            <DetailComp
              size={120}
              style={selectedStyle}
              title={selectedIcon.name} />
          </div>
        </dd>
      </div>
      <div class={detailRow}>
        <dt class={detailLabel}>Key</dt>
        <dd
          class="m-0 flex min-w-0 items-center justify-between gap-2 text-xs leading-7 text-slate-950 dark:text-zinc-100">
          <span class="min-w-0 [overflow-wrap:anywhere]"
            >{selectedIcon.key}</span
          >
          <button
            type="button"
            class={copyButtonClass}
            data-copied={copiedKey === selectedIcon.key}
            data-copy-pulse={copiedKeyPulse % 2 === 0 ? "even" : "odd"}
            aria-label="Copy key"
            title={copiedKey === selectedIcon.key ? "Copied" : "Copy key"}
            onclick={() => copyKey(selectedIcon.key)}>
            <CopyIcon size={16} style={selectedStyle} title={null} />
          </button>
        </dd>
      </div>
      <div class={detailRow}>
        <dt class={detailLabel}>Name</dt>
        <dd
          class="m-0 flex min-w-0 items-center justify-between gap-2 text-xs leading-7 text-slate-950 dark:text-zinc-100">
          <span class="min-w-0 [overflow-wrap:anywhere]"
            >{selectedIcon.name}</span
          >
          <button
            type="button"
            class={copyButtonClass}
            data-copied={copiedName === selectedIcon.name}
            data-copy-pulse={copiedNamePulse % 2 === 0 ? "even" : "odd"}
            aria-label="Copy name"
            title={copiedName === selectedIcon.name ? "Copied" : "Copy name"}
            onclick={() => copyName(selectedIcon.name)}>
            <CopyIcon size={16} style={selectedStyle} title={null} />
          </button>
        </dd>
      </div>
      <div class={detailRow}>
        <dt class={detailLabel}>Description</dt>
        <dd class={detailValue}>
          {selectedIcon.description || "No description"}
        </dd>
      </div>
      <div class={detailRow}>
        <dt class={detailLabel}>Keyword</dt>
        <dd class="m-0 flex min-w-0 flex-wrap gap-1">
          {#each splitKeywords(selectedIcon.keyword) as keyword}
            <span class={tagClass}>
              {keyword}
            </span>
          {/each}
        </dd>
      </div>
      <div class={detailRow}>
        <dt class={detailLabel}>Metaphors</dt>
        <dd class="m-0 flex min-w-0 flex-wrap gap-1">
          {#each selectedIcon.metaphor as tag}
            <span class={tagClass}>
              {tag}
            </span>
          {/each}
        </dd>
      </div>
      <div class={detailRow}>
        <dt class={detailLabel}>Styles</dt>
        <dd class="m-0 flex min-w-0 flex-wrap gap-1">
          {#each selectedIcon.styles as style}
            <span class={tagClass}>
              {style}
            </span>
          {/each}
        </dd>
      </div>
      <div class={detailRow}>
        <dt class={detailLabel}>Sizes</dt>
        <dd class="m-0 flex min-w-0 flex-wrap gap-1">
          {#each selectedIcon.sizes as size}
            <span class={tagClass}>
              {size}px
            </span>
          {/each}
        </dd>
      </div>
    </dl>
  {:else}
    <div
      class="grid min-h-[220px] place-items-center content-center gap-2 text-center text-slate-500 dark:text-zinc-400">
      <strong class="font-serif text-xl text-slate-950 dark:text-zinc-100">Select an icon</strong>
      <span>Details appear here.</span>
    </div>
  {/if}
</aside>

<style>
  .preview-grid {
    background-image:
      linear-gradient(
        90deg,
        color-mix(in oklab, var(--color-teal-700) 12%, transparent) 1px,
        transparent 1px
      ),
      linear-gradient(
        color-mix(in oklab, var(--color-teal-700) 12%, transparent) 1px,
        transparent 1px
      );
    background-position: 4px 4px;
    background-size: 16px 16px;
  }

  .copy-button[data-copied='true'] {
    background-color: var(--color-teal-50);
    color: var(--color-teal-800);
  }

  .copy-button[data-copied='true'][data-copy-pulse='even'] {
    animation: copy-pop-even 420ms ease-out;
  }

  .copy-button[data-copied='true'][data-copy-pulse='odd'] {
    animation: copy-pop-odd 420ms ease-out;
  }

  .copy-button[data-copied='true'][data-copy-pulse='even'] :global(svg) {
    animation: copy-icon-pop-even 420ms ease-out;
  }

  .copy-button[data-copied='true'][data-copy-pulse='odd'] :global(svg) {
    animation: copy-icon-pop-odd 420ms ease-out;
  }

  @keyframes copy-pop-even {
    0% {
      box-shadow: 0 0 0 0 color-mix(in oklab, var(--color-teal-500) 34%, transparent);
      transform: scale(1);
    }
    42% {
      box-shadow: 0 0 0 6px transparent;
      transform: scale(1.08);
    }
    100% {
      box-shadow: 0 0 0 0 transparent;
      transform: scale(1);
    }
  }

  @keyframes copy-pop-odd {
    0% {
      box-shadow: 0 0 0 0 color-mix(in oklab, var(--color-teal-500) 34%, transparent);
      transform: scale(1);
    }
    42% {
      box-shadow: 0 0 0 6px transparent;
      transform: scale(1.08);
    }
    100% {
      box-shadow: 0 0 0 0 transparent;
      transform: scale(1);
    }
  }

  @keyframes copy-icon-pop-even {
    0% {
      transform: scale(1) rotate(0deg);
    }
    42% {
      transform: scale(0.86) rotate(-8deg);
    }
    100% {
      transform: scale(1) rotate(0deg);
    }
  }

  @keyframes copy-icon-pop-odd {
    0% {
      transform: scale(1) rotate(0deg);
    }
    42% {
      transform: scale(0.86) rotate(-8deg);
    }
    100% {
      transform: scale(1) rotate(0deg);
    }
  }

  @media (prefers-color-scheme: dark) {
    .preview-grid {
      background-image:
        linear-gradient(
          90deg,
          color-mix(in oklab, var(--color-teal-300) 16%, transparent) 1px,
          transparent 1px
        ),
        linear-gradient(
          color-mix(in oklab, var(--color-teal-300) 16%, transparent) 1px,
          transparent 1px
        );
    }

    .copy-button[data-copied='true'] {
      background-color: color-mix(in oklab, var(--color-teal-950) 60%, transparent);
      color: var(--color-teal-200);
    }
  }
</style>
