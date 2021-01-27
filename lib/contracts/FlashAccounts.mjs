import { ethers } from 'ethers';
import IStableDebtToken from './IStableDebtToken.mjs';
import ERC20 from './ERC20.mjs';

const ethscan = 'https://kovan.etherscan.io';
function _bal(_balance, _decimals) {
  const [ent, dec] = ethers.utils.formatUnits(_balance, _decimals).split(".");
  return ent + "." + dec.substring(0, 3);
}

const FlashAccounts = {}

////////////////////////////////////////////////////////////////////////////////////////////////////////
// FLASH ACCOUNTS INIT
////////////////////////////////////////////////////////////////////////////////////////////////////////
FlashAccounts.Init = async function ( _log = false) {
  console.log(`FlashAccounts.Init `);
  FlashAccounts.contract = new ethers.Contract(FlashAccounts.ADDRESS['kovan'], FlashAccounts.ABI);
  FlashAccounts.log = _log;

  if (FlashAccounts.log) console.log(`Contract  ${FlashAccounts.contract.address}`);
}
////////////////////////////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////////////////////////////
// TX1 : Get aTokens allowance
////////////////////////////////////////////////////////////////////////////////////////////////////////
FlashAccounts.approveTransfers = async function (_dashboard, _signer) {
  let ia = 0;
  for await (const position of _dashboard) {
    if (position.type == 'deposit') {
      const aTokenContract = new ethers.Contract(position.address, ERC20.ABI, _signer);
      const tx1 = await aTokenContract.approve(FlashAccounts.contract.address, position.amount);

      if (FlashAccounts.log) console.log(`TX1.${++ia} Allow transfer ${_bal(position.amount)} ${position.symbol}\n${ethscan}/tx/${tx1.hash}`);
      console.log(await tx1.wait());
    }
  }
}
////////////////////////////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////////////////////////////
// TX2 : Get Credit Delegation approval 
////////////////////////////////////////////////////////////////////////////////////////////////////////
FlashAccounts.approveLoans = async function (_dashboard, _signer) {
  console.log("FlashAccounts.approveLoans");
  let id = 0;
  for await (const position of _dashboard) {
    if (position.type != 'deposit') {
      let debtTokenContract;
      if (position.type == 'stable_debt') {
        debtTokenContract = new ethers.Contract(position.address, IStableDebtToken.ABI, _signer);
      }
      if (position.type == 'variable_debt') {
        debtTokenContract = new ethers.Contract(position.address, IVariableDebtToken.ABI, _signer);
      }
      const tx2 = await debtTokenContract.approveDelegation(FlashAccounts.contract.address, position.amount);

      if (FlashAccounts.log) console.log(`TX2.${++id} Allow borrow ${_bal(position.amount)} ${position.symbol}\n${ethscan}/tx/${tx2.hash}`);
      console.log(await tx2.wait());
    }
  }
}
////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////
// TX3 : Run Flash Loan
////////////////////////////////////////////////////////////////////////////////////////////////////////
FlashAccounts.callFlashLoan = async function (_dashboard, _from, _to, _signer) {
  const aTokens = [];
  const aTokenAmounts = [];
  for await (const position of _dashboard) {
    aTokens.push(position.address);
    aTokenAmounts.push(position.amount);
  }

  try {
    if (FlashAccounts.log) console.log("Call FlashAccounts.migratePositions");
    if (FlashAccounts.log) console.log(_from, _to, aTokens, aTokenAmounts);

    const options = { gasPrice: "10000000000", gasLimit: "10000000" };
    const tx3 = await FlashAccounts.contract.connect(_signer).migratePositions(_from, _to, aTokens, aTokenAmounts, options);

    if (FlashAccounts.log) console.log(`TX3 Flash ${ethscan}/tx/${tx3.hash}`);
    console.log(await tx3.wait());
  } catch (e) {
    if (FlashAccounts.log) console.error("ERROR", e);
  }
}
////////////////////////////////////////////////////////////////////////////////////////////////////////



FlashAccounts.ADDRESS = {
  'mainnet': '',
  'kovan': '0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD',
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
    "name": "FLASHLOAN_PREMIUM_TOTAL",
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
    "inputs": [],
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
        "internalType": "uint256",
        "name": "_premium",
        "type": "uint256"
      }
    ],
    "name": "setFlashLoanPremium",
    "outputs": [],
    "stateMutability": "nonpayable",
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
