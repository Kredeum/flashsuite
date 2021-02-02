import get0xPairPrice from "./get0xPairPrice.mjs";
import get1inchPairPrice from "./get1inchPairPrice.mjs";
import getUniswapPairPrice from "./getUniswapPairPrice.mjs";


async function getPriceData({ pair }) {

  let uniswapPrice;
  let sushiswapPrice;
  let balancerPrice;
  let bancorPrice;
  let kyberPrice;
  let crytpo_comPrice;
  let dodoPrice;

  const targetedExchanges = ['UNISWAP_V2', 'SUSHI', 'BALANCER', 'BANCOR', 'KYBER'];


  // 1inch provided prices
  [uniswapPrice, 
    sushiswapPrice,
    balancerPrice,
    bancorPrice,
    kyberPrice] = await Promise.all(targetedExchanges.map(dex => get1inchPairPrice({...pair, selectedExchange: dex})))

  
  
  // 0xPrices
  // const uniswapPrice = await get0xPairPrice({"asset1": pair.asset1, "asset2": pair.asset2, "_selectedExchange": "Uniswap_V2"});
  // const sushiswapPrice = await get0xPairPrice({"asset1": pair.asset1, "asset2": pair.asset2, "_selectedExchange": "SushiSwap"});
  // const balancerPrice = await get0xPairPrice({"asset1": pair.asset1, "asset2": pair.asset2, "_selectedExchange": "Balancer"})
  bancorPrice = await get0xPairPrice({"asset1": pair.asset1, "asset2": pair.asset2, "_selectedExchange": "Bancor"});
  kyberPrice = await get0xPairPrice({"asset1": pair.asset1, "asset2": pair.asset2, "_selectedExchange": "Kyber"});
  // const crytpo_comPrice = await get0xPairPrice({"asset1": pair.asset1, "asset2": pair.asset2, "_selectedExchange": "CryptoCom"});
  
  // Direct API's
  // const sushiswapPrice = await getUniswapPairPrice({ "_protocol": "sushiswap", "asset1": pair.asset1, "asset2": pair.asset2 });
  // const uniswapPrice = await getUniswapPairPrice({ "asset1": pair.asset1, "asset2": pair.asset2 });


  return {uniswapPrice, sushiswapPrice, balancerPrice, bancorPrice, kyberPrice};
}

//  Set interval 

export default getPriceData;