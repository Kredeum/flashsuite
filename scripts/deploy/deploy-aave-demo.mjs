import hre from "hardhat";

async function main() {

  // Aave Deployed Contracts Addresses
  // https://docs.aave.com/developers/deployed-contracts
  const kovanLendingPoolAddressesProvider = "0x88757f2f99175387ab4c6a4b3067c77a695b0349";

  const BatchFlashDemo = await hre.ethers.getContractFactory("BatchFlashDemo");
  const batchFlashDemo = await BatchFlashDemo.deploy(kovanLendingPoolAddressesProvider);
  await batchFlashDemo.deployed();

  console.log("BatchFlashDemo deployed to:", batchFlashDemo.address);
  // BatchFlashDemo deployed to: 0x8504856ECb90610e3FAb2c854736AF361b317E36
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
