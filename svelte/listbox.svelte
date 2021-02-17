<script>
  import Metamask from './metamask.svelte';
  import { signer, addresses } from './metamask.mjs';

  export let address;
  export let exclude;

  $: address && console.log('LISTBOX ADDRESS address', address);
  $: exclude && console.log('LISTBOX ADDRESS exclude', exclude);

  let isDropdownOpen = false;

  const _exclude = (_address) => {
    return _address === exclude || _address === address;
  };
  const isSigner = (_address) => {
    return $signer && _address == $signer;
  };
  const setValue = (_address) => {
    if (_address !== exclude) address = _address;
    console.log('setValue |', exclude, '|', _address, '|', _address !== exclude, '=>', address);
    isDropdownOpen = false;
  };
  const truncateAddress = (_address) => (_address ? _address.substr(0, 12) + '...' + _address.substring(_address.length - 4, _address.length) : '');
</script>

{#key $signer}
  {#key exclude}
      <div data-hover="" data-delay="0" class="adressdropdown w-dropdown" style="z-index: 901;">
        <div
          class="dropdown-toggle addresses w-dropdown-toggle w--open"
          on:click={() => (isDropdownOpen = !isDropdownOpen)}
          id="w-dropdown-toggle-0"
          aria-controls="w-dropdown-list-0"
          aria-haspopup="menu"
          aria-expanded="true"
          role="button"
          tabindex="0"
        >
          <div class="arrow lightmode w-icon-dropdown-toggle" />
          <div id="platformAddressLogo" class="buttondisk">
            <img src="images/assets/aave_logo.svg" loading="lazy" id="platformLogo" alt="" class="placeholderimage" />
          </div>
          <div id="chosenAddressORG" class="textlightmode">
            {address && address != '-' ? truncateAddress(address) : 'Select address'}
          </div>
        </div>
        <nav class:w--open={isDropdownOpen} class="dropdown-list w-dropdown-list" id="w-dropdown-list-0" aria-labelledby="w-dropdown-toggle-0">
          {#each $addresses as addr, i}
            {#if _exclude(addr)}
              <div id="accItem-{i + 1}" class="dropdownitemexclude w-dropdown-link">
                {truncateAddress(addr)}
                {#if isSigner(addr)}*{/if}
              </div>
            {:else}
              <div on:click={() => setValue(addr)} id="accItem-{i + 1}" class="dropdownitem w-dropdown-link" style="cursor: pointer;" tabindex="0">
                {truncateAddress(addr)}
                {#if isSigner(addr)}*{/if}
              </div>
            {/if}
          {/each}
          <div on:click={() => setValue('-')} href="#" id="accItem-0" class="dropdownitem w-dropdown-link" style="cursor: pointer;" tabindex="0">-</div>
        </nav>
        <Metamask />

      </div>
  {/key}
{/key}

<style>
  .dropdown-list {
    border-radius: 10px;
  }

  .buttondisk {
    flex-shrink: 0;
    height: 42px;
    width: 42px;
  }
  .dropdownitemexclude {
    color: #ccc;
  }
</style>
