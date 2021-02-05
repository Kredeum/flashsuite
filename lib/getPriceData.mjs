import get0xPairPrice from "./get0xPairPrice.mjs";
import get1inchPairPrice from "./get1inchPairPrice.mjs";
import getUniswapPairPrice from "./getUniswapPairPrice.mjs";

const mergeObject = (A, B) => {
  let res = {};
  Object.keys({ ...A, ...B }).map((key) => {
    const aValue = A[key] && parseInt(A[key]) ? A[key] : undefined;
    const bValue = B[key] && parseInt(B[key]) ? B[key] : undefined;
    res[key] = aValue || bValue || "?";
  });
  return res;
};

async function getPriceData({ pair }) {
  let uniswapPrice;
  let sushiswapPrice;
  let balancerPrice;
  let bancorPrice;
  let kyberPrice;
  let crytpo_comPrice;
  let dodoPrice;
  let xPrices = {};
  let inchPrices = {};

  // 0xPrices
  // const uniswapPrice = await get0xPairPrice({"asset1": pair.asset1, "asset2": pair.asset2, "_selectedExchange": "Uniswap_V2"});
  xPrices.balancerPrice = await get0xPairPrice({
    asset1: pair.asset1,
    asset2: pair.asset2,
    _selectedExchange: "Balancer",
  });
  xPrices.dodoPrice = await get0xPairPrice({
    asset1: pair.asset1,
    asset2: pair.asset2,
    _selectedExchange: "DODO",
  });
  xPrices.bancorPrice = await get0xPairPrice({
    asset1: pair.asset1,
    asset2: pair.asset2,
    _selectedExchange: "Bancor",
  });
  xPrices.kyberPrice = await get0xPairPrice({
    asset1: pair.asset1,
    asset2: pair.asset2,
    _selectedExchange: "Kyber",
  });
  // const crytpo_comPrice = await get0xPairPrice({"asset1": pair.asset1, "asset2": pair.asset2, "_selectedExchange": "CryptoCom"});
  console.log("xPrices", xPrices);
  const targetedExchanges = [
    "UNISWAP_V2",
    "SUSHI",
    "BALANCER",
    "BANCOR",
    "DODO",
  ];

  // 1inch provided prices
  [
    inchPrices.uniswapPrice,
    inchPrices.sushiswapPrice,
    inchPrices.balancerPrice,
    inchPrices.bancorPrice,
    inchPrices.dodoPrice,
  ] = await Promise.all(
    targetedExchanges.map((dex) =>
      get1inchPairPrice({ ...pair, selectedExchange: dex })
    )
  );

  // Direct API's
  // const sushiswapPrice = await getUniswapPairPrice({ "_protocol": "sushiswap", "asset1": pair.asset1, "asset2": pair.asset2 });
  // const uniswapPrice = await getUniswapPairPrice({ "asset1": pair.asset1, "asset2": pair.asset2 });
  console.log("inchPrices", inchPrices);
  const finalPrices = mergeObject(xPrices, inchPrices);
  return finalPrices;
}

//  Set interval

export default getPriceData;
