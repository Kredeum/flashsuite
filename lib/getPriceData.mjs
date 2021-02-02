import { BigNumber } from "ethers";
import get0xPairPrice from "./get0xPairPrice.mjs";
import getUniswapPairPrice from "./getUniswapPairPrice.mjs";


async function getPriceData({ pair }) {
  const uniswapPrice = await get0xPairPrice({"asset1": pair.asset1, "asset2": pair.asset2, "_selectedExchange": "Uniswap_V2"});
  const sushiswapPrice = await get0xPairPrice({"asset1": pair.asset1, "asset2": pair.asset2, "_selectedExchange": "SushiSwap"});
  const balancerPrice = await get0xPairPrice({"asset1": pair.asset1, "asset2": pair.asset2, "_selectedExchange": "Balancer"})
  const bancorPrice = await get0xPairPrice({"asset1": pair.asset1, "asset2": pair.asset2, "_selectedExchange": "Bancor"});
  const kyberPrice = await get0xPairPrice({"asset1": pair.asset1, "asset2": pair.asset2, "_selectedExchange": "Kyber"});
  const crytpo_comPrice = await get0xPairPrice({"asset1": pair.asset1, "asset2": pair.asset2, "_selectedExchange": "CryptoCom"});
  
  // Direct API's
  // const sushiswapPrice = await getUniswapPairPrice({ "_protocol": "sushiswap", "asset1": pair.asset1, "asset2": pair.asset2 });
  // const uniswapPrice = await getUniswapPairPrice({ "asset1": pair.asset1, "asset2": pair.asset2 });

  const spread = `${(sushiswapPrice / uniswapPrice - 1) * 100}%`;

  console.log("balancerPrice", balancerPrice)

  return {uniswapPrice, sushiswapPrice, balancerPrice, bancorPrice, kyberPrice, crytpo_comPrice, spread};
}

//  Set interval 

export default getPriceData;