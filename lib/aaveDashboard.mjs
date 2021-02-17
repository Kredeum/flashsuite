import { BigNumber, ethers } from 'ethers';
import axios from 'axios';

async function _graphQL(url, query) {
  let response;
  try { response = await axios.post(url, { query: query }); }
  catch (error) { console.error(error); }
  return response;
}

const theGraphAaveKovanUrl = 'https://api.thegraph.com/subgraphs/name/aave/protocol-v2-kovan';

const aaveDashboard = {};
aaveDashboard.getUserData = async function (_user, _provider, _log = false) {
  const query = `{
    users(where: {id: "${_user}"}) {
      reserves {
        usageAsCollateralEnabledOnUser
        currentATokenBalance
        currentStableDebt
        currentVariableDebt
        reserve {
          underlyingAsset,
          reserveLiquidationThreshold,
          aToken {
            id
          }
          vToken {
            id
          }
          sToken {
            id
          }
          symbol
          usageAsCollateralEnabled
          borrowingEnabled
          price {
            priceInEth
          }
          decimals
        }
      }
    }
  }`;


  const userTokens = [];
  let reserveTokens = [];

  const answerGQL = await _graphQL(theGraphAaveKovanUrl, query);
  if (_log) console.log(answerGQL);

  try {
    reserveTokens = answerGQL.data.data.users[0].reserves;
  }
  catch {
    console.log("No positions found for", _user);
  }

  for (const tok of reserveTokens) {
    const price = tok.reserve.price.priceInEth;
    const aBal = tok.currentATokenBalance;
    const sBal = tok.currentStableDebt;
    const vBal = tok.currentVariableDebt;
    const decimals = tok.reserve.decimals;
    const liq = tok.reserve.reserveLiquidationThreshold;
    const coll = tok.reserve.usageAsCollateralEnabled && tok.usageAsCollateralEnabledOnUser;
    const aToken = tok.reserve.aToken.id;
    const sToken = tok.reserve.sToken.id;
    const vToken = tok.reserve.vToken.id;
    const symbol = tok.reserve.symbol;
    const asset = tok.reserve.underlyingAsset;


    if (aBal > 0 || sBal > 0 || vBal > 0) {
      if (aBal > 0) {
        const token = { "address": aToken, "amount": aBal.toString(), "symbol": 'a' + symbol, "type": 0, "decimals": Number(decimals), asset, "liq": Number(liq), coll, "price": price.toString() };
        userTokens.push(token);
        if (_log) console.log('a' + symbol, aBal.toString());
      }
      if (sBal > 0) {
        const token = { "address": sToken, "amount": sBal.toString(), "symbol": 'sd' + symbol, "type": 1, "decimals": Number(decimals), asset, "liq": Number(liq), coll, "price": price.toString() };
        userTokens.push(token);
        if (_log) console.log('sd' + symbol, sBal.toString());
      }
      if (vBal > 0) {
        const token = { "address": vToken, "amount": vBal.toString(), "symbol": 'vd' + symbol, "type": 2, "decimals": Number(decimals), asset, "liq": Number(liq), coll, "price": price.toString() };
        userTokens.push(token);
        if (_log) console.log('vd' + symbol, vBal.toString());
      }
    }
  };
  if (_log) console.log(userTokens);
  return userTokens;
}


aaveDashboard.getRiskParameters = async function (_positions, _mode = 0, _log = false) {
  let healthFactor = BigNumber.from('0');
  let totalCollateralETH = BigNumber.from('0');
  let totalCollateralETHliq = BigNumber.from('0');
  let totalDebtETH = BigNumber.from('0');
  let avgLiquidationThreshold = BigNumber.from('0');

  if ( _positions) {

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
