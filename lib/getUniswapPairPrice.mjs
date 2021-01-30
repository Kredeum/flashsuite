import { ethers } from 'ethers';
import {IUniswapV2FactoryABI} from '../lib/contracts/IUniswapV2Factory.mjs';
import {IUniswapV2PairABI} from '../lib/contracts/IUniswapV2Pair.mjs';


const UNISWAP_FACTORY_ADDRESS = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f';

// Kovan addresses
const daiAddress = '0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa';
const wethAddress = '0xd0a1e359811322d97991e03f863a0c30c2cf029c';

async function getUniswapPairPrice(asset1 = 'DAI', asset2= 'ETH') {

  // Get provider
  const _provider = new ethers.providers.Web3Provider(window.ethereum);
  console.log("_provider", _provider);

  const uniswapFactory = new ethers.Contract(UNISWAP_FACTORY_ADDRESS, IUniswapV2FactoryABI, _provider);


  console.log('uniswapFactory loaded from', uniswapFactory.address);
  const pairAddress = await uniswapFactory.getPair(wethAddress, daiAddress);
  // const pairAddress = await uniswapFactory.allPairs(1);
  console.log('pairAddress', pairAddress);
  const uniswapEthDai = new ethers.Contract(pairAddress,
    IUniswapV2PairABI, _provider
  );
  console.log('uniswapEthDai', uniswapEthDai);
  
  const uniswapReserves = await uniswapEthDai.getReserves();

  const reserve0Uni = Number(ethers.utils.formatUnits(uniswapReserves[0], 18));
  const reserve1Uni = Number(ethers.utils.formatUnits(uniswapReserves[1], 18));

  const uniswapPrice = reserve0Uni / reserve1Uni;

  console.log('price from Uniswap:', uniswapPrice);

  return uniswapPrice;
 };

 export default getUniswapPairPrice;