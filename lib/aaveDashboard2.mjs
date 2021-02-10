import { BigNumber, ethers } from 'ethers';
import axios from 'axios';

async function _graphQL(url, query) {
  let response;
  try { response = await axios.post(url, { query: query }); }
  catch (error) { console.error(error); }
  return response;
}

const url = 'https://api.thegraph.com/subgraphs/name/aave/protocol-v2-kovan';

const aaveDashboard2 = {};

aaveDashboard2.getUserData = async function (_user, _provider, _log = false) {
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


  const reserveTokens = (await _graphQL(url, query)).data.data.users[0].reserves;
  console.log(JSON.stringify(reserveTokens, null, "  "));

  const userTokens = [];

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
  // if (_log)
  console.log(userTokens);
  return { tokens: userTokens, account: {} };
}



export default aaveDashboard2;
