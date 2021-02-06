<script>
  import { ethers } from "ethers";
  import { onMount } from "svelte";
  import { Dashboards } from "./stores.mjs";
  import FlashAccountsContract from "../lib/contracts/FlashAccounts.mjs";
  import Dashboard from "./dashboard3.svelte";
  import Metamask from "./metamask2.svelte";

  // exports Metamask
  let network = "";
  let balance = -1;
  let address = "";

  let positionsAlice = [];
  let nd = 0;
  let Alice = "";
  let Bob = "";
  let signer;
  let startMigration = false;
  let step = 0;
  let message;
  let message2;
  let refresh = 0;

  // NETWORK MUST BE KOVAN
  $: if (network && network != "kovan") {
    alert("FlashAccount is in beta mode ! only available on Kovan\nPlease switch to the Kovan testnet");
  }

  // FIRST ADDRESS IS ALICE, SECOND ADDRESS BOB
  $: {
    if (address && (address != Alice) && (address != Bob) && (step <= 4))
      if (!Alice) {
        Alice = address;
      } else {
        if (step == 4){
          Bob = address;
        }
      }
    console.log("ADDRESS", address, Alice, Bob, step);
  }

  // BALANCE TO LOW
  $: if (address && network == "kovan" && balance == 0) {
    alert("ETH balance is to low to proceed, you need some ETH to pay gas");
  }

  // STEP 0 : initial state
  $: if (Alice && step == 0) step1();
  // STEP 1 : address Alice defined
  $: if (Alice && $Dashboards[Alice] && step < 2) step2();
  // STEP 2 : dashboard Alice retrieved
  // Click button
  // STEP 3 : start migration
  // Transfers approved
  // STEP 4 : connect destination
  $: if (Bob && step == 4) step5();
  // STEP 5 : address Bob defined
  $: if (Bob && $Dashboards[Bob] && step == 5) step6();
  // STEP 6 : dashboard Bob retreived
  // Transfers approved
  // STEP 7 : call flashloan
  // Flashlaon approval
  // STEP 8 : flashloan succeeded
  // Refresh dashboards
  // STEP 9 : final state, positions migrated

  function _bal(_balance, _decimals) {
    const [ent, dec] = ethers.utils.formatUnits(_balance, _decimals).split(".");
    return ent + "." + dec.substring(0, 3);
  }

  onMount(async function () {
    await FlashAccountsContract.Init(true);
    step0();
  });

  async function step0() {
    step = 0;
    message = ">>> Please connect to the account you want to migrate from, with Metamask or another Wallet";
    if (Alice) step1();
  }
  async function step1() {
    step = 1;
    message = ">>> Origin account connected";
    message2 = `<<< Retreiving AAVE dashboard...`;
    startMigration = false;
    if (Alice && $Dashboards[Alice]) step2();
  }
  async function step2() {
    step = 2;
    message = ">>> Select what positions to migrate, and start migration";
    message2 = "<<< Origin dashboard retreived";
    startMigration = true;
  }
  async function step3() {
    refresh++;
    

    console.log("STEP3 AVANT", address, Alice);
    if (address != Alice) {
      $Dashboards[Alice]=null;
      Alice="";
      message2 = "<<< Keep your browser wallet connected with same origin account !";
      setTimeout(step0, 2000);
      return;
    }
    console.log("STEP3 APRES", address, Alice);
    step = 3;
    startMigration = false;
    positionsAlice = $Dashboards[Alice].tokens.filter((pos) => pos.checked);

    console.log("STEP3 positionsAlice", positionsAlice);

    const deposits = positionsAlice.filter((pos) => pos.type == 0);
    const nd = deposits.length;
    try {
      if (nd > 0) {
        let amounts = [];
        let txsDeposit = [];
        let txsWait = [];
        let ic = 0;
        let iw = 0;
        let ia = 0;
        for (const deposit of deposits) {
          const amount = `${_bal(deposit.amount, deposit.decimals)} ${deposit.symbol}`;
          message = `>>> Approve the transfer of your ${nd} deposit${nd > 1 ? "s" : ""} with your browser wallet`;
          txsDeposit[ic] = FlashAccountsContract.approveTransfer(deposit, signer);
          amounts[ic] = amount;
          ic++;
        }
        message = `>>> You did approve ${nd} deposit${nd > 1 ? "s" : ""}`;
        message2 = `<<< ${nd} requests sent`;
        for await (const txDeposit of txsDeposit) {
          console.log(`TX1.${iw + 1}/${nd} CALL`, txDeposit);
          txsWait[iw] = txDeposit.wait();
          iw++;
        }
        for await (const tx of txsWait) {
          message2 = `<<< Waiting requests completion... ${ia + 1}/${nd} deposit${ia > 1 ? "s" : ""} completed`;
          console.log(`TX1.${ia+1}/${nd} END`, tx);
          ia++;
        }
        message2 = `<<< ${nd > 1 ? "All " + nd + " deposits" : "Deposit" } request${nd > 1 ? "s" : ""} completed`;
      }
      step4();
    } catch (e) {
      message2 = "<<< Transaction failed";
      console.error(e);
    }
  }
  async function step4() {
    step = 4;
    message = ">>> Please connect to the account you want to migrate to, with Metamask or another Wallet";
    if (Bob) step5();
  }
  async function step5() {
    console.log("Bob", Bob);
    step = 5;
    message = ">>> Destination account connected";
    message2 = "<<< Retreiving destination dashboard...";
    if (Bob && $Dashboards[Bob]) step6();
  }
  async function step6() {
    step = 6;
    message2 = "<<< Destination dashboard retreived";

    const loans = positionsAlice.filter((pos) => pos.type != 0);
    const nl = loans.length;
    try {
      if (nl > 0) {
        let amounts = [];
        let txsLoan = [];
        let txsWait = [];
        let ic = 0;
        let iw = 0;
        let il = 0;
        for (const loan of loans) {
          const amount = `${_bal(loan.amount, loan.decimals)} ${loan.symbol}`;
          message = `>>> Approve the credit delegation of your ${nl} loan${nl > 1 ? "s" : ""} with your browser wallet`;
          txsLoan[ic] = await FlashAccountsContract.approveLoan(loan, signer);
          amounts[ic] = amount;
          ic++;
        }
        message = `>>> You did approve ${nl} loan${nl > 1 ? "s" : ""}`;
        message2 = `<<< ${nl} requests sent`;
        for await (const txLoan of txsLoan) {
          console.log(`TX2.${iw + 1}/${nl} CALL`, txLoan);
          txsWait[iw] = txLoan.wait();
          iw++;
        }
        for await (const tx of txsWait) {
          message2 = `<<< Waiting requests completion... ${il + 1}/${nl} loan${il > 1 ? "s" : ""} completed`;
          console.log(`TX2.${il+1}/${nl} END`, tx);
          il++;
        }
        message2 = `<<< ${nl > 1 ? "All " + nl + " loans" : "Loan" } request${nl > 1 ? "s" : ""} completed`;
      }
      step7();
    } catch (e) {
      message2 = "<<< Transaction failed";
      console.error(e);
    }
  }
  async function step7() {
    step = 7;
    message = ">>> Approve Flash Loan with your browser wallet";
    try {
      const tx = await FlashAccountsContract.callFlashLoanTx(positionsAlice, Alice, Bob, signer);

      message2 = `<<< Flash Loan Magic in progress... wait a few seconds`;
      console.log(`TX2`, await tx.wait());
      step8();
    } catch (e) {
      message2 = "<<< Transaction failed";
      console.error(e);
    }
  }
  async function step8() {
    step = 8;
    message = ">>> Flash Loan succeeded !";
    message2 = "<<< Refreshing dashboards";
    refresh++;
    setTimeout(step0, 10000);
  }
  async function step9() {
    step = 9;
    message = ">>> Refresh your browser to start another migration";
    message2 = "";
  }
</script>

<main>
  <img src="logo.png" width="600" alt="FlashSuite" />
  <p><strong>FlashPos : migrate your AAVE positions to another address</strong></p>
  <hr />

  <p class="message">{message}</p>
  <p >{message2}</p>
  <p>
    {#if startMigration}
      <button on:click={step3}>START MIGRATION</button>
    {/if}
  </p>

  <table>
    {#key refresh}
      <tr
        ><td>
          <Dashboard address={Alice} name="Origin" />
        </td><td>
          {#if Bob}
          <Dashboard address={Bob} name="Destination" />
          {/if}
        </td></tr
      >
    {/key}
  </table>


  <hr />
  <p>
    <Metamask bind:address bind:balance bind:network bind:signer />
    <br />
    <small>origin: {Alice}</small> <br />
    <small>signer: {address}</small> <br />
    <small>destination: {Bob}</small> <br />
    <small>step: {step}</small> <br />
  </p>
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
    width: 800px;
  }
  td {
    vertical-align: top;
    border: 1px solid purple;
    width: 50%;
  }
</style>
