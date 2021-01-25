<svelte:options tag="flashsuite-dashboard" immutable={true} />

<script>
  import { ethers } from "ethers";
  import aaveDashboard from "../lib/aaveDashboard.mjs";

  export let user = "Alice";

  const users = {
    Alice: "0xb09Ae31E045Bb9d8D74BB6624FeEB18B3Af72A8e",
    Bob: "0x981ab0D817710d8FFFC5693383C00D985A3BDa38",
  };

  function _bal(_balance, _decimals) {
    const [ent, dec] = ethers.utils.formatUnits(_balance, _decimals).split(".");
    return ent + "." + dec.substring(0, 3);
  }

  async function dashboard() {
    return await aaveDashboard(
      users[user],
      new ethers.providers.Web3Provider(window.ethereum),
      true
    );
  }
</script>

<main>
  <h2>AAVE Dashboard {user}</h2>

  {#await dashboard(user)}
    <p>loading</p>
  {:then items}
    <table>
      <tr
        ><td>
          <h3>Deposits</h3>
          <table>
            {#each items as item}
              {#if item.type == "deposit"}
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
              {#if item.type != "deposit"}
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
    max-width: 240px;
    margin: 0 auto;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>
