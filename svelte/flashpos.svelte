<script>
  import { ethers } from "ethers";
  import { onMount } from "svelte";
  import { Dashboards } from "./stores.mjs";
  import FlashAccountsContract from "../lib/contracts/FlashAccounts.mjs";
  import Dashboard from "./dashboard.svelte";
  import Container from "./container.svelte";

  // exports Metamask
  let address;
  let network;
  let balance;
  let signer;

  let positionsAlice = [];
  let Alice = "";
  let Bob = "";
  let startMigration = false;
  let migrationInProgress = false;
  let step = 0;
  let message = "";
  let message2 = "";
  let originMessage = "";
  let refresh = 0;
  let reget = 0;
  let showSpinner = false;
  let showAnimation = false;
  let healthFactorNextBob = "_";

  function _bal(_balance, _decimals) {
    const [ent, dec] = ethers.utils.formatUnits(_balance, _decimals).split(".");
    return ent + "." + dec.substring(0, 3);
  }

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
        if (step == 4) {
          Bob = address;
        }
      }
    console.log("ADDRESS", address, Alice, Bob, step);
  }

  // BALANCE TO LOW
  function alertBalance() {
    if (address && balance == 0) {
      alert("ETH balance is to low to proceed, you need some ETH to pay gas");
    }
  }
  function handleRefresh() {
    refresh++;
    console.log("handleRefresh FlashPos", refresh);
  }
  function handleReGet() {
    reget++;
    console.log("handleReGet FlashPos", reget);
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

  async function step0() {
    step = 0;
    // message = ">>> Please connect to the account you want to migrate from, with Metamask or another Wallet";
    originMessage = "Please connect to the account you want to migrate from";
    if (Alice) step1();
  }
  async function step1() {
    step = 1;
    // message = ">>> Origin account connected";
    // message2 = `<<< Retreiving AAVE dashboard...`;
    originMessage = "Origin account connected, retrieving AAVE positions...";
    startMigration = false;
    if (Alice && $Dashboards[Alice]) step2();
  }
  async function step2() {
    step = 2;
    // message = ">>> Select what positions to migrate, and start migration";
    // message2 = "<<< Origin dashboard retreived";
    originMessage = "Select the deposits and loans you want to migrate";
    startMigration = true;
  }
  async function step3() {
    handleRefresh();
    if (address != Alice) {
      $Dashboards[Alice] = null;
      Alice = "";
      message2 =
        "<<< Keep your browser wallet connected with same origin account !";
      setTimeout(step0, 2000);
      return;
    }
    console.log("STEP3 APRES", address, Alice);
    step = 3;
    startMigration = false;
    migrationInProgress = true;
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
        alertBalance();

        for (const deposit of deposits) {
          const amount = `${_bal(deposit.amount, deposit.decimals)} ${
            deposit.symbol
          }`;
          message = `Please approve the transfer of your ${nd} deposit${
            nd > 1 ? "s" : ""
          } with your browser wallet`;
          txsDeposit[ic] = FlashAccountsContract.approveTransfer(
            deposit,
            signer
          );
          amounts[ic] = amount;
          ic++;
        }
        // message = `>>> You did approve ${nd} deposit${nd > 1 ? "s" : ""}`;
        // message2 = `<<< ${nd} transaction${nd > 1 ? "s" : ""} sent`;
        message2 = `${nd} approval transaction${nd > 1 ? "s" : ""} sent`;
        message = `Please approve the transfer of your ${nd} deposit${
          nd > 1 ? "s" : ""
        }`;

        for await (const txDeposit of txsDeposit) {
          console.log(`TX1.${iw + 1}/${nd} CALL`, txDeposit);
          txsWait[iw] = txDeposit.wait();
          iw++;
        }
        showSpinner = true;
        for await (const tx of txsWait) {
          // message = `>>> ${ia + 1}/${nd} deposit${ia > 1 ? "s" : ""} completed`;
          // message2 = `<<< Waiting transaction${nd > 1 ? "s" : ""} completion...`;
          message2 = `Waiting transactions completion... ${
            ia + 1
          }/${nd} deposit${nd > 1 ? "s" : ""} completed`;
          console.log(`TX1.${ia + 1}/${nd} END`, tx);
          ia++;
        }
        // message2 = `<<< ${nd > 1 ? "All " + nd + " deposits" : "Deposit"} transaction${nd > 1 ? "s" : ""} completed`;
        showSpinner = false;
        message2 = `${
          nd > 1
            ? "All " + nd + " transactions for deposit transfer"
            : "transaction for deposit transfer"
        }${nd > 1 ? "s" : ""} completed ✅`;
      }
      step4();
    } catch (e) {
      message2 = "Transaction failed";
      console.error(e);
    }
  }
  async function step4() {
    step = 4;
    message = "Please connect your destination account";
    if (Bob) step5();
  }
  async function step5() {
    console.log("Bob", Bob);
    step = 5;
    message2 = "";
    message = "Destination account connected, retrieving AAVE positions...";
    showSpinner = true;
    if (Bob && $Dashboards[Bob]) step6();
  }
  async function step6() {
    step = 6;
    showSpinner = false;
    message2 = "Positions of the destination account retrieved!";

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

        alertBalance();
        for (const loan of loans) {
          const amount = `${_bal(loan.amount, loan.decimals)} ${loan.symbol}`;
          message = `Approve the ${
            nl > 1 ? `${nl} transactions` : "transaction"
          } to borrow the loan${nl > 1 ? "s" : ""} you want to migrate`;
          txsLoan[ic] = await FlashAccountsContract.approveLoan(loan, signer);
          amounts[ic] = amount;
          ic++;
        }
        // message = `>>> You did approve ${nl} loan${nl > 1 ? "s" : ""}`;
        // message2 = `<<< Sending ${nl} transaction${nl > 1 ? "s" : ""}`;
        showSpinner = true;
        message = `Waiting for approval to take on ${nl} loan${
          nl > 1 ? "s" : ""
        } on behalf of the destination account`;
        message2 = `${nl} credit delegation transaction${
          nl > 1 ? "s" : ""
        } sent`;
        for await (const txLoan of txsLoan) {
          console.log(`TX2.${iw + 1}/${nl} CALL`, txLoan);
          txsWait[iw] = txLoan.wait();
          iw++;
        }
        for await (const tx of txsWait) {
          // message = `>>> ${il + 1}/${nl} loan${il > 1 ? "s" : ""} completed`;
          // message2 = `<<< Waiting transaction${nl > 1 ? "s" : ""} completion...`;
          message2 = `Waiting transactions completion... ${il + 1}/${nl} loan${
            il > 1 ? "s" : ""
          } transaction${nl > 1 ? "s" : ""} completed`;
          console.log(`TX2.${il + 1}/${nl} END`, tx);
          il++;
        }
        // message2 = `<<< ${nl > 1 ? "All " + nl + " loans" : "Loan"} transaction${nl > 1 ? "s" : ""} completed`;
        showSpinner = false;
        message2 = `${nl > 1 ? "All " + nl + " loans" : "Loan"} transaction${
          nl > 1 ? "s" : ""
        } completed ✅`;
      }
      step7();
    } catch (e) {
      message2 = "<<< Transaction failed";
      console.error(e);
    }
  }
  async function step7() {
    step = 7;
    // message = ">>> Approve Flash Loan with your browser wallet";
    message =
      "Please approve the final transaction to complete the migration of the selected positions";

    alertBalance();
    try {
      const tx = await FlashAccountsContract.callFlashLoanTx(
        positionsAlice,
        Alice,
        Bob,
        signer
      );
      // message2 = `<<< Flash Loan Magic in progress... wait a few seconds`;
      message2 = "";
      showAnimation = true;
      message = `Flash Loan Magic in progress... please wait a few seconds`;
      showSpinner = true;
      console.log(`TX2`, await tx.wait());
      step8();
    } catch (e) {
      showAnimation = false;
      message2 = "Transaction failed";
      console.error(e);
    }
  }
  async function step8() {
    step = 8;
    // message = ">>> Refresh your browser to start another migration";
    // message2 = "<<< Flash Loan succeeded !  Refreshing dashboards";
    showSpinner = false;
    showAnimation = false;
    message = "Migration complete! 🎉 Refreshing dashboards...";
    message2 = "";
    handleReGet();
  }
  onMount(async function () {
    await FlashAccountsContract.Init(true);
    step0();
  });
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
      <h1>Migrate your Aave positions</h1>

      <div class="columnspositions fs-columnspositions w-row">
        <div id="chipFlashPos" class="sectionchip fs-chip">
          <div id="amountDep02ORG" class="textdarkmode button">
            Position Migration
          </div>
        </div>
        {#key refresh}
          <Dashboard address={Alice} name={'Origin'} bind:origin={Alice} ribbonMessage={originMessage} bind:reget bind:healthFactorChecked={healthFactorNextBob} />
          <Dashboard address={Bob} name={'Destination'} bind:origin={Alice} bind:reget bind:healthFactorNext={healthFactorNextBob} />
        {/key}
      </div>
      {#if showAnimation}
        <img
          src="images/flashsuite_animation_200.gif"
          style="width:100px;"
          alt="flashsuite-animation"
        />
      {/if}
      <div class="w-100">
        {#if startMigration}
          <h1 class="align-center">Ready to start migrating your positions?</h1>
          <div class="buttonwrapper">
            <div id="migrateFlashPos" class="mainbutton fs-mainbutton">
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
        {#if migrationInProgress}
          <div class="stepsprocesscontents">
            <div class="stepscolumnstop w-row">
              <div class="stepcolumn doingpurple w-col w-col-4">
                <div id="stepAction1" class="textlightmode instep">
                  1. Approve deposit(s) migration
                </div>
              </div>
              <div
                class="stepcolumn w-col w-col-4 {step >= 6
                  ? 'doingpurple'
                  : 'inactivegrey'}"
              >
                <div id="stepAction2" class="textlightmode instep">
                  2. Approve loan(s) migration
                </div>
              </div>
              <div
                class="stepcolumn w-col w-col-4 {step >= 7
                  ? 'doingpurple'
                  : 'inactivegrey'}"
              >
                <div id="stepAction3" class="textlightmode instep">
                  3. Finalize migration
                </div>
              </div>
            </div>
            <div class="actionmessage fs-actionmessage">
              <p id="stepActionLabel" class="paragraph instep fs-message-2">
                {message2}
              </p>
              <div style="display: flex;">
                <p id="stepActionLabel" class="paragraph instep fs-message-1">
                  {message}
                </p>
                {#if showSpinner}
                  <img
                    class="fs-spinner"
                    alt="spinner"
                    src="images/spinner_purple.svg"
                  />
                {/if}
              </div>
            </div>
            <!-- <div class="actionprocess">
              <div class="actionresultcolumns w-row">
                <div class="actionresultcolumn01 w-col w-col-4">
                  <p id="actionResult" class="paragraph inaction column01">
                    Action Result
                  </p>
                </div>
                <div class="actionresultcolumn w-col w-col-4">
                  <p id="actionProgressState" class="paragraph inaction">
                    Progress State
                  </p>
                  <div id="platformAddressLogo" class="iconblock">
                    <img
                      src="https://d3e54v103j8qbb.cloudfront.net/plugins/Basic/assets/placeholder.60f9b1840c.svg"
                      loading="lazy"
                      id="stepTokenLogo"
                      alt=""
                      class="placeholderimage"
                    />
                  </div>
                </div>
                <div class="actionresultcolumn w-col w-col-4">
                  <p id="actionLink" class="paragraph inaction">
                    Etherscan link
                  </p>
                  <div id="platformAddressLogo" class="iconblock">
                    <img
                      src="https://d3e54v103j8qbb.cloudfront.net/plugins/Basic/assets/placeholder.60f9b1840c.svg"
                      loading="lazy"
                      id="stepTokenLogo"
                      alt=""
                      class="placeholderimage"
                    />
                  </div>
                </div>
              </div>
            </div> -->
          </div>
        {/if}
      </div>
    </div>
  </div>
</Container>

<style>
  .fs-sectioncontents {
    padding-top: 20px;
    background-color: white;
    border-radius: 0 0 20px 20px;
    min-height: 900px;
    justify-content: flex-start;
  }

  .fs-sectionbumper {
    border-bottom: none;
    border-radius: 20px 20px 0 0;
    background: rgb(255 255 255 / 15%);
    backdrop-filter: blur(5px);
  }

  .fs-columnspositions {
    position: relative;
    margin-top: 40px;
    min-height: 0;
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

  .fs-mainbutton {
    cursor: pointer;
  }

  .fs-actionmessage {
    display: block;
    min-height: 70px;
  }

  .fs-message-1 {
    font-weight: 600;
    font-size: 18px;
  }
  .fs-message-2 {
    color: rgba(36, 17, 48, 0.5);
    font-size: 14px;
    min-height: 24px;
  }

  .fs-spinner {
    width: 20px;
    height: 20px;
    margin-left: 10px;
    animation: spinner 1.5s linear 0s infinite;
  }

  @keyframes spinner {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  .w-100 {
    width: 100%;
  }

  .align-center {
    text-align: center;
  }
</style>
