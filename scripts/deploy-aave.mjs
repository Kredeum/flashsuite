import hre from "hardhat";

async function main() {

  // Aave Deployed Contracts Addresses
  // https://docs.aave.com/developers/deployed-contracts
  const kovanLendingPoolAddressesProvider = "0x88757f2f99175387ab4c6a4b3067c77a695b0349";

  const AaveTest = await hre.ethers.getContractFactory("AaveTest");
  const aaveTest = await AaveTest.deploy(kovanLendingPoolAddressesProvider);
  await aaveTest.deployed();
  
  console.log("AaveTest deployed to:", aaveTest.address);
  // AaveTest deployed to: 0xD8b86a45a43c816C74e3b7891110615647CBA9c3

  
  console.log("aaveTest.myFlashLoanCall()", await aaveTest.myFlashLoanCall());


}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
