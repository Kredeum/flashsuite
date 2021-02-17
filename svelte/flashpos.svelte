<script>
  import { ethers } from 'ethers';
  import { onMount } from 'svelte';
  import FlashPosContract from '../lib/contracts/FlashPos.mjs';
  import Dashboard from './dashboard.svelte';
  import { Dashboards } from './dashboards.mjs';
  import Container from './container.svelte';
  import { signer, addresses, chainId } from './metamask.mjs';

  // exports Metamask
  let signerBalance = 0;
  let provider;

  let origin = '';
  let destination = '';
  let originComponent;

  onMount(async function () {
    // console.log('FLASHPOS ONMOUNT');
    provider = ethers.getDefaultProvider('kovan', {
      etherscan: 'D2VVP49VXFTGY8WX87EES8WFDCFP62FKE7',
      infura: '6ac00f9d600e454db045e9af71d40507',
      alchemy: '70Tyw--U9skJ1GleOEv6RvZEYM7X7SU9',
      // pocket: process.env.POCKET_API_KEY,
    });
    provider = new ethers.providers.EtherscanProvider('kovan' , 'D2VVP49VXFTGY8WX87EES8WFDCFP62FKE7' );
    // provider = new ethers.providers.InfuraProvider('kovan' , '6ac00f9d600e454db045e9af71d40507' );
    // provider = new ethers.providers.AlchemyProvider('kovan' , '70Tyw--U9skJ1GleOEv6RvZEYM7X7SU9' );
    // provider = window.ethereum;
    // provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');

    // console.log('PROVIDER', provider);
    await FlashPosContract.Init(false);
    step0();
  });

  $: ethersSigner = new ethers.providers.Web3Provider(ethereum).getSigner();

  let positionsAlice = [];
  let startMigration = false;
  let migrationInProgress = false;
  let step = 0;
  let message = '';
  let message2 = '';
  let originMessage = '';
  let refresh = 0;
  let showSpinner = false;
  let showAnimation = false;

  const ethscan = 'https://kovan.etherscan.io';

  function _bal(_balance, _decimals) {
    const [ent, dec] = ethers.utils.formatUnits(_balance, _decimals).split('.');
    return ent + '.' + dec.substring(0, 3);
  }

  // NETWORK MUST BE KOVAN
  $: if ($chainId && $chainId.toLowerCase() != '0x2a') {
    alert('FlashAccount is in beta mode ! only available on Kovan\nPlease switch to the Kovan testnet');
  }

  // FIRST ADDRESS IS origin, SECOND ADDRESS BOB
  $: if ($signer) {
    if (!origin) {
      origin = $signer;
    } else if (!destination) {
      destination = $signer;
    }
  }
  function handleRefresh() {
    refresh++;
    // console.log('handleRefresh', refresh);
  }
  async function checkSigner(_label) {
    let ret = false;
    const addr = _label === 'Origin' ? origin : destination;

    if (addr == $signer) {
      signerBalance = await provider.getBalance($signer);
      if (signerBalance == 0) {
        message2 = 'ETH balance of this account is to low to proceed, you need to transfer some ETH to pay gas';
        alert(message2);
      } else {
        ret = true;
      }
    } else {
      console.log(`Wrong ${_label} account !`, addr, $signer);
      message2 = `Connect your wallet with ${_label} account !`;
      alert(message2);
    }
    console.log('checkSigner', addr, _label, '=>', ret);
    return ret;
  }

  // STEP 0 : initial state
  $: if (step == 0 && origin) step1(); // origin changed
  // STEP 1 : origin exists
  $: if (step == 1 && origin && $Dashboards[origin]) step2(); // dashboard origin changed
  // STEP 2 : dashboard origin retrieved
  // Click "Start migration" button
  // STEP 3 : start migration
  // Transfers approved
  // STEP 4 : connect destination
  $: if (step == 4 && destination) step4(); // destination changed
  // STEP 5 : $signer destination defined
  $: if (step == 5 && destination && $Dashboards[destination]) step6();
  // STEP 6 : dashboard destination retreived
  // Transfers approved
  // STEP 7 : call flashloan
  // Flashloan approval
  // STEP 8 : flashloan succeeded
  // Refresh dashboards
  // STEP 9 : final state, positions migrated

  async function step0() {
    step = 0;
    originMessage = 'Please connect to the account you want to migrate from';
    if (origin) step1();
  }
  async function step1() {
    step = 1;
    originMessage = 'Origin account connected, retrieving AAVE positions...';
    startMigration = false;
    if (origin && $Dashboards[origin]) step2();
  }
  async function step2() {
    step = 2;
    originMessage = 'Select the deposits and loans you want to migrate';
    startMigration = true;
  }
  async function step3() {
    handleRefresh();

    if (await checkSigner('Origin')) {
      step = 3;
      startMigration = false;
      migrationInProgress = true;
      positionsAlice = $Dashboards[origin].filter((pos) => pos.checked);

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
            message = `Please approve the transfer of your ${nd} deposit${nd > 1 ? 's' : ''} with your browser wallet`;
            txsDeposit[ic] = FlashPosContract.approveTransfer(deposit, ethersSigner);
            amounts[ic] = amount;
            ic++;
          }
          message2 = `${nd} approval transaction${nd > 1 ? 's' : ''} sent`;
          message = `Please approve the transfer of your ${nd} deposit${nd > 1 ? 's' : ''}`;

          for await (const txDeposit of txsDeposit) {
            console.log(`TX1.${iw + 1}/${nd} CALL ${ethscan}/tx/${txDeposit.hash}`);
            txsWait[iw] = txDeposit.wait();
            iw++;
          }
          showSpinner = true;
          for await (const tx of txsWait) {
            message2 = `Waiting transactions completion... ${ia + 1}/${nd} deposit${nd > 1 ? 's' : ''} completed`;
            console.log(`TX1.${ia + 1}/${nd} END`, tx);
            ia++;
          }
          showSpinner = false;
          message2 = `${nd > 1 ? 'All ' + nd + ' transactions for deposit transfer' : 'transaction for deposit transfer'}${nd > 1 ? 's' : ''} completed ✅`;
        }
        step4();
      } catch (e) {
        message2 = 'Transaction failed';
        console.error(e);
      }
    }
  }
  async function step4() {
    step = 4;
    if (destination) {
      if (destination != origin) step5();
      else message = 'Please connect your Destination to a different account than Origin';
    } else {
      message = 'Please connect your Destination account';
    }
  }
  async function step5() {
    step = 5;
    message2 = '';
    message = 'Destination account connected, retrieving AAVE positions...';
    showSpinner = true;
    if (destination && $Dashboards[destination]) step6();
  }
  async function step6() {
    step = 6;
    if (await checkSigner('Destination')) {
      showSpinner = false;
      message2 = 'Positions of the destination account retrieved!';

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
            message = `Approve the ${nl > 1 ? `${nl} transactions` : 'transaction'} to borrow the loan${nl > 1 ? 's' : ''} you want to migrate`;
            txsLoan[ic] = await FlashPosContract.approveLoan(loan, ethersSigner);
            amounts[ic] = amount;
            ic++;
          }
          showSpinner = true;
          message = `Waiting for approval to take on ${nl} loan${nl > 1 ? 's' : ''} on behalf of the destination account`;
          message2 = `${nl} credit delegation transaction${nl > 1 ? 's' : ''} sent`;
          for await (const txLoan of txsLoan) {
            console.log(`TX2.${iw + 1}/${nl} CALL ${ethscan}/tx/${txLoan.hash}`);
            txsWait[iw] = txLoan.wait();
            iw++;
          }
          for await (const tx of txsWait) {
            message2 = `Waiting transactions completion... ${il + 1}/${nl} loan${il > 1 ? 's' : ''} transaction${nl > 1 ? 's' : ''} completed`;
            console.log(`TX2.${il + 1}/${nl} END`, tx);
            il++;
          }
          showSpinner = false;
          message2 = `${nl > 1 ? 'All ' + nl + ' loans' : 'Loan'} transaction${nl > 1 ? 's' : ''} completed ✅`;
        }
        step7();
      } catch (e) {
        message2 = '<<< Transaction failed';
        console.error(e);
      }
    } else {
      destination = '';
      step4();
    }
  }
  async function step7() {
    step = 7;
    message = 'Please approve the Flash Loan transaction to complete the migration of the selected positions';

    try {
      const tx = await FlashPosContract.callFlashLoanTx(positionsAlice, origin, destination, ethersSigner);
      console.log(`TX3 FLASH LOAN ${ethscan}/tx/${tx.hash}`);
      message2 = '';
      showAnimation = true;
      message = `Flash Loan Magic in progress... please wait a few seconds`;
      showSpinner = true;
      const txf = await tx.wait();
      console.log(`TX3 FLASH LOAN END`), txf;
      step8();
    } catch (e) {
      showAnimation = false;
      message2 = 'Transaction failed';
      console.error(e);
    }
  }
  async function step8() {
    step = 8;
    showSpinner = false;
    showAnimation = false;
    message = 'Migration complete! 🎉 ';
    originComponent.handleGetDashboard();
    setTimeout(step9, 10000);
  }
  async function step9() {
    step = 9;
    message = '';
    message2 = '';
    step0();
  }
</script>

<Container>
  <div style="width: 80%;">
    <!-- BUMPER -->
    <div class="sectionbumper fs-sectionbumper">
      <div class="blockimage">
        <img src="images/FLSuite-Logo-Full-Dark.svg" loading="lazy" width="125" alt="" class="flashlogo" />
      </div>
    </div>
    <!-- CONTENTS -->
    <div class="sectioncontents fs-sectioncontents">
      <img src="images/FlashPos-SubLogo-Light.svg" loading="lazy" width="200" alt="" class="sectionlogoimage" />
      <h1>Migrate your Aave positions</h1>

      <div class="columnspositions fs-columnspositions w-row">
        <div id="chipFlashPos" class="sectionchip fs-chip">
          <div id="amountDep02ORG" class="textdarkmode button">Position Migration</div>
        </div>
        <Dashboard isorigin={true} bind:address={origin} other={destination} ribbonMessage={originMessage} bind:this={originComponent} />
        <Dashboard isorigin={false} bind:address={destination} other={origin} />
      </div>
      {#if showAnimation}
        <img src="images/flashsuite_animation_200.gif" style="width:100px;" alt="flashsuite-animation" />
      {/if}
      <div class="w-100">
        {#if startMigration}
          <h1 class="align-center">Ready to start migrating your positions?</h1>
          <div class="buttonwrapper">
            <div id="migrateFlashPos" class="mainbutton fs-mainbutton">
              <div on:click={step3} id="amountDep02ORG" class="textlightmode buttodarkmode">Start Migration</div>
            </div>
          </div>
        {/if}
        {#if true}
          <div class="stepsprocesscontents">
            <div class="stepscolumnstop w-row">
              <div class="stepcolumn doingpurple w-col w-col-4">
                <div id="stepAction1" class="textlightmode instep">1. Approve deposit(s) migration</div>
              </div>
              <div class="stepcolumn w-col w-col-4 {step >= 6 ? 'doingpurple' : 'inactivegrey'}">
                <div id="stepAction2" class="textlightmode instep">2. Approve loan(s) migration</div>
              </div>
              <div class="stepcolumn w-col w-col-4 {step >= 7 ? 'doingpurple' : 'inactivegrey'}">
                <div id="stepAction3" class="textlightmode instep">3. Finalize migration</div>
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
                  <img class="fs-spinner" alt="spinner" src="images/spinner_purple.svg" />
                {/if}
              </div>
            </div>
          </div>
        {/if}
        <!-- <small>
          step {step}<br />
          origin {origin}<br />
          destination {destination}<br />
          $signer {$signer}<br />
          signerBalance {signerBalance}<br />
          <div on:click={handleRefresh}>refresh</div>
        </small> -->
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
