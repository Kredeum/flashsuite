<svelte:options tag="flashsuite-accounts" immutable={true} />

<script>
  import { ethers } from "ethers";
  import { onMount } from "svelte";
  import { Dashboards } from "./stores.mjs";
  import Dashboard from "./dashboard.svelte";
  import FlashAccountsContract from "../lib/contracts/FlashAccounts.mjs";

  let dashboards = {};
  let Alice = "";
  let Bob = "";
  let address = "";
  let signer;
  let network;
  let launch = false;

  let step = 1;
  let message = "";

  Dashboards.subscribe((value) => {
    console.log("in subscribe", dashboards, value);
    dashboards = value;
    console.log("in subscribe", dashboards, dashboards.length, step);
    const nd = Object.keys(dashboards).length;
    if (nd >= 1 && step == 1) {
      launch = true;
      message = "Ready to launch the migration ?";
    }
    if (nd >= 2 && step == 2) step3();
  });

  async function handleAccounts(accounts) {
    console.log("handleAccounts <=", accounts);
    address = accounts[0];
    if (address) {
      if (Alice) {
        if (Bob) {
          // third account , reset by refreshing the browser
          document.location.reload();
        } else {
          Bob = address;
          message = "Retreiving destinator AAVE dashboard...";
        }
      } else {
        Alice = address;
        message = "Origin account connected, retreiving AAVE dashboard...";
      }
      signer = new ethers.providers.Web3Provider(ethereum).getSigner();
    } else {
      message = "Please connect the origin account you want to migrate from, with Metamask or another Wallet";
    }
    console.log("handleAccounts => STEP", step, Alice, Bob);
  }
  async function handleChain(chainId) {
    console.log("handleChain <=", chainId);
    const networks = new Map([
      [1, "mainnet"],
      [3, "ropsten"],
      [4, "rinkeby"],
      [5, "goerli"],
      [42, "kovan"],
    ]);
    network = networks.get(Number(chainId));
    if (chainId != 42) {
      message = "FlashAccount is in beta mode ! only available on Kovan\nPlease switch to the Kovan testnet";
    }
    console.log("handleChain => STEP", step, network);
  }

  onMount(async function () {
    console.log("onMount <=");
    try {
      handleChain(await ethereum.request({ method: "eth_chainId" }));
      handleAccounts(await ethereum.request({ method: "eth_accounts" }));
    } catch (e) {
      message = "Please install MetaMask!";
    }
    await FlashAccountsContract.Init(true);
    console.log("onMount => STEP", step);
  });

  ethereum.on("connect", console.log);
  ethereum.on("message", console.log);
  ethereum.on("disconnect", console.log);
  ethereum.on("chainChanged", handleChain);
  ethereum.on("accountsChanged", handleAccounts);

  async function step1() {
    console.log("STEP 1 <=");
    step = 1;
    message = "Please connect to the account you want to migrate from, with Metamask or another Wallet";
  }
  async function step2() {
    console.log("STEP 2 <=", dashboards[Alice]);
    step = 2;
    launch = false;
    message = "Approve the transfer of all your deposits with your browser wallet ";
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
    message = "Approve the transfer of all your loans with your browser wallet ";

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
    message = "Flash Loan succeeded !  Browser will refresh soon";
    setTimeout(() => {
      document.location.reload();
    }, 5000);
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
    {#if Alice}
      <tr><td class="cadre"><Dashboard user={Alice} /></td> </tr>
    {/if}
    {#if Bob}
      <tr><td class="cadre"><Dashboard user={Bob} /></td> </tr>
    {/if}
  </table>

  <hr />
  <h4>metamask</h4>
  <small>
    network: {network}
    <br />account: {address}
  </small>
  <hr />
</main>

<style>
  main {
    padding: 1em;
    margin: 0 auto;
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
