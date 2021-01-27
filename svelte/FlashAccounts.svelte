<svelte:options tag="flashsuite-accounts" immutable={true} />

<script>
  import { ethers } from "ethers";
  import { onMount } from "svelte";
  import { Dashboards } from "./stores.mjs";
  import Dashboard from "./Dashboard.svelte";
  import FlashAccounts from "../lib/contracts/FlashAccounts.mjs";

  $: addresses = [];
  let address, addressFrom, addressTo;
  let signer;
  let dashboards = {};

  let signerFrom, signerTo;
  let dashboardFrom = {};
  let network;
  Dashboards.subscribe((value) => {
    dashboards = value;
  });

  async function handleAccounts(accounts) {
    if (accounts[0]) {
      address = accounts[0];
      signer = new ethers.providers.Web3Provider(ethereum).getSigner();
      if (addresses.indexOf(address) == -1) {
        addresses = [...addresses, address];
      }
    } else {
      alert("no accounts");
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
    addressFrom = address;
    await FlashAccounts.approveTransfers(dashboards[addressFrom], signer);
  }
  async function step2() {
    if (addressFrom) {
      addressTo = address;
      if (addressFrom != addressTo) {
        await FlashAccounts.approveLoans(dashboards[addressFrom], signer);
      } else {
        alert("You have to use another account");
      }
    } else {
      alert("Step 1 first !");
    }
  }
  async function step3() {
    if (addressTo) {
      await FlashAccounts.callFlashLoan(
        dashboards[addressFrom],
        addressFrom,
        addressTo,
        signer
      );
    } else {
      alert("Step 1 and 2 first !");
    }
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
