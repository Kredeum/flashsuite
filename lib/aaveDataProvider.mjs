import pkg from "hardhat";
const {ethers} = pkg;

const getReserveTokensAddresses = async ({
  dataProviderAddress,
  underlyingAssetAddress,
}) => {
  const protocolDataProvider = await ethers.getContractAt(
    "contracts/aave/Interfaces.sol:IProtocolDataProvider",
    dataProviderAddress
  );
  const tokenAddresses = await protocolDataProvider.getReserveTokensAddresses(
    underlyingAssetAddress
  );

  return tokenAddresses;
};

export default getReserveTokensAddresses;
