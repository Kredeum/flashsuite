const { expect } = require("chai");
const { ethers } = require("hardhat");


describe("AaveTest4 deployment and run", function () {
  this.timeout(0);

  it("Should run AaveTest4 Contract and start FlashLoan", async function () {

    // Aave Deployed Contracts Addresses : https://docs.aave.com/developers/deployed-contracts
    const kovanLendingPool = "0x88757f2f99175387ab4c6a4b3067c77a695b0349";
    const aaveTest4DAI = "1";
    const aaveTest4ETH = "0";

    const signer = (await ethers.getSigners())[0];
    expect(signer.address).to.match(/^0x/);
    console.log("Signer    https://kovan.etherscan.io/address/" + signer.address);

    const AaveTest4 = await ethers.getContractFactory("AaveTest4");
    const aaveTest4 = await AaveTest4.deploy(kovanLendingPool);
    expect(await aaveTest4.isOwner()).to.be.true;
    console.log("Contract  https://kovan.etherscan.io/address/" + aaveTest4.address);

    const tx1 = (await aaveTest4.deployed()).deployTransaction;
    expect(tx1.hash).to.match(/^0x/);
    console.log("Tx1       https://kovan.etherscan.io/tx/" + tx1.hash);

    if (aaveTest4ETH > 0) {
      console.log("Sending " + aaveTest4ETH + " ether to contract... ");
      const tx2 = await signer.sendTransaction({
        to: aaveTest4.address,
        value: ethers.utils.parseEther(aaveTest4ETH)
      });
      expect(tx2.hash).to.match(/^0x/);
      console.log("Tx2       https://kovan.etherscan.io/tx/" + tx2.hash);
      await tx2.wait();
      console.log("Sent!     https://kovan.etherscan.io/address/" + aaveTest4.address);
    }

    if (aaveTest4DAI > 0) {
      console.log("Sending " + aaveTest4DAI + " DAI to contract to pay flashloan 0,09% fees... ");
      const kovanDai = "0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD";
      const abiErc20Transfert = ["function transfer(address to, uint amount) returns (boolean)"];
      const aaveTest4Dai = new ethers.Contract(kovanDai, abiErc20Transfert, signer);
      expect(aaveTest4Dai.address).to.match(/^0x/);
      console.log("Dai       https://kovan.etherscan.io/address/" + aaveTest4Dai.address);

      const tx3 = await aaveTest4Dai.transfer(aaveTest4.address, ethers.utils.parseEther(aaveTest4DAI));
      expect(tx3.hash).to.match(/^0x/);
      console.log("Tx3       https://kovan.etherscan.io/tx/" + tx3.hash);

      await tx3.wait();
      console.log("Sent!     https://kovan.etherscan.io/address/" + aaveTest4.address);
    }

    try {
      const tx4 = await aaveTest4.myFlashLoanCall();
      expect(tx4.hash).to.match(/^0x/);
      console.log("Tx4 Flash https://kovan.etherscan.io/tx/" + tx4.hash);
      await tx4.wait();
    } catch (e) {
      console.error("ERROR", e);
    }
    finally {
      const tx5 = await aaveTest4.rugPullERC20();
      console.log("Tx5       https://kovan.etherscan.io/tx/" + tx5.hash);
      const tx6 = await aaveTest4.rugPullETH();
      console.log("Tx6       https://kovan.etherscan.io/tx/" + tx6.hash);
    }

  });
});
