import { ethers, BigNumber } from 'ethers';
// import aaveDashboard from "./aaveDashboard.mjs";
import aaveDashboard from "../lib/aaveDashboard.mjs";

function extractLiq(conf) {
  return Number("0x" + BigNumber.from(conf).toHexString().slice(-8, -4));
}
function calcHF(coll, debt, liqu) {
  return BigNumber.from(10).pow(18).mul(coll).mul(liqu).div(10000).div(debt);
}
function _log(_n, _decimals) {
  const [ent, dec] = ethers.utils.formatUnits(_n, _decimals).split(".");
  return ent + "." + dec.substring(0, 6);
}

const address = process.env.ACCOUNT_ADDRESS;
const network = 'kovan';
const provider = ethers.getDefaultProvider(network, { etherscan: process.env.ETHERSCAN_API_KEY });

const dashboard = await aaveDashboard.getUserData(address, provider, true);
console.log(dashboard);

const [totalCollateralInETH, totalDebtInETH, , avgLiquidationThreshold, , healthFactor] = dashboard.account;
console.log("totalCollateralInETH", _log(totalCollateralInETH));
console.log("totalDebtInETH", _log(totalDebtInETH));
console.log("avgLiquidationThreshold", _log(avgLiquidationThreshold, 4));
console.log("healthFactor", _log(calcHF(totalCollateralInETH, totalDebtInETH, avgLiquidationThreshold)));
console.log("healthFactor", _log(healthFactor));


const params = await aaveDashboard.getRiskParameters(dashboard.tokens);
console.log(params);
