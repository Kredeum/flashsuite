import { ethers } from 'ethers';
import ERC20 from './erc20.mjs';

function _bal(balance = 0, decimals = 18) {
  return ethers.utils.formatUnits(balance, decimals);
}
function _log(address, chain, token, balance, text = '') {
  const [ent, dec] = balance.split('.');
  const log = address + ' ' + chain.padEnd(7) + ' ' + token.padStart(5) + ' = ' + ent.padStart(4) + '.' + dec;
  if (process.env.ETH_LOG) {
    console.log(log, text);
  }
}

export default async function balance(address, { token = 'ETH', chain = 'mainnet' } = {}) {
  let balance = '0.0';
  let provider = {};
  let decimals = 18;

  if (['mainnet', 'ropsten', 'kovan', 'rinkeby', 'goerli'].includes(chain)) {
    try {
      if (!provider[chain]) {
        provider[chain] = ethers.getDefaultProvider(chain, {
          etherscan: process.env.ETHERSCAN_API_KEY,
          infura: process.env.INFURA_API_KEY,
          alchemy: process.env.ALCHEMY_API_KEY
        });
      }
      if (token === 'ETH') {
        balance = await provider[chain].getBalance(address);
      }
      else if (ERC20[token] && ERC20[token][chain]) {
        const erc20Contract = new ethers.Contract(ERC20[token][chain], ERC20.ABI, provider[chain]);
        balance = await erc20Contract.balanceOf(address);
        decimals = ERC20[token].dec || decimals;
      }
      else {
        console.log(`unregistred token '${token}' on '${chain}'`);
      }
      _log(address, chain, token, _bal(balance, decimals));
    } catch (e) {
      _log(address, chain, token, '?.?', e.message);
    }
  } else {
    console.log(`unknown chain '${chain}'`);
  }
  return balance;
}
