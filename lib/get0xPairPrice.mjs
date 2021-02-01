

const MAINNET_ENDPOINT = "https://api.0x.org";
const KOVAN_ENDPOINT =	"https://kovan.api.0x.org";

async function get0xPairPrice({asset1 = 'DAI', asset2 = 'WETH', amount = '1000000000000000000',  network = 'mainnet'}) {

  const endpoint = network === 'mainnet' ? MAINNET_ENDPOINT : KOVAN_ENDPOINT;

  const withoutUniswapV2 = 'Uniswap_V2,';

  const params = {
    buyToken: asset1,
    sellToken: asset2,
    sellAmount: amount,
    excludedSources: withoutUniswapV2
  }

  const data = await fetch(`${endpoint}/swap/v1/price?` + new URLSearchParams(params));

  console.log('data', data);

};

export default get0xPairPrice;