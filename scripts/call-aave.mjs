import hre from "hardhat";

async function main() {

  const aaveTestAddress = "0xD8b86a45a43c816C74e3b7891110615647CBA9c3";
  const aaveTest = await hre.ethers.getContractAt("AaveTest", aaveTestAddress);

  console.log("aaveTest.myFlashLoanCall()", await aaveTest.myFlashLoanCall());
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
