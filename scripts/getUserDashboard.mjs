import balance from "../utils/balance.mjs";
import ERC20 from "../utils/erc20.mjs";
import hre from 'hardhat';
const { ethers } = hre;

const DPaddress = "0x3c73A5E5785cAC854D468F727c606C07488a29D6";
const Alice = "0xb09Ae31E045Bb9d8D74BB6624FeEB18B3Af72A8e";
const Bob = "0x981ab0D817710d8FFFC5693383C00D985A3BDa38";
const Aave = "contracts/aave/Interfaces.sol";

const DP = await ethers.getContractAt(`${Aave}:IProtocolDataProvider`, DPaddress);

// const aTokens = await DP.getAllATokens();
// console.log("aTokens", aTokens);

const reserveTokens = await DP.getAllReservesTokens();
// console.log("reserveTokens", reserveTokens);

reserveTokens.forEach(async (reserve) => {
  const userReserve = await DP.getUserReserveData(reserve.tokenAddress, Bob);
  // console.log(reserve.symbol, userReserve);
  const aBal = userReserve.currentATokenBalance;
  const sBal = userReserve.currentStableDebt;
  const vBal = userReserve.currentVariableDebt;
  if (aBal > 0) console.log(' '+reserve.symbol, aBal.toString());
  if (sBal > 0) console.log('s'+reserve.symbol, sBal.toString());
  if (vBal > 0) console.log('v'+reserve.symbol, vBal.toString());
});
