const { expect } = require("chai");
const { ethers } = require("hardhat");


describe("AaveTest2 deployment and run", function () {
  this.timeout(0);

  it("Should run AaveTest2 Contract and start FlashLoan", async function () {

    // Aave Deployed Contracts Addresses : https://docs.aave.com/developers/deployed-contracts
    const kovanLendingPool = "0x88757f2f99175387ab4c6a4b3067c77a695b0349";
    const aaveTest2DAI = "1000";
    const aaveTest2ETH = "0.1";

    const AaveTest2 = await ethers.getContractFactory("AaveTest2");
    const aaveTest2 = await AaveTest2.deploy(kovanLendingPool);
    const tx1 = (await aaveTest2.deployed()).deployTransaction;
    console.log("Contract  https://kovan.etherscan.io/address/" + aaveTest2.address);

    expect(tx1.hash).to.match(/^0x/);
    console.log("Tx1       https://kovan.etherscan.io/tx/" + tx1.hash);

    expect(await aaveTest2.isOwner()).to.be.true;

    const signer = (await ethers.getSigners())[0];
    expect(signer.address).to.match(/^0x/);
    console.log("Signer    https://kovan.etherscan.io/address/" + signer.address);

    console.log("Sending " + aaveTest2ETH + " ether to contract... ");
    const tx2 = await signer.sendTransaction({
      to: aaveTest2.address,
      value: ethers.utils.parseEther(aaveTest2ETH)
    });
    expect(tx2.hash).to.match(/^0x/);
    console.log("Tx2       https://kovan.etherscan.io/tx/" + tx2.hash);

    await tx2.wait();
    console.log("Sent!     https://kovan.etherscan.io/address/" + aaveTest2.address);


    console.log("Sending " + aaveTest2DAI + " DAI to contract... ");
    const kovanDai = "0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD";
    const abiErc20Transfert = ["function transfer(address to, uint amount) returns (boolean)"];
    const aaveTest2Dai = new ethers.Contract(kovanDai, abiErc20Transfert, signer);
    expect(aaveTest2Dai.address).to.match(/^0x/);
    console.log("Dai       https://kovan.etherscan.io/address/" + aaveTest2Dai.address);

    const tx3 = await aaveTest2Dai.transfer(aaveTest2.address, ethers.utils.parseEther(aaveTest2DAI));
    expect(tx3.hash).to.match(/^0x/);
    console.log("Tx3       https://kovan.etherscan.io/tx/" + tx3.hash);

    await tx3.wait();
    console.log("Sent!     https://kovan.etherscan.io/address/" + aaveTest2.address);


    try {
      const tx4 = await aaveTest2.myFlashLoanCall();
      expect(tx4.hash).to.match(/^0x/);
      console.log("Tx4 Flash https://kovan.etherscan.io/tx/" + tx4.hash);
      await tx4.wait();
    } catch (e) {
      console.error("ERROR", e);
    }
    finally {
      const tx5 = await aaveTest2.rugPullERC20();
      console.log("Tx5       https://kovan.etherscan.io/tx/" + tx5.hash);
      const tx6 = await aaveTest2.rugPullETH();
      console.log("Tx6       https://kovan.etherscan.io/tx/" + tx6.hash);
    }

  });
});
