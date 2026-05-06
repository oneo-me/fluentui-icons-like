<script lang="ts">
  import type { IconStyle } from '$lib/index.js';
  import type { PreviewIconEntry } from './registry.js';

  let {
    icon,
    size,
    style,
    title = null,
  }: {
    icon: PreviewIconEntry;
    size: number;
    style: IconStyle;
    title?: string | null;
  } = $props();

  let iconPromise = $derived(icon.load());
</script>

{#await iconPromise then module}
  {@const Comp = module.default}
  <Comp {size} {style} {title} />
{/await}
