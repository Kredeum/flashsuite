// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import hre from "hardhat";

const kovanProtocolDataProviderAddress =
  "0x3c73A5E5785cAC854D468F727c606C07488a29D6";

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  const protocolDataProvider = await hre.ethers.getContractAt(
    "IProtocolDataProvider",
    kovanProtocolDataProviderAddress
  );
  const aTokens = await protocolDataProvider.getAllATokens();
  console.log("aTokens", aTokens);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
