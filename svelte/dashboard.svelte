<script>
  import { ethers } from "ethers";
  import aaveDashboard from "../lib/aaveDashboard.mjs";
  import { Dashboards } from "./stores.mjs";

  export let user = {};
  export let checkbox = false;
  const chekboxDefault = true;

  function _bal(_balance, _decimals, _precision=3) {
    const [ent, dec] = ethers.utils.formatUnits(_balance, _decimals).split(".");
    return ent + "." + dec.substring(0, _precision);
  }

  async function dashboard() {
    if (user) {
      const oldDashboard = $Dashboards[user];
      const _provider = new ethers.providers.Web3Provider(window.ethereum);
      $Dashboards[user] = await aaveDashboard(user, _provider, true);
      if (oldDashboard) {
        for (const position of oldDashboard.tokens) {
          setChecked(position.symbol, position.checked);
        }
      } else {
        for (const position of $Dashboards[user].tokens) {
          setChecked(position.symbol, chekboxDefault );
        }
      }
      console.log("$dashboard", user, $Dashboards[user]);
    }
    return user && $Dashboards[user];
  }
  function setChecked(_symbol, _checked) {
    const idToken = $Dashboards[user].tokens.findIndex((db) => db.symbol == _symbol);
    if (idToken >= 0) $Dashboards[user].tokens[idToken].checked = _checked;
  }
  function handleCheck(_event) {
    setChecked(_event.target.value, _event.target.checked);
  }
</script>

<main>
  <small>{user}</small>

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
                  <td align="right"><div title="{_bal(item.amount, item.decimals, 18)}">{_bal(item.amount, item.decimals)}</div></td>
                  <td>{item.symbol}</td>
                  {#if checkbox}
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
                  <td align="right"><div title="{_bal(item.amount, item.decimals, 18)}">{_bal(item.amount, item.decimals)}</div></td>
                  <td>{item.symbol}</td>
                  {#if checkbox}
                    <td><input type="checkbox" on:click={handleCheck} value={item.symbol} checked={item.checked} /></td>
                  {/if}
                </tr>
              {/if}
            {/each}
          </table>
        </td>
      </tr>
      
    </table>
    <p class="hf">Health Factor : {_bal(dashboard.account.healthFactor,18)}</p>
  {:catch error}
    <p style="color: red">{error.message}</p>
  {/await}
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
</style>
