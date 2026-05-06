<script lang="ts">
  import ArrowDownloadIcon from '$lib/icons/FluentIconArrowDownload.svelte';
  import CodeIcon from '$lib/icons/FluentIconCode.svelte';
  import CopyIcon from '$lib/icons/FluentIconCopy.svelte';
  import ImageIcon from '$lib/icons/FluentIconImage.svelte';
  import LazyIcon from './LazyIcon.svelte';
  import type { PreviewIconEntry, PreviewIconStyle } from './registry.js';

  let {
    selectedIcon,
    selectedSize,
    selectedStyle,
    selectedColor,
  }: {
    selectedIcon: PreviewIconEntry | null;
    selectedSize: number;
    selectedStyle: PreviewIconStyle;
    selectedColor: string;
  } = $props();

  const detailRow = 'grid gap-1 py-1.5';
  const detailLabel =
    'text-[11px] font-extrabold tracking-[0.08em] text-muted-foreground uppercase';
  const detailValue =
    'm-0 min-w-0 text-xs leading-[1.45] break-words text-card-foreground';
  const tagClass =
    'max-w-full overflow-hidden rounded-full border border-border bg-secondary px-2 py-0.5 text-[10px] text-ellipsis whitespace-nowrap text-secondary-foreground';
  const copyButtonClass =
    'copy-button inline-flex size-7 flex-none cursor-pointer items-center justify-center rounded-md bg-transparent p-0 text-[11px] font-extrabold text-card-foreground transition-[background-color,color,box-shadow] hover:bg-accent hover:text-accent-foreground';
  const actionButtonClass =
    'copy-button inline-flex h-9 min-w-0 cursor-pointer items-center justify-center gap-1.5 rounded-none border-0 bg-transparent px-0 text-[11px] font-extrabold text-card-foreground transition-[background-color,color] hover:bg-accent hover:text-accent-foreground';
  const snippetCodeClass =
    'm-0 min-w-0 flex-1 rounded border border-border/60 bg-secondary/50 px-2 py-1 font-mono text-[11px] leading-[1.55] [overflow-wrap:anywhere] text-card-foreground';
  const snippetButtonClass =
    'copy-button inline-flex size-7 flex-none cursor-pointer items-center justify-center self-start rounded-md bg-transparent p-0 text-[11px] font-extrabold text-card-foreground transition-[background-color,color,box-shadow] hover:bg-accent hover:text-accent-foreground';

  type SnippetId = 'svelte-import' | 'svelte' | 'avalonia';

  const SVELTE_DEFAULT_SIZE = 20;
  const SVELTE_DEFAULT_STYLE: PreviewIconStyle = 'Regular';
  const AVALONIA_DEFAULT_SIZE = 24;
  const AVALONIA_DEFAULT_STYLE: PreviewIconStyle = 'Regular';

  let copiedKey = $state('');
  let copiedKeyPulse = $state(0);
  let copiedKeyTimeout: ReturnType<typeof window.setTimeout> | undefined;
  let copiedName = $state('');
  let copiedNamePulse = $state(0);
  let copiedNameTimeout: ReturnType<typeof window.setTimeout> | undefined;
  let copiedSvg = $state(false);
  let copiedSvgPulse = $state(0);
  let copiedSvgTimeout: ReturnType<typeof window.setTimeout> | undefined;
  let copiedSnippet = $state<SnippetId | ''>('');
  let copiedSnippetPulse = $state(0);
  let copiedSnippetTimeout: ReturnType<typeof window.setTimeout> | undefined;
  let sourcePreviewEl = $state<HTMLDivElement | null>(null);

  let componentName = $derived(
    selectedIcon ? `FluentIcon${selectedIcon.key.replace(/_/g, '')}` : '',
  );
  let avaloniaSymbol = $derived(
    selectedIcon ? selectedIcon.key.replace(/_/g, '') : '',
  );
  let avaloniaSymbolKey = $derived(
    avaloniaSymbol ? `FluentIconSymbol.${avaloniaSymbol}` : '',
  );
  let svelteImportSnippet = $derived(
    selectedIcon
      ? `import ${componentName} from '@oneo/fluentui-icons-like/${componentName}.svelte';`
      : '',
  );
  let svelteIconSnippet = $derived(
    selectedIcon ? buildSvelteIconSnippet() : '',
  );
  let avaloniaIconSnippet = $derived(
    selectedIcon ? buildAvaloniaIconSnippet() : '',
  );

  function buildSvelteIconSnippet() {
    const attrs: string[] = [];
    if (selectedSize !== SVELTE_DEFAULT_SIZE)
      attrs.push(`size={${selectedSize}}`);
    if (selectedStyle !== SVELTE_DEFAULT_STYLE)
      attrs.push(`style='${selectedStyle}'`);
    const suffix = attrs.length ? ` ${attrs.join(' ')}` : '';
    return `<${componentName}${suffix} />`;
  }

  function buildAvaloniaIconSnippet() {
    const attrs = [`Symbol="${avaloniaSymbol}"`];
    if (selectedSize !== AVALONIA_DEFAULT_SIZE)
      attrs.push(`Size="Size${selectedSize}"`);
    if (selectedStyle !== AVALONIA_DEFAULT_STYLE)
      attrs.push(`Style="${selectedStyle}"`);
    return `<icons:FluentIcon ${attrs.join(' ')} />`;
  }

  function copySnippet(id: SnippetId, snippet: string) {
    if (!snippet) return;

    copiedSnippet = id;
    copiedSnippetPulse += 1;
    window.clearTimeout(copiedSnippetTimeout);
    copiedSnippetTimeout = window.setTimeout(() => {
      if (copiedSnippet === id) copiedSnippet = '';
    }, 420);
    void navigator.clipboard.writeText(snippet).catch(() => undefined);
  }

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

  function getFilename(extension: 'svg' | 'png') {
    const name = selectedIcon?.key ?? 'icon';
    return `${name}_${selectedSize}_${selectedStyle.toLowerCase()}.${extension}`;
  }

  function getSvgCode() {
    const svg = sourcePreviewEl?.querySelector('svg');
    if (!svg) return '';

    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.setAttribute('width', String(selectedSize));
    clone.setAttribute('height', String(selectedSize));
    clone.setAttribute('color', selectedColor);
    clone.style.cssText = `color: ${selectedColor}`;

    return new XMLSerializer().serializeToString(clone);
  }

  function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  function downloadSvg() {
    const svgCode = getSvgCode();
    if (!svgCode) return;

    downloadBlob(
      new Blob([svgCode], { type: 'image/svg+xml;charset=utf-8' }),
      getFilename('svg'),
    );
  }

  async function downloadPng() {
    const svgCode = getSvgCode();
    if (!svgCode) return;

    const exportSize = Math.max(256, selectedSize * 8);
    const blob = new Blob([svgCode], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const image = new Image();

    try {
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error('Unable to render icon image'));
        image.src = url;
      });

      const canvas = document.createElement('canvas');
      canvas.width = exportSize;
      canvas.height = exportSize;

      const context = canvas.getContext('2d');
      if (!context) return;

      context.clearRect(0, 0, exportSize, exportSize);
      context.drawImage(image, 0, 0, exportSize, exportSize);

      canvas.toBlob((pngBlob) => {
        if (pngBlob) downloadBlob(pngBlob, getFilename('png'));
      }, 'image/png');
    } catch {
      return;
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  function copySvgCode() {
    const svgCode = getSvgCode();
    if (!svgCode) return;

    copiedSvg = true;
    copiedSvgPulse += 1;
    window.clearTimeout(copiedSvgTimeout);
    copiedSvgTimeout = window.setTimeout(() => {
      copiedSvg = false;
    }, 420);
    void navigator.clipboard.writeText(svgCode).catch(() => undefined);
  }
</script>

<aside
  class="overflow-y-auto border-l border-border bg-card/90 py-3 text-card-foreground backdrop-blur-sm"
  aria-label="Selected icon details">
  {#if selectedIcon}
    <dl class="m-0 grid">
      <div class="grid -mt-3">
        <dt class="sr-only">Preview</dt>
        <dd class="m-0 min-w-0" aria-label="Preview">
          <div
            class="grid overflow-hidden border-b border-border shadow-inner"
            style="color: {selectedColor}">
            <div
              class="preview-grid grid aspect-square w-full place-items-center bg-background">
              <LazyIcon
                icon={selectedIcon}
                size={120}
                style={selectedStyle}
                title={selectedIcon.name} />
            </div>
            <div class="grid grid-cols-3 gap-0 border-t border-border/80">
              <button
                type="button"
                class={actionButtonClass}
                aria-label="Download SVG"
                title="Download SVG"
                onclick={downloadSvg}>
                <ArrowDownloadIcon
                  size={16}
                  style={selectedStyle}
                  title={null} />
                <span>SVG</span>
              </button>
              <button
                type="button"
                class={`${actionButtonClass} border-x border-border/70`}
                aria-label="Download PNG"
                title="Download PNG"
                onclick={downloadPng}>
                <ImageIcon size={16} style={selectedStyle} title={null} />
                <span>PNG</span>
              </button>
              <button
                type="button"
                class={actionButtonClass}
                data-copied={copiedSvg}
                data-copy-pulse={copiedSvgPulse % 2 === 0 ? "even" : "odd"}
                aria-label="Copy SVG code"
                title={copiedSvg ? "Copied" : "Copy SVG code"}
                onclick={copySvgCode}>
                {#if copiedSvg}
                  <CopyIcon size={16} style={selectedStyle} title={null} />
                {:else}
                  <CodeIcon size={16} style={selectedStyle} title={null} />
                {/if}
                <span>Code</span>
              </button>
            </div>
          </div>
          <div
            class="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0"
            aria-hidden="true"
            bind:this={sourcePreviewEl}
            style="color: {selectedColor}">
            <LazyIcon
              icon={selectedIcon}
              size={selectedSize}
              style={selectedStyle}
              title={selectedIcon.name} />
          </div>
        </dd>
      </div>
      <div class={`${detailRow} px-2`}>
        <dt class={detailLabel}>Name</dt>
        <dd
          class="m-0 flex min-w-0 items-center justify-between gap-2 text-xs leading-7 text-card-foreground">
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
      <div class={`${detailRow} px-2`}>
        <dt class={detailLabel}>Svelte import</dt>
        <dd
          class="m-0 flex min-w-0 items-start justify-between gap-2 text-card-foreground">
          <code class={snippetCodeClass}>{svelteImportSnippet}</code>
          <button
            type="button"
            class={snippetButtonClass}
            data-copied={copiedSnippet === "svelte-import"}
            data-copy-pulse={copiedSnippetPulse % 2 === 0 ? "even" : "odd"}
            aria-label="Copy Svelte import"
            title={copiedSnippet === "svelte-import"
              ? "Copied"
              : "Copy Svelte import"}
            onclick={() => copySnippet("svelte-import", svelteImportSnippet)}>
            <CopyIcon size={16} style={selectedStyle} title={null} />
          </button>
        </dd>
      </div>
      <div class={`${detailRow} px-2`}>
        <dt class={detailLabel}>Svelte</dt>
        <dd
          class="m-0 flex min-w-0 items-start justify-between gap-2 text-card-foreground">
          <code class={snippetCodeClass}>{svelteIconSnippet}</code>
          <button
            type="button"
            class={snippetButtonClass}
            data-copied={copiedSnippet === "svelte"}
            data-copy-pulse={copiedSnippetPulse % 2 === 0 ? "even" : "odd"}
            aria-label="Copy Svelte component"
            title={copiedSnippet === "svelte"
              ? "Copied"
              : "Copy Svelte component"}
            onclick={() => copySnippet("svelte", svelteIconSnippet)}>
            <CopyIcon size={16} style={selectedStyle} title={null} />
          </button>
        </dd>
      </div>
      <div class={`${detailRow} px-2`}>
        <dt class={detailLabel}>Avalonia key</dt>
        <dd
          class="m-0 flex min-w-0 items-start justify-between gap-2 text-card-foreground">
          <code class={snippetCodeClass}>{avaloniaSymbolKey}</code>
          <button
            type="button"
            class={snippetButtonClass}
            data-copied={copiedKey === avaloniaSymbolKey}
            data-copy-pulse={copiedKeyPulse % 2 === 0 ? "even" : "odd"}
            aria-label="Copy Avalonia key"
            title={copiedKey === avaloniaSymbolKey
              ? "Copied"
              : "Copy Avalonia key"}
            onclick={() => copyKey(avaloniaSymbolKey)}>
            <CopyIcon size={16} style={selectedStyle} title={null} />
          </button>
        </dd>
      </div>
      <div class={`${detailRow} px-2`}>
        <dt class={detailLabel}>Avalonia</dt>
        <dd
          class="m-0 flex min-w-0 items-start justify-between gap-2 text-card-foreground">
          <code class={snippetCodeClass}>{avaloniaIconSnippet}</code>
          <button
            type="button"
            class={snippetButtonClass}
            data-copied={copiedSnippet === "avalonia"}
            data-copy-pulse={copiedSnippetPulse % 2 === 0 ? "even" : "odd"}
            aria-label="Copy Avalonia XAML"
            title={copiedSnippet === "avalonia"
              ? "Copied"
              : "Copy Avalonia XAML"}
            onclick={() => copySnippet("avalonia", avaloniaIconSnippet)}>
            <CopyIcon size={16} style={selectedStyle} title={null} />
          </button>
        </dd>
      </div>
      <div class={`${detailRow} px-2`}>
        <dt class={detailLabel}>Description</dt>
        <dd class={detailValue}>
          {selectedIcon.description || "No description"}
        </dd>
      </div>
      <div class={`${detailRow} px-2`}>
        <dt class={detailLabel}>Keyword</dt>
        <dd class="m-0 flex min-w-0 flex-wrap gap-1">
          {#each splitKeywords(selectedIcon.keyword) as keyword}
            <span class={tagClass}> {keyword} </span>
          {/each}
        </dd>
      </div>
      <div class={`${detailRow} px-2`}>
        <dt class={detailLabel}>Metaphors</dt>
        <dd class="m-0 flex min-w-0 flex-wrap gap-1">
          {#each selectedIcon.metaphor as tag}
            <span class={tagClass}> {tag} </span>
          {/each}
        </dd>
      </div>
      <div class={`${detailRow} px-2`}>
        <dt class={detailLabel}>Styles</dt>
        <dd class="m-0 flex min-w-0 flex-wrap gap-1">
          {#each selectedIcon.styles as style}
            <span class={tagClass}> {style} </span>
          {/each}
        </dd>
      </div>
      <div class={`${detailRow} px-2`}>
        <dt class={detailLabel}>Sizes</dt>
        <dd class="m-0 flex min-w-0 flex-wrap gap-1">
          {#each selectedIcon.sizes as size}
            <span class={tagClass}> {size}px </span>
          {/each}
        </dd>
      </div>
    </dl>
  {:else}
    <div
      class="grid min-h-[220px] place-items-center content-center gap-2 text-center text-muted-foreground">
      <strong class="font-serif text-xl text-foreground">Select an icon</strong>
      <span>Details appear here.</span>
    </div>
  {/if}
</aside>

<style>
  .preview-grid {
    background-image:
      linear-gradient(
        90deg,
        color-mix(in oklab, var(--color-primary) 10%, transparent) 1px,
        transparent 1px
      ),
      linear-gradient(
        color-mix(in oklab, var(--color-primary) 10%, transparent) 1px,
        transparent 1px
      );
    background-position: 4px 4px;
    background-size: 16px 16px;
  }

  .copy-button[data-copied='true'] {
    background-color: color-mix(
      in oklab,
      var(--color-primary) 12%,
      var(--color-card)
    );
    color: var(--color-primary);
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
      box-shadow: 0 0 0 0
        color-mix(in oklab, var(--color-primary) 34%, transparent);
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
      box-shadow: 0 0 0 0
        color-mix(in oklab, var(--color-primary) 34%, transparent);
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

  :global(.dark) {
    .preview-grid {
      background-image:
        linear-gradient(
          90deg,
          color-mix(in oklab, var(--color-primary) 18%, transparent) 1px,
          transparent 1px
        ),
        linear-gradient(
          color-mix(in oklab, var(--color-primary) 18%, transparent) 1px,
          transparent 1px
        );
    }

    .copy-button[data-copied='true'] {
      background-color: color-mix(
        in oklab,
        var(--color-primary) 18%,
        var(--color-card)
      );
      color: var(--color-primary);
    }
  }
</style>
