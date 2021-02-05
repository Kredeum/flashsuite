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
  let address = "";
  let balance = -1;

  let dashboards = {};
  let positions = {};
  let nd = 0;
  let Alice = "";
  let Bob = "";
  let signer;
  let startMigration = false;
  let step = 0;
  let message;
  let again = true;
  function refresh() {
    again = Boolean(!again);
  }

  // NETWORK MUST BE KOVAN
  $: if (network && network != "kovan") {
    alert("FlashAccount is in beta mode ! only available on Kovan\nPlease switch to the Kovan testnet");
  }

  // FIRST ADDRESS IS ALICE, SECOND ADDRESS BOB
  $: if (address) {
    if (Alice) {
      if (address != Alice) {
        if (step < 3) {
          Alice = address;
          step12("New origin");
        } else {
          if (Bob) {
            if (address != Bob) {
              // third account , reset by refreshing the browser
              document.location.reload();
            }
          } else {
            Bob = address;
            step56();
          }
        }
      }
    } else {
      Alice = address;
      step12("Origin");
    }
  }

  // BALANCE TO LOW
  $: if (address && network == "kovan" && balance == 0) {
    alert("ETH balance is to low to proceed, you need some ETH to pay gas");
  }

  $: console.log("STEP:", step);

  Dashboards.subscribe((value) => {
    dashboards = value;
    nd = Object.keys(dashboards).length;
    if (nd >= 1 && step <= 2) step23();
    else if (nd >= 2 && step == 5) step67();
    else if (nd >= 2 && step == 8) step9();
  });

  function _bal(_balance, _decimals) {
    const [ent, dec] = ethers.utils.formatUnits(_balance, _decimals).split(".");
    return ent + "." + dec.substring(0, 3);
  }

  onMount(async function () {
    await FlashAccountsContract.Init(true);
    step01();
  });

  // step0 initial
  // step1  address Alice defined
  // step2 dashboard Alice retrieved
  // step3 start migration
  // step4.n transfers allowed
  // step5 adress Bob defined
  // step6 dashboard Bob retreived
  // step7.n loans allowed - Approve Flash Loan
  // step8 Flash Loan succeeded
  // step9 dashboards refresh
  async function step01() {
    step = 0;
    message = ">>> Please connect to the account you want to migrate from, with Metamask or another Wallet";
  }
  async function step12(_some) {
    step = 1;
    message = `<<< ${_some} account connected, retreiving AAVE dashboard...`;
    startMigration = false;
  }
  async function step23() {
    step = 2;
    message = ">>> Ready to start the migration ?";
    startMigration = true;
  }
  async function step34() {
    step = 3;
    startMigration = false;
    positions = dashboards[Alice].tokens.filter((pos) => pos.checked);

    const deposits = positions.filter((pos) => pos.type == 0);
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
          message = `>>> Approve the transfer of your ${nd} deposits with your browser wallet`;
          txsDeposit[ic] = FlashAccountsContract.approveTransfer(deposit, signer);
          amounts[ic] = amount;
          ic++;
        }
        for await (const txDeposit of txsDeposit) {
          console.log(`TX1.${iw + 1}/${nd} CALL`, txDeposit);
          txsWait[iw] = txDeposit.wait();
          iw++;
        }
        for await (const tx of txsWait) {
          message = `<<< Waiting approvals... ${ia + 1}/${nd} deposit${ia > 0 ? "s" : ""} approved`;
          console.log(`TX1.${ia + 1}/${nd} END`, tx);
          ia++;
        }
      }
      step45();
    } catch (e) {
      message = "<<< Transaction failed";
      console.error(e);
    }
  }
  async function step45() {
    step = 4;
    message = ">>> Please connect to the account you want to migrate to, with Metamask or another Wallet";
  }
  async function step56() {
    step = 5;
    message = "<<< Destinator account connected, retreiving AAVE dashboard...";
  }
  async function step67() {
    step = 6;
    const loans = positions.filter((pos) => pos.type != 0);
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
          message = `<<< Waiting approvals... ${il + 1}/${nl} loan${il > 0 ? "s" : ""} approved`;
          console.log(`TX2.${il + 1}/${nl} END`, tx);
          il++;
        }
      }
      step78();
    } catch (e) {
      message = "<<< Transaction failed";
      console.error(e);
    }
  }
  async function step78() {
    step = 7;
    message = ">>> Approve Flash Loan with your browser wallet";
    try {
      const tx = await FlashAccountsContract.callFlashLoanTx(positions, Alice, Bob, signer);

      message = `<<< Flash Loan Magic in progress... wait a few seconds`;
      console.log(`TX2`, await tx.wait());
      step89();
    } catch (e) {
      message = "<<< Transaction failed";
      console.error(e);
    }
  }
  async function step89() {
    step = 8;
    message = "<<< Flash Loan succeeded !  refreshing dashboards";
    refresh();
  }
  async function step9() {
    step = 9;
    message = "<<< Account migrated !";
  }
</script>

<Container bind:address>
  <div style="height: 1000px; width: 80%;">
    <!-- BUMPER -->BUMPER
    <div class="sectionbumper fs-sectionbumper">
      <div class="blockimage">
        <img src="images/FLSuite-Logo-Full-Dark.svg" loading="lazy" width="125" alt="" class="flashlogo" />
      </div>
    </div>
    <!-- CONTENTS -->
    <div class="sectioncontents fs-sectioncontents">
      <img src="images/FlashPos-SubLogo-Light.svg" loading="lazy" width="200" alt="" class="sectionlogoimage" />
      <h1>Migrate your positions</h1>
      <p class="paragraph">Use 2 accounts to connect and disconnect to FlashSuite when you are prompted.</p>

      <div class="columnspositions fs-columnspositions w-row">
        <div id="chipFlashPos" class="sectionchip fs-chip">
          <div id="amountDep02ORG" class="textdarkmode button">Position Migration</div>
        </div>

        <Dashboard user={Alice} name="Origin" addresses={Object.keys($Dashboards)} />
        <Dashboard user={Bob} name="Destination" addresses={Object.keys($Dashboards)} />

      </div>
    </div>
  </div>
</Container>

<style>
  .fs-sectioncontents {
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
