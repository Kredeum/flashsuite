import ethers from 'ethers';
import FlashAccounts from '../lib/contracts/FlashAccounts.mjs';
import aaveDashboard from '../lib/aaveDashboard.mjs';

const provider = ethers.getDefaultProvider("kovan", {
  etherscan: process.env.ETHERSCAN_API_KEY,
  infura: process.env.INFURA_API_KEY,
  alchemy: process.env.ALCHEMY_API_KEY
});

const Alice = new ethers.Wallet(process.env.ACCOUNT_KEY_2, provider);
const Bob = new ethers.Wallet(process.env.ACCOUNT_KEY, provider);
console.log(`Alice     https://kovan.etherscan.io/address/${Alice.address}`);
console.log(`Bob       https://kovan.etherscan.io/address/${Bob.address}`);


// const dashboard = [
//   {
//     address: '0x3B91257Fe5CA63b4114ac41A0d467D25E2F747F3',
//     amount: '6040106687666546916',
//     symbol: 'sdDAI',
//     type: 1,
//     decimals: '18'
//   },
//   {
//     address: '0xAA74AdA92dE4AbC0371b75eeA7b1bd790a69C9e1',
//     amount: '164005971514444963536',
//     symbol: 'aSNX',
//     type: 0,
//     decimals: '18'
//   },
//   {
//     address: '0xF6c7282943Beac96f6C70252EF35501a6c1148Fe',
//     amount: '900000287756237460',
//     symbol: 'aYFI',
//     type: 0,
//     decimals: '18'
//   }
// ];
const dashboard = await aaveDashboard.getUserData(Alice.address, provider, true).tokens;

await FlashAccounts.Init(Alice, true);
await FlashAccounts.approveTransfers(dashboard, Alice);
await FlashAccounts.approveLoans(dashboard, Bob);
await FlashAccounts.callFlashLoan(dashboard, Alice, Bob);
