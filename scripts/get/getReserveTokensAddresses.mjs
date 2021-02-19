import { ethers } from "ethers";
import { BigNumber } from "ethers";
import getReserveTokensAddresses from "../lib/aaveDataProvider.mjs";

const kovanProtocolDataProviderAddress =
  "0x3c73A5E5785cAC854D468F727c606C07488a29D6";

async function main() {
 
  const USDC = "0xe22da380ee6B445bb8273C81944ADEB6E8450422";
  // change the following to get for another token
  const underlyingAssetAddress = USDC;
  
 const addresses = await getReserveTokensAddresses({dataProviderAddress: kovanProtocolDataProviderAddress, underlyingAssetAddress })
  console.log("addresses:", addresses);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
