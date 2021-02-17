<script>
  import Metamask from "./metamask.svelte";
  import { signer } from "./metamask.mjs";

  const truncateAddress = (_address) => (_address ? _address.substr(0, 6) + "..." + _address.substring(_address.length - 4, _address.length) : "");
</script>

<div href="#" class="headerbutton w-inline-block">
  <div class="frostedglasswrapper left">
    <div class="frostedglasseffect notfixed" />
    <div class="blockcontents">
      {#if $signer}
        <div id="identiconAddressImage" class="buttondisk fs-account-icon-wrapper">
          <img src="images/account_icon.svg" loading="lazy" id="platformLogo" alt="" class="placeholderimage {$signer ? 'address-icon' : 'no-address-icon'}" />
        </div>
      {/if}
      <div id="userAddressSet" class="textdarkmode">
        {#if $signer !== ""}
          <span>{truncateAddress($signer.toString())}</span>
        {:else}
          <span class="connect-text">Connect wallet</span>
        {/if}
      </div>
    </div>
  </div>
</div>

<Metamask />

<style>
  .connect-text {
    cursor: pointer;
  }

  .fs-account-icon-wrapper {
    display: flex;
    justify-content: center;
  }
  .address-icon {
    width: 80%;
  }

  .no-address-icon {
    opacity: 0;
  }
</style>
