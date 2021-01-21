const { expect } = require("chai");
const { ethers } = require("hardhat");


describe("AaveTest1 deployment and run", function () {
  this.timeout(0);

  it("Should run AaveTest1 Contract and start FlashLoan", async function () {

    // Aave Deployed Contracts Addresses : https://docs.aave.com/developers/deployed-contracts
    const kovanLendingPool = "0x88757f2f99175387ab4c6a4b3067c77a695b0349";
    const aaveTest1DAI = "1000";
    const aaveTest1ETH = "0.1";

    const AaveTest1 = await ethers.getContractFactory("AaveTest1");
    const aaveTest1 = await AaveTest1.deploy(kovanLendingPool);
    const tx1 = (await aaveTest1.deployed()).deployTransaction;
    console.log("Contract  https://kovan.etherscan.io/address/" + aaveTest1.address);

    expect(tx1.hash).to.match(/^0x/);
    console.log("Tx1       https://kovan.etherscan.io/tx/" + tx1.hash);

    expect(await aaveTest1.isOwner()).to.be.true;

    const signer = (await ethers.getSigners())[0];
    expect(signer.address).to.match(/^0x/);
    console.log("Signer    https://kovan.etherscan.io/address/" + signer.address);

    console.log("Sending " + aaveTest1ETH + " ether to contract... ");
    const tx2 = await signer.sendTransaction({
      to: aaveTest1.address,
      value: ethers.utils.parseEther(aaveTest1ETH)
    });
    expect(tx2.hash).to.match(/^0x/);
    console.log("Tx2       https://kovan.etherscan.io/tx/" + tx2.hash);

    await tx2.wait();
    console.log("Sent!     https://kovan.etherscan.io/address/" + aaveTest1.address);


    console.log("Sending " + aaveTest1DAI + " DAI to contract... ");
    const kovanDai = "0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD";
    const abiErc20Transfert = ["function transfer(address to, uint amount) returns (boolean)"];
    const aaveTest1Dai = new ethers.Contract(kovanDai, abiErc20Transfert, signer);
    expect(aaveTest1Dai.address).to.match(/^0x/);
    console.log("Dai       https://kovan.etherscan.io/address/" + aaveTest1Dai.address);

    const tx3 = await aaveTest1Dai.transfer(aaveTest1.address, ethers.utils.parseEther(aaveTest1DAI));
    expect(tx3.hash).to.match(/^0x/);
    console.log("Tx3       https://kovan.etherscan.io/tx/" + tx3.hash);

    await tx3.wait();
    console.log("Sent!     https://kovan.etherscan.io/address/" + aaveTest1.address);


    try {
      const tx4 = await aaveTest1.myFlashLoanCall();
      expect(tx4.hash).to.match(/^0x/);
      console.log("Tx4 Flash https://kovan.etherscan.io/tx/" + tx4.hash);
      await tx4.wait();
    } catch (e) {
      console.error("ERROR", e);
    }
    finally {
      const tx5 = await aaveTest1.rugPullERC20();
      console.log("Tx5       https://kovan.etherscan.io/tx/" + tx5.hash);
      const tx6 = await aaveTest1.rugPullETH();
      console.log("Tx6       https://kovan.etherscan.io/tx/" + tx6.hash);
    }

  });
});
