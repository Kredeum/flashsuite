<script>
  import { ethers } from "ethers";
  import aaveDashboard from "../lib/aaveDashboard.mjs";
  import { Dashboards } from "./stores.mjs";

  export let user = {};

  function _bal(_balance, _decimals) {
    const [ent, dec] = ethers.utils.formatUnits(_balance, _decimals).split(".");
    return ent + "." + dec.substring(0, 3);
  }

  async function dashboard() {
    let _dashboard = {};
    if (user) {
      console.log("dashboard(user)", user);

      const _provider = new ethers.providers.Web3Provider(window.ethereum);
      console.log("_provider", _provider);

      _dashboard = await aaveDashboard(user, _provider, true);
      console.log("_dashboard", _dashboard);

      $Dashboards[user] = _dashboard;
    }
    return _dashboard;
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
  table{
    width: 100%
  }
  td {
    vertical-align: top;
    width: 50%;
  }
</style>
