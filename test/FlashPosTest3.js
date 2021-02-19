const { expect } = require("chai");
const { BigNumber } = require("ethers");

const hre = require("hardhat");
const ethers = hre.ethers;

const ethscan = "https://kovan.etherscan.io";

describe("FlashPos deployment and run", function () {
  this.timeout(0);

  it("Should run FlashPos and start FlashLoan", async function () {

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // CONSTANTS
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    let aaveLendingPool;
    let DAI;
    let BAT;
    let aSNX;
    let aYFI;
    let sDAI;
    let sBAT;
    const network = hre.network.name;
    console.log("network",network);
    
    if (network == "kovan") {
      aaveLendingPool = "0x88757f2f99175387ab4c6a4b3067c77a695b0349";
      DAI = "0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD";
      BAT = "0x2d12186Fbb9f9a8C28B3FfdD4c42920f8539D738";
      aSNX = "0xAA74AdA92dE4AbC0371b75eeA7b1bd790a69C9e1";
      aYFI = "0xF6c7282943Beac96f6C70252EF35501a6c1148Fe";
      sDAI = "0x3B91257Fe5CA63b4114ac41A0d467D25E2F747F3";
      sBAT = "0x07a0B32983ab8203E8C3493F0AbE5bFe784fAa15";
    } else {
      aaveLendingPool = "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5";
      DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
      BAT = "0x0d8775f648430679a709e98d2b0cb6250d2887ef";
      aSNX = "0x35f6B052C598d933D69A4EEC4D04c73A191fE6c2";
      aYFI = "0x5165d24277cD063F5ac44Efd447B27025e888f37";
      sDAI = "0x778A13D3eeb110A4f7bb6529F99c000119a08E92";
      sBAT = "0x277f8676FAcf4dAA5a6EA38ba511B7F65AA02f9F";
    }

    // COLLATERALS
    const aSNXamount = ethers.utils.parseEther('100');
    const aYFIamount = ethers.utils.parseEther('100');
    const deposits = [{
      amount: aSNXamount,
      symbol: 'aSNX',
      aTokenAddress: aSNX
    }, {
      amount: aYFIamount,
      symbol: 'aYFI',
      aTokenAddress: aYFI
    }];
    console.log(`aSNX deposits ${aSNXamount.toString()}\n${ethscan}/address/${aSNX}`);
    console.log(`aYFI deposits ${aYFIamount.toString()}\n${ethscan}/address/${aYFI}`);
    ////////////////////////////////////////////////////////////////////////////////////////////////////////

    // DEBT
    const sDAIamount = ethers.utils.parseEther('13');
    const sBATamount = ethers.utils.parseEther('13');
    const loans = [{
      amount: sDAIamount,
      symbol: 'DAI',
      stableDebtTokenAddress: sDAI,
      underlyingAsset: DAI
    },
    {
      amount: sBATamount,
      symbol: 'BAT',
      stableDebtTokenAddress: sBAT,
      underlyingAsset: BAT
    }];
    console.log(`sDAI loans ${sDAIamount.toString()}\n${ethscan}/address/${sDAI}`);
    console.log(`sBAT loans ${sBATamount.toString()}\n${ethscan}/address/${sBAT}`);
    ////////////////////////////////////////////////////////////////////////////////////////////////////////


    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // SIGNERS
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    const [Destination, Origin] = (await ethers.getSigners());
    expect(Origin.address).to.match(/^0x/);
    expect(Destination.address).to.match(/^0x/);

    console.log(`Origin\n${ethscan}/address/${Origin.address}`);
    console.log(`Destination\n${ethscan}/address/${Destination.address}`);
    ////////////////////////////////////////////////////////////////////////////////////////////////////////


    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // TX0 : Deploy FlashPos contract
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    const FlashPos = await ethers.getContractFactory("FlashPos", Destination);
    const flashPos = await FlashPos.deploy(aaveLendingPool);
    expect(await flashPos.isOwner()).to.be.true;
    console.log(`Contract\n${ethscan}/address/${flashPos.address}`);

    const tx0 = (await flashPos.deployed()).deployTransaction;
    expect(tx0.hash).to.match(/^0x/);
    console.log(`TX0 CALL\n${ethscan}/tx/${tx0.hash}`);
    const tx0f = await tx0.wait();
    console.log(`TX0 END`);
    // console.log(tx0f);
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // const flashPos = new ethers.Contract("0x2316b9B7B794c32AD95F0D836165f977065fFb93", FlashPosABI);
    // console.log(`Contract\n${ethscan}/address/${flashPos.address}`);
    ////////////////////////////////////////////////////////////////////////////////////////////////////////



    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // TX1 : Get aTokens allowance
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    for await (const [index, deposit] of deposits.entries()) {
      const aTokencontrat = await ethers.getContractAt("contracts/interfaces/IERC20.sol:IERC20", deposit.aTokenAddress, Origin);

      const tx1 = await aTokencontrat.approve(flashPos.address, deposit.amount);

      expect(tx1.hash).to.match(/^0x/);
      console.log(`TX1.${index} CALL Allow ${deposit.symbol} ${deposit.amount}\n${ethscan}/tx/${tx1.hash}`);
      await tx1.wait();
      const tx1f = await tx1.wait();
      console.log(`TX1.${index} END`);
      // console.log(tx1f);
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

      const tx2 = await stableDebtcontract.connect(Destination).approveDelegation(flashPos.address, totalToBorrow);

      console.log(`TX2.${index} CALL Credit Delegation ${loan.symbol} ${loan.amount} ${totalToBorrow}\n${ethscan}/tx/${tx2.hash}`);
      const tx2f = await tx2.wait();
      console.log(`TX2.${index} END`);
      // console.log(tx2f);

      // allowance verification
      const allowance = await stableDebtcontract.borrowAllowance(Destination.address, flashPos.address);
      console.log(`Allowance ${allowance.toString()}`);
      expect(allowance.toString() == totalToBorrow.toString());
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////


    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // TX3 : Run Flash Loan
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    const borrowedUnderlyingAssets = loans.map(loan => loan.underlyingAsset);
    const borrowedAmounts = loans.map(loan => loan.amount);

    try {
      const aTokens = [aSNX, aYFI];
      // const aTokenAmounts = [collateralSNX, collateralYFI];
      const minusOne = BigNumber.from(2).pow(BigNumber.from(256)).sub(BigNumber.from(1));
      const aTokenAmounts = [minusOne, minusOne]; // test with max balance
      const interestRateModes = [1, 1];

      const tx3 = await flashPos.connect(Origin).migratePositions(Origin.address, Destination.address, aTokens, aTokenAmounts, borrowedUnderlyingAssets, borrowedAmounts, interestRateModes);

      console.log(`TX3 CALL Flash\n${ethscan}/tx/${tx3.hash}`);
      expect(tx3.hash).to.match(/^0x/);
      const tx3f = await tx3.wait();
      console.log(`TX3 END`);
      console.log(tx3f);

    } catch (e) {
      console.error("ERROR", e);
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////


    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // TX4 : Get crumbs back
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    finally {
      const tx4 = await flashPos.connect(Origin).rugPull(borrowedUnderlyingAssets, true);
      console.log(`TX4\n${ethscan}/tx/${tx4.hash}`);
    }

  });
});
