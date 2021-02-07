import { BigNumber, ethers } from 'ethers';
import IProtocolDataProvider from '../lib/contracts/IProtocolDataProvider.mjs';
import ILendingPool from '../lib/contracts/ILendingPool.mjs';
import IPriceOracleGetter from '../lib/contracts/IPriceOracle.mjs';

const aaveDashboard = {};


aaveDashboard.getUserData = async function (_user, _provider, _log = false) {
  const userTokens = [];
  const { name: network } = await _provider.getNetwork();

  const DP = new ethers.Contract(IProtocolDataProvider['ADDRESS'][network], IProtocolDataProvider['ABI'], _provider);
  const reserveTokens = await DP.getAllReservesTokens();

  const LP = new ethers.Contract(ILendingPool['ADDRESS'][network], ILendingPool['ABI'], _provider);
  const userAccountData = await LP.getUserAccountData(_user);

  const tokensAddress = [];
  for (const { tokenAddress, } of reserveTokens) {
    tokensAddress.push(tokenAddress);
  }

  const PO = new ethers.Contract(IPriceOracleGetter['ADDRESS'][network], IPriceOracleGetter['ABI'], _provider);
  const prices = await PO.getAssetsPrices(tokensAddress);
  // console.log("PRICES", prices);

  for (const [i, { tokenAddress: asset, symbol }] of reserveTokens.entries()) {
    const price = prices[i];

    const { currentATokenBalance: aBal, currentStableDebt: sdBal, currentVariableDebt: vdBal }
      = await DP.getUserReserveData(asset, _user);

    if (aBal > 0 || sdBal > 0 || vdBal > 0) {

      const { decimals, liquidationThreshold: liq, usageAsCollateralEnabled: coll }
        = await DP.getReserveConfigurationData(asset);

      const { aTokenAddress: aToken, stableDebtTokenAddress: sdToken, variableDebtTokenAddress: vdToken }
        = await DP.getReserveTokensAddresses(asset);

      if (aBal > 0) {
        const token = { "address": aToken, "amount": aBal.toString(), "symbol": 'a' + symbol, "type": 0, "decimals": Number(decimals), asset, "liq": Number(liq), coll, "price": price.toString() };
        userTokens.push(token);
        if (_log) console.log('a' + symbol, aBal.toString());
      }
      if (sdBal > 0) {
        const token = { "address": sdToken, "amount": sdBal.toString(), "symbol": 'sd' + symbol, "type": 1, "decimals": Number(decimals), asset, "liq": Number(liq), coll, "price": price.toString() };
        userTokens.push(token);
        if (_log) console.log('sd' + symbol, sdBal.toString());
      }
      if (vdBal > 0) {
        const token = { "address": vdToken, "amount": vdBal.toString(), "symbol": 'vd' + symbol, "type": 2, "decimals": Number(decimals), asset, "liq": Number(liq), coll, "price": price.toString() };
        userTokens.push(token);
        if (_log) console.log('vd' + symbol, vdBal.toString());
      }
    }
  };
  if (_log) console.log(userTokens);
  return { tokens: userTokens, account: userAccountData };
}

aaveDashboard.getRiskParameters = async function (_positions, _mode = 0, _log = false) {
  let healthFactor = BigNumber.from('0');
  let totalCollateralETH = BigNumber.from('0');
  let totalCollateralETHliq = BigNumber.from('0');
  let totalDebtETH = BigNumber.from('0');
  let avgLiquidationThreshold = BigNumber.from('0');

  for (const { amount, type, decimals, liq, coll, price, checked } of _positions) {

    let condition = true;
    if (_mode == 1) {
      condition = checked;
    } else if (_mode == 2) {
      condition = !checked;
    }
    if (condition) {
      const amountInETH = BigNumber.from(amount).mul(price).div(BigNumber.from(10).pow(decimals));
      if (type == 0) {
        if (coll) {
          totalCollateralETH = amountInETH.add(totalCollateralETH);
          totalCollateralETHliq = amountInETH.mul(liq).add(totalCollateralETHliq);
        }
      }
      else {
        totalDebtETH = totalDebtETH.add(amountInETH);
      }
    }
  }
  if (totalCollateralETH.eq(0)) {
    avgLiquidationThreshold = 1;
  } else {
    avgLiquidationThreshold = BigNumber.from(10).pow(18).mul(totalCollateralETHliq).div(totalCollateralETH);
  }
  if (totalDebtETH.eq(0)) {
    if (totalCollateralETH.eq(0)) {
      healthFactor = "_";
    } else {
      healthFactor = "∞";
    }
  } else {
    healthFactor = totalCollateralETH.mul(avgLiquidationThreshold).div(10000).div(totalDebtETH);
  }

  const ret = {
    "healthFactor": healthFactor.toString(),
    "totalCollateralETH": totalCollateralETH.toString(),
    "totalCollateralETHliq": totalCollateralETHliq.toString(),
    "totalDebtETH": totalDebtETH.toString(),
    "avgLiquidationThreshold": avgLiquidationThreshold.toString(),
  }

  if (_log) console.log(_positions, ret);
  return ret;
}

aaveDashboard.getHealthFactors = async function (_positions, _log = false) {
  const healthFactor = (await aaveDashboard.getRiskParameters(_positions, 0)).healthFactor;
  const healthFactorChecked = (await aaveDashboard.getRiskParameters(_positions, 1)).healthFactor;
  const healthFactorUnchecked = (await aaveDashboard.getRiskParameters(_positions, 2)).healthFactor;
  return { healthFactor, healthFactorUnchecked, healthFactorChecked };
}
aaveDashboard.getHealthFactors2 = async function (_positionsOrigin, _positionsDestination, _log = false) {
  const _positionsOriginChecked = _positionsOrigin.filter((pos) => pos.checked);
  const positions = _positionsOriginChecked.concat(_positionsDestination);
  return aaveDashboard.getHealthFactors(positions, _log);
}

export default aaveDashboard;
