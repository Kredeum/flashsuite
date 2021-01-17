import hre from "hardhat";


async function main() {

  // Aave Deployed Contracts Addresses
  // https://docs.aave.com/developers/deployed-contracts
  const kovanLendingPoolAddressesProvider = "0x88757f2f99175387ab4c6a4b3067c77a695b0349";

  const AaveTest = await hre.ethers.getContractFactory("AaveTest");
  const aavetest = await AaveTest.deploy(kovanLendingPoolAddressesProvider);
  await aavetest.deployed();
  
  console.log("AaveTest deployed to:", aavetest.address);
  // AaveTest deployed to: 0xD32109Ff5a37D959BaFfd00d1Fe9AA90Dea062c8
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
