<svelte:options tag="flashsuite-accounts" immutable={true} />

<script>
  import Dashboard from "./Dashboard.svelte";
  import { ethers } from "ethers";

  let ethersProvider;
  let signer;
  let network;
  let address;
  let balance;

  async function starting() {
    if (window.ethereum) {
      window.ethereum.enable();
      ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
      network = (await ethersProvider.getNetwork()).name;
      signer = ethersProvider.getSigner();    
      address = await signer.getAddress();
    } else {
      console.log("Please install MetaMask!");
    }
  }
  starting();
</script>

<main>
  <img src="logo.png" width ="600" alt="FlashSuite"/>
  <table>
    <tr><td class="cadre"><Dashboard user={"Alice"} /></td> </tr>
    <tr><td class="cadre"><Dashboard user={"Bob"} /></td> </tr>
  </table>

  <hr />
  <h4>metamask user</h4>
  <small>
    network: {network}<br />
    signer: {address}<br />
  </small>

  <hr />
</main>

<style>
  main {
    padding: 1em;
    margin: 0 auto;
  }
  h1 {
    color: purple;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }
  

  table {
    width: 300px;
  }
  td.cadre {
    border: 1px solid purple;
  }
  td {
    vertical-align: top;
    width: 150px;
  }
  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>
