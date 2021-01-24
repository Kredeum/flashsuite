const { expect } = require("chai");
const { ethers } = require("hardhat");


describe("FlashAccounts deployment and run", function () {
  this.timeout(0);

  it("Should run FlashAccounts and start FlashLoan", async function () {

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // CONSTANTS
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    const kovanLendingPool = "0x88757f2f99175387ab4c6a4b3067c77a695b0349";
    const collSNX = 20;
    const borrowDAI = 10;
    const flashDAI = 10;
    const feeDAI = 1;  // = flashDAI * 0.0009;
    const DAI = "0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD";
    const aSNX = "0xAA74AdA92dE4AbC0371b75eeA7b1bd790a69C9e1";
    const sDAI = "0x3B91257Fe5CA63b4114ac41A0d467D25E2F747F3";
    console.log("DAI       https://kovan.etherscan.io/address/" + DAI);
    console.log("sDAI      https://kovan.etherscan.io/address/" + sDAI);
    console.log("aSNX      https://kovan.etherscan.io/address/" + aSNX);
    ////////////////////////////////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // SIGNERS
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    const Alice = (await ethers.getSigners())[1];
    expect(Alice.address).to.match(/^0x/);
    console.log("Alice     https://kovan.etherscan.io/address/" + Alice.address);

    const Bob = (await ethers.getSigners())[0];
    expect(Bob.address).to.match(/^0x/);
    console.log("Bob       https://kovan.etherscan.io/address/" + Bob.address);
    ////////////////////////////////////////////////////////////////////////////////////////////////////////


    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // TX0 : Create FlashAccounts contract
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    const FlashAccounts = await ethers.getContractFactory("FlashAccounts", Bob);
    const flashAccounts = await FlashAccounts.deploy(kovanLendingPool);
    expect(await flashAccounts.isOwner()).to.be.true;
    console.log("Contract  https://kovan.etherscan.io/address/" + flashAccounts.address);

    const tx0 = (await flashAccounts.deployed()).deployTransaction;
    expect(tx0.hash).to.match(/^0x/);
    console.log("TX0       https://kovan.etherscan.io/tx/" + tx0.hash);
    ////////////////////////////////////////////////////////////////////////////////////////////////////////


    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // TX1 : Transfer FlashLoan Fees in advance
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    console.log("Sending", feeDAI, "DAI to contract to pay", flashDAI, "DAI flashloan 0,09% fees... ");
    const DAIcontrat = await ethers.getContractAt("contracts/aave/Interfaces.sol:IERC20", DAI, Alice);
    const tx1 = await DAIcontrat.transfer(flashAccounts.address, ethers.utils.parseEther(feeDAI.toString()));
    expect(tx1.hash).to.match(/^0x/);
    console.log("TX1 send  https://kovan.etherscan.io/tx/" + tx1.hash);
    await tx1.wait();
    console.log("Sent!     https://kovan.etherscan.io/address/" + flashAccounts.address);
    ////////////////////////////////////////////////////////////////////////////////////////////////////////


    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // TX2 : Get aSNX allowance
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    const aSNXcontrat = await ethers.getContractAt("contracts/aave/Interfaces.sol:IERC20", aSNX, Alice);
    const tx2 = await aSNXcontrat.approve(flashAccounts.address, ethers.utils.parseEther(collSNX.toString()));
    expect(tx2.hash).to.match(/^0x/);
    console.log("TX2 Allow https://kovan.etherscan.io/tx/" + tx2.hash);
    ////////////////////////////////////////////////////////////////////////////////////////////////////////


    // approve credit delegation 
    const sDAIcontract = await ethers.getContractAt("contracts/aave/Interfaces.sol:IStableDebtToken", sDAI);
    const txp = await sDAIcontract.connect(Bob).approveDelegation(flashAccounts.address, ethers.utils.parseEther(borrowDAI.toString()));
    await txp.wait();
    console.log("Txp CD    https://kovan.etherscan.io/tx/" + txp.hash);

    // allowance verification
    const allowance = await sDAIcontract.borrowAllowance(Bob.address, flashAccounts.address);
    console.log("Allowance", allowance.toString());
    expect(allowance.toString() == borrowDAI.toString());



    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // TX3 : Run Flash Loan
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    try {
      const tx3 = await flashAccounts.myFlashLoanCall();
      expect(tx3.hash).to.match(/^0x/);
      console.log("TX3 Flash https://kovan.etherscan.io/tx/" + tx3.hash);
      await tx3.wait();
    } catch (e) {
      console.error("ERROR", e);
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////


    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // TX4 : Get crumbs back
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    finally {
      const tx4 = await flashAccounts.rugPull();
      console.log("TX4       https://kovan.etherscan.io/tx/" + tx4.hash);
    }

  });
});
