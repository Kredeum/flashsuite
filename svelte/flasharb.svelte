<script>
  import { onMount } from "svelte";
  import Container from "./container.svelte";
  import getPriceData from "../lib/getPriceData.mjs";
  import getSpreadData from "../lib/getSpreadData.mjs";
  import getEthPriceInUSD from "../lib/getEthPrice.mjs";

  const NUMBER_PRICE_DIGITS_SHOWN = 8;

  let isPairDropdownOpen = false;

  let loading;
  // let uniswapPrice = 0;
  // let sushiswapPrice = 0;
  // let balancerPrice = 0;
  // let bancorPrice = 0;
  // let kyberPrice = 0;
  // let crypto_comPrice = 0;
  let priceData;

  let ethPrice = 1747; // to remove after demo
  let amountToBorrow = 0;
  let grossProfit = 0;
  let flashloanFee = 0;
  let gasCost = 0;

  let selectedSpread = { spread: 0, dex1: "", dex2: "" };

  $: amountToBorrowUSD = amountToBorrow * ethPrice;
  $: grossProfit = (amountToBorrowUSD * Math.abs(selectedSpread.spread)) / 100;
  $: flashloanFee = amountToBorrowUSD * 0.0009;
  $: tradingFee1 = amountToBorrowUSD * getTradeFee(selectedSpread.dex1);
  $: tradingFee2 = amountToBorrowUSD * getTradeFee(selectedSpread.dex2);
  $: estimatedProfit =
    grossProfit - flashloanFee - gasCost - tradingFee1 - tradingFee2;

  const pairs = [
    {
      id: "WETH_DAI",
      text: "WETH-DAI",
      asset1: "WETH",
      asset2: "DAI",
      asset1Decimals: 18,
      asset2Decimals: 18,
    },
    {
      id: "WETH_USDC",
      text: "WETH-USDC",
      asset2: "USDC",
      asset1: "WETH",
      asset1Decimals: 18,
      asset2Decimals: 6,
    },
    {
      id: "WETH_USDT",
      text: "WETH-USDT",
      asset1: "WETH",
      asset2: "USDT",
      asset1Decimals: 18,
      asset2Decimals: 6,
    },
  ];

  const dexes = ["uniswap", "sushiswap", "balancer", "bancor", "dodo"];

  const computeSpread = (price1, price2) => {
    const ratio = price1 / price2;
    const spread = (price1 / price2 - 1) * 100;
    if (Number.isNaN(spread)) return null;
    return spread.toPrecision(3);
  };

  const getSpreadClass = (spread) => {
    if (!spread) return "fs-black-spread";

    const absoluteSpread = Math.abs(spread);
    if (absoluteSpread < 0.1) {
      return "fs-red-spread";
    } else if (absoluteSpread < 0.2) {
      return "fs-black-spread";
    } else {
      return "fs-green-spread";
    }
  };

  const getTradeFee = (exchange) => {
    // uniswap 0.3%
    // sushiswap 0.3%
    // balancer variable
    // bancor 0
    // dodo 0.3%
    if (exchange === "balancer") {
      return 0.0025;
    } else if (exchange === "bancor") {
      return 0;
    } else {
      return 0.003;
    }
  };

  let selectedPair = pairs[1];

  onMount(async () => {
    ethPrice = await getEthPriceInUSD();
    console.log("ethPrice", ethPrice);
  });

  async function getPrices() {
    const data = await getPriceData({ pair: selectedPair });
    console.log("priceData", data);
    priceData = data;
  }

  async function onReloadPrices() {
    loading = true;
    await getPrices();
    loading = false;
  }

  function onSelectSpread(dex1, dex2) {
    console.log("dex1", dex1, dex2);
    const spread = computeSpread(
      priceData[`${dex1}Price`],
      priceData[`${dex2}Price`]
    );
    console.log("spreadddd", spread);
    selectedSpread = {
      spread,
      dex1,
      dex2,
    };
  }
</script>

<Container>
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
        src="images/FlashArb-Logo-Light-Mode.svg"
        loading="lazy"
        width="200"
        alt=""
        class="sectionlogoimage"
      />
      <h1>Choose Pair &amp; Price Discrepancy Opportunities</h1>
      <p class="paragraph">Simulate an arbitrage trade with a flash loan.</p>
      <!-- MATRIX -->
      <div class="subpricecostcontents" style="position: relative;">
        <div id="chipFlashPos" class="sectionchip fs-chip">
          <div id="amountDep02ORG" class="textdarkmode button">Arbitrage</div>
        </div>
        {#await getPrices()}
          <p style="text-align: center;">Loading...</p>
        {:then}
          {#if loading}
            <p style="text-align: center;">Fetching...</p>
          {:else}
            <div class="grid-container">
              <div class="grid-item" style="grid-column: 1/1; grid-row: 1/1;">
                <div
                  data-hover=""
                  data-delay="0"
                  class="tokenpairsdropdown w-dropdown"
                >
                  <div
                    class="dropdown-toggle tokenpairs w-dropdown-toggle"
                    on:click={() => {
                      isPairDropdownOpen = !isPairDropdownOpen;
                    }}
                  >
                    <div class="arrow lightmode w-icon-dropdown-toggle" />
                    <div id="defaultPair" class="textlightmode">
                      {selectedPair.text}
                    </div>
                  </div>
                  <nav
                    class="dropdown-list w-dropdown-list {isPairDropdownOpen
                      ? 'w--open'
                      : ''}"
                  >
                    {#each pairs as pair}
                      <div
                        id="eth-daiPair"
                        class="dropdownitem w-dropdown-link fs-cursor-pointer"
                        on:click={() => {
                          selectedPair = pair;
                          isPairDropdownOpen = false;
                          onReloadPrices();
                        }}
                      >
                        {pair.text}
                      </div>
                    {/each}
                  </nav>
                </div>
              </div>
              {#each dexes as rowHeaderDex, k}
                <div
                  class="grid-item fs-pink-cell"
                  style="grid-row: {k + 2} / {k + 2}; grid-column: 1/1;"
                >
                  <div class="fs-exchange-name">
                    {rowHeaderDex}
                  </div>
                  <div class="fs-exchange-price">
                    {priceData[`${rowHeaderDex}Price`].substring(
                      0,
                      NUMBER_PRICE_DIGITS_SHOWN
                    )}
                  </div>
                </div>
              {/each}
              {#each dexes as colHeaderDex, l}
                <div
                  class="grid-item fs-grey-cell fs-exchange-name"
                  style="grid-row: 1 / 1; grid-column: {l + 2}/{l + 2};"
                >
                  <div class="fs-exchange-name">
                    {colHeaderDex}
                  </div>
                  <div class="fs-exchange-price">
                    {priceData[`${colHeaderDex}Price`].substring(
                      0,
                      NUMBER_PRICE_DIGITS_SHOWN
                    )}
                  </div>
                </div>
              {/each}
              {#each dexes as colDex, i}
                {#each dexes as rowDex, j}
                  <div
                    class="grid-item {i == j
                      ? 'fs-grey-cell-empty'
                      : ''} fs-spread-cell"
                    style="grid-column: {i + 2}/{i + 2}; grid-row: {j + 2}/{j +
                      2};"
                    on:click={() => i !== j && onSelectSpread(colDex, rowDex)}
                    class:selectedSpread={selectedSpread.dex1 == colDex &&
                      selectedSpread.dex2 == rowDex}
                  >
                    {#if i !== j}
                      <!-- TODO: avoid computeSpread duplication -->
                      <span
                        class="fs-spread {getSpreadClass(
                          computeSpread(
                            priceData[`${colDex}Price`],
                            priceData[`${rowDex}Price`]
                          )
                        )}"
                      >
                        {computeSpread(
                          priceData[`${colDex}Price`],
                          priceData[`${rowDex}Price`]
                        ) || "-"}%
                      </span>
                      <span class="fs-spread-select">Select</span>
                    {/if}
                  </div>
                {/each}
              {/each}
            </div>
          {/if}
        {/await}
      </div>

      <div class="fs-simulation-section">
        <div class="fs-simulation-left columntitlebar amount">
          <h3 class="columnTitle">Amount to borrow</h3>
          <input
            bind:value={amountToBorrow}
            class="inputtextfield faflashloan w-embed fs-amount-field"
          />
        </div>
        <div class="fs-simulation-right">
          <div id="DepositPosition" class="columnpricecost w-col">
            <div class="columntitlebar" style="padding-left: 0;">
              <h2 id="columnTitle">Cost-Profit analysis</h2>
              <div class="textlightmode rates">(in USD)</div>
            </div>
            <div class="w-layout-grid gridcosts">
              <div class="textlightmode label02">Gross profit</div>
              <div id="costArbitrage" class="textlightmode numbers">
                {grossProfit === 0 ? "Select a spread" : grossProfit}
              </div>
              <div class="textlightmode label02">Flashloan Fee</div>
              <div id="costFlashLoan" class="textlightmode numbers">
                {flashloanFee}
              </div>
              <div class="textlightmode label02">Gas Cost</div>
              <div id="costGas" class="textlightmode numbers">
                <input
                  bind:value={gasCost}
                  class="inputtextfield faflashloan w-embed fs-amount-field fs-cost-field"
                />
              </div>
              <div class="textlightmode label02">Trading Fees (1)</div>
              <div id="costPlatform01" class="textlightmode numbers">
                {tradingFee1.toFixed(5)}
              </div>
              <div class="textlightmode label02">Trading Fees (2)</div>
              <div id="costPlatform02" class="textlightmode numbers">
                {tradingFee2.toFixed(5)}
              </div>
            </div>
            <div
              id="DepositPosition"
              class="columnamountprofit w-col"
              style="margin-top: 16px"
            >
              <div class="columntitlebar profit" style="padding-left: 0;">
                <h2 id="columnTitle" style="font-size: 16px">
                  Estimated Net Profit 🤑
                </h2>
                <div id="differenceProfit" class="textlightmode numbers big">
                  {estimatedProfit.toFixed(5)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</Container>

<style>
  .subpricecostcontents {
    margin-top: 20px;
    margin-bottom: 0;
    padding-top: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 558px;
  }

  .dropdown-toggle {
    min-width: 155px;
  }

  .gridcosts {
    grid-template-columns: 1fr 0.8fr;
    align-items: center;
  }

  .dropdown-list {
    border-radius: 10px;
  }
  .fs-chip {
    position: absolute;
    top: -14px;
    z-index: 1;
  }

  .fs-sectioncontents {
    background-color: white;
    border-radius: 0 0 20px 20px;
    padding-top: 20px;
  }

  .fs-sectionbumper {
    border-bottom: none;
    border-radius: 20px 20px 0 0;
    background: rgb(255 255 255 / 15%);
    backdrop-filter: blur(5px);
  }

  .grid-container {
    display: grid;
    grid-column-gap: 10px;
    grid-row-gap: 10px;
    grid-template-columns: repeat(6, 150px);
    /* grid-template-rows: repeat(6, 150px); */
    align-items: center;
    padding: 10px;
  }
  .grid-item {
    height: 70px;
    font-size: 1rem;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  }

  .first-col {
    grid-column: 1/1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .fs-cursor-pointer {
    cursor: pointer;
  }

  .fs-grey-cell {
    border-radius: 10px;
    background-color: #f1f1f1;
  }
  .fs-grey-cell-empty {
    border-radius: 10px;
    background-color: #f9f9f9;
  }

  .fs-pink-cell {
    border-radius: 10px;
    background-color: #fff0fc;
  }

  .fs-exchange-name {
    text-align: center;
    font: normal normal normal 16px/19px Montserrat;
    letter-spacing: 0px;
    color: #241130;
    opacity: 0.9;
    text-transform: capitalize;
    margin-bottom: 4px;
  }

  .fs-exchange-price {
    text-align: center;
    font: normal normal normal 12px/12px Montserrat;
    letter-spacing: 0px;
    color: #241130;
    opacity: 0.5;
    text-transform: capitalize;
  }
  .fs-spread {
    text-align: center;
    font: normal normal bold 20px/24px Montserrat;
    letter-spacing: 0px;
    color: #241130;
    opacity: 1;
    max-width: 120px;
    overflow: hidden;
  }

  .fs-red-spread {
    color: #ff4545;
  }

  .fs-black-spread {
    color: #241130;
  }

  .fs-green-spread {
    color: #3ba34b;
  }

  .fs-spread-select {
    display: none;
    font: normal normal bold 20px/24px Montserrat;
    color: #fff;
  }

  .fs-spread-cell:hover:not(.fs-grey-cell-empty) {
    cursor: pointer;
  }
  .fs-spread-cell:hover:not(.fs-grey-cell-empty) {
    background-color: #a04bce8c;
    border-radius: 50px;
  }
  .fs-spread-cell:hover .fs-spread {
    display: none;
  }

  .fs-spread-cell:hover .fs-spread-select {
    display: block;
  }

  .selectedSpread {
    border: 2px solid #f2def5;
    border-radius: 30px;
  }

  .fs-simulation-section {
    display: flex;
    align-items: flex-start;
    width: 100%;
  }

  .fs-simulation-left {
    display: flex;
  }
  .fs-simulation-right {
    min-width: 36%;
    margin-top: 6px;
  }

  .fs-amount-field {
    width: 230px;
    height: 38px;
    padding-left: 8px;
    outline: 0;
  }

  .fs-cost-field {
    width: 100%;
  }
</style>
