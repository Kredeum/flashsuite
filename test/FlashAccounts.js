const { expect } = require("chai");
const { ethers } = require("hardhat");

const ethscan = "https://kovan.etherscan.io";

describe("FlashAccounts deployment and run", function () {
  this.timeout(0);

  it("Should run FlashAccounts and start FlashLoan", async function () {

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // CONSTANTS
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    const kovanLendingPool = "0x88757f2f99175387ab4c6a4b3067c77a695b0349";
    const DAI = "0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD";
    const USDC = "0xe22da380ee6B445bb8273C81944ADEB6E8450422";
    const BAT = "0x2d12186Fbb9f9a8C28B3FfdD4c42920f8539D738";


    // COLLATERALS
    const collateralSNX = ethers.utils.parseEther('20');
    const collateralYFI = ethers.utils.parseEther('1');
    const aSNX = "0xAA74AdA92dE4AbC0371b75eeA7b1bd790a69C9e1";
    const aYFI = "0xF6c7282943Beac96f6C70252EF35501a6c1148Fe";
    const deposits = [{aTokenAddress: aSNX, amount: collateralSNX, symbol: 'aSNX'}, {aTokenAddress: aYFI, amount: collateralYFI, symbol: 'aYFI'}];

    // DEBT
    const stableDAI = "0x3B91257Fe5CA63b4114ac41A0d467D25E2F747F3";
    const stableBAT = "0x07a0B32983ab8203E8C3493F0AbE5bFe784fAa15";
    const aliceBorrowedDAI = ethers.utils.parseEther('10');
    const aliceBorrowedBAT = ethers.utils.parseEther('10');
    const loans = [{symbol: 'DAI', underlyingAsset: DAI, amount: aliceBorrowedDAI, stableDebtTokenAddress: stableDAI}, {symbol: 'BAT', underlyingAsset: BAT, amount: aliceBorrowedBAT, stableDebtTokenAddress: stableBAT}];
   
    // console.log(`DAI       ${ethscan}/address/${DAI}`);
    // console.log(`sDAI      ${ethscan}/address/${sDAI}`);
    // console.log(`aSNX      ${ethscan}/address/${aSNX}`);
    console.log(`DAI borrowed ${aliceBorrowedDAI.toString()}`)
    console.log(`BAT borrowed ${aliceBorrowedBAT.toString()}`)
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
    for await (const [index, loan] of loans.entries()) {
      const stableDebtcontract = await ethers.getContractAt("contracts/aave/Interfaces.sol:IStableDebtToken", loan.stableDebtTokenAddress);

      const amountToBorrow = loan.amount;
      const flashloanPremium = amountToBorrow.mul(9).div(10000);
      const totalToBorrow = amountToBorrow.add(flashloanPremium);
      
      const tx2 = await stableDebtcontract.connect(Bob).approveDelegation(flashAccounts.address, totalToBorrow);
      await tx2.wait();
      console.log(`TX2.${index} CD    ${ethscan}/tx/${tx2.hash}`);
      
      // allowance verification
      const allowance = await stableDebtcontract.borrowAllowance(Bob.address, flashAccounts.address);
      console.log(`Allowance ${allowance.toString()}`);
      expect(allowance.toString() == totalToBorrow.toString());
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////


    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // TX3 : Run Flash Loan
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    const borrowedUnderlyingAssets = loans.map(loan => loan.underlyingAsset);
    const borrowedAmounts = loans.map(loan => loan.amount);
    console.log('borrowedAmounts', JSON.stringify(borrowedAmounts));
    try {
      const aTokens = [aSNX, aYFI];
      const aTokenAmounts = [collateralSNX, collateralYFI];
      const tx3 = await flashAccounts.connect(Alice).migratePositions(Alice.address, Bob.address, aTokens, aTokenAmounts, borrowedUnderlyingAssets, borrowedAmounts);
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
      const tx4 = await flashAccounts.rugPull(borrowedUnderlyingAssets, true);
      console.log(`TX4       ${ethscan}/tx/${tx4.hash}`);
    }

  });
});
