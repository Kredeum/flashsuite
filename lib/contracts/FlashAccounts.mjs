import { ethers, BigNumber } from 'ethers';
import IStableDebtToken from './IStableDebtToken.mjs';
import IVariableDebtToken from './IVariableDebtToken.mjs';
import ERC20 from './ERC20.mjs';

const ethscan = 'https://kovan.etherscan.io';

function _bal(_balance, _decimals) {
  const [ent, dec] = ethers.utils.formatUnits(_balance, _decimals).split(".");
  return ent + "." + dec.substring(0, 3);
}
function _plus(_n) {
  const pourcent = 7;
  return BigNumber.from(_n).mul(100 + pourcent).div(100).toString();
}

const FlashAccounts = {}

////////////////////////////////////////////////////////////////////////////////////////////////////////
// FLASH ACCOUNTS INIT
////////////////////////////////////////////////////////////////////////////////////////////////////////
FlashAccounts.Init = async function (_log = false) {
  console.log(`FlashAccounts.Init `);
  FlashAccounts.contract = new ethers.Contract(FlashAccounts.ADDRESS['kovan'], FlashAccounts.ABI);
  FlashAccounts.log = _log;

  if (FlashAccounts.log) console.log(`Contract  ${FlashAccounts.contract.address}`);
}
////////////////////////////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////////////////////////////
// TX1 : Get aTokens allowance
////////////////////////////////////////////////////////////////////////////////////////////////////////
FlashAccounts.approveTransfer = async function (_position, _signer, _index = 1) {
  const aTokenContract = new ethers.Contract(_position.address, ERC20.ABI, _signer);
  return aTokenContract.approve(FlashAccounts.contract.address, _plus(_position.amount));
}
FlashAccounts.approveTransfers = async function (_dashboard, _signer) {
  console.log("FlashAccounts.approveTransfers");
  let ia = 0;
  for await (const position of _dashboard) {
    if (position.type == 0) {
      const txMain = await FlashAccounts.approveTransfer(position, _signer);
      if (FlashAccounts.log) {
        console.log(`TX1.${_index} allow transfer ${_bal(_position.amount, _position.decimals)} ${_position.symbol}\n${ethscan}/tx/${txMain.hash}`);
      }
      const txResult = await txMain.wait();
      if (FlashAccounts.log) {
        console.log(txResult);
      }
    }
  }
}
////////////////////////////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////////////////////////////
// TX2 : Get Credit Delegation approval 
////////////////////////////////////////////////////////////////////////////////////////////////////////
FlashAccounts.approveLoan = async function (_position, _signer, _index = 1) {
  let debtTokenContract;
  if (_position.type == 1) {
    debtTokenContract = new ethers.Contract(_position.address, IStableDebtToken.ABI, _signer);
  }
  if (_position.type == 2) {
    debtTokenContract = new ethers.Contract(_position.address, IVariableDebtToken.ABI, _signer);
  }
  return debtTokenContract.approveDelegation(FlashAccounts.contract.address, _plus(_position.amount));
}
FlashAccounts.approveLoans = async function (_dashboard, _signer) {
  console.log("FlashAccounts.approveLoans");
  let id = 0;
  for await (const position of _dashboard) {
    if (_position.type > 0) {
      const txMain = await FlashAccounts.approveLoan(position, _signer, ++id);

      if (FlashAccounts.log) {
        console.log(`TX2.${++_index} Allow borrow ${_bal(_position.amount, _position.decimals)} ${_position.symbol}\n${ethscan}/tx/${txMain.hash}`);
      }
      const txResult = await txMain.wait();
      if (FlashAccounts.log) {
        console.log(txResult);
      }
    }
  }
}
////////////////////////////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////////////////////////////
// TX3 : Run Flash Loan
////////////////////////////////////////////////////////////////////////////////////////////////////////
FlashAccounts.callFlashLoanTx = async function (_dashboard, _from, _to, _signer) {
  const aTokens = [];
  const aTokenAmounts = [];
  const dTokens = [];
  const dTokenAmounts = [];
  const dType = [];
  for await (const position of _dashboard) {
    if (position.type == 0) {
      aTokens.push(position.address);
      aTokenAmounts.push(position.amount);
    } else {
      dTokens.push(position.asset);
      dTokenAmounts.push(position.amount);
      dType.push(position.type);
    }
  }
  const options = { gasPrice: "10000000000", gasLimit: "10000000" };

  if (FlashAccounts.log) {
    console.log("Call FlashAccounts.migratePositions");
    console.log(_from, _to, aTokens, aTokenAmounts, dTokens, dTokenAmounts, dType, options);
  }
  return FlashAccounts.contract.connect(_signer).migratePositions(_from, _to, aTokens, aTokenAmounts, dTokens, dTokenAmounts, dType, options);
}
FlashAccounts.callFlashLoan = async function (_dashboard, _from, _to, _signer) {
  try {
    const txMain = await FlashAccounts.callFlashLoanTx(_dashboard, _from, _to, _signer);
    if (FlashAccounts.log) {
      console.log(`TX3 Flash ${ethscan}/tx/${txMain.hash}`);
    }
    const txResult = await txMain.wait();
    if (FlashAccounts.log) {
      console.log(txResult);
    }
  } catch (e) {
    if (FlashAccounts.log) console.error("ERROR", e);
  }
}
////////////////////////////////////////////////////////////////////////////////////////////////////////


FlashAccounts.ADDRESS = {
  'mainnet': '',
  'kovan': '0xa6d2114199e527799C22542b96F05c75234d178a',
};
FlashAccounts.ABI = [
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

export default FlashAccounts;
