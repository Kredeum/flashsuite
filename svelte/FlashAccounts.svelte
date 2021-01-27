<svelte:options tag="flashsuite-accounts" immutable={true} />

<script>
  import { ethers } from "ethers";
  import { onMount } from "svelte";
  import { Dashboards } from "./stores.mjs";
  import Dashboard from "./Dashboard.svelte";
  import FlashAccounts from "../lib/contracts/FlashAccounts.mjs";

  let dashboards = [];
  $: addresses = [];
  let address;
  let signer = {};
  let signerFrom, signerTo;
  let network;
  Dashboards.subscribe((value) => {
    dashboards = value;
  });

  async function handleAccounts(accounts) {
    address = accounts[0];
    console.log("handleAccounts", accounts[0], addresses);
    if (address) {
      signer = new ethers.providers.Web3Provider(ethereum).getSigner();
      if (addresses.indexOf(address) == -1) {
        addresses = [...addresses, address];
      }
    }
    console.log("handleAccounts", accounts, addresses);
  }
  async function handleChain(chainId) {
    const networks = new Map([
      [1, "mainnet"],
      [3, "ropsten"],
      [4, "rinkeby"],
      [5, "goerli"],
      [42, "kovan"],
    ]);
    network = networks.get(Number(chainId));
    if (chainId != 42) {
      alert(
        "FlashAccount is in beta mode ! only available on Kovan\nPlease switch to the Kovan testnet"
      );
    }
    console.log("handleChain", chainId, network);
  }

  onMount(async function () {
    try {
      handleChain(await ethereum.request({ method: "eth_chainId" }));
      handleAccounts(await ethereum.request({ method: "eth_accounts" }));
    } catch (e) {
      alert("Please install MetaMask!", e);
    }
    await FlashAccounts.Init(true);
  });

  ethereum.on("connect", console.log);
  ethereum.on("message", console.log);
  ethereum.on("disconnect", console.error);
  ethereum.on("chainChanged", handleChain);
  ethereum.on("accountsChanged", handleAccounts);

  async function step1() {
    signerFrom = await signer.getAddress();
    console.log(signerFrom);
    console.log(dashboards[signerFrom]);
    console.log(dashboards);
    console.log( JSON.stringify(dashboards));
   
    await FlashAccounts.approveTransfers(dashboards[signerFrom], signer);
  }
  async function step2() {
    signerTo = await signer.getAddress();
    await FlashAccounts.approveLoans(dashboards[signerFrom], signer);
  }
  async function step3() {
    await FlashAccounts.callFlashLoan(
      dashboards[signerFrom],
      signerFrom,
      signerTo
    );
  }
</script>

<main>
  <img src="logo.png" width="600" alt="FlashSuite" />

  <hr />
  <p>
    <button on:click={step1}>STEP 1 : Approve Tranfers</button>
    <button on:click={step2}>STEP 2 : Approve Loan</button>
    <button on:click={step3}>STEP 3 : Call FlashLoan</button>
  </p>

  <table>
    {#each addresses as address}
      <tr><td class="cadre"><Dashboard user={address} /></td> </tr>
    {/each}
  </table>

  <hr />
  <h4>metamask</h4>
  <small>
    network: {network}<br />
    account: {address}<br />
  </small>

  <hr />
</main>

<style>
  main {
    padding: 1em;
    margin: 0 auto;
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
