import hre from "hardhat";

async function main() {

  // Aave Deployed Contracts Addresses : https://docs.aave.com/developers/deployed-contracts
  const kovanLendingPoolAddressesProvider = "0x88757f2f99175387ab4c6a4b3067c77a695b0349";

  const AaveTest = await hre.ethers.getContractFactory("AaveTest");
  const aaveTest = await AaveTest.deploy(kovanLendingPoolAddressesProvider);
  await aaveTest.deployed();
  
  console.log("AaveTest deployed to:", aaveTest.address);
  // AaveTest deployed to: 0xD8b86a45a43c816C74e3b7891110615647CBA9c3


  await krm.allowance(signer.address, spender);
const tx = await krm.approve(spender, 1);
await tx.wait();




  console.log("aaveTest.myFlashLoanCall()", await aaveTest.myFlashLoanCall("100"));
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });



  import KRM from './krm.mjs';
import { ethers } from 'ethers';

const { BigNumber, Contract, Wallet, getDefaultProvider } = ethers;

const network = "rinkeby";
let provider, akey;
if (network === "local") {
  provider = ethers.getDefaultProvider("http://127.0.0.1:7545");
  akey = '0xf19c9206c05efb58e717ca49be79d40484e33f7da3f6c9c4531a12bb76f9b529';
} else {
  provider = ethers.getDefaultProvider(network, {
    etherscan: process.env.ETHERSCAN_API_KEY,
    infura: process.env.INFURA_API_KEY,
    alchemy: process.env.ALCHEMY_API_KEY,
    quorum: 2
  });
  akey = process.env.ACCOUNT_KEY;
}

const signer = new Wallet(akey, provider);
console.log(signer.address);
