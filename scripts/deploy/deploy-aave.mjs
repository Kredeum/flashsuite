import hre from 'hardhat';
const { ethers } = hre;

// Aave Deployed Contracts Addresses : https://docs.aave.com/developers/deployed-contracts
const kovanLendingPoolAddressesProvider = "0x88757f2f99175387ab4c6a4b3067c77a695b0349";
const aaveTestDAI = "1000";
const aaveTestETH = "0.1";

console.log("AaveTest deployment and test");

const AaveTest = await ethers.getContractFactory("AaveTest1");
const aaveTest = await AaveTest.deploy(kovanLendingPoolAddressesProvider);
await aaveTest.deployed();
console.log("AaveTest deployed to:", aaveTest.address);

const signer = (await ethers.getSigners())[0];
console.log("signer", signer.address);

process.stdout.write("sending " + aaveTestETH + " ether to contract... ");
const tx1 = await signer.sendTransaction({
  to: aaveTest.address,
  value: ethers.utils.parseEther(aaveTestETH)
});
await tx1.wait();
console.log("sent!");

process.stdout.write("sending " + aaveTestDAI + " DAI to contract... ");
const kovanDai = "0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD";
const abiErc20Transfert = ["function transfer(address to, uint amount) returns (boolean)"];
const aaveTestDai = new ethers.Contract(kovanDai, abiErc20Transfert, signer);
const tx2 = await aaveTestDai.transfer(aaveTest.address, ethers.utils.parseEther(aaveTestDAI));
await tx2.wait();
console.log("sent!");

try {
  const tx3 = await aaveTest.myFlashLoanCall();
  console.log("aaveTest.myFlashLoanCall()", tx3);
  await tx3.wait();
} catch (e) {
  console.error("ERROR",e);
}
finally {
  await aaveTest.rugPullERC20();
  await aaveTest.rugPullETH();    
}
