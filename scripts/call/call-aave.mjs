import hre from "hardhat";

async function main() {

  const aaveTestAddress = "0x28e14e3546B5e37F7296c71f986abb0CB78BE0c2";
  const aaveTest = await hre.ethers.getContractAt("AaveTest1", aaveTestAddress);

  console.log("aaveTest.myFlashLoanCall()", await aaveTest.myFlashLoanCall("200000000000000000000"));
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
