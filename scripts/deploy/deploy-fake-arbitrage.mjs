import hre from 'hardhat';
const { ethers } = hre;

const FakeArbitrageStrategy = await ethers.getContractFactory("FakeArbitrageStrategy");
const fakeArbitrageStrategy = await FakeArbitrageStrategy.deploy();
const tx = (await fakeArbitrageStrategy.deployed()).deployTransaction;

console.log("Contract  https://kovan.etherscan.io/address/" + fakeArbitrageStrategy.address);

console.log("Tx       https://kovan.etherscan.io/tx/" + tx.hash);


console.log("\n==>", fakeArbitrageStrategy.address, "<==")