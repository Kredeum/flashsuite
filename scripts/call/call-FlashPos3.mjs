import ethers from 'ethers';
import FlashPos from '../../lib/contracts/FlashPos.mjs';
import aaveDashboard from '../../lib/aaveDashboard.mjs';

const provider = ethers.getDefaultProvider("kovan", {
  etherscan: process.env.ETHERSCAN_API_KEY,
  infura: process.env.INFURA_API_KEY,
  alchemy: process.env.ALCHEMY_API_KEY
});

const Alice = new ethers.Wallet(process.env.ACCOUNT_KEY, provider);
const Bob = new ethers.Wallet(process.env.ACCOUNT_KEY_3, provider);
// console.log(`Alice      https://kovan.etherscan.io/address/${Alice.address}`);
// console.log(`Bob        https://kovan.etherscan.io/address/${Bob.address}`);

let origin;
let destination;
let dashboard;

dashboard = await aaveDashboard.getUserData(Alice.address, provider);
if (dashboard.length) {
  origin = Alice;
  destination = Bob;
}
else {
  dashboard = await aaveDashboard.getUserData(Bob.address, provider);
  if (dashboard.length) {
    origin = Bob;
    destination = Alice;
  }
  else console.log("That's boring, no position to migrate!")
}
// console.log("dashboard", dashboard);

if (dashboard.length) {
  console.log(`Origin      https://kovan.etherscan.io/address/${origin.address}`);
  console.log(`Destination https://kovan.etherscan.io/address/${destination.address}`);

  await FlashPos.Init(origin, true);
  await FlashPos.approveTransfers(dashboard, origin);
  await FlashPos.approveLoans(dashboard, destination);

  console.log("FLashLoan swapping Origin's account to Destination")
  await FlashPos.callFlashLoan(dashboard, origin.address, destination.address, destination);
}
