<script>
  import { icons } from "./iconsStores.js";
  import Icon from "./Icon.svelte";
</script>

<div class="flex flex-wrap">
  {#each $icons as icon}
    <div class="border-1 rounded-1">
      <div>
        <Icon key={icon.key} value={icon.value} />
      </div>
      <div>{icon.key}</div>
    </div>
  {/each}
</div>
