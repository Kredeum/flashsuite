import { ethers, BigNumber } from 'ethers';
import ILendingPool from '../lib/contracts/ILendingPool.mjs';
import IPriceOracleGetter from '../lib/contracts/IPriceOracle.mjs';

function extractLiq(conf) {
  return Number("0x" + BigNumber.from(conf).toHexString().slice(-8, -4));
}
function calcHF(coll, debt, liqu) {
  return BigNumber.from(coll).mul(1e14).mul(BigNumber.from(liqu)).div(BigNumber.from(debt));
}

const address = process.env.ACCOUNT_ADDRESS;
const network = 'kovan';
const provider = ethers.getDefaultProvider(network, { etherscan: process.env.ETHERSCAN_API_KEY });

const DAI = "0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD";
const USDC = "0xe22da380ee6B445bb8273C81944ADEB6E8450422";

const LendingPool = new ethers.Contract(ILendingPool['ADDRESS'][network], ILendingPool['ABI'], provider);
const PriceOracle = new ethers.Contract(IPriceOracleGetter['ADDRESS'][network], IPriceOracleGetter['ABI'], provider);

const confDAI = await LendingPool.getConfiguration(DAI);
const liqDAI = extractLiq(confDAI.data);

const collDAI = "90327049729088811276159";
const borrUSDC = "30000001050";
console.log("collDAI", collDAI);
console.log("borrUSDC", borrUSDC);

const DAIinETH = await PriceOracle.getAssetPrice(DAI);
const USDCinETH = await PriceOracle.getAssetPrice(USDC);
console.log("DAIinETH", DAIinETH.toString());
console.log("USDCinETH", USDCinETH.toString());

const collDAIinETH = BigNumber.from(collDAI).mul(DAIinETH);
const borrUSDCinETH = BigNumber.from(borrUSDC).mul(USDCinETH);
console.log("collDAIinETH", collDAIinETH.toString());
console.log("borrUSDCinETH", borrUSDCinETH.toString());
console.log("liqDAI",liqDAI)
console.log("healthFactor", calcHF(collDAIinETH, borrUSDCinETH, liqDAI).toString());
