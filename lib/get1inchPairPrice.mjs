import { ethers } from 'ethers';
import addresses from '../config/addresses.mjs';

const {mainnet} = addresses;


const endpoint = "https://api.1inch.exchange/v2.0/quote";

async function get1inchPairPrice({asset1 = 'DAI', asset2 = 'WETH', amount = '1', asset1Decimals, selectedExchange}) {

  const fromTokenAddress = mainnet[`${asset1}Address`];
  const toTokenAddress = mainnet[`${asset2}Address`];

  const formattedAmount = ethers.utils.parseUnits(amount, asset1Decimals)

  const params = {
    fromTokenAddress,
    toTokenAddress,
    amount: formattedAmount,
    protocols: selectedExchange
  }

  const response = await fetch(`${endpoint}?` + new URLSearchParams(params));
  const data = await response.json();
  console.log('data', data)
  return data?.toTokenAmount ? ethers.utils.formatUnits(data.toTokenAmount, data.toToken.decimals) : null;

};

export default get1inchPairPrice;