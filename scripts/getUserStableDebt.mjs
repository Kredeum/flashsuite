// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import hre from "hardhat";

const kovanDai = "0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD";
const stableDaiDebtTokenAddress = "0x3B91257Fe5CA63b4114ac41A0d467D25E2F747F3";
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
    "contracts/aave/Interfaces.sol:IProtocolDataProvider",
    kovanProtocolDataProviderAddress
  );
  const {
    stableDebtTokenAddress,
  } = await protocolDataProvider.getReserveTokensAddresses(kovanDai);
  // console.log("tokenAddresses", tokenAddresses);
  const stableDaiDebt = await hre.ethers.getContractAt(
    "IStableDebtToken",
    "0x447a1cc578470cc2ea4450e0b730fd7c69369ff3"
  );
  const balance = await stableDaiDebt.principalBalanceOf(
    "0xa902bEbD7b21686C6E18e856B2182327d0F39C93"
  );
  console.log("Dai stable debt", balance.toString());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
