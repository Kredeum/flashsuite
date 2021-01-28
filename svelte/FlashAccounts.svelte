<svelte:options tag="flashsuite-accounts" immutable={true} />

<script>
  import { ethers } from "ethers";
  import { onMount } from "svelte";
  import { Dashboards } from "./stores.mjs";
  import Dashboard from "./Dashboard.svelte";
  import FlashAccounts from "../lib/contracts/FlashAccounts.mjs";

  let dashboards = {};
  let addresses = [];
  let dis1 = true;
  let dis2 = true;
  let step = 0; 

  let address, addressFrom, addressTo;
  let signer;
  let network;

  Dashboards.subscribe((value) => {
    console.log("in subscribe", dashboards, value);
    dashboards = value;
    console.log("in subscribe", dashboards, dashboards.length, step);
    if (Object.keys(dashboards).length >= 1 && step == 0) dis1 = false;
  });

  async function handleAccounts(accounts) {
    if (accounts[0]) {
      address = accounts[0];
      signer = new ethers.providers.Web3Provider(ethereum).getSigner();
      if (addresses.indexOf(address) == -1) {
        addresses = [...addresses, address];
      }
    } else {
      alert(
        "Please connect the account you want to migrate with Metamask or another Wallet"
      );
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
  ethereum.on("disconnect", console.log);
  ethereum.on("chainChanged", handleChain);
  ethereum.on("accountsChanged", handleAccounts);

  async function step1() {
    step = 1;
    dis1 = true; 
    addressFrom = address;
    await FlashAccounts.approveTransfers(dashboards[addressFrom], signer);
    dis2 = false;
  }
  async function step2() {
    if (addressFrom) {
      step = 2;
      addressTo = address;
      if (addressFrom != addressTo) {
        dis2 = true; 
        await FlashAccounts.approveLoans(dashboards[addressFrom], signer);
        step3();
      } else {
        alert("You have to use another account");
      }
    } else {
      alert("Step 1 first !");
    }
  }
  async function step3() {
    if (addressTo) {
      step = 3;
      await FlashAccounts.callFlashLoan(
        dashboards[addressFrom],
        addressFrom,
        addressTo,
        signer
      );
      document.location.reload();
    } else {
      alert("Step 1 and 2 first !");
    }

  }
</script>

<main>
  <img src="logo.png" width="600" alt="FlashSuite" />

  <hr />
  <p>
    <button disabled={dis1} on:click={step1}>STEP 1 : Approve Tranfers</button>
    <button disabled={dis2} on:click={step2}>STEP 2 : Approve Loans</button>
  </p>

  <table>
    {#each addresses as address, i}
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
