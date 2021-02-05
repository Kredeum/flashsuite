<script>
  import { ethers, BigNumber } from "ethers";
  import aaveDashboard from "../lib/aaveDashboard.mjs";
  import { Dashboards } from "./stores.mjs";
  import ListBox from "./listbox.svelte";

  export let name;
  export let address;
  let refresh = 0;

  $: console.log("DASHBOARDS D", $Dashboards);
  $: console.log("ADDRESS D", address);
  $: console.log("NAME", name);

  const chekboxDefault = false;

  function _bal(_balance, _decimals, _precision = 3) {
    const [ent, dec] = ethers.utils.formatUnits(_balance, _decimals).split(".");
    return ent + "." + dec.substring(0, _precision);
  }
  function _healthFactor(db) {
    const hf = db.account.healthFactor;
    return hf.gt(BigNumber.from(10).pow(24)) ? "∞" : _bal(hf, 18);
  }

  $: currentDashboard = getDashboard(address);

  async function getDashboard(_address) {
    if (_address) {
      const oldDashboard = $Dashboards[_address];

      if (oldDashboard) {
        for (const position of oldDashboard.tokens) {
          setChecked(position.symbol, position.checked);
        }
      } else {
        const _provider = new ethers.providers.Web3Provider(window.ethereum);
        $Dashboards[_address] = await aaveDashboard(_address, _provider, true);

        for (const position of $Dashboards[_address].tokens) {
          setChecked(position.symbol, chekboxDefault);
        }
      }
    }
    console.log("GET DASHBOARD", address, _address, $Dashboards[_address]);
    return $Dashboards[_address];
  }

  function setChecked(_symbol, _checked) {
    const idToken = $Dashboards[address].tokens.findIndex(
      (db) => db.symbol == _symbol
    );
    if (idToken >= 0) $Dashboards[address].tokens[idToken].checked = _checked;
    refresh++;
  }
</script>

<main>
  {#key refresh}
    <div
      id="OriginPosition"
      class="fs-col-origin columnposition w-col w-col-6 w-col-stack w-col-small-small-stack"
    >
      <div class="columntitlebar reverse">
        <h2 id="columnTitle">{name}</h2>
        <ListBox bind:value={address} options={Object.keys($Dashboards)} />
        <img
          src="images/Network-Dot-Green.svg"
          loading="lazy"
          width="50"
          alt=""
          class="connectindicator"
        />
      </div>

      {#await currentDashboard}
        <p style="text-align: center;">loading</p>
      {:then dashboard}
        {#if dashboard}
          <div
            id="gridOrigin"
            class="w-layout-grid gridorigin fs-grid-dashboard"
          >
            <h3 class="left">Your Deposits</h3>
            <h3 class="right">Your Loans</h3>
            {#if dashboard.tokens.length > 0}
              <div class="fs-item-container">
                {#each dashboard.tokens as item}
                  {#if item.type == 0}
                    <div
                      class:checked={item.checked}
                      class:fs-dashboard-item__origin={name}
                      class="deposititem fs-deposit-item"
                      on:click={() => setChecked(item.symbol, !item.checked)}
                      value={item.symbol}
                      checked={item.checked}
                    >
                      <div class="tokendetails">
                        <div id="platformAddressLogo" class="buttondisk">
                          <img
                            src="https://d3e54v103j8qbb.cloudfront.net/plugins/Basic/assets/placeholder.60f9b1840c.svg"
                            loading="lazy"
                            id="tokenLogoDep01ORG"
                            alt=""
                            class="placeholderimage"
                          />
                        </div>
                        <div
                          id="tokenSymbolDep01ORG"
                          class="textlightmode label"
                        >
                          {item.symbol}
                        </div>
                      </div>
                      <div class="readonlyfield">
                        <div id="amountDep01ORG" class="textlightmode numbers">
                          {_bal(item.amount, item.decimals)}
                        </div>
                      </div>

                      <div class="fs-checkmark">
                        {#if item.checked}V{:else}O{/if}
                      </div>
                    </div>
                  {/if}
                {/each}
              </div>

              <div class="fs-item-container">
                {#each dashboard.tokens as item}
                  {#if item.type > 0}
                    <div
                      class:checked={item.checked}
                      class="loanitem fs-dashboard-item  fs-loan-item"
                      on:click={() => setChecked(item.symbol, !item.checked)}
                      value={item.symbol}
                      checked={item.checked}
                    >
                      <div class="tokendetails reverse">
                        <div
                          id="platformAddressLogo"
                          class="buttondisk reverse"
                        >
                          <img
                            src="https://d3e54v103j8qbb.cloudfront.net/plugins/Basic/assets/placeholder.60f9b1840c.svg"
                            loading="lazy"
                            id="tokenLogoLoan01ORG"
                            alt=""
                            class="placeholderimage"
                          />
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
                      <div class="fs-checkmark">
                        {#if item.checked}V{:else}O{/if}
                      </div>
                    </div>
                    <div
                      id="APRLoan01ORG"
                      class="ratesinfo w-node-9c5920cd5a3d-3e5b97ee"
                    >
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
                Health Factor : {_healthFactor(dashboard)}
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
  td {
    vertical-align: top;
    width: 50%;
  }
  p.hf {
    text-align: center;
  }

  .fs-grid-dashboard {
    min-width: 400px;
  }
  .fs-item-container {
    display: flex;
    flex-direction: column;
  }

  .fs-dashboard-item__origin {
    cursor: pointer;
  }

  .fs-deposit-item {
    margin-bottom: 24px;
    align-items: center;
  }

  .fs-deposit-item.checked {
    -webkit-box-shadow: inset 0px 0px 0px 1px #a04bce;
    -moz-box-shadow: inset 0px 0px 0px 1px #a04bce;
    box-shadow: inset 0px 0px 0px 1px #a04bce;
  }
  .fs-loan-item.checked {
    -webkit-box-shadow: inset 0px 0px 0px 1px #241130;
    -moz-box-shadow: inset 0px 0px 0px 1px #241130;
    box-shadow: inset 0px 0px 0px 1px #241130;
  }

  /* overrides */

  .buttondisk {
    flex-shrink: 0;
  }

  .gridorigin {
    grid-template-rows: auto auto;
  }
  img {
    max-width: 100%;
  }
</style>
