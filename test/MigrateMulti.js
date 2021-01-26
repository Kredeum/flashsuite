const { expect } = require("chai");
const { ethers } = require("hardhat");

const ethscan = "https://kovan.etherscan.io";

describe("FlashAccounts deployment and run", function () {
  this.timeout(0);

  // Approve transfer of all aTokens
  // Approve credit delegation
  // Transfer position

  it("Should run FlashAccounts and start FlashLoan", async function () {

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // CONSTANTS
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    const kovanLendingPool = "0x88757f2f99175387ab4c6a4b3067c77a695b0349";
    const DAI = "0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD";

    // COLLATERALS
    const collateralSNX = ethers.utils.parseEther('10');
    const collateralYFI = ethers.utils.parseEther('1');
    const aSNX = "0xAA74AdA92dE4AbC0371b75eeA7b1bd790a69C9e1";
    const aYFI = "0xF6c7282943Beac96f6C70252EF35501a6c1148Fe";
    const deposits = [{aTokenAddress: aSNX, amount: collateralSNX, symbol: 'aSNX'}, {aTokenAddress: aYFI, amount: collateralYFI, symbol: 'aYFI'}];

    // DEBT
    const flashBorrowedDAI = 10;
    const flashLoanFee = 1;
    const bobBorrowedDAI = flashBorrowedDAI + flashLoanFee;
    const sDAI = "0x3B91257Fe5CA63b4114ac41A0d467D25E2F747F3";
   
    console.log(`DAI       ${ethscan}/address/${DAI}`);
    console.log(`sDAI      ${ethscan}/address/${sDAI}`);
    console.log(`aSNX      ${ethscan}/address/${aSNX}`);
    ////////////////////////////////////////////////////////////////////////////////////////////////////////


    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // SIGNERS
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    const [Bob, Alice] = (await ethers.getSigners());
    expect(Alice.address).to.match(/^0x/);
    expect(Bob.address).to.match(/^0x/);
    
    console.log(`Alice     ${ethscan}/address/${Alice.address}`);
    console.log(`Bob       ${ethscan}/address/${Bob.address}`);
    ////////////////////////////////////////////////////////////////////////////////////////////////////////


    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // TX0 : Create FlashAccounts contract
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    const FlashAccounts = await ethers.getContractFactory("FlashAccounts", Bob);
    const flashAccounts = await FlashAccounts.deploy(kovanLendingPool);
    expect(await flashAccounts.isOwner()).to.be.true;
    console.log(`Contract  ${ethscan}/address/${flashAccounts.address}`);

    const tx0 = (await flashAccounts.deployed()).deployTransaction;
    expect(tx0.hash).to.match(/^0x/);
    console.log(`TX0       ${ethscan}/tx/${tx0.hash}`);
    ////////////////////////////////////////////////////////////////////////////////////////////////////////


    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // TX1 : Get aTokens allowance
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    for await (const [index, deposit] of deposits.entries()) {
      const aTokencontrat = await ethers.getContractAt("contracts/aave/Interfaces.sol:IERC20", deposit.aTokenAddress, Alice);

      const balance = await aTokencontrat.balanceOf(Alice.address);
      expect(balance).to.be.at.least(deposit.amount);
      
      const tx1 = await aTokencontrat.approve(flashAccounts.address, deposit.amount);
      expect(tx1.hash).to.match(/^0x/);
      console.log(`TX1.${index} Allow ${deposit.symbol} ${ethscan}/tx/${tx1.hash}`);
    }
     
    ////////////////////////////////////////////////////////////////////////////////////////////////////////


    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // TX2 : Get Credit Delegation approval 
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    const stableDebtDAIcontract = await ethers.getContractAt("contracts/aave/Interfaces.sol:IStableDebtToken", sDAI);
    const tx2 = await stableDebtDAIcontract.connect(Bob).approveDelegation(flashAccounts.address, ethers.utils.parseEther(bobBorrowedDAI.toString()));
    await tx2.wait();
    console.log(`TX2 CD    ${ethscan}/tx/${tx2.hash}`);

    // allowance verification
    const allowance = await stableDebtDAIcontract.borrowAllowance(Bob.address, flashAccounts.address);
    console.log(`Allowance ${allowance.toString()}`);
    expect(allowance.toString() == bobBorrowedDAI.toString());
    ////////////////////////////////////////////////////////////////////////////////////////////////////////


    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // TX3 : Run Flash Loan
    ////////////////////////////////////////////////////////////////////////////////////////////////////////



    try {
      const aTokens = [aSNX, aYFI];
      const aTokenAmounts = [collateralSNX, collateralYFI];
      const tx3 = await flashAccounts.connect(Alice).migratePositions(Alice.address, Bob.address, aTokens, aTokenAmounts);
      expect(tx3.hash).to.match(/^0x/);
      console.log(`TX3 Flash ${ethscan}/tx/${tx3.hash}`);
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
      console.log(`TX4       ${ethscan}/tx/${tx4.hash}`);
    }

  });
});
