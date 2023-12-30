<script>
  /**
   * @type {string}
   */
  export let key;

  /**
   * @type {any}
   */
  export let value;

  function handleClick() {
    navigator.clipboard.writeText(key);
  }
</script>

<svelte:component this={value} on:click={handleClick} size="45" />
