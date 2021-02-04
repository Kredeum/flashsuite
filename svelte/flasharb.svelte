<script>
  import Container from "./container.svelte";
  import getPriceData from "../lib/getPriceData.mjs";
  import getSpreadData from "../lib/getSpreadData.mjs";

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

  const dexes = ["uniswap", "sushiswap", "balancer", "bancor", "kyber"];

  const computeSpread = (price1, price2) => (price1 / price2 - 1) * 100;

  // const getSpreadClass = (spread) => {
  //   if(Math.abs(spread) < 0.09)
  // }

  let selectedPair = pairs[0];

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
      <p class="paragraph">
        Connect your primary wallet with enough ETH for gas.
      </p>

      <div class="subpricecostcontents" style="position: relative;">
        <div id="chipFlashPos" class="sectionchip fs-chip">
          <div id="amountDep02ORG" class="textdarkmode button">Arbitrage</div>
        </div>
        {#await getPrices()}
          <p>Loading</p>
        {:then}
          {#if loading}
            <p>Fetching</p>
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
                    class="grid-item {i == j ? 'fs-grey-cell-lighter' : ''}"
                    style="grid-column: {i + 2}/{i + 2}; grid-row: {j + 2}/{j +
                      2};"
                  >
                    {#if i !== j}
                      <span class="fs-spread">
                        {computeSpread(
                          priceData[`${colDex}Price`],
                          priceData[`${rowDex}Price`]
                        ).toPrecision(3)}%
                      </span>
                    {/if}
                  </div>
                {/each}
              {/each}
            </div>
          {/if}
        {/await}
      </div>
    </div>
  </div>
</Container>

<style>
  .subpricecostcontents {
    min-height: none;
    margin-top: 20px;
    padding-top: 40px;
  }

  .dropdown-toggle {
    min-width: 155px;
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
  .fs-grey-cell-lighter {
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
    opacity: 0.7;
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
</style>
