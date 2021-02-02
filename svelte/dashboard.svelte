<script>
  import { ethers } from "ethers";
  import aaveDashboard from "../lib/aaveDashboard.mjs";
  import { Dashboards } from "./stores.mjs";

  export let user = {};
  export let checkbox = false;

  function _bal(_balance, _decimals) {
    const [ent, dec] = ethers.utils.formatUnits(_balance, _decimals).split(".");
    return ent + "." + dec.substring(0, 3);
  }

  async function dashboard() {
    if (user) {
      const oldDashboard = $Dashboards[user];
      const _provider = new ethers.providers.Web3Provider(window.ethereum);
      $Dashboards[user] = await aaveDashboard(user, _provider, true);
      if (oldDashboard) {
        for (const position of oldDashboard) {
          if (position.checked) setChecked(position.symbol, true);
        }
      } else {
        for (const position of $Dashboards[user]) {
          setChecked(position.symbol, true);
        }
      }
      console.log("$dashboard", user, $Dashboards[user]);
    }
    return user && $Dashboards[user];
  }
  function setChecked(_symbol, _checked) {
    const idToken = $Dashboards[user].findIndex((db) => db.symbol == _symbol);
    $Dashboards[user][idToken].checked = _checked;
  }
  function handleCheck(_event) {
    setChecked(_event.target.value, _event.target.checked);
  }
</script>

<main>
  <small>{user}</small>

  {#await dashboard(user)}
    <p>loading</p>
  {:then items}
    <table>
      <tr
        ><td>
          <h3>Deposits</h3>
          <table>
            {#each items as item}
              {#if item.type == 0}
                <tr>
                  <td align="right"> {_bal(item.amount, item.decimals)}</td>
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
            {#each items as item}
              {#if item.type > 0}
                <tr>
                  <td align="right">{_bal(item.amount, item.decimals)}</td>
                  <td>{item.symbol}</td>
                  {#if checkbox}
                    <td><input type="checkbox" on:click={handleCheck} value={item.symbol} checked={item.checked} /></td>
                  {/if}
                </tr>
              {/if}
            {/each}
          </table>
        </td></tr
      >
    </table>
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
</style>
