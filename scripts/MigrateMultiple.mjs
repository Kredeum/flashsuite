import ethers from 'ethers';
import aaveDashboard from '../lib/aaveDashboard.mjs';
import FlashAccounts from '../lib/contracts/FlashAccounts.mjs';
import ERC20 from '../lib/contracts/ERC20.mjs';
import IStableDebtToken from '../lib/contracts/IStableDebtToken.mjs';


const ethscan = 'https://kovan.etherscan.io';

const provider = ethers.getDefaultProvider("kovan", {
  etherscan: process.env.ETHERSCAN_API_KEY,
  infura: process.env.INFURA_API_KEY,
  alchemy: process.env.ALCHEMY_API_KEY
});

function _bal(_balance, _decimals) {
  const [ent, dec] = ethers.utils.formatUnits(_balance, _decimals).split(".");
  return ent + "." + dec.substring(0, 3);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////
// SIGNERS
////////////////////////////////////////////////////////////////////////////////////////////////////////
const Alice = new ethers.Wallet(process.env.ACCOUNT_KEY_2, provider);
const Bob = new ethers.Wallet(process.env.ACCOUNT_KEY, provider);
console.log(`Alice     ${ethscan}/address/${Alice.address}`);
console.log(`Bob       ${ethscan}/address/${Bob.address}`);
////////////////////////////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////////////////////////////
// FLASH ACCOUNTS CONTRACT
////////////////////////////////////////////////////////////////////////////////////////////////////////
const flashAccounts = new ethers.Contract(FlashAccounts.ADDRESS['kovan'], FlashAccounts.ABI, Alice);
console.log(`Contract  ${ethscan}/address/${flashAccounts.address}`);
////////////////////////////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////////////////////////////
// ALICE DASHBOARD
////////////////////////////////////////////////////////////////////////////////////////////////////////
const dashboard = await aaveDashboard(Alice.address, provider);
console.log(dashboard);
////////////////////////////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////////////////////////////
// TX1 : Get aTokens allowance
////////////////////////////////////////////////////////////////////////////////////////////////////////
let ia = 0;
for await (const position of dashboard) {
  if (position.type == 'deposit') {
    const aTokenContract = new ethers.Contract(position.address, ERC20.ABI, Alice);

    const tx1 = await aTokenContract.approve(flashAccounts.address, position.amount);
    console.log(`TX1.${++ia} Allow transfer ${_bal(position.amount)} ${position.symbol}\n${ethscan}/tx/${tx1.hash}`);
    await tx1.wait();
  }
}
////////////////////////////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////////////////////////////
// TX2 : Get Credit Delegation approval 
////////////////////////////////////////////////////////////////////////////////////////////////////////
let id = 0;
for await (const position of dashboard) {
  if (position.type != 'deposit') {
    let debtTokenContract;
    if (position.type == 'stable_debt') {
       debtTokenContract = new ethers.Contract(position.address, IStableDebtToken.ABI, Bob);
    }
    if (position.type == 'variable_debt') {
       debtTokenContract = new ethers.Contract(position.address, IVariableDebtToken.ABI, Bob);
    }

    const tx2 = await debtTokenContract.approveDelegation(flashAccounts.address, position.amount);
    console.log(`TX2.${++id} Allow borrow ${_bal(position.amount)} ${position.symbol}\n${ethscan}/tx/${tx2.hash}`);
    await tx2.wait();
  }
}
////////////////////////////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////////////////////////////
// TX3 : Run Flash Loan
////////////////////////////////////////////////////////////////////////////////////////////////////////
const aTokens = [];
const aTokenAmounts = [];
for await (const position of dashboard) {
  aTokens.push(position.address);
  aTokenAmounts.push(position.amount);
}

try {
  console.log("Call flashAccounts.migratePositions");
  console.log(Alice.address, Bob.address, aTokens, aTokenAmounts);
                                  
  const options = { gasPrice: "10000000000", gasLimit: "10000000" };    
  const tx3 = await flashAccounts.migratePositions(Alice.address, Bob.address, aTokens, aTokenAmounts, options);
  console.log(`TX3 Flash ${ethscan}/tx/${tx3.hash}`);
  await tx3.wait();
} catch (e) {
  console.error("ERROR", e);
}
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
