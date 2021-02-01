import { BigNumber } from "ethers";
import get0xPairPrice from "./get0xPairPrice.mjs";
import getUniswapPairPrice from "./getUniswapPairPrice.mjs";

async function getPriceData({ pair }) {
  const uniswapPrice = await getUniswapPairPrice({ "asset1": pair.asset1, "asset2": pair.asset2 });
  const sushiswapPrice = await getUniswapPairPrice({ "_protocol": "sushiswap", "asset1": pair.asset1, "asset2": pair.asset2 });
  
  const zeroXPrice = await get0xPairPrice({asset1: pair.asset1, asset2: pair.asset2})

  const spread = `${(sushiswapPrice / uniswapPrice - 1) * 100}%`;

  return { uniswapPrice, sushiswapPrice, spread };
}


export default getPriceData;