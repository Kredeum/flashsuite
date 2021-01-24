// version for browser, without hardhat
import { ethers } from 'ethers';

async function aaveDashboard(_address) {
  const assets = [], amounts = [], tokens = [];
  const DPaddress = "0x3c73A5E5785cAC854D468F727c606C07488a29D6";
  const DPabi = [
    {
      "inputs": [],
      "name": "ADDRESSES_PROVIDER",
      "outputs": [
        {
          "internalType": "contract ILendingPoolAddressesProvider",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getAllATokens",
      "outputs": [
        {
          "components": [
            {
              "internalType": "string",
              "name": "symbol",
              "type": "string"
            },
            {
              "internalType": "address",
              "name": "tokenAddress",
              "type": "address"
            }
          ],
          "internalType": "struct IProtocolDataProvider.TokenData[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getAllReservesTokens",
      "outputs": [
        {
          "components": [
            {
              "internalType": "string",
              "name": "symbol",
              "type": "string"
            },
            {
              "internalType": "address",
              "name": "tokenAddress",
              "type": "address"
            }
          ],
          "internalType": "struct IProtocolDataProvider.TokenData[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "asset",
          "type": "address"
        }
      ],
      "name": "getReserveConfigurationData",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "decimals",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "ltv",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "liquidationThreshold",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "liquidationBonus",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "reserveFactor",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "usageAsCollateralEnabled",
          "type": "bool"
        },
        {
          "internalType": "bool",
          "name": "borrowingEnabled",
          "type": "bool"
        },
        {
          "internalType": "bool",
          "name": "stableBorrowRateEnabled",
          "type": "bool"
        },
        {
          "internalType": "bool",
          "name": "isActive",
          "type": "bool"
        },
        {
          "internalType": "bool",
          "name": "isFrozen",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "asset",
          "type": "address"
        }
      ],
      "name": "getReserveData",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "availableLiquidity",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "totalStableDebt",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "totalVariableDebt",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "liquidityRate",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "variableBorrowRate",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "stableBorrowRate",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "averageStableBorrowRate",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "liquidityIndex",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "variableBorrowIndex",
          "type": "uint256"
        },
        {
          "internalType": "uint40",
          "name": "lastUpdateTimestamp",
          "type": "uint40"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "asset",
          "type": "address"
        }
      ],
      "name": "getReserveTokensAddresses",
      "outputs": [
        {
          "internalType": "address",
          "name": "aTokenAddress",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "stableDebtTokenAddress",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "variableDebtTokenAddress",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "asset",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "getUserReserveData",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "currentATokenBalance",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "currentStableDebt",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "currentVariableDebt",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "principalStableDebt",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "scaledVariableDebt",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "stableBorrowRate",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "liquidityRate",
          "type": "uint256"
        },
        {
          "internalType": "uint40",
          "name": "stableRateLastUpdated",
          "type": "uint40"
        },
        {
          "internalType": "bool",
          "name": "usageAsCollateralEnabled",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];

  const provider = ethers.getDefaultProvider("kovan", { etherscan: process.env.ETHERSCAN_API_KEY });
  const DP = new ethers.Contract(DPaddress, DPabi, provider);
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
