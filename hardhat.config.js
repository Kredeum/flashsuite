require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: "kovan",
  networks: {
    hardhat: {
      accounts: [
        {
          privateKey: process.env.ACCOUNT_KEY,
          balance: "100000000000000000000",
        },
        {
          privateKey: process.env.ACCOUNT_KEY_2,
          balance: "100000000000000000000",
        },
      ],
    },
    kovan: {
      url: `https://kovan.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [process.env.ACCOUNT_KEY, process.env.ACCOUNT_KEY_2],
      gasMultiplier: 1.5,
      gasPrice: 4000000000,
      gas: 12390000,
    },
  },
  solidity: "0.6.12",
};
