import ethers from 'ethers';
import FlashPos from '../../lib/contracts/FlashPos.mjs';
import ERC20 from '../../lib/contracts/ERC20.mjs';
import IStableDebtToken from '../../lib/contracts/IStableDebtToken.mjs';


async function callFlashPos(_alice, _bob, _flashPos) {

  // ////////////////////////////////////////////////////////////////////////////////////////////////////////
  // // CONSTANTS
  // ////////////////////////////////////////////////////////////////////////////////////////////////////////
  const kovanLendingPool = "0x88757f2f99175387ab4c6a4b3067c77a695b0349";
  const collSNX = 20;
  const borrowDAI = 10;
  const flashDAI = 10;
  const feeDAI = 1;  // = flashDAI * 0.0009;
  const DAI = "0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD";
  const sDAI = "0x3B91257Fe5CA63b4114ac41A0d467D25E2F747F3";
  const aSNX = "0xAA74AdA92dE4AbC0371b75eeA7b1bd790a69C9e1";
  const aYFI = "0xF6c7282943Beac96f6C70252EF35501a6c1148Fe";

  const xp = "https://kovan.etherscan.io";
  console.log(`DAI       ${xp}/address/${DAI}`);
  console.log(`sDAI      ${xp}/address/${sDAI}`);
  console.log(`aSNX      ${xp}/address/${aSNX}`);
  // ////////////////////////////////////////////////////////////////////////////////////////////////////////

  try {
    // ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // // TX1 : Transfer FlashLoan Fees in advance
    // ////////////////////////////////////////////////////////////////////////////////////////////////////////
    console.log(`Sending ${feeDAI} DAI to contract to pay ${flashDAI} DAI flashloan 0,09% fees...`);
    const DAIcontrat = new ethers.Contract(DAI, ERC20.ABI, _alice);
    const tx1 = await DAIcontrat.transfer(_flashPos.address, ethers.utils.parseEther(feeDAI.toString()));
    console.log(`TX1 send  ${xp}/tx/${tx1.hash}`);
    await tx1.wait();
    console.log(`Sent!     ${xp}/address/${_flashPos.address}`);
    // ////////////////////////////////////////////////////////////////////////////////////////////////////////


    // ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // // TX2 : Get aSNX allowance
    // ////////////////////////////////////////////////////////////////////////////////////////////////////////
    const aSNXcontrat = new ethers.Contract(aSNX, ERC20.ABI, _alice);
    const tx2 = await aSNXcontrat.approve(_flashPos.address, ethers.utils.parseEther(collSNX.toString()));
    console.log(`TX2 Allow ${xp}/tx/${tx2.hash}`);
    // ////////////////////////////////////////////////////////////////////////////////////////////////////////


    // ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // // TX3 : Get Credit Delegation approval 
    // ////////////////////////////////////////////////////////////////////////////////////////////////////////
    const sDAIcontract = new ethers.Contract(sDAI, IStableDebtToken.ABI, _bob);
    const tx3 = await sDAIcontract.approveDelegation(_flashPos.address, ethers.utils.parseEther(borrowDAI.toString()));
    await tx3.wait();
    console.log(`TX3 CD    ${xp}/tx/${tx3.hash}`);

    // allowance verification
    const allowance = await sDAIcontract.borrowAllowance(_bob.address, _flashPos.address);
    console.log(`Allowance ${allowance.toString()}`);
    // ////////////////////////////////////////////////////////////////////////////////////////////////////////


    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // TX4 : Run Flash Loan
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    const collateralSNX = ethers.utils.parseEther('10');
    const collateralYFI = ethers.utils.parseEther('0.1');

    const aTokens = [aSNX, aYFI];
    const aTokenAmounts = [collateralSNX, collateralYFI];


    console.log(`Contract  ${xp}/address/${_flashPos.address}`);

    const tx4 = await _flashPos.migratePositions(_alice.address, _bob.address, aTokens, aTokenAmounts, [], [], []);

    console.log(`TX4 Flash ${xp}/tx/${tx4.hash}`);
    await tx4.wait();

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
  } catch (e) {
    console.error("ERROR", e);
  }
}

const provider = ethers.getDefaultProvider("kovan", {
  infura: process.env.INFURA_API_KEY,
});
// const provider = new ethers.providers.EtherscanProvider('kovan', process.env.ETHERSCAN_API_KEY);
// const provider = new ethers.providers.InfuraProvider('kovan', process.env.INFURA_API_KEY);
// const provider = new ethers.providers.AlchemyProvider('kovan', process.env.ALCHEMY_API_KEY);

const Alice = new ethers.Wallet(process.env.ACCOUNT_KEY_2, provider)
const Bob = new ethers.Wallet(process.env.ACCOUNT_KEY, provider)
console.log("Alice     https://kovan.etherscan.io/address/" + Alice.address);
console.log("Bob       https://kovan.etherscan.io/address/" + Bob.address);

const flashPos = new ethers.Contract(FlashPos.ADDRESS['kovan'], FlashPos.ABI, Bob);

callFlashPos(Alice, Bob, flashPos);
