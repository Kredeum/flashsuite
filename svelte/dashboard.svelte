<script>
  import { ethers } from "ethers";
  import aaveDashboard from "../lib/aaveDashboard.mjs";
  import { Dashboards } from "./stores.mjs";
  import ListBox from "./listbox.svelte";

  export let name;
  export let addresses;

  export let user = "";
  export let origin = true;
  const chekboxDefault = true;

  $: console.log("DASHBOARD ADDRESS", user);

  function _bal(_balance, _decimals, _precision = 3) {
    const [ent, dec] = ethers.utils.formatUnits(_balance, _decimals).split(".");
    return ent + "." + dec.substring(0, _precision);
  }

  async function dashboard() {
    console.log("dashboard()", user);
    if (user) {
      const oldDashboard = $Dashboards[user];
      if (oldDashboard) {
        // for (const position of oldDashboard.tokens) {
        //   setChecked(position.symbol, position.checked);
        // }
      } else {
        const _provider = new ethers.providers.Web3Provider(window.ethereum);
        $Dashboards[user] = await aaveDashboard(user, _provider, true);
        for (const position of $Dashboards[user].tokens) {
          setChecked(position.symbol, chekboxDefault);
        }
      }
      console.log("$dashboard", user, $Dashboards[user]);
    }
    return $Dashboards[user];
  }
  function setChecked(_symbol, _checked) {
    console.log("_symbol", _symbol);
    console.log("_checked", _checked);
    const idToken = $Dashboards[user].tokens.findIndex((db) => db.symbol == _symbol);
    if (idToken >= 0) $Dashboards[user].tokens[idToken].checked = _checked;
  }
  function handleCheck(_symbol, _checked) {
    setChecked(_symbol, !_checked);
  }
</script>

<main>
  <div id="OriginPosition" class="fs-col-origin columnposition w-col w-col-6 w-col-stack w-col-small-small-stack">
    <div class="columntitlebar reverse">
      <h2 id="columnTitle">{name}</h2>
      <ListBox bind:value={user} options={addresses} />
      <img src="images/Network-Dot-Green.svg" loading="lazy" width="50" alt="" class="connectindicator" />
    </div>
    <div id="userMessagePurple" class="usermessagesbar">
      <div id="userMessagePurpleText" class="textdarkmode usermessage">Please connect your Origin account</div>
    </div>
    <div id="userMessageOrange" class="usermessagesbar orange">
      <div id="userMessageOrangeText" class="textdarkmode usermessage">Please connect your Origin account</div>
    </div>
  </div>




  {#if user}
    {#await dashboard(user)}
      <p>loading</p>
    {:then dashboard}
      <div id="gridOrigin" class="w-layout-grid gridorigin fs-grid-dashboard">
        <h3 class="left">Your Deposits</h3>
        <h3 class="right">Your Loans</h3>
        <div class="fs-item-container">
          {#each dashboard.tokens as item}
            {#if item.type == 0}
              <div
                class:checked={item.checked}
                class:fs-dashboard-item__origin={origin}
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
                  <div id="tokenSymbolDep01ORG" class="textlightmode label">
                    {item.symbol}
                  </div>
                </div>
                <div class="readonlyfield">
                  <div id="amountDep01ORG" class="textlightmode numbers">
                    {_bal(item.amount, item.decimals)}
                  </div>
                </div>
                {#if item.checked}
                  <div class="fs-checkmark">V</div>
                {/if}
              </div>
            {/if}
          {/each}
        </div>

        <div class="fs-item-container">
          {#each dashboard.tokens as item}
            {#if item.type > 0}
              <div class:checked={item.checked} class="loanitem fs-dashboard-item  fs-loan-item">
                <div class="tokendetails reverse">
                  <div id="platformAddressLogo" class="buttondisk reverse">
                    <img
                      src="https://d3e54v103j8qbb.cloudfront.net/plugins/Basic/assets/placeholder.60f9b1840c.svg"
                      loading="lazy"
                      id="tokenLogoLoan01ORG"
                      alt=""
                      class="placeholderimage"
                    />
                  </div>
                  <div id="tokenSymbolLoan01" class="textlightmode">{item.symbol}</div>
                </div>
                <div class="readonlyfield">
                  <div id="amountLoan01ORG" class="textlightmode numbers">
                    {_bal(item.amount, item.decimals)}
                  </div>
                </div>
              </div>
              <div id="APRLoan01ORG" class="ratesinfo w-node-9c5920cd5a3d-3e5b97ee">
                <div id="tokenSymbolDep01ORG" class="textlightmode rates">
                  {item.type == 2 ? "Variable rate" : "Stable rate"}
                </div>
                <img src="images/Info-Icon.svg" loading="lazy" alt="" class="infroicon" />
              </div>
            {/if}
          {/each}
        </div>
      </div>
      <div id="healthFactorInfoORG" class="healthfactorinfo">
        <div class="hfcontents origin">
          <p class="textlightmode rates">Health Factor : {_bal(dashboard.account.healthFactor, 18)}</p>
        </div>
      </div>
    {:catch error}
      <p style="color: red">{error.message}</p>
    {/await}
  {/if}
</main>

<style>
  main {
    padding: 1em;
    margin: 0 auto;
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
