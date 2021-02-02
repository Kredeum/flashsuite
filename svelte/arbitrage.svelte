<svelte:options tag="flashsuite-arbitrage" immutable={true} />

<script>
  import getPriceData from "../lib/getPriceData.mjs";
  import getSpreadData from "../lib/getSpreadData.mjs";

  let loading;
  let uniswapPrice = 0;
  let sushiswapPrice = 0;
  let balancerPrice = 0;
  let bancorPrice = 0;
  let kyberPrice = 0;
  let crypto_comPrice = 0;
  
  //spreads
  let uniSushi;
  let sushiUni; 
  let uniBalancer;
  let balancerUni;
  let uniBancor;
  let bancorUni;
  let uniKyber;
  let kyberUni;
  let sushiBalancer;
  let balancerSushi; let sushiBancor; let bancorSushi; let sushiKyber; let kyberSushi;
  let balancerBancor; let bancorBalancer; let balancerKyber; let kyberBalancer; let bancorKyber; let kyberBancor;

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
    balancerPrice = data.balancerPrice;
    bancorPrice = data.bancorPrice;
    kyberPrice = data.kyberPrice;

    uniSushi = `${(uniswapPrice / sushiswapPrice - 1) * 100}%`;
    sushiUni = `${(sushiswapPrice / uniswapPrice - 1) * 100}%`;
    uniBalancer = `${(uniswapPrice / balancerPrice - 1) * 100}%`;
    balancerUni = `${(balancerPrice / uniswapPrice - 1) * 100}%`;
    uniBancor = `${(uniswapPrice / bancorPrice - 1) * 100}%`;
    bancorUni = `${(bancorPrice / uniswapPrice - 1) * 100}%`;
    uniKyber = `${(uniswapPrice / kyberPrice - 1) * 100}%`;
    kyberUni = `${(kyberPrice / uniswapPrice - 1) * 100}%`;
    sushiBalancer = `${(sushiswapPrice / balancerPrice - 1) * 100}%`;
    balancerSushi = `${(balancerPrice / sushiswapPrice - 1) * 100}%`;
    sushiBancor = `${(sushiswapPrice / bancorPrice - 1) * 100}%`;
    bancorSushi = `${(bancorPrice / sushiswapPrice - 1) * 100}%`;
    sushiKyber = `${(sushiswapPrice / kyberPrice - 1) * 100}%`;
    kyberSushi = `${(kyberPrice / sushiswapPrice - 1) * 100}%`;
    balancerBancor = `${(balancerPrice / bancorPrice - 1) * 100}%`;
    bancorBalancer = `${(bancorPrice / balancerPrice - 1) * 100}%`;
    balancerKyber = `${(balancerPrice / kyberPrice - 1) * 100}%`;
    kyberBalancer = `${(kyberPrice / balancerPrice - 1) * 100}%`;
    bancorKyber = `${(bancorPrice / kyberPrice - 1) * 100}%`;
    kyberBancor = `${(kyberPrice / bancorPrice - 1) * 100}%`;
    // hi
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
    <p>Price from SushiSwap is {sushiswapPrice}</p>
    <p>Price from Balancer is {balancerPrice}</p>
    <p>Price from Bancor is {bancorPrice}</p>
    <p>Price from Kyber is {kyberPrice}</p>

    <p>Spread of Uni to Sushi is: {uniSushi}</p>
    <p>Spread of Uni to Balancer is: {uniBalancer}</p>
    <p>Spread of Uni to Bancor is: {uniBancor}</p>
    <p>Spread of Uni to Kyber is: {uniKyber}</p>
    
    <p>Spread of Sushi to Uni is: {sushiUni}</p>
    <p>Spread of Sushi to Balancer is: {sushiBalancer}</p>
    <p>Spread of Sushi to Bancor is: {sushiBancor}</p>
    <p>Spread of Sushi to Kyber is: {sushiKyber}</p>

    <p>Spread of Balancer to Uni is: {balancerUni}</p>
    <p>Spread of Balancer to Sushi is: {balancerSushi}</p>
    <p>Spread of Balancer to Bancor is: {balancerBancor}</p>
    <p>Spread of Balancer to Kyber is: {balancerKyber}</p>

    <p>Spread of Bancor to Uni is: {bancorUni}</p>
    <p>Spread of Bancor to Sushi is: {bancorSushi}</p>
    <p>Spread of Bancor to Balancer is: {bancorBalancer}</p>
    <p>Spread of Bancor to Kyber is: {bancorKyber}</p>

    <p>Spread of Kyber to Uni is: {kyberUni}</p>
    <p>Spread of Kyber to Sushi is: {kyberSushi}</p>
    <p>Spread of Kyber to Balancer is: {kyberBalancer}</p>
    <p>Spread of Kyber to Bancor is: {kyberBancor}</p>

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