<script>
  import { icons } from "./iconsStores.js";
  import IconGallery from "./IconGallery.svelte";

  let keyword = "";

  function onInput() {
    icons.search(keyword);
  }
</script>

<input type="text" placeholder="Search..." bind:value={keyword} on:input={onInput} />

<IconGallery />
