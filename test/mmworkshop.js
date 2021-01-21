const { expect } = require("chai");
const { ethers } = require("hardhat");


describe("DemoFlashloanReceiver", function () {
  // this.timeout(0);

  it("Should deploy DemoFlashloanReceiver and run FlashLoan", async function () {


    const demoFlashloanReceiver = await (await ethers.getContractFactory("DemoFlashloanReceiver")).deploy();
    const tx1 = (await demoFlashloanReceiver.deployed()).deployTransaction;
    console.log("Contract  https://kovan.etherscan.io/address/" + demoFlashloanReceiver.address);
    expect(tx1.hash).to.match(/^0x/);
    console.log("Tx1       https://kovan.etherscan.io/tx/" + tx1.hash);

    const signer = (await ethers.getSigners())[0];
    expect(signer.address).to.match(/^0x/);
    console.log("Signer    https://kovan.etherscan.io/address/" + signer.address);


    const fakeArbitrageStrategyAddress = "0x28e14e3546B5e37F7296c71f986abb0CB78BE0c2";
    const fakeArbitrageStrategy = await hre.ethers.getContractAt("FakeArbitrageStrategy", fakeArbitrageStrategyAddress);


    // const tx2 = await fakeArbitrageStrategy.myFlashLoanCall();
    // expect(tx2.hash).to.match(/^0x/);
    // console.log("Tx2 Flash https://kovan.etherscan.io/tx/" + tx2.hash);
    // await tx2.wait();
  });
});
