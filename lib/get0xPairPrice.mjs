

const MAINNET_ENDPOINT = "https://api.0x.org";
const KOVAN_ENDPOINT =	"https://kovan.api.0x.org";

/*
0: {name: "0x", proportion: "0"}
1: {name: "Uniswap", proportion: "0"}             Works
2: {name: "Uniswap_V2", proportion: "0"}          Works
3: {name: "Eth2Dai", proportion: "0"}             
4: {name: "Kyber", proportion: "0"}               Works
5: {name: "Curve", proportion: "0"}               
6: {name: "LiquidityProvider", proportion: "0"} 
7: {name: "MultiBridge", proportion: "0"}
8: {name: "Balancer", proportion: "0"}            Works
9: {name: "CREAM", proportion: "0"}
10: {name: "Bancor", proportion: "0"}             Works
11: {name: "mStable", proportion: "0"}
12: {name: "Mooniswap", proportion: "0"}
13: {name: "MultiHop", proportion: "0"}
14: {name: "Shell", proportion: "0"}
15: {name: "Swerve", proportion: "0"}
16: {name: "SnowSwap", proportion: "0"}
17: {name: "SushiSwap", proportion: "1"}          Works
18: {name: "DODO", proportion: "0"}
19: {name: "CryptoCom", proportion: "0"}          Works
*/

async function get0xPairPrice({asset1 = 'DAI', asset2 = 'WETH', amount = '1000000000000000000',  network = 'mainnet', _selectedExchange}) {
  let arrayEx = ["0x", "Uniswap", "Uniswap_V2", "Eth2Dai", "Kyber", "Curve", "LiquidityProvider", "MultiBridge", "Balancer", "CREAM", "Bancor", "mStable", "Mooniswap", "MultiHop", "Shell", "Swerve", "SnowSwap","SushiSwap", "DODO", "CryptoCom"]; 

  // Filtering out the exchange we want to make sure our data comes from that exchange
  let filteredAryEx = arrayEx.filter(function(e) {return e !== _selectedExchange});
  
  console.log(filteredAryEx);

  const endpoint = network === 'mainnet' ? MAINNET_ENDPOINT : KOVAN_ENDPOINT;
  
  const withoutEx = filteredAryEx.toString();

  const params = {
    sellToken: asset1,
    buyToken: asset2,
    sellAmount: amount,
    excludedSources: withoutEx
  }

  const response = await fetch(`${endpoint}/swap/v1/price?` + new URLSearchParams(params));
  const data = await response.json();
  const price = data.price;

  return price;
};

export default get0xPairPrice;