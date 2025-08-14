require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  networks: {
    hardhat: {
      chainId: 1337
    },
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    sepolia: {
      url: process.env.RPC_URL || "https://sepolia.infura.io/v3/2d090d90f5d449d484d7d1d03f99e817",
      chainId: 11155111,
      accounts: (process.env.BACKEND_PRIVATE_KEY
        ? [process.env.BACKEND_PRIVATE_KEY.startsWith('0x') ? process.env.BACKEND_PRIVATE_KEY : `0x${process.env.BACKEND_PRIVATE_KEY}`]
        : []),
      gas: 800000,
      gasPrice: 3000000000
    }
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test"
  }
};
