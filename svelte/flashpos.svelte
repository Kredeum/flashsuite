<script>
  import { ethers } from "ethers";
  import { onMount } from "svelte";
  import { Dashboards } from "./stores.mjs";
  import FlashAccountsContract from "../lib/contracts/FlashAccounts.mjs";
  import Dashboard from "./dashboard.svelte";
  // import Metamask from "./metamask.svelte";
  import Container from "./container.svelte";

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
  let refresh = 0;

  // NETWORK MUST BE KOVAN
  $: if (network && network != "kovan") {
    alert(
      "FlashAccount is in beta mode ! only available on Kovan\nPlease switch to the Kovan testnet"
    );
  }

  // FIRST ADDRESS IS ALICE, SECOND ADDRESS BOB
  $: {
    if (address && address != Alice && address != Bob && step <= 4)
      if (!Alice) {
        Alice = address;
      } else {
        Bob = address;
      }
    console.log("ADDRESSES", address);
  }

  // BALANCE TO LOW
  $: if (address && network == "kovan" && balance == 0) {
    alert("ETH balance is to low to proceed, you need some ETH to pay gas");
  }

  $: console.log("STEP:", step);
  $: console.log("DASHBOARDS F", $Dashboards);
  $: console.log("ALICE:", Alice);
  $: console.log("BOB:", Bob);
  $: console.log("ADDRESS F", address);

  // STEP 0 : initial state
  $: if (Alice && step == 0) step1();
  // STEP 1 : address Alice defined
  $: if (Alice && $Dashboards[Alice] && step < 2) step2();
  // STEP 2 : dashboard Alice retrieved
  // Click button
  // STEP 3 : start migration
  // Transfers approved
  // STEP 4 : connect destinator
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
    message =
      ">>> Please connect to the account you want to migrate from, with Metamask or another Wallet";
    if (Alice) step1();
  }
  async function step1() {
    step = 1;
    message = `<<< Origin account connected, retreiving AAVE dashboard...`;
    startMigration = false;
    if (Alice && $Dashboards[Alice]) step2();
  }
  async function step2() {
    step = 2;
    message = ">>> Select what positions to migrate, and start migration";
    startMigration = true;
  }
  async function step3() {
    console.log("STEP3", address, Alice);
    if (address != Alice) {
      message = "<<< Connect first our browser wallet with origin account !";
      step2();
    }
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
          const amount = `${_bal(deposit.amount, deposit.decimals)} ${
            deposit.symbol
          }`;
          message = `>>> Approve the transfer of your ${nd} deposits with your browser wallet`;
          txsDeposit[ic] = FlashAccountsContract.approveTransfer(
            deposit,
            signer
          );
          amounts[ic] = amount;
          ic++;
        }
        for await (const txDeposit of txsDeposit) {
          console.log(`TX1.${iw + 1}/${nd} CALL`, txDeposit);
          txsWait[iw] = txDeposit.wait();
          iw++;
        }
        for await (const tx of txsWait) {
          message = `<<< Waiting approvals... ${ia + 1}/${nd} deposit${
            ia > 0 ? "s" : ""
          } approved`;
          console.log(`TX1.${ia + 1}/${nd} END`, tx);
          ia++;
        }
      }
      step4();
    } catch (e) {
      message = "<<< Transaction failed";
      console.error(e);
    }
  }
  async function step4() {
    step = 4;
    message =
      ">>> Please connect to the account you want to migrate to, with Metamask or another Wallet";
    if (Bob) step5();
  }
  async function step5() {
    console.log("Bob", Bob);
    step = 5;
    message = "<<< Destinator account connected, retreiving AAVE dashboard...";
    if (Bob && $Dashboards[Bob]) step6();
  }
  async function step6() {
    step = 6;
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
          message = `>>> Approve the credit delegation of your ${nl} loans with your browser wallet`;
          txsLoan[ic] = await FlashAccountsContract.approveLoan(loan, signer);
          amounts[ic] = amount;
          ic++;
        }
        for await (const txLoan of txsLoan) {
          console.log(`TX2.${iw + 1}/${nl} CALL`, txLoan);
          txsWait[iw] = txLoan.wait();
          iw++;
        }
        for await (const tx of txsWait) {
          message = `<<< Waiting approvals... ${il + 1}/${nl} loan${
            il > 0 ? "s" : ""
          } approved`;
          console.log(`TX2.${il + 1}/${nl} END`, tx);
          il++;
        }
      }
      step7();
    } catch (e) {
      message = "<<< Transaction failed";
      console.error(e);
    }
  }
  async function step7() {
    step = 7;
    message = ">>> Approve Flash Loan with your browser wallet";
    try {
      const tx = await FlashAccountsContract.callFlashLoanTx(
        positionsAlice,
        Alice,
        Bob,
        signer
      );

      message = `<<< Flash Loan Magic in progress... wait a few seconds`;
      console.log(`TX2`, await tx.wait());
      step8();
    } catch (e) {
      message = "<<< Transaction failed";
      console.error(e);
    }
  }
  async function step8() {
    step = 8;
    message = "<<< Flash Loan succeeded !  refreshing dashboards";
    refresh++;
  }
  async function step9() {
    step = 9;
    message = "<<< Account migrated !";
  }
</script>

<Container bind:address bind:balance bind:network bind:signer>
  <div style="width: 80%;">
    <!-- BUMPER -->
    <div class="sectionbumper fs-sectionbumper">
      <div class="blockimage">
        <img
          src="images/FLSuite-Logo-Full-Dark.svg"
          loading="lazy"
          width="125"
          alt=""
          class="flashlogo"
        />
      </div>
    </div>
    <!-- CONTENTS -->
    <div class="sectioncontents fs-sectioncontents">
      <img
        src="images/FlashPos-SubLogo-Light.svg"
        loading="lazy"
        width="200"
        alt=""
        class="sectionlogoimage"
      />
      <h1>Migrate your positions</h1>

      <p>{message}</p>

      <div class="columnspositions fs-columnspositions w-row">
        <div id="chipFlashPos" class="sectionchip fs-chip">
          <div id="amountDep02ORG" class="textdarkmode button">
            Position Migration
          </div>
        </div>
        {#key refresh}
          <Dashboard address={Alice} name="Origin" />
          <Dashboard address={Bob} name="Destination" />
        {/key}
      </div>
      <div>
        {#if startMigration}
          <h1>Ready to Start Migration?</h1>
          <div class="buttonwrapper">
            <div id="migrateFlashPos" class="mainbutton">
              <div
                on:click={step3}
                id="amountDep02ORG"
                class="textlightmode buttodarkmode"
              >
                Start Migration
              </div>
            </div>
          </div>
        {/if}
        <small>step {step}</small> <br />
        <small>Alice {Alice}</small> <br />
        <small>Bob {Bob}</small> <br />
      </div>
    </div>
  </div></Container
>

<style>
  .fs-sectioncontents {
    padding-top: 20px;
    background-color: white;
    border-radius: 0 0 20px 20px;
  }

  .fs-sectionbumper {
    border-bottom: none;
    border-radius: 20px 20px 0 0;
  }

  .fs-columnspositions {
    position: relative;
    margin-top: 40px;
  }
  .fs-chip {
    position: absolute;
    top: -14px;
    z-index: 1;
  }
  .fs-col-origin {
    margin-right: 5px;
  }
  .fs-col-destination {
    margin-left: 5px;
  }
</style>
