<script>
  export let label = "";
  export let value;
  export let options;
</script>

<div data-hover="" data-delay="0" class="adressdropdown w-dropdown">
  <div class="dropdown-toggle addresses w-dropdown-toggle">
    <div class="arrow lightmode w-icon-dropdown-toggle" />
    <div id="platformAddressLogo" class="buttondisk">
      <img src="https://d3e54v103j8qbb.cloudfront.net/plugins/Basic/assets/placeholder.60f9b1840c.svg" loading="lazy" id="platformLogo" alt="" class="placeholderimage" />
    </div>

    <select bind:value>
        <option value=""  id="chosenAddressDEST" class="textlightmode">Select address</option>
        {#if options && options.length > 0}
          {#each options as m}
            <option value={m}>{m.substring(0,12)}...</option>
          {/each}
        {/if}
      </select>

    </div>
</div>
