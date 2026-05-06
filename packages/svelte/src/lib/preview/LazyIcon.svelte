<script lang="ts">
  import type { PreviewIconEntry, PreviewIconStyle } from './registry.js';

  let {
    icon,
    size,
    style,
    title = null,
  }: {
    icon: PreviewIconEntry;
    size: number;
    style: PreviewIconStyle;
    title?: string | null;
  } = $props();

  let iconPromise = $derived(icon.load());
</script>

{#await iconPromise then module}
  {@const Comp = module.default}
  <Comp {size} {style} {title} />
{/await}
