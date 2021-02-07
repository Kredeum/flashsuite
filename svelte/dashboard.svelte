<script>
  import { ethers, BigNumber } from "ethers";
  import aaveDashboard from "../lib/aaveDashboard.mjs";
  import { Dashboards } from "./stores.mjs";
  import ListBox from "./listbox.svelte";

  export let address;
  export let origin;

  export let ribbonMessage = "";
  export let reget = 0;
  export let refresh = 0;
  export let name = "";

  const chekboxDefault = false;
  let healthFactor = "_";
  let healthFactorUnchecked = "_";
  export let healthFactorChecked = "_";
  export let healthFactorNext = "_";

  $: address && getDashboard();
  $: reget && handleReGet();

  function getTokenLogo(symbol) {
    let ret = "images/no_logo.svg";

    const coins = [
      "DAI",
      "USDC",
      "TUSD",
      "USDT",
      "sUSD",
      "BUSD",
      "ETH",
      "AAVE",
      "LEND",
      "UNI",
      "YFI",
      "BAT",
      "REN",
      "REP",
      "ENJ",
      "KNC",
      "LINK",
      "MANA",
      "MKR",
      "SNX",
      "WBTC",
      "ZRX",
    ];
    for (const coin of coins) {
      if (symbol.includes(coin)) ret = `images/${coin.toLowerCase()}_logo.svg`;
    }
    return ret;
  }
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
        warning = "⛔";
      } else if (bhf.lt(BigNumber.from(10).pow(17).mul(8))) {
        warning = "**";
      } else if (bhf.lt(BigNumber.from(10).pow(17).mul(12))) {
        ret = "*";
      }
      ret = warning + hf + warning;
    }
    return ret;
  }

  function isOrigin() {
    return (name == "Origin");
  }
  async function handleHealthFactor() {
    if (isOrigin()) {
      console.log("HF ORIGIN");
      ({ healthFactor, healthFactorUnchecked, healthFactorChecked } = await aaveDashboard.getHealthFactors($Dashboards[address].tokens, true));
      healthFactorNext = healthFactorUnchecked;
    } else {
      if (address) {
        console.log("HF DESTINATION EXISTS");
        ({ healthFactor } = await aaveDashboard.getHealthFactors($Dashboards[address].tokens, true));
        ({ healthFactor: healthFactorNext } = await aaveDashboard.getHealthFactors2($Dashboards[origin].tokens, $Dashboards[address].tokens, true));
      }
    }
    console.log("HF", name, healthFactor, healthFactorNext, address, origin);
  }
  function handleReGet() {
    console.log("handleReGet", address);
    getDashboard(true);
  }
  function handleRefresh() {
    handleHealthFactor();
    refresh++;
    console.log("handleRefresh Dashboard", address, refresh);
  }
  function setChecked(_symbol, _checked) {
    const idToken = $Dashboards[address].tokens.findIndex((db) => db.symbol == _symbol);
    if (idToken >= 0) $Dashboards[address].tokens[idToken].checked = _checked;
    handleRefresh();
    console.log("setChecked", _symbol, address, refresh);
  }
  async function getDashboard(_force = false) {
    if (address) {
      const oldDashboard = $Dashboards[address];

      if (_force || !oldDashboard) {
        const _provider = new ethers.providers.Web3Provider(window.ethereum);
        $Dashboards[address] = await aaveDashboard.getUserData(address, _provider, true);
      }
      if (oldDashboard) {
        for (const position of oldDashboard.tokens) {
          setChecked(position.symbol, position.checked);
        }
      } else {
        for (const position of $Dashboards[address].tokens) {
          setChecked(position.symbol, chekboxDefault);
        }
      }
    }
    handleRefresh();
    console.log("getDashboard", address, _force, "=>", $Dashboards[address]);
    return $Dashboards[address];
  }
</script>

<main>
  {#key refresh}
    <div id="OriginPosition" class="fs-col-origin columnposition w-col w-col-6 w-col-stack w-col-small-small-stack" style="min-height: 220px; height: 100%">
      <div class="columntitlebar reverse" class:reverse={!isOrigin()}>
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
      <div class="fs-ribbon-container">
        {#if isOrigin() && ribbonMessage}
          <div id="userMessagePurple" class="usermessagesbar">
            <div id="userMessagePurpleText" class="textdarkmode usermessage">
              {ribbonMessage}
            </div>
          </div>
        {/if}
      </div>
      {#await $Dashboards[address]}
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
                      class:fs-dashboard-item__origin={isOrigin}
                      class="deposititem fs-deposit-item"
                      on:click={() => isOrigin() && setChecked(item.symbol, !item.checked)}
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
                      {#if isOrigin()}
                        <div class="fs-checkmark">
                          {#if item.checked}
                            <img src="images/checked_purple.svg" loading="lazy" alt="" />
                          {:else}
                            <img src="images/unchecked_purple.svg" loading="lazy" alt="" />
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
                      class:fs-dashboard-item__origin={isOrigin}
                      class="loanitem fs-dashboard-item  fs-loan-item"
                      on:click={() => isOrigin() && setChecked(item.symbol, !item.checked)}
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
                      {#if address == origin}
                        <div class="fs-checkmark">
                          {#if item.checked}
                            <img src="images/checked_white.svg" loading="lazy" alt="" />
                          {:else}
                            <img src="images/unchecked_white.svg" loading="lazy" alt="" />
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
        {/if}
      {:catch error}
        <p style="color: red">{error.message}</p>
      {/await}

      <div class="fs-bottom-container">
        <div id="healthFactorInfoORG" class="healthfactorinfo">
          <div class="hfcontents origin" style="display: block;">
            <p class="textlightmode rates fs-hf">
              Current Health Factor : {_hf(healthFactor, 18)}
            </p>
            <p class="textlightmode rates fs-hf">
              <span style="margin-right: 21px;"> Next Health Factor: </span>
              {_hf(healthFactorNext, 18)}
            </p>
          </div>
        </div>
        <div id="clearALL" class="secondarybutton cursor-pointer">
          <div on:click={handleReGet} id="refreshFlashPos" class="textlightmode button">Refresh Dashboard</div>
        </div>
      </div>
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

  .usermessagesbar {
    display: block;
  }

  .fs-ribbon-container {
    min-height: 24px;
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

  .fs-bottom-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .fs-hf {
    text-align: left;
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

  .cursor-pointer {
    cursor: pointer;
  }
</style>
