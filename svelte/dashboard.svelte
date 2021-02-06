<script>
  import { ethers, BigNumber } from "ethers";
  import { onMount } from "svelte";
  import aaveDashboard from "../lib/aaveDashboard.mjs";
  import { Dashboards } from "./stores.mjs";
  import ListBox from "./listbox.svelte";

  function getTokenLogo(symbol) {
    let ret = "/images/no_logo.svg";

    const coins = ["sUSD", "USDT",  "USDC", "BUSD", "AAVE", "BAT", "DAI", "USZDC", "SNX", "YFI"];
    for (const coin of coins) {
      if (symbol.includes(coin)) ret = `/images/${coin}_logo.svg`;
    }
    return ret;
  }

  export let name;
  export let address;
  export let refresh = 0;

  const chekboxDefault = false;

  function _bal(_balance, _decimals = 18, _precision = 3) {
    const [ent, dec] = ethers.utils.formatUnits(_balance, _decimals).split(".");
    return ent + "." + dec.substring(0, _precision);
  }
  function _hf(_healthFactor) {
    let ret;
    if (_healthFactor === "_" || _healthFactor === "∞") {
      ret = _healthFactor;
    } else {
      const hf = _bal(_healthFactor);
      const bhf = BigNumber.from(_healthFactor);
      let warning = "";
      if (bhf.eq(0)) {
        warning = "***";
      } else if (bhf.lt(BigNumber.from(10).pow(17).mul(8))) {
        warning = "**";
      } else if (bhf.lt(BigNumber.from(10).pow(17).mul(12))) {
        ret = "*";
      }
      ret = warning + hf + warning;
    }
    return ret;
  }

  let healthFactorAll = 0;
  let healthFactorChecked = 0;
  let healthFactorUnchecked = 0;

  $: currentDashboard = getDashboard(address);

  async function getDashboard(_address, _force = false) {
    if (_address) {
      const oldDashboard = $Dashboards[_address];

      if (_force || !oldDashboard) {
        const _provider = new ethers.providers.Web3Provider(window.ethereum);
        $Dashboards[_address] = await aaveDashboard.getUserData(_address, _provider, true);
      }
      if (oldDashboard) {
        for (const position of oldDashboard.tokens) {
          setChecked(position.symbol, position.checked);
        }
      } else {
        for (const position of $Dashboards[_address].tokens) {
          setChecked(position.symbol, chekboxDefault);
        }
      }
      handleHealthFactor();
      refresh++;
    }
    console.log("getDashboard", _address, _force, "=>", $Dashboards[_address]);
    return $Dashboards[_address];
  }
  async function handleHealthFactor() {
    healthFactorAll = (await aaveDashboard.getRiskParameters($Dashboards[address].tokens, 0)).healthFactor;
    healthFactorChecked = (await aaveDashboard.getRiskParameters($Dashboards[address].tokens, 1)).healthFactor;
    healthFactorUnchecked = (await aaveDashboard.getRiskParameters($Dashboards[address].tokens, 2)).healthFactor;
  }

  function setChecked(_symbol, _checked) {
    const idToken = $Dashboards[address].tokens.findIndex((db) => db.symbol == _symbol);
    if (idToken >= 0) $Dashboards[address].tokens[idToken].checked = _checked;
    refresh++;
  }
  function handleCheck(_event) {
    setChecked(_event.target.value, _event.target.checked);
    handleHealthFactor();
  }

  onMount(async function () {
    getDashboard(address, true);
  });
</script>

<main>
  {#key refresh}
    <div id="OriginPosition" class="fs-col-origin columnposition w-col w-col-6 w-col-stack w-col-small-small-stack" style="min-height: 220px;">
      <div class="columntitlebar reverse">
        <h2 id="columnTitle">{name}</h2>
        <ListBox bind:value={address} options={Object.keys($Dashboards)} />
        <!-- <img
          src="images/Network-Dot-Green.svg"
          loading="lazy"
          width="50"
          alt=""
          class="connectindicator"
        /> -->
      </div>

      {#await currentDashboard}
        <p style="text-align: center;">loading</p>
      {:then dashboard}
        {#if dashboard}
          <div id="gridOrigin" class="w-layout-grid gridorigin fs-grid-dashboard">
            <h3 class="left">Your Deposits</h3>
            <h3 class="right">Your Loans</h3>
            {#if dashboard.tokens.length > 0}
              <div class="fs-item-container">
                {#each dashboard.tokens as item}
                  {#if item.type == 0}
                    <div
                      class:checked={item.checked}
                      class:fs-dashboard-item__origin={name == "Origin"}
                      class="deposititem fs-deposit-item"
                      on:click={() => name == "Origin" && setChecked(item.symbol, !item.checked)}
                      value={item.symbol}
                      checked={item.checked}
                    >
                      <div class="tokendetails">
                        <div id="platformAddressLogo" class="buttondisk fs-buttondisk">
                          <img src={getTokenLogo(item.symbol)} loading="lazy" id="tokenLogoDep01ORG" alt="" class="placeholderimage" />
                        </div>
                        <div id="tokenSymbolDep01ORG" class="textlightmode label">
                          {item.symbol}
                        </div>
                      </div>
                      <div class="readonlyfield">
                        <div id="amountDep01ORG" class="textlightmode numbers">
                          {_bal(item.amount, item.decimals)}
                        </div>
                      </div>
                      {#if name == "Origin"}
                        <div class="fs-checkmark">
                          {#if item.checked}
                            <img src="/images/checked_purple.svg" loading="lazy" alt="" />
                          {:else}
                            <img src="/images/unchecked_purple.svg" loading="lazy" alt="" />
                          {/if}
                        </div>
                      {/if}
                    </div>
                  {/if}
                {/each}
              </div>

              <div class="fs-item-container">
                {#each dashboard.tokens as item}
                  {#if item.type > 0}
                    <div
                      class:checked={item.checked}
                      class:fs-dashboard-item__origin={name === "Origin"}
                      class="loanitem fs-dashboard-item  fs-loan-item"
                      on:click={() => name == "Origin" && setChecked(item.symbol, !item.checked)}
                      value={item.symbol}
                      checked={item.checked}
                    >
                      <div class="tokendetails reverse">
                        <div id="platformAddressLogo" class="buttondisk reverse">
                          <img src={getTokenLogo(item.symbol)} loading="lazy" id="tokenLogoLoan01ORG" alt="" class="placeholderimage" />
                        </div>
                        <div id="tokenSymbolLoan01" class="textlightmode">
                          {item.symbol}
                        </div>
                      </div>
                      <div class="readonlyfield">
                        <div id="amountLoan01ORG" class="textlightmode numbers">
                          {_bal(item.amount, item.decimals)}
                        </div>
                      </div>
                      {#if name == "Origin"}
                        <div class="fs-checkmark">
                          {#if item.checked}
                            <img src="/images/checked_white.svg" loading="lazy" alt="" />
                          {:else}
                            <img src="/images/unchecked_white.svg" loading="lazy" alt="" />
                          {/if}
                        </div>
                      {/if}
                    </div>
                    <div id="APRLoan01ORG" class="ratesinfo w-node-9c5920cd5a3d-3e5b97ee">
                      <div id="tokenSymbolDep01ORG" class="textlightmode rates">
                        {item.type == 2 ? "Variable rate" : "Stable rate"}
                      </div>
                      <!-- <img
                        src="images/Info-Icon.svg"
                        loading="lazy"
                        alt=""
                        class="infroicon"
                      /> -->
                    </div>
                  {/if}
                {/each}
              </div>
            {:else}
              <div>No positions</div>
            {/if}
          </div>
          <div id="healthFactorInfoORG" class="healthfactorinfo">
            <div class="hfcontents origin">
              <p class="textlightmode rates">
                Health Factor : {_hf(healthFactorAll, 18)}
              </p>
            </div>
          </div>
        {/if}
      {:catch error}
        <p style="color: red">{error.message}</p>
      {/await}
      <!-- <div id="clearALL" class="secondarybutton">
        <div on:click={refresh} id="refreshFlashPos" class="textlightmode button">Refresh Dashboard</div>
      </div> -->
    </div>
  {/key}
</main>

<style>
  main {
    width: 100%;
    margin: 0 auto;
    margin-right: 5px;
    margin-left: 5px;
  }
  table {
    width: 100%;
  }
  p.bottom {
    text-align: center;
    vertical-align: bottom;
  }

  .fs-grid-dashboard {
    min-width: 400px;
  }
  .fs-item-container {
    display: flex;
    flex-direction: column;
  }

  .fs-dashboard-item__origin {
    align-items: center;
    cursor: pointer;
  }

  .fs-deposit-item {
    margin-bottom: 24px;
  }

  .fs-deposit-item.checked {
    -webkit-box-shadow: inset 0px 0px 0px 1px #a04bce;
    -moz-box-shadow: inset 0px 0px 0px 1px #a04bce;
    box-shadow: inset 0px 0px 0px 1px #a04bce;
  }
  .fs-loan-item.checked {
    -webkit-box-shadow: inset 0px 0px 0px 1px #969696;
    -moz-box-shadow: inset 0px 0px 0px 1px #969696;
    box-shadow: inset 0px 0px 0px 1px #969696;
  }

  /* overrides */

  .buttondisk {
    flex-shrink: 0;
    height: 42px;
    width: 42px;
  }

  .gridorigin {
    grid-template-rows: auto auto;
  }
  img {
    max-width: 100%;
  }
</style>
