import hre from "hardhat";

async function main() {

  const aaveTestAddress = "0xAF470A93a00A6e498896BF3495589CeE2380934d";
  const aaveTest = await hre.ethers.getContractAt("AaveTest", aaveTestAddress);

  console.log("aaveTest.myFlashLoanCall()", await aaveTest.myFlashLoanCall("1000000000000000000000"));
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
