<script>
  import { ethers, BigNumber } from "ethers";
  import { onMount } from "svelte";
  import aaveDashboard from "../lib/aaveDashboard.mjs";
  import { Dashboards } from "./stores.mjs";

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
    <h2>{name}</h2>
    <small>{address}</small>

    {#await $Dashboards[address]}
      <p>loading</p>
    {:then dashboard}
      {#if dashboard}
        {#if dashboard.tokens.length > 0}
          <table>
            <tr>
              <td>
                <h3>Deposits</h3>
                <table>
                  {#each dashboard.tokens as item}
                    {#if item.type == 0}
                      <tr>
                        <td><div title={_bal(item.amount, item.decimals, 18)}>{_bal(item.amount, item.decimals)}</div></td>
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
                        <td><div title={_bal(item.amount, item.decimals, 18)}>{_bal(item.amount, item.decimals)}</div></td>
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
          <p class="bottom">
            Health Factor : {_hf(healthFactorAll, 18)}<br />
            Target Health Factor : {_hf(healthFactorUnchecked, 18)}<br /><br />
            {#if name == "Origin"}
              Selected Health Factor : {_hf(healthFactorChecked, 18)}
            {/if}
          </p>
        {:else}
          <div>No positions</div>
        {/if}
      {/if}
    {:catch error}
      <p style="color: red">{error.message}</p>
    {/await}
    <p class="bottom">
      <button on:click={getDashboard(address, true)}>Refresh Dashboard</button>
    </p>
  {/key}
</main>

<style>
  main {
    padding: 1em;
    margin: 0 auto;
    height: 100%;
  }
  table {
    width: 100%;
  }
  p.bottom {
    text-align: center;
    vertical-align: bottom;
  }
</style>
