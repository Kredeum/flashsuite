<script>
  import { ethers } from "ethers";
  import { onMount } from "svelte";
  import aaveDashboard from "../lib/aaveDashboard.mjs";
  import { Dashboards } from "./stores.mjs";

  export let name;
  export let address;
  export let refresh = 0;

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
  async function getDashboard(_address, _force = false) {
    if (_address) {
      const oldDashboard = $Dashboards[_address];

      if (_force || !oldDashboard) {
        const _provider = new ethers.providers.Web3Provider(window.ethereum);
        $Dashboards[_address] = await aaveDashboard(_address, _provider, true);
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
    }
    refresh++;
    console.log("getDashboard",_address, _force, "=>", $Dashboards[_address]);
    return $Dashboards[_address];
  }
  function setChecked(_symbol, _checked) {
    console.log("setChecked", _symbol, _checked);
    const idToken = $Dashboards[address].tokens.findIndex((db) => db.symbol == _symbol);
    if (idToken >= 0) $Dashboards[address].tokens[idToken].checked = _checked;
    refresh++;
  }
  function handleCheck(_event) {
    setChecked(_event.target.value, _event.target.checked);
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
            Health Factor : {_bal(dashboard.account.healthFactor, 18)}<br /><br />
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
