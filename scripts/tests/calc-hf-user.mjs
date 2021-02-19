import { ethers, BigNumber } from 'ethers';
import ILendingPool from '../lib/contracts/ILendingPool.mjs';

function calcHF(coll, debt, liqu) {
  return BigNumber.from(coll).mul(1e14).mul(BigNumber.from(liqu)).div(BigNumber.from(debt));
}

const address = process.env.ACCOUNT_ADDRESS;
const network = 'kovan';
const provider = ethers.getDefaultProvider(network, { etherscan: process.env.ETHERSCAN_API_KEY });

const LendingPool = new ethers.Contract(ILendingPool['ADDRESS'][network], ILendingPool['ABI'], provider);
const [totalCollateralInETH, totalDebtInETH, , avgLiquidationThreshold, , healthFactor] = await LendingPool.getUserAccountData(address);
console.log("totalCollateralInETH", totalCollateralInETH.toString());
console.log("totalDebtInETH", totalDebtInETH.toString());
console.log("avgLiquidationThreshold", avgLiquidationThreshold.toString());
console.log("healthFactor", healthFactor.toString());
console.log("healthFactor", calcHF(totalCollateralInETH, totalDebtInETH, avgLiquidationThreshold).toString());
