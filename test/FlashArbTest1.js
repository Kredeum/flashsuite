const { expect } = require("chai");
const { ethers } = require("hardhat");

// Mainnet instances:
const UniswapV2Router="0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const SushiswapV1Router="0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F";
const DAI="0x6B175474E89094C44Da98b954EedeAC495271d0F";
const ETH="0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
const AaveLendingPoolAddressesProvider="0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5";

describe("FlashArb", () => {
  let flashArb;
  // `beforeEach` will run before each test, re-deploying the contract every
  // time. It receives a callback, which can be async.
  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    FlashArb = await ethers.getContractFactory("FlashArb");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    console.log('owner.address', owner.address);

    // To deploy our contract, we just have to call Token.deploy() and await
    // for it to be deployed(), which happens onces its transaction has been
    // mined.
    flashArb = await FlashArb.deploy(AaveLendingPoolAddressesProvider, UniswapV2Router, SushiswapV1Router);
    await flashArb.deployed();
    console.log('contract deployed at', flashArb.address);
  });

  it("should complete an arbitrage", async () => {
    const asset = ETH;
    const flashAmount = ethers.utils.parseEther('100');
    let contractBalance = await flashArb.ethBalance();
    console.log('contract initial eth balance:', contractBalance);

    const tx = await flashArb.flashloan(asset, flashAmount, DAI, flashAmount);
    await tx.wait();
    
    contractBalance = await flashArb.ethBalance();
    console.log('contract eth balance:', contractBalance.toString());
  });

})
