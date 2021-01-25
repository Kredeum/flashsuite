<svelte:options tag="flash-accounts" immutable={true} />

<script>
  import Dashboard from './Dashboard.svelte';  
  import { ethers } from "ethers";
  import detectEthereumProvider from "@metamask/detect-provider";

  let provider;
  let ethersProvider;
  let signer;
  let network;
  let address;
  let balance;

  async function starting() {
    provider = await detectEthereumProvider();
    if (provider) {
      ethersProvider = new ethers.providers.Web3Provider(provider);
      console.log(ethersProvider);
      signer = await ethersProvider.getSigner();
      network = (await ethersProvider.getNetwork()).name;
      address = await signer.getAddress();
      balance = await signer.getBalance();
    } else {
      console.log("Please install MetaMask!");
    }
  }
starting();
</script>

<main>
  <h1>FlashSuite</h1>
    <table>
      <tr>
        <td class="cadre"><Dashboard user={"Alice"}/></td>
        <td class="cadre"><Dashboard user={"Bob"}/></td>
    </tr>
    </table>

   <hr />
  <h4>metamask user</h4>
    <small>
      network: {network}<br />
      signer: {address}<br />
      balance: {balance} ETH<br />
    </small>

  <hr />
</main>

<style>
  main {
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }

  table {
    width: 300px;
  }
  td.cadre {
    border: 1px solid black;  
    vertical-align: top;
  }
  td.cadre {
    align: left;  
  }

  p {
    font-size: 2em;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>
