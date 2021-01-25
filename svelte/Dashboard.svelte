<svelte:options tag="flashsuite-dashboard" immutable={true} />

<script>
  import { ethers } from "ethers";
  import aaveDashboard from "../lib/aaveDashboard.mjs";
  import detectEthereumProvider from "@metamask/detect-provider";

  export let user;

  const users = {
    "Alice": "0xb09Ae31E045Bb9d8D74BB6624FeEB18B3Af72A8e",
    "Bob": "0x981ab0D817710d8FFFC5693383C00D985A3BDa38",
  };

  let provider;
  let ethersProvider;
  let signer;
  let network;
  let address;
  let balance;
  let tokens;
  let first = "0";

  function _disp(_balance, _decimals) {
    const [ent, dec] = ethers.utils.formatUnits(_balance, _decimals).split(".");
    return ent + "." + dec.substring(0, 3);
  }

  async function init() {
    provider = await detectEthereumProvider();
    if (provider) {
      ethersProvider = new ethers.providers.Web3Provider(provider);
      console.log(ethersProvider);
      signer = await ethersProvider.getSigner();
      network = (await ethersProvider.getNetwork()).name;
      address = await signer.getAddress();
      balance = await signer.getBalance();
      tokens = await aaveDashboard(users[user], ethersProvider, true);
      console.log(tokens);
    } else {
      console.log("Please install MetaMask!");
    }
    return tokens;
  }
</script>

<main>
  <h2>AAVE Dashboard {user}</h2>
  <table>
    {#await init()}
      <p>loading</p>
    {:then items}
    <th colspan="2"><h2>Deposits</h2></th>
      {#each items as item}
        {#if item.type == "deposit"}
          <tr>
            <td align="right"> {_disp(item.amount, item.decimals)}</td>
            <td>{item.symbol}</td>
          </tr>
        {/if}
      {/each}
      <th colspan="2"><h2>Borrows</h2></th>
      {#each items as item}
        {#if item.type != "deposit"}
          <tr>
            <td align="right">{_disp(item.amount, item.decimals)}</td>
            <td>{item.symbol}</td>
          </tr>
        {/if}
      {/each}
    {:catch error}
      <p style="color: red">{error.message}</p>
    {/await}
  </table>
</main>

<style>
  main {
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  h2 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 2em;
    font-weight: 50;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>
