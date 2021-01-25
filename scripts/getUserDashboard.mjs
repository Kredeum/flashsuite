// hardat version, 
// run via "npx hardhat run getUserDashboard.mjs"
const { ethers } = hre;

async function aaveDashboard(_address) {
  const assets = [], amounts = [], tokens = [];
  const DPaddress = "0x3c73A5E5785cAC854D468F727c606C07488a29D6";

  const DP = await ethers.getContractAt("contracts/aave/Interfaces.sol:IProtocolDataProvider", DPaddress);
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
