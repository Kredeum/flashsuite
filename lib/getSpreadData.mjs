// import { BigNumber } from "ethers";
// import get0xPairPrice from "./get0xPairPrice.mjs";
// import getUniswapPairPrice from "./getUniswapPairPrice.mjs";
import getPriceData from "../lib/getPriceData.mjs";


async function getSpreadData() {
  const data = await getPriceData({pair: selectedPair});
  uniswapPrice = data.uniswapPrice;
  sushiswapPrice = data.sushiswapPrice;
  balancerPrice = data.balancerPrice;
  bancorPrice = data.bancorPrice;
  kyberPrice = data.kyberPrice;
  // crypto_comPrice = data.crytpo_comPrice;

  //Uni-Sushi
  const uniSushi = `${(uniswapPrice / sushiswapPrice - 1) * 100}%`;
  const sushiUni = `${(sushiswapPrice / uniswapPrice - 1) * 100}%`;

  //Uni-Balancer
  const uniBalancer = `${(uniswapPrice / balancerPrice - 1) * 100}%`;
  const balancerUni = `${(balancerPrice / uniswapPrice - 1) * 100}%`;

  //Uni-Bancor
  const uniBancor = `${(uniswapPrice / bancorPrice - 1) * 100}%`;
  const bancorUni = `${(bancorPrice / uniswapPrice - 1) * 100}%`;

  //Uni-Kyber
  const uniKyber = `${(uniswapPrice / kyberPrice - 1) * 100}%`;
  const kyberUni = `${(kyberPrice / uniswapPrice - 1) * 100}%`;

  //Sushi-Balancer
  const sushiBalancer = `${(sushiswapPrice / balancerPrice - 1) * 100}%`;
  const balancerSushi = `${(balancerPrice / sushiswapPrice - 1) * 100}%`;

  //Sushi-Bancor
  const sushiBancor = `${(sushiswapPrice / bancorPrice - 1) * 100}%`;
  const bancorSushi = `${(bancorPrice / sushiswapPrice - 1) * 100}%`;

  //Sushi-Kyber
  const sushiKyber = `${(sushiswapPrice / kyberPrice - 1) * 100}%`;
  const kyberSushi = `${(kyberPrice / sushiswapPrice - 1) * 100}%`;

  //Balancer-Bancor
  const balancerBancor = `${(balancerPrice / bancorPrice - 1) * 100}%`;
  const bancorBalancer = `${(bancorPrice / balancerPrice - 1) * 100}%`;

  //Balancer-Kyber
  const balancerKyber = `${(balancerPrice / kyberPrice - 1) * 100}%`;
  const kyberBalancer = `${(kyberPrice / balancerPrice - 1) * 100}%`;

  //Bancor-Kyber
  const bancorKyber = `${(bancorPrice / kyberPrice - 1) * 100}%`;
  const kyberBancor = `${(kyberPrice / bancorPrice - 1) * 100}%`;


  console.log("uniSushi", uniSushi)

  return {uniSushi, sushiUni, uniBalancer, balancerUni, uniBancor, bancorUni, uniKyber, kyberUni, sushiBalancer, balancerSushi, sushiBancor, bancorSushi, sushiKyber, kyberSushi, balancerBancor, bancorBalancer, balancerKyber, kyberBalancer, bancorKyber, kyberBancor};
}


export default getSpreadData;