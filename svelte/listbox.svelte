<script>
  export let value;
  export let address;
  export let addresses;
</script>

<select bind:value>
  <option value="">Select address</option>
  {#if addresses && addresses.length > 0}
    {#each addresses as adr}
      <option value={adr}>{adr}</option>
    {/each}
  {/if}
</select>
