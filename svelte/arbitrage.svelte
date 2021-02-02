<svelte:options tag="flashsuite-arbitrage" immutable={true} />

<script>
  import getPriceData from "../lib/getPriceData.mjs";
  import getSpreadData from "../lib/getSpreadData.mjs";

  let loading;
  // let uniswapPrice = 0;
  // let sushiswapPrice = 0;
  // let balancerPrice = 0;
  // let bancorPrice = 0;
  // let kyberPrice = 0;
  // let crypto_comPrice = 0;
  let priceData;
  

  const pairs = [
    {id: 'DAI_WETH', text: 'DAI-WETH', asset1: 'DAI', asset2: 'WETH', asset1Decimals: 18, asset2Decimals: 18},
    {id: 'USDC_WETH', text:'USDC-WETH',  asset1: 'USDC', asset2: 'WETH', asset1Decimals: 6, asset2Decimals: 18},
    {id: 'USDT_WETH', text: 'USDT-WETH',  asset1: 'USDT', asset2: 'WETH', asset1Decimals: 6, asset2Decimals: 18}
  ];

  const dexes = ['uniswap', 'sushiswap', 'balancer', 'bancor', 'kyber'];

  // const dexPairs = dexes.flatMap(
  //   (v, i) => dexes.slice(i+1).map( w => v + '/' + w)
  // );

  const computeSpread = (price1, price2) => `${(price1 / price2 - 1) * 100}%`;

  let selectedPair = pairs[0];

  async function getPrices() {
    const data = await getPriceData({pair: selectedPair});
    console.log('priceData', data);
    priceData = data;
  }

 async function onReloadPrices() {
    loading = true;
    await getPrices();
    loading = false
  }

</script>


<h1 class='big'>FlashArb</h1>
<!-- svelte-ignore a11y-no-onchange -->
<select bind:value={selectedPair} on:change="{() => onReloadPrices()}">
  {#each pairs as pair}
    <option value={pair}>
      {pair.text}
    </option>
  {/each}
</select>


{#await getPrices()}
  <p>Loading</p>
{:then}
  {#if loading}
    <p>Fetching</p>
    {:else}
    <p>Price on Uniswap: {priceData.uniswapPrice}</p>
    <p>Price on Sushiswap: {priceData.sushiswapPrice}</p>
    <p>Price on Balancer: {priceData.balancerPrice}</p>
    <p>Price on Bancor: {priceData.bancorPrice}</p>
    <p>Price on Kyber: {priceData.kyberPrice}</p>
    <div class="grid-container">
      <div class='first-col'>
        <div class='grid-item'>FlashArb</div>
        {#each dexes as rowHeaderDex}
          <div class="grid-item">{rowHeaderDex}</div>
        {/each}
      </div>
      {#each dexes as colHeaderDex}
        <div class="grid-item">{colHeaderDex}</div>
      {/each}
      {#each dexes as colDex, i}
        {#each dexes as rowDex, j}
          <div class="grid-item">{i!==j ? computeSpread(priceData[`${colDex}Price`], priceData[`${rowDex}Price`]) : ''}</div>
          {/each}
      {/each}
    </div>
  {/if}
{/await}

<!-- // async function getSpreads() {
  //   const data = await getSpreadData();
  //   console.log('spreadData', data);
  //   uniSushi = data.uniSushi;
  //   sushiUni = data.sushiUni;
  //   // uniBalancer
  //   // balancerUni 
  //   // uniBancor 
  //   // bancorUni 
  //   // uniKyber 
  //   // kyberUni 
  //   // sushiBalancer 
  //   // balancerSushi
  //   // sushiBancor
  //   // bancorSushi
  //   // sushiKyber
  //   // kyberSushi
  //   // balancerBancor
  //   // bancorBalancer
  //   // balancerKyber
  //   // kyberBalancer
  //   // bancorKyber 
  //   // kyberBancor
  // } -->

  <style>
  .grid-container {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    padding: 10px;
  }
  .grid-item {
  background-color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.8);
  padding: 10px;
  font-size: 1rem;
  text-align: center;
  }

  .first-col{
    grid-column: 1 /1;
    grid-row: 1/7;
  }
  </style>