const { expect } = require("chai");
const { ethers } = require("hardhat");
const { getReserveTokensAddresses } = require("../lib/aaveDataProvider");
const { formatEth, parseEth } = require("../lib/ethers-util");

describe("AaveTest deployment and run", function () {
  this.timeout(0);
  const kovanDaiAddress = "0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD";
  const kovanLendingPoolAddress = "0x9FE532197ad76c5a68961439604C037EB79681F0";
  const kovanDataProviderAddress = "0x3c73A5E5785cAC854D468F727c606C07488a29D6";
  let signer1;
  let signer2;
  let lendingPool;
  let kovanDai;

  let positionMigrator;

  before(async () => {
    [signer1, signer2] = await ethers.getSigners();
    console.log("signer1", signer1.address);
    console.log("signer2", signer2.address);

    lendingPool = await ethers.getContractAt(
      "contracts/aave/Interfaces.sol:ILendingPool",
      kovanLendingPoolAddress
    );
    kovanDai = await ethers.getContractAt("contracts/aave/Interfaces.sol:IERC20", kovanDaiAddress);

    // ##### Deploy PositionMigrator ######
    PositionMigratorFactory = await ethers.getContractFactory(
      "PositionMigrator"
    );
    positionMigrator = await PositionMigratorFactory.deploy();
    console.log(
      "Position Migrator deployed! Address:",
      positionMigrator.address
    );
  });

  after(async () => {
    await positionMigrator.rugPull();
    console.log("💥 Position Migrator contract destroyed 💥");
  });

  it.skip("should deposit in lending pool", async () => {
    const amountToDeposit = parseEth("1000");

    const {
      totalCollateralETH: initialCollateralETH,
    } = await lendingPool.getUserAccountData(signer1.address);
    console.log("initialCollateralETH:", initialCollateralETH.toString());

    // Approve lendingPool
    const approveTx = await kovanDai.approve(
      kovanLendingPoolAddress,
      amountToDeposit
    );
    await approveTx.wait();
    console.log("lending pool allowance approved");

    // Deposit
    const depositTx = await lendingPool.deposit(
      kovanDaiAddress,
      amountToDeposit,
      signer1.address,
      0
    );
    await depositTx.wait();
    console.log(`deposit of ${amountToDeposit} complete`);

    const {
      totalCollateralETH: newCollateralETH,
    } = await lendingPool.getUserAccountData(signer1.address);
    console.log("newCollateralETH:", newCollateralETH.toString());

    expect(newCollateralETH).gt(initialCollateralETH);
  });

  it.skip("should let signer1 borrow", async () => {
    const amountToBorrow = parseEth("100");
    const rateMode = 1; // stable

    const {
      totalCollateralETH,
      totalDebtETH: initialDebtETH,
    } = await lendingPool.getUserAccountData(signer1.address);

    console.log(
      "initialCollateralETH:",
      formatEth(totalCollateralETH),
      "initialDebtETH",
      formatEth(initialDebtETH)
    );

    // Need some collateral to be able to borrow
    // checks roughly 1000 DAI, hardcoded for now
    expect(totalCollateralETH).gt(parseEth("0.8"));

    const borrowTx = await lendingPool.borrow(
      kovanDaiAddress,
      amountToBorrow,
      rateMode,
      0,
      signer1.address
    );

    await borrowTx.wait();
    console.log("Borrowing done");

    const { totalDebtETH: newDebtETH } = await lendingPool.getUserAccountData(
      signer1.address
    );
    console.log("newDebtETH", formatEth(newDebtETH));

    expect(newDebtETH).gt(initialDebtETH);
  });

  describe.skip("repay loan through PositionMigrator", async () => {
    const amountToRepay = parseEth("100");

    it("should approve contract for Dai transfer", async () => {
      // approve contract for Dai transfer
      const approveTx = await kovanDai.approve(
        positionMigrator.address,
        amountToRepay
      );
      await approveTx.wait();
      console.log("PositionMigrator allowance approved");

      const allowance = await kovanDai.allowance(
        signer1.address,
        positionMigrator.address
      );

      expect(allowance).to.be.at.least(amountToRepay);
    });

    it("should let PositionMigrator repays the loan on behalf of signer 1", async () => {
      const asset = kovanDaiAddress;
      const borrower = signer1.address;
      const rateMode = 1;

      // Check initial debt
      const {
        totalDebtETH: initialDebtETH,
      } = await lendingPool.getUserAccountData(signer1.address);
      console.log("initialDebtETH", formatEth(initialDebtETH));

      // Repay
      const repayTx = await positionMigrator.repayLoan(
        asset,
        borrower,
        amountToRepay,
        rateMode
      );
      await repayTx.wait();

      // Check new debt
      const { totalDebtETH: newDebtETH } = await lendingPool.getUserAccountData(
        signer1.address
      );
      console.log("newDebtETH", formatEth(newDebtETH));

      expect(newDebtETH).lt(initialDebtETH);
    });
  });

  describe.skip("should let PositionMigrator transfers deposit", () => {
    const aDaiAddress = "0xdCf0aF9e59C002FA3AA091a46196b37530FD48a8";
    const depositAmount = parseEth("500");

    it("should approve contract for aDai transfer", async () => {
      const aDai = await ethers.getContractAt("IAToken", aDaiAddress);
      // approve contract for aDai transfer
      const approveTx = await aDai.approve(
        positionMigrator.address,
        depositAmount
      );
      await approveTx.wait();
      console.log("PositionMigrator allowance approved");

      const allowance = await aDai.allowance(
        signer1.address,
        positionMigrator.address
      );

      expect(allowance).to.be.at.least(depositAmount);
    });

    it("should transfer aDai", async () => {
      const aDai = await ethers.getContractAt("IAToken", aDaiAddress);

      const initialSigner1ADaiBalance = await aDai.balanceOf(signer1.address);
      const initialSigner2ADaiBalance = await aDai.balanceOf(signer2.address);
      console.log("initialSigner1ADaiBalance", initialSigner1ADaiBalance);
      console.log("initialSigner2ADaiBalance", initialSigner2ADaiBalance);
      // TODO: need to add checks before because migration will fail if not enough deposit
      // or health factor does not permit
      const aDaiTransferTx = await positionMigrator.migrateATokens(
        aDaiAddress,
        signer1.address,
        signer2.address,
        depositAmount
      );

      await aDaiTransferTx.wait();

      const newSigner1ADaiBalance = await aDai.balanceOf(signer1.address);
      const newSigner2ADaiBalance = await aDai.balanceOf(signer2.address);
      console.log("newSigner1ADaiBalance", newSigner1ADaiBalance);
      console.log("newSigner2ADaiBalance", newSigner2ADaiBalance);

      expect(newSigner1ADaiBalance).to.equal(
        initialSigner1ADaiBalance.sub(depositAmount)
      );
      expect(newSigner2ADaiBalance).to.equal(
        initialSigner2ADaiBalance.sub(depositAmount)
      );
    });
  });

  it.only("should approve credit delegation to SC", async () => {
    const daiAmountToBorrowWithDelegation = parseEth("100");

    // get Dai stable debt token address
    const kovanDaiAddresses = await getReserveTokensAddresses({
      dataProviderAddress: kovanDataProviderAddress,
      underlyingAssetAddress: kovanDaiAddress,
    });

    const daiStableDebt = await ethers.getContractAt(
      "contracts/aave/Interfaces.sol:IStableDebtToken",
      kovanDaiAddresses.stableDebtTokenAddress
    );

    // approve credit delegation of stable Dai to Position Migrator SC
    const approveDelegationTx = await daiStableDebt
      .connect(signer2)
      .approveDelegation(
        positionMigrator.address,
        daiAmountToBorrowWithDelegation
      );
    await approveDelegationTx.wait();
    console.log("Credit Delegation tx done!");

    // Check allowance
    const allowance = await daiStableDebt.borrowAllowance(
      signer2.address,
      positionMigrator.address
    );
    console.log(
      "stable Dai debt allowance from signer 2 to positionMigrator: ",
      allowance.toString()
    );

    expect(allowance).to.be.at.least(daiAmountToBorrowWithDelegation);
  });
});
