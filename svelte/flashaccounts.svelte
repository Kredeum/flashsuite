<svelte:options tag="flashsuite-accounts" immutable={true} />

<script>
  import { ethers } from "ethers";
  import { onMount } from "svelte";
  import { Dashboards } from "./stores.mjs";
  import FlashAccountsContract from "../lib/contracts/FlashAccounts.mjs";
  import Dashboard from "./dashboard.svelte";
  import Metamask from "./metamask.svelte";

  // exports Metamask
  let network = "";
  let address = "";
  let balance = -1;

  // NETWORK MUST BE KOVAN
  $: if (network && network != "kovan") {
    alert("FlashAccount is in beta mode ! only available on Kovan\nPlease switch to the Kovan testnet");
  }

  // FIRST ADDRESS IS ALICE, SECOND ADDRESS BOB
  $: if (address) {
    if (Alice) {
      if (Bob) {
        // third account , reset by refreshing the browser
        document.location.reload();
      } else {
        Bob = address;
        message = "Destinator account connected, retreiving AAVE dashboard...";
      }
    } else {
      Alice = address;
      message = "Origin account connected, retreiving AAVE dashboard...";
    }
  }

  // BALANCE TO LOW
  $: if (address && network == "kovan" && balance == 0) {
    alert("ETH balance is to low to proceed, you need some ETH to pay gas");
  }

  let dashboards = {};
  let nd = 0;
  let Alice = "";
  let Bob = "";
  let signer;
  let launch = false;
  let step = 1;
  let message = "";
  let again = true;
  function refresh() {
    again = Boolean(!again);
  }

  Dashboards.subscribe((value) => {
    console.log("in subscribe", dashboards, value);
    dashboards = value;
    console.log("in subscribe", dashboards, dashboards.length, step);
    nd = Object.keys(dashboards).length;
    if (nd >= 1 && step == 1) {
      launch = true;
      message = "Ready to launch the migration ?";
    }
    if (nd >= 2 && step == 2) step3();
  });

  onMount(async function () {
    await FlashAccountsContract.Init(true);
  });

  async function step1() {
    console.log("STEP 1 <=");
    step = 1;
    message = "Please connect to the account you want to migrate from, with Metamask or another Wallet";
  }
  async function step2() {
    console.log("STEP 2 <=", dashboards[Alice]);
    step = 2;
    launch = false;
    console.log("D1",dashboards[Alice]);
    const nd = dashboards[Alice].filter((pos) => pos.type == 0).length;

    message = `Approve the transfer of your ${nd} deposits with your browser wallet`;
    try {
      await FlashAccountsContract.approveTransfers(dashboards[Alice], signer);
      message = "Please connect to the account you want to migrate to, with Metamask or another Wallet";
    } catch (e) {
      message = "Transaction failed";
      console.error(e);
    }
  }
  async function step3() {
    console.log("STEP 3 <=", dashboards[Alice]);
    const nl = dashboards[Alice].filter((pos) => pos.type != 0).length;

    message = `Approve the transfer of your ${nl} loans with your browser wallet`;
    try {
      await FlashAccountsContract.approveLoans(dashboards[Alice], signer);
      step4();
    } catch (e) {
      message = "Transaction failed";
      console.error(e);
    }
  }
  async function step4() {
    console.log("STEP 4 <=");
    step = 4;
    message = "Approve the Flash Loan that will launch all the migration ";
    try {
      await FlashAccountsContract.callFlashLoan(dashboards[Alice], Alice, Bob, signer);
      step5();
    } catch (e) {
      message = "Transaction failed";
      console.error(e);
    }
  }
  async function step5() {
    console.log("STEP 5 <=");
    step = 5;
    message = "Flash Loan succeeded !  refreshing Dashboards";
    refresh();
    step = 6;
  }
</script>

<main>
  <img src="logo.png" width="600" alt="FlashSuite" />
  <p><strong>FlashSuite Accounts : transfer your AAVE account to another address</strong></p>
  <hr />

  <p class="message">{message}</p>
  <p>
    {#if launch}
      <button on:click={step2}>LAUNCH MIGRATION</button>
    {/if}
  </p>

  <table>
    {#key again}
      {#if Alice}
        <tr
          ><td class="cadre">
            <h2>Origin AAVE DashBoard</h2>
            <Dashboard user={Alice} />
          </td></tr
        >
      {/if}
      {#if Bob}
        <tr
          ><td class="cadre">
            <h2>Destination AAVE DashBoard</h2>
            <Dashboard user={Bob} />
          </td></tr
        >
      {/if}
    {/key}
  </table>

  <p>
    <button on:click={refresh}
      >Refresh Dashboard{#if nd > 1}s{/if}</button
    >
  </p>
  <hr />
  <p>
    <Metamask bind:address bind:balance bind:network bind:signer />
  </p>
</main>

<style>
  main {
    padding: 1em;
    margin: 0 auto;
  }
  h2 {
    padding-left: 10px;
    margin-bottom: 0px;
  }
  h4 {
    margin-bottom: 0px;
  }
  p.message {
    color: purple;
    font-style: oblique;
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
