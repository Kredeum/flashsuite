import hre from 'hardhat';
const { ethers } = hre;

////////////////////////////////////////////////////////////////////////////////////////////////////////
// Deploy FlashPos contract
////////////////////////////////////////////////////////////////////////////////////////////////////////
const kovanLendingPool = "0x88757f2f99175387ab4c6a4b3067c77a695b0349";
const ethscan = "https://kovan.etherscan.io";

const FlashPos = await ethers.getContractFactory("FlashPos");
const flashPos = await FlashPos.deploy(kovanLendingPool);
console.log(`Contract  ${ethscan}/address/${flashPos.address}`);

const tx = (await flashPos.deployed()).deployTransaction;
console.log(`TX        ${ethscan}/tx/${tx.hash}`);
////////////////////////////////////////////////////////////////////////////////////////////////////////
