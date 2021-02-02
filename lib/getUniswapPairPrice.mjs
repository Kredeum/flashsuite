import { ethers } from 'ethers';
import {IUniswapV2FactoryABI} from '../lib/contracts/IUniswapV2Factory.mjs';
import {IUniswapV2PairABI} from '../lib/contracts/IUniswapV2Pair.mjs';
import addresses from '../config/addresses.mjs';

const {mainnet} = addresses;


async function getUniswapPairPrice({asset1 = 'DAI', asset2 = 'WETH', _protocol = 'uniswap'}) {

  // Get provider
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  // Get Uniswap Factory
  const uniswapFactory = new ethers.Contract(mainnet[_protocol].factory, IUniswapV2FactoryABI, provider);
  console.log('uniswapFactory loaded from', uniswapFactory.address);

  // Get asset addresses
  const asset1Address = mainnet[`${asset1}Address`];
  const asset2Address = mainnet[`${asset2}Address`];

  const pairAddress = await uniswapFactory.getPair(asset1Address, asset2Address);
  console.log('pairAddress: ', pairAddress);

  const pair = new ethers.Contract(pairAddress,
    IUniswapV2PairABI, provider
  );
  
  const pairReserves = await pair.getReserves();

  const reserve0 = Number(ethers.utils.formatUnits(pairReserves[0], 18));
  const reserve1 = Number(ethers.utils.formatUnits(pairReserves[1], 18));

  const price = reserve0 / reserve1;

  console.log(`price for ${asset1} / ${asset2}:`, price);

  return price;
 };

 export default getUniswapPairPrice;