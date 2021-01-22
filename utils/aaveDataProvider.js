const { ethers } = require("hardhat");

const getReserveTokensAddresses = async ({
  dataProviderAddress,
  underlyingAssetAddress,
}) => {
  const protocolDataProvider = await ethers.getContractAt(
    "IProtocolDataProvider",
    dataProviderAddress
  );
  const tokenAddresses = await protocolDataProvider.getReserveTokensAddresses(
    underlyingAssetAddress
  );

  return tokenAddresses;
};

module.exports = {
  getReserveTokensAddresses,
};
