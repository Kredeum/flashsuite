const { ethers } = require("hardhat");

const formatEth = (bigNumberAmount) =>
  ethers.utils.formatEther(bigNumberAmount);

const parseEth = (bigNumberAmount) => ethers.utils.parseEther(bigNumberAmount);

module.exports = {
  formatEth,
  parseEth,
};
