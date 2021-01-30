<svelte:options tag="flashsuite-arbitrage" immutable={true} />

<script>
  import getPriceData from "../lib/getPriceData.mjs";

  let loading;
  let uniswapPrice = 0;
  let sushiswapPrice = 0;
  let spread;

  const pairs = [
    {id: 'DAI_WETH', text: 'DAI-WETH', asset1: 'DAI', asset2: 'WETH'},
    {id: 'USDC_WETH', text:'USDC-WETH',  asset1: 'USDC', asset2: 'WETH'},
    {id: 'USDT_WETH', text: 'USDT-WETH',  asset1: 'USDT', asset2: 'WETH'}
  ];
  let selectedPair = pairs[0];


  async function getPrices() {
    console.log('selectedPair', selectedPair)
    const data = await getPriceData({pair: selectedPair});
    uniswapPrice = data.uniswapPrice;
    sushiswapPrice = data.sushiswapPrice;
    spread = data.spread;
  }

 async function onReloadPrices() {
    loading = true;
    await getPrices();
    loading = false
  }

</script>


<h1>FlashArb</h1>
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
    <p>Price from Uniswap is {uniswapPrice}</p>
    <p>Price from Sushiswap is {sushiswapPrice}</p>
    <p>Spread is: {spread}</p>
  {/if}
{/await}
