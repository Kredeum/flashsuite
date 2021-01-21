const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AaveTest deployment and run", function () {
  this.timeout(0);

  it("Should run AaveTest Contract and start FlashLoan", async function () {
    // Aave Deployed Contracts Addresses : https://docs.aave.com/developers/deployed-contracts
    const kovanLendingPool = "0x88757f2f99175387ab4c6a4b3067c77a695b0349";
    const aaveTestDAI = "1000";
    const aaveTestETH = "0.1";

    const AaveTest = await ethers.getContractFactory("AaveTest");
    const aaveTest = await AaveTest.deploy(kovanLendingPool);
    const tx1 = (await aaveTest.deployed()).deployTransaction;
    console.log(
      "Contract  https://kovan.etherscan.io/address/" + aaveTest.address
    );

    expect(tx1.hash).to.match(/^0x/);
    console.log("Tx1       https://kovan.etherscan.io/tx/" + tx1.hash);

    expect(await aaveTest.isOwner()).to.be.true;

    const signer = (await ethers.getSigners())[0];
    expect(signer.address).to.match(/^0x/);
    console.log(
      "Signer    https://kovan.etherscan.io/address/" + signer.address
    );

    console.log("Sending " + aaveTestETH + " ether to contract... ");
    const tx2 = await signer.sendTransaction({
      to: aaveTest.address,
      value: ethers.utils.parseEther(aaveTestETH),
    });
    expect(tx2.hash).to.match(/^0x/);
    console.log("Tx2       https://kovan.etherscan.io/tx/" + tx2.hash);

    await tx2.wait();
    console.log(
      "Sent!     https://kovan.etherscan.io/address/" + aaveTest.address
    );

    console.log("Sending " + aaveTestDAI + " DAI to contract... ");
    const kovanDai = "0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD";
    const abiErc20Transfert = [
      "function transfer(address to, uint amount) returns (boolean)",
    ];
    const aaveTestDai = new ethers.Contract(
      kovanDai,
      abiErc20Transfert,
      signer
    );
    expect(aaveTestDai.address).to.match(/^0x/);
    console.log(
      "Dai       https://kovan.etherscan.io/address/" + aaveTestDai.address
    );

    const tx3 = await aaveTestDai.transfer(
      aaveTest.address,
      ethers.utils.parseEther(aaveTestDAI)
    );
    expect(tx3.hash).to.match(/^0x/);
    console.log("Tx3       https://kovan.etherscan.io/tx/" + tx3.hash);

    await tx3.wait();
    console.log(
      "Sent!     https://kovan.etherscan.io/address/" + aaveTest.address
    );

    try {
      const tx4 = await aaveTest.myFlashLoanCall();
      expect(tx4.hash).to.match(/^0x/);
      console.log("Tx4 Flash https://kovan.etherscan.io/tx/" + tx4.hash);
      await tx4.wait();
    } catch (e) {
      console.error("ERROR", e);
    } finally {
      const tx5 = await aaveTest.rugPull();
      console.log("Tx5       https://kovan.etherscan.io/tx/" + tx5.hash);
    }
  });
});
