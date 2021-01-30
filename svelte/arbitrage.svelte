<svelte:options tag="flashsuite-arbitrage" immutable={true} />

<script>
  import getUniswapPairPrice from "../lib/getUniswapPairPrice.mjs";

  const main = async () => {
    const uniswapPrice = await getUniswapPairPrice();

    return {uniswapPrice};
  }

</script>


<h1>HEY</h1>
{#await main()}
  <p>Loading</p>
{:then payload } 
  <p>Price from uni is {payload.uniswapPrice}</p>
{/await}
