const { expect } = require("chai");
const { ethers } = require("hardhat");


describe("contrat deployment and run", function () {
  this.timeout(0);

  it("Should run contrat AaveTest4 and start FlashLoan", async function () {

    // Aave Deployed Contracts Addresses : https://docs.aave.com/developers/deployed-contracts
    const kovanLendingPool = "0x88757f2f99175387ab4c6a4b3067c77a695b0349";
    const flashDAI = 10000;
    const borrowDAI = 5000;
    const amountDAI = flashDAI * 0.0009;
    const SDAI = "0x3B91257Fe5CA63b4114ac41A0d467D25E2F747F3";

    const delegator = (await ethers.getSigners())[0];
    expect(delegator.address).to.match(/^0x/);
    console.log("Delegator https://kovan.etherscan.io/address/" + delegator.address);

    const borrower = (await ethers.getSigners())[1];
    expect(borrower.address).to.match(/^0x/);
    console.log("Borrower  https://kovan.etherscan.io/address/" + borrower.address);

    const Contrat = await ethers.getContractFactory("AaveTest4", borrower);
    const contrat = await Contrat.deploy(kovanLendingPool);
    expect(await contrat.isOwner()).to.be.true;
    console.log("Contract  https://kovan.etherscan.io/address/" + contrat.address);

    const tx1 = (await contrat.deployed()).deployTransaction;
    expect(tx1.hash).to.match(/^0x/);
    console.log("Tx1       https://kovan.etherscan.io/tx/" + tx1.hash);

    // approve credit delegation 
    const sDAI = await ethers.getContractAt("contracts/aave/Interfaces.sol:IStableDebtToken", SDAI);
    const tx0 = await sDAI.connect(delegator).approveDelegation(contrat.address, ethers.utils.parseEther(borrowDAI.toString()));
    await tx0.wait();
    console.log("Tx0 CD    https://kovan.etherscan.io/tx/" + tx0.hash);

    // allowance verification
    const allowance = await sDAI.borrowAllowance(delegator.address, borrower.address);
    console.log("Allowance", allowance.toString());
    expect(allowance.toString() == flashDAI.toString());

    if (amountDAI > 0) {
      console.log("Sending", amountDAI, "DAI to contract to pay", flashDAI, "DAI flashloan 0,09% fees... ");
      const kovanDai = "0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD";
      const abiErc20Transfert = ["function transfer(address to, uint amount) returns (boolean)"];
      const contratDai = new ethers.Contract(kovanDai, abiErc20Transfert, delegator);
      expect(contratDai.address).to.match(/^0x/);
      console.log("Dai       https://kovan.etherscan.io/address/" + contratDai.address);

      const tx2 = await contratDai.transfer(contrat.address, ethers.utils.parseEther(amountDAI.toString()));
      expect(tx2.hash).to.match(/^0x/);
      console.log("Tx2       https://kovan.etherscan.io/tx/" + tx2.hash);

      await tx2.wait();
      console.log("Sent!     https://kovan.etherscan.io/address/" + contrat.address);
    }

    try {
      const tx3 = await contrat.myFlashLoanCall();
      expect(tx3.hash).to.match(/^0x/);
      console.log("Tx3 Flash https://kovan.etherscan.io/tx/" + tx3.hash);
      await tx3.wait();
    } catch (e) {
      console.error("ERROR", e);
    }
    finally {
      const tx4 = await contrat.rugPullERC20();
      console.log("Tx4       https://kovan.etherscan.io/tx/" + tx4.hash);
      const tx5 = await contrat.rugPullETH();
      console.log("Tx5       https://kovan.etherscan.io/tx/" + tx5.hash);
    }

  });
});
