// version for browser (or node), without hardhat
// run via "node getUserDashboard.browser.mjs"
import { ethers } from 'ethers';
import IProtocolDataProvider from '../lib/contracts/IProtocolDataProvider.mjs';

async function aaveDashboard(_address, _network = 'kovan') {
  const assets = [], amounts = [], tokens = [];
  const provider = ethers.getDefaultProvider(_network, { etherscan: process.env.ETHERSCAN_API_KEY });
  const DP = new ethers.Contract(IProtocolDataProvider['ADDRESS'][_network], IProtocolDataProvider['ABI'], provider);
  const reserveTokens = await DP.getAllReservesTokens();

  for (const reserve of reserveTokens) {

    const { currentATokenBalance: aBal, currentStableDebt: sdBal, currentVariableDebt: vdBal }
      = await DP.getUserReserveData(reserve.tokenAddress, _address);

    if (aBal > 0 || sdBal > 0 || vdBal > 0) {

      const { aTokenAddress: aToken, stableDebtTokenAddress: sdToken, variableDebtTokenAddress: vdToken }
        = await DP.getReserveTokensAddresses(reserve.tokenAddress);

      if (aBal > 0) {
        assets.push(aToken); amounts.push(aBal.toString()); tokens.push('a' + reserve.symbol);
        console.log(aToken, aBal.toString(), 'a' + reserve.symbol,)
      }
      if (sdBal > 0) {
        assets.push(sdToken); amounts.push(sdBal.toString()); tokens.push('sd' + reserve.symbol);
        console.log(sdToken, sdBal.toString(), 'sd' + reserve.symbol,)
      }
      if (vdBal > 0) {
        assets.push(vdToken); amounts.push(vdBal.toString()); tokens.push('vd' + reserve.symbol);
        console.log(vdToken, vdBal.toString(), 'vd' + reserve.symbol,)
      }
    }
  };
  return { assets, amounts, tokens };
}

const Alice = "0xb09Ae31E045Bb9d8D74BB6624FeEB18B3Af72A8e";
const Bob = "0x981ab0D817710d8FFFC5693383C00D985A3BDa38";

function _log(token, balance) {
  const [ent, dec] = ethers.utils.formatUnits(balance).split('.');
  const log = token.padStart(5) + ' = ' + ent.padStart(6) + '.' + dec;
  console.log(log);
}

console.log(await aaveDashboard(Alice));
