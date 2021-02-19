import { ethers, BigNumber } from 'ethers';
import IStableDebtToken from './IStableDebtToken.mjs';
import IVariableDebtToken from './IVariableDebtToken.mjs';
import ERC20 from './ERC20.mjs';

const ethscan = 'https://kovan.etherscan.io';

const priceEvolPer100000 = 5; // 0,001 %
const flashLoanFeePer100000 = 90; // 0,09 %

function _plusPer100000(_n, _per100000) {
  const ret = BigNumber.from(_n).mul(100000 + _per100000).div(100000).toString();
  // console.log("_plus", _n, _per100000, ret);
  return ret;
}
function _plusFee(_n) {
  return _plusPer100000(_n, flashLoanFeePer100000);
}
function _plusEvol(_n) {
  return _plusPer100000(_n, priceEvolPer100000);
}
function _bal(_balance, _decimals) {
  const [ent, dec] = ethers.utils.formatUnits(_balance, _decimals).split(".");
  return ent + "." + dec;
}


const FlashPos = {}

////////////////////////////////////////////////////////////////////////////////////////////////////////
// FLASH ACCOUNTS INIT
////////////////////////////////////////////////////////////////////////////////////////////////////////
FlashPos.Init = async function (_log = false) {
  FlashPos.log = _log;

  if (FlashPos.log) console.log(`FlashPos.Init `);
  FlashPos.contract = new ethers.Contract(FlashPos.ADDRESS['kovan'], FlashPos.ABI);


  if (FlashPos.log) console.log(`Contract  ${FlashPos.contract.address}`);
}
////////////////////////////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////////////////////////////
// TX1 : Get aTokens allowance
////////////////////////////////////////////////////////////////////////////////////////////////////////
FlashPos.approveTransfer = async function (_position, _signer) {
  const aTokenContract = new ethers.Contract(_position.address, ERC20.ABI, _signer);
  return aTokenContract.approve(FlashPos.contract.address, _plusEvol(_position.amount));
}
FlashPos.approveTransfers = async function (_dashboard, _signer) {
  console.log("FlashPos.approveTransfers");
  let ia = 0;
  for await (const position of _dashboard) {
    if (position.type == 0) {

      const txMain = await FlashPos.approveTransfer(position, _signer);

      if (FlashPos.log)
        console.log(`TX1.${++ia} allow transfer ${_bal(position.amount, position.decimals)} ${position.symbol}\n${ethscan}/tx/${txMain.hash}`);

      const txResult = await txMain.wait();
      if (FlashPos.log) console.log(`TX1.${ia} done`, txResult.status);

    }
  }
}
////////////////////////////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////////////////////////////
// TX2 : Get Credit Delegation approval 
////////////////////////////////////////////////////////////////////////////////////////////////////////
FlashPos.approveLoan = async function (_position, _signer) {
  let debtTokenContract;
  if (_position.type == 1) {
    debtTokenContract = new ethers.Contract(_position.address, IStableDebtToken.ABI, _signer);
  }
  if (_position.type == 2) {
    debtTokenContract = new ethers.Contract(_position.address, IVariableDebtToken.ABI, _signer);
  }
  return debtTokenContract.approveDelegation(FlashPos.contract.address, _plusFee(_plusEvol(_position.amount)));
}
FlashPos.approveLoans = async function (_dashboard, _signer) {
  console.log("FlashPos.approveLoans");
  let id = 0;
  for await (const position of _dashboard) {
    if ((position.type > 0) && (position.amount > 0)) {

      const txMain = await FlashPos.approveLoan(position, _signer);

      if (FlashPos.log)
        console.log(`TX2.${++id} Allow borrow ${_bal(position.amount, position.decimals)} ${position.symbol}\n${ethscan}/tx/${txMain.hash}`);

      const txResult = await txMain.wait();
      if (FlashPos.log) console.log(`TX2.${id} done`, txResult.status);
    }
  }
}
////////////////////////////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////////////////////////////
// TX3 : Run Flash Loan
////////////////////////////////////////////////////////////////////////////////////////////////////////
FlashPos.callFlashLoanTx = async function (_dashboard, _from, _to, _signer) {
  const aTokens = [];
  const aTokenAmounts = [];
  const dTokens = [];
  const dTokenAmounts = [];
  const dType = [];
  for await (const position of _dashboard) {
    if ((position.type == 0) && (position.amount > 0)) {
      aTokens.push(position.address);
      aTokenAmounts.push(_plusEvol(position.amount));
    } else {
      dTokens.push(position.asset);
      dTokenAmounts.push(_plusEvol(position.amount));
      dType.push(position.type);
    }
  }
  const options = { gasPrice: "10000000000", gasLimit: "10000000" };

  if (FlashPos.log) {
    console.log("Call FlashPos.migratePositions");
    console.log(_from, _to, aTokens, aTokenAmounts, dTokens, dTokenAmounts, dType, options);
  }
  return FlashPos.contract.connect(_signer).migratePositions(_from, _to, aTokens, aTokenAmounts, dTokens, dTokenAmounts, dType, options);
}
FlashPos.callFlashLoan = async function (_dashboard, _from, _to, _signer) {
  try {

    const txMain = await FlashPos.callFlashLoanTx(_dashboard, _from, _to, _signer);

    if (FlashPos.log) console.log(`TX3 Flash ${ethscan}/tx/${txMain.hash}`);
    const txResult = await txMain.wait();
    if (FlashPos.log) console.log(`TX3 done`, txResult.status);
  } catch (e) {
    if (FlashPos.log) console.error("ERROR", e);
  }
}
////////////////////////////////////////////////////////////////////////////////////////////////////////


FlashPos.ADDRESS = {
  'mainnet': '',
  'kovan': '0x2316b9B7B794c32AD95F0D836165f977065fFb93'
};
FlashPos.ABI = [
  {
    "inputs": [
      {
        "internalType": "contract ILendingPoolAddressesProvider",
        "name": "_addressProvider",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "desc",
        "type": "string"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "_from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "_asset",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "_amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "_premium",
        "type": "uint256"
      }
    ],
    "name": "opExec",
    "type": "event"
  },
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
    "name": "LENDING_POOL",
    "outputs": [
      {
        "internalType": "contract ILendingPool",
        "name": "",
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
        "name": "_asset",
        "type": "address"
      }
    ],
    "name": "balance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "ethBalance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "assets",
        "type": "address[]"
      },
      {
        "internalType": "uint256[]",
        "name": "amounts",
        "type": "uint256[]"
      },
      {
        "internalType": "uint256[]",
        "name": "premiums",
        "type": "uint256[]"
      },
      {
        "internalType": "address",
        "name": "initiator",
        "type": "address"
      },
      {
        "internalType": "bytes",
        "name": "params",
        "type": "bytes"
      }
    ],
    "name": "executeOperation",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "isOwner",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
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
        "name": "_from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_to",
        "type": "address"
      },
      {
        "internalType": "address[]",
        "name": "_aTokens",
        "type": "address[]"
      },
      {
        "internalType": "uint256[]",
        "name": "_aTokenAmounts",
        "type": "uint256[]"
      },
      {
        "internalType": "address[]",
        "name": "_borrowedUnderlyingAssets",
        "type": "address[]"
      },
      {
        "internalType": "uint256[]",
        "name": "_borrowedAmounts",
        "type": "uint256[]"
      },
      {
        "internalType": "uint256[]",
        "name": "_interestRateModes",
        "type": "uint256[]"
      }
    ],
    "name": "migratePositions",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "_assets",
        "type": "address[]"
      },
      {
        "internalType": "bool",
        "name": "destruct",
        "type": "bool"
      }
    ],
    "name": "rugPull",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_asset",
        "type": "address"
      }
    ],
    "name": "rugPullERC",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
];

export default FlashPos;
