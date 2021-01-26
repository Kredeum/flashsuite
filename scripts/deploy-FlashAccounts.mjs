import hre from 'hardhat';
const { ethers } = hre;

////////////////////////////////////////////////////////////////////////////////////////////////////////
// Deploy FlashAccounts contract
////////////////////////////////////////////////////////////////////////////////////////////////////////
const kovanLendingPool = "0x88757f2f99175387ab4c6a4b3067c77a695b0349";
const ethscan = "https://kovan.etherscan.io";

const FlashAccounts = await ethers.getContractFactory("FlashAccounts");
const flashAccounts = await FlashAccounts.deploy(kovanLendingPool);
console.log(`Contract  ${ethscan}/address/${flashAccounts.address}`);

const tx = (await flashAccounts.deployed()).deployTransaction;
console.log(`TX        ${ethscan}/tx/${tx.hash}`);
////////////////////////////////////////////////////////////////////////////////////////////////////////
