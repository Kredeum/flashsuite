const { ethers } = require("hardhat");

const formatEth = (bigNumberAmount) =>
  ethers.utils.formatEther(bigNumberAmount);

const parseEth = (stringToParse) => ethers.utils.parseEther(stringToParse);

module.exports = {
  formatEth,
  parseEth,
};
