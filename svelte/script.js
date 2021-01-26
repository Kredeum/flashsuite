
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
    const xp = "https://kovan.etherscan.io";
    console.log(`DAI       ${xp}/address/${DAI}`);
    console.log(`sDAI      ${xp}/address/${sDAI}`);
    console.log(`aSNX      ${xp}/address/${aSNX}`);
    ////////////////////////////////////////////////////////////////////////////////////////////////////////



    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // TX1 : Transfer FlashLoan Fees in advance
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    console.log(`Sending ${feeDAI} DAI to contract to pay ${flashDAI} DAI flashloan 0,09% fees...`);
    const DAIcontrat = await ethers.getContractAt("contracts/aave/Interfaces.sol:IERC20", DAI, Alice);
    const tx1 = await DAIcontrat.transfer(flashAccounts.address, ethers.utils.parseEther(feeDAI.toString()));
    expect(tx1.hash).to.match(/^0x/);
    console.log(`TX1 send  ${xp}/tx/${tx1.hash}`);
    await tx1.wait();
    console.log(`Sent!     ${xp}/address/${flashAccounts.address}`);
    ////////////////////////////////////////////////////////////////////////////////////////////////////////


    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // TX2 : Get aSNX allowance
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    const aSNXcontrat = await ethers.getContractAt("contracts/aave/Interfaces.sol:IERC20", aSNX, Alice);
    const tx2 = await aSNXcontrat.approve(flashAccounts.address, ethers.utils.parseEther(collSNX.toString()));
    expect(tx2.hash).to.match(/^0x/);
    console.log(`TX2 Allow ${xp}/tx/${tx2.hash}`);
    ////////////////////////////////////////////////////////////////////////////////////////////////////////


    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // TX3 : Get Credit Delegation approval 
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    const sDAIcontract = await ethers.getContractAt("contracts/aave/Interfaces.sol:IStableDebtToken", sDAI);
    const tx3 = await sDAIcontract.connect(Bob).approveDelegation(flashAccounts.address, ethers.utils.parseEther(borrowDAI.toString()));
    await tx3.wait();
    console.log(`TX3 CD    ${xp}/tx/${tx3.hash}`);

    // allowance verification
    const allowance = await sDAIcontract.borrowAllowance(Bob.address, flashAccounts.address);
    console.log(`Allowance ${allowance.toString()}`);
    expect(allowance.toString() == borrowDAI.toString());
    ////////////////////////////////////////////////////////////////////////////////////////////////////////


    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // TX4 : Run Flash Loan
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    try {
      const tx4 = await flashAccounts.swap(Alice.address, Bob.address);
      expect(tx4.hash).to.match(/^0x/);
      console.log(`TX4 Flash ${xp}/tx/${tx4.hash}`);
      await tx4.wait();
    } catch (e) {
      console.error("ERROR", e);
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////


  });
});
