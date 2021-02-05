<script>
  import { ethers, BigNumber } from "ethers";
  import aaveDashboard from "../lib/aaveDashboard.mjs";
  import { Dashboards } from "./stores.mjs";
  import ListBox from "./listbox.svelte";

  export let name;
  let again = true;
  function refresh() {
    again = Boolean(!again);
  }

  export let user = {};
  export let addresses;
  const chekboxDefault = true;

  function _bal(_balance, _decimals, _precision = 3) {
    const [ent, dec] = ethers.utils.formatUnits(_balance, _decimals).split(".");
    return ent + "." + dec.substring(0, _precision);
  }
  function _healthFactor(db) {
    const hf = db.account.healthFactor;
    return hf.gt(BigNumber.from(10).pow(24)) ? "∞" : _bal(hf, 18);
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
      console.log("DASHBOARD", user, $Dashboards[user]);
    }
    return $Dashboards[user];
  }
  function setChecked(_symbol, _checked) {
    const idToken = $Dashboards[user].tokens.findIndex((db) => db.symbol == _symbol);

    console.log("SET CHECK", _symbol, _checked, idToken);

    console.log("SET CHECK", $Dashboards[user].tokens[idToken].checked);
    if (idToken >= 0) $Dashboards[user].tokens[idToken].checked = _checked;
    console.log("SET CHECK", $Dashboards[user].tokens[idToken].checked);
    refresh();
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

  {#key again}
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
                  <div id="tokenSymbolDep01ORG" class="textlightmode label">
                    {item.symbol}
                  </div>
                </div>
                <div class="readonlyfield">
                  <div id="amountDep01ORG" class="textlightmode numbers">
                    {_bal(item.amount, item.decimals)}
                  </div>
                </div>

                <div class="fs-checkmark">
                  {#if item.checked }V{:else}O{/if}
                </div>
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
          <p class="textlightmode rates">Health Factor : {_healthFactor(dashboard)}</p>
        </div>
      </div>
    {:catch error}
      <p style="color: red">{error.message}</p>
    {/await}
    {/if}  {/key}
</main>

<!-- <main>
  <h2>{name} dashboard</h2>
  <ListBox bind:value={user} options={addresses} />

  {#if user}
    {#await dashboard(user)}
      <p>loading</p>
    {:then dashboard}
      <table>
        <tr>
          <td>
            <h3>Deposits</h3>
            <table>
              {#each dashboard.tokens as item}
                {#if item.type == 0}
                  <tr>
                    <td align="right"><div title={_bal(item.amount, item.decimals, 18)}>{_bal(item.amount, item.decimals)}</div></td>
                    <td>{item.symbol}</td>
                    {#if name == "Origin"}
                      <td><input type="checkbox" on:click={handleCheck} value={item.symbol} checked={item.checked} /></td>
                    {/if}
                  </tr>
                {/if}
              {/each}
            </table>
          </td><td>
            <h3>Borrows</h3>
            <table>
              {#each dashboard.tokens as item}
                {#if item.type > 0}
                  <tr>
                    <td align="right"><div title={_bal(item.amount, item.decimals, 18)}>{_bal(item.amount, item.decimals)}</div></td>
                    <td>{item.symbol}</td>
                    {#if name == "Origin"}
                      <td><input type="checkbox" on:click={handleCheck} value={item.symbol} checked={item.checked} /></td>
                    {/if}
                  </tr>
                {/if}
              {/each}
            </table>
          </td>
        </tr>
      </table>
      <p class="hf">Health Factor : {_healthFactor(dashboard)}</p>
    {:catch error}
      <p style="color: red">{error.message}</p>
    {/await}
  {/if}
</main> -->
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
